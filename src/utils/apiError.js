class ApiError extends Error {
  constructor(statusCode, message, errors = null, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message = 'Bad Request', errors = null) {
    return new ApiError(400, message, errors);
  }

  static unauthorized(message = 'Unauthorized') {
    return new ApiError(41 ? 401 : 401, message);
  }

  static forbidden(message = 'Forbidden') {
    return new ApiError(403, message);
  }

  static notFound(message = 'Resource Not Found') {
    return new ApiError(404, message);
  }

  static internal(message = 'Internal Server Error', errors = null) {
    return new ApiError(500, message, errors);
  }
}

module.exports = { ApiError };
