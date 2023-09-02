const router = require('express').Router()
const isAuth = require('../utilities/authMiddleware').isAuth
const isVerified = require('../utilities/authMiddleware').isVerified
const connection = require('../config/database')
const User = connection.models.User

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
router.get('/chat/:username', isAuth, isVerified, async (req, res) => {
	const username = req.params.username
	const friendArray = await User.find({ username: username })
	const friend = friendArray[0]
    const user = await User.findById(req.user._id)
    user.hasUnreadMessage = false
    friend.hasUnreadMessage = false

    //reset messages
    //user.messages = []
    //friend.messages = []
    await user.save()
    await friend.save()

	//get mutual messages
	const messages = req.user.messages.filter(
		(message) =>
			(message.recipient === req.user.username &&
				message.sender === friend.username) ||
			(message.recipient === username &&
				message.sender === req.user.username)
	)
    //users with mutual likes
	let users = await User.find({ _id: { $in: req.user.likes } })
	users = users.filter((user) =>
		user.likes.find((like) => like.id === req.user.id)
	)

	res.render('main/chat', {
		friend: friend,
		user: req.user,
		messages: messages,
        others: users
	})
})

router.get('/join-chat', isAuth, isVerified, async (req, res) => {
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

router.get('/meet', isAuth, isVerified, async (req, res) => {
	const id = req.user.id

	//users who are not you and not in your connection requests
	let users = await User.find({
		$and: [{ _id: { $ne: id } }, { 'likes._id': { $ne: id } }]
	})

	//filter users by distance
	users = users.filter((user) => {
		const dist = distance(
			user.location.lat,
			user.location.lon,
			req.user.location.lat,
			req.user.location.lon
		)
		if (dist <= 50) {
			return true
		} else {
			return false
		}
	}) //closer than 50mi

	//match based on values and interests
	const interest1 = req.user.interest1 || null //3
	const interest2 = req.user.interest2 || null //2
	const interest3 = req.user.interest3 || null //1.6
	const interest4 = req.user.interest4 || null //1.2
	const interest5 = req.user.interest5 || null //1.0

	const value1 = req.user.value1 || null
	const value2 = req.user.value2 || null
	const value3 = req.user.value3 || null
	const value4 = req.user.value4 || null
	const value5 = req.user.value5 || null

	//new match algorithm
	if (interest1 || value1) {
		//check for each matching interest and value, compare their rankings
		//calculate some total compatibility to compare to other users
		for (const user of users) {
			user.matchScore = 0
			if (interest1) {
				if (interest1 === user.interest1) user.matchScore += 100
				if (interest1 === user.interest2) user.matchScore += 90
				if (interest1 === user.interest3) user.matchScore += 80
				if (interest1 === user.interest4) user.matchScore += 70
				if (interest1 === user.interest5) user.matchScore += 60
			}

			if (interest2) {
				if (interest2 === user.interest1) user.matchScore += 90
				if (interest2 === user.interest2) user.matchScore += 80
				if (interest2 === user.interest3) user.matchScore += 70
				if (interest2 === user.interest4) user.matchScore += 60
				if (interest2 === user.interest5) user.matchScore += 50
			}

			if (interest3) {
				if (interest3 === user.interest1) user.matchScore += 80
				if (interest3 === user.interest2) user.matchScore += 70
				if (interest3 === user.interest3) user.matchScore += 60
				if (interest3 === user.interest4) user.matchScore += 50
				if (interest3 === user.interest5) user.matchScore += 40
			}

			if (interest4) {
				if (interest4 === user.interest1) user.matchScore += 70
				if (interest4 === user.interest2) user.matchScore += 60
				if (interest4 === user.interest3) user.matchScore += 50
				if (interest4 === user.interest4) user.matchScore += 40
				if (interest4 === user.interest5) user.matchScore += 30
			}

			if (interest5) {
				if (interest5 === user.interest1) user.matchScore += 60
				if (interest5 === user.interest2) user.matchScore += 50
				if (interest5 === user.interest3) user.matchScore += 40
				if (interest5 === user.interest4) user.matchScore += 30
				if (interest5 === user.interest5) user.matchScore += 20
			}
            if (value1) {
				if (value1 === user.value1) user.matchScore += 100
				if (value1 === user.value2) user.matchScore += 90
				if (value1 === user.value3) user.matchScore += 80
				if (value1 === user.value4) user.matchScore += 70
				if (value1 === user.value5) user.matchScore += 60
			}

			if (value2) {
				if (value2 === user.value1) user.matchScore += 90
				if (value2 === user.value2) user.matchScore += 80
				if (value2 === user.value3) user.matchScore += 70
				if (value2 === user.value4) user.matchScore += 60
				if (value2 === user.value5) user.matchScore += 50
			}

			if (value3) {
				if (value3 === user.value1) user.matchScore += 80
				if (value3 === user.value2) user.matchScore += 70
				if (value3 === user.value3) user.matchScore += 60
				if (value3 === user.value4) user.matchScore += 50
				if (value3 === user.value5) user.matchScore += 40
			}

			if (value4) {
				if (value4 === user.value1) user.matchScore += 70
				if (value4 === user.value2) user.matchScore += 60
				if (value4 === user.value3) user.matchScore += 50
				if (value4 === user.value4) user.matchScore += 40
				if (value4 === user.value5) user.matchScore += 30
			}

			if (value5) {
				if (value5 === user.value1) user.matchScore += 60
				if (value5 === user.value2) user.matchScore += 50
				if (value5 === user.value3) user.matchScore += 40
				if (value5 === user.value4) user.matchScore += 30
				if (value5 === user.value5) user.matchScore += 20
			}
		}
        //slice needs testing
		const matchingUsers = users.sort((a, b) => {
			return b.matchScore - a.matchScore
		}).slice(0, 4)

		res.render('main/meet', { user: req.user, friends: matchingUsers })
	} else {
		res.render('main/meet', { user: req.user, friends: users })
	}
})

router.get('/user/:username', isAuth, async (req, res) => {
	const username = req.params.username
	const friendArray = await User.find({ username: username })
	const friend = friendArray[0]

	res.render('main/friend', { friend: friend, user: req.user })
})

router.get('/connections', isAuth, async (req, res) => {
	//users with mutual likes
	let users = await User.find({ _id: { $in: req.user.likes } })
	users = users.filter((user) =>
		user.likes.find((like) => like.id === req.user.id)
	)
	res.render('main/connections', { user: req.user, friends: users })
})

router.get('/requests', isAuth, async (req, res) => {
	//users who have liked you
	let users = await User.find({ _id: { $in: req.user.likes } })
	users = users.filter(
		(user) => !user.likes.find((like) => like.id === req.user.id)
	)
	res.render('main/requests', { user: req.user, friends: users })
})
module.exports = router
