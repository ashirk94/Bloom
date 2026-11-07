const router = require("express").Router();
const isAdmin = require("../utilities/authMiddleware").isAdmin;
const isAuth = require("../utilities/authMiddleware").isAuth;
const { User } = require("../config/database");

//JSON endpoints a user may only call for their own account
function ownAccountOnly(req, res, next) {
	if (!req.isAuthenticated()) {
		return res.status(401).json({ message: "Not logged in" });
	}
	if (req.user.id !== req.params.id) {
		return res.status(403).json({ message: "Forbidden" });
	}
	next();
}

//get unread message flag
router.get("/users/:id", ownAccountOnly, (req, res) => {
	//only expose what the client needs, never the whole user document
	res.json({ hasUnreadMessage: Boolean(req.user.hasUnreadMessage) });
});

//mark messages as seen
router.post("/users/:id", ownAccountOnly, async (req, res) => {
	try {
		if (req.body.seen == "true") {
			await User.updateOne(
				{ _id: req.user._id },
				{ hasUnreadMessage: false }
			);

			res.status(200).json({ message: "User updated successfully" });
		} else {
			res.status(200).json({ message: "No update applied" });
		}
	} catch (err) {
		console.error(err);
		res.status(500).json({ message: "Internal server error" });
	}
});

//delete by id
router.post("/delete-users/:id", isAdmin, async (req, res) => {
	try {
		await User.findByIdAndDelete(req.params.id);
		res.redirect("/admin");
	} catch (err) {
		console.error(err);
	}
});

//adds a like from a user to another
router.post("/like/:id", isAuth, async (req, res) => {
	try {
		const user = await User.findById(req.params.id);
		const currentUser = await User.findById(req.user._id);

		//stops user from liking the same one multiple times
		if (!user.likes.some((x) => x._id.toString() === currentUser._id.toString())) {
			user.likes.push({
				_id: currentUser._id,
				username: currentUser.username
			});
			await user.save();
		}
		res.status(200).json({ success: true });
	} catch (error) {
		console.error("Like route error:", error);
		res.status(500).json({ error: "Failed to process like" });
	}
});

module.exports = router;
