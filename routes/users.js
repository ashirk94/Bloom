const router = require('express').Router()
const isAdmin = require('../utilities/authMiddleware').isAdmin
const isAuth = require('../utilities/authMiddleware').isAuth
const connection = require('../config/database')
const jwt = require('jsonwebtoken')
const User = connection.models.User

//delete by id
router.post('/users/:id', isAdmin, async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id)
        res.redirect("/admin")
    } catch (err) {
        console.error(err)
    }
})

//adds a like from a user to another
router.post('/like/:id', isAuth, async (req, res) => {
	const user = await User.findById(req.params.id)

	//stops user from liking the same one multiple times
	if (!user.likes.some((x) => x.username === req.user.username)) {
		user.likes.push(req.user)
		await user.save()
	}
})

//email verification
router.get('/verify/:token', isAuth, async (req, res) => {
    console.log(req.user)
    const {token} = req.params
    try {
        jwt.verify(token, 'ourSecretKey')
        await User.findOneAndUpdate({username: req.user.username}, { confirmed: true })
    } catch (error) {
        console.error(error)
        throw new Error('Error during verification')
    }
    res.redirect('/')
})

module.exports = router