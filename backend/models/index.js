export { User } from './User.js';
export { Item } from './Item.js';
export { LostItem } from './LostItem.js';
export { FoundItem } from './FoundItem.js';
export { Claim } from './Claim.js';
export { Match } from './Match.js';
export { Notification } from './Notification.js';
export { AuditLog } from './AuditLog.js';
export { Return } from './Return.js';
export { ModerationReport } from './ModerationReport.js';
export { Announcement } from './Announcement.js';

export default {
  User: (await import('./User.js')).User,
  Item: (await import('./Item.js')).Item,
  LostItem: (await import('./LostItem.js')).LostItem,
  FoundItem: (await import('./FoundItem.js')).FoundItem,
  Claim: (await import('./Claim.js')).Claim,
  Match: (await import('./Match.js')).Match,
  Notification: (await import('./Notification.js')).Notification,
  AuditLog: (await import('./AuditLog.js')).AuditLog,
  Return: (await import('./Return.js')).Return,
  ModerationReport: (await import('./ModerationReport.js')).ModerationReport,
  Announcement: (await import('./Announcement.js')).Announcement
};

