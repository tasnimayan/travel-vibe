const express = require('express')
const router = express.Router()
const {createTourCategory, getAllCategory, updateCategory, deleteCategory} = require('../controllers/tour/categoryController')
const upload = require('../helpers/multer')
const {isAuthorized, isAvailableFor} = require('../middlewares/auth')

// Route URL "api/v2/category/"
router.route('/')
  .get(getAllCategory)
  .post(isAuthorized, isAvailableFor("admin"), upload.single('categoryImg'),createTourCategory);

router.route('/:categoryId')
  .post(isAuthorized, isAvailableFor("admin"), upload.single('categoryImg'), updateCategory)  // not updating properly
  .patch(isAuthorized, isAvailableFor("admin"), deleteCategory);
  

module.exports = router;