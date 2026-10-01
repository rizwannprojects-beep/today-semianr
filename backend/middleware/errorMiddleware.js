import environment from '../config/environment.js';

/**
 * Custom AppError class for operational errors
 */
export class AppError extends Error {
  constructor(statusCode, message, errors = []) {
    super(message);
    this.statusCode = statusCode;
    this.errors = Array.isArray(errors) ? errors : [errors];
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * 404 Handler for undefined routes
 */
export const notFoundHandler = (req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Resource not found: ${req.method} ${req.originalUrl}`,
    errors: [{ path: req.originalUrl, message: 'Endpoint does not exist on this server' }]
  });
};

/**
 * Centralized Global Error Handler
 */
export const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'An unexpected internal server error occurred';
  let code = err.code || (statusCode >= 500 ? 'INTERNAL_SERVER_ERROR' : 'REQUEST_ERROR');
  let errors = err.errors || [];

  // Mongoose Bad ObjectId (CastError)
  if (err.name === 'CastError') {
    statusCode = 400;
    code = 'INVALID_IDENTIFIER';
    message = `Invalid format for resource identifier '${err.path}'`;
    errors = [{ field: err.path, message: `Provided value '${err.value}' is not a valid ObjectId` }];
  }

  // Mongoose Duplicate Key Error (Code 11000)
  if (err.code === 11000) {
    statusCode = 409;
    code = 'DUPLICATE_KEY_ERROR';
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    const value = err.keyValue ? err.keyValue[field] : '';
    message = `A record with this ${field} already exists`;
    errors = [{ field, message: `The ${field} '${value}' is already registered` }];
  }

  // Mongoose Schema Validation Error
  if (err.name === 'ValidationError') {
    statusCode = 400;
    code = 'VALIDATION_ERROR';
    message = 'Validation failed';
    errors = Object.values(err.errors || {}).map((e) => ({
      field: e.path,
      message: e.message
    }));
  }

  // JWT Token Errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    code = 'AUTHENTICATION_ERROR';
    message = 'Invalid security token';
    errors = [{ message: 'Authentication token is malformed or invalid' }];
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    code = 'TOKEN_EXPIRED';
    message = 'Session has expired';
    errors = [{ message: 'Authentication token has expired. Please log in again.' }];
  }

  // Malformed JSON Payload Error
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    statusCode = 400;
    code = 'MALFORMED_PAYLOAD';
    message = 'Malformed JSON payload received in request body';
    errors = [{ message: 'Ensure request body contains valid JSON' }];
  }

  // Log error details securely on server for diagnostics
  if (statusCode >= 500) {
    console.error(`[Server 500 Error] [${req.method}] ${req.originalUrl}:`, err);
  } else if (environment.isDevelopment) {
    console.warn(`[Client ${statusCode} Notice] [${req.method}] ${req.originalUrl}: ${message}`);
  }

  // In production, sanitize 500 error messages to never leak internal implementation details
  const publicMessage = environment.isProduction && statusCode >= 500
    ? 'An unexpected error occurred. Please contact campus support if this persists.'
    : message;

  res.status(statusCode).json({
    success: false,
    message: publicMessage,
    code,
    errors: errors.length > 0 ? errors : [{ message: publicMessage }],
    ...(environment.isDevelopment && statusCode >= 500 ? { stack: err.stack } : {})
  });
};

export default {
  AppError,
  notFoundHandler,
  errorHandler
};
