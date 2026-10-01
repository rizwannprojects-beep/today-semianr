/**
 * System-wide Constants & Enums for Campus Lost & Found System
 */

export const ROLES = Object.freeze({
  STUDENT: 'student',
  ADMIN: 'admin',
  STAFF: 'staff',
  SUPERADMIN: 'superadmin'
});

export const ALL_ROLES = Object.values(ROLES);

export const ACCOUNT_STATUSES = Object.freeze({
  ACTIVE: 'active',
  SUSPENDED: 'suspended',
  PENDING: 'pending'
});

export const ALL_ACCOUNT_STATUSES = Object.values(ACCOUNT_STATUSES);

export const ITEM_TYPES = Object.freeze({
  LOST: 'lost',
  FOUND: 'found'
});

export const ALL_ITEM_TYPES = Object.values(ITEM_TYPES);

export const ITEM_CATEGORIES = Object.freeze([
  'Electronics',
  'Mobile Phone',
  'Laptop',
  'Tablet',
  'Charger',
  'Wallet',
  'Watch',
  'ID Card',
  'ID Cards',
  'Books',
  'Documents',
  'Keys',
  'Bag',
  'Bags',
  'Clothing',
  'Accessories',
  'Jewelry',
  'Personal Items',
  'Other'
]);

export const LOST_ITEM_STATUSES = Object.freeze({
  ACTIVE: 'ACTIVE',
  MATCH_FOUND: 'MATCH_FOUND',
  CLAIM_IN_PROGRESS: 'CLAIM_IN_PROGRESS',
  RESOLVED: 'RESOLVED',
  CLOSED: 'CLOSED'
});

export const ALL_LOST_ITEM_STATUSES = [
  ...Object.values(LOST_ITEM_STATUSES),
  'LOST',
  'active',
  'CLAIMED',
  'VERIFICATION_PENDING',
  'APPROVED',
  'RETURNED',
  'REJECTED',
  'CLOSED'
];

export const FOUND_ITEM_STATUSES = Object.freeze({
  FOUND: 'FOUND',
  UNDER_VERIFICATION: 'UNDER_VERIFICATION',
  CLAIMED: 'CLAIMED',
  RETURNED: 'RETURNED',
  CLOSED: 'CLOSED',
  EXPIRED: 'EXPIRED'
});

export const ALL_FOUND_ITEM_STATUSES = [
  ...Object.values(FOUND_ITEM_STATUSES),
  'VERIFICATION_PENDING',
  'APPROVED',
  'REJECTED',
  'active'
];

export const ITEM_STATUSES = Object.freeze({
  ACTIVE: 'active',
  UNDER_REVIEW: 'underReview',
  MATCHED: 'matched',
  CLAIM_PENDING: 'claimPending',
  CLAIMED: 'claimed',
  RETURN_PENDING: 'returnPending',
  RETURNED: 'returned',
  RESOLVED: 'resolved',
  REJECTED: 'rejected',
  ARCHIVED: 'archived',
  // Phase 4 Lifecycle constants
  STATUS_ACTIVE: 'ACTIVE',
  STATUS_MATCH_FOUND: 'MATCH_FOUND',
  STATUS_CLAIM_IN_PROGRESS: 'CLAIM_IN_PROGRESS',
  STATUS_RESOLVED: 'RESOLVED',
  STATUS_CLOSED: 'CLOSED',
  STATUS_FOUND: 'FOUND',
  STATUS_UNDER_VERIFICATION: 'UNDER_VERIFICATION',
  STATUS_CLAIMED: 'CLAIMED',
  STATUS_RETURNED: 'RETURNED',
  STATUS_EXPIRED: 'EXPIRED',
  STATUS_LOST: 'LOST',
  STATUS_VERIFICATION_PENDING: 'VERIFICATION_PENDING',
  STATUS_APPROVED: 'APPROVED',
  STATUS_REJECTED: 'REJECTED'
});

export const ALL_ITEM_STATUSES = [
  ...Object.values(ITEM_STATUSES),
  'LOST',
  'FOUND',
  'CLAIMED',
  'VERIFICATION_PENDING',
  'APPROVED',
  'RETURNED',
  'REJECTED',
  'CLOSED'
];

