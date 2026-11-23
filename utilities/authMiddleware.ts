import type { NextFunction, Request, Response } from "express";
import type { UserDocument } from "../models/User.ts";
import { HttpError } from "./errors.ts";

// Middleware for routes that need a logged in user.
// The API answers with a status code and the React app decides what to show
// (for a 401 it sends the visitor to the login page).
export function isAuth(req: Request, res: Response, next: NextFunction): void {
	if (req.isAuthenticated()) return next();
	next(new HttpError(401, "Please sign in."));
}

export function isAdmin(req: Request, res: Response, next: NextFunction): void {
	if (!req.isAuthenticated()) return next(new HttpError(401, "Please sign in."));
	if (!req.user.admin) return next(new HttpError(403, "Admins only."));
	next();
}

// The logged in user, for routes behind isAuth/isAdmin.
// The middleware guarantees `req.user` exists, but TypeScript can't follow
// that from one function to the next, so `req.user` is typed as "maybe
// undefined". This checks once and hands back a definite user.
export function currentUser(req: Request): UserDocument {
	if (!req.user) throw new HttpError(401, "Please sign in.");
	return req.user;
}
