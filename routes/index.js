const mongoose = require('mongoose')
const router = require('express').Router()
const connection = require('../config/database')
const User = connection.models.User
const passport = require('passport')
const genPassword = require('../utilities/passwordUtils').genPassword
const bcrypt = require('bcrypt')

//get routes
// router.get('/', function (req, res) {
//     res.render('index')
// })

router.get('/', (req, res) => {
	res.send('<h1>Home</h1><p>Please <a href="/register">register</a></p>')
})

router.get('/login', (req, res) => {
	res.render('auth/login', {user: req.user})
})

router.get('/register', (req, res) => {
	res.render('auth/register')
})

router.get('/login-success', (req, res) => {
	res.send(
		'<p>You successfully logged in. --> <a href="/protected-route">Go to protected route</a></p>'
	)
})

router.get('/login-failure', (req, res) => {
	res.send('You entered the wrong password.')
})

//post routes

router.post(
	'/login',
	passport.authenticate('local', {
		failureRedirect: '/login-failure',
		successRedirect: '/login-success'
	}),
	(req, res) => {}
)

router.post('/register', async (req, res) => {
	const hashedPassword = genPassword(req.body.pw)

	const newUser = new User({
		username: req.body.uname,
		hash: hashedPassword
	})
    try {
        newUser.save().then(() => {
            console.log('user saved')
        })
        req.login(newUser, (err, user) => {
            if (err) {
                console.log(err)
            }
            console.log(user)
        })
        
        res.redirect('/login')
    } catch(err) {
        console.log(err)
        res.redirect('/register')
    }
})

module.exports = router
