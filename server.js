const express = require('express')
const session = require('express-session')
const connection = require('./config/database')
const MongoStore = require('connect-mongo')(session)
const passport = require('passport')
const flash = require('express-flash')

const cors = require('cors')

const User = connection.models.User

const path = require('path')
const expressLayouts = require('express-ejs-layouts')
require('dotenv').config()

//const io = require('./socket')
const homeRouter = require('./routes/index')

const app = express()

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(express.static('public'))
app.use(
	cors({
		origin: '*',
		withCredentials: true
	})
)
app.use(flash())

//ejs middleware
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')
app.set('layout', 'layout/layout')
app.use(expressLayouts)

function testWare(req, res, next) {
	req.test = 100
	next()
}
function errorTest(req, res, next) {
	let error = new Error()
	next(error)
}

function errorHandler(err, req, res, next) {
	if (err) {
		res.json({ error: err })
		console.error(err)
	}
}

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
			maxAge: 1000 * 60 * 60 * 24 //1 day
		}
	})
)

//---passport---

app.use(passport.initialize())
app.use(passport.session())

const passportConfig = require('./config/passport')
passportConfig(passport)

//middleware
app.use((req, res, next) => {
	console.log(req.session)
	console.log(req.user)
	next()
})

//routers
app.use('/', homeRouter)

//app.use(errorHandler)

app.listen(3000)
