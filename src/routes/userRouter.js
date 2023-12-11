const express = require('express')
const router = express.Router()
const upload = require('../helpers/multer')

const {signUp, loginUser, logoutUser, updateUser, getUser, updatePassword, deleteUser, forgotPassword, resetPassword, getUserProfile} = require('../controllers/user/userController');
const {isAuthorized, isAvailableFor} = require('../middlewares/auth')


router.post('/signup', signUp)
router.post('/login', loginUser)
router.get('/logout', isAuthorized, isAvailableFor('user', 'org', 'admin'), logoutUser)
router.get('/profile', isAuthorized, isAvailableFor('user', 'org'), getUserProfile)  // User profile
router.post('/profile/update', isAuthorized, isAvailableFor('user', 'org'), upload.single('avatar'), updateUser)
router.post('/update/password', isAuthorized, updatePassword)
router.patch('/account/delete/', isAuthorized, deleteUser)
router.post('/account/recover/', forgotPassword)
router.patch('/account/recover/:token', resetPassword);


module.exports = router;