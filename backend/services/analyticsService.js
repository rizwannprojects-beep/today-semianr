import mongoose from 'mongoose';
import Item from '../models/Item.js';
import Claim from '../models/Claim.js';
import Match from '../models/Match.js';
import Return from '../models/Return.js';
import User from '../models/User.js';
import { inMemoryStore } from '../controllers/itemController.js';
import { inMemoryClaimStore } from '../controllers/claimController.js';
import { inMemoryMatchStore } from './matchingService.js';
import { inMemoryReturnStore } from '../controllers/returnController.js';
import { devUserMemoryMap } from '../controllers/authController.js';

/**
 * Standard campus location normalization mapping
 */
const CANONICAL_CAMPUS_LOCATIONS = {
  'library': 'Central Library',
  'central library': 'Central Library',
  'college library': 'Central Library',
  'main library': 'Central Library',
  'academic block': 'Main Academic Block',
  'main academic block': 'Main Academic Block',
  'science block': 'Science & Engineering Block',
  'engineering block': 'Science & Engineering Block',
  'science & engineering block': 'Science & Engineering Block',
  'it complex': 'Computer & IT Complex',
  'computer complex': 'Computer & IT Complex',
  'computer & it complex': 'Computer & IT Complex',
  'cafeteria': 'Student Activity Center / Cafeteria',
  'canteen': 'Student Activity Center / Cafeteria',
  'student activity center': 'Student Activity Center / Cafeteria',
  'sac': 'Student Activity Center / Cafeteria',
  'auditorium': 'Campus Auditorium',
  'campus auditorium': 'Campus Auditorium',
  'sports complex': 'Sports Complex & Gymnasium',
  'gym': 'Sports Complex & Gymnasium',
  'gymnasium': 'Sports Complex & Gymnasium',
  'admin desk': 'Administration & Security Desk',
  'security desk': 'Administration & Security Desk',
  'security office': 'Administration & Security Desk',
  'administration desk': 'Administration & Security Desk',
  'hostel': 'Hostel / Dormitory Grounds',
  'dorm': 'Hostel / Dormitory Grounds',
  'dormitory': 'Hostel / Dormitory Grounds',
  'parking': 'North / South Parking Bay',
  'parking bay': 'North / South Parking Bay',
  'bus terminus': 'Bus Terminus / Campus Gate',
  'campus gate': 'Bus Terminus / Campus Gate',
  'main gate': 'Bus Terminus / Campus Gate'
};

/**
 * Normalizes free-text or selected location to canonical form
 */
export const normalizeLocation = (loc) => {
  if (!loc || typeof loc !== 'string') return 'Other Campus Location';
  const clean = loc.trim();
  const lower = clean.toLowerCase();
  for (const [pattern, canonical] of Object.entries(CANONICAL_CAMPUS_LOCATIONS)) {
    if (lower === pattern || lower.startsWith(pattern) || lower.includes(pattern)) {
      return canonical;
    }
  }
  // Title case fallback
  return clean.replace(/\w\S*/g, (w) => w.charAt(0).toUpperCase() + w.substr(1).toLowerCase());
};

/**
 * Calculates current and previous equivalent date ranges based on preset or custom dates
 */
export const parseDateRange = (preset = 'last30days', customStart = null, customEnd = null) => {
  const now = new Date();
  let start;
  let end = new Date(now);

  switch (preset.toLowerCase()) {
    case 'today': {
      start = new Date(now);
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      break;
    }
    case 'yesterday': {
      start = new Date(now);
      start.setDate(start.getDate() - 1);
      start.setHours(0, 0, 0, 0);
      end = new Date(start);
      end.setHours(23, 59, 59, 999);
      break;
    }
    case 'last7days': {
      start = new Date(now);
      start.setDate(start.getDate() - 7);
      break;
    }
    case 'last30days': {
      start = new Date(now);
      start.setDate(start.getDate() - 30);
      break;
    }
    case 'last90days': {
      start = new Date(now);
      start.setDate(start.getDate() - 90);
      break;
    }
    case 'thismonth': {
      start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
      break;
    }
    case 'previousmonth': {
      start = new Date(now.getFullYear(), now.getMonth() - 1, 1, 0, 0, 0, 0);
      end = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
      break;
    }
    case 'thisyear': {
      start = new Date(now.getFullYear(), 0, 1, 0, 0, 0, 0);
      break;
    }
    case 'custom': {
      if (!customStart || !customEnd) {
        throw new Error("Both 'startDate' and 'endDate' query parameters are required for custom date range");
      }
      start = new Date(customStart);
      end = new Date(customEnd);

      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        throw new Error("Invalid ISO date format for 'startDate' or 'endDate'");
      }
      if (start > end) {
        throw new Error("'startDate' must be before or equal to 'endDate'");
      }
      // Max range 5 years
      const maxMs = 5 * 365.25 * 24 * 60 * 60 * 1000;
      if (end.getTime() - start.getTime() > maxMs) {
        throw new Error('Custom date range cannot exceed 5 years');
      }
      // Ensure end covers whole day if set to midnight
      if (end.getHours() === 0 && end.getMinutes() === 0 && end.getSeconds() === 0) {
        end.setHours(23, 59, 59, 999);
      }
      break;
    }
    default: {
      // Default to last 30 days
      start = new Date(now);
      start.setDate(start.getDate() - 30);
      break;
    }
  }

  // Calculate equivalent previous period of matching duration
  const durationMs = end.getTime() - start.getTime();
  const prevEnd = new Date(start.getTime() - 1);
  const prevStart = new Date(prevEnd.getTime() - durationMs);

  return {
    preset,
    start,
    end,
    prevStart,
    prevEnd,
    durationMs
  };
};

