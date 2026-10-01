import { validationResult } from 'express-validator';

/**
 * Middleware that evaluates express-validator validation chains
 * Returns standardized error payload conforming to:
 * { "success": false, "message": "Validation failed", "errors": [...] }
 */
export const validate = (validations) => {
  return async (req, res, next) => {
    // Run all validations in the chain
    for (const validation of validations) {
      const result = await validation.run(req);
      if (result.errors.length) break;
    }

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    const formattedErrors = errors.array().map((err) => ({
      field: err.path || err.param,
      message: err.msg,
      value: err.value
    }));

    return res.status(400).json({
      success: false,
      message: formattedErrors[0]?.message || 'Validation failed',
      errors: formattedErrors
    });
  };
};

export default validate;
