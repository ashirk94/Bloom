// Friend requests are stored on the user who RECEIVED them:
// `user.likedBy` lists the ids of people who asked to be friends with `user`.

// true if `likerId` has sent `likedUser` a request
function hasLiked(likedUser, likerId) {
	if (!likedUser || !likerId) return false;
	return (likedUser.likedBy || []).some(
		(id) => String(id) === String(likerId)
	);
}

// true if both users have liked each other (an accepted request)
function areConnected(userA, userB) {
	if (!userA || !userB) return false;
	if (String(userA._id) === String(userB._id)) return false;
	return hasLiked(userA, userB._id) && hasLiked(userB, userA._id);
}

// how `other` relates to `me`, used to pick which button to show
function relationship(me, other) {
	if (String(me._id) === String(other._id)) return "self";
	const iLikedThem = hasLiked(other, me._id);
	const theyLikedMe = hasLiked(me, other._id);
	if (iLikedThem && theyLikedMe) return "connected";
	if (iLikedThem) return "request-sent";
	if (theyLikedMe) return "request-received";
	return "none";
}

module.exports = { hasLiked, areConnected, relationship };
