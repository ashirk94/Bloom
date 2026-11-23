// Load .env before anything reads process.env
import "dotenv/config";

import fs from "fs";
import http from "http";
import path from "path";
import express, { type ErrorRequestHandler } from "express";
import session from "express-session";
import { MongoStore } from "connect-mongo";
import multer from "multer";
import passport from "passport";
import { Server } from "socket.io";

import { connectDatabase } from "./config/database.ts";
import passportConfig from "./config/passport.ts";
import { HttpError } from "./utilities/errors.ts";
import { sendMessage, MessageError } from "./utilities/messaging.ts";
import { publicMessage } from "./utilities/serialize.ts";
import {
	securityHeaders,
	requireSameOrigin,
	isSameOrigin
} from "./utilities/securityHeaders.ts";
import { createRateLimiter } from "./utilities/rateLimit.ts";
import authRoutes from "./routes/auth.ts";
import profileRoutes from "./routes/profile.ts";
import userRoutes from "./routes/users.ts";
import messageRoutes from "./routes/messages.ts";
import adminRoutes from "./routes/admin.ts";
import type {
	ClientToServerEvents,
	SendMessageResult,
	ServerToClientEvents
} from "./shared/types.ts";

// The socket.io server, typed with the events in shared/types.ts.
// Routes import this type to disconnect sockets on logout.
export type ChatServer = Server<ClientToServerEvents, ServerToClientEvents>;

const isProduction = process.env.NODE_ENV === "production";
const PORT = process.env.PORT || 3000;

const SESSION_SECRET = process.env.SESSION_SECRET;
if (!SESSION_SECRET) {
	throw new Error("SESSION_SECRET is missing. Add it to your .env file.");
}

const app = express();
const server = http.createServer(app);

// Hosts like Heroku put a proxy in front of the app. Trusting it lets
// Express know the original request was HTTPS, which secure cookies need.
if (isProduction) app.set("trust proxy", 1);

// ---------- sessions ----------

const sessionMiddleware = session({
	secret: SESSION_SECRET,
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

app.use("/api", authRoutes);
app.use("/api", profileRoutes);
app.use("/api", userRoutes);
app.use("/api", messageRoutes);
app.use("/api", adminRoutes);

app.use("/api", (req, res, next) => {
	next(new HttpError(404, "Not found."));
});

// ---------- React app ----------
// `npm run build` puts the finished frontend in client/dist. In development
// that folder isn't used: Vite serves the frontend on its own port and
// forwards /api requests here (see client/vite.config.ts).
// import.meta.dirname is the folder this file is in (the project folder);
// it is the ES module version of CommonJS's __dirname.

const clientDist = path.join(import.meta.dirname, "client", "dist");
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

// Anything can be thrown in JavaScript, not only Error objects, so `err`
// is typed as unknown and narrowed with instanceof before use
const errorHandler: ErrorRequestHandler = (err: unknown, req, res, next) => {
	if (err instanceof HttpError) {
		res.status(err.status).json({ error: err.message });
		return;
	}
	if (err instanceof multer.MulterError) {
		const message =
			err.code === "LIMIT_FILE_SIZE"
				? "Images can be at most 5 MB."
				: "That upload didn't work.";
		res.status(400).json({ error: message });
		return;
	}
	// errors from express.json() carry a `type` describing what went wrong
	const type = (err as { type?: unknown } | null)?.type;
	if (type === "entity.parse.failed" || type === "entity.too.large") {
		res.status(400).json({ error: "Invalid request." });
		return;
	}
	// anything else is a bug: log the details, but don't show them to visitors
	console.error(err);
	res.status(500).json({ error: "Something went wrong." });
};
app.use(errorHandler);

// ---------- live chat (socket.io) ----------

const io: ChatServer = new Server(server, {
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
	// that we call to tell it whether the message went through.
	// shared/types.ts says what a well-behaved browser sends, but anyone can
	// send anything, so both arguments are treated as unknown and checked.
	socket.on("send-message", async (payload: unknown, reply: unknown) => {
		const respond =
			typeof reply === "function"
				? (reply as (result: SendMessageResult) => void)
				: () => {};
		const { to, text } = (payload || {}) as { to?: unknown; text?: unknown };
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

async function start(): Promise<void> {
	await connectDatabase();
	server.listen(PORT, () => {
		console.log(`Bloom server listening on http://localhost:${PORT}`);
	});
}

start().catch((err: Error) => {
	console.error("Could not start the server:", err.message);
	process.exit(1);
});
