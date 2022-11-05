const router = require('express').Router()
const isAdmin = require('../utilities/authMiddleware').isAdmin
const isAuth = require('../utilities/authMiddleware').isAuth
const connection = require('../config/database')
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

module.exports = router