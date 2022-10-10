const router = require('express').Router()
const isAuth = require('../utilities/authMiddleware').isAuth
const connection = require('../config/database')
const User = connection.models.User

//sends a message from a user to another
router.post('/message/:id', isAuth, async (req, res) => {
	const user = await User.findById(req.params.id)

	//stops user from liking the same one multiple times
	if (!user.likes.some((x) => x.username === req.user.username)) {
		user.likes.push(req.user)
		await user.save()
	}
})

//gets messages
router.get('/message/:id', isAuth, async (req, res) => {
	try {
		const user = await User.findById(req.params.id)
		const messages = { messages: user.messages }
		res.json(messages)
	} catch (err) {
		console.error(err)
	}
})
module.exports = router
