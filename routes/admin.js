const router = require("express").Router();
const mongoose = require("mongoose");
const User = require("../models/User");
const Message = require("../models/Message");
const { isAdmin } = require("../utilities/authMiddleware");
const { HttpError } = require("../utilities/errors");
const { publicUser } = require("../utilities/serialize");

router.use("/admin", isAdmin);

router.get("/admin/users", async (req, res) => {
	const users = await User.find().select("-profilePic").sort({ createdAt: -1 });
	res.json({
		users: users.map((user) => ({
			...publicUser(user),
			email: user.username,
			admin: Boolean(user.admin)
		}))
	});
});

// DELETE is the HTTP method meant for removing things
router.delete("/admin/users/:id", async (req, res) => {
	// lower case, so "ABC..." can't get past the "is this me?" check below
	const id = String(req.params.id).toLowerCase();
	if (!mongoose.isValidObjectId(id)) throw new HttpError(404, "User not found.");
	if (id === req.user.id) {
		throw new HttpError(400, "You can't delete your own account here.");
	}

	const deleted = await User.findByIdAndDelete(id);
	if (!deleted) throw new HttpError(404, "User not found.");

	// clean up everything that pointed at the deleted user, otherwise other
	// users keep "ghost" requests and conversations
	await Promise.all([
		User.updateMany({ likedBy: id }, { $pull: { likedBy: id } }),
		Message.deleteMany({ $or: [{ sender: id }, { recipient: id }] })
	]);

	// log the deleted user out of any open chat connections
	req.app.get("io")?.in(id).disconnectSockets(true);

	res.json({ ok: true });
});

module.exports = router;
