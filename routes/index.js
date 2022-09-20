const router = require('express').Router()
const connection = require('../config/database')
const User = connection.models.User
const passport = require('passport')
const genPassword = require('../utilities/passwordUtils').genPassword
const isAuth = require('../utilities/authMiddleware').isAuth

//get routes
router.get('/chat', isAuth, function (req, res) {
    res.render('chat')
})

router.get('/', (req, res) => {
	res.render('index')
})

router.get('/login', (req, res) => {
	res.render('auth/login', {user: req.user})
})

router.get('/register', (req, res) => {
	res.render('auth/register')
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
		failureRedirect: '/login',
		successRedirect: '/'
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
