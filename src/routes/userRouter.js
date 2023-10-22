const express = require('express')
const router = express.Router()
const upload = require('../helpers/multer')

const {signUp, loginUser, logoutUser, updateUser, getUser, updatePassword, deleteUser, forgotPassword, resetPassword} = require('../controllers/user/userController');
const {isAuthorized, isAvailableFor} = require('../middlewares/auth')


router.post('/signup', signUp)
router.post('/login', loginUser)
router.get('/logout', isAuthorized, isAvailableFor('user', 'organization', 'admin'), logoutUser)
router.get('/profile/', isAuthorized, isAvailableFor('user', 'organization'), getUser)  // User profile
router.post('/profile/update', isAuthorized, isAvailableFor('user', 'organization'), upload.single('avatar'), updateUser)  // User profile
router.post('/update/password', isAuthorized, updatePassword)
router.get('/account/delete/', isAuthorized, deleteUser)
router.post('/account/recover/', forgotPassword)
router.patch('/account/recover/:token', resetPassword);



router.post('/files', isAuthorized, upload.fields([{name:'avatar'}, {name:'gallery'}]), (req, res)=>{
	console.log(req.files.gallery);
	res.send()
})



module.exports = router;