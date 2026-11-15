const {
	isValidEmail,
	passwordProblem,
	cleanRankedList,
	parseLocation,
	cleanText
} = require("../utilities/validation");

describe("isValidEmail", () => {
	test("accepts normal addresses", () => {
		expect(isValidEmail("sam@example.com")).toBe(true);
		expect(isValidEmail("first.last+tag@mail.example.co.uk")).toBe(true);
	});

	test("rejects malformed addresses and non-strings", () => {
		expect(isValidEmail("not-an-email")).toBe(false);
		expect(isValidEmail("two words@example.com")).toBe(false);
		expect(isValidEmail({ $ne: "" })).toBe(false);
		expect(isValidEmail(undefined)).toBe(false);
	});
});

describe("passwordProblem", () => {
	test("returns null for a strong password", () => {
		expect(passwordProblem("StrongPass1")).toBeNull();
	});

	test("explains what is wrong with a weak password", () => {
		expect(passwordProblem("Ab1")).toMatch(/at least 8/);
		expect(passwordProblem("alllowercase1")).toMatch(/uppercase/);
		expect(passwordProblem("NoNumbersHere")).toMatch(/number/);
		expect(passwordProblem(undefined)).toMatch(/at least 8/);
		expect(passwordProblem("Aa1" + "x".repeat(80))).toMatch(/at most 72/);
	});
});

describe("cleanRankedList", () => {
	const allowed = ["Art", "Music", "Hiking", "Coffee", "Yoga", "Travel"];

	test("keeps known items in order", () => {
		expect(cleanRankedList(["Music", "Art"], allowed)).toEqual([
			"Music",
			"Art"
		]);
	});

	test("drops unknown items, duplicates and anything past five", () => {
		expect(
			cleanRankedList(["Art", "Hacking", "Art", { $gt: "" }], allowed)
		).toEqual(["Art"]);
		expect(cleanRankedList(allowed, allowed)).toHaveLength(5);
	});

	test("treats anything that isn't a list as empty", () => {
		expect(cleanRankedList("Art", allowed)).toEqual([]);
		expect(cleanRankedList(undefined, allowed)).toEqual([]);
	});
});

describe("parseLocation", () => {
	test("builds a GeoJSON point with longitude first", () => {
		expect(parseLocation("45.5", "-122.6")).toEqual({
			type: "Point",
			coordinates: [-122.6, 45.5]
		});
	});

	test("returns null for missing or impossible coordinates", () => {
		expect(parseLocation("", "")).toBeNull();
		expect(parseLocation(undefined, 10)).toBeNull();
		expect(parseLocation("abc", "10")).toBeNull();
		expect(parseLocation(91, 0)).toBeNull();
		expect(parseLocation(0, 181)).toBeNull();
	});
});

describe("cleanText", () => {
	test("trims and shortens text", () => {
		expect(cleanText("  hello  ", 50)).toBe("hello");
		expect(cleanText("abcdef", 3)).toBe("abc");
		expect(cleanText(42, 10)).toBe("");
	});
});
