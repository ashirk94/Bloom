const { genPassword, validPassword } = require("./passwordUtils");

describe("password utilities", () => {
	test("hashes a password and verifies the original password", async () => {
		const password = "CorrectCat123";
		const hash = await genPassword(password);

		expect(hash).not.toBe(password);
		await expect(validPassword(password, hash)).resolves.toBe(true);
	});

	test("rejects a password that does not match the hash", async () => {
		const hash = await genPassword("CorrectCat123");

		await expect(validPassword("WrongPassword123", hash)).resolves.toBe(
			false
		);
	});
});