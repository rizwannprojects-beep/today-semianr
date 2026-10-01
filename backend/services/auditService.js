import AuditLog from '../models/AuditLog.js';

export const inMemoryAuditLogs = [];

const SENSITIVE_KEY_PATTERNS = [
  /password/i,
  /hash/i,
  /token/i,
  /secret/i,
  /verificationcode/i,
  /auth/i,
  /cookie/i,
  /key/i
];

/**
 * Recursively redacts sensitive values from audit metadata
 */
export const redactSensitiveData = (data) => {
  if (!data || typeof data !== 'object') {
    return data;
  }

  if (Array.isArray(data)) {
    return data.map((item) => redactSensitiveData(item));
  }

  const sanitized = {};
  for (const [key, value] of Object.entries(data)) {
    const isSensitive = SENSITIVE_KEY_PATTERNS.some((pattern) => pattern.test(key));
    if (isSensitive) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = redactSensitiveData(value);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
};

/**
 * Service for logging system and security events
 */
export class AuditService {
  /**
   * Safely records an immutable audit log entry
   */
  static async log({
    actor = null,
    actorEmail = 'system',
    action,
    entityType,
    entityId = null,
    metadata = {},
    ipAddress = null,
    userAgent = null
  }) {
    const safeMetadata = redactSensitiveData(metadata);

    const logDoc = {
      _id: new (await import('mongoose')).default.Types.ObjectId(),
      actor: actor ? (actor._id || actor) : null,
      actorEmail: actorEmail || (actor?.email || 'system'),
      action,
      entityType,
      entityId: entityId ? entityId.toString() : null,
      metadata: safeMetadata,
      ipAddress,
      userAgent,
      timestamp: new Date(),
      createdAt: new Date()
    };

    inMemoryAuditLogs.unshift(logDoc);

    try {
      await AuditLog.create(logDoc);
    } catch (err) {
      // Offline fallback: captured in memory
    }
  }
}

export default AuditService;
