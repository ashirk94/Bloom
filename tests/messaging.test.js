const mongoose = require("mongoose");

// Replace the real models with fakes so these tests don't need a database
jest.mock("../models/User", () => ({ findById: jest.fn() }));
jest.mock("../models/Message", () => ({ create: jest.fn() }));

const User = require("../models/User");
const Message = require("../models/Message");
const {
	sendMessage,
	MessageError,
	MAX_MESSAGE_LENGTH
} = require("../utilities/messaging");

function makeUser() {
	return { _id: new mongoose.Types.ObjectId(), likedBy: [] };
}

function connect(a, b) {
	a.likedBy.push(b._id);
	b.likedBy.push(a._id);
}

let alice;
let bob;

beforeEach(() => {
	alice = makeUser();
	bob = makeUser();
	const users = [alice, bob];

	User.findById.mockReset();
	// the real code calls User.findById(id).select("likedBy")
	User.findById.mockImplementation((id) => ({
		select: async () =>
			users.find((u) => String(u._id) === String(id)) || null
	}));

	Message.create.mockReset();
	Message.create.mockImplementation(async (fields) => fields);
});

function send(overrides = {}) {
	return sendMessage({
		senderId: alice._id.toString(),
		recipientId: bob._id.toString(),
		text: "hi bob",
		...overrides
	});
}

describe("sendMessage", () => {
	test("stores one trimmed message between connected users", async () => {
		connect(alice, bob);

		const message = await send({ text: "  hi bob  " });

		expect(Message.create).toHaveBeenCalledTimes(1);
		expect(message).toEqual({
			sender: alice._id,
			recipient: bob._id,
			text: "hi bob"
		});
	});

	test("rejects messages before the request is accepted", async () => {
		bob.likedBy.push(alice._id); // one-way request only

		await expect(send()).rejects.toThrow(MessageError);
		expect(Message.create).not.toHaveBeenCalled();
	});

	test("rejects empty and non-string messages", async () => {
		connect(alice, bob);

		await expect(send({ text: "   " })).rejects.toThrow(MessageError);
		await expect(send({ text: { $gt: "" } })).rejects.toThrow(MessageError);
		await expect(send({ text: undefined })).rejects.toThrow(MessageError);
	});

	test("rejects messages that are too long", async () => {
		connect(alice, bob);

		await expect(
			send({ text: "a".repeat(MAX_MESSAGE_LENGTH + 1) })
		).rejects.toThrow(MessageError);
	});

	test("rejects invalid or unknown recipients", async () => {
		await expect(send({ recipientId: "not-an-id" })).rejects.toThrow(
			MessageError
		);
		await expect(
			send({ recipientId: new mongoose.Types.ObjectId().toString() })
		).rejects.toThrow(MessageError);
	});

	test("rejects messaging yourself", async () => {
		await expect(
			send({ recipientId: alice._id.toString() })
		).rejects.toThrow(MessageError);
	});
});
