const router = require('express').Router()
const isAuth = require('../utilities/authMiddleware').isAuth
const connection = require('../config/database')
const User = connection.models.User

//adds a like from a user to another
router.post('/like/:id', isAuth, async (req, res) => {
    const user = await User.findById(req.params.id)

    //stops user from liking the same one multiple times
    if (user.likes.some((x) => x.username === req.user.username)) {
        res.redirect('/meet')
    } else {
        user.likes.push(req.user)
        await user.save()
        res.redirect('/meet')
    }
})

module.exports = router