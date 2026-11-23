import type { IncomingMessage } from "http";
import type { Request, Response } from "express";
import { describe, expect, test, vi } from "vitest";
import {
	isSameOrigin,
	requireSameOrigin,
	securityHeaders
} from "../utilities/securityHeaders.ts";

// Just enough of a request for these functions. `as` says "trust me, treat
// this small object as the real type"; fine in tests, risky in app code.
function request(headers: Record<string, string>, method = "POST") {
	return { headers, method } as IncomingMessage & Request;
}

// A fake response that remembers what was sent. status() returns the same
// object so `res.status(403).json(...)` works like the real thing.
function fakeResponse() {
	const res = {
		status: vi.fn(() => res),
		json: vi.fn(() => res),
		set: vi.fn((_headers: Record<string, string>) => res)
	};
	return res;
}

describe("isSameOrigin", () => {
	test("allows requests from this site", () => {
		expect(isSameOrigin(request({ origin: "https://bloom.app", host: "bloom.app" }))).toBe(true);
	});

	test("allows requests with no Origin header (not from a web page)", () => {
		expect(isSameOrigin(request({ host: "bloom.app" }))).toBe(true);
	});

	test("blocks other sites, including look-alikes and subdomains", () => {
		const host = "bloom.app";
		expect(isSameOrigin(request({ origin: "https://evil.example", host }))).toBe(false);
		expect(isSameOrigin(request({ origin: "https://bloom.app.evil.example", host }))).toBe(false);
		expect(isSameOrigin(request({ origin: "https://chat.bloom.app", host }))).toBe(false);
	});

	test("blocks a malformed Origin instead of crashing", () => {
		expect(isSameOrigin(request({ origin: "not a url", host: "bloom.app" }))).toBe(false);
	});
});

describe("requireSameOrigin", () => {
	test("lets same-site changes through", () => {
		const next = vi.fn();
		const res = fakeResponse();
		requireSameOrigin(
			request({ origin: "https://bloom.app", host: "bloom.app" }),
			res as unknown as Response,
			next
		);
		expect(next).toHaveBeenCalledOnce();
		expect(res.status).not.toHaveBeenCalled();
	});

	test("answers 403 to a cross-site POST", () => {
		const next = vi.fn();
		const res = fakeResponse();
		requireSameOrigin(
			request({ origin: "https://evil.example", host: "bloom.app" }),
			res as unknown as Response,
			next
		);
		expect(next).not.toHaveBeenCalled();
		expect(res.status).toHaveBeenCalledWith(403);
	});

	test("lets cross-site GETs through (reading changes nothing)", () => {
		const next = vi.fn();
		requireSameOrigin(
			request({ origin: "https://evil.example", host: "bloom.app" }, "GET"),
			fakeResponse() as unknown as Response,
			next
		);
		expect(next).toHaveBeenCalledOnce();
	});
});

describe("securityHeaders", () => {
	test("sets a strict Content-Security-Policy and blocks framing", () => {
		const res = fakeResponse();
		const next = vi.fn();
		securityHeaders(request({}), res as unknown as Response, next);

		const headers = res.set.mock.calls[0]?.[0] ?? {};
		expect(headers["Content-Security-Policy"]).toContain("script-src 'self'");
		expect(headers["Content-Security-Policy"]).toContain("frame-ancestors 'none'");
		expect(headers["X-Frame-Options"]).toBe("DENY");
		expect(headers["X-Content-Type-Options"]).toBe("nosniff");
		expect(next).toHaveBeenCalledOnce();
	});
});
