// One small wrapper around fetch() that every page uses to talk to the
// server, so the JSON handling and error handling live in a single place.

export class ApiError extends Error {
	status: number;

	constructor(message: string, status: number) {
		super(message);
		this.status = status;
	}
}

interface ApiOptions {
	method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
	body?: unknown;
	formData?: FormData;
}

// api("/matches")                                  -> GET
// api("/me", { method: "PATCH", body: { bio } })   -> sends JSON
// api("/me/avatar", { method: "PUT", formData })   -> sends a file
//
// <T> is the type of the answer, for example api<MatchesResponse>("/matches").
// TypeScript can't check what the server REALLY sends (that happens at
// runtime), so T is a promise we make; shared/types.ts keeps it honest.
export async function api<T>(
	path: string,
	{ method = "GET", body, formData }: ApiOptions = {}
): Promise<T> {
	const headers: Record<string, string> = {};
	const options: RequestInit = { method, headers };

	if (formData) {
		// the browser sets the multipart Content-Type header itself
		options.body = formData;
	} else if (body !== undefined) {
		headers["Content-Type"] = "application/json";
		options.body = JSON.stringify(body);
	}

	let response: Response;
	try {
		response = await fetch(`/api${path}`, options);
	} catch {
		throw new ApiError("Can't reach the server. Check your connection.", 0);
	}

	// the server always answers with JSON; guard against anything else
	const data = await response.json().catch(() => ({}));

	if (!response.ok) {
		throw new ApiError(data.error || "Something went wrong.", response.status);
	}
	return data as T;
}

// `catch (err)` gives an `unknown`, because JavaScript can throw anything.
// This turns whatever was thrown into text that can be shown on the page.
export function errorMessage(err: unknown): string {
	return err instanceof Error ? err.message : "Something went wrong.";
}