/**
 * Calculates percentage change between current and previous values
 */
export const calculateTrendDiff = (current, previous) => {
  const cur = Number(current) || 0;
  const prev = Number(previous) || 0;
  const diff = cur - prev;

  if (prev === 0) {
    return {
      current: cur,
      previous: prev,
      diff,
      changePercent: 'N/A',
      trend: diff > 0 ? 'increased' : diff < 0 ? 'decreased' : 'unchanged'
    };
  }

  const change = Number(((diff / prev) * 100).toFixed(1));
  return {
    current: cur,
    previous: prev,
    diff,
    changePercent: change,
    trend: change > 0 ? 'increased' : change < 0 ? 'decreased' : 'unchanged'
  };
};

/**
 * Escapes values for safe CSV export (OWASP CSV Injection Defense)
 * Prevents execution of formulas beginning with =, +, -, @
 */
export const sanitizeCsvCell = (value) => {
  if (value === null || value === undefined) return '""';
  let str = String(value).trim();
  // If the cell begins with an active formula character, neutralize by prepending single quote
  if (/^[=+\-@\t\r]/.test(str)) {
    str = `'${str}`;
  }
  // Escape embedded quotes
  return `"${str.replace(/"/g, '""')}"`;
};

/**
 * Gathers all active database or in-memory items within date filter
 */
const getItemsCollection = async (start, end, filters = {}) => {
  const isDbReady = mongoose.connection.readyState === 1;
  const query = { createdAt: { $gte: start, $lte: end } };

  if (filters.type) query.type = filters.type;
  if (filters.category) query.category = filters.category;
  if (filters.status) query.status = filters.status;
  if (filters.location) query.location = new RegExp(filters.location, 'i');

  if (isDbReady) {
    return await Item.find(query).lean();
  }

  return inMemoryStore.filter((item) => {
    const itemDate = new Date(item.createdAt || Date.now());
    if (itemDate < start || itemDate > end) return false;
    if (filters.type && item.type !== filters.type) return false;
    if (filters.category && item.category !== filters.category) return false;
    if (filters.status && item.status !== filters.status) return false;
    if (filters.location && !String(item.location || '').toLowerCase().includes(filters.location.toLowerCase())) return false;
    return true;
  });
};

/**
 * Gathers all active claims within date filter
 */
const getClaimsCollection = async (start, end) => {
  const isDbReady = mongoose.connection.readyState === 1;
  if (isDbReady) {
    return await Claim.find({ createdAt: { $gte: start, $lte: end } }).lean();
  }
  return inMemoryClaimStore.filter((c) => {
    const cDate = new Date(c.createdAt || Date.now());
    return cDate >= start && cDate <= end;
  });
};

/**
 * Gathers all active matches within date filter
 */
const getMatchesCollection = async (start, end) => {
  const isDbReady = mongoose.connection.readyState === 1;
  if (isDbReady) {
    return await Match.find({ createdAt: { $gte: start, $lte: end } }).lean();
  }
  return inMemoryMatchStore.filter((m) => {
    const mDate = new Date(m.createdAt || Date.now());
    return mDate >= start && mDate <= end;
  });
};

/**
 * Gathers all active returns within date filter
 */
const getReturnsCollection = async (start, end) => {
  const isDbReady = mongoose.connection.readyState === 1;
  if (isDbReady) {
    return await Return.find({ createdAt: { $gte: start, $lte: end } }).lean();
  }
  return inMemoryReturnStore.filter((r) => {
    const rDate = new Date(r.createdAt || Date.now());
    return rDate >= start && rDate <= end;
  });
};

/**
 * Gathers all users for demographic/department aggregation
 */
const getUsersCollection = async () => {
  const isDbReady = mongoose.connection.readyState === 1;
  if (isDbReady) {
    return await User.find({}).select('-passwordHash -password -resetPasswordToken').lean();
  }
  return Array.from(devUserMemoryMap.values());
};

