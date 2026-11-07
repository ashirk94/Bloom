const mongoose = require("mongoose");

jest.mock("../config/database", () => ({ User: { findById: jest.fn() } }));

const { User } = require("../config/database");
const {
	sendMessage,
	MessageError,
	MAX_MESSAGE_LENGTH
} = require("../utilities/messaging");

function makeUser(username) {
	return {
		_id: new mongoose.Types.ObjectId(),
		username,
		likes: [],
		messages: [],
		hasUnreadMessage: false,
		save: jest.fn().mockResolvedValue()
	};
}

function connect(a, b) {
	a.likes.push({ _id: [b._id] });
	b.likes.push({ _id: [a._id] });
}

let alice;
let bob;

beforeEach(() => {
	alice = makeUser("alice@example.com");
	bob = makeUser("bob@example.com");
	const users = [alice, bob];
	User.findById.mockReset();
	User.findById.mockImplementation(async (id) =>
		users.find((u) => String(u._id) === String(id)) || null
	);
});

function send(overrides = {}) {
	return sendMessage({
		senderId: alice._id.toString(),
		recipientId: bob._id.toString(),
		text: "hi bob",
		timeZone: "America/Los_Angeles",
		...overrides
	});
}

describe("sendMessage", () => {
	test("stores the message for both connected users", async () => {
		connect(alice, bob);

		const message = await send({ text: "  hi bob  " });

		expect(message).toMatchObject({
			username: "alice@example.com",
			text: "hi bob",
			sender: "alice@example.com",
			recipient: "bob@example.com"
		});
		expect(alice.messages).toHaveLength(1);
		expect(bob.messages).toHaveLength(1);
		expect(bob.hasUnreadMessage).toBe(true);
		expect(alice.save).toHaveBeenCalled();
		expect(bob.save).toHaveBeenCalled();
	});

	test("rejects messages before the request is accepted", async () => {
		bob.likes.push({ _id: [alice._id] }); // one-way request only

		await expect(send()).rejects.toThrow(MessageError);
		expect(bob.messages).toHaveLength(0);
		expect(bob.save).not.toHaveBeenCalled();
	});

	test("uses the sender's real username, not anything from the client", async () => {
		connect(alice, bob);

		const message = await send({ sender: "someone-else" });

		expect(message.username).toBe("alice@example.com");
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

	test("falls back gracefully on an invalid time zone", async () => {
		connect(alice, bob);

		await expect(send({ timeZone: "Not/AZone" })).resolves.toHaveProperty(
			"time"
		);
	});
});
