import mongoose from 'mongoose';
import Item from '../models/Item.js';
import Match from '../models/Match.js';
import NotificationService from './notificationService.js';
import { inMemoryStore } from '../controllers/itemController.js';
import {
  NOTIFICATION_TYPES,
  MATCH_STATUSES,
  MATCH_LEVELS,
  MATCH_THRESHOLDS,
  ITEM_STATUSES
} from '../utils/constants.js';

// In-Memory Match store for offline development / testing
export const inMemoryMatchStore = [];

/**
 * Helper to tokenize string into lowercase alphanumeric words
 */
const tokenize = (text) => {
  if (!text || typeof text !== 'string') return [];
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 1);
};

/**
 * Calculates Jaccard token similarity between two strings (0.0 to 1.0)
 */
const calculateTokenSimilarity = (strA, strB) => {
  const tokensA = new Set(tokenize(strA));
  const tokensB = new Set(tokenize(strB));
  if (tokensA.size === 0 || tokensB.size === 0) return 0;

  let intersection = 0;
  for (const token of tokensA) {
    if (tokensB.has(token)) intersection++;
  }

  const union = new Set([...tokensA, ...tokensB]).size;
  return union === 0 ? 0 : intersection / union;
};

/**
 * Sanitizes item for match views (hides private identifying marks & personal contact credentials)
 */
export const sanitizeItemForMatchView = (item, requesterId) => {
  if (!item) return null;
  const doc = item.toObject ? item.toObject() : { ...item };
  const reporterId = (doc.reporter?._id || doc.reporter?.id || doc.reporter)?.toString();
  const reqId = requesterId?.toString();
  const isOwner = Boolean(reqId && reporterId && reqId === reporterId);

  // If not the owner of this item, strip identifying marks and contact info
  if (!isOwner) {
    delete doc.identifyingMarks;
    delete doc.identifyingFeatures;
    if (doc.reporter && typeof doc.reporter === 'object') {
      delete doc.reporter.email;
      delete doc.reporter.phoneNumber;
      delete doc.reporter.phone;
      delete doc.reporter.registerNumber;
    }
  }
  return doc;
};

/**
 * Service for computing deterministic correlation matches between lost and found items
 */
