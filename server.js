const express = require("express");
const session = require("express-session");
const { User } = require("./config/database");
const mongoose = require("mongoose");
const MongoStore = require("connect-mongo")(session);
const passport = require("passport");
const flash = require("connect-flash");
const passportConfig = require("./config/passport");
const path = require("path");
const expressLayouts = require("express-ejs-layouts");
const cors = require("cors");
const { sendMessage, MessageError } = require("./utilities/messaging");

const homeRoutes = require("./routes/index");
const authRoutes = require("./routes/auth");
const friendRoutes = require("./routes/friends");
const userRoutes = require("./routes/users");
const infoRoutes = require("./routes/info");

if (process.env.NODE_ENV !== "production") {
	require("dotenv").config();
}

const app = express();

//socket.io
const server = require("http").createServer(app);
const io = require("socket.io")(server, {
	cors: {
		origin: "http://localhost:3000",
		methods: ["GET", "POST"],
		credentials: true
	},
	allowRequest: (req, callback) => {
		const noOriginHeader = req.headers.origin === undefined;
		callback(null, noOriginHeader);
	}
});

//mongoDB session storage
const sessionStore = new MongoStore({
	mongooseConnection: mongoose.connection,
	collection: "sessions"
});

const sessionMiddleware = session({
	secret: process.env.SESSION_SECRET,
	resave: false,
	saveUninitialized: false,
	store: sessionStore,
	cookie: {
		maxAge: 1000 * 60 * 60 * 24 * 7 //1 week
	}
});

io.use((socket, next) => {
	sessionMiddleware(socket.request, socket.request.res || {}, next);
});

io.on("connection", (socket) => {
	//only logged in users can chat
	const sessionUser = socket.request.session?.passport?.user;
	if (!sessionUser) {
		socket.disconnect(true);
		return;
	}
	const userId = String(sessionUser);

	//each user gets a room named after their id, so every open tab receives messages
	socket.join(userId);

	socket.on("send-message", async (payload) => {
		const { message, friendId, timeZone } = payload || {};
		try {
			//sender is always the logged in user, never taken from the client
			const formattedMessage = await sendMessage({
				senderId: userId,
				recipientId: friendId,
				text: message,
				timeZone
			});

			io.to(String(friendId))
				.to(userId)
				.emit("receive-message", {
					message: formattedMessage,
					from: userId,
					to: String(friendId)
				});
		} catch (err) {
			if (!(err instanceof MessageError)) console.error(err);
			socket.emit("message-rejected", {
				reason:
					err instanceof MessageError
						? err.message
						: "Message could not be sent."
			});
		}
	});
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

app.use(
	cors({
		origin: [
			"http://localhost:3000",
		],
		credentials: true
	})
);

app.use(flash());

//ejs middleware
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.set("layout", "layout/layout");
app.use(expressLayouts);

function errorHandler(err, req, res, next) {
	console.error(err.stack);
	res.render("error", { error: err });
}

app.use(sessionMiddleware);

app.use(passport.initialize());
app.use(passport.session());

passportConfig(passport);

//routers
app.use(homeRoutes);
app.use(authRoutes);
app.use(friendRoutes);
app.use(userRoutes);
app.use(infoRoutes);

//error handler
app.use(errorHandler);

//port
server.listen(process.env.PORT || 3000);
