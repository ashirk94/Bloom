const LocalStrategy = require("passport-local").Strategy;
const GitHubStrategy = require("passport-github2").Strategy;
//const GoogleStrategy = require("passport-google-oauth20").Strategy;
const connection = require("./database");
const User = connection.models.User;
const validPassword = require("../utilities/passwordUtils").validPassword;
const axios = require("axios");

async function downloadProfilePicture(profilePictureUrl) {
  try {
    const response = await axios.get(profilePictureUrl, {
      responseType: "arraybuffer",
    });

    const imageBuffer = Buffer.from(response.data);
    const contentType = response.headers["content-type"];

    return {
      data: imageBuffer,
      contentType: contentType,
    };
  } catch (error) {
    console.error("Error downloading profile picture:", error);
    throw error;
  }
}

//both local and github auth strategies
function passportConfig(passport) {
  const customFields = {
    usernameField: "uname",
    passwordField: "pw",
    passReqToCallback: true,
  };

  const verifyCallback = (req, username, password, done) => {
    User.findOne({ username: username })
      .then((user) => {
        if (!user) {
          return done(null, false, {
            message: "No user found with that name",
          });
        }

        validPassword(password, user.hash).then((isValid) => {
          if (isValid) {
            return done(null, user);
          } else {
            return done(null, false, {
              message: "Incorrect password",
            });
          }
        });
      })
      .catch((err) => {
        return done(err);
      });
  };

  const localStrategy = new LocalStrategy(customFields, verifyCallback);

  passport.use(localStrategy);

  const githubStrategyConfig = {
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: "https://bloom-friend-finder.herokuapp.com/auth/github/callback",
    scope: ['user:email']
  };

  passport.use(
    new GitHubStrategy(
      githubStrategyConfig,
      async (accessToken, refreshToken, profile, done) => {
        const profilePictureUrl = profile.photos[0].value;
        let userProfilePic;
        let existingUser;

        try {
          existingUser = await User.findOne({
            username: profile.emails[0].value,
          });
        } catch (error) {
          return done(error);
        }

        if (existingUser) {
          existingUser.githubId = profile.id;
          existingUser.save((err) => {
            if (err) {
              return done(err);
            }
          });

          return done(null, existingUser);
        }

        try {
          userProfilePic = await downloadProfilePicture(profilePictureUrl);
        } catch (err) {
          console.error(err);
        }

        // Creates a new user with Github profile information
        const newUser = new User({
          githubId: profile.id,
          username: profile.emails[0].value,
          profilePic: userProfilePic,
        });

        newUser.save((err) => {
          if (err) {
            return done(err);
          }

          // User created successfully, log them in
          return done(null, newUser);
        });
      },
    ),
  );

//   const googleStrategyConfig = {
//     clientID: process.env.GOOGLE_CLIENT_ID,
//     clientSecret: process.env.GOOGLE_CLIENT_SECRET,
//     callbackURL: "/auth/google/callback",
//     authorizationURL: "https://accounts.google.com/o/oauth2/auth",
//   };

//   passport.use(
//     new GoogleStrategy(
//       googleStrategyConfig,
//       async (accessToken, refreshToken, profile, done) => {
//         const profilePictureUrl = profile.photos[0].value;
//         let userProfilePic;
//         let existingUser;

//         try {
//           existingUser = await User.findOne({
//             username: profile.emails[0].value,
//           });
//         } catch (error) {
//           return done(error);
//         }

//         if (existingUser) {
//           existingUser.googleId = profile.id;
//           existingUser.save((err) => {
//             if (err) {
//               return done(err);
//             }
//           });

//           return done(null, existingUser);
//         }

//         try {
//           userProfilePic = await downloadProfilePicture(profilePictureUrl);
//         } catch (err) {
//           console.error(err);
//         }

//         // Creates a new user with Google profile information
//         const newUser = new User({
//           googleId: profile.id,
//           username: profile.emails[0].value,
//           profilePic: userProfilePic,
//         });

//         newUser.save((err) => {
//           if (err) {
//             return done(err);
//           }

//           // User created successfully, log them in
//           return done(null, newUser);
//         });
//       },
//     ),
//   );

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
