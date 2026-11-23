import { Router, type Request } from "express";
import passport from "passport";
import User, { type UserDocument } from "../models/User.ts";
import { genPassword } from "../utilities/passwordUtils.ts";
import { HttpError } from "../utilities/errors.ts";
import { privateUser } from "../utilities/serialize.ts";
import { INTEREST_NAMES, VALUE_NAMES } from "../config/options.ts";
import {
	isValidEmail,
	passwordProblem,
	cleanRankedList,
	parseLocation,
	cleanText
} from "../utilities/validation.ts";
import { createRateLimiter } from "../utilities/rateLimit.ts";
import type { MeResponse, OkResponse, UserResponse } from "../shared/types.ts";
import type { ChatServer } from "../server.ts";

const router = Router();

// per IP address: 20 login attempts per 15 minutes, 10 sign-ups per hour
const loginLimiter = createRateLimiter({ windowMs: 15 * 60 * 1000, max: 20 });
const registerLimiter = createRateLimiter({ windowMs: 60 * 60 * 1000, max: 10 });

// req.login uses a callback; wrapping it in a Promise lets us `await` it
function logIn(req: Request, user: UserDocument): Promise<void> {
	return new Promise((resolve, reject) => {
		req.login(user, (err) => (err ? reject(err) : resolve()));
	});
}

// Who am I? The React app calls this once when it loads.
router.get("/auth/me", (req, res) => {
	res.json({
		user: req.isAuthenticated() ? privateUser(req.user) : null
	} satisfies MeResponse);
});

router.post("/auth/register", registerLimiter.middleware, async (req, res) => {
	const { email, password } = req.body;

	if (!isValidEmail(email)) {
		throw new HttpError(400, "Please enter a valid email address.");
	}
	const problem = passwordProblem(password);
	if (problem) throw new HttpError(400, problem);

	const displayName = cleanText(req.body.displayName, 50);
	if (!displayName) throw new HttpError(400, "Please enter a display name.");

	const username = email.trim().toLowerCase();
	if (await User.exists({ username })) {
		throw new HttpError(409, "An account with that email already exists.");
	}

	// Only copy the fields we expect. Passing req.body straight to the model
	// would let someone register with { "admin": true }.
	const user = new User({
		username,
		hash: await genPassword(password),
		displayName,
		bio: cleanText(req.body.bio, 500),
		interests: cleanRankedList(req.body.interests, INTEREST_NAMES),
		values: cleanRankedList(req.body.values, VALUE_NAMES)
	});
	const location = parseLocation(req.body.lat, req.body.lon);
	if (location) user.location = location;

	try {
		await user.save();
	} catch (err) {
		// 11000 = duplicate key: two sign-ups with the same email raced each
		// other and the unique index stopped the second one
		if ((err as { code?: number }).code === 11000) {
			throw new HttpError(409, "An account with that email already exists.");
		}
		throw err;
	}

	await logIn(req, user);
	res.status(201).json({ user: privateUser(user) } satisfies UserResponse);
});

router.post("/auth/login", loginLimiter.middleware, (req, res, next) => {
	// a custom callback so a failed login answers with JSON instead of
	// redirecting to another page
	passport.authenticate(
		"local",
		async (
			err: unknown,
			user: UserDocument | false,
			info: { message?: string } | undefined
		) => {
			try {
				if (err) throw err;
				if (!user) {
					throw new HttpError(401, info?.message || "Login failed.");
				}
				await logIn(req, user);
				res.json({ user: privateUser(user) } satisfies UserResponse);
			} catch (error) {
				next(error);
			}
		}
	)(req, res, next);
});

// Logging out changes state, so it is a POST. As a GET link it could be
// triggered by any page that embeds <img src="/logout">.
router.post("/auth/logout", (req, res, next) => {
	// remember the session id now: logging out replaces the session
	const sessionId = req.sessionID;
	req.logout((err) => {
		if (err) return next(err);
		// close this session's live chat connections, which were opened while
		// logged in and would otherwise keep sending messages as this user
		(req.app.get("io") as ChatServer | undefined)
			?.in(`session:${sessionId}`)
			.disconnectSockets(true);
		req.session.destroy(() => {
			res.clearCookie("connect.sid");
			res.json({ ok: true } satisfies OkResponse);
		});
	});
});

export default router;
