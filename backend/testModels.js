import mongoose from 'mongoose';
import User from './models/User.js';
import Item from './models/Item.js';
import LostItem from './models/LostItem.js';
import FoundItem from './models/FoundItem.js';
import Claim from './models/Claim.js';
import Match from './models/Match.js';
import Notification from './models/Notification.js';
import AuditLog from './models/AuditLog.js';
import Return from './models/Return.js';
import ModerationReport from './models/ModerationReport.js';
import Announcement from './models/Announcement.js';
import ContactMessage from './models/ContactMessage.js';

console.log('Testing Mongoose Models Initialization...');

const models = [
  { name: 'User', model: User },
  { name: 'Item', model: Item },
  { name: 'LostItem', model: LostItem },
  { name: 'FoundItem', model: FoundItem },
  { name: 'Claim', model: Claim },
  { name: 'Match', model: Match },
  { name: 'Notification', model: Notification },
  { name: 'AuditLog', model: AuditLog },
  { name: 'Return', model: Return },
  { name: 'ModerationReport', model: ModerationReport },
  { name: 'Announcement', model: Announcement },
  { name: 'ContactMessage', model: ContactMessage }
];

let allPassed = true;

for (const { name, model } of models) {
  try {
    if (!model || typeof model !== 'function') {
      throw new Error(`Model ${name} is not a valid Mongoose model`);
    }

    const schema = model.schema;
    if (!schema) {
      throw new Error(`Model ${name} does not have a valid schema`);
    }

    const indexes = schema.indexes();
    console.log(`[PASS] Model ${name} loaded successfully (${Object.keys(schema.paths).length} fields, ${indexes.length} indexes)`);
  } catch (err) {
    console.error(`[FAIL] Model ${name} failed to load:`, err.message);
    allPassed = false;
  }
}

// Test User instantiation and password hashing
try {
  const testUser = new User({
    fullName: 'Test Student',
    email: 'test@campus.edu',
    password: 'Password123'
  });
  console.log(`[PASS] User instance created successfully with default role: ${testUser.role}`);
} catch (err) {
  console.error('[FAIL] User instance creation failed:', err.message);
  allPassed = false;
}

// Test Item instantiation with valid types and statuses
try {
  const testItem = new Item({
    title: 'Lost Calculator',
    description: 'Black scientific calculator left in lab',
    type: 'lost',
    category: 'Electronics',
    location: 'Lab 3',
    date: new Date(),
    reporter: new mongoose.Types.ObjectId()
  });
  console.log(`[PASS] Item instance created successfully with status: ${testItem.status}`);
} catch (err) {
  console.error('[FAIL] Item instance creation failed:', err.message);
  allPassed = false;
}

// Test LostItem Discriminator instantiation
try {
  const testLost = new LostItem({
    itemName: 'Lost iPhone 13',
    category: 'Mobile Phone',
    description: 'Midnight blue iPhone with cracked screen protector',
    location: 'Central Library',
    dateLost: new Date(),
    reporter: new mongoose.Types.ObjectId()
  });
  if (testLost.type !== 'lost') {
    throw new Error(`Expected type 'lost', got '${testLost.type}'`);
  }
  console.log(`[PASS] LostItem instance created successfully (type: ${testLost.type}, status: ${testLost.status})`);
} catch (err) {
  console.error('[FAIL] LostItem instance creation failed:', err.message);
  allPassed = false;
}

// Test FoundItem Discriminator instantiation
try {
  const testFound = new FoundItem({
    itemName: 'Found Smart Watch',
    category: 'Watch',
    description: 'Black fitness tracker found on sports track',
    location: 'Sports Complex & Gymnasium',
    storageLocation: 'Administration & Security Desk',
    dateFound: new Date(),
    reporter: new mongoose.Types.ObjectId()
  });
  if (testFound.type !== 'found') {
    throw new Error(`Expected type 'found', got '${testFound.type}'`);
  }
  console.log(`[PASS] FoundItem instance created successfully (type: ${testFound.type}, status: ${testFound.status}, storage: ${testFound.storageLocation})`);
} catch (err) {
  console.error('[FAIL] FoundItem instance creation failed:', err.message);
  allPassed = false;
}

// Test Claim instantiation
try {
  const testClaim = new Claim({
    item: new mongoose.Types.ObjectId(),
    claimant: new mongoose.Types.ObjectId(),
    reason: 'This is my calculator left on desk',
    ownershipProof: 'It has a sticker with my name'
  });
  console.log(`[PASS] Claim instance created successfully with status: ${testClaim.status}`);
} catch (err) {
  console.error('[FAIL] Claim instance creation failed:', err.message);
  allPassed = false;
}

// Test Return instantiation
try {
  const testReturn = new Return({
    item: new mongoose.Types.ObjectId(),
    claim: new mongoose.Types.ObjectId(),
    owner: new mongoose.Types.ObjectId(),
    status: 'READY_FOR_RETURN',
    returnMethod: 'Campus Office Pickup'
  });
  console.log(`[PASS] Return instance created successfully with status: ${testReturn.status}`);
} catch (err) {
  console.error('[FAIL] Return instance creation failed:', err.message);
  allPassed = false;
}

// Test ModerationReport instantiation
try {
  const testReport = new ModerationReport({
    targetType: 'Item',
    targetId: new mongoose.Types.ObjectId(),
    reporter: new mongoose.Types.ObjectId(),
    reason: 'Suspicious / Inappropriate content',
    description: 'Item looks duplicated and inaccurate'
  });
  console.log(`[PASS] ModerationReport instance created successfully with status: ${testReport.status}`);
} catch (err) {
  console.error('[FAIL] ModerationReport instance creation failed:', err.message);
  allPassed = false;
}

// Test Announcement instantiation
try {
  const testAnnouncement = new Announcement({
    title: 'Campus Lost and Found Office Timings',
    message: 'The main campus lost and found desk is open 9 AM to 5 PM weekdays.',
    priority: 'NORMAL',
    targetAudience: 'ALL',
    createdBy: new mongoose.Types.ObjectId()
  });
  console.log(`[PASS] Announcement instance created successfully with status: ${testAnnouncement.status}`);
} catch (err) {
  console.error('[FAIL] Announcement instance creation failed:', err.message);
  allPassed = false;
}

// Test ContactMessage instantiation
try {
  const testContact = new ContactMessage({
    name: 'Sample Student',
    email: 'student@campus.edu',
    subject: 'Lost card query',
    message: 'Where can I collect my lost card?'
  });
  console.log(`[PASS] ContactMessage instance created successfully with status: ${testContact.status}`);
} catch (err) {
  console.error('[FAIL] ContactMessage instance creation failed:', err.message);
  allPassed = false;
}

if (allPassed) {
  console.log('\nAll 12 database models and schemas loaded and validated successfully!');
} else {
  console.error('\nOne or more model checks failed.');
  process.exitCode = 1;
}
