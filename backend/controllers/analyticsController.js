import {
  parseDateRange,
  getOverviewAnalytics,
  getLostVsFoundAnalytics,
  getClaimAnalytics,
  getMatchAnalytics,
  getReturnAnalytics,
  getResolutionTimeAnalytics,
  getCategoryAnalytics,
  getLocationAnalytics,
  getDepartmentAnalytics,
  getTrendAnalytics,
  generateAnalyticsCsv
} from '../services/analyticsService.js';

/**
 * Extracts date range and filters from request query parameters
 */
const extractQueryParams = (req) => {
  const {
    range = 'last30days',
    startDate,
    endDate,
    type,
    category,
    status,
    location,
    interval = 'daily',
    dataset = 'summary'
  } = req.query;

  const dateParams = parseDateRange(range, startDate, endDate);
  const filters = {};
  if (type) filters.type = type;
  if (category) filters.category = category;
  if (status) filters.status = status;
  if (location) filters.location = location;

  return { dateParams, filters, interval, dataset };
};

/**
 * Common handler for input validation and query errors in analytics endpoints
 */
const handleAnalyticsError = (error, res, next) => {
  const msg = error.message || '';
  if (
    msg.includes('required') ||
    msg.includes('Invalid') ||
    msg.includes('invalid') ||
    msg.includes('exceed') ||
    msg.includes('before') ||
    msg.includes('startDate') ||
    msg.includes('endDate') ||
    msg.includes('Unsupported')
  ) {
    return res.status(400).json({
      success: false,
      message: msg,
      code: 'VALIDATION_ERROR'
    });
  }
  next(error);
};

/**
 * @desc Get high-level overview metrics & KPI cards with previous period comparison
 * @route GET /api/admin/analytics/overview
 * @access Private (Admin / Superadmin / Staff)
 */
export const getOverview = async (req, res, next) => {
  try {
    const { dateParams, filters } = extractQueryParams(req);
    const data = await getOverviewAnalytics(dateParams, filters);
    res.status(200).json({
      success: true,
      message: 'Overview analytics retrieved successfully',
      data
    });
  } catch (error) {
    return handleAnalyticsError(error, res, next);
  }
};

/**
 * @desc Get lost vs found item comparison and image attachment rate
 * @route GET /api/admin/analytics/items
 * @access Private (Admin / Superadmin / Staff)
 */
export const getItems = async (req, res, next) => {
  try {
    const { dateParams, filters } = extractQueryParams(req);
    const data = await getLostVsFoundAnalytics(dateParams, filters);
    res.status(200).json({
      success: true,
      message: 'Item comparison analytics retrieved successfully',
      data
    });
  } catch (error) {
    return handleAnalyticsError(error, res, next);
  }
};

/**
 * @desc Get claim status breakdown, approval/rejection rates, and average processing time
 * @route GET /api/admin/analytics/claims
 * @access Private (Admin / Superadmin / Staff)
 */
export const getClaims = async (req, res, next) => {
  try {
    const { dateParams } = extractQueryParams(req);
    const data = await getClaimAnalytics(dateParams);
    res.status(200).json({
      success: true,
      message: 'Claims analytics retrieved successfully',
      data
    });
  } catch (error) {
    return handleAnalyticsError(error, res, next);
  }
};

/**
 * @desc Get smart matching confidence distributions and status breakdown
 * @route GET /api/admin/analytics/matches
 * @access Private (Admin / Superadmin / Staff)
 */
export const getMatches = async (req, res, next) => {
  try {
    const { dateParams } = extractQueryParams(req);
    const data = await getMatchAnalytics(dateParams);
    res.status(200).json({
      success: true,
      message: 'Matching analytics retrieved successfully',
      data
    });
  } catch (error) {
    return handleAnalyticsError(error, res, next);
  }
};

/**
 * @desc Get return workflow completion rates, disputes, and durations
 * @route GET /api/admin/analytics/returns
 * @access Private (Admin / Superadmin / Staff)
 */
