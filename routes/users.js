const mongoose = require('mongoose')
const router = require('express').Router()
const User = mongoose.model('User')
const passport = require('passport')
const genPassword = require('../utilities/passwordUtils').genPassword

//post routes

router.post(
	'/login',
	passport.authenticate('local'),
	function (req, res, next) {}
)
