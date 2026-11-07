const mongoose = require("mongoose");
const { hasLiked, areConnected } = require("../utilities/connections");

function makeUser(likerIds = []) {
	const _id = new mongoose.Types.ObjectId();
	// matches the schema, where each like's _id is stored as an array of one ObjectId
	return { _id, likes: likerIds.map((id) => ({ _id: [id] })) };
}

describe("hasLiked", () => {
	test("is true when the liker appears in the liked user's likes", () => {
		const alice = makeUser();
		const bob = makeUser([alice._id]);

		expect(hasLiked(bob, alice._id)).toBe(true);
		expect(hasLiked(bob, alice._id.toString())).toBe(true);
	});

	test("is false when there is no like", () => {
		const alice = makeUser();
		const bob = makeUser();

		expect(hasLiked(bob, alice._id)).toBe(false);
	});

	test("handles missing users and likes", () => {
		expect(hasLiked(null, "abc")).toBe(false);
		expect(hasLiked({ _id: "x" }, "abc")).toBe(false);
	});
});

describe("areConnected", () => {
	test("is true only when both users liked each other", () => {
		const alice = makeUser();
		const bob = makeUser([alice._id]);
		alice.likes.push({ _id: [bob._id] });

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
		alice.likes.push({ _id: [alice._id] });

		expect(areConnected(alice, alice)).toBe(false);
	});
});
