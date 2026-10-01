/**
 * Wraps asynchronous route handlers to eliminate boilerplate try-catch blocks
 * and pass uncaught rejections directly to Express error middleware.
 */
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

export default asyncHandler;