/**
 * 1. OVERVIEW ANALYTICS & KPI METRICS
 */
export const getOverviewAnalytics = async (dateParams, filters = {}) => {
  const { start, end, prevStart, prevEnd } = dateParams;

  const [curItems, prevItems, curClaims, prevClaims, curMatches, prevMatches, curReturns, prevReturns] =
    await Promise.all([
      getItemsCollection(start, end, filters),
      getItemsCollection(prevStart, prevEnd, filters),
      getClaimsCollection(start, end),
      getClaimsCollection(prevStart, prevEnd),
      getMatchesCollection(start, end),
      getMatchesCollection(prevStart, prevEnd),
      getReturnsCollection(start, end),
      getReturnsCollection(prevStart, prevEnd)
    ]);

  // Cur counts
  const lostCount = curItems.filter((i) => i.type === 'lost').length;
  const foundCount = curItems.filter((i) => i.type === 'found').length;
  const prevLostCount = prevItems.filter((i) => i.type === 'lost').length;
  const prevFoundCount = prevItems.filter((i) => i.type === 'found').length;

  // Active cases: items currently in active search or pending workflow
  const activeStatuses = ['active', 'ACTIVE', 'claimed', 'CLAIMED', 'underReview', 'claimPending', 'matched', 'MATCH_FOUND'];
  const activeCases = curItems.filter((i) => activeStatuses.includes(i.status)).length;
  const prevActiveCases = prevItems.filter((i) => activeStatuses.includes(i.status)).length;

  // Resolved cases: items successfully returned or resolved
  const resolvedStatuses = ['returned', 'RETURNED', 'resolved', 'RESOLVED', 'CLOSED'];
  const resolvedCases = curItems.filter((i) => resolvedStatuses.includes(i.status)).length;
  const prevResolvedCases = prevItems.filter((i) => resolvedStatuses.includes(i.status)).length;

  // Disputed returns
  const disputedCases = curReturns.filter(
    (r) => r.status === 'DISPUTED' || (r.dispute && r.dispute.isDisputed)
  ).length;
  const prevDisputedCases = prevReturns.filter(
    (r) => r.status === 'DISPUTED' || (r.dispute && r.dispute.isDisputed)
  ).length;

  // Items successfully returned
  const returnedCount = curReturns.filter((r) => r.status === 'RETURNED').length ||
    curItems.filter((i) => String(i.status).toUpperCase() === 'RETURNED').length;
  const prevReturnedCount = prevReturns.filter((r) => r.status === 'RETURNED').length ||
    prevItems.filter((i) => String(i.status).toUpperCase() === 'RETURNED').length;

  // Recovery Rate: Returned Items / Eligible Cases (Active + Resolved)
  const eligibleCases = activeCases + resolvedCases;
  const recoveryRate = eligibleCases > 0 ? Number(((resolvedCases / eligibleCases) * 100).toFixed(1)) : 0;

  const prevEligibleCases = prevActiveCases + prevResolvedCases;
  const prevRecoveryRate = prevEligibleCases > 0 ? Number(((prevResolvedCases / prevEligibleCases) * 100).toFixed(1)) : 0;

  return {
    timeRange: {
      preset: dateParams.preset,
      startDate: start.toISOString(),
      endDate: end.toISOString()
    },
    metrics: {
      totalLost: calculateTrendDiff(lostCount, prevLostCount),
      totalFound: calculateTrendDiff(foundCount, prevFoundCount),
      totalReports: calculateTrendDiff(curItems.length, prevItems.length),
      totalClaims: calculateTrendDiff(curClaims.length, prevClaims.length),
      totalMatches: calculateTrendDiff(curMatches.length, prevMatches.length),
      totalReturns: calculateTrendDiff(curReturns.length, prevReturns.length),
      activeCases: calculateTrendDiff(activeCases, prevActiveCases),
      resolvedCases: calculateTrendDiff(resolvedCases, prevResolvedCases),
      disputedCases: calculateTrendDiff(disputedCases, prevDisputedCases),
      returnedCount: calculateTrendDiff(returnedCount, prevReturnedCount),
      recoveryRate: {
        current: `${recoveryRate}%`,
        previous: `${prevRecoveryRate}%`,
        value: recoveryRate,
        changePercent: prevRecoveryRate > 0 ? Number((recoveryRate - prevRecoveryRate).toFixed(1)) : 'N/A',
        definition: 'Successfully returned items / total eligible cases (active + resolved)'
      }
    }
  };
};

/**
 * 2. LOST VS FOUND ANALYTICS
 */
