const express = require('express')
const router = express.Router()
const {createCategory, getAllCategory, updateCategory, deleteCategory} = require('../controllers/tour/categoryController')
const upload = require('../helpers/multer')
const {isAuthorized, isAvailableFor} = require('../middlewares/auth')


// Route URL "api/v1/category/"
router.route('/')
  .get(getAllCategory)
  .post(isAuthorized, isAvailableFor("admin"), upload.single('categoryImg'),createCategory);

router.route('/:categoryId')
  .post(isAuthorized, isAvailableFor("org","admin"), updateCategory)  // not updating properly
  .patch(isAuthorized, isAvailableFor("org","admin"), deleteCategory);
  

module.exports = router;