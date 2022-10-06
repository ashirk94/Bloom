const router = require('express').Router()
const isAdmin = require('../utilities/authMiddleware').isAdmin
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

module.exports = router