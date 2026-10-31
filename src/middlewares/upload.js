const multer = require('multer');
const { ApiError } = require('../utils/apiError');
const { env } = require('../config/env');

const allowedMimeTypes = [
  'application/pdf',
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
];

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      ApiError.badRequest(
        `Invalid file type '${file.mimetype}'. Only PDF, JPEG, PNG, and WebP are allowed.`
      ),
      false
    );
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: env.MAX_FILE_SIZE_MB * 1024 * 1024,
  },
});

module.exports = { upload };

