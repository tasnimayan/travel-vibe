const express = require('express');

const {isAuthorized, isAvailableFor} = require('../middlewares/auth');
const {verifyOTP, } = require('../controllers/user/userController');
const { signUp, loginUser, logoutUser } = require('../controllers/admin/authController');

const router = express.Router()
// these routes will start with '/api/v2/admin'

router.post('/signup', signUp)
router.post('/login', loginUser)
router.post('/verify', verifyOTP)
router.get('/logout', isAuthorized, isAvailableFor('admin'), logoutUser)

module.exports = router;