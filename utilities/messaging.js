const mongoose = require("mongoose");
const User = require("../models/User");
const Message = require("../models/Message");
const { areConnected } = require("./connections");

const MAX_MESSAGE_LENGTH = 2000;

// a message the server refused to send; `message` is safe to show the user
class MessageError extends Error {}

// Validates and stores a message from senderId to recipientId.
// senderId must come from the session, never from the client.
// Resolves to the saved Message, or rejects with a MessageError.
async function sendMessage({ senderId, recipientId, text }) {
	if (typeof text !== "string" || !text.trim()) {
		throw new MessageError("Message is empty.");
	}
	text = text.trim();
	if (text.length > MAX_MESSAGE_LENGTH) {
		throw new MessageError(
			`Messages can be at most ${MAX_MESSAGE_LENGTH} characters.`
		);
	}
	if (!mongoose.isValidObjectId(recipientId)) {
		throw new MessageError("Recipient not found.");
	}
	if (String(senderId) === String(recipientId)) {
		throw new MessageError("You can't message yourself.");
	}

	// only the likedBy lists are needed to check the connection
	const [sender, recipient] = await Promise.all([
		User.findById(senderId).select("likedBy"),
		User.findById(recipientId).select("likedBy")
	]);
	if (!sender || !recipient) {
		throw new MessageError("Recipient not found.");
	}
	if (!areConnected(sender, recipient)) {
		throw new MessageError(
			"You can only message people who have accepted your request."
		);
	}

	return Message.create({
		sender: sender._id,
		recipient: recipient._id,
		text
	});
}

module.exports = {
	MAX_MESSAGE_LENGTH,
	MessageError,
	sendMessage
};
