const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy
const connection = require('./database')
const User = connection.models.User
const validPassword = require('../utilities/passwordUtils').validPassword

function passportConfig(passport) {
	const customFields = {
		usernameField: 'uname',
		passwordField: 'pw',
        passReqToCallback: true
	}

	const verifyCallback = (req, username, password, done) => {
		User.findOne({ username: username })
			.then((user) => {
				if (!user) {
					console.log('no user')
					return done(null, false, {
						message: 'No user found with that name'
					})
				}

				const isValid = validPassword(password, user.hash, user.salt)

				if (isValid) {
					return done(null, user)
				} else {
					return done(null, false, { message: 'Incorrect password' })
				}
			})
			.catch((err) => {
				return done(err)
			})
	}

	const strategy = new LocalStrategy(customFields, verifyCallback)

	passport.use(strategy)

	passport.serializeUser((user, done) => {
		done(null, user._id)
	})

	passport.deserializeUser((userId, done) => {
		User.findById(userId)
			.then((user) => {
				done(null, user)
			})
			.catch((err) => done(err))
	})
}

module.exports = passportConfig