export class MatchingService {
  /**
   * Deterministic matching algorithm between a lost item and a found item
   * Total max: 100 points
   */
  static calculateMatchScore(lostItem, foundItem) {
    let score = 0;
    const factorBreakdown = {
      category: 0,
      itemName: 0,
      brand: 0,
      model: 0,
      color: 0,
      location: 0,
      date: 0,
      description: 0,
      reasons: []
    };

    // 1. Category (25 points)
    const lostCat = (lostItem.category || '').toLowerCase().trim();
    const foundCat = (foundItem.category || '').toLowerCase().trim();
    if (lostCat && foundCat) {
      if (lostCat === foundCat) {
        factorBreakdown.category = 25;
        score += 25;
        factorBreakdown.reasons.push(`Exact category match (${lostItem.category})`);
      } else {
        // Related categories check
        const relatedElectronics = ['electronics', 'mobile phone', 'laptop', 'charger', 'watch'];
        if (
          relatedElectronics.includes(lostCat) &&
          relatedElectronics.includes(foundCat)
        ) {
          factorBreakdown.category = 15;
          score += 15;
          factorBreakdown.reasons.push(`Related electronics category (${lostItem.category} ↔ ${foundItem.category})`);
        }
      }
    }

    // 2. Item Name Similarity (up to 20 points)
    const lostName = (lostItem.itemName || lostItem.title || '').trim();
    const foundName = (foundItem.itemName || foundItem.title || '').trim();
    if (lostName && foundName) {
      if (lostName.toLowerCase() === foundName.toLowerCase()) {
        factorBreakdown.itemName = 20;
        score += 20;
        factorBreakdown.reasons.push('Identical item name');
      } else {
        const similarity = calculateTokenSimilarity(lostName, foundName);
        if (similarity > 0) {
          const pts = Math.min(20, Math.round(similarity * 20));
          factorBreakdown.itemName = pts;
          score += pts;
          factorBreakdown.reasons.push(`Correlating item title keywords (${Math.round(similarity * 100)}% keyword overlap)`);
        } else if (
          lostName.toLowerCase().includes(foundName.toLowerCase()) ||
          foundName.toLowerCase().includes(lostName.toLowerCase())
        ) {
          factorBreakdown.itemName = 12;
          score += 12;
          factorBreakdown.reasons.push('Item title substring correlation');
        }
      }
    }

    // 3. Brand Match (up to 15 points)
    const lostBrand = (lostItem.brand || '').toLowerCase().trim();
    const foundBrand = (foundItem.brand || '').toLowerCase().trim();
    if (lostBrand && foundBrand) {
      if (lostBrand === foundBrand) {
        factorBreakdown.brand = 15;
        score += 15;
        factorBreakdown.reasons.push(`Matching manufacturer/brand (${lostItem.brand})`);
      } else if (lostBrand.includes(foundBrand) || foundBrand.includes(lostBrand)) {
        factorBreakdown.brand = 10;
        score += 10;
        factorBreakdown.reasons.push(`Related brand indication (${lostItem.brand})`);
      }
    } else if (lostBrand && foundName.toLowerCase().includes(lostBrand)) {
      factorBreakdown.brand = 10;
      score += 10;
      factorBreakdown.reasons.push(`Brand "${lostItem.brand}" referenced in found title`);
    } else if (foundBrand && lostName.toLowerCase().includes(foundBrand)) {
      factorBreakdown.brand = 10;
      score += 10;
      factorBreakdown.reasons.push(`Brand "${foundItem.brand}" referenced in lost report`);
    }

    // 4. Model Match (up to 10 points)
    const lostModel = (lostItem.model || '').toLowerCase().trim();
    const foundModel = (foundItem.model || '').toLowerCase().trim();
    if (lostModel && foundModel) {
      if (lostModel === foundModel) {
        factorBreakdown.model = 10;
        score += 10;
        factorBreakdown.reasons.push(`Matching model number (${lostItem.model})`);
      } else if (lostModel.includes(foundModel) || foundModel.includes(lostModel)) {
        factorBreakdown.model = 7;
        score += 7;
        factorBreakdown.reasons.push(`Partial model match (${lostItem.model})`);
      }
    }

    // 5. Color Match (up to 10 points)
    const lostColor = (lostItem.color || '').toLowerCase().trim();
    const foundColor = (foundItem.color || '').toLowerCase().trim();
    if (lostColor && foundColor) {
      if (lostColor === foundColor) {
        factorBreakdown.color = 10;
        score += 10;
        factorBreakdown.reasons.push(`Matching color (${lostItem.color})`);
      } else if (lostColor.includes(foundColor) || foundColor.includes(lostColor)) {
        factorBreakdown.color = 6;
        score += 6;
        factorBreakdown.reasons.push(`Compatible color hue (${lostItem.color} ↔ ${foundItem.color})`);
      }
    } else if (lostColor && foundName.toLowerCase().includes(lostColor)) {
      factorBreakdown.color = 6;
      score += 6;
      factorBreakdown.reasons.push(`Color "${lostItem.color}" noted in found description/title`);
    }

    // 6. Location Proximity (up to 10 points)
    const lostLoc = (lostItem.location || '').toLowerCase().trim();
    const foundLoc = (foundItem.location || '').toLowerCase().trim();
    if (lostLoc && foundLoc) {
      if (lostLoc === foundLoc) {
        factorBreakdown.location = 10;
        score += 10;
        factorBreakdown.reasons.push(`Matching campus incident location (${lostItem.location})`);
      } else if (lostLoc.includes(foundLoc) || foundLoc.includes(lostLoc)) {
        factorBreakdown.location = 8;
        score += 8;
        factorBreakdown.reasons.push(`Near same campus zone (${lostItem.location} / ${foundItem.location})`);
      }
    }

    // 7. Date Proximity (up to 5 points)
    const lostDate = lostItem.dateLost || lostItem.date;
    const foundDate = foundItem.dateFound || foundItem.date;
    if (lostDate && foundDate) {
      const diffMs = Math.abs(new Date(foundDate) - new Date(lostDate));
      const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
      if (diffDays <= 2) {
        factorBreakdown.date = 5;
        score += 5;
        factorBreakdown.reasons.push(`Incident and discovery within ${diffDays} day(s)`);
      } else if (diffDays <= 7) {
        factorBreakdown.date = 4;
        score += 4;
        factorBreakdown.reasons.push(`Incident and discovery within ${diffDays} days`);
      } else if (diffDays <= 14) {
        factorBreakdown.date = 3;
        score += 3;
        factorBreakdown.reasons.push(`Incident and discovery within ${diffDays} days`);
      } else if (diffDays <= 30) {
        factorBreakdown.date = 1;
        score += 1;
        factorBreakdown.reasons.push(`Incident and discovery within past month`);
      }
    }

    // 8. Description Keyword Similarity (up to 5 points)
    const lostDesc = (lostItem.description || '').trim();
    const foundDesc = (foundItem.description || '').trim();
    if (lostDesc && foundDesc) {
      const descSim = calculateTokenSimilarity(lostDesc, foundDesc);
      if (descSim > 0.1) {
        const pts = Math.min(5, Math.max(1, Math.round(descSim * 5)));
        factorBreakdown.description = pts;
        score += pts;
        factorBreakdown.reasons.push('Correlating contextual details in description');
      }
    }

    const finalScore = Math.min(100, Math.round(score));

    // Determine match confidence level
    let matchLevel = MATCH_LEVELS.LOW_POSSIBILITY;
    if (finalScore >= MATCH_THRESHOLDS.HIGH) {
      matchLevel = MATCH_LEVELS.HIGH_POSSIBILITY;
    } else if (finalScore >= MATCH_THRESHOLDS.POSSIBLE) {
      matchLevel = MATCH_LEVELS.POSSIBLE;
    }

    return {
      matchScore: finalScore,
      matchLevel,
      matchingFactors: {
        ...factorBreakdown,
        // Legacy backward compatibility
        categorySimilarity: factorBreakdown.category,
        colorSimilarity: factorBreakdown.color,
        brandSimilarity: factorBreakdown.brand,
        locationProximity: factorBreakdown.location > 0,
        descriptionSimilarity: factorBreakdown.description,
        notes: factorBreakdown.reasons.join('; ')
      }
    };
  }

