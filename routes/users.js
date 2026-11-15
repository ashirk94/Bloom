const router = require("express").Router();
const mongoose = require("mongoose");
const User = require("../models/User");
const { isAuth } = require("../utilities/authMiddleware");
const { HttpError } = require("../utilities/errors");
const { publicUser } = require("../utilities/serialize");
const { hasLiked, relationship } = require("../utilities/connections");
const { rankMatches } = require("../utilities/matching");

const MAX_DISTANCE_KM = 50;
// Demo mode matches everyone, wherever they are (handy for showing the app
// off when there are only a few accounts)
const DEMO_MODE = process.env.DEMO_MODE === "true";

// Every route below needs a logged in user
router.use(["/matches", "/connections", "/requests", "/users"], isAuth);

// Runs for every route with an :id parameter and rejects malformed ids
// before they reach the database
router.param("id", (req, res, next, id) => {
	if (!mongoose.isValidObjectId(id)) {
		return next(new HttpError(404, "User not found."));
	}
	// ids are hex, and MongoDB accepts "ABC..." as well as "abc...". Using
	// one spelling means comparisons like `me.id === id` below can't be
	// tricked by sending your own id in capitals.
	req.params.id = id.toLowerCase();
	next();
});

// People I might want to be friends with, best match first
router.get("/matches", async (req, res) => {
	const me = req.user;

	// not me, nobody I already sent a request to, and nobody who already
	// sent me one (those are on the Requests page)
	const candidates = await User.find({
		_id: { $nin: [me._id, ...me.likedBy] },
		likedBy: { $ne: me._id }
	}).select("displayName bio interests values location updatedAt");

	const toMatchable = (user) => ({
		user,
		interests: user.interests,
		values: user.values,
		coordinates: user.getCoordinates()
	});

	const matches = rankMatches(
		toMatchable(me),
		candidates.map(toMatchable),
		{ maxDistanceKm: MAX_DISTANCE_KM, ignoreDistance: DEMO_MODE }
	);

	res.json({
		needsLocation: !DEMO_MODE && !me.getCoordinates(),
		matches: matches.map((match) => ({
			user: publicUser(match.candidate.user),
			compatibility: match.compatibility,
			sharedInterests: match.sharedInterests,
			sharedValues: match.sharedValues,
			// rounded up to the nearest 5 km: an exact distance could be used
			// to work out where someone lives
			distanceKm:
				match.distanceKm === null
					? null
					: Math.max(5, Math.ceil(match.distanceKm / 5) * 5)
		}))
	});
});

// People who accepted my request, or whose request I accepted
router.get("/connections", async (req, res) => {
	const users = await User.find({
		_id: { $in: req.user.likedBy },
		likedBy: req.user._id
	}).select("-profilePic");
	res.json({ users: users.map(publicUser) });
});

// People who sent me a request that I haven't answered
router.get("/requests", async (req, res) => {
	const users = await User.find({
		_id: { $in: req.user.likedBy },
		likedBy: { $ne: req.user._id }
	}).select("-profilePic");
	res.json({ users: users.map(publicUser) });
});

router.get("/users/:id", async (req, res) => {
	const user = await User.findById(req.params.id).select("-profilePic");
	if (!user) throw new HttpError(404, "User not found.");
	res.json({
		user: publicUser(user),
		relationship: relationship(req.user, user)
	});
});

// Profile pictures are served as real image files instead of being pasted
// into every page as base64 text, so the browser can cache them.
router.get("/users/:id/avatar", async (req, res) => {
	const user = await User.findById(req.params.id).select("profilePic");
	if (!user?.profilePic?.data?.length) {
		return res.redirect("/images/anon.jpg");
	}
	// older accounts stored odd values such as "image/.png"
	const isPng = /png/i.test(user.profilePic.contentType || "");
	res.set("Content-Type", isPng ? "image/png" : "image/jpeg");
	res.set("Cache-Control", "private, max-age=86400");
	res.send(user.profilePic.data);
});

// Send a friend request, or accept one (liking someone who already liked me)
router.post("/users/:id/like", async (req, res) => {
	const me = req.user;
	if (me.id === req.params.id) {
		throw new HttpError(400, "You can't send yourself a request.");
	}

	// $addToSet only adds my id if it isn't there already, in one database
	// operation. (Loading the user, checking, then saving could add it twice
	// if two requests arrived at the same moment.)
	const result = await User.updateOne(
		{ _id: req.params.id },
		{ $addToSet: { likedBy: me._id } }
	);
	if (result.matchedCount === 0) throw new HttpError(404, "User not found.");

	res.json({ connected: hasLiked(me, req.params.id) });
});

module.exports = router;
