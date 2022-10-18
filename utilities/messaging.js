const moment = require('moment')
const connection = require('../config/database')
const User = connection.models.User

function formatMessage(user, text) {
	const formatted = {
		username: user,
		text,
		time: moment().format('h:mm A')
	}
	return formatted
}
//other functions may not be necessary, test storage first
const users = []

function userJoin(id) {   
	const newUser = User.findById(id)

	users.push(newUser)

	return newUser
}

function getCurrentUser(id) {
	return users.find((user) => user.id === id)
}

function userLeave(id) {
	const index = users.findIndex((user) => user.id === id)

	if (index !== -1) {
		return users.splice(index, 1)[0]
	}
}

function getRoomUsers(room) {
	return users.filter((user) => user.room === room)
}

function storeMessage(sender, message) {

}

module.exports = {
	userJoin,
	getCurrentUser,
	userLeave,
	getRoomUsers,
	formatMessage,
    storeMessage
}
