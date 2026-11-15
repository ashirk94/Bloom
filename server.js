// Load .env before anything reads process.env
require("dotenv").config();

const fs = require("fs");
const http = require("http");
const path = require("path");
const express = require("express");
const session = require("express-session");
const { MongoStore } = require("connect-mongo");
const multer = require("multer");
const passport = require("passport");
const { Server } = require("socket.io");

const { connectDatabase } = require("./config/database");
const passportConfig = require("./config/passport");
const { HttpError } = require("./utilities/errors");
const { sendMessage, MessageError } = require("./utilities/messaging");
const { publicMessage } = require("./utilities/serialize");
const {
	securityHeaders,
	requireSameOrigin,
	isSameOrigin
} = require("./utilities/securityHeaders");
const { createRateLimiter } = require("./utilities/rateLimit");

const isProduction = process.env.NODE_ENV === "production";
const PORT = process.env.PORT || 3000;

if (!process.env.SESSION_SECRET) {
	throw new Error("SESSION_SECRET is missing. Add it to your .env file.");
}

const app = express();
const server = http.createServer(app);

// Hosts like Heroku put a proxy in front of the app. Trusting it lets
// Express know the original request was HTTPS, which secure cookies need.
if (isProduction) app.set("trust proxy", 1);

// ---------- sessions ----------

const sessionMiddleware = session({
	secret: process.env.SESSION_SECRET,
	resave: false,
	saveUninitialized: false,
	store: MongoStore.create({
		mongoUrl: process.env.DB_STRING,
		collectionName: "sessions"
	}),
	cookie: {
		maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
		httpOnly: true, // JavaScript in the page can't read the cookie
		sameSite: "lax", // other websites can't make logged in POSTs for you
		secure: isProduction // only sent over HTTPS when deployed
	}
});

app.use(securityHeaders);
app.use(express.json({ limit: "100kb" }));
// Express 5 leaves req.body undefined when a request has no JSON body, and
// routes that read req.body.something would then crash with a 500
app.use((req, res, next) => {
	if (req.body === undefined) req.body = {};
	next();
});
app.use("/api", requireSameOrigin);
app.use(sessionMiddleware);
app.use(passport.initialize());
app.use(passport.session());
passportConfig(passport);

// ---------- API ----------
// Everything the React app talks to lives under /api and answers with JSON.

app.use("/api", require("./routes/auth"));
app.use("/api", require("./routes/profile"));
app.use("/api", require("./routes/users"));
app.use("/api", require("./routes/messages"));
app.use("/api", require("./routes/admin"));

app.use("/api", (req, res, next) => {
	next(new HttpError(404, "Not found."));
});

// ---------- React app ----------
// `npm run build` puts the finished frontend in client/dist. In development
// that folder isn't used: Vite serves the frontend on its own port and
// forwards /api requests here (see client/vite.config.js).

const clientDist = path.join(__dirname, "client", "dist");
if (fs.existsSync(clientDist)) {
	app.use(express.static(clientDist));
	// React Router handles page URLs in the browser, so any address that
	// isn't a file or an API route gets index.html
	app.get("/{*splat}", (req, res) => {
		res.sendFile(path.join(clientDist, "index.html"));
	});
}

// ---------- errors ----------
// Express 5 sends errors thrown in async route handlers here automatically.

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
	if (err instanceof HttpError) {
		return res.status(err.status).json({ error: err.message });
	}
	if (err instanceof multer.MulterError) {
		const message =
			err.code === "LIMIT_FILE_SIZE"
				? "Images can be at most 5 MB."
				: "That upload didn't work.";
		return res.status(400).json({ error: message });
	}
	if (err.type === "entity.parse.failed" || err.type === "entity.too.large") {
		return res.status(400).json({ error: "Invalid request." });
	}
	// anything else is a bug: log the details, but don't show them to visitors
	console.error(err);
	res.status(500).json({ error: "Something went wrong." });
});

// ---------- live chat (socket.io) ----------

const io = new Server(server, {
	// Only accept connections from pages served by this same site.
	// Browsers send an Origin header that a web page cannot fake.
	allowRequest: (req, callback) => callback(null, isSameOrigin(req))
});

// routes use this to disconnect sockets on logout or account deletion
app.set("io", io);

// at most 20 chat messages per 10 seconds per user, so one account can't
// flood the database or another user's screen
const messageLimiter = createRateLimiter({ windowMs: 10 * 1000, max: 20 });

// run the session middleware for socket connections too, so we know who
// is connecting
io.engine.use(sessionMiddleware);

io.on("connection", (socket) => {
	// only logged in users can chat
	const sessionUser = socket.request.session?.passport?.user;
	if (!sessionUser) {
		socket.disconnect(true);
		return;
	}
	const userId = String(sessionUser);

	// each user gets a room named after their id, so every tab they have
	// open receives their messages
	socket.join(userId);
	// ...and a room for this login session, so logging out can close the
	// sockets that belong to it (they'd otherwise stay logged in)
	socket.join(`session:${socket.request.session.id}`);

	// `reply` is a socket.io acknowledgement: a function the client passed
	// that we call to tell it whether the message went through
	socket.on("send-message", async (payload, reply) => {
		const respond = typeof reply === "function" ? reply : () => {};
		const { to, text } = payload || {};
		if (!messageLimiter.hit(userId)) {
			return respond({ ok: false, error: "You're sending messages too fast." });
		}
		try {
			// the sender is always the logged in user, never taken from the client
			const message = await sendMessage({
				senderId: userId,
				recipientId: to,
				text
			});
			io.to(String(message.recipient)).to(userId).emit("message", publicMessage(message));
			respond({ ok: true });
		} catch (err) {
			if (!(err instanceof MessageError)) console.error(err);
			respond({
				ok: false,
				error:
					err instanceof MessageError
						? err.message
						: "Message could not be sent."
			});
		}
	});
});

// ---------- start ----------

async function start() {
	await connectDatabase();
	server.listen(PORT, () => {
		console.log(`Bloom server listening on http://localhost:${PORT}`);
	});
}

start().catch((err) => {
	console.error("Could not start the server:", err.message);
	process.exit(1);
});