export const getLostVsFoundAnalytics = async (dateParams, filters = {}) => {
  const { start, end } = dateParams;
  const items = await getItemsCollection(start, end, filters);

  const lostItems = items.filter((i) => i.type === 'lost');
  const foundItems = items.filter((i) => i.type === 'found');

  const totalLost = lostItems.length;
  const totalFound = foundItems.length;
  const difference = totalLost - totalFound;
  const ratio = totalFound > 0 ? Number((totalLost / totalFound).toFixed(2)) : totalLost > 0 ? 'N/A' : '0.00';

  // Percentage with images
  const lostWithImages = lostItems.filter((i) => i.images && i.images.length > 0).length;
  const foundWithImages = foundItems.filter((i) => i.images && i.images.length > 0).length;
  const totalWithImages = lostWithImages + foundWithImages;

  const percentLostWithImages = totalLost > 0 ? Number(((lostWithImages / totalLost) * 100).toFixed(1)) : 0;
  const percentFoundWithImages = totalFound > 0 ? Number(((foundWithImages / totalFound) * 100).toFixed(1)) : 0;

  return {
    timeRange: {
      preset: dateParams.preset,
      startDate: start.toISOString(),
      endDate: end.toISOString()
    },
    comparison: {
      totalLost,
      totalFound,
      totalItems: items.length,
      difference,
      ratio,
      lostPercentage: items.length > 0 ? Number(((totalLost / items.length) * 100).toFixed(1)) : 0,
      foundPercentage: items.length > 0 ? Number(((totalFound / items.length) * 100).toFixed(1)) : 0,
      imageAttachmentRate: {
        overall: items.length > 0 ? Number(((totalWithImages / items.length) * 100).toFixed(1)) : 0,
        lost: percentLostWithImages,
        found: percentFoundWithImages
      }
    }
  };
};

/**
 * 3. CLAIMS ANALYTICS
 */
export const getClaimAnalytics = async (dateParams) => {
  const { start, end } = dateParams;
  const claims = await getClaimsCollection(start, end);

  const statusCounts = {
    pending: 0,
    underReview: 0,
    moreInfoRequired: 0,
    approved: 0,
    rejected: 0,
    completed: 0,
    cancelled: 0
  };

  let totalProcessingTimeMs = 0;
  let reviewedClaimsCount = 0;

  claims.forEach((claim) => {
    const s = String(claim.status || '').toLowerCase();
    if (s.includes('pending') || s === 'pending') statusCounts.pending++;
    else if (s.includes('review') || s === 'under_review') statusCounts.underReview++;
    else if (s.includes('info') || s === 'more_info_required') statusCounts.moreInfoRequired++;
    else if (s === 'approved') statusCounts.approved++;
    else if (s === 'rejected') statusCounts.rejected++;
    else if (s === 'completed') statusCounts.completed++;
    else if (s === 'cancelled') statusCounts.cancelled++;
    else statusCounts.pending++;

    // Calculate processing duration if reviewedAt is present
    if (claim.reviewedAt && claim.createdAt) {
      const reviewDuration = new Date(claim.reviewedAt).getTime() - new Date(claim.createdAt).getTime();
      if (reviewDuration >= 0) {
        totalProcessingTimeMs += reviewDuration;
        reviewedClaimsCount++;
      }
    }
  });

  const total = claims.length;
  const resolvedClaims = statusCounts.approved + statusCounts.rejected + statusCounts.completed;
  const approvalRate = resolvedClaims > 0 ? Number(((statusCounts.approved + statusCounts.completed) / resolvedClaims * 100).toFixed(1)) : 0;
  const rejectionRate = resolvedClaims > 0 ? Number((statusCounts.rejected / resolvedClaims * 100).toFixed(1)) : 0;
  const completionRate = total > 0 ? Number((statusCounts.completed / total * 100).toFixed(1)) : 0;

  // Average processing time in hours
  const avgProcessingHours = reviewedClaimsCount > 0
    ? Number((totalProcessingTimeMs / (reviewedClaimsCount * 3600000)).toFixed(1))
    : 0;

  return {
    timeRange: {
      preset: dateParams.preset,
      startDate: start.toISOString(),
      endDate: end.toISOString()
    },
    totalClaims: total,
    statusBreakdown: statusCounts,
    rates: {
      approvalRate: `${approvalRate}%`,
      rejectionRate: `${rejectionRate}%`,
      completionRate: `${completionRate}%`,
      pendingClaims: statusCounts.pending + statusCounts.underReview + statusCounts.moreInfoRequired
    },
    performance: {
      averageProcessingHours: avgProcessingHours,
      reviewedClaimsCount,
      definition: 'Average elapsed duration between claim submission and administrator review'
    }
  };
};

/**
 * 4. SMART MATCHING ANALYTICS
 */
