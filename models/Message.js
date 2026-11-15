const mongoose = require("mongoose");

// One document per chat message.
// Messages used to be copied into BOTH users' documents, which meant every
// message was stored twice, user documents grew forever (MongoDB caps a
// document at 16 MB), and every page load pulled a user's whole chat history.
const MessageSchema = new mongoose.Schema(
	{
		sender: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true
		},
		recipient: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true
		},
		text: { type: String, required: true },
		// null until the recipient opens the conversation
		readAt: { type: Date, default: null }
	},
	// createdAt is the message time. It is stored in UTC and each browser
	// converts it to the reader's own time zone.
	{ timestamps: true }
);

// An index lets MongoDB find a conversation without scanning every message
MessageSchema.index({ sender: 1, recipient: 1, createdAt: 1 });
MessageSchema.index({ recipient: 1, readAt: 1 });

module.exports = mongoose.model("Message", MessageSchema);
