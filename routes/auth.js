const router = require("express").Router();
const { User } = require("../config/database");
const passport = require("passport");
const genPassword = require("../utilities/passwordUtils").genPassword;
const fs = require("fs");
const path = require("path");
const verify = require("../utilities/emailVerification").verify;

//get routes

// router.get(
//   "/auth/google",
//   passport.authenticate("google", {
//     scope: ["profile", "email"],
//   }),
// );

// router.get(
//   "/auth/google/callback",
//   passport.authenticate("google", { failureRedirect: "/login" }),
//   (req, res) => {
//     res.redirect("/");
//   },
// );

router.get(
	"/auth/github",
	passport.authenticate("github", {
		scope: ["user:email"]
	})
);

router.get(
	"/auth/github/callback",
	passport.authenticate("github", {
		successRedirect: "/",
		failureRedirect: "/login"
	})
);

router.get("/login", (req, res) => {
	const message = req.flash();
	res.render("auth/login", { user: req.user, message: message });
});

router.get("/register", (req, res) => {
	const message = req.flash();
	res.render("auth/register", { user: req.user, message: message });
});

router.get("/logout", (req, res, next) => {
	req.logout(function (err) {
		if (err) {
			return next(err);
		}
	});
	res.redirect("/");
});

//post routes

router.post(
	"/login",
	passport.authenticate("local", {
		failureRedirect: "/login",
		successRedirect: "/",
		failureFlash: true
	})
);

router.post("/register", async (req, res) => {
	try {
		//to delete all users
		//await User.deleteMany({})

		//check password
		let passRegex = /^(?=.*[0-9])[A-Za-z]\w{7,14}$/;

		if (!req.body.pw.match(passRegex)) {
			throw new Error("Invalid password");
		}

		//check username
		let unameRegex = /^[a-z0-9]+@[a-z]+\.[a-z]{2,3}$/;
		if (!req.body.uname.match(unameRegex)) {
			throw new Error("Invalid email address");
		}

		//test for duplicate user
		const testUser = await User.find({ username: req.body.uname });
		if (testUser[0] && testUser[0].username === req.body.uname) {
			throw new Error("Duplicate username");
		}
		const hashedPassword = await genPassword(req.body.pw);

		//location
		let lat = null;
		let lon = null;
		if (req.body.lat != "" && req.body.lon != "") {
			lat = Number(req.body.lat);
			lon = Number(req.body.lon);
		}

		const newUser = new User({
			username: req.body.uname,
			hash: hashedPassword,
			admin: false, //create admin here
			profilePic: {
				data: fs.readFileSync(
					path.join(__dirname + "/../public/images/anon.jpg")
				),
				contentType: "image/jpg"
			},
			location: {
				lat: lat,
				lon: lon
			}
		});

		await newUser.save();

		await verify(newUser);
		//immediate login
		req.login(newUser, (err) => {
			if (err) {
				req.flash("error", err.message);
				res.redirect("/register");
			}
			return res.redirect("/profile");
		});
	} catch (err) {
		req.flash("error", err.message);
		res.redirect("/register");
	}
});

module.exports = router;
