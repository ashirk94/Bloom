const router = require('express').Router()
const isAuth = require('../utilities/authMiddleware').isAuth
const isAdmin = require('../utilities/authMiddleware').isAdmin
const path = require('path')
const multer = require('multer')
const storage = multer.diskStorage({
    destination: (req, file, next) => {
        next(null, '../images')
    },
    filename: (req, file, next) => {
        console.log(file)
        next(null, Date.now() + path.extname(file.originalname))
    }
})
const upload = multer({storage: storage})
//get routes

router.get('/', (req, res) => {
	res.render('index', {user: req.user})
})

router.get('/chat', isAuth, (req, res) => {
    res.render('chat', {user: req.user})
})

router.get('/meet', isAuth, (req, res) => {
	res.render('meet', {user: req.user})
})

router.get('/profile', isAuth, (req, res) => {
	res.render('profile', {user: req.user})
})

router.get('/admin', isAdmin, (req, res) => {
	res.render('admin', {user: req.user})
})

//post

router.post('/profile', isAuth, upload.single('image'), (req, res) => {
    res.send('image uploaded')
})
module.exports = router
