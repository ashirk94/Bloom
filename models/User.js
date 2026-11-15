const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
	{
		// the login name is the user's email address. It is private: it is never
		// sent to other users (see utilities/serialize.js)
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
	// adds createdAt and updatedAt automatically
	{ timestamps: true }
);

// [longitude, latitude] or null. [0, 0] was the old "no location" placeholder.
UserSchema.methods.getCoordinates = function () {
	const coords = this.location?.coordinates;
	if (!Array.isArray(coords) || coords.length !== 2) return null;
	if (coords[0] === 0 && coords[1] === 0) return null;
	return coords;
};

module.exports = mongoose.model("User", UserSchema);
