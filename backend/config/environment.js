import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env file from the backend directory
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const isProduction = process.env.NODE_ENV === 'production';

// Production safety verification: Ensure secrets are explicitly provided and not default dev keys
if (isProduction) {
  const secret = process.env.JWT_SECRET || '';
  const refreshSecret = process.env.JWT_REFRESH_SECRET || '';
  if (!secret || secret.includes('dev_campus') || secret.length < 32) {
    throw new Error('[Security Exception] In production mode, JWT_SECRET must be set to a secure string of at least 32 characters.');
  }
  if (!refreshSecret || refreshSecret.includes('dev_campus') || refreshSecret.length < 32) {
    throw new Error('[Security Exception] In production mode, JWT_REFRESH_SECRET must be set to a secure string of at least 32 characters.');
  }
}

export const environment = Object.freeze({
  port: parseInt(process.env.PORT, 10) || 5001,
  nodeEnv: process.env.NODE_ENV || 'development',
  isProduction,
  isDevelopment: !isProduction,
  mongoUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/campus_lost_found_db',
  jwtSecret: process.env.JWT_SECRET || 'dev_campus_jwt_secret_super_secure_key_min32chars',
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || 'dev_campus_jwt_refresh_secret_super_secure_key_min32chars',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '15m',
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 15 * 60 * 1000,
  rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX, 10) || 100,
  authRateLimitMax: parseInt(process.env.AUTH_RATE_LIMIT_MAX, 10) || 15
});

export default environment;
