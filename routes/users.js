const router = require('express').Router()
const isAdmin = require('../utilities/authMiddleware').isAdmin
const isAuth = require('../utilities/authMiddleware').isAuth
const isVerified = require('../utilities/authMiddleware').isVerified
const connection = require('../config/database')
const jwt = require('jsonwebtoken')
const User = connection.models.User
const verify = require('../utilities/emailVerification').verify

//get unread message flag
router.get('/users/:id', async (req, res) => {
	try {
		const user = await User.findById(req.params.id)

		const userData = user.toJSON()
		if (user) {
			res.json(userData)
		} else {
			res.status(404).json({ message: 'User not found' })
		}
	} catch (err) {
		console.error(err)
		res.status(500).json({ message: 'Internal server error' })
	}
})

//alter user
router.post('/users/:id', async (req, res) => {
	try {
		const userId = req.params.id
		if (req.body = 'message-seen') { //TODO needs to be an object?
            await User.findByIdAndUpdate(userId, { hasUnreadMessage })

            res.status(200).json({ message: 'User updated successfully' })
        } else {
            res.status(200).json({ message: 'No update applied' })
        }
	} catch (err) {
		console.error(err)
		res.status(500).json({ message: 'Internal server error' })
	}
})

//delete by id
router.post('/delete-users/:id', isAdmin, async (req, res) => {
	try {
		await User.findByIdAndDelete(req.params.id)
		res.redirect('/admin')
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
	const { token } = req.params
	try {
		const decoded = jwt.verify(token, process.env.JWT_SECRET)

		if (decoded.username != req.user.username) {
			res.redirect('/wrong-user')
		} else {
			await User.findOneAndUpdate(
				{ username: req.user.username },
				{ confirmed: true }
			)
			res.redirect('/verified')
		}
	} catch (error) {
		res.render('error', { error: error.message })
	}
})

router.get('/verified', isAuth, isVerified, (req, res) => {
	res.render('auth/verified', { user: req.user })
})

router.get('/unverified', isAuth, (req, res) => {
	res.render('auth/unverified', { user: req.user })
})

router.get('/wrong-user', isAuth, (req, res) => {
	res.render('auth/wrong-user', { user: req.user })
})

router.get('/verification-sent', isAuth, (req, res) => {
	res.render('auth/verification-sent', { user: req.user })
})

router.post('/unverified', isAuth, async (req, res) => {
	await verify(req.user)
	res.redirect('/verification-sent')
})

module.exports = router