export const CAMPUS_LOCATIONS = Object.freeze([
  'Central Library',
  'Main Academic Block',
  'Science & Engineering Block',
  'Computer & IT Complex',
  'Student Activity Center / Cafeteria',
  'Campus Auditorium',
  'Sports Complex & Gymnasium',
  'Administration & Security Desk',
  'Hostel / Dormitory Grounds',
  'North / South Parking Bay',
  'Bus Terminus / Campus Gate',
  'Other Campus Location'
]);

export const ITEM_VISIBILITY = Object.freeze({
  PUBLIC: 'public',
  CAMPUS_ONLY: 'campusOnly',
  PRIVATE: 'private'
});

export const ALL_ITEM_VISIBILITIES = Object.values(ITEM_VISIBILITY);

export const CONTACT_PREFERENCES = Object.freeze({
  IN_APP: 'inApp',
  EMAIL: 'email',
  PHONE: 'phone'
});

export const ALL_CONTACT_PREFERENCES = Object.values(CONTACT_PREFERENCES);

export const CLAIM_STATUSES = Object.freeze({
  PENDING: 'pending',
  UNDER_REVIEW: 'underReview',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  CANCELLED: 'cancelled',
  COMPLETED: 'completed',
  STATUS_PENDING: 'PENDING',
  STATUS_UNDER_REVIEW: 'UNDER_REVIEW',
  STATUS_APPROVED: 'APPROVED',
  STATUS_REJECTED: 'REJECTED',
  STATUS_CANCELLED: 'CANCELLED',
  STATUS_COMPLETED: 'COMPLETED'
});

export const ALL_CLAIM_STATUSES = [
  'pending',
  'underReview',
  'approved',
  'rejected',
  'cancelled',
  'completed',
  'PENDING',
  'UNDER_REVIEW',
  'APPROVED',
  'REJECTED',
  'CANCELLED',
  'COMPLETED'
];

export const MATCH_LEVELS = Object.freeze({
  HIGH_POSSIBILITY: 'HIGH_POSSIBILITY',
  POSSIBLE: 'POSSIBLE',
  LOW_POSSIBILITY: 'LOW_POSSIBILITY'
});

export const ALL_MATCH_LEVELS = Object.values(MATCH_LEVELS);

export const MATCH_THRESHOLDS = Object.freeze({
  MIN_VISIBLE: 40,
  POSSIBLE: 60,
  HIGH: 80
});

export const MATCH_STATUSES = Object.freeze({
  SUGGESTED: 'suggested',
  VIEWED: 'viewed',
  INTERESTED: 'interested',
  DISMISSED: 'dismissed',
  CLAIM_STARTED: 'claimStarted',
  VERIFIED: 'verified',
  REJECTED: 'rejected',
  RESOLVED: 'resolved',
  NOTIFIED: 'notified',
  CONFIRMED: 'confirmed',
  // Uppercase constants
  PENDING: 'PENDING',
  REVIEWED: 'REVIEWED'
});

export const ALL_MATCH_STATUSES = [
  ...Object.values(MATCH_STATUSES),
  'PENDING',
  'REVIEWED',
  'CONFIRMED',
  'REJECTED'
];

export const RETURN_STATUSES = Object.freeze({
  READY_FOR_RETURN: 'READY_FOR_RETURN',
  RETURN_REQUESTED: 'RETURN_REQUESTED',
  SCHEDULED: 'SCHEDULED',
  OWNER_ARRIVED: 'OWNER_ARRIVED',
  IDENTITY_VERIFICATION: 'IDENTITY_VERIFICATION',
  HANDOVER_PENDING: 'HANDOVER_PENDING',
  RETURNED: 'RETURNED',
  CANCELLED: 'CANCELLED',
  EXPIRED: 'EXPIRED',
  DISPUTED: 'DISPUTED'
});

export const ALL_RETURN_STATUSES = [
  'READY_FOR_RETURN',
  'RETURN_REQUESTED',
  'SCHEDULED',
  'OWNER_ARRIVED',
  'IDENTITY_VERIFICATION',
  'HANDOVER_PENDING',
  'RETURNED',
  'CANCELLED',
  'EXPIRED',
  'DISPUTED',
  'ready_for_return',
  'return_requested',
  'scheduled',
  'owner_arrived',
  'identity_verification',
  'handover_pending',
  'returned',
  'cancelled',
  'expired',
  'disputed'
];

