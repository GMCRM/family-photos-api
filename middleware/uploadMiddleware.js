const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');

// Configure Cloudinary storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'family-photos',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif'],
  },
});

// Multer upload with Cloudinary
const upload = multer({ storage });

module.exports = upload;