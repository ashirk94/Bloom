const mongoose = require("mongoose");
const { User } = require("../config/database");
const { areConnected } = require("./connections");

const MAX_MESSAGE_LENGTH = 2000;

// a message the server refused to send; `message` is safe to show the user
class MessageError extends Error {}

//format message for display with timestamp
function formatMessage(user, text, timeZone) {
	const date = new Date();

	let fDate;
	try {
		fDate = new Intl.DateTimeFormat("en-us", {
			dateStyle: "medium",
			timeStyle: "short",
			timeZone: timeZone
		});
	} catch (err) {
		// unknown time zone from the client, fall back to server time
		fDate = new Intl.DateTimeFormat("en-us", {
			dateStyle: "medium",
			timeStyle: "short"
		});
	}
	const timestamp = fDate.format(date);

	const formatted = {
		username: user,
		text,
		time: timestamp
	};
	return formatted;
}

//store messages in both user objects
async function storeMessage(message, sender, recipient) {
	message.sender = sender.username;
	message.recipient = recipient.username;

	sender.messages.push(message);
	recipient.messages.push(message);

	recipient.hasUnreadMessage = true;

	await sender.save();
	await recipient.save();
}

// validates and stores a message from senderId to recipientId.
// senderId must come from the session, never from the client.
// resolves to the stored message, or rejects with a MessageError
async function sendMessage({ senderId, recipientId, text, timeZone }) {
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

	const [sender, recipient] = await Promise.all([
		User.findById(senderId),
		User.findById(recipientId)
	]);
	if (!sender || !recipient) {
		throw new MessageError("Recipient not found.");
	}
	if (!areConnected(sender, recipient)) {
		throw new MessageError(
			"You can only message people who have accepted your request."
		);
	}

	const message = formatMessage(sender.username, text, timeZone);
	await storeMessage(message, sender, recipient);
	return message;
}

module.exports = {
	MAX_MESSAGE_LENGTH,
	MessageError,
	formatMessage,
	storeMessage,
	sendMessage
};
