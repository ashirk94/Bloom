import mongoose from "mongoose";
import { beforeEach, describe, expect, test, vi } from "vitest";
import User from "../models/User.ts";
import Message from "../models/Message.ts";
import { sendMessage, MessageError, MAX_MESSAGE_LENGTH } from "../utilities/messaging.ts";

// Replace the real models with fakes so these tests don't need a database.
// Vitest moves vi.mock calls above the imports, so the imports above
// already receive the fakes. `default` is there because the models are
// `export default`.
vi.mock("../models/User.ts", () => ({ default: { findById: vi.fn() } }));
vi.mock("../models/Message.ts", () => ({ default: { create: vi.fn() } }));

// vi.mocked() tells TypeScript these are mock functions, so
// mockImplementation and friends are available on them
const findById = vi.mocked(User.findById);
const create = vi.mocked(Message.create);

interface FakeUser {
	_id: mongoose.Types.ObjectId;
	likedBy: mongoose.Types.ObjectId[];
}

function makeUser(): FakeUser {
	return { _id: new mongoose.Types.ObjectId(), likedBy: [] };
}

function connect(a: FakeUser, b: FakeUser) {
	a.likedBy.push(b._id);
	b.likedBy.push(a._id);
}

let alice: FakeUser;
let bob: FakeUser;

beforeEach(() => {
	alice = makeUser();
	bob = makeUser();
	const users = [alice, bob];

	// the real code calls User.findById(id).select("likedBy").
	// The fakes are much simpler than real Mongoose queries, so `as never`
	// tells TypeScript not to compare them against the real types.
	findById.mockImplementation(
		(id: unknown) =>
			({
				select: async () => users.find((u) => String(u._id) === String(id)) || null
			}) as never
	);
	// pretend to save: hand back what would have been stored
	create.mockImplementation((async (fields: unknown) => fields) as never);
});

function send(overrides: Partial<Parameters<typeof sendMessage>[0]> = {}) {
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

		expect(create).toHaveBeenCalledTimes(1);
		expect(message).toEqual({
			sender: alice._id,
			recipient: bob._id,
			text: "hi bob"
		});
	});

	test("rejects messages before the request is accepted", async () => {
		bob.likedBy.push(alice._id); // one-way request only

		await expect(send()).rejects.toThrow(MessageError);
		expect(create).not.toHaveBeenCalled();
	});

	test("rejects empty and non-string messages", async () => {
		connect(alice, bob);

		await expect(send({ text: "   " })).rejects.toThrow(MessageError);
		await expect(send({ text: { $gt: "" } })).rejects.toThrow(MessageError);
		await expect(send({ text: undefined })).rejects.toThrow(MessageError);
		expect(create).not.toHaveBeenCalled();
	});

	test("accepts a message of exactly the maximum length", async () => {
		connect(alice, bob);

		await expect(send({ text: "a".repeat(MAX_MESSAGE_LENGTH) })).resolves.toBeTruthy();
	});

	test("rejects messages that are too long", async () => {
		connect(alice, bob);

		await expect(
			send({ text: "a".repeat(MAX_MESSAGE_LENGTH + 1) })
		).rejects.toThrow(MessageError);
	});

	test("rejects invalid or unknown recipients", async () => {
		await expect(send({ recipientId: "not-an-id" })).rejects.toThrow(MessageError);
		await expect(send({ recipientId: { $ne: null } })).rejects.toThrow(MessageError);
		await expect(
			send({ recipientId: new mongoose.Types.ObjectId().toString() })
		).rejects.toThrow(MessageError);
	});

	test("rejects messaging yourself", async () => {
		await expect(send({ recipientId: alice._id.toString() })).rejects.toThrow(
			MessageError
		);
	});
});
