import type { Relationship } from "../shared/types.ts";

// Friend requests are stored on the user who RECEIVED them:
// `user.likedBy` lists the ids of people who asked to be friends with `user`.

// Ids can be ObjectIds (from the database) or strings (from a URL), so they
// are always compared as strings. `unknown` because only String() is used.
type Id = unknown;

// The only fields these functions need. Asking for this small shape instead
// of a full UserDocument means the tests can pass plain objects.
export interface Likeable {
	_id: Id;
	likedBy?: Id[];
}

// true if `likerId` has sent `likedUser` a request
export function hasLiked(likedUser: Likeable | null | undefined, likerId: Id): boolean {
	if (!likedUser || !likerId) return false;
	return (likedUser.likedBy || []).some((id) => String(id) === String(likerId));
}

// true if both users have liked each other (an accepted request)
export function areConnected(
	userA: Likeable | null | undefined,
	userB: Likeable | null | undefined
): boolean {
	if (!userA || !userB) return false;
	if (String(userA._id) === String(userB._id)) return false;
	return hasLiked(userA, userB._id) && hasLiked(userB, userA._id);
}

// how `other` relates to `me`, used to pick which button to show
export function relationship(me: Likeable, other: Likeable): Relationship {
	if (String(me._id) === String(other._id)) return "self";
	const iLikedThem = hasLiked(other, me._id);
	const theyLikedMe = hasLiked(me, other._id);
	if (iLikedThem && theyLikedMe) return "connected";
	if (iLikedThem) return "request-sent";
	if (theyLikedMe) return "request-received";
	return "none";
}
