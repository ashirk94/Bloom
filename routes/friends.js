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

//distance calculation formula (efficient)
function distance(lat1, lon1, lat2, lon2) {
	let p = 0.017453292519943295 // Math.PI / 180
	let c = Math.cos
	let a =
		0.5 -
		c((lat2 - lat1) * p) / 2 +
		(c(lat1 * p) * c(lat2 * p) * (1 - c((lon2 - lon1) * p))) / 2

	return 12742 * Math.asin(Math.sqrt(a)) // 2 * R; R = 6371 km
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
	const id = req.user.id

	//users who are not you and not in your connection requests
	let users = await User.find({
		$and: [{ _id: { $ne: id } }, { 'likes._id': { $ne: id } }]
	})

	//filter users by distance
	users = users.filter(user => {
		console.log(user.location.lat, req.user.location.lat)
	    const dist = distance(user.location.lat, user.location.lon, req.user.location.lat, req.user.location.lon)
	    console.log(dist)
	    if (dist <= 50) { return true } else { return false }
	}) //closer than 50km

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
