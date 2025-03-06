const { body, validationResult } = require('express-validator');

module.exports.validateCreateTour = [
  // Required Fields
  body('title').notEmpty().withMessage('Title is required').trim(),
  body('price').isNumeric().withMessage('Price must be a number').custom(value => value >= 0).withMessage('Price must be a non-negative number'),
  body('currency').isIn(['USD', 'EUR', 'INR', 'GBP']).withMessage('Invalid currency. Allowed values: USD, EUR, INR, GBP'),
  body('startDate').isISO8601().withMessage('Start date must be a valid date in ISO8601 format (e.g., YYYY-MM-DD)'),
  body('endDate').optional().isISO8601().withMessage('End date must be a valid date in ISO8601 format (e.g., YYYY-MM-DD)'),
  body('duration').optional().isString().withMessage('Duration must be a string'),
  body('startingLocation').optional().isString().withMessage('Starting location must be a string'),
  body('maxGroupSize').optional().isInt({ min: 1 }).withMessage('Max group size must be a positive integer'),
  body('departureTime').optional().isISO8601().withMessage('Departure time must be a valid date in ISO8601 format (e.g., YYYY-MM-DDTHH:MM:SSZ)'),
  body('ratingQuantity').optional().isInt({ min: 0 }).withMessage('Rating quantity must be a non-negative integer'),
  body('discountPercentage').optional().isFloat({ min: 0, max: 100 }).withMessage('Discount percentage must be a number between 0 and 100'),
  body('discountAmount').optional().isFloat({ min: 0 }).withMessage('Discount amount must be a non-negative number'),
  body('bookingDeposit').optional().isFloat({ min: 0 }).withMessage('Booking deposit must be a non-negative number'),
  body('country').optional().isString().withMessage('Country must be a string'),
  body('status').optional().isIn(['upcoming', 'ongoing', 'completed']).withMessage('Invalid status. Allowed values: upcoming, ongoing, completed'),
  body('isActive').optional().isBoolean().withMessage('isActive must be a boolean value'),
  body('policy').optional().isMongoId().withMessage('Policy must be a valid MongoDB ObjectID'),
  body('category').isMongoId().withMessage('Category must be a valid MongoDB ObjectID'),

  // Arrays and Nested Objects
  body('highlightedPlaces').optional().isArray().withMessage('Highlighted places must be an array'),
  body('highlightedPlaces.*').optional().isString().withMessage('Each highlighted place must be a string'),
  body('pickupPoint').optional().isArray().withMessage('Pickup points must be an array'),
  body('pickupPoint.*').optional().isString().withMessage('Each pickup point must be a string'),
  body('amenities').optional().isArray().withMessage('Amenities must be an array'),
  body('amenities.*').optional().isString().withMessage('Each amenity must be a string'),
  body('tags').optional().isArray().withMessage('Tags must be an array'),
  body('tags.*').optional().isString().withMessage('Each tag must be a string'),
  body('itinerary').optional().isArray().withMessage('Itinerary must be an array'),
  body('itinerary.*.title').optional().isString().withMessage('Each itinerary title must be a string'),
  body('itinerary.*.activities').optional().isArray().withMessage('Activities must be an array'),
  body('itinerary.*.activities.*.title').optional().isString().withMessage('Each activity title must be a string'),
  body('itinerary.*.activities.*.description').optional().isString().withMessage('Each activity description must be a string'),

  // Custom Validation for Dates
  body('endDate').custom((value, { req }) => {
    if (value && new Date(value) < new Date(req.body.startDate)) {
      throw new Error('End date must be after the start date');
    }
    return true;
  }),

  // Handle Validation Errors
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
    }
    next();
  }
];