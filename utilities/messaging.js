const moment = require('moment')

function formatMessage(user, text) {
	const formatted = {
		username: user.username,
		text,
		time: moment().format('h:mm A')
	}
	return formatted
}
const users = []

function userJoin(id, user) {
	const newUser = { id, username: user.username, room: user.room }

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

module.exports = {
	userJoin,
	getCurrentUser,
	userLeave,
	getRoomUsers,
	formatMessage
}