export const getMatchAnalytics = async (dateParams) => {
  const { start, end } = dateParams;
  const matches = await getMatchesCollection(start, end);

  let highConfidence = 0;
  let possible = 0;
  let lowConfidence = 0;
  let scoreSum = 0;

  const statusBreakdown = {
    suggested: 0,
    viewed: 0,
    verified: 0,
    dismissed: 0,
    resolved: 0,
    rejected: 0
  };

  matches.forEach((m) => {
    const score = Number(m.matchScore) || 0;
    scoreSum += score;

    if (m.matchLevel === 'HIGH_POSSIBILITY' || score >= 80) {
      highConfidence++;
    } else if (m.matchLevel === 'LOW_POSSIBILITY' || score < 50) {
      lowConfidence++;
    } else {
      possible++;
    }

    const s = String(m.status || '').toLowerCase();
    if (statusBreakdown[s] !== undefined) {
      statusBreakdown[s]++;
    } else {
      statusBreakdown.suggested++;
    }
  });

  const total = matches.length;
  const avgScore = total > 0 ? Number((scoreSum / total).toFixed(1)) : 0;
  const verifiedMatches = statusBreakdown.verified + statusBreakdown.resolved;
  const verificationRate = total > 0 ? Number(((verifiedMatches / total) * 100).toFixed(1)) : 0;

  return {
    timeRange: {
      preset: dateParams.preset,
      startDate: start.toISOString(),
      endDate: end.toISOString()
    },
    totalMatches: total,
    confidenceBreakdown: {
      highConfidence,
      possible,
      lowConfidence,
      highConfidencePercentage: total > 0 ? Number(((highConfidence / total) * 100).toFixed(1)) : 0,
      possiblePercentage: total > 0 ? Number(((possible / total) * 100).toFixed(1)) : 0,
      lowConfidencePercentage: total > 0 ? Number(((lowConfidence / total) * 100).toFixed(1)) : 0
    },
    statusBreakdown,
    averageScore: avgScore,
    verificationRate: `${verificationRate}%`
  };
};

/**
 * 5. RETURN & HANDOVER WORKFLOW ANALYTICS
 */
export const getReturnAnalytics = async (dateParams) => {
  const { start, end } = dateParams;
  const returns = await getReturnsCollection(start, end);

  const statusBreakdown = {
    readyForReturn: 0,
    scheduled: 0,
    identityVerification: 0,
    handoverPending: 0,
    completed: 0,
    cancelled: 0,
    disputed: 0
  };

  let totalDurationMs = 0;
  let completedCountWithDuration = 0;

  returns.forEach((r) => {
    const s = String(r.status || '').toUpperCase();
    if (s === 'READY_FOR_RETURN') statusBreakdown.readyForReturn++;
    else if (s === 'SCHEDULED') statusBreakdown.scheduled++;
    else if (s === 'IDENTITY_VERIFICATION') statusBreakdown.identityVerification++;
    else if (s === 'HANDOVER_PENDING') statusBreakdown.handoverPending++;
    else if (s === 'RETURNED' || s === 'COMPLETED') statusBreakdown.completed++;
    else if (s === 'CANCELLED') statusBreakdown.cancelled++;
    else if (s === 'DISPUTED' || (r.dispute && r.dispute.isDisputed)) statusBreakdown.disputed++;
    else statusBreakdown.readyForReturn++;

    // Calculate time from return creation to completion
    if ((s === 'RETURNED' || s === 'COMPLETED') && r.createdAt) {
      const finishTime = r.completedAt ? new Date(r.completedAt).getTime() : new Date(r.updatedAt || r.createdAt).getTime();
      const elapsed = finishTime - new Date(r.createdAt).getTime();
      if (elapsed >= 0) {
        totalDurationMs += elapsed;
        completedCountWithDuration++;
      }
    }
  });

  const total = returns.length;
  const completionRate = total > 0 ? Number(((statusBreakdown.completed / total) * 100).toFixed(1)) : 0;
  const disputeRate = total > 0 ? Number(((statusBreakdown.disputed / total) * 100).toFixed(1)) : 0;
  const avgCompletionHours = completedCountWithDuration > 0
    ? Number((totalDurationMs / (completedCountWithDuration * 3600000)).toFixed(1))
    : 0;

  return {
    timeRange: {
      preset: dateParams.preset,
      startDate: start.toISOString(),
      endDate: end.toISOString()
    },
    totalReturns: total,
    statusBreakdown,
    completionRate: `${completionRate}%`,
    disputeRate: `${disputeRate}%`,
    averageCompletionHours: avgCompletionHours,
    recordsUsedForTiming: completedCountWithDuration
  };
};

/**
 * 6. RESOLUTION TIME METRICS
 */
