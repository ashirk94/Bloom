import { Router } from "express";
import User from "../models/User.ts";
import { currentUser, isAuth } from "../utilities/authMiddleware.ts";
import { HttpError } from "../utilities/errors.ts";
import { privateUser } from "../utilities/serialize.ts";
import { upload, detectImageType } from "../utilities/upload.ts";
import * as options from "../config/options.ts";
import { cleanRankedList, parseLocation, cleanText } from "../utilities/validation.ts";
import type { OptionsResponse, UserResponse } from "../shared/types.ts";

const router = Router();

// The lists of interests and values to choose from (public)
router.get("/options", (req, res) => {
	res.json({
		maxRanked: options.MAX_RANKED,
		interests: options.INTERESTS,
		values: options.VALUES
	} satisfies OptionsResponse);
});

// Update my profile. PATCH means "change only the fields I sent", so one
// route replaces the old /display-name, /bio, /interests, /values and
// /update-location routes.
router.patch("/me", isAuth, async (req, res) => {
	const user = currentUser(req);
	const body = req.body;

	if (body.displayName !== undefined) {
		const displayName = cleanText(body.displayName, 50);
		if (!displayName) throw new HttpError(400, "Display name can't be empty.");
		user.displayName = displayName;
	}
	if (body.bio !== undefined) {
		user.bio = cleanText(body.bio, 500);
	}
	if (body.interests !== undefined) {
		user.interests = cleanRankedList(body.interests, options.INTEREST_NAMES);
	}
	if (body.values !== undefined) {
		user.values = cleanRankedList(body.values, options.VALUE_NAMES);
	}
	if (body.lat !== undefined || body.lon !== undefined) {
		const location = parseLocation(body.lat, body.lon);
		if (!location) throw new HttpError(400, "That location isn't valid.");
		user.location = location;
	}

	await user.save();
	res.json({ user: privateUser(user) } satisfies UserResponse);
});

// Replace my profile picture. The form field must be called "image".
router.put("/me/avatar", isAuth, upload.single("image"), async (req, res) => {
	if (!req.file) throw new HttpError(400, "Please choose an image.");
	const me = currentUser(req);

	const contentType = detectImageType(req.file.buffer);
	if (!contentType) {
		throw new HttpError(400, "Only .png and .jpg images are allowed.");
	}

	// updateOne because req.user was loaded without its picture
	await User.updateOne(
		{ _id: me._id },
		{ profilePic: { data: req.file.buffer, contentType } }
	);

	const user = await User.findById(me._id).select("-profilePic");
	// the account could have been deleted by an admin a moment ago
	if (!user) throw new HttpError(404, "User not found.");
	res.json({ user: privateUser(user) } satisfies UserResponse);
});

export default router;
