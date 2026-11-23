// "Declaration merging": these blocks ADD fields to types that come from
// other packages. Nothing here runs; it only tells TypeScript about data
// that our own code attaches at runtime.

import type { Session, SessionData } from "express-session";
import type { UserDocument } from "../models/User.ts";

declare global {
	namespace Express {
		// Passport puts the logged in user on `req.user`. Its types leave the
		// User empty for us to fill in, so here it becomes our Mongoose user.
		// (config/passport.ts is what actually loads it.)
		interface User extends UserDocument {}
	}
}

declare module "express-session" {
	interface SessionData {
		// Passport stores the logged in user's id here
		passport?: { user?: string };
	}
}

declare module "http" {
	interface IncomingMessage {
		// socket.io connections run the session middleware too (see
		// server.ts), so their underlying request has a session
		session: Session & Partial<SessionData>;
	}
}
