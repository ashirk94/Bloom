const router = require('express').Router()
const isAuth = require('../utilities/authMiddleware').isAuth

//get routes

router.get('/', (req, res) => {
	res.render('index', {user: req.user})
})

router.get('/chat', isAuth, function (req, res) {
    res.render('chat', {user: req.user})
})

router.get('/meet', (req, res) => {
	res.render('meet', {user: req.user})
})

module.exports = router
