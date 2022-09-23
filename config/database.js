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
	salt: String,
	profilePic: String,
    firstName: String,
    lastName: String,
    interests: [String],
    values: [String],
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
			_id: { type: [Schema.Types.ObjectId], ref: 'User' },
			username: { type: String, ref: 'User' }
		},
		String
	],
    admin: Boolean
})

const User = connection.model('User', UserSchema)

function setAdmin() {
    
}
module.exports = connection
