// Instant feedback in the browser. The server runs the same checks again
// (utilities/validation.js) because browser checks can be skipped.

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(email) {
	return EMAIL_REGEX.test(email);
}

// returns a message describing the problem, or null if the password is fine
export function passwordProblem(password) {
	if (password.length < 8) {
		return "Password must be at least 8 characters long.";
	}
	if (!/[A-Z]/.test(password) || !/[a-z]/.test(password)) {
		return "Password must include both uppercase and lowercase letters.";
	}
	if (!/\d/.test(password)) {
		return "Password must include at least one number.";
	}
	return null;
}
