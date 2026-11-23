import { Router } from "express";
import mongoose from "mongoose";
import User from "../models/User.ts";
import Message from "../models/Message.ts";
import { currentUser, isAdmin } from "../utilities/authMiddleware.ts";
import { HttpError } from "../utilities/errors.ts";
import { publicUser } from "../utilities/serialize.ts";
import type { AdminUsersResponse, OkResponse } from "../shared/types.ts";
import type { ChatServer } from "../server.ts";

const router = Router();

router.use("/admin", isAdmin);

router.get("/admin/users", async (req, res) => {
	const users = await User.find().select("-profilePic").sort({ createdAt: -1 });
	// `satisfies` checks this object against the type the React app expects,
	// without changing the object itself
	res.json({
		users: users.map((user) => ({
			...publicUser(user),
			email: user.username,
			admin: Boolean(user.admin)
		}))
	} satisfies AdminUsersResponse);
});

// DELETE is the HTTP method meant for removing things
router.delete("/admin/users/:id", async (req, res) => {
	// lower case, so "ABC..." can't get past the "is this me?" check below
	const id = String(req.params.id).toLowerCase();
	if (!mongoose.isValidObjectId(id)) throw new HttpError(404, "User not found.");
	if (id === currentUser(req).id) {
		throw new HttpError(400, "You can't delete your own account here.");
	}

	const deleted = await User.findByIdAndDelete(id);
	if (!deleted) throw new HttpError(404, "User not found.");

	// clean up everything that pointed at the deleted user, otherwise other
	// users keep "ghost" requests and conversations
	await Promise.all([
		User.updateMany({ likedBy: id }, { $pull: { likedBy: id } }),
		Message.deleteMany({ $or: [{ sender: id }, { recipient: id }] })
	]);

	// log the deleted user out of any open chat connections
	(req.app.get("io") as ChatServer | undefined)?.in(id).disconnectSockets(true);

	res.json({ ok: true } satisfies OkResponse);
});

export default router;
