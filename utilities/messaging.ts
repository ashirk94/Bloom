import mongoose from "mongoose";
import User from "../models/User.ts";
import Message, { type MessageDocument } from "../models/Message.ts";
import { areConnected } from "./connections.ts";

export const MAX_MESSAGE_LENGTH = 2000;

// a message the server refused to send; `message` is safe to show the user
export class MessageError extends Error {}

interface SendMessageInput {
	senderId: string;
	// recipientId and text come from the browser, so they could be anything.
	// `unknown` makes TypeScript insist that we check them before use.
	recipientId: unknown;
	text: unknown;
}

// Validates and stores a message from senderId to recipientId.
// senderId must come from the session, never from the client.
// Resolves to the saved Message, or rejects with a MessageError.
export async function sendMessage({
	senderId,
	recipientId,
	text
}: SendMessageInput): Promise<MessageDocument> {
	if (typeof text !== "string" || !text.trim()) {
		throw new MessageError("Message is empty.");
	}
	// from here on TypeScript knows `text` is a string ("narrowing")
	const trimmed = text.trim();
	if (trimmed.length > MAX_MESSAGE_LENGTH) {
		throw new MessageError(
			`Messages can be at most ${MAX_MESSAGE_LENGTH} characters.`
		);
	}
	if (typeof recipientId !== "string" || !mongoose.isValidObjectId(recipientId)) {
		throw new MessageError("Recipient not found.");
	}
	if (senderId === recipientId) {
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
		text: trimmed
	});
}
