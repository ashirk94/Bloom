const router = require("express").Router();
const { User } = require("../config/database");
const passport = require("passport");
const genPassword = require("../utilities/passwordUtils").genPassword;
const fs = require("fs");
const path = require("path");
const multer = require("multer");

const storage = multer.diskStorage({
	destination: (req, file, next) => {
		next(null, path.join(__dirname, "../public/uploads"));
	},
	filename: (req, file, next) => {
		next(null, Date.now() + path.extname(file.originalname));
	}
});
const upload = multer({
	storage: storage,
	limits: { fileSize: 5000000 }, //5mb
	fileFilter: (req, file, cb) => {
		if (
			file.mimetype == "image/png" ||
			file.mimetype == "image/jpg" ||
			file.mimetype == "image/jpeg"
		) {
			cb(null, true);
		} else {
			cb(null, false);
			return cb(new Error("Only .png, .jpg and .jpeg format allowed!"));
		}
	}
});

//get routes

router.get("/login", (req, res) => {
	const successMessage = req.flash("success");
	const errorMessage = req.flash("error");
	res.render("auth/login", { 
		user: req.user, 
		successMessage: successMessage.length > 0 ? successMessage[0] : null,
		errorMessage: errorMessage.length > 0 ? errorMessage[0] : null
	});
});

router.get("/register", (req, res) => {
	const successMessage = req.flash("success");
	const errorMessage = req.flash("error");
	res.render("auth/register", { 
		user: req.user, 
		successMessage: successMessage.length > 0 ? successMessage[0] : null,
		errorMessage: errorMessage.length > 0 ? errorMessage[0] : null,
		layout: false
	});
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

router.post("/register", upload.single("image"), async (req, res) => {
	try {
        
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
		let location = { type: 'Point', coordinates: [0, 0] };
		if (req.body.lat != "" && req.body.lon != "") {
			location = {
				type: 'Point',
				coordinates: [Number(req.body.lon), Number(req.body.lat)] // [longitude, latitude] for GeoJSON
			};
		}

		// Process interests and values arrays
		const interests = req.body.interests || [];
		const values = req.body.values || [];
		
		// Handle profile picture
		let profilePic;
		if (req.file) {
			profilePic = {
				data: fs.readFileSync(req.file.path),
				contentType: "image/" + path.extname(req.file.filename).substring(1)
			};
			// Delete the uploaded file after reading it
			fs.unlinkSync(req.file.path);
		} else {
			profilePic = {
				data: fs.readFileSync(
					path.join(__dirname + "/../public/images/anon.jpg")
				),
				contentType: "image/jpg"
			};
		}
		
		const newUser = new User({
			username: req.body.uname,
			hash: hashedPassword,
			displayName: req.body.displayName || '',
			bio: req.body.bio || '',
			interest1: req.body.interest1 || '',
			interest2: req.body.interest2 || '',
			interest3: req.body.interest3 || '',
			interest4: req.body.interest4 || '',
			interest5: req.body.interest5 || '',
			value1: req.body.value1 || '',
			value2: req.body.value2 || '',
			value3: req.body.value3 || '',
			value4: req.body.value4 || '',
			value5: req.body.value5 || '',
			admin: false, //create admin here
			confirmed: true, // Auto-confirm for now
			hasUnreadMessage: false,
			likes: [],
			messages: [],
			socketId: '',
			profilePic: profilePic,
			location: location
		});

		await newUser.save();

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
