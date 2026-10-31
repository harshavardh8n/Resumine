const { ZodError } = require('zod');
const multer = require('multer');
const { ApiError } = require('../utils/apiError');
const { ApiResponse } = require('../utils/apiResponse');
const { env } = require('../config/env');

function errorHandler(err, req, res, next) {
  // If headers are already sent, delegate to default express handler
  if (res.headersSent) {
    return next(err);
  }

  // Handle known operational ApiErrors
  if (err instanceof ApiError) {
    return ApiResponse.error(res, err.message, err.statusCode, err.errors);
  }

  // Handle Zod schema validation errors
  if (err instanceof ZodError) {
    const formattedErrors = err.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }));
    return ApiResponse.error(res, 'Validation failed', 400, formattedErrors);
  }

  // Handle Multer upload errors
  if (err instanceof multer.MulterError) {
    let message = 'File upload error';
    if (err.code === 'LIMIT_FILE_SIZE') {
      message = `File is too large. Maximum allowed size is ${env.MAX_FILE_SIZE_MB}MB.`;
    }
    return ApiResponse.error(res, message, 400, { code: err.code });
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    return ApiResponse.error(res, 'Invalid authentication token', 401);
  }
  if (err.name === 'TokenExpiredError') {
    return ApiResponse.error(res, 'Authentication token has expired', 401);
  }

  // Fallback for unexpected errors
  console.error('💥 Unhandled Exception:', err);
  const message = env.NODE_ENV === 'production' ? 'Internal Server Error' : err.message;
  return ApiResponse.error(
    res,
    message,
    500,
    env.NODE_ENV === 'development' ? { stack: err.stack } : null
  );
}

module.exports = { errorHandler };

