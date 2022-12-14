const express = require('express')
const session = require('express-session')
const connection = require('./config/database')
const MongoStore = require('connect-mongo')(session)
const passport = require('passport')
const flash = require('connect-flash')
const passportConfig = require('./config/passport')
const path = require('path')
const expressLayouts = require('express-ejs-layouts')
if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
}

const homeRoutes = require('./routes/index')
const authRoutes = require('./routes/auth')
const friendRoutes = require('./routes/friends')
const userRoutes = require('./routes/users')

const User = connection.models.User

const app = express()

//socket.io
const server = require('http').createServer(app)
const io = require('socket.io')(server, {
    cors: {
      origin: "http://bloom-friend-finder.herokuapp.com",
      methods: ["GET", "POST"]
    }
  })
const {
	formatMessage,
    storeMessage
} = require('./utilities/messaging')

//mongoDB session storage
const sessionStore = new MongoStore({
	mongooseConnection: connection,
	collection: 'sessions'
})

const sessionMiddleware = session({
	secret: process.env.SESSION_SECRET,
	resave: false,
	saveUninitialized: false,
	store: sessionStore,
	cookie: {
		maxAge: 1000 * 60 * 60 * 24 * 7 //1 week
	}
})

io.use((socket, next) => {
    sessionMiddleware(socket.request, socket.request.res || {}, next)
})

io.on('connection', async (socket) => {
    const userId = socket.request.session.passport.user
    const user = await User.findById(userId)
    user.socketId = socket.id
    await user.save()

	socket.on('send-message', async ({message, to, sender, friendId}) => {
        //join their room on message - may change later
        socket.join(to)
		
        //format and store message in db
		const send = formatMessage(sender, message)
        await storeMessage(send, userId, friendId)

		io.to(to).to(socket.id).emit('receive-message', { message: send })
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

app.use(sessionMiddleware)

app.use(passport.initialize())
app.use(passport.session())

passportConfig(passport)

//routers
app.use(homeRoutes)
app.use(authRoutes)
app.use(friendRoutes)
app.use(userRoutes)

//error handler
app.use(errorHandler)

//port
server.listen(process.env.PORT || 3000)
