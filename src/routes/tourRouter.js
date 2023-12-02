const express = require('express')
const router = express.Router()
const { getAllTours, createTour, topFiveTours, longestFiveTours, getQueriedTours, getTour, updateTour, deleteTour} = require('../controllers/tour/tourController')
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



  // nested and merged routes
// router.use('/:id/reviews', reviewRouter);
// router.use('/:id/bookings', bookingRouter);

module.exports = router;