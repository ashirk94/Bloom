const mongoose = require('mongoose')
const Schema = mongoose.Schema
require('dotenv').config()

const conn = process.env.DB_STRING

const connection = mongoose.createConnection(conn, {
	useNewUrlParser: true,
	useUnifiedTopology: true
})

const UserSchema = new Schema({
	username: String,
	hash: String,
	profilePic: {
        data: Buffer,
        contentType: String
    },
    firstName: String,
    lastName: String,
    interests: [String],
    values: [String],
    bio: String,
	matches: [
		{
			_id: { type: [Schema.Types.ObjectId], ref: 'User' },
			username: { type: String, ref: 'User' }
		}
	],
	likes: [
		{
			_id: { type: [Schema.Types.ObjectId], ref: 'User' },
			username: { type: String, ref: 'User' }
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
        lat: Number,
        lon: Number
    }
})

const User = connection.model('User', UserSchema)

module.exports = connection
