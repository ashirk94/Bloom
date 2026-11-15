// An error that is safe to show to the user, with the HTTP status to send.
// Routes `throw new HttpError(404, "User not found")` and the error handler
// in server.js turns it into a JSON response. Any other kind of error is
// treated as a bug: it is logged and the user only sees a generic message.
class HttpError extends Error {
	constructor(status, message) {
		super(message);
		this.status = status;
	}
}

module.exports = { HttpError };
