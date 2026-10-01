import jwt from 'jsonwebtoken';
import environment from '../config/environment.js';

/**
 * Generate short-lived JWT access token
 * Payload contains only minimal, non-sensitive identity markers
 */
export const generateAccessToken = (user) => {
  const payload = {
    userId: user._id.toString(),
    role: user.role,
    email: user.email
  };

  return jwt.sign(payload, environment.jwtSecret, {
    algorithm: 'HS256',
    expiresIn: environment.jwtExpiresIn
  });
};

/**
 * Generate long-lived JWT refresh token
 */
export const generateRefreshToken = (user) => {
  const payload = {
    userId: user._id.toString(),
    role: user.role
  };

  return jwt.sign(payload, environment.jwtRefreshSecret, {
    algorithm: 'HS256',
    expiresIn: environment.jwtRefreshExpiresIn
  });
};

/**
 * Verify access token with explicit HS256 algorithm enforcement
 */
export const verifyAccessToken = (token) => {
  return jwt.verify(token, environment.jwtSecret, {
    algorithms: ['HS256']
  });
};

/**
 * Verify refresh token with explicit HS256 algorithm enforcement
 */
export const verifyRefreshToken = (token) => {
  return jwt.verify(token, environment.jwtRefreshSecret, {
    algorithms: ['HS256']
  });
};

export default {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken
};
