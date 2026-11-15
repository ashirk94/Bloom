// Functions that decide exactly which fields leave the server.
// Never send a whole database document to the browser: it contains the
// password hash, the email address and the exact location.

function avatarUrl(user) {
	// the ?v= part changes whenever the profile is saved, so browsers can
	// cache the picture but still pick up a new one
	const version = user.updatedAt ? new Date(user.updatedAt).getTime() : 0;
	return `/api/users/${user.id}/avatar?v=${version}`;
}

// what any logged in user may see about another user
function publicUser(user) {
	return {
		id: user.id,
		displayName: user.displayName || "Bloom user",
		bio: user.bio || "",
		interests: user.interests || [],
		values: user.values || [],
		avatarUrl: avatarUrl(user)
	};
}

// what a user may see about their own account
function privateUser(user) {
	return {
		...publicUser(user),
		displayName: user.displayName || "",
		email: user.username,
		admin: Boolean(user.admin),
		hasLocation: Boolean(user.getCoordinates())
	};
}

function publicMessage(message) {
	return {
		id: message.id,
		from: String(message.sender),
		to: String(message.recipient),
		text: message.text,
		createdAt: message.createdAt
	};
}

module.exports = { publicUser, privateUser, publicMessage };
