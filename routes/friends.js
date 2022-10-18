const router = require('express').Router()
const isAuth = require('../utilities/authMiddleware').isAuth
const connection = require('../config/database')
const User = connection.models.User


//private messages
router.get('/chat/:username', isAuth, async (req, res) => {
	const username = req.params.username
    const friendArray = await User.find({username: username})
    const friend = friendArray[0]

    //get mutual messages
    const messages = req.user.messages.filter(message => (message.recipient === req.user.username && message.sender === friend.username) || (message.recipient === username && message.sender === req.user.username))

    res.render('main/chat', {friend: friend, user: req.user, messages: messages})
})

router.get('/join-chat', isAuth, async (req, res) => {
    const id = req.user._id
    //users who you have chats with
    const users = await User.find({$and: [{ _id: { $ne: id }},{$or: [{ 'messages.recipient': req.user.username },{ 'messages.sender': req.user.username }]}]})
	res.render('main/join-chat', { user: req.user, friends: users })
})

router.get('/meet', isAuth, async (req, res) => {
	const id = req.user._id
    //users who are not you and not in your connection requests
	const users = await User.find({$and: [{ _id: { $ne: id }}, {'likes._id': { $ne: id }}]}).limit(4)
	res.render('main/meet', { user: req.user, friends: users })
})

router.get('/user/:username', isAuth, async (req, res) => {
    const username = req.params.username
    const friendArray = await User.find({username: username})
    const friend = friendArray[0]
    
    res.render('main/friend', {friend: friend, user: req.user})
})

router.get('/connections', isAuth, async (req, res) => {
    //users who have liked you
	const users = await User.find({ _id: { $in : req.user.likes }})
	res.render('main/connections', { user: req.user, friends: users })
})

module.exports = router