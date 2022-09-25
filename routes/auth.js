const router = require('express').Router()
const connection = require('../config/database')
const User = connection.models.User
const passport = require('passport')
const genPassword = require('../utilities/passwordUtils').genPassword

//get routes
router.get('/login', (req, res) => {
	res.render('auth/login', {user: req.user})
})

router.get('/register', (req, res) => {
	res.render('auth/register', {user: req.user})
})

router.get('/logout', (req, res, next) => {
    req.logout((function(err) {
        if (err) { return next(err) }
      }))
    res.redirect('/')
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
        salt: hashedPassword.salt,
        admin: false,
        profilePic: 'anon.jpg'
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