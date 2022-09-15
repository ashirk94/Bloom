const express = require('express')
const session = require('express-session')
const mongoose = require('mongoose')
const MongoStore = require('connect-mongo')
var passport = require('passport')
var crypto = require('crypto')
var routes = require('./routes')
var path = require('path')
const expressLayouts = require('express-ejs-layouts')

const io = require('./socket')
const homeRouter = require('./routes/index')

const app = express()

app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.use(express.static('public'))
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
    let error = new Error
    next(error)
}

function errorHandler(err, req, res, next) {
    if (err) {
        res.json({error: err})
        console.error(err)
    }
}
//routers

app.use('/', homeRouter)

//app.use(errorHandler)

app.listen(3000)