const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy
const GoogleStrategy = require('passport-google-oauth20').Strategy
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
					return done(null, false, {
						message: 'No user found with that name'
					})
				}

				validPassword(password, user.hash).then((isValid) => {
                    if (isValid) {
                        return done(null, user)
                    } else {
                        return done(null, false, { message: 'Incorrect password' })
                    }
                })

			})
			.catch((err) => {
				return done(err)
			})
	}

	const localStrategy = new LocalStrategy(customFields, verifyCallback)

	passport.use(localStrategy)

    //     passport.use(
    //     new GoogleStrategy(
    //         {
    //             clientID: process.env.GOOGLE_CLIENT_ID,
    //             clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    //             callbackURL: '/auth/google/callback', // Define this route in your routes
    //         },
    //         (accessToken, refreshToken, profile, done) => {
    //             // You can handle user creation or login here based on the Google profile
    //             // Typically, you would find or create a user with the Google profile information
    //             // and call the done() callback with the user.
    //             // For example:
    //             // User.findOrCreate({ googleId: profile.id }, (err, user) => {
    //             //     return done(err, user);
    //             // });
    //         }
    //     )
    // );

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
