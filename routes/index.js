const mongoose = require('mongoose')
const router = require('express').Router()
const User = require('../config/database').User
const passport = require('passport')
const genPassword = require('../utilities/passwordUtils').genPassword

//get routes
// router.get('/', function (req, res) {
//     res.render('index')
// })

router.get('/', (req, res, next) => {
	res.send('<h1>Home</h1><p>Please <a href="/register">register</a></p>')
})

router.get('/login', (req, res, next) => {
	res.render('auth/login')
})

router.get('/register', (req, res, next) => {
	res.render('auth/register')
})

//post routes

router.post(
	'/login',
	passport.authenticate('local'),
	function (req, res, next) {}
)

router.post('/register', function (req, res, next) {
	const saltHash = genPassword(req.body.pw)

	const salt = saltHash.salt
	const hash = saltHash.hash

	const newUser = new User({
		username: req.body.uname,
		hash: hash,
		salt: salt
	})

	newUser.save().then((user) => {
		console.log(user)
	})
	res.redirect('/login')
})

module.exports = router
