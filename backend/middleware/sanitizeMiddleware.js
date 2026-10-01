/**
 * NoSQL Injection and Input Sanitization Middleware
 * Recursively inspects and sanitizes request parameters, query strings, and body payloads
 * Strips MongoDB operators ($gt, $ne, $where, $regex, etc.) and dot-notation path pollution
 */

/**
 * Recursively cleans an object by removing keys starting with '$' or containing '.'
 */
export const sanitizeObject = (obj) => {
  if (!obj || typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => sanitizeObject(item));
  }

  const cleaned = {};
  for (const [key, value] of Object.entries(obj)) {
    // Drop keys starting with '$' (MongoDB query operators) or containing '.'
    if (key.startsWith('$') || key.includes('.')) {
      console.warn(`[Security Notice] Blocked prohibited NoSQL operator key '${key}'`);
      continue;
    }

    if (typeof value === 'object' && value !== null) {
      cleaned[key] = sanitizeObject(value);
    } else if (typeof value === 'string') {
      // Strip null bytes
      cleaned[key] = value.replace(/\0/g, '');
    } else {
      cleaned[key] = value;
    }
  }

  return cleaned;
};

/**
 * Express middleware to sanitize req.body, req.query, and req.params
 */
export const sanitizeInputs = (req, res, next) => {
  try {
    if (req.body && typeof req.body === 'object') {
      req.body = sanitizeObject(req.body);
    }

    if (req.query && typeof req.query === 'object') {
      req.query = sanitizeObject(req.query);
    }

    if (req.params && typeof req.params === 'object') {
      req.params = sanitizeObject(req.params);
    }

    next();
  } catch (err) {
    next(err);
  }
};

/**
 * Escapes regex special characters to prevent ReDoS when constructing dynamic RegExp
 */
export const escapeRegex = (string) => {
  if (!string || typeof string !== 'string') return '';
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

export default sanitizeInputs;
