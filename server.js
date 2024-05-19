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
const { formatMessage, storeMessage } = require("./utilities/messaging");

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
		origin: "http://localhost:3000, https://bloom-friend-finder.herokuapp.com",
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

io.on("connection", async (socket) => {
	const userId = socket.request.session.passport.user;
	const user = await User.findById(userId);
	user.socketId = socket.id;
	await user.save();

	socket.on(
		"send-message",
		async ({ message, to, sender, friendId, timeZone }) => {
			//join their room on message
			socket.join(to);

			//format and store message in db
			const formattedMessage = formatMessage(sender, message, timeZone);
			await storeMessage(formattedMessage, userId, friendId);

			io.to(to)
				.to(socket.id)
				.emit("receive-message", { message: formattedMessage });
		}
	);
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

app.use(
	cors({
		origin: [
			"http://localhost:3000",
			"https://bloom-friend-finder.herokuapp.com"
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

// function errorTest(req, res, next) {
//   let error = new Error("Custom error");
//   next(error);
// }

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
