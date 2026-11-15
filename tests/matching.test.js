const {
	distanceKm,
	rankedOverlap,
	scoreMatch,
	rankMatches
} = require("../utilities/matching");

const PORTLAND = [-122.68, 45.52]; // [longitude, latitude]
const BEAVERTON = [-122.8, 45.49]; // about 10 km from Portland
const SEATTLE = [-122.33, 47.61]; // about 235 km from Portland

describe("distanceKm", () => {
	test("is zero for the same point", () => {
		expect(distanceKm(PORTLAND, PORTLAND)).toBe(0);
	});

	test("measures real distances in kilometers", () => {
		expect(distanceKm(PORTLAND, SEATTLE)).toBeGreaterThan(225);
		expect(distanceKm(PORTLAND, SEATTLE)).toBeLessThan(245);
	});
});

describe("rankedOverlap", () => {
	const list = ["Art", "Music", "Hiking", "Coffee", "Yoga"];

	test("identical lists score 1", () => {
		const result = rankedOverlap(list, list);
		expect(result.score).toBe(1);
		expect(result.shared).toEqual(list);
	});

	test("nothing in common scores 0", () => {
		expect(rankedOverlap(list, ["Gaming", "Sports"])).toEqual({
			score: 0,
			shared: []
		});
	});

	test("the same items in a different order score lower", () => {
		const reversed = [...list].reverse();
		const result = rankedOverlap(list, reversed);
		expect(result.score).toBeLessThan(1);
		expect(result.score).toBeGreaterThan(0.5);
	});

	test("sharing a top interest beats sharing a low one", () => {
		const sharesTop = rankedOverlap(list, ["Art"]);
		const sharesLow = rankedOverlap(list, ["Yoga"]);
		expect(sharesTop.score).toBeGreaterThan(sharesLow.score);
	});

	test("gives the same score whichever person you start from", () => {
		const other = ["Music", "Gaming", "Art"];
		expect(rankedOverlap(list, other).score).toBe(
			rankedOverlap(other, list).score
		);
	});

	test("ignores capitalization and extra spaces", () => {
		expect(rankedOverlap(["Art"], [" art "]).shared).toEqual(["Art"]);
	});

	test("does not count a repeated item twice", () => {
		const repeated = rankedOverlap(["Art", "Art"], ["Art"]);
		const once = rankedOverlap(["Art"], ["Art"]);
		expect(repeated.score).toBe(once.score);
	});

	test("handles missing lists", () => {
		expect(rankedOverlap(undefined, undefined).score).toBe(0);
	});
});

describe("scoreMatch", () => {
	const me = { interests: ["Art", "Music"], values: ["Humor", "Honesty"] };

	test("compatibility is a whole percentage", () => {
		const twin = scoreMatch(me, me);
		expect(Number.isInteger(twin.compatibility)).toBe(true);
		expect(twin.sharedInterests).toEqual(["Art", "Music"]);
		expect(twin.sharedValues).toEqual(["Humor", "Honesty"]);
	});

	test("being closer raises the score but not the compatibility", () => {
		const near = scoreMatch(me, me, 1, 50);
		const far = scoreMatch(me, me, 49, 50);
		expect(near.score).toBeGreaterThan(far.score);
		expect(near.compatibility).toBe(far.compatibility);
	});
});

describe("rankMatches", () => {
	const me = {
		interests: ["Art", "Music", "Hiking"],
		values: ["Humor"],
		coordinates: PORTLAND
	};
	const person = (name, overrides = {}) => ({
		name,
		interests: [],
		values: [],
		coordinates: BEAVERTON,
		...overrides
	});

	test("puts the most compatible person first", () => {
		const matches = rankMatches(me, [
			person("nothing shared"),
			person("soulmate", { interests: me.interests, values: me.values }),
			person("one shared", { interests: ["Hiking"] })
		]);
		expect(matches.map((m) => m.candidate.name)).toEqual([
			"soulmate",
			"one shared",
			"nothing shared"
		]);
	});

	test("leaves out people beyond the maximum distance", () => {
		const matches = rankMatches(
			me,
			[person("far", { interests: me.interests, coordinates: SEATTLE })],
			{ maxDistanceKm: 50 }
		);
		expect(matches).toHaveLength(0);
	});

	test("leaves out people with no location", () => {
		expect(rankMatches(me, [person("hidden", { coordinates: null })])).toEqual(
			[]
		);
	});

	test("returns nobody if I have no location", () => {
		const lost = { ...me, coordinates: null };
		expect(rankMatches(lost, [person("near")])).toEqual([]);
	});

	test("ignoreDistance (demo mode) matches people anywhere", () => {
		const matches = rankMatches(
			{ ...me, coordinates: null },
			[person("far", { coordinates: SEATTLE }), person("hidden", { coordinates: null })],
			{ ignoreDistance: true }
		);
		expect(matches).toHaveLength(2);
	});

	test("between equally compatible people, the closer one comes first", () => {
		const matches = rankMatches(
			me,
			[
				person("further", { interests: ["Art"], coordinates: BEAVERTON }),
				person("next door", { interests: ["Art"], coordinates: PORTLAND })
			]
		);
		expect(matches[0].candidate.name).toBe("next door");
	});

	test("respects the limit", () => {
		const crowd = Array.from({ length: 30 }, (_, i) => person(`p${i}`));
		expect(rankMatches(me, crowd, { limit: 5 })).toHaveLength(5);
	});
});
