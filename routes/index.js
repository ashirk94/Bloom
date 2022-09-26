const router = require('express').Router()
const isAuth = require('../utilities/authMiddleware').isAuth
const isAdmin = require('../utilities/authMiddleware').isAdmin
const path = require('path')
const connection = require('../config/database')
const User = connection.models.User
const fs = require('fs')

const multer = require('multer')
const f = require('session-file-store')
const storage = multer.diskStorage({
	destination: (req, file, next) => {
		next(null, path.join(__dirname, '../public/uploads'))
	},
	filename: (req, file, next) => {
		next(null, Date.now() + path.extname(file.originalname))
	}
})
const upload = multer({
	storage: storage,
	limits: { fileSize: 5000000 }, //5mb
	fileFilter: (req, file, cb) => {
		if (
			file.mimetype == 'image/png' ||
			file.mimetype == 'image/jpg' ||
			file.mimetype == 'image/jpeg'
		) {
			cb(null, true)
		} else {
			cb(null, false)
			return cb(new Error('Only .png, .jpg and .jpeg format allowed!'))
		}
	}
})
//get routes

router.get('/', (req, res) => {
    const message = req.flash()
	res.render('index', { user: req.user })
})

router.get('/chat', isAuth, (req, res) => {
	res.render('chat', { user: req.user })
})

router.get('/meet', isAuth, async (req, res) => {
	const id = req.user.id
	const users = await User.find({ _id: { $ne: id } }).limit(5)
	res.render('meet', { user: req.user, friends: users })
})

router.get('/profile', isAuth, (req, res) => {
    const message = req.flash()
	res.render('profile', { user: req.user, message: message.success || message.error })
})

router.get('/interests', isAuth, (req, res) => {
    const message = req.flash()
	res.render('interests', { user: req.user, message: message.success || message.error })
})

router.get('/admin', isAdmin, (req, res) => {
	res.render('admin', { user: req.user })
})

//post

router.post('/profile', isAuth, upload.single('image'), async (req, res) => {
	//get current user data and replace some with relevant data from form
	try {
		let user = await User.findById(req.user._id)
		if (req.body.firstName != '') {
			user.firstName = req.body.firstName
		}
		if (req.body.lastName != '') {
			user.lastName = req.body.lastName
		}
		if (req.file != null) {
			user.profilePic.data = fs.readFileSync(
				path.join(__dirname + '/../public/uploads/' + req.file.filename)
			)
			user.profilePic.contentType =
				'image/' + path.extname(req.file.filename)
			fs.unlink(
				path.join(
					__dirname + '/../public/uploads/' + req.file.filename
				),
				(err) => {
					if (err) {
						throw err
					}
				}
			)
		}

		await user.save()

		req.flash('success', 'Profile updated!')
	} catch (err) {
		console.error(err)
		req.flash('error', err.message)
	}
	res.redirect('/profile')
})

router.post('/interests', isAuth, async (req, res) => {
	//replace interests and values
	try {
		let user = await User.findById(req.user._id)
		user.interests = req.body.interests
        user.values = req.body.values

        await user.save()
        req.flash('success', 'Profile updated!')
    } catch (err) {
        console.error(err)
		req.flash('error', err.message)
    }
    res.redirect('/interests')
})
module.exports = router
