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
	    const dist = distance(user.location.lat, user.location.lon, req.user.location.lat, req.user.location.lon)
	    if (dist <= 50) { return true } else { return false }
	}) //closer than 50mi

	//match based on values and interests
	const interest1 = req.user.interest1 || null
    const interest2 = req.user.interest2 || null
    const interest3 = req.user.interest3 || null
    const interest4 = req.user.interest4 || null
    const interest5 = req.user.interest5 || null

	const value1 = req.user.value1 || null
    const value2 = req.user.value2 || null
    const value3 = req.user.value3 || null
    const value4 = req.user.value4 || null
    const value5 = req.user.value5 || null

    //pass these in
    let matchingUsers = []

	//new match algorithm
    if (interest1 && value1) {
        //check for each matching interest and value, compare their rankings
        //calculate some total compatibility to compare to other users
    }

	res.render('main/meet', { user: req.user, friends: users })
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
    users = users.filter(user => user.likes.find(like => like.id === req.user.id))
	res.render('main/connections', { user: req.user, friends: users })
})

router.get('/requests', isAuth, async (req, res) => {
	//users who have liked you
	let users = await User.find({ _id: { $in: req.user.likes } })
    users = users.filter(user => !user.likes.find(like => like.id === req.user.id))
	res.render('main/requests', { user: req.user, friends: users })
})
module.exports = router
