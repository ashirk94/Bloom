const passport = require('passport');
const localStrategy = require('passport-local').Strategy
const User = require('./database').User

//used freecodecamp tutorial to implement passport local strategy

const validPassword = require('../utilities/passwordUtils').validPassword

const customFields = {
    usernameField: 'uname',
    passwordField: 'pw'
}

const verifyCallback = (username, password, done) => {
    User.findOne({username: username}).then((user) => {
        if(!user) { return done(null, false) }

        const isValid = validPassword(password, user.hash, user.salt)

        if (isValid) {
            return done(null, user)
        } else {
            return done(null, false)
        }
    }).catch((err) => {
        done(err)
    })
}

const strategy = new localStrategy(customFields, verifyCallback)

passport.use(strategy)

passport.serializeUser((user, done) => {
    done(null, user.id)
})