export const getReturns = async (req, res, next) => {
  try {
    const { dateParams } = extractQueryParams(req);
    const data = await getReturnAnalytics(dateParams);
    res.status(200).json({
      success: true,
      message: 'Return workflow analytics retrieved successfully',
      data
    });
  } catch (error) {
    return handleAnalyticsError(error, res, next);
  }
};

/**
 * @desc Get operational resolution times across reporting, review, and handover
 * @route GET /api/admin/analytics/resolution-times
 * @access Private (Admin / Superadmin / Staff)
 */
export const getResolutionTimes = async (req, res, next) => {
  try {
    const { dateParams } = extractQueryParams(req);
    const data = await getResolutionTimeAnalytics(dateParams);
    res.status(200).json({
      success: true,
      message: 'Resolution time metrics retrieved successfully',
      data
    });
  } catch (error) {
    return handleAnalyticsError(error, res, next);
  }
};

/**
 * @desc Get item category distribution and category-specific recovery rates
 * @route GET /api/admin/analytics/categories
 * @access Private (Admin / Superadmin / Staff)
 */
export const getCategories = async (req, res, next) => {
  try {
    const { dateParams, filters } = extractQueryParams(req);
    const data = await getCategoryAnalytics(dateParams, filters);
    res.status(200).json({
      success: true,
      message: 'Category analytics retrieved successfully',
      data
    });
  } catch (error) {
    return handleAnalyticsError(error, res, next);
  }
};

/**
 * @desc Get campus location analytics with normalized location names
 * @route GET /api/admin/analytics/locations
 * @access Private (Admin / Superadmin / Staff)
 */
export const getLocations = async (req, res, next) => {
  try {
    const { dateParams, filters } = extractQueryParams(req);
    const data = await getLocationAnalytics(dateParams, filters);
    res.status(200).json({
      success: true,
      message: 'Location analytics retrieved successfully',
      data
    });
  } catch (error) {
    return handleAnalyticsError(error, res, next);
  }
};

/**
 * @desc Get privacy-safe aggregate department and academic year distributions
 * @route GET /api/admin/analytics/departments
 * @access Private (Admin / Superadmin / Staff)
 */
export const getDepartments = async (req, res, next) => {
  try {
    const { dateParams } = extractQueryParams(req);
    const data = await getDepartmentAnalytics(dateParams);
    res.status(200).json({
      success: true,
      message: 'Department analytics retrieved successfully',
      data
    });
  } catch (error) {
    return handleAnalyticsError(error, res, next);
  }
};

/**
 * @desc Get daily, weekly, or monthly historical trend timelines
 * @route GET /api/admin/analytics/trends
 * @access Private (Admin / Superadmin / Staff)
 */
export const getTrends = async (req, res, next) => {
  try {
    const { dateParams, interval } = extractQueryParams(req);
    const validIntervals = ['daily', 'weekly', 'monthly'];
    const chosenInterval = validIntervals.includes(interval) ? interval : 'daily';

    const data = await getTrendAnalytics(dateParams, chosenInterval);
    res.status(200).json({
      success: true,
      message: 'Trend timeline analytics retrieved successfully',
      data
    });
  } catch (error) {
    return handleAnalyticsError(error, res, next);
  }
};

/**
 * @desc Export analytics dataset to CSV with formula injection sanitization
 * @route GET /api/admin/analytics/export
 * @access Private (Admin / Superadmin / Staff)
 */
export const exportAnalytics = async (req, res, next) => {
  try {
    const { dateParams, filters, dataset } = extractQueryParams(req);
    const csvContent = await generateAnalyticsCsv(dataset, dateParams, filters);

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="campus_lf_analytics_${dataset}_${dateParams.preset}_${Date.now()}.csv"`
    );
    return res.status(200).send(csvContent);
  } catch (error) {
    return handleAnalyticsError(error, res, next);
  }
};

export default {
  getOverview,
  getItems,
  getClaims,
  getMatches,
  getReturns,
  getResolutionTimes,
  getCategories,
  getLocations,
  getDepartments,
  getTrends,
  exportAnalytics
};
