const router = require('express').Router()
const isAuth = require('../utilities/authMiddleware').isAuth
const connection = require('../config/database')
const User = connection.models.User

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
