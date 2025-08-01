const router = require("express").Router();
const isAdmin = require("../utilities/authMiddleware").isAdmin;
const isAuth = require("../utilities/authMiddleware").isAuth;
const jwt = require("jsonwebtoken");
const { User } = require("../config/database");

//get unread message flag
router.get("/users/:id", async (req, res) => {
	try {
		const user = await User.findById(req.params.id);

		const userData = user.toJSON();
		if (user) {
			res.json(userData);
		} else {
			res.status(404).json({ message: "User not found" });
		}
	} catch (err) {
		console.error(err);
		res.status(500).json({ message: "Internal server error" });
	}
});

//alter user
router.post("/users/:id", async (req, res) => {
	try {
		const userId = req.params.id;
		if (req.body.seen == "true") {
			const user = await User.findById(userId);
			user.hasUnreadMessage = false;
			await user.save();

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
