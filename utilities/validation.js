const { MAX_RANKED } = require("../config/options");

// The browser checks these too (client/src/lib/validation.js) so people get
// instant feedback, but the server must always check again: anyone can send
// a request straight to the API and skip the browser's checks.

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isValidEmail(email) {
	return (
		typeof email === "string" &&
		email.length <= 254 &&
		EMAIL_REGEX.test(email)
	);
}

// returns a message describing the problem, or null if the password is fine
function passwordProblem(password) {
	if (typeof password !== "string" || password.length < 8) {
		return "Password must be at least 8 characters long.";
	}
	// bcrypt ignores everything after 72 bytes
	if (Buffer.byteLength(password) > 72) {
		return "Password must be at most 72 characters long.";
	}
	if (!/[A-Z]/.test(password) || !/[a-z]/.test(password)) {
		return "Password must include both uppercase and lowercase letters.";
	}
	if (!/\d/.test(password)) {
		return "Password must include at least one number.";
	}
	return null;
}

// Cleans a ranked list of interests or values sent by the client:
// keeps only known options, removes duplicates, and caps it at five.
function cleanRankedList(list, allowedNames) {
	if (!Array.isArray(list)) return [];
	const cleaned = [];
	for (const item of list) {
		if (allowedNames.includes(item) && !cleaned.includes(item)) {
			cleaned.push(item);
		}
	}
	return cleaned.slice(0, MAX_RANKED);
}

// Returns a GeoJSON point, or null if lat/lon are missing or impossible
function parseLocation(lat, lon) {
	if (lat === undefined || lat === null || lat === "") return null;
	if (lon === undefined || lon === null || lon === "") return null;
	const latitude = Number(lat);
	const longitude = Number(lon);
	if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;
	if (Math.abs(latitude) > 90 || Math.abs(longitude) > 180) return null;
	return { type: "Point", coordinates: [longitude, latitude] };
}

// trims a text field and limits its length; non-strings become ""
function cleanText(value, maxLength) {
	if (typeof value !== "string") return "";
	return value.trim().slice(0, maxLength);
}

module.exports = {
	isValidEmail,
	passwordProblem,
	cleanRankedList,
	parseLocation,
	cleanText
};
