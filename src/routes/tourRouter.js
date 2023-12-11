const express = require('express')
const router = express.Router()
const { getAllTours, createTour, topFiveTours, longestFiveTours, getQueriedTours, getTour, updateTour, deleteTour} = require('../controllers/tour/tourController')
const {createReview, getAllReviews, updateReview, deleteReview} = require('../controllers/tour/reviewController')
const upload = require('../helpers/multer')
const {isAuthorized, isAvailableFor} = require('../middlewares/auth')

router.route('/')
  .get(getAllTours)
  .post(isAuthorized, isAvailableFor('org'), upload.array('photos', 20), createTour);

router.route('/:id')
  .get(getTour)
  .post(isAuthorized, isAvailableFor('org'), upload.array('photos', 20), updateTour)
  .patch(isAuthorized, isAvailableFor('org'), deleteTour)


// popular
router.route('/top-5-tours').post(topFiveTours, getQueriedTours);
router.route('/longest-5-tours').post(longestFiveTours, getQueriedTours);



// Tour Review Routes 
// api/tours/
router.route('/:tourId/reviews')
  .get(getAllReviews)
  .post(isAuthorized, isAvailableFor("user"), createReview);

router.route('/:tourId/reviews/:revId')
  .post(isAuthorized, isAvailableFor("user"), updateReview)
  .patch(isAuthorized, isAvailableFor("user"), deleteReview);
  


module.exports = router;