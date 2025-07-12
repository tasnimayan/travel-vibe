const express = require('express');

const {isAuthorized, isAvailableFor} = require('../middlewares/auth');
const { signUp, loginUser, logoutUser, updateProfile, profileDetails } = require('../controllers/organization/organizationController');
const { verifyOTP } = require('../controllers/auth/otp');
const { validateOrgSignup, validateUpdateProfile } = require('../middlewares/validators/orgSignUpValidator');
const upload = require('../helpers/multer');

const router = express.Router()
// these routes will start with '/api/v2/org'

router.post('/signup', validateOrgSignup, signUp)
router.post('/login', loginUser)
router.post('/verify', verifyOTP)
router.get('/logout', isAuthorized, isAvailableFor('organization'), logoutUser)
router.route('/profile')
  .get(isAuthorized, isAvailableFor('organization'), profileDetails)
  .patch(isAuthorized, isAvailableFor('organization'), upload.single('avatar'), validateUpdateProfile, updateProfile)

module.exports = router;