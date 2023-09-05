const router = require('express').Router()

router.get('/privacy-policy', (req, res) => {
    res.render('info/privacy-policy')
})

router.get('/terms-of-service', (req, res) => {
    res.render('info/terms-of-service')
})

module.exports = router