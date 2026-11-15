const router = require("express").Router();
const mongoose = require("mongoose");
const User = require("../models/User");
const Message = require("../models/Message");
const { isAuth } = require("../utilities/authMiddleware");
const { HttpError } = require("../utilities/errors");
const { publicUser, publicMessage } = require("../utilities/serialize");
const { areConnected } = require("../utilities/connections");

const PAGE_SIZE = 200;

router.use("/conversations", isAuth);

// My connections, each with its latest message and unread count.
// Used for the chat sidebar and the unread badge in the navbar.
router.get("/conversations", async (req, res) => {
	const me = req.user;

	const friends = await User.find({
		_id: { $in: me.likedBy },
		likedBy: me._id
	}).select("-profilePic");

	const conversations = await Promise.all(
		friends.map(async (friend) => {
			const [lastMessage, unreadCount] = await Promise.all([
				Message.findOne({
					$or: [
						{ sender: me._id, recipient: friend._id },
						{ sender: friend._id, recipient: me._id }
					]
				}).sort({ createdAt: -1 }),
				Message.countDocuments({
					sender: friend._id,
					recipient: me._id,
					readAt: null
				})
			]);
			return {
				user: publicUser(friend),
				lastMessage: lastMessage ? publicMessage(lastMessage) : null,
				unreadCount
			};
		})
	);

	// most recently active conversation first
	const lastActivity = (c) =>
		c.lastMessage ? new Date(c.lastMessage.createdAt).getTime() : 0;
	conversations.sort((a, b) => lastActivity(b) - lastActivity(a));

	res.json({ conversations });
});

// Loads the friend and checks that chatting with them is allowed
async function loadFriend(req) {
	const { id } = req.params;
	if (!mongoose.isValidObjectId(id)) {
		throw new HttpError(404, "User not found.");
	}
	const friend = await User.findById(id).select("-profilePic");
	if (!friend) throw new HttpError(404, "User not found.");
	if (!areConnected(req.user, friend)) {
		throw new HttpError(
			403,
			"You can only chat with people who have accepted your request."
		);
	}
	return friend;
}

// The messages between me and one friend (the latest PAGE_SIZE of them)
router.get("/conversations/:id/messages", async (req, res) => {
	const me = req.user;
	const friend = await loadFriend(req);

	const messages = await Message.find({
		$or: [
			{ sender: me._id, recipient: friend._id },
			{ sender: friend._id, recipient: me._id }
		]
	})
		.sort({ createdAt: -1 })
		.limit(PAGE_SIZE);

	res.json({
		friend: publicUser(friend),
		messages: messages.reverse().map(publicMessage)
	});
});

// Mark everything this friend sent me as read
router.post("/conversations/:id/read", async (req, res) => {
	const friend = await loadFriend(req);
	await Message.updateMany(
		{ sender: friend._id, recipient: req.user._id, readAt: null },
		{ readAt: new Date() }
	);
	res.json({ ok: true });
});

module.exports = router;
