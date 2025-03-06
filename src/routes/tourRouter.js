const express = require('express')
const router = express.Router()
const { getAllTours, createTour} = require('../controllers/tour/tourController')
// const {createReview, getAllReviews, updateReview, deleteReview} = require('../controllers/tour/reviewController')
const upload = require('../helpers/multer')
const {isAuthorized, isAvailableFor} = require('../middlewares/auth')
// const { getPopularLocations, increaseLocationCount} = require('../controllers/tour/popularLocationController')

// const {getTopDestination, increaseDestinationWeight} = require('../controllers/tour/topDestinationController')
const { validateCreateTour } = require('../middlewares/validators/tourValidator')


router.route('/')
  .get(getAllTours)
  .post(isAuthorized, isAvailableFor('organization'), upload.array('photos', 20),validateCreateTour, createTour); 


// router.route('/tour/:tourId')
//   .get(getTourDetails)
//   .post(isAuthorized, isAvailableFor('organization', 'admin'), upload.array('photos', 20), updateTour) //Need improvement
//   .patch(isAuthorized, isAvailableFor('org'), deleteTour)


// // Tour Review Routes 
// // api/tours/
// router.route('/tour/:tourId/reviews')
//   .get(getAllReviews)
//   .post(isAuthorized, isAvailableFor("user"), createReview);

// router.route('/:tourId/reviews/:revId')
//   .post(isAuthorized, isAvailableFor("user"), updateReview)
//   .patch(isAuthorized, isAvailableFor("user"), deleteReview);
  



// ============ URL= "api/tours/_current_route"============ Routes for All Users=============

// router.route("/search")
//   .get(SearchTour)

// // router.get("/featured")
// router.get("/discount", getDiscountedTours)
// router.get("/top-location", getPopularLocations)
// router.patch("/top-location/:locationId", increaseLocationCount)  //remove locationId and update depending on the location name
// router.get("/nearby-location", getNearbyLocation)
// router.get("/offers", getOffers)


// router.get('/top-destination', getTopDestination)
// // popular
// router.get('/top-rated',getTopRatedTours);





module.exports = router;