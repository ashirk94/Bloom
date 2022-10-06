const router = require('express').Router()
const isAuth = require('../utilities/authMiddleware').isAuth
const isAdmin = require('../utilities/authMiddleware').isAdmin
const path = require('path')
const connection = require('../config/database')
const User = connection.models.User

//get all
router.get('/likes', (req, res) => {

})

//get by id
router.get('/likes/:id', (req, res) => {

})