export const getResolutionTimeAnalytics = async (dateParams) => {
  const { start, end } = dateParams;
  const [items, claims, returns] = await Promise.all([
    getItemsCollection(start, end),
    getClaimsCollection(start, end),
    getReturnsCollection(start, end)
  ]);

  // 1. Time from Lost Report -> Resolved / Returned (in hours)
  let lostResolutionMs = 0;
  let lostResolutionCount = 0;
  items.filter((i) => i.type === 'lost').forEach((item) => {
    const s = String(item.status || '').toUpperCase();
    if (['RETURNED', 'RESOLVED', 'CLOSED'].includes(s) && item.createdAt && item.updatedAt) {
      const elapsed = new Date(item.updatedAt).getTime() - new Date(item.createdAt).getTime();
      if (elapsed > 0) {
        lostResolutionMs += elapsed;
        lostResolutionCount++;
      }
    }
  });

  // 2. Time from Found Report -> Returned (in hours)
  let foundResolutionMs = 0;
  let foundResolutionCount = 0;
  items.filter((i) => i.type === 'found').forEach((item) => {
    const s = String(item.status || '').toUpperCase();
    if (['RETURNED', 'RESOLVED', 'CLAIMED'].includes(s) && item.createdAt && item.updatedAt) {
      const elapsed = new Date(item.updatedAt).getTime() - new Date(item.createdAt).getTime();
      if (elapsed > 0) {
        foundResolutionMs += elapsed;
        foundResolutionCount++;
      }
    }
  });

  // 3. Time for Claim Review
  let claimReviewMs = 0;
  let claimReviewCount = 0;
  claims.forEach((c) => {
    if (c.reviewedAt && c.createdAt) {
      const elapsed = new Date(c.reviewedAt).getTime() - new Date(c.createdAt).getTime();
      if (elapsed > 0) {
        claimReviewMs += elapsed;
        claimReviewCount++;
      }
    }
  });

  // 4. Time for Return Completion
  let returnCompleteMs = 0;
  let returnCompleteCount = 0;
  returns.forEach((r) => {
    if ((r.status === 'RETURNED' || r.completedAt) && r.createdAt) {
      const finish = r.completedAt ? new Date(r.completedAt).getTime() : new Date(r.updatedAt).getTime();
      const elapsed = finish - new Date(r.createdAt).getTime();
      if (elapsed > 0) {
        returnCompleteMs += elapsed;
        returnCompleteCount++;
      }
    }
  });

  return {
    timeRange: {
      preset: dateParams.preset,
      startDate: start.toISOString(),
      endDate: end.toISOString()
    },
    resolutionMetrics: {
      lostReportToResolutionHours: lostResolutionCount > 0 ? Number((lostResolutionMs / (lostResolutionCount * 3600000)).toFixed(1)) : 0,
      lostRecordsAnalyzed: lostResolutionCount,

      foundReportToReturnHours: foundResolutionCount > 0 ? Number((foundResolutionMs / (foundResolutionCount * 3600000)).toFixed(1)) : 0,
      foundRecordsAnalyzed: foundResolutionCount,

      claimReviewHours: claimReviewCount > 0 ? Number((claimReviewMs / (claimReviewCount * 3600000)).toFixed(1)) : 0,
      claimRecordsAnalyzed: claimReviewCount,

      returnCompletionHours: returnCompleteCount > 0 ? Number((returnCompleteMs / (returnCompleteCount * 3600000)).toFixed(1)) : 0,
      returnRecordsAnalyzed: returnCompleteCount
    }
  };
};

/**
 * 7. ITEM CATEGORY ANALYTICS
 */
export const getCategoryAnalytics = async (dateParams, filters = {}) => {
  const { start, end } = dateParams;
  const items = await getItemsCollection(start, end, filters);

  const categoryMap = {};

  items.forEach((item) => {
    const cat = item.category || 'Other';
    if (!categoryMap[cat]) {
      categoryMap[cat] = { category: cat, lost: 0, found: 0, returned: 0, total: 0 };
    }
    categoryMap[cat].total++;
    if (item.type === 'lost') categoryMap[cat].lost++;
    if (item.type === 'found') categoryMap[cat].found++;
    const s = String(item.status || '').toUpperCase();
    if (s === 'RETURNED' || s === 'RESOLVED') {
      categoryMap[cat].returned++;
    }
  });

  const categories = Object.values(categoryMap).map((c) => ({
    ...c,
    percentage: items.length > 0 ? Number(((c.total / items.length) * 100).toFixed(1)) : 0,
    recoveryRate: c.total > 0 ? Number(((c.returned / c.total) * 100).toFixed(1)) : 0
  })).sort((a, b) => b.total - a.total);

  return {
    timeRange: {
      preset: dateParams.preset,
      startDate: start.toISOString(),
      endDate: end.toISOString()
    },
    totalItems: items.length,
    categories
  };
};

/**
 * 8. LOCATION ANALYTICS
 */
