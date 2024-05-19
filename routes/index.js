const router = require("express").Router();
const isAuth = require("../utilities/authMiddleware").isAuth;
const isAdmin = require("../utilities/authMiddleware").isAdmin;
const path = require("path");
const { User } = require("../config/database");
const fs = require("fs");

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

router.get("/", (req, res) => {
	const message = req.flash();
	res.render("index", { user: req.user, message: message });
});

router.get("/profile", isAuth, (req, res) => {
	const message = req.flash();
	res.render("profile/profile", {
		user: req.user,
		message: message.success || message.error
	});
});

router.get("/bio", isAuth, (req, res) => {
	const message = req.flash();
	res.render("profile/bio", {
		user: req.user,
		message: message.success || message.error
	});
});

router.get("/interests", isAuth, (req, res) => {
	const message = req.flash();
	res.render("profile/interests", {
		user: req.user,
		message: message.success || message.error
	});
});

router.get("/values", isAuth, (req, res) => {
	const message = req.flash();
	res.render("profile/values", {
		user: req.user,
		message: message.success || message.error
	});
});

router.get("/admin", isAdmin, async (req, res) => {
	const users = await User.find();
	res.render("admin", { user: req.user, accounts: users });
});

//post

router.post("/profile", isAuth, upload.single("image"), async (req, res) => {
	//get current user data and replace some with relevant data from form
	try {
		const user = await User.findById(req.user._id);

		if (req.body.lat != "" && req.body.lon != "") {
			user.location.lat = Number(req.body.lat);
			user.location.lon = Number(req.body.lon);
		}
		if (req.file != null) {
			user.profilePic.data = fs.readFileSync(
				path.join(__dirname + "/../public/uploads/" + req.file.filename)
			);
			user.profilePic.contentType =
				"image/" + path.extname(req.file.filename);
			fs.unlink(
				path.join(
					__dirname + "/../public/uploads/" + req.file.filename
				),
				(err) => {
					if (err) {
						throw err;
					}
				}
			);
		}

		await user.save();

		req.flash("success", "Profile updated!");
	} catch (err) {
		console.error(err);
		req.flash("error", err.message);
	}
	res.redirect("/profile");
});

router.post("/interests", isAuth, async (req, res) => {
	//replace interests
	try {
		const user = await User.findById(req.user.id);

		user.interest1 = req.body.interest1;
		user.interest2 = req.body.interest2;
		user.interest3 = req.body.interest3;
		user.interest4 = req.body.interest4;
		user.interest5 = req.body.interest5;

		await user.save();
		req.flash("success", "Profile updated!");
	} catch (err) {
		console.error(err);
		req.flash("error", err.message);
	}
	res.redirect("/interests");
});

router.post("/values", isAuth, async (req, res) => {
	//replace values
	try {
		const user = await User.findById(req.user.id);

		user.value1 = req.body.value1;
		user.value2 = req.body.value2;
		user.value3 = req.body.value3;
		user.value4 = req.body.value4;
		user.value5 = req.body.value5;

		await user.save();
		req.flash("success", "Profile updated!");
	} catch (err) {
		console.error(err);
		req.flash("error", err.message);
	}
	res.redirect("/values");
});

router.post("/bio", isAuth, async (req, res) => {
	try {
		const user = await User.findById(req.user.id);
		user.bio = req.body.bio;
		await user.save();
		req.flash("success", "Bio updated!");
	} catch (err) {
		console.error(err);
		req.flash("error", err.message);
	}
	res.redirect("/bio");
});
module.exports = router;