  /**
   * Scans complementary item reports and calculates match confidence
   * Called automatically whenever a Lost or Found item is reported/updated
   */
  static async findMatchesForItem(targetItem) {
    try {
      if (!targetItem) return [];
      const opposingType = targetItem.type?.toLowerCase() === 'lost' ? 'found' : 'lost';
      const targetId = (targetItem._id || targetItem.id)?.toString();

      let candidates = [];

      if (mongoose.connection.readyState === 1) {
        candidates = await Item.find({
          type: opposingType,
          status: {
            $in: [
              ITEM_STATUSES.ACTIVE,
              ITEM_STATUSES.STATUS_ACTIVE,
              ITEM_STATUSES.STATUS_FOUND,
              ITEM_STATUSES.STATUS_UNDER_VERIFICATION,
              'active',
              'found',
              'ACTIVE',
              'FOUND'
            ]
          },
          _id: { $ne: targetItem._id }
        })
          .limit(50)
          .lean();
      } else {
        // Dev in-memory store lookup
        candidates = inMemoryStore.filter((item) => {
          const itemType = item.type?.toLowerCase();
          const itemId = (item._id || item.id)?.toString();
          if (itemType !== opposingType) return false;
          if (itemId === targetId) return false;
          return true;
        });
      }

      const generatedMatches = [];

      for (const candidate of candidates) {
        const lostItem = targetItem.type?.toLowerCase() === 'lost' ? targetItem : candidate;
        const foundItem = targetItem.type?.toLowerCase() === 'found' ? targetItem : candidate;

        const { matchScore, matchLevel, matchingFactors } = this.calculateMatchScore(
          lostItem,
          foundItem
        );

        // Ignore matches below minimum visible threshold
        if (matchScore < MATCH_THRESHOLDS.MIN_VISIBLE) {
          continue;
        }

        const lostId = (lostItem._id || lostItem.id)?.toString();
        const foundId = (foundItem._id || foundItem.id)?.toString();

        if (mongoose.connection.readyState === 1) {
          const matchDoc = await Match.findOneAndUpdate(
            { lostItem: lostItem._id, foundItem: foundItem._id },
            {
              lostItem: lostItem._id,
              foundItem: foundItem._id,
              matchScore,
              matchLevel,
              matchingFactors,
              status: MATCH_STATUSES.SUGGESTED
            },
            { upsert: true, new: true, setDefaultsOnInsert: true }
          );

          generatedMatches.push(matchDoc);

          // Alert lost reporter if confidence >= 60
          if (matchScore >= MATCH_THRESHOLDS.POSSIBLE && lostItem.reporter) {
            const recipientId = lostItem.reporter._id || lostItem.reporter;
            await NotificationService.createNotification({
              recipient: recipientId,
              type: NOTIFICATION_TYPES.NEW_POSSIBLE_MATCH,
              title: 'Possible Match Identified',
              message: `A found item "${foundItem.itemName || foundItem.title}" has a ${matchScore}% similarity to your lost report "${lostItem.itemName || lostItem.title}".`,
              relatedItem: foundItem._id,
              relatedMatch: matchDoc._id,
              actionUrl: `/matches`,
              deduplicationKey: `match:${matchDoc._id}:${recipientId}`
            });
          }
        } else {
          // Dev in-memory match handling
          const existingIdx = inMemoryMatchStore.findIndex(
            (m) =>
              (m.lostItem?._id || m.lostItem?.id || m.lostItem)?.toString() === lostId &&
              (m.foundItem?._id || m.foundItem?.id || m.foundItem)?.toString() === foundId
          );

          const memMatch = {
            _id: existingIdx !== -1 ? inMemoryMatchStore[existingIdx]._id : new mongoose.Types.ObjectId(),
            lostItem,
            foundItem,
            matchScore,
            matchLevel,
            matchingFactors,
            status: MATCH_STATUSES.SUGGESTED,
            viewedByLostReporter: false,
            viewedByFoundReporter: false,
            createdAt: existingIdx !== -1 ? inMemoryMatchStore[existingIdx].createdAt : new Date(),
            updatedAt: new Date()
          };

          if (existingIdx !== -1) {
            inMemoryMatchStore[existingIdx] = memMatch;
          } else {
            inMemoryMatchStore.unshift(memMatch);
          }

          generatedMatches.push(memMatch);

          // Alert lost reporter in dev mode
          const lostReporterId = lostItem.reporter?._id || lostItem.reporter;
          if (matchScore >= MATCH_THRESHOLDS.POSSIBLE && lostReporterId) {
            await NotificationService.createNotification({
              recipient: lostReporterId,
              type: NOTIFICATION_TYPES.NEW_POSSIBLE_MATCH,
              title: 'Possible Match Identified',
              message: `A found item "${foundItem.itemName || foundItem.title}" has a ${matchScore}% similarity to your lost report "${lostItem.itemName || lostItem.title}".`,
              relatedItem: foundItem._id,
              relatedMatch: memMatch._id,
              actionUrl: `/matches`,
              deduplicationKey: `match:${memMatch._id}:${lostReporterId}`
            });
          }
        }
      }

      return generatedMatches;
    } catch (err) {
      console.error('[MatchingService Error] Error scanning matches:', err.message);
      return [];
    }
  }

