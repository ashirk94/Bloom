// One-time data migration for accounts created before the React rewrite.
//
//   npm run migrate                 preview only, changes nothing
//   npm run migrate -- --apply      write the changes
//
// It only ADDS data in the new shape and never deletes the old fields, so it
// is safe to run more than once and the old data stays as a backup:
//
//   interest1..5 / value1..5      ->  interests[] / values[]
//   likes[{ _id: [id] }]          ->  likedBy[id]
//   messages[] inside each user   ->  one document per message in "messages"

import "dotenv/config";
import mongoose from "mongoose";
import { connectDatabase } from "../config/database.ts";
import User from "../models/User.ts";
import Message from "../models/Message.ts";

// The raw documents still have the OLD fields, which the current schema
// doesn't know about, so they are described here. Every field is optional
// because old accounts were created by several versions of the app.
interface OldMessage {
	sender?: string;
	recipient?: string;
	text?: string;
	time?: string;
}

interface RawUser {
	_id: mongoose.Types.ObjectId;
	username?: string;
	interests?: unknown;
	values?: unknown;
	likedBy?: unknown;
	likes?: { _id?: unknown }[];
	messages?: OldMessage[];
	location?: { coordinates?: unknown };
	// interest1..interest5, value1..value5
	[oldField: string]: unknown;
}

const apply = process.argv.includes("--apply");

// old fields aren't in the new schema, so read the raw documents
const rawUsers = () => User.collection;

function rankedFromFields(doc: RawUser, prefix: "interest" | "value"): string[] {
	const list: string[] = [];
	for (let rank = 1; rank <= 5; rank++) {
		const item = doc[`${prefix}${rank}`];
		if (typeof item === "string" && item.trim() && !list.includes(item)) {
			list.push(item.trim());
		}
	}
	return list;
}

function likerIds(doc: RawUser): string[] {
	const ids: string[] = [];
	for (const like of doc.likes || []) {
		// the old schema stored each like's _id as an array holding one id
		const id = Array.isArray(like?._id) ? like._id[0] : like?._id;
		if (id && mongoose.isValidObjectId(id)) ids.push(String(id));
	}
	return [...new Set(ids)];
}

async function migrate() {
	await connectDatabase();
	console.log(apply ? "Applying changes...\n" : "Preview (nothing is written)...\n");

	const docs = (await rawUsers()
		.find({}, { projection: { profilePic: 0 } })
		.toArray()) as RawUser[];
	const idByUsername = new Map(docs.map((doc) => [doc.username, doc._id]));

	let usersChanged = 0;
	// key -> message, to drop the duplicates
	const newMessages = new Map<
		string,
		{
			sender: mongoose.Types.ObjectId;
			recipient: mongoose.Types.ObjectId;
			text: string;
			readAt: Date;
			createdAt: Date;
			updatedAt: Date;
		}
	>();

	for (const doc of docs) {
		const update: Record<string, unknown> = {};

		if (!Array.isArray(doc.interests)) {
			update.interests = rankedFromFields(doc, "interest");
		}
		if (!Array.isArray(doc.values)) {
			update.values = rankedFromFields(doc, "value");
		}
		if (!Array.isArray(doc.likedBy)) {
			update.likedBy = likerIds(doc).map(
				(id) => new mongoose.Types.ObjectId(id)
			);
		}
		// [0, 0] meant "no location"
		const coords = doc.location?.coordinates;
		const hasPlaceholder =
			Array.isArray(coords) && coords[0] === 0 && coords[1] === 0;

		if (Object.keys(update).length > 0 || hasPlaceholder) {
			usersChanged++;
			if (apply) {
				const change: { $set?: typeof update; $unset?: { location: "" } } = {};
				if (Object.keys(update).length > 0) change.$set = update;
				if (hasPlaceholder) change.$unset = { location: "" };
				await rawUsers().updateOne({ _id: doc._id }, change);
			}
		}

		// every old message exists in both the sender's and the recipient's
		// document; the key makes sure it is only copied once
		for (const old of doc.messages || []) {
			const sender = idByUsername.get(old.sender);
			const recipient = idByUsername.get(old.recipient);
			if (!sender || !recipient || !old.text) continue;

			// old times were text in the sender's time zone, which wasn't
			// recorded, so the converted time can be a few hours off
			const parsed = new Date(old.time ?? "");
			const createdAt = isNaN(parsed.getTime()) ? new Date() : parsed;

			const key = `${sender}|${recipient}|${old.time}|${old.text}`;
			if (!newMessages.has(key)) {
				newMessages.set(key, {
					sender,
					recipient,
					text: old.text,
					readAt: createdAt,
					createdAt,
					updatedAt: createdAt
				});
			}
		}
	}

	const alreadyMigrated = await Message.estimatedDocumentCount();
	console.log(`Users to update:    ${usersChanged} of ${docs.length}`);
	console.log(`Messages to copy:   ${newMessages.size}`);

	if (alreadyMigrated > 0) {
		console.log(
			`\nThe messages collection already has ${alreadyMigrated} documents, ` +
				"so messages are NOT copied again."
		);
	} else if (apply && newMessages.size > 0) {
		// timestamps: false keeps the original createdAt instead of "now"
		await Message.insertMany([...newMessages.values()], {
			timestamps: false
		});
	}

	console.log(apply ? "\nDone." : "\nRun again with --apply to write these changes.");
	await mongoose.disconnect();
}

migrate().catch((err) => {
	console.error(err);
	process.exit(1);
});
