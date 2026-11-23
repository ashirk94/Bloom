import bcrypt from "bcrypt";
import type { PassportStatic } from "passport";
import { Strategy as LocalStrategy, type VerifyFunction } from "passport-local";
import User from "../models/User.ts";
import { validPassword } from "../utilities/passwordUtils.ts";

// The same message for "no such account" and "wrong password", so the login
// form can't be used to discover which email addresses have accounts.
const LOGIN_FAILED = "Incorrect email or password.";

// Checking a real password with bcrypt takes ~100 ms on purpose. If unknown
// emails answered instantly, the response TIME would still reveal which
// emails have accounts, so they are checked against this throwaway hash.
const DUMMY_HASH = bcrypt.hashSync("not-a-real-password", 10);

export default function passportConfig(passport: PassportStatic): void {
	const fields = { usernameField: "email", passwordField: "password" };

	// passport-local's types say email and password are strings, but they come
	// straight from the request body, so we still check at runtime
	const verify: VerifyFunction = async (email: unknown, password: unknown, done) => {
		try {
			// a JSON body could send an object such as { "$ne": "" } instead of
			// a string, which MongoDB would treat as a query operator
			if (typeof email !== "string" || typeof password !== "string") {
				return done(null, false, { message: LOGIN_FAILED });
			}

			const user = await User.findOne({
				username: email.trim().toLowerCase()
			});
			const isValid = await validPassword(password, user?.hash || DUMMY_HASH);
			if (!user || !user.hash) {
				return done(null, false, { message: LOGIN_FAILED });
			}
			if (!isValid) {
				return done(null, false, { message: LOGIN_FAILED });
			}
			return done(null, user);
		} catch (err) {
			return done(err);
		}
	};

	passport.use(new LocalStrategy(fields, verify));

	// only the user's id is kept in the session cookie's session record
	passport.serializeUser((user, done) => done(null, user.id));

	// runs on every request from a logged in user, so skip the profile
	// picture: it can be megabytes and is served by its own route instead
	passport.deserializeUser(async (userId: string, done) => {
		try {
			const user = await User.findById(userId).select("-profilePic");
			done(null, user || false);
		} catch (err) {
			done(err);
		}
	});
}
