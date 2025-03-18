const express = require('express')
const { getGuideDetails, getAllGuides, getSearchedGuide } = require('../controllers/guide/guideController')
const router = express.Router()

// router.get('/',getAllGuides)
// router.get('/profile/:guideId',getGuideDetails)
// router.get('/search', getSearchedGuide)


module.exports = router;