export const RETURN_METHODS = Object.freeze({
  CAMPUS_OFFICE_PICKUP: 'Campus Office Pickup',
  DIRECT_HANDOVER: 'Direct Handover',
  DEPARTMENT_OFFICE: 'Department Office',
  AUTHORIZED_STAFF_HANDOVER: 'Authorized Staff Handover',
  OTHER_APPROVED_LOCATION: 'Other Approved Location'
});

export const ALL_RETURN_METHODS = Object.values(RETURN_METHODS);

export const RETURN_STATUS_TRANSITIONS = {
  READY_FOR_RETURN: ['RETURN_REQUESTED', 'SCHEDULED', 'IDENTITY_VERIFICATION', 'CANCELLED', 'DISPUTED'],
  RETURN_REQUESTED: ['SCHEDULED', 'IDENTITY_VERIFICATION', 'CANCELLED', 'DISPUTED'],
  SCHEDULED: ['OWNER_ARRIVED', 'IDENTITY_VERIFICATION', 'CANCELLED', 'EXPIRED', 'DISPUTED'],
  OWNER_ARRIVED: ['IDENTITY_VERIFICATION', 'CANCELLED', 'DISPUTED'],
  IDENTITY_VERIFICATION: ['HANDOVER_PENDING', 'RETURNED', 'CANCELLED', 'DISPUTED'],
  HANDOVER_PENDING: ['RETURNED', 'CANCELLED', 'DISPUTED'],
  RETURNED: ['DISPUTED'],
  CANCELLED: ['READY_FOR_RETURN'],
  EXPIRED: ['SCHEDULED', 'CANCELLED'],
  DISPUTED: ['READY_FOR_RETURN', 'CANCELLED', 'RETURNED']
};

export const NOTIFICATION_TYPES = Object.freeze({
  // Match events
  NEW_POSSIBLE_MATCH: 'new_possible_match',
  ITEM_MATCH_FOUND: 'new_possible_match',
  MATCH_FOUND: 'match_found',
  // Claim events
  CLAIM_SUBMITTED: 'claim_submitted',
  CLAIM_UNDER_REVIEW: 'claim_under_review',
  CLAIM_INFO_REQUESTED: 'claim_info_requested',
  CLAIM_INFORMATION_REQUIRED: 'claim_info_requested',
  CLAIM_APPROVED: 'claim_approved',
  CLAIM_REJECTED: 'claim_rejected',
  CLAIM_STATUS_CHANGED: 'claim_status_changed',
  CLAIM_COMPLETED: 'claim_completed',
  CLAIM_CANCELLED: 'claim_cancelled',
  // Return events
  ITEM_READY_FOR_RETURN: 'item_ready_for_return',
  RETURN_READY: 'return_ready',
  RETURN_CREATED: 'return_created',
  RETURN_SCHEDULED: 'return_scheduled',
  RETURN_SCHEDULE_UPDATED: 'return_schedule_updated',
  RETURN_REMINDER: 'return_reminder',
  RETURN_REMINDER_24H: 'return_reminder_24h',
  RETURN_REMINDER_1H: 'return_reminder_1h',
  RETURN_CODE_GENERATED: 'return_code_generated',
  OWNER_VERIFICATION_REQUIRED: 'owner_verification_required',
  RETURN_VERIFIED: 'return_verified',
  HANDOVER_READY: 'handover_ready',
  HANDOVER_CONFIRMED: 'handover_confirmed',
  HANDOVER_COMPLETED: 'item_returned',
  ITEM_RETURNED: 'item_returned',
  RETURN_CANCELLED: 'return_cancelled',
  RETURN_DISPUTED: 'return_disputed',
  RETURN_EXPIRED: 'return_expired',
  // Item events
  REPORT_STATUS_CHANGE: 'report_status_change',
  ITEM_CREATED: 'item_created',
  // Admin/System events
  ADMIN_MESSAGE: 'admin_message',
  ANNOUNCEMENT: 'announcement',
  SYSTEM_ALERT: 'system_alert',
  // Account/Security events
  ACCOUNT_STATUS_CHANGED: 'account_status_changed',
  SECURITY_ALERT: 'security_alert',
  // Dispute events
  DISPUTE_CREATED: 'dispute_created',
  DISPUTE_UPDATED: 'dispute_updated',
  DISPUTE_RESOLVED: 'dispute_resolved'
});

