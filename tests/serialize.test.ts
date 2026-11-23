import mongoose from "mongoose";
import { describe, expect, test } from "vitest";
import User from "../models/User.ts";
import Message from "../models/Message.ts";
import { privateUser, publicMessage, publicUser } from "../utilities/serialize.ts";

// `new User(...)` builds a real document in memory. Nothing is saved, so no
// database is needed, but the schema's defaults and methods all work.
function makeUser(fields: Record<string, unknown> = {}) {
	return new User({
		username: "sam@example.com",
		hash: "$2b$10$not-a-real-hash",
		displayName: "Sam",
		bio: "Hi!",
		interests: ["Art", "Music"],
		values: ["Humor"],
		location: { type: "Point", coordinates: [-122.68, 45.52] },
		updatedAt: new Date("2026-01-02T03:04:05Z"),
		...fields
	});
}

describe("publicUser", () => {
	test("never includes private fields", () => {
		const shown = publicUser(makeUser({ admin: true }));

		// toEqual fails if there are ANY extra fields, so a field added to
		// the serializer by accident (like the email) would break this test
		expect(shown).toEqual({
			id: expect.any(String),
			displayName: "Sam",
			bio: "Hi!",
			interests: ["Art", "Music"],
			values: ["Humor"],
			avatarUrl: expect.stringMatching(/^\/api\/users\/[0-9a-f]{24}\/avatar\?v=\d+$/)
		});
		const text = JSON.stringify(shown);
		expect(text).not.toContain("sam@example.com");
		expect(text).not.toContain("hash");
		expect(text).not.toContain("45.52");
	});

	test("gives nameless users a placeholder name", () => {
		expect(publicUser(makeUser({ displayName: "" })).displayName).toBe("Bloom user");
	});

	test("changes the avatar address when the profile is saved", () => {
		const before = publicUser(makeUser()).avatarUrl;
		const after = publicUser(makeUser({ updatedAt: new Date("2026-06-01") })).avatarUrl;
		expect(after).not.toBe(before);
	});
});

describe("privateUser", () => {
	test("adds the owner's own email and settings, but not the hash", () => {
		const shown = privateUser(makeUser());

		expect(shown.email).toBe("sam@example.com");
		expect(shown.admin).toBe(false);
		expect(shown.hasLocation).toBe(true);
		expect(JSON.stringify(shown)).not.toContain("hash");
	});

	test("treats the old [0, 0] placeholder as no location", () => {
		const shown = privateUser(makeUser({ location: { type: "Point", coordinates: [0, 0] } }));
		expect(shown.hasLocation).toBe(false);
	});
});

describe("publicMessage", () => {
	test("sends ids as strings and the time as an ISO string", () => {
		const sender = new mongoose.Types.ObjectId();
		const recipient = new mongoose.Types.ObjectId();
		const message = new Message({
			sender,
			recipient,
			text: "hello",
			createdAt: new Date("2026-01-02T03:04:05Z")
		});

		expect(publicMessage(message)).toEqual({
			id: message.id,
			from: sender.toString(),
			to: recipient.toString(),
			text: "hello",
			createdAt: "2026-01-02T03:04:05.000Z"
		});
	});
});
