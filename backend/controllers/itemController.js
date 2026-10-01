import mongoose from 'mongoose';
import Item from '../models/Item.js';
import LostItem from '../models/LostItem.js';
import FoundItem from '../models/FoundItem.js';
import MatchingService from '../services/matchingService.js';
import AuditService from '../services/auditService.js';
import {
  AUDIT_ACTIONS,
  LOST_ITEM_STATUSES,
  FOUND_ITEM_STATUSES,
  ALL_LOST_ITEM_STATUSES,
  ALL_FOUND_ITEM_STATUSES,
  ROLES
} from '../utils/constants.js';
import { verifyAccessToken } from '../utils/generateToken.js';

// Lifecycle valid transitions map
export const LOST_STATUS_TRANSITIONS = {
  ACTIVE: ['MATCH_FOUND', 'CLAIM_IN_PROGRESS', 'RESOLVED', 'CLOSED'],
  MATCH_FOUND: ['ACTIVE', 'CLAIM_IN_PROGRESS', 'RESOLVED', 'CLOSED'],
  CLAIM_IN_PROGRESS: ['ACTIVE', 'MATCH_FOUND', 'RESOLVED', 'CLOSED'],
  RESOLVED: ['ACTIVE', 'CLOSED'],
  CLOSED: ['ACTIVE']
};

export const FOUND_STATUS_TRANSITIONS = {
  FOUND: ['UNDER_VERIFICATION', 'CLAIMED', 'RETURNED', 'CLOSED', 'EXPIRED'],
  UNDER_VERIFICATION: ['FOUND', 'CLAIMED', 'RETURNED', 'CLOSED'],
  CLAIMED: ['UNDER_VERIFICATION', 'RETURNED', 'CLOSED'],
  RETURNED: ['CLOSED'],
  CLOSED: ['FOUND'],
  EXPIRED: ['CLOSED']
};

// In-Memory Dev Store for offline development & interactive testing
export const inMemoryStore = [];

/**
 * Format item document safely for API output
 */
export const formatItemResponse = (item) => {
  if (!item) return null;
  const doc = item.toObject ? item.toObject() : { ...item };
  return {
    ...doc,
    _id: doc._id || doc.id,
    id: doc._id || doc.id,
    itemName: doc.itemName || doc.title,
    title: doc.title || doc.itemName,
    dateLost: doc.dateLost || (doc.type === 'lost' ? doc.date : undefined),
    dateFound: doc.dateFound || (doc.type === 'found' ? doc.date : undefined),
    timeLost: doc.timeLost || (doc.type === 'lost' ? doc.time : undefined),
    timeFound: doc.timeFound || (doc.type === 'found' ? doc.time : undefined),
    identifyingMarks: doc.identifyingMarks || doc.identifyingFeatures
  };
};

/**
 * Tokenize and generate smart search regexes with plural/singular stem support
 */
