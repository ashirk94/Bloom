const LocalStrategy = require("passport-local").Strategy;
const { User } = require("./database");
const validPassword = require("../utilities/passwordUtils").validPassword;

//local auth strategy only
function passportConfig(passport) {
	const customFields = {
		usernameField: "uname",
		passwordField: "pw",
		passReqToCallback: true
	};

	const verifyCallback = (req, username, password, done) => {
		User.findOne({ username: username })
			.then((user) => {
				if (!user) {
					return done(null, false, {
						message: "No user found with that name"
					});
				}

				// Check if user has a password hash (local auth user)
				if (!user.hash) {
					return done(null, false, {
						message: "This account was created with GitHub. Please use the GitHub login button."
					});
				}

				validPassword(password, user.hash).then((isValid) => {
					if (isValid) {
						return done(null, user);
					} else {
						return done(null, false, {
							message: "Incorrect password"
						});
					}
				});
			})
			.catch((err) => {
				return done(err);
			});
	};	const localStrategy = new LocalStrategy(customFields, verifyCallback);

	passport.use(localStrategy);

	passport.serializeUser((user, done) => {
		done(null, user._id);
	});

	passport.deserializeUser((userId, done) => {
		User.findById(userId)
			.then((user) => {
				done(null, user);
			})
			.catch((err) => done(err));
	});
}

module.exports = passportConfig;
