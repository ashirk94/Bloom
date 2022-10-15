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

//socket.io
const server = require('http').createServer(app)
const io = require('socket.io')(server)
const {
	formatMessage,
	getCurrentUser,
	userJoin
} = require('./utilities/messaging')

io.on('connection', (socket) => {
	// notify existing users
    socket.broadcast.emit("user connected", {
        userID: socket.id,
        username: socket.username,
      });

	socket.on('join-room', (username, room) => {
		const user = userJoin(socket.id, username, room)
		socket.join(user.room)
	})
	socket.on('send-message', (message) => {
		const user = getCurrentUser(socket.id)
        //if user is disconnected cancel execution
        if (!user) return

		const username = user.username
		const room = user.room

		const send = formatMessage(user, message)

		io.to(room).emit('receive-message', { user: username, message: send })
	})
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

//passport session storage
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