export const getLocationAnalytics = async (dateParams, filters = {}) => {
  const { start, end } = dateParams;
  const items = await getItemsCollection(start, end, filters);

  const locationMap = {};

  items.forEach((item) => {
    const loc = normalizeLocation(item.location);
    if (!locationMap[loc]) {
      locationMap[loc] = { location: loc, lost: 0, found: 0, returned: 0, total: 0 };
    }
    locationMap[loc].total++;
    if (item.type === 'lost') locationMap[loc].lost++;
    if (item.type === 'found') locationMap[loc].found++;
    const s = String(item.status || '').toUpperCase();
    if (s === 'RETURNED' || s === 'RESOLVED') {
      locationMap[loc].returned++;
    }
  });

  const locations = Object.values(locationMap).map((l) => ({
    ...l,
    percentage: items.length > 0 ? Number(((l.total / items.length) * 100).toFixed(1)) : 0
  })).sort((a, b) => b.total - a.total);

  return {
    timeRange: {
      preset: dateParams.preset,
      startDate: start.toISOString(),
      endDate: end.toISOString()
    },
    totalItems: items.length,
    locations
  };
};

/**
 * 9. DEPARTMENT & ACADEMIC YEAR ANALYTICS (PRIVACY-SAFE)
 */
export const getDepartmentAnalytics = async (dateParams) => {
  const { start, end } = dateParams;
  const [items, users] = await Promise.all([
    getItemsCollection(start, end),
    getUsersCollection()
  ]);

  const userMap = {};
  users.forEach((u) => {
    const id = (u._id || u.id).toString();
    userMap[id] = u;
  });

  const departmentMap = {};
  const yearMap = {
    '1st Year': 0,
    '2nd Year': 0,
    '3rd Year': 0,
    '4th Year': 0,
    'Postgraduate / Other': 0
  };

  items.forEach((item) => {
    const reporterId = (item.reporter?._id || item.reporter || '').toString();
    const reporter = userMap[reporterId] || {};

    const dept = (reporter.department || 'General Campus / Unspecified').trim() || 'General Campus / Unspecified';
    if (!departmentMap[dept]) {
      departmentMap[dept] = { department: dept, reports: 0, lost: 0, found: 0 };
    }
    departmentMap[dept].reports++;
    if (item.type === 'lost') departmentMap[dept].lost++;
    if (item.type === 'found') departmentMap[dept].found++;

    const yr = Number(reporter.year);
    if (yr === 1) yearMap['1st Year']++;
    else if (yr === 2) yearMap['2nd Year']++;
    else if (yr === 3) yearMap['3rd Year']++;
    else if (yr === 4) yearMap['4th Year']++;
    else yearMap['Postgraduate / Other']++;
  });

  const departments = Object.values(departmentMap)
    .filter((d) => d.reports >= 1) // Privacy suppression for zero counts
    .sort((a, b) => b.reports - a.reports);

  return {
    timeRange: {
      preset: dateParams.preset,
      startDate: start.toISOString(),
      endDate: end.toISOString()
    },
    totalReports: items.length,
    departments,
    academicYears: Object.entries(yearMap).map(([year, count]) => ({
      year,
      count,
      percentage: items.length > 0 ? Number(((count / items.length) * 100).toFixed(1)) : 0
    }))
  };
};

/**
 * 10. TIME-BASED TREND ANALYTICS (Daily, Weekly, Monthly)
 */
export const getTrendAnalytics = async (dateParams, interval = 'daily') => {
  const { start, end } = dateParams;
  const [items, claims, returns] = await Promise.all([
    getItemsCollection(start, end),
    getClaimsCollection(start, end),
    getReturnsCollection(start, end)
  ]);

  const trends = {};

  const getBucketKey = (dateStr) => {
    const d = new Date(dateStr);
    if (interval === 'monthly') {
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    }
    if (interval === 'weekly') {
      // Find start of week (Sunday)
      const weekStart = new Date(d);
      weekStart.setDate(d.getDate() - d.getDay());
      return weekStart.toISOString().split('T')[0];
    }
    // Daily default
    return d.toISOString().split('T')[0];
  };

  // Populate buckets
  items.forEach((item) => {
    const key = getBucketKey(item.createdAt || item.date || Date.now());
    if (!trends[key]) {
      trends[key] = { date: key, lost: 0, found: 0, claims: 0, returns: 0 };
    }
    if (item.type === 'lost') trends[key].lost++;
    if (item.type === 'found') trends[key].found++;
  });

  claims.forEach((claim) => {
    const key = getBucketKey(claim.createdAt || Date.now());
    if (!trends[key]) {
      trends[key] = { date: key, lost: 0, found: 0, claims: 0, returns: 0 };
    }
    trends[key].claims++;
  });

  returns.forEach((ret) => {
    const key = getBucketKey(ret.createdAt || Date.now());
    if (!trends[key]) {
      trends[key] = { date: key, lost: 0, found: 0, claims: 0, returns: 0 };
    }
    trends[key].returns++;
  });

  // Sort chronological
  const timeline = Object.values(trends).sort((a, b) => a.date.localeCompare(b.date));

  return {
    timeRange: {
      preset: dateParams.preset,
      startDate: start.toISOString(),
      endDate: end.toISOString()
    },
    interval,
    timeline
  };
};

