/**
 * Role-Based Authorization Middleware (requireRole)
 * Verifies that the authenticated user possesses one of the allowed roles
 */
export const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required prior to authorization check.',
        errors: [{ message: 'User not authenticated' }]
      });
    }

    // superadmin always has access to all authorized endpoints
    if (req.user.role === 'superadmin' || allowedRoles.includes(req.user.role)) {
      return next();
    }

    return res.status(403).json({
      success: false,
      message: `Access denied. Requires one of: [${allowedRoles.join(', ')}].`,
      errors: [
        {
          role: req.user.role,
          message: `Your account role '${req.user.role}' lacks permission for this endpoint`
        }
      ]
    });
  };
};

export const requireRole = (...roles) => authorize(...roles);

export default authorize;
