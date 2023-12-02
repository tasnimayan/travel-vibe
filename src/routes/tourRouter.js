const express = require('express')
const router = express.Router()
const { getAllTours, createTour, topFiveTours, longestFiveTours} = require('../controllers/tour/tourController')
const upload = require('../helpers/multer')

router.route('/')
  .get(getAllTours)
  .post(upload.array('photos', 20),createTour);


// popular
router.route('/top-5-tours').post(topFiveTours, getAllTours);
router.route('/longest-5-tours').post(longestFiveTours, getAllTours);



  // nested and merged routes
// router.use('/:id/reviews', reviewRouter);
// router.use('/:id/bookings', bookingRouter);

module.exports = router;