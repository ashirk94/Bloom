const router = require("express").Router();
const User = require("../models/User");
const { isAuth } = require("../utilities/authMiddleware");
const { HttpError } = require("../utilities/errors");
const { privateUser } = require("../utilities/serialize");
const { upload, detectImageType } = require("../utilities/upload");
const options = require("../config/options");
const {
	cleanRankedList,
	parseLocation,
	cleanText
} = require("../utilities/validation");

// The lists of interests and values to choose from (public)
router.get("/options", (req, res) => {
	res.json({
		maxRanked: options.MAX_RANKED,
		interests: options.INTERESTS,
		values: options.VALUES
	});
});

// Update my profile. PATCH means "change only the fields I sent", so one
// route replaces the old /display-name, /bio, /interests, /values and
// /update-location routes.
router.patch("/me", isAuth, async (req, res) => {
	const user = req.user;
	const body = req.body;

	if (body.displayName !== undefined) {
		const displayName = cleanText(body.displayName, 50);
		if (!displayName) throw new HttpError(400, "Display name can't be empty.");
		user.displayName = displayName;
	}
	if (body.bio !== undefined) {
		user.bio = cleanText(body.bio, 500);
	}
	if (body.interests !== undefined) {
		user.interests = cleanRankedList(body.interests, options.INTEREST_NAMES);
	}
	if (body.values !== undefined) {
		user.values = cleanRankedList(body.values, options.VALUE_NAMES);
	}
	if (body.lat !== undefined || body.lon !== undefined) {
		const location = parseLocation(body.lat, body.lon);
		if (!location) throw new HttpError(400, "That location isn't valid.");
		user.location = location;
	}

	await user.save();
	res.json({ user: privateUser(user) });
});

// Replace my profile picture. The form field must be called "image".
router.put("/me/avatar", isAuth, upload.single("image"), async (req, res) => {
	if (!req.file) throw new HttpError(400, "Please choose an image.");

	const contentType = detectImageType(req.file.buffer);
	if (!contentType) {
		throw new HttpError(400, "Only .png and .jpg images are allowed.");
	}

	// updateOne because req.user was loaded without its picture
	await User.updateOne(
		{ _id: req.user._id },
		{ profilePic: { data: req.file.buffer, contentType } }
	);

	const user = await User.findById(req.user._id).select("-profilePic");
	res.json({ user: privateUser(user) });
});

module.exports = router;
