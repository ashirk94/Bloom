const mongoose = require('mongoose')

require('dotenv').config()

const connection = mongoose.createConnection(process.env.DB_STRING, {
	useNewUrlParser: true,
	useUnifiedTopology: true
})


const UserSchema = new mongoose.Schema({
	username: String,
	hash: String,
	salt: String
})

const User = mongoose.model('User', UserSchema)

module.exports.connection = connection
module.exports.User = User
