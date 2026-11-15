// One small wrapper around fetch() that every page uses to talk to the
// server, so the JSON handling and error handling live in a single place.

export class ApiError extends Error {
	constructor(message, status) {
		super(message);
		this.status = status;
	}
}

// api("/matches")                                  -> GET
// api("/me", { method: "PATCH", body: { bio } })   -> sends JSON
// api("/me/avatar", { method: "PUT", formData })   -> sends a file
export async function api(path, { method = "GET", body, formData } = {}) {
	const options = { method, headers: {} };

	if (formData) {
		// the browser sets the multipart Content-Type header itself
		options.body = formData;
	} else if (body !== undefined) {
		options.headers["Content-Type"] = "application/json";
		options.body = JSON.stringify(body);
	}

	let response;
	try {
		response = await fetch(`/api${path}`, options);
	} catch (err) {
		throw new ApiError("Can't reach the server. Check your connection.", 0);
	}

	// the server always answers with JSON; guard against anything else
	const data = await response.json().catch(() => ({}));

	if (!response.ok) {
		throw new ApiError(data.error || "Something went wrong.", response.status);
	}
	return data;
}
