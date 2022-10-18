const router = require('express').Router()
const isAuth = require('../utilities/authMiddleware').isAuth
const connection = require('../config/database')
const User = connection.models.User


router.get('/chat', isAuth, (req, res) => {
	res.render('chat', { user: req.user })
})
//private messages
router.get('/chat/:username', isAuth, async (req, res) => {
	const username = req.params.username
    const friendArray = await User.find({username: username})
    const friend = friendArray[0]

    //get mutual messages
    const messages = friend.messages.filter(message => message.username === req.user.username || message.username === username)

    res.render('chat', {friend: friend, user: req.user, messages: messages})
})

router.get('/join-chat', isAuth, (req, res) => {
	res.render('join-chat', { user: req.user })
})

router.get('/meet', isAuth, async (req, res) => {
	const id = req.user._id
	const users = await User.find({$and: [{ _id: { $ne: id }}, {'likes._id': { $ne: id }}]}).limit(4)
	res.render('meet', { user: req.user, friends: users })
})

router.get('/user/:username', isAuth, async (req, res) => {
    const username = req.params.username
    const friendArray = await User.find({username: username})
    const friend = friendArray[0]
    
    res.render('friend', {friend: friend, user: req.user})
})

module.exports = router