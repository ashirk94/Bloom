const router = require('express').Router()
const isAuth = require('../utilities/authMiddleware').isAuth
const isAdmin = require('../utilities/authMiddleware').isAdmin

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
module.exports = router
