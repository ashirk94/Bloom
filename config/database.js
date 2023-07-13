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
    },
    confirmed: Boolean
})

const User = connection.model('User', UserSchema)

module.exports = connection
