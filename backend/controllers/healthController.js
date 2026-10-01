import { getDbStatus } from '../config/db.js';
import config from '../config/env.js';
import ApiResponse from '../utils/apiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';

/**
 * @desc Get system health and runtime metrics
 * @route GET /api/v1/health
 * @access Public
 */
export const getHealth = asyncHandler(async (req, res) => {
  const healthData = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    environment: config.env,
    database: {
      status: getDbStatus()
    },
    version: '1.0.0',
    service: 'Campus Lost & Found REST API'
  };

  return ApiResponse.success(res, {
    message: 'System is operational',
    data: healthData
  });
});

export default {
  getHealth
};
