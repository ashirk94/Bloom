const router = require('express').Router()
const isAuth = require('../utilities/authMiddleware').isAuth
const connection = require('../config/database')
const User = connection.models.User


router.get('/chat', isAuth, (req, res) => {
	res.render('chat', { user: req.user })
})

router.get('/meet', isAuth, async (req, res) => {
	const id = req.user._id
	const users = await User.find({ _id: { $ne: id } }).limit(5)
	res.render('meet', { user: req.user, friends: users })
})

router.get('/user/:id', isAuth, async (req, res) => {
    const id = req.params.id.toString()
    const friend = await User.findById(id)
    res.render('friend', {friend: friend, user: req.user})
})

module.exports = router