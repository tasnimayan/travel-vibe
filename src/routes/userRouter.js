const express = require('express')
const upload = require('../helpers/multer')

const {signUp, loginUser, logoutUser, updateUser, getUser, deleteUser, getUserProfile} = require('../controllers/user/userController');
const {isAuthorized, isAvailableFor} = require('../middlewares/auth');
const { verifyOTP, resendOTP } = require('../controllers/auth/otp');
const { updatePassword, forgotPassword, resetPassword } = require('../controllers/auth/password');

const router = express.Router()
// these routes will start with '/api/v2/users'

// router.get('/user', isAuthorized, getUser)
router.post('/signup', signUp)
router.post('/login', loginUser)
router.post('/verify', verifyOTP)
router.post('/otp/resend', resendOTP)

// yet to work for v2
router.get('/logout', isAuthorized, isAvailableFor('user', 'organization', 'admin'), logoutUser)
router.get('/profile', isAuthorized, isAvailableFor('user', 'organization'), getUserProfile)  // User profile
router.post('/profile/update', isAuthorized, isAvailableFor('user', 'organization'), upload.single('avatar'), updateUser)
router.post('/update/password', isAuthorized, updatePassword)
router.patch('/account/delete/', isAuthorized, deleteUser)
router.post('/account/recover/', forgotPassword)
router.patch('/account/recover/:token', resetPassword);


module.exports = router;