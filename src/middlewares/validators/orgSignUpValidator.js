const { body, validationResult } = require('express-validator');

module.exports.validateOrgSignup = [
  body('email').isEmail().withMessage('Invalid email format.'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long.')
    .not().contains('password', { ignoreCase: true })
    .withMessage('Password cannot contain "password".'),
  body('name').notEmpty().withMessage('Name is required.'),
  body('city').notEmpty().withMessage('City is required.'),
  body('address').notEmpty().withMessage('Address is required.'),
  body('country').notEmpty().withMessage('Country is required.'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ status:"error", message: "Must fill required fields" });
    }
    next();
  },
];

module.exports.validateUpdateProfile = [
  body('bio').optional().isString().withMessage('Bio must be a string.'),
  body('website').optional().isURL().withMessage('Invalid website URL.'),
  body('contactEmail').optional().isEmail().withMessage('Invalid email format.'),
  body('contactPhone').optional().isMobilePhone().withMessage('Invalid phone number.'),
  body('postalCode').optional().isPostalCode('any').withMessage('Invalid postal code.'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ status:"error", errors: errors.array() });
    }
    next();
  },
];