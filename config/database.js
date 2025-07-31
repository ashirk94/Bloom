const mongoose = require("mongoose");
require("dotenv").config();

const conn = process.env.DB_STRING;

mongoose.set("strictQuery", false);

mongoose.connect(conn, {
	useNewUrlParser: true,
	useUnifiedTopology: true
});

const UserSchema = new mongoose.Schema({
	username: String,
	hash: String,
	profilePic: {
		data: Buffer,
		contentType: String
	},
	displayName: String,
	interest1: String,
	interest2: String,
	interest3: String,
	interest4: String,
	interest5: String,
	value1: String,
	value2: String,
	value3: String,
	value4: String,
	value5: String,
	bio: String,
	likes: [
		{
			_id: { type: [mongoose.Schema.Types.ObjectId], ref: "User" },
			username: { type: String, ref: "User" }
		}
	],
	messages: [
		{
			username: String,
			text: String,
			time: String,
			sender: String,
			recipient: String
		}
	],
	admin: Boolean,
	socketId: String,
	location: {
		type: {
			type: String,
			enum: ['Point'],
			default: 'Point'
		},
		coordinates: {
			type: [Number], // [longitude, latitude]
			default: [0, 0]
		}
	},
	confirmed: Boolean,
	hasUnreadMessage: Boolean,
	githubId: String
});

const User = mongoose.model("User", UserSchema);

module.exports = {
	User
};
