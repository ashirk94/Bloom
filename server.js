const express = require('express')
const session = require('express-session')
const mongoose = require('mongoose')
const MongoStore = require('connect-mongo')

const app = express()

const dbString = 'mongodb://localhost:27017/testdb'
const dbOptions = {
    useNewUrlParser: true,
    useUnifiedTopology: true
}
const connection = mongoose.createConnection(dbString, dbOptions)

app.use(express.json())
app.use(express.urlencoded({extended: true}))

const sessionStore = MongoStore.create({
    mongoUrl: dbString,
    mongooseConnection: connection,
    collection: 'sessions'
})

app.use(session({
    secret: 'some secret',
    resave: false,
    saveUninitialized: true,
    store: sessionStore,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 //1 day
    }
}))

//app.use(errorTest)

function testWare(req, res, next) {
    req.test = 100
    next()
}
function errorTest(req, res, next) {
    let error = new Error
    next(error)
}

function errorHandler(err, req, res, next) {
    if (err) {
        res.json({error: err})
    }
}

app.get('/', testWare, (req, res, next) => {
    if (req.session.viewCount) {
        req.session.viewCount++
    } else {
        req.session.viewCount = 1
    }
    console.log(`Test Property: ${req.test}`)
    res.send(`<h1>You have visited this page ${req.session.viewCount} times</h1>`)
})

app.use(errorHandler)

app.listen(3000)