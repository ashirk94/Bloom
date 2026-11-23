import { describe, expect, test } from "vitest";
import { isValidEmail, passwordProblem } from "./validation";
import * as server from "../../../utilities/validation.ts";

// The sign-up form checks passwords in the browser for instant feedback, and
// the server checks again. If the two disagreed, the form could accept a
// password the server then rejects (or the reverse), so this compares them.
const passwords = [
	"StrongPass1",
	"Ab1",
	"alllowercase1",
	"ALLUPPERCASE1",
	"NoNumbersHere",
	"Exactly8a",
	""
];

describe("browser validation", () => {
	test.each(passwords)("agrees with the server about %j", (password) => {
		expect(passwordProblem(password)).toBe(server.passwordProblem(password));
	});

	test("agrees with the server about email addresses", () => {
		for (const email of ["sam@example.com", "not-an-email", "a b@c.de", "x@y.z"]) {
			expect(isValidEmail(email)).toBe(server.isValidEmail(email));
		}
	});
});
