const express = require('express')
const router = express.Router()
const { getAllTours, createTour, processTourFilters, getTourDetails, addOrRemoveFavorite, getPopularTours, getActivitiesTour} = require('../controllers/tour/tourController')

const upload = require('../helpers/multer')
const {isAuthorized, isAvailableFor} = require('../middlewares/auth')
const { getPopularLocations, incrementLocationWeight, getTouristAttractions } = require('../controllers/tour/locationController')

const { validateCreateTour } = require('../middlewares/validators/tourValidator')
const { addFeaturedTour, getFeaturedTours } = require('../controllers/admin/featuredTourController')


router.route('/')
  .get(processTourFilters, getAllTours)
  .post(isAuthorized, isAvailableFor('organization'), upload.array('photos', 20),validateCreateTour, createTour); 


router.route('/tour/:tourId')
  .get(getTourDetails)
//   .post(isAuthorized, isAvailableFor('organization', 'admin'), upload.array('photos', 20), updateTour) //Need improvement
//   .patch(isAuthorized, isAvailableFor('org'), deleteTour)

router.get("/top-locations", getPopularLocations)
router.put("/top-locations/:locationId", incrementLocationWeight)

router.get("/favorites/:tourId", isAuthorized, isAvailableFor('user'), addOrRemoveFavorite)
router.get("/popular", getPopularTours)
router.route("/featured")
  .get(getFeaturedTours)
  .post(isAuthorized, isAvailableFor('admin'), addFeaturedTour)

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

router.get("/attractions", getTouristAttractions)
router.get("/activity", getActivitiesTour)
// router.get("/discount", getDiscountedTours)
// router.patch("/top-location/:locationId", increaseLocationCount)  //remove locationId and update depending on the location name
// router.get("/nearby-location", getNearbyLocation)
// router.get("/offers", getOffers)


// router.get('/top-destination', getTopDestination)
// // popular
// router.get('/top-rated',getTopRatedTours);





module.exports = router;