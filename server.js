const express = require('express')
const session = require('express-session')
const connection = require('./config/database')
const MongoStore = require('connect-mongo')(session)
const passport = require('passport')
const flash = require('connect-flash')
const passportConfig = require('./config/passport')
const path = require('path')
const expressLayouts = require('express-ejs-layouts')
require('dotenv').config()

const homeRoutes = require('./routes/index')
const authRoutes = require('./routes/auth')
const friendRoutes = require('./routes/friends')
const userRoutes = require('./routes/users')
const likeRoutes = require('./routes/likes')

const app = express()

const botName = "Alan's Bot";

//socket.io
const server = require('http').createServer(app)
const io = require('socket.io')(server)
const {
	formatMessage,
	getCurrentUser,
	userJoin,
    getRoomUsers,
    userLeave
} = require('./utilities/messaging')

io.on('connection', (socket) => {
    const id = socket.handshake.query.id
    socket.join(id)
	
	socket.on('join-room', (username, room) => {
		const user = userJoin(socket.id, username, room)
		socket.join(user.room)

		// Broadcast when a user connects
		socket.broadcast
			.to(user.room)
			.emit(
				'recieve-message',
				formatMessage('Bot', `${user.username} has joined the chat`)
			)

		// Send users and room info
		io.to(user.room).emit('roomUsers', {
			room: user.room,
			users: getRoomUsers(user.room)
		})
	})
    socket.on('send-message', (message) => {
        //stop nulls
		const username = getCurrentUser(socket.id).username
        const room = getCurrentUser(socket.id).username.room
        const user = getCurrentUser(socket.id)
        const send = formatMessage(user, message)

		io.emit('receive-message', {user: username, message: send})
	})
    // Runs when client disconnects
  socket.on("disconnect", () => {
    const user = userLeave(socket.id);

    if (user) {
      io.to(user.room).emit(
        "receive-message",
        formatMessage(botName, `${user.username} has left the chat`)
      );
      // Send users and room info
      io.to(user.room).emit("roomUsers", {
        room: user.room,
        users: getRoomUsers(user.room),
      });
    }
});
})

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(express.static('public'))

app.use(flash())

//ejs middleware
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')
app.set('layout', 'layout/layout')
app.use(expressLayouts)

function errorTest(req, res, next) {
	let error = new Error('Custom error')
	next(error)
}

function errorHandler(err, req, res, next) {
	console.error(err.stack)
	res.render('error', { error: err })
}

//passport local strategy
const sessionStore = new MongoStore({
	mongooseConnection: connection,
	collection: 'sessions'
})

app.use(
	session({
		secret: process.env.SESSION_SECRET,
		resave: false,
		saveUninitialized: false,
		store: sessionStore,
		cookie: {
			maxAge: 1000 * 60 * 60 * 24 * 7 //1 week
		}
	})
)

app.use(passport.initialize())
app.use(passport.session())

passportConfig(passport)

//middleware to log session and user data
// app.use((req, res, next) => {
// 	console.log(req.session)
// 	console.log(req.user)
// 	next()
// })
//error test
// app.use(errorTest)

//routers
app.use(homeRoutes)
app.use(authRoutes)
app.use(friendRoutes)
app.use(userRoutes)
app.use(likeRoutes)

//error handler
app.use(errorHandler)

//port
server.listen(3000)
