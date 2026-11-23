import type { UserDocument } from "../models/User.ts";
import type { MessageDocument } from "../models/Message.ts";
import type { PrivateUser, PublicMessage, PublicUser } from "../shared/types.ts";

// Functions that decide exactly which fields leave the server.
// Never send a whole database document to the browser: it contains the
// password hash, the email address and the exact location.
//
// The return types come from shared/types.ts, which the React app uses too,
// so the two sides can't disagree about what a "user" looks like.

function avatarUrl(user: UserDocument): string {
	// the ?v= part changes whenever the profile is saved, so browsers can
	// cache the picture but still pick up a new one
	const version = user.updatedAt ? new Date(user.updatedAt).getTime() : 0;
	return `/api/users/${user.id}/avatar?v=${version}`;
}

// what any logged in user may see about another user
export function publicUser(user: UserDocument): PublicUser {
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
export function privateUser(user: UserDocument): PrivateUser {
	return {
		...publicUser(user),
		displayName: user.displayName || "",
		email: user.username,
		admin: Boolean(user.admin),
		hasLocation: Boolean(user.getCoordinates())
	};
}

export function publicMessage(message: MessageDocument): PublicMessage {
	return {
		id: message.id,
		from: String(message.sender),
		to: String(message.recipient),
		text: message.text,
		// JSON would turn the Date into this same string anyway; doing it here
		// makes the type match what the browser actually receives
		createdAt: message.createdAt.toISOString()
	};
}
