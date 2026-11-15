const { HttpError } = require("./errors");

// Middleware for routes that need a logged in user.
// The API answers with a status code and the React app decides what to show
// (for a 401 it sends the visitor to the login page).
function isAuth(req, res, next) {
	if (req.isAuthenticated()) return next();
	next(new HttpError(401, "Please sign in."));
}

function isAdmin(req, res, next) {
	if (!req.isAuthenticated()) return next(new HttpError(401, "Please sign in."));
	if (!req.user.admin) return next(new HttpError(403, "Admins only."));
	next();
}

module.exports = { isAuth, isAdmin };