/**
 * 11. SECURE CSV EXPORT GENERATOR
 */
export const generateAnalyticsCsv = async (dataset, dateParams, filters = {}) => {
  let headers = [];
  let rows = [];

  switch (dataset) {
    case 'summary': {
      const overview = await getOverviewAnalytics(dateParams, filters);
      headers = ['Metric', 'Current_Period', 'Previous_Period', 'Difference', 'Change_Percentage'];
      const m = overview.metrics;
      rows = [
        ['Total Lost Reports', m.totalLost.current, m.totalLost.previous, m.totalLost.diff, m.totalLost.changePercent],
        ['Total Found Reports', m.totalFound.current, m.totalFound.previous, m.totalFound.diff, m.totalFound.changePercent],
        ['Total System Claims', m.totalClaims.current, m.totalClaims.previous, m.totalClaims.diff, m.totalClaims.changePercent],
        ['Total Smart Matches', m.totalMatches.current, m.totalMatches.previous, m.totalMatches.diff, m.totalMatches.changePercent],
        ['Total Return Workflows', m.totalReturns.current, m.totalReturns.previous, m.totalReturns.diff, m.totalReturns.changePercent],
        ['Active Cases', m.activeCases.current, m.activeCases.previous, m.activeCases.diff, m.activeCases.changePercent],
        ['Resolved Cases', m.resolvedCases.current, m.resolvedCases.previous, m.resolvedCases.diff, m.resolvedCases.changePercent],
        ['Recovery Rate', m.recoveryRate.current, m.recoveryRate.previous, 'N/A', m.recoveryRate.changePercent]
      ];
      break;
    }
    case 'categories': {
      const catData = await getCategoryAnalytics(dateParams, filters);
      headers = ['Category', 'Lost_Count', 'Found_Count', 'Returned_Count', 'Total_Reports', 'Percentage', 'Recovery_Rate'];
      rows = catData.categories.map((c) => [
        c.category,
        c.lost,
        c.found,
        c.returned,
        c.total,
        `${c.percentage}%`,
        `${c.recoveryRate}%`
      ]);
      break;
    }
    case 'locations': {
      const locData = await getLocationAnalytics(dateParams, filters);
      headers = ['Campus_Location', 'Lost_Count', 'Found_Count', 'Returned_Count', 'Total_Reports', 'Percentage'];
      rows = locData.locations.map((l) => [
        l.location,
        l.lost,
        l.found,
        l.returned,
        l.total,
        `${l.percentage}%`
      ]);
      break;
    }
    case 'trends': {
      const trendData = await getTrendAnalytics(dateParams, 'daily');
      headers = ['Date', 'Lost_Items', 'Found_Items', 'Claims_Filed', 'Returns_Processed'];
      rows = trendData.timeline.map((t) => [
        t.date,
        t.lost,
        t.found,
        t.claims,
        t.returns
      ]);
      break;
    }
    case 'departments': {
      const deptData = await getDepartmentAnalytics(dateParams);
      headers = ['Department', 'Lost_Reports', 'Found_Reports', 'Total_Reports'];
      rows = deptData.departments.map((d) => [
        d.department,
        d.lost,
        d.found,
        d.reports
      ]);
      break;
    }
    default: {
      throw new Error(`Unsupported export dataset: ${dataset}. Supported: 'summary', 'categories', 'locations', 'trends', 'departments'`);
    }
  }

  // Prepend metadata comments
  const metadataLines = [
    `# Campus Lost & Found System Analytics Export`,
    `# Dataset: ${dataset}`,
    `# Time Range: ${dateParams.start.toISOString().split('T')[0]} to ${dateParams.end.toISOString().split('T')[0]} (Preset: ${dateParams.preset})`,
    `# Generated At: ${new Date().toISOString()}`,
    `# Security: Formula injection sanitized`
  ];

  const csvRows = rows.map((r) => r.map(sanitizeCsvCell).join(','));
  const fullContent = [
    metadataLines.join('\n'),
    headers.map(sanitizeCsvCell).join(','),
    ...csvRows
  ].join('\n');

  return fullContent;
};

export default {
  parseDateRange,
  calculateTrendDiff,
  normalizeLocation,
  sanitizeCsvCell,
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
};
