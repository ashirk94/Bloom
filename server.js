const express = require('express')

const app = express()

//app.use(errorTest)

function testWare(req, res, next) {
    req.custom = 100
    next()
}
function errorTest(req, res, next) {
    let error = new Error
    next(error)
}

function errorHandler(err, req, res, next) {
    if (err) {
        res.json({error: err})
    }
}

app.get('/', testWare, (req, res, next) => {
    console.log(`Property: ${req.custom}`)
    res.send('<h1>Hellooooo WORLD!</h1>')
})

app.use(errorHandler)

app.listen(3000)