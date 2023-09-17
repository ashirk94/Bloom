const connection = require("../config/database");
const User = connection.models.User;

//format message for display with timestamp
function formatMessage(user, text) {
	const date = new Date();
	const localTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

	const fDate = new Intl.DateTimeFormat("en-us", {
		dateStyle: "medium",
		timeStyle: "short",
		timeZone: localTimeZone
	});
	const timestamp = fDate.format(date);

	const formatted = {
		username: user,
		text,
		time: timestamp
	};
	return formatted;
}

//store messages in both user objects
async function storeMessage(message, senderId, recieverId) {
	const user1 = await User.findById(senderId);
	const user2 = await User.findById(recieverId);

	if (!user1 || !user2) {
		console.error("missing user");
		return;
	}

	const fullMsg = message;

	fullMsg.sender = user1.username;
	fullMsg.recipient = user2.username;

	user1.messages.push(fullMsg);
	user2.messages.push(fullMsg);

	user2.hasUnreadMessage = true;

	await user1.save();
	await user2.save();
}

module.exports = {
	formatMessage,
	storeMessage
};
