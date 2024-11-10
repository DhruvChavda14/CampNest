const express = require('express')
const router = express.Router()
const User = require('../models/user')
const catchAsync = require('../utils/catchAsync')
const passport = require('passport')
const { renderRegistraion, renderLogin, logout, login, registration } = require('../controllers/user')

router.route('/register')
    .get( renderRegistraion)
    .post(catchAsync(registration))

router.route('/login')
    .get( renderLogin)
    .post( passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), login)

router.get('/logout',logout );
module.exports = router