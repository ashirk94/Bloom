import mongoose, { type HydratedDocumentFromSchema } from "mongoose";

const UserSchema = new mongoose.Schema(
	{
		// the login name is the user's email address. It is private: it is never
		// sent to other users (see utilities/serialize.ts)
		username: {
			type: String,
			required: true,
			unique: true,
			lowercase: true,
			trim: true
		},
		hash: { type: String, required: true },
		displayName: { type: String, default: "", trim: true, maxlength: 50 },
		bio: { type: String, default: "", trim: true, maxlength: 500 },

		// ranked lists, most important first. These replace the old
		// interest1..interest5 / value1..value5 fields: an array can be looped
		// over, so the code no longer needs one line per rank.
		interests: { type: [String], default: [] },
		values: { type: [String], default: [] },

		profilePic: {
			data: Buffer,
			contentType: String
		},

		// ids of the users who sent THIS user a friend request ("liked" them).
		// Two users are connected when each is in the other's likedBy list.
		likedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

		admin: { type: Boolean, default: false },

		// GeoJSON point, coordinates are [longitude, latitude].
		// Left empty until the user shares their location.
		location: {
			type: { type: String, enum: ["Point"] },
			coordinates: { type: [Number], default: undefined }
		}
	},
	{
		// adds createdAt and updatedAt automatically
		timestamps: true,
		// Declaring methods here (instead of `UserSchema.methods.x = ...`)
		// lets TypeScript see them on every user document
		methods: {
			// [longitude, latitude] or null. [0, 0] was the old "no location"
			// placeholder.
			getCoordinates(): [number, number] | null {
				const coords = this.location?.coordinates;
				if (!Array.isArray(coords) || coords.length !== 2) return null;
				const [lon, lat] = coords as [number, number];
				if (lon === 0 && lat === 0) return null;
				return [lon, lat];
			}
		}
	}
);

const User = mongoose.model("User", UserSchema);

// The type of a user loaded from the database, worked out by Mongoose from
// the schema above: every field, plus _id, id, save(), getCoordinates()...
export type UserDocument = HydratedDocumentFromSchema<typeof UserSchema>;

export default User;
