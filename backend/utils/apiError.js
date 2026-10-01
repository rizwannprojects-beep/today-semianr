/**
 * Standardized ApiError class for operational errors
 */
export class ApiError extends Error {
  constructor(statusCode, message, errors = [], isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    this.isOperational = isOperational;
    this.success = false;

    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message = 'Bad Request', errors = []) {
    return new ApiError(400, message, errors);
  }

  static unauthorized(message = 'Unauthorized access', errors = []) {
    return new ApiError(401, message, errors);
  }

  static forbidden(message = 'Access forbidden: Insufficient permissions', errors = []) {
    return new ApiError(403, message, errors);
  }

  static notFound(message = 'Resource not found', errors = []) {
    return new ApiError(404, message, errors);
  }

  static conflict(message = 'Resource conflict', errors = []) {
    return new ApiError(409, message, errors);
  }

  static unprocessable(message = 'Unprocessable entity: Validation failed', errors = []) {
    return new ApiError(422, message, errors);
  }

  static internal(message = 'Internal server error', errors = []) {
    return new ApiError(500, message, errors, false);
  }
}

export default ApiError;
