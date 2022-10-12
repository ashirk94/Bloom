const moment = require('moment')

function formatMessage(user, text) {
	const formatted = {
		username: user.username,
		text,
		time: moment().format('hh:mm')
	}
	return formatted
}
const users = []

// Join user to chat
function userJoin(id, user) {
	const newUser = { id, username: user.username, room: user.room }

	users.push(newUser)

	return newUser
}

// Get current user
function getCurrentUser(id) {
	return users.find((user) => user.id === id)
}

// User leaves chat
function userLeave(id) {
	const index = users.findIndex((user) => user.id === id)

	if (index !== -1) {
		return users.splice(index, 1)[0]
	}
}

// Get room users
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