  /**
   * Retrieves matches for all lost items reported by a specific user
   */
  static async getMatchesForUser(userId) {
    const uid = userId?.toString();

    if (mongoose.connection.readyState === 1) {
      const userItems = await Item.find({ reporter: userId }).select('_id type');
      const lostIds = userItems.filter((i) => i.type === 'lost').map((i) => i._id);
      const foundIds = userItems.filter((i) => i.type === 'found').map((i) => i._id);

      const matches = await Match.find({
        $or: [{ lostItem: { $in: lostIds } }, { foundItem: { $in: foundIds } }]
      })
        .populate('lostItem', 'itemName title category location locationDetails date dateLost status images reporter')
        .populate('foundItem', 'itemName title category location locationDetails date dateFound status images storageLocation reporter')
        .sort({ matchScore: -1, createdAt: -1 })
        .lean();

      return matches.map((m) => ({
        ...m,
        lostItem: sanitizeItemForMatchView(m.lostItem, userId),
        foundItem: sanitizeItemForMatchView(m.foundItem, userId)
      }));
    }

    // In-memory dev fallback
    const userMatches = inMemoryMatchStore.filter((m) => {
      const lostRep = (m.lostItem?.reporter?._id || m.lostItem?.reporter?.id || m.lostItem?.reporter)?.toString();
      const foundRep = (m.foundItem?.reporter?._id || m.foundItem?.reporter?.id || m.foundItem?.reporter)?.toString();
      return lostRep === uid || foundRep === uid;
    });

    userMatches.sort((a, b) => b.matchScore - a.matchScore);

    return userMatches.map((m) => ({
      ...m,
      lostItem: sanitizeItemForMatchView(m.lostItem, userId),
      foundItem: sanitizeItemForMatchView(m.foundItem, userId)
    }));
  }

