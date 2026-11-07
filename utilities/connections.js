// Likes are stored on the user who was liked: `user.likes` lists the
// people who have sent `user` a connection request.

// true if `likerId` has liked `likedUser`
function hasLiked(likedUser, likerId) {
	if (!likedUser || !likerId) return false;
	return (likedUser.likes || []).some(
		(like) => String(like._id) === String(likerId)
	);
}

// true if both users have liked each other (an accepted request)
function areConnected(userA, userB) {
	if (!userA || !userB) return false;
	if (String(userA._id) === String(userB._id)) return false;
	return hasLiked(userA, userB._id) && hasLiked(userB, userA._id);
}

module.exports = {
	hasLiked,
	areConnected
};
