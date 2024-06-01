const express = require('express')
const router = express.Router()
const { getAllTours, createTour, topFiveTours, longestFiveTours, getQueriedTours, getTourDetails, updateTour, deleteTour, SearchTour, getDiscountedTours, getNearbyLocation, getOffers} = require('../controllers/tour/tourController')
const {createReview, getAllReviews, updateReview, deleteReview} = require('../controllers/tour/reviewController')
const upload = require('../helpers/multer')
const {isAuthorized, isAvailableFor} = require('../middlewares/auth')
const { getPopularLocations, increaseLocationCount} = require('../controllers/tour/popularLocationController')




router.route('/tour/:tourId')
  .get(getTourDetails)
  .post(isAuthorized, isAvailableFor('org'), upload.array('photos', 20), updateTour) //Need improvement
  .patch(isAuthorized, isAvailableFor('org'), deleteTour)


// popular
router.route('/top-5-tours').post(topFiveTours, getQueriedTours);
router.route('/longest-5-tours').post(longestFiveTours, getQueriedTours);




// Tour Review Routes 
// api/tours/
router.route('/tour/:tourId/reviews')
  .get(getAllReviews)
  .post(isAuthorized, isAvailableFor("user"), createReview);

router.route('/:tourId/reviews/:revId')
  .post(isAuthorized, isAvailableFor("user"), updateReview)
  .patch(isAuthorized, isAvailableFor("user"), deleteReview);
  



// ============ URL= "api/tours/_current_route"============ Routes for All Users=============
router.route('/')
  .get(getAllTours)
  .post(isAuthorized, isAvailableFor('org'), upload.array('photos', 20), createTour); //Need to be tailored

router.route("/search")
  .get(SearchTour)

// router.get("/featured")
// router.get("/offers")
router.get("/discount", getDiscountedTours)
router.get("/top-location", getPopularLocations)
router.patch("/top-location/:locationId", increaseLocationCount)  //remove locationId and update depending on the location name
router.get("/nearby-location", getNearbyLocation)
router.get("/offers", getOffers)
// router.get("/places")
// router.get("/category")
// router.get("/query")




module.exports = router;