export const buildSmartSearchTerms = (searchString) => {
  if (!searchString || typeof searchString !== 'string') return [];
  const rawTerms = searchString.trim().split(/\s+/).filter(Boolean);

  return rawTerms.map((term) => {
    const variants = new Set([term]);
    if (term.endsWith('ies') && term.length > 3) {
      variants.add(term.slice(0, -3) + 'y');
    } else if (term.endsWith('es') && term.length > 3) {
      variants.add(term.slice(0, -2));
    } else if (term.endsWith('s') && term.length > 2) {
      variants.add(term.slice(0, -1));
    }

    const pattern = Array.from(variants)
      .map((v) => v.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
      .join('|');
    return new RegExp(`(?:${pattern})`, 'i');
  });
};

/**
 * @desc Create a new item report (Lost or Found)
 * @route POST /api/items, POST /api/lost-items, POST /api/found-items
 * @access Private
 */
export const createItem = async (req, res, next) => {
  try {
    const {
      title,
      itemName,
      description,
      type = 'lost',
      category,
      subcategory,
      images,
      color,
      brand,
      model,
      identifyingFeatures,
      identifyingMarks,
      location,
      locationDetails,
      storageLocation,
      estimatedValue,
      date,
      dateLost,
      dateFound,
      time,
      timeLost,
      timeFound,
      visibility,
      contactPreference
    } = req.body;

    const resolvedTitle = (itemName || title || '').trim();
    const resolvedMarks = (identifyingMarks || identifyingFeatures || '').trim();
    const resolvedDate = date || (type === 'lost' ? dateLost : dateFound) || new Date();
    const resolvedTime = time || (type === 'lost' ? timeLost : timeFound) || '';
    const initialStatus = type === 'lost' ? LOST_ITEM_STATUSES.ACTIVE : FOUND_ITEM_STATUSES.FOUND;

    // Build payload
    const itemData = {
      _id: new mongoose.Types.ObjectId(),
      title: resolvedTitle,
      itemName: resolvedTitle,
      description: description?.trim() || '',
      type: type.toLowerCase(),
      category,
      subcategory: subcategory || '',
      images: Array.isArray(images) ? images : [],
      color: color?.trim() || '',
      brand: brand?.trim() || '',
      model: model?.trim() || '',
      identifyingFeatures: resolvedMarks,
      identifyingMarks: resolvedMarks,
      location: location?.trim() || 'Campus',
      locationDetails: locationDetails?.trim() || '',
      storageLocation: storageLocation?.trim() || (type === 'found' ? 'Administration & Security Desk' : ''),
      estimatedValue: estimatedValue ? Number(estimatedValue) : null,
      date: resolvedDate,
      dateLost: type === 'lost' ? resolvedDate : undefined,
      dateFound: type === 'found' ? resolvedDate : undefined,
      time: resolvedTime,
      timeLost: type === 'lost' ? resolvedTime : undefined,
      timeFound: type === 'found' ? resolvedTime : undefined,
      reporter: req.user?._id || new mongoose.Types.ObjectId(),
      status: initialStatus,
      visibility: visibility || 'public',
      contactPreference: contactPreference || 'inApp',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    let savedItem;

    if (mongoose.connection.readyState === 1) {
      // Use specialized Mongoose model if appropriate
      if (itemData.type === 'lost') {
        savedItem = await LostItem.create(itemData);
      } else {
        savedItem = await FoundItem.create(itemData);
      }

      // Also track in dev memory store
      inMemoryStore.unshift(savedItem.toObject());

      // Trigger match computation
      try {
        await MatchingService.findMatchesForItem(savedItem);
      } catch (err) {
        console.error('[Item Matching Error]', err.message);
      }

      // Audit Log
      await AuditService.log({
        actor: req.user._id,
        actorEmail: req.user.email,
        action: AUDIT_ACTIONS.REPORT_CREATION,
        entityType: 'Item',
        entityId: savedItem._id,
        metadata: { type: savedItem.type, category: savedItem.category, title: savedItem.title },
        ipAddress: req.ip,
        userAgent: req.headers['user-agent']
      });
    } else {
      // Offline fallback: save to memory store with user info
      itemData.reporter = {
        _id: req.user?._id || itemData.reporter,
        fullName: req.user?.fullName || req.user?.name || 'Authenticated Student',
        department: req.user?.department || 'Campus Student'
      };
      inMemoryStore.unshift(itemData);
      savedItem = itemData;

      // Trigger matching engine in offline fallback mode
      try {
        await MatchingService.findMatchesForItem(savedItem);
      } catch (err) {
        console.error('[Offline Item Matching Error]', err.message);
      }
    }

    return res.status(201).json({
      success: true,
      message: `${itemData.type === 'lost' ? 'Lost' : 'Found'} item reported successfully`,
      data: formatItemResponse(savedItem)
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Create lost item report
 * @route POST /api/lost-items
 * @access Private
 */
export const createLostItem = async (req, res, next) => {
  req.body.type = 'lost';
  return createItem(req, res, next);
};

/**
 * @desc Create found item report
 * @route POST /api/found-items
 * @access Private
 */
export const createFoundItem = async (req, res, next) => {
  req.body.type = 'found';
  return createItem(req, res, next);
};

/**
 * @desc Get all reported items with intelligent search, multi-term fuzzy matching, filters, and pagination
 * @route GET /api/items, GET /api/lost-items, GET /api/found-items
 * @access Public
 */
export const getItems = async (req, res, next) => {
  try {
    const {
      search,
      q,
      type,
      category,
      status,
      location,
      brand,
      color,
      dateFrom,
      startDate,
      dateTo,
      endDate,
      sort = 'newest',
      page = 1,
      limit = 12
    } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 12));
    const skip = (pageNum - 1) * limitNum;

    const resolvedSearch = (search || q || '').trim();
    const fromDate = dateFrom || startDate;
    const toDate = dateTo || endDate;

    // Sorting rule
    let sortOptions = { createdAt: -1 };
    if (sort === 'oldest' || sort === 'createdAt') {
      sortOptions = { createdAt: 1 };
    } else if (sort === 'recentlyUpdated' || sort === 'recently_updated' || sort === '-updatedAt') {
      sortOptions = { updatedAt: -1 };
    } else if (sort === 'date' || sort === '-date') {
      sortOptions = { date: -1 };
    }

    // 1. If MongoDB is connected: execute MongoDB query
    if (mongoose.connection.readyState === 1) {
      const query = {};

      if (type) {
        query.type = type.toLowerCase();
      }

      if (category && category !== 'all') {
        query.category = { $regex: new RegExp(`^${category.trim()}$`, 'i') };
      }

      if (status && status !== 'all') {
        query.status = { $regex: new RegExp(`^${status.trim()}$`, 'i') };
      }

      if (location && location !== 'all') {
        query.location = { $regex: location.trim(), $options: 'i' };
      }

      if (brand && brand !== 'all') {
        query.brand = { $regex: brand.trim(), $options: 'i' };
      }

      if (color && color !== 'all') {
        query.color = { $regex: color.trim(), $options: 'i' };
      }

      if (fromDate || toDate) {
        const dateCondition = {};
        if (fromDate) dateCondition.$gte = new Date(fromDate);
        if (toDate) {
          const tDate = new Date(toDate);
          tDate.setHours(23, 59, 59, 999);
          dateCondition.$lte = tDate;
        }
        query.$or = [{ date: dateCondition }, { dateLost: dateCondition }, { dateFound: dateCondition }];
      }

      // Smart Multi-Term Search Layer
      if (resolvedSearch) {
        const searchRegexes = buildSmartSearchTerms(resolvedSearch);
        if (searchRegexes.length > 0) {
          const termConditions = searchRegexes.map((rx) => ({
            $or: [
              { itemName: rx },
              { title: rx },
              { brand: rx },
              { model: rx },
              { color: rx },
              { category: rx },
              { location: rx },
              { locationDetails: rx },
              { description: rx }
            ]
          }));
          query.$and = termConditions;
        }
      }

      const [rawItems, totalCount] = await Promise.all([
        Item.find(query)
          .populate('reporter', 'fullName department')
          .select('-identifyingFeatures -identifyingMarks') // Protect confidential student identifiers
          .sort(sortOptions)
          .skip(skip)
          .limit(limitNum)
          .lean(),
        Item.countDocuments(query)
      ]);

      const items = rawItems.map(formatItemResponse);

      return res.status(200).json({
        success: true,
        message: 'Items retrieved successfully',
        data: items,
        meta: {
          pagination: {
            page: pageNum,
            limit: limitNum,
            totalItems: totalCount,
            totalPages: Math.ceil(totalCount / limitNum) || 1
          }
        },
        pagination: {
          page: pageNum,
          limit: limitNum,
          totalItems: totalCount,
          totalPages: Math.ceil(totalCount / limitNum) || 1
        }
      });
    }

    // 2. Offline / Dev In-Memory filtering with same smart search logic
    let filtered = [...inMemoryStore];

    if (type) {
      filtered = filtered.filter((i) => i.type?.toLowerCase() === type.toLowerCase());
    }

    if (category && category !== 'all') {
      filtered = filtered.filter(
        (i) => i.category?.toLowerCase() === category.trim().toLowerCase()
      );
    }

    if (status && status !== 'all') {
      filtered = filtered.filter(
        (i) => i.status?.toLowerCase() === status.trim().toLowerCase()
      );
    }

    if (location && location !== 'all') {
      filtered = filtered.filter((i) =>
        i.location?.toLowerCase().includes(location.trim().toLowerCase())
      );
    }

    if (brand && brand !== 'all') {
      filtered = filtered.filter((i) =>
        i.brand?.toLowerCase().includes(brand.trim().toLowerCase())
      );
    }

    if (color && color !== 'all') {
      filtered = filtered.filter((i) =>
        i.color?.toLowerCase().includes(color.trim().toLowerCase())
      );
    }

    if (fromDate || toDate) {
      const fromTime = fromDate ? new Date(fromDate).getTime() : 0;
      const toTime = toDate
        ? new Date(new Date(toDate).setHours(23, 59, 59, 999)).getTime()
        : Infinity;
      filtered = filtered.filter((i) => {
        const itemTime = new Date(i.date || i.dateLost || i.dateFound || i.createdAt).getTime();
        return itemTime >= fromTime && itemTime <= toTime;
      });
    }

    if (resolvedSearch) {
      const terms = buildSmartSearchTerms(resolvedSearch);
      filtered = filtered.filter((item) => {
        const fullContent = [
          item.itemName,
          item.title,
          item.brand,
          item.model,
          item.color,
          item.category,
          item.location,
          item.locationDetails,
          item.description
        ]
          .filter(Boolean)
          .join(' ');

        // All search tokens must match somewhere in item's fields
        return terms.every((rx) => rx.test(fullContent));
      });
    }

    // Sort in-memory
    filtered.sort((a, b) => {
      if (sort === 'oldest' || sort === 'createdAt') {
        return new Date(a.createdAt) - new Date(b.createdAt);
      }
      if (sort === 'recentlyUpdated' || sort === 'recently_updated' || sort === '-updatedAt') {
        return new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt);
      }
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

    const totalCount = filtered.length;
    const paginatedItems = filtered.slice(skip, skip + limitNum).map((item) => {
      const copy = { ...item };
      delete copy.identifyingMarks;
      delete copy.identifyingFeatures;
      return formatItemResponse(copy);
    });

    return res.status(200).json({
      success: true,
      message: 'Items retrieved successfully',
      data: paginatedItems,
      meta: {
        pagination: {
          page: pageNum,
          limit: limitNum,
          totalItems: totalCount,
          totalPages: Math.ceil(totalCount / limitNum) || 1
        }
      },
      pagination: {
        page: pageNum,
        limit: limitNum,
        totalItems: totalCount,
        totalPages: Math.ceil(totalCount / limitNum) || 1
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Get lost items list
 * @route GET /api/lost-items
 * @access Public
 */
export const getLostItems = async (req, res, next) => {
  req.query.type = 'lost';
  return getItems(req, res, next);
};

/**
 * @desc Get found items list
 * @route GET /api/found-items
 * @access Public
 */
export const getFoundItems = async (req, res, next) => {
  req.query.type = 'found';
  return getItems(req, res, next);
};

/**
 * @desc Get detailed item record by ID
 * @route GET /api/items/:id, GET /api/lost-items/:id, GET /api/found-items/:id
 * @access Public
 */
export const getItemById = async (req, res, next) => {
  try {
    let item;

    if (mongoose.connection.readyState === 1) {
      item = await Item.findById(req.params.id)
        .populate('reporter', 'fullName department course year')
        .lean();
    } else {
      item = inMemoryStore.find(
        (i) => (i._id?.toString() || i.id?.toString()) === req.params.id
      );
    }

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item record not found',
        errors: [{ message: 'No item matching the provided ID was found' }]
      });
    }

    // Clone to prevent mutating store
    const itemDoc = { ...item };

    // Resolve requester if Authorization header is supplied on public route
    let requester = req.user;
    if (!requester && req.headers?.authorization?.startsWith('Bearer ')) {
      try {
        const token = req.headers.authorization.split(' ')[1];
        const decoded = verifyAccessToken(token);
        if (decoded) {
          requester = {
            _id: decoded.userId || decoded._id,
            id: decoded.userId || decoded._id,
            role: decoded.role || ROLES.STUDENT,
            email: decoded.email
          };
        }
      } catch (err) {
        // invalid token on public route is ignored, treated as guest
      }
    }

    // Check if requester is authorized to view private identifying marks
    const reporterId = (itemDoc.reporter?._id || itemDoc.reporter?.id || itemDoc.reporter)?.toString();
    const requesterId = (requester?._id || requester?.id)?.toString();
    const isReporter = Boolean(requesterId && reporterId && requesterId === reporterId);
    const isPrivileged =
      requester && [ROLES.ADMIN, ROLES.SUPERADMIN, ROLES.STAFF].includes(requester.role);

    if (!isReporter && !isPrivileged) {
      delete itemDoc.identifyingFeatures;
      delete itemDoc.identifyingMarks;
    }

    return res.status(200).json({
      success: true,
      message: 'Item retrieved successfully',
      data: formatItemResponse(itemDoc)
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Get currently authenticated user's own reports
 * @route GET /api/items/my, GET /api/lost-items/my, GET /api/found-items/my
 * @access Private
 */
export const getMyReports = async (req, res, next) => {
  try {
    const userId = (req.user?._id || req.user?.id)?.toString();
    const targetType = req.query.type?.toLowerCase();

    if (mongoose.connection.readyState === 1) {
      const query = { reporter: req.user._id };
      if (targetType) {
        query.type = targetType;
      }

      const items = await Item.find(query).sort({ createdAt: -1 }).lean();

      return res.status(200).json({
        success: true,
        message: 'My reports retrieved successfully',
        data: items.map(formatItemResponse)
      });
    }

    // In-memory fallback
    const userReports = inMemoryStore.filter((item) => {
      const itemReporter = (item.reporter?._id || item.reporter?.id || item.reporter)?.toString();
      const matchUser = Boolean(userId && itemReporter && itemReporter === userId);
      if (!matchUser) return false;
      if (targetType) return item.type === targetType;
      return true;
    });

    return res.status(200).json({
      success: true,
      message: 'My reports retrieved successfully',
      data: userReports.map(formatItemResponse)
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Update an existing item report
 * @route PUT /api/items/:id, PUT /api/lost-items/:id, PUT /api/found-items/:id
 * @access Private
 */
export const updateItem = async (req, res, next) => {
  try {
    let item;
    const isDbReady = mongoose.connection.readyState === 1;

    if (isDbReady) {
      item = await Item.findById(req.params.id);
    } else {
      item = inMemoryStore.find(
        (i) => (i._id?.toString() || i.id?.toString()) === req.params.id
      );
    }

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found',
        errors: [{ message: 'No item matching provided ID' }]
      });
    }

    const reporterId = (item.reporter?._id || item.reporter?.id || item.reporter)?.toString();
    const requesterId = (req.user?._id || req.user?.id)?.toString();
    const isOwner = Boolean(requesterId && reporterId && requesterId === reporterId);
    const isPrivileged = [ROLES.ADMIN, ROLES.SUPERADMIN, ROLES.STAFF].includes(req.user.role);

    if (!isOwner && !isPrivileged) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to edit this item report',
        errors: [{ message: 'Only report creator or administrators can modify this item' }]
      });
    }

    // Controlled status lifecycle validation
    if (req.body.status) {
      const newStatus = req.body.status.toUpperCase();
      const currentStatus = (item.status || (item.type === 'lost' ? 'ACTIVE' : 'FOUND')).toUpperCase();

      if (item.type === 'lost') {
        if (!ALL_LOST_ITEM_STATUSES.includes(newStatus)) {
          return res.status(400).json({
            success: false,
            message: `Invalid status '${req.body.status}' for lost item. Valid options: ${ALL_LOST_ITEM_STATUSES.join(', ')}`,
            errors: [{ field: 'status', message: 'Status is not valid in lost item lifecycle' }]
          });
        }

        // Owner status transition limits
        if (!isPrivileged) {
          const allowedTransitions = LOST_STATUS_TRANSITIONS[currentStatus] || [];
          const studentAllowed = ['ACTIVE', 'RESOLVED', 'CLOSED'];
          if (!allowedTransitions.includes(newStatus) || !studentAllowed.includes(newStatus)) {
            return res.status(400).json({
              success: false,
              message: `Cannot transition lost item status from ${currentStatus} to ${newStatus}.`,
              errors: [{ field: 'status', message: `Allowed transitions: ${allowedTransitions.filter((s) => studentAllowed.includes(s)).join(', ')}` }]
            });
          }
        }

        item.status = newStatus;
      } else if (item.type === 'found') {
        if (!ALL_FOUND_ITEM_STATUSES.includes(newStatus)) {
          return res.status(400).json({
            success: false,
            message: `Invalid status '${req.body.status}' for found item. Valid options: ${ALL_FOUND_ITEM_STATUSES.join(', ')}`,
            errors: [{ field: 'status', message: 'Status is not valid in found item lifecycle' }]
          });
        }

        // Finder status transition limits
        if (!isPrivileged) {
          const allowedTransitions = FOUND_STATUS_TRANSITIONS[currentStatus] || [];
          const studentAllowed = ['FOUND', 'RETURNED', 'CLOSED'];
          if (!allowedTransitions.includes(newStatus) || !studentAllowed.includes(newStatus)) {
            return res.status(400).json({
              success: false,
              message: `Cannot transition found item status from ${currentStatus} to ${newStatus}.`,
              errors: [{ field: 'status', message: `Allowed transitions: ${allowedTransitions.filter((s) => studentAllowed.includes(s)).join(', ')}` }]
            });
          }
        }

        item.status = newStatus;
      }
    }

    const updatableFields = [
      'title',
      'itemName',
      'description',
      'category',
      'subcategory',
      'color',
      'brand',
      'model',
      'identifyingFeatures',
      'identifyingMarks',
      'location',
      'locationDetails',
      'storageLocation',
      'estimatedValue',
      'date',
      'dateLost',
      'dateFound',
      'time',
      'timeLost',
      'timeFound',
      'images',
      'visibility',
      'contactPreference'
    ];

    updatableFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        item[field] = req.body[field];
      }
    });

    item.updatedAt = new Date();

    if (isDbReady) {
      await item.save();

      await AuditService.log({
        actor: req.user._id,
        actorEmail: req.user.email,
        action: AUDIT_ACTIONS.REPORT_MODIFICATION,
        entityType: 'Item',
        entityId: item._id,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent']
      });
    }

    // Trigger match computation on update as required by Phase 5
    try {
      await MatchingService.findMatchesForItem(item);
    } catch (err) {
      console.error('[Update Item Matching Error]', err.message);
    }

    return res.status(200).json({
      success: true,
      message: 'Item updated successfully',
      data: formatItemResponse(item)
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Delete or cancel an item report
 * @route DELETE /api/items/:id, DELETE /api/lost-items/:id, DELETE /api/found-items/:id
 * @access Private
 */
export const deleteItem = async (req, res, next) => {
  try {
    const isDbReady = mongoose.connection.readyState === 1;
    let item;

    if (isDbReady) {
      item = await Item.findById(req.params.id);
    } else {
      item = inMemoryStore.find(
        (i) => (i._id?.toString() || i.id?.toString()) === req.params.id
      );
    }

    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item not found',
        errors: [{ message: 'No item matching provided ID' }]
      });
    }

    const reporterId = (item.reporter?._id || item.reporter?.id || item.reporter)?.toString();
    const requesterId = (req.user?._id || req.user?.id)?.toString();
    const isOwner = Boolean(requesterId && reporterId && requesterId === reporterId);
    const isPrivileged = [ROLES.ADMIN, ROLES.SUPERADMIN, ROLES.STAFF].includes(req.user.role);

    if (!isOwner && !isPrivileged) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this item report',
        errors: [{ message: 'Only creator or administrators can delete this item' }]
      });
    }

    if (isDbReady) {
      await Item.findByIdAndDelete(req.params.id);

      await AuditService.log({
        actor: req.user._id,
        actorEmail: req.user.email,
        action: AUDIT_ACTIONS.REPORT_DELETION,
        entityType: 'Item',
        entityId: req.params.id,
        metadata: { title: item.title, type: item.type },
        ipAddress: req.ip,
        userAgent: req.headers['user-agent']
      });
    } else {
      const idx = inMemoryStore.findIndex(
        (i) => (i._id?.toString() || i.id?.toString()) === req.params.id
      );
      if (idx !== -1) {
        inMemoryStore.splice(idx, 1);
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Item report deleted successfully',
      data: {}
    });
  } catch (error) {
    next(error);
  }
};

export default {
  createItem,
  createLostItem,
  createFoundItem,
  getItems,
  getLostItems,
  getFoundItems,
  getItemById,
  getMyReports,
  updateItem,
  deleteItem
};
