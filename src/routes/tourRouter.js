const express = require('express')
const router = express.Router()
const { getAllTours, createTour} = require('../controllers/tour/postController')

router.route('/')
  .get(getAllTours)
  .post(createTour);

module.exports = router;