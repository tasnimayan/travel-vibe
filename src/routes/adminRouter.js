const express = require('express');

const {isAuthorized, isAvailableFor} = require('../middlewares/auth');
const { signUp, loginUser, logoutUser } = require('../controllers/admin/authController');
const { verifyOTP } = require('../controllers/auth/otp');

const router = express.Router()
// these routes will start with '/api/v2/admin'

router.post('/signup', signUp)
router.post('/login', loginUser)
router.post('/verify', verifyOTP)
router.get('/logout', isAuthorized, isAvailableFor('admin'), logoutUser)

module.exports = router;