  /**
   * Retrieves single detailed match by ID with counterparty privacy masking
   */
  static async getMatchById(matchId, userId) {
    const mid = matchId?.toString();

    let matchDoc = null;

    if (mongoose.connection.readyState === 1) {
      matchDoc = await Match.findById(matchId)
        .populate('lostItem', 'itemName title category color brand model description location locationDetails date dateLost status images reporter')
        .populate('foundItem', 'itemName title category color brand model description location locationDetails date dateFound status images storageLocation reporter')
        .lean();
    } else {
      matchDoc = inMemoryMatchStore.find((m) => (m._id?.toString() || m.id?.toString()) === mid);
    }

    if (!matchDoc) return null;

    const lostReporter = (matchDoc.lostItem?.reporter?._id || matchDoc.lostItem?.reporter?.id || matchDoc.lostItem?.reporter)?.toString();
    const foundReporter = (matchDoc.foundItem?.reporter?._id || matchDoc.foundItem?.reporter?.id || matchDoc.foundItem?.reporter)?.toString();
    const reqId = userId?.toString();

    // Verify user is a participant or administrator
    const isParticipant = reqId && (reqId === lostReporter || reqId === foundReporter);

    return {
      ...matchDoc,
      isParticipant,
      lostItem: sanitizeItemForMatchView(matchDoc.lostItem, userId),
      foundItem: sanitizeItemForMatchView(matchDoc.foundItem, userId)
    };
  }

  /**
   * Updates match status (e.g. viewed, dismissed, claimStarted)
   */
  static async updateMatchStatus(matchId, newStatus, userId) {
    const mid = matchId?.toString();
    const uid = userId?.toString();

    if (mongoose.connection.readyState === 1) {
      const match = await Match.findById(matchId).populate('lostItem foundItem');
      if (!match) return null;

      const lostRep = (match.lostItem?.reporter?._id || match.lostItem?.reporter)?.toString();
      const foundRep = (match.foundItem?.reporter?._id || match.foundItem?.reporter)?.toString();

      if (uid === lostRep) match.viewedByLostReporter = true;
      if (uid === foundRep) match.viewedByFoundReporter = true;

      if (newStatus) match.status = newStatus;
      await match.save();
      return match;
    }

    const match = inMemoryMatchStore.find((m) => (m._id?.toString() || m.id?.toString()) === mid);
    if (!match) return null;

    const lostRep = (match.lostItem?.reporter?._id || match.lostItem?.reporter)?.toString();
    const foundRep = (match.foundItem?.reporter?._id || match.foundItem?.reporter)?.toString();

    if (uid === lostRep) match.viewedByLostReporter = true;
    if (uid === foundRep) match.viewedByFoundReporter = true;

    if (newStatus) match.status = newStatus;
    match.updatedAt = new Date();
    return match;
  }
}

export default MatchingService;
