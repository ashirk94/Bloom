const express = require('express')
const session = require('express-session')
const connection = require('./config/database')
const MongoStore = require('connect-mongo')(session)
const passport = require('passport')
const flash = require('express-flash')
const passportConfig = require('./config/passport')
const path = require('path')
const expressLayouts = require('express-ejs-layouts')
require('dotenv').config()

const homeRoutes = require('./routes/index')
const authRoutes = require('./routes/auth')

const app = express()

//socket.io
const server = require('http').createServer(app)
const io = require('socket.io')(server)

io.on('connection', socket => {
    socket.on('send-message', (message, room) => {
        if (room === '') {
            socket.broadcast.emit('receive-message', message)
        } else {
            socket.to(room).emit('receive-message', message)
        }    
    })
    socket.on('join-room', (room, cb) => {
        socket.join(room)
        cb(`Joined ${room}`)
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
	res.render('error', { error: err})
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

//error handler
app.use(errorHandler)

//port
server.listen(3000)
