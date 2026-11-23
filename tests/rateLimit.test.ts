import type { NextFunction, Request, Response } from "express";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { createRateLimiter } from "../utilities/rateLimit.ts";
import { HttpError } from "../utilities/errors.ts";

// Fake timers replace the real clock, so a test can "wait" an hour
// instantly with vi.advanceTimersByTime instead of actually waiting
beforeEach(() => {
	vi.useFakeTimers();
});
afterEach(() => {
	vi.useRealTimers();
});

describe("createRateLimiter", () => {
	test("allows `max` attempts, then refuses", () => {
		const limiter = createRateLimiter({ windowMs: 1000, max: 3 });

		expect([1, 2, 3, 4].map(() => limiter.hit("1.2.3.4"))).toEqual([
			true,
			true,
			true,
			false
		]);
	});

	test("counts each key separately", () => {
		const limiter = createRateLimiter({ windowMs: 1000, max: 1 });

		expect(limiter.hit("alice")).toBe(true);
		expect(limiter.hit("bob")).toBe(true);
		expect(limiter.hit("alice")).toBe(false);
	});

	test("allows attempts again once the window has passed", () => {
		const limiter = createRateLimiter({ windowMs: 1000, max: 1 });

		limiter.hit("alice");
		expect(limiter.hit("alice")).toBe(false);

		vi.advanceTimersByTime(1000);
		expect(limiter.hit("alice")).toBe(true);
	});

	test("the middleware passes a 429 error on when the limit is reached", () => {
		const limiter = createRateLimiter({ windowMs: 1000, max: 1 });
		const req = { ip: "1.2.3.4" } as Request;
		const res = {} as Response;
		// a stand-in for Express's next(): remembers what it was called with
		const passed: unknown[] = [];
		const next: NextFunction = (err?: unknown) => {
			passed.push(err);
		};

		limiter.middleware(req, res, next);
		expect(passed).toEqual([undefined]); // allowed: next() with no error

		limiter.middleware(req, res, next);
		const error = passed[1];
		expect(error).toBeInstanceOf(HttpError);
		expect((error as HttpError).status).toBe(429);
	});
});
