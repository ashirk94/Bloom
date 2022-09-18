const router = require('express').Router()
const connection = require('../config/database')
const User = connection.models.User
const passport = require('passport')
const genPassword = require('../utilities/passwordUtils').genPassword
const isAuth = require('./authMiddleware').isAuth

//get routes
router.get('/chat', function (req, res) {
    res.render('chat')
})

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

router.get('/protected-route', isAuth, (req, res) => {
    res.send('You are authorized!')
})

router.get('/logout', (req, res, next) => {
    req.logout((function(err) {
        if (err) { return next(err) }
      }))
    res.redirect('/login')
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
	const hashedPassword = await genPassword(req.body.pw)

	const newUser = new User({
		username: req.body.uname,
		hash: hashedPassword.hash,
        salt: hashedPassword.salt
	})
    try {
        newUser.save().then(() => {
            res.redirect('/login')
        })  
    } catch(err) {
        console.error(err)
        res.redirect('/register')
    }
})

module.exports = router
