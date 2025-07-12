const multer = require('multer')
const path = require('path')
const fs = require('fs')

//  use this as a middleware to handle multipart form data
//  upload.single('fieldName')  for a single file upload
    // req.file     is the avatar
//  upload.array('photos', 12)    to upload n number of files to photos field
    // req.files    is array of photos
// upload.fields([{name:'avatar', maxCount:1}, {name:'gallery', maxCount:8}])     to upload multiple file
    // req.files   is an object

// upload.none()   for text only form data

// const memoryStorage = multer.memoryStorage();
const storage = multer.diskStorage(
  {
    destination: function(req, file, cb){
      let destDir = './public/';

      const mail = req.user.email.split('@')[0]
      const role = req.user.role + 's'

      if (file.fieldname === 'avatar') {
        destDir += `${role}/${mail}/profile`;
      }
      else if (file.fieldname === 'gallery' || file.fieldname === 'photos') {
        destDir += `${role}/${mail}/uploads`;
      }
      else if (file.fieldname === 'categoryImg') {
        destDir += `general/category`;
      }
      else {
        // Default to a general directory if no type is specified
        destDir += 'general/';
      }
      
      // Ensure the destination directory is created if it doesn't exist
      if (!fs.existsSync(destDir)) {
        fs.mkdirSync(destDir, { recursive: true });
      }

      cb(null, destDir);

    },
    filename:function(req, file, cb) {
      const fileExt = path.extname(file.originalname)
      let fileName = file.originalname.replace(fileExt, "").toLowerCase().split(" ").join("-") + "-" + Date.now() + fileExt;

      cb(null, fileName)
    }
  }
)

const fileSizeLimit = 50 * 1024 * 1024   // 50 MB limit
const allowedFileTypes = ['.jpg', '.jpeg', '.png', '.gif'];

const upload = multer(
  {
    storage: storage,
    limits: {fileSize: fileSizeLimit},
    fileFilter: function(req, file, cb) {
      // Check file types
      const extname = path.extname(file.originalname).toLowerCase();
      if (allowedFileTypes.includes(extname)) {
        return cb(null, true); // Accept the file
      } else {
        return cb(new Error('Invalid file type'));
      }
    }
  }
);

module.exports = upload


