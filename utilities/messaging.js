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

async function storeMessage(message, sender, recipient) {
    const user1Arr = await User.find({ socketId: sender}) 
    const user2Arr = await User.find({ socketId: recipient})
    const user1 = user1Arr[0]
    const user2 = user2Arr[0]

    if (!user1 || !user2) {
        console.error('missing user')
        return
    }

    const fullMsg = message

    fullMsg.sender = user1.username
    fullMsg.recipient = user2.username

    user1.messages.push(fullMsg)
    user2.messages.push(fullMsg)
    
    //console.log(user1.username, user1.messages[1], user2.username, user2.messages[1])

    await user1.save()
    await user2.save()
}

module.exports = {
	userJoin,
	getCurrentUser,
	userLeave,
	getRoomUsers,
	formatMessage,
    storeMessage
}
