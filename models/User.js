const mongoose = require('mongoose')
const Schema = mongoose.Schema

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
	]
})

module.exports = User = mongoose.model('User', UserSchema)
