const router = require('express').Router()
const isAuth = require('../utilities/authMiddleware').isAuth

//get routes

router.get('/', (req, res) => {
	res.render('index')
})

router.get('/chat', isAuth, function (req, res) {
    res.render('chat', {user: req.user})
})

router.get('/browse', (req, res) => {
	res.render('browse')
})

module.exports = router
