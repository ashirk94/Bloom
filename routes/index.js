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
	const successMessage = req.flash("success");
	const errorMessage = req.flash("error");
	res.render("index", { 
		user: req.user, 
		successMessage: successMessage.length > 0 ? successMessage[0] : null,
		errorMessage: errorMessage.length > 0 ? errorMessage[0] : null
	});
});

router.get("/profile", isAuth, (req, res) => {
	const successMessage = req.flash("success");
	const errorMessage = req.flash("error");
	res.render("profile/profile", {
		user: req.user,
		successMessage: successMessage.length > 0 ? successMessage[0] : null,
		errorMessage: errorMessage.length > 0 ? errorMessage[0] : null
	});
});

router.get("/bio", isAuth, (req, res) => {
	const successMessage = req.flash("success");
	const errorMessage = req.flash("error");
	res.render("profile/bio", {
		user: req.user,
		successMessage: successMessage.length > 0 ? successMessage[0] : null,
		errorMessage: errorMessage.length > 0 ? errorMessage[0] : null
	});
});

router.get("/interests", isAuth, (req, res) => {
	const successMessage = req.flash("success");
	const errorMessage = req.flash("error");
	res.render("profile/interests", {
		user: req.user,
		successMessage: successMessage.length > 0 ? successMessage[0] : null,
		errorMessage: errorMessage.length > 0 ? errorMessage[0] : null
	});
});

router.get("/values", isAuth, (req, res) => {
	const successMessage = req.flash("success");
	const errorMessage = req.flash("error");
	res.render("profile/values", {
		user: req.user,
		successMessage: successMessage.length > 0 ? successMessage[0] : null,
		errorMessage: errorMessage.length > 0 ? errorMessage[0] : null
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
			user.location = {
				type: 'Point',
				coordinates: [Number(req.body.lon), Number(req.body.lat)] // [longitude, latitude]
			};
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

// Update user location
router.post("/update-location", isAuth, async (req, res) => {
	try {
		const { lat, lon } = req.body;
		
		if (!lat || !lon) {
			return res.status(400).json({ error: 'Latitude and longitude are required' });
		}
		
		const user = await User.findById(req.user.id);
		
		// Use GeoJSON format for the 2dsphere index
		user.location = {
			type: 'Point',
			coordinates: [parseFloat(lon), parseFloat(lat)] // [longitude, latitude] order for GeoJSON
		};
		
		await user.save();
		console.log(`Updated location for ${user.username}: ${lat}, ${lon}`);
		
		res.json({ success: true, message: 'Location updated successfully' });
	} catch (error) {
		console.error('Error updating location:', error);
		res.status(500).json({ error: 'Failed to update location' });
	}
});

router.post("/display-name", isAuth, async (req, res) => {
	try {
		const user = await User.findById(req.user.id);
		user.displayName = req.body.displayName;
		await user.save();
		req.flash("success", "Display name updated!");
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
