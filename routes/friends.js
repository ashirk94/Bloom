const router = require('express').Router()
const isAuth = require('../utilities/authMiddleware').isAuth
const connection = require('../config/database')
const User = connection.models.User

//compare interests and values count
function compare(a, b) {
    if (b.count < a.count) {
        return -1
    } else if (b.count > a.count) {
        return 1
    }
    return 0
}

//private messages
router.get('/chat/:username', isAuth, async (req, res) => {
	const username = req.params.username
	const friendArray = await User.find({ username: username })
	const friend = friendArray[0]

	//get mutual messages
	const messages = req.user.messages.filter(
		(message) =>
			(message.recipient === req.user.username &&
				message.sender === friend.username) ||
			(message.recipient === username &&
				message.sender === req.user.username)
	)

	res.render('main/chat', {
		friend: friend,
		user: req.user,
		messages: messages
	})
})

router.get('/join-chat', isAuth, async (req, res) => {
	const id = req.user._id
	//users who you have chats with
	const users = await User.find({
		$and: [
			{ _id: { $ne: id } },
			{
				$or: [
					{ 'messages.recipient': req.user.username },
					{ 'messages.sender': req.user.username }
				]
			}
		]
	})
	res.render('main/join-chat', { user: req.user, friends: users })
})

router.get('/meet', isAuth, async (req, res) => {
	const id = req.user._id

	//users who are not you and not in your connection requests
	const users = await User.find({
		$and: [{ _id: { $ne: id } }, { 'likes._id': { $ne: id } }]
	})

	//match based on values and interests
	const myInterests = req.user.interests
	const myValues = req.user.values

	for (const user of users) {
		user.count = 0
		for (const interest of user.interests) {
			if (myInterests.includes(interest)) {
				user.count++
			}
		}
		for (const value of user.values) {
			if (myValues.includes(value)) {
				user.count++
			}
		}
	}
	//sort and trim the array
	let matchingUsers = users.sort(compare)
	matchingUsers = matchingUsers.slice(0, 4)

	res.render('main/meet', { user: req.user, friends: matchingUsers })
})

router.get('/user/:username', isAuth, async (req, res) => {
	const username = req.params.username
	const friendArray = await User.find({ username: username })
	const friend = friendArray[0]

	res.render('main/friend', { friend: friend, user: req.user })
})

router.get('/connections', isAuth, async (req, res) => {
	//users who have liked you
	const users = await User.find({ _id: { $in: req.user.likes } })
	res.render('main/connections', { user: req.user, friends: users })
})

module.exports = router
