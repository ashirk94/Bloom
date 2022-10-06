const router = require('express').Router()
const connection = require('../config/database')
const User = connection.models.User
const passport = require('passport')
const genPassword = require('../utilities/passwordUtils').genPassword
const fs = require('fs')
const path = require('path')

//get routes
router.get('/login', (req, res) => {
	const message = req.flash()
	res.render('auth/login', { user: req.user, message: message })
})

router.get('/register', (req, res) => {
	const message = req.flash()
	res.render('auth/register', { user: req.user, message: message })
})

router.get('/logout', (req, res, next) => {
	req.logout(function (err) {
		if (err) {
			return next(err)
		}
	})
	res.redirect('/')
})
//post routes

router.post(
	'/login',
	passport.authenticate('local', {
		failureRedirect: '/login',
		successRedirect: '/meet',
		failureFlash: true
	}),
	(req, res) => {}
)

router.post('/register', async (req, res) => {
    //to delete users in dev:
	//connection.collection('users').deleteMany({})
	try {
        //test for duplicate user
		const testUser = await User.find({ username: req.body.uname })
		if (testUser[0] && testUser[0].username === req.body.uname) {
			throw new Error('Duplicate username')
		}
		const hashedPassword = await genPassword(req.body.pw)

		const newUser = new User({
			username: req.body.uname,
			hash: hashedPassword,
			admin: false,
			profilePic: {
				data: fs.readFileSync(
					path.join(__dirname + '/../public/images/anon.jpg')
				),
				contentType: 'image/jpg'
			}
		})

		await newUser.save()
        //immediate login
		req.login(newUser, (err) => {
			if (err) {
				req.flash('error', err.message)
				res.redirect('/register')
			}
			return res.redirect('/')
		})
	} catch (err) {
		req.flash('error', err.message)
		res.redirect('/register')
	}
})

module.exports = router
