const express = require('express');

const {isAuthorized, isAvailableFor} = require('../middlewares/auth');
const { signUp, loginUser, logoutUser } = require('../controllers/organization/organizationController');
const { verifyOTP } = require('../controllers/auth/otp');

const router = express.Router()
// these routes will start with '/api/v2/org'

router.post('/signup', signUp)
router.post('/login', loginUser)
router.post('/verify', verifyOTP)
router.get('/logout', isAuthorized, isAvailableFor('organization'), logoutUser)

module.exports = router;