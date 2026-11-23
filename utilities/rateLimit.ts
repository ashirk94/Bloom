import type { NextFunction, Request, Response } from "express";
import { HttpError } from "./errors.ts";

// A small in-memory rate limiter: each key (for example an IP address) may
// make `max` attempts per `windowMs`. Without it, anyone could try millions
// of passwords against an account ("brute forcing") or create accounts in
// a loop.
//
// The counts live in this process's memory, so they reset when the server
// restarts and aren't shared between several servers. That's fine for one
// small server; a bigger deployment would keep them in a shared store.
interface RateLimiterOptions {
	windowMs: number;
	max: number;
}

export interface RateLimiter {
	hit(key: string): boolean;
	middleware(req: Request, res: Response, next: NextFunction): void;
}

export function createRateLimiter({ windowMs, max }: RateLimiterOptions): RateLimiter {
	const hits = new Map<string, { count: number; resetAt: number }>();

	// forget expired entries now and then so the Map can't grow forever
	const cleanup = setInterval(() => {
		const now = Date.now();
		for (const [key, entry] of hits) {
			if (entry.resetAt <= now) hits.delete(key);
		}
	}, windowMs);
	cleanup.unref(); // don't keep the process (or a test run) alive

	// returns true if this attempt is allowed
	function hit(key: string): boolean {
		const now = Date.now();
		const entry = hits.get(key);
		if (!entry || entry.resetAt <= now) {
			hits.set(key, { count: 1, resetAt: now + windowMs });
			return true;
		}
		entry.count += 1;
		return entry.count <= max;
	}

	// Express middleware version, keyed by the visitor's IP address
	function middleware(req: Request, res: Response, next: NextFunction): void {
		// req.ip can be undefined if the connection already closed
		if (hit(req.ip ?? "unknown")) return next();
		next(new HttpError(429, "Too many attempts. Please wait a few minutes."));
	}

	return { hit, middleware };
}
