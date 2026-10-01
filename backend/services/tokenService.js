import jwt from 'jsonwebtoken';
import environment from '../config/environment.js';

export class TokenService {
  /**
   * Generates a short-lived access token
   */
  static generateAccessToken(user) {
    const payload = {
      sub: user._id.toString(),
      userId: user._id.toString(),
      role: user.role,
      email: user.email
    };

    return jwt.sign(payload, environment.jwtSecret, {
      algorithm: 'HS256',
      expiresIn: environment.jwtExpiresIn
    });
  }

  /**
   * Generates a refresh token
   */
  static generateRefreshToken(user) {
    const payload = {
      sub: user._id.toString(),
      userId: user._id.toString(),
      role: user.role
    };

    return jwt.sign(payload, environment.jwtRefreshSecret, {
      algorithm: 'HS256',
      expiresIn: environment.jwtRefreshExpiresIn
    });
  }

  /**
   * Verifies an access token
   */
  static verifyAccessToken(token) {
    return jwt.verify(token, environment.jwtSecret, {
      algorithms: ['HS256']
    });
  }

  /**
   * Verifies a refresh token
   */
  static verifyRefreshToken(token) {
    return jwt.verify(token, environment.jwtRefreshSecret, {
      algorithms: ['HS256']
    });
  }
}

export default TokenService;
