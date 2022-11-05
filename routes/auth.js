const router = require('express').Router()
const connection = require('../config/database')
const User = connection.models.User
const passport = require('passport')
const genPassword = require('../utilities/passwordUtils').genPassword
const fs = require('fs')
const path = require('path')

//get routes

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
	'/',
	passport.authenticate('local', {
		failureRedirect: '/',
		successRedirect: '/meet',
		failureFlash: true
	})
)

router.post('/register', async (req, res) => {
	try {
        //check password
        let regex = /^[A-Za-z]\w{7,14}$/

        if (!req.body.pw.match(regex)) {
            throw new Error('Invalid password')
        }

        //test for duplicate user
		const testUser = await User.find({ username: req.body.uname })
		if (testUser[0] && testUser[0].username === req.body.uname) {
			throw new Error('Duplicate username')
		}
		const hashedPassword = await genPassword(req.body.pw)

        //location
        let lat = null
        let lon = null
        if (req.body.lat != '' && req.body.lon != '') {
            lat = Number(req.body.lat)
            lon = Number(req.body.lon)
        }

		const newUser = new User({
			username: req.body.uname,
			hash: hashedPassword,
			admin: false,
			profilePic: {
				data: fs.readFileSync(
					path.join(__dirname + '/../public/images/anon.jpg')
				),
				contentType: 'image/jpg'
			},
            location: {
                lat: lat,
                lon: lon
            }
		})

		await newUser.save()
        //immediate login
		req.login(newUser, (err) => {
			if (err) {
				req.flash('error', err.message)
				res.redirect('/register')
			}
			return res.redirect('/profile')
		})
	} catch (err) {
		req.flash('error', err.message)
		res.redirect('/register')
	}
})

module.exports = router