export const ALL_NOTIFICATION_TYPES = [
  ...new Set([
    ...Object.values(NOTIFICATION_TYPES),
    ...Object.keys(NOTIFICATION_TYPES),
    ...Object.values(NOTIFICATION_TYPES).map(v => v.toUpperCase())
  ])
];

/**
 * Notification priority levels
 */
export const NOTIFICATION_PRIORITIES = Object.freeze({
  LOW: 'LOW',
  NORMAL: 'NORMAL',
  HIGH: 'HIGH',
  URGENT: 'URGENT'
});

export const ALL_NOTIFICATION_PRIORITIES = Object.values(NOTIFICATION_PRIORITIES);

/**
 * Security-critical notification types that cannot be disabled by user preferences
 */
export const NON_DISABLEABLE_NOTIFICATION_TYPES = Object.freeze([
  'security_alert',
  'account_status_changed'
]);

/**
 * Announcement lifecycle statuses
 */
export const ANNOUNCEMENT_STATUSES = Object.freeze({
  DRAFT: 'DRAFT',
  SCHEDULED: 'SCHEDULED',
  PUBLISHED: 'PUBLISHED',
  EXPIRED: 'EXPIRED',
  ARCHIVED: 'ARCHIVED'
});

export const ALL_ANNOUNCEMENT_STATUSES = Object.values(ANNOUNCEMENT_STATUSES);

export const AUDIT_ACTIONS = Object.freeze({
  LOGIN: 'login',
  FAILED_LOGIN: 'failed_login',
  LOGOUT: 'logout',
  ACCOUNT_CREATION: 'account_creation',
  ROLE_CHANGE: 'role_change',
  PASSWORD_RESET_REQUEST: 'password_reset_request',
  PASSWORD_RESET: 'password_reset',
  REPORT_CREATION: 'report_creation',
  REPORT_MODIFICATION: 'report_modification',
  REPORT_DELETION: 'report_deletion',
  CLAIM_CREATION: 'claim_creation',
  CLAIM_APPROVAL: 'claim_approval',
  CLAIM_REJECTION: 'claim_rejection',
  CLAIM_CANCELLATION: 'claim_cancellation',
  ITEM_STATUS_CHANGE: 'item_status_change',
  RETURN_CREATION: 'return_creation',
  RETURN_SCHEDULED: 'return_scheduled',
  VERIFICATION_ATTEMPTED: 'verification_attempted',
  VERIFICATION_SUCCEEDED: 'verification_succeeded',
  VERIFICATION_FAILED: 'verification_failed',
  HANDOVER_CONFIRMED: 'handover_confirmed',
  ITEM_RETURNED: 'item_returned',
  RETURN_CANCELLED: 'return_cancelled',
  RETURN_DISPUTED: 'return_disputed',
  ADMIN_ACTION: 'admin_action',
  // Standard uppercase aliases
  REGISTER: 'REGISTER',
  CREATE_ITEM: 'CREATE_ITEM',
  UPDATE_ITEM: 'UPDATE_ITEM',
  SUBMIT_CLAIM: 'SUBMIT_CLAIM',
  APPROVE_CLAIM: 'APPROVE_CLAIM',
  REJECT_CLAIM: 'REJECT_CLAIM',
  CREATE_MATCH: 'CREATE_MATCH',
  CONFIRM_MATCH: 'CONFIRM_MATCH',
  CREATE_RETURN: 'CREATE_RETURN',
  COMPLETE_RETURN: 'COMPLETE_RETURN',
  ROLE_CHANGE_UPPER: 'ROLE_CHANGE',
  USER_DEACTIVATED: 'USER_DEACTIVATED'
});

export const ALL_AUDIT_ACTIONS = [
  ...Object.values(AUDIT_ACTIONS),
  'LOGIN',
  'REGISTER',
  'CREATE_ITEM',
  'UPDATE_ITEM',
  'SUBMIT_CLAIM',
  'APPROVE_CLAIM',
  'REJECT_CLAIM',
  'CREATE_MATCH',
  'CONFIRM_MATCH',
  'CREATE_RETURN',
  'COMPLETE_RETURN',
  'ADMIN_ACTION',
  'ROLE_CHANGE',
  'USER_DEACTIVATED'
];

