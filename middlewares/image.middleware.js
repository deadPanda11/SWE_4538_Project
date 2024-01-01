const multer = require("multer");
const { v4: uuidv4 } = require("uuid");
const path = require("path");

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only .jpeg, .jpg, and .png files are allowed'), false);
  }
};

// Configure storage for the profile images
const userProfileImageStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Make sure this directory exists or create it
    cb(null, 'uploads/userProfileImages');
  },
  filename: function (req, file, cb) {
    // Create a unique filename for the image
    cb(null, uuidv4() + '-' + Date.now() + path.extname(file.originalname));
  },
});

// Create the multer upload middleware
const uploadUserProfileImage = multer({
  storage: userProfileImageStorage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 1024 * 1024 * 5 // 5MB size limit
  }
});

const songStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/songs');
  },
  filename: function (req, file, cb) {
    cb(null, uuidv4() + '-' + Date.now() + path.extname(file.originalname));
  },
});

const uploadSong = multer({
  storage: songStorage,
  limits: {
    fileSize: 1024 * 1024 * 20 // 20MB size limit
  },
  fileFilter: function (req, file, cb) {
    if (file.mimetype.startsWith('audio/')) {
      cb(null, true);
    } else {
      cb(new Error('Only audio files are allowed!'), false);
    }
  },
});

module.exports = { uploadUserProfileImage, uploadSong };
