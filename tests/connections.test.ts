import { describe, expect, test } from "vitest";
import mongoose from "mongoose";
import { hasLiked, areConnected, relationship } from "../utilities/connections.ts";

function makeUser(likedBy: mongoose.Types.ObjectId[] = []) {
	return { _id: new mongoose.Types.ObjectId(), likedBy: [...likedBy] };
}

describe("hasLiked", () => {
	test("is true when the liker appears in the liked user's likedBy list", () => {
		const alice = makeUser();
		const bob = makeUser([alice._id]);

		expect(hasLiked(bob, alice._id)).toBe(true);
		expect(hasLiked(bob, alice._id.toString())).toBe(true);
	});

	test("is false when there is no like", () => {
		expect(hasLiked(makeUser(), makeUser()._id)).toBe(false);
	});

	test("handles missing users and lists", () => {
		expect(hasLiked(null, "abc")).toBe(false);
		expect(hasLiked({ _id: "x" }, "abc")).toBe(false);
	});
});

describe("areConnected", () => {
	test("is true only when both users liked each other", () => {
		const alice = makeUser();
		const bob = makeUser([alice._id]);
		alice.likedBy.push(bob._id);

		expect(areConnected(alice, bob)).toBe(true);
		expect(areConnected(bob, alice)).toBe(true);
	});

	test("is false for a pending one-way request", () => {
		const alice = makeUser();
		const bob = makeUser([alice._id]);

		expect(areConnected(alice, bob)).toBe(false);
		expect(areConnected(bob, alice)).toBe(false);
	});

	test("is false for the same user", () => {
		const alice = makeUser();
		alice.likedBy.push(alice._id);

		expect(areConnected(alice, alice)).toBe(false);
	});
});

describe("relationship", () => {
	test("describes every stage of a friend request", () => {
		const alice = makeUser();
		const bob = makeUser();
		expect(relationship(alice, bob)).toBe("none");
		expect(relationship(alice, alice)).toBe("self");

		bob.likedBy.push(alice._id); // alice sends bob a request
		expect(relationship(alice, bob)).toBe("request-sent");
		expect(relationship(bob, alice)).toBe("request-received");

		alice.likedBy.push(bob._id); // bob accepts
		expect(relationship(alice, bob)).toBe("connected");
		expect(relationship(bob, alice)).toBe("connected");
	});
});
