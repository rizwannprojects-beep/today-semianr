/**
 * Campus Lost & Found System — Official Demo / Presentation Seeding Script
 * 
 * POPULATES REALISTIC, STANDARDIZED PRESENTATION ACCOUNTS AND SCENARIOS:
 * - Student 1 (Owner): Arjun Nair (arjun.nair@campus.demo)
 * - Student 2 (Finder): Rahul Menon (rahul.menon@campus.demo)
 * - Student 3 (Another User): Fathima Rahman (fathima.rahman@campus.demo)
 * - Admin: Campus Admin (admin@campus.demo)
 * 
 * CORE SCENARIO:
 * - Arjun loses Black HP Laptop in College Library
 * - Rahul finds Black HP Laptop in College Library
 * - Algorithmic Correlation Engine generates a 94% match
 * - Arjun submits ownership verification claim
 * - Campus Security Desk prepares Handover Ticket (Ready for Return -> Returned)
 * 
 * USAGE:
 *   node scripts/seedDemoData.js
 *   node scripts/seedDemoData.js --clean
 */

import mongoose from 'mongoose';
import { connectDatabase, disconnectDatabase } from '../config/database.js';
import User from '../models/User.js';
import Item from '../models/Item.js';
import LostItem from '../models/LostItem.js';
import FoundItem from '../models/FoundItem.js';
import Match from '../models/Match.js';
import Claim from '../models/Claim.js';
import Return from '../models/Return.js';
import Notification from '../models/Notification.js';
import Announcement from '../models/Announcement.js';
import {
  ROLES,
  ACCOUNT_STATUSES,
  ITEM_CATEGORIES,
  ITEM_STATUSES,
  NOTIFICATION_TYPES,
  MATCH_LEVELS
} from '../utils/constants.js';

const DEMO_TAG = '[DEMO]';

const run = async () => {
  console.log('====================================================');
  console.log(' Campus Lost & Found — Official Presentation Seeder ');
  console.log('====================================================');

  const isCleanMode = process.argv.includes('--clean');

  try {
    await connectDatabase();

    if (isCleanMode) {
      console.log('\n[CLEAN MODE] Cleaning previous demo data...');
      await User.deleteMany({ email: { $regex: /@campus\.demo$/ } });
      await Item.deleteMany({ description: { $regex: /\[DEMO\]/ } });
      await Match.deleteMany({});
      await Claim.deleteMany({});
      await Return.deleteMany({});
      await Notification.deleteMany({});
      await Announcement.deleteMany({ title: { $regex: /\[DEMO\]/ } });
      console.log('Demo database cleaned successfully.');
      await disconnectDatabase();
      return;
    }

    console.log('\nStep 1: Provisioning Presentation Accounts...');
    const demoUsers = [
      {
        fullName: 'Arjun Nair',
        email: 'arjun.nair@campus.demo',
        passwordHash: 'Demo@12345', // Pre-save hook hashes with bcrypt
        phone: '+91 98765 43210',
        phoneNumber: '+91 98765 43210',
        registerNumber: 'CS-2024-089',
        department: 'Computer Applications',
        course: 'BCA',
        year: 3,
        semester: 5,
        className: 'BCA-3A',
        role: ROLES.STUDENT,
        accountStatus: ACCOUNT_STATUSES.ACTIVE,
        emailVerified: true
      },
      {
        fullName: 'Rahul Menon',
        email: 'rahul.menon@campus.demo',
        passwordHash: 'Demo@12345',
        phone: '+91 98765 43211',
        phoneNumber: '+91 98765 43211',
        registerNumber: 'CS-2024-117',
        department: 'Computer Applications',
        course: 'BCA',
        year: 3,
        semester: 5,
        className: 'BCA-3A',
        role: ROLES.STUDENT,
        accountStatus: ACCOUNT_STATUSES.ACTIVE,
        emailVerified: true
      },
      {
        fullName: 'Fathima Rahman',
        email: 'fathima.rahman@campus.demo',
        passwordHash: 'Demo@12345',
        phone: '+91 98765 43212',
        phoneNumber: '+91 98765 43212',
        registerNumber: 'CS-2024-142',
        department: 'Computer Applications',
        course: 'BCA',
        year: 3,
        semester: 5,
        className: 'BCA-3B',
        role: ROLES.STUDENT,
        accountStatus: ACCOUNT_STATUSES.ACTIVE,
        emailVerified: true
      },
      {
        fullName: 'Campus Admin',
        email: 'admin@campus.demo',
        passwordHash: 'Admin@12345',
        phone: '+1 (555) 019-4820',
        phoneNumber: '+1 (555) 019-4820',
        registerNumber: 'ADMIN-001',
        department: 'Campus Security & Administration',
        course: 'Administration',
        role: ROLES.ADMIN,
        accountStatus: ACCOUNT_STATUSES.ACTIVE,
        emailVerified: true
      }
    ];

    const userMap = {};
    for (const u of demoUsers) {
      let user = await User.findOne({ email: u.email });
      if (!user) {
        user = await User.create(u);
        console.log(`  + Created account: ${u.fullName} (${u.email}) [${u.role}]`);
      } else {
        console.log(`  * Account exists: ${u.fullName} (${u.email})`);
      }
      userMap[u.email] = user;
    }

    console.log('\nStep 2: Provisioning Main Demo Scenario Items...');
    
    // 1. Lost Black HP Laptop (Owner: Arjun Nair)
    let lostLaptop = await LostItem.findOne({ itemName: 'Black HP Laptop', reporter: userMap['arjun.nair@campus.demo']._id });
    if (!lostLaptop) {
      lostLaptop = await LostItem.create({
        itemName: 'Black HP Laptop',
        category: 'Electronics',
        lostLocation: 'College Library',
        location: 'College Library',
        dateLost: new Date('2026-09-28T14:30:00.000Z'),
        description: `${DEMO_TAG} Black HP laptop with a small silver sticker near the HP logo. The laptop was last seen on a study table near the library reading area.`,
        identifyingFeatures: 'Silver sticker next to HP logo, blue desktop wallpaper, BCA assignment folders.',
        color: 'Black',
        brand: 'HP',
        status: ITEM_STATUSES.STATUS_ACTIVE || 'ACTIVE',
        reporter: userMap['arjun.nair@campus.demo']._id,
        primaryImage: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=600&q=80',
        images: ['https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=600&q=80']
      });
      console.log('  + Created Lost Item: Black HP Laptop (Owner: Arjun Nair)');
    }

    // 2. Found Black HP Laptop (Finder: Rahul Menon)
    let foundLaptop = await FoundItem.findOne({ itemName: 'Black HP Laptop', reporter: userMap['rahul.menon@campus.demo']._id });
    if (!foundLaptop) {
      foundLaptop = await FoundItem.create({
        itemName: 'Black HP Laptop',
        category: 'Electronics',
        location: 'College Library',
        storageLocation: 'Campus Security / Lost & Found Desk',
        dateFound: new Date('2026-09-28T16:00:00.000Z'),
        description: `${DEMO_TAG} Found a black HP laptop on a study table near the library reading area. There is a small silver sticker near the HP logo.`,
        color: 'Black',
        brand: 'HP',
        status: ITEM_STATUSES.STATUS_FOUND || 'FOUND',
        reporter: userMap['rahul.menon@campus.demo']._id,
        primaryImage: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=600&q=80',
        images: ['https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=600&q=80']
      });
      console.log('  + Created Found Item: Black HP Laptop (Finder: Rahul Menon)');
    }

    // Additional Lost Items
    const additionalLost = [
      {
        itemName: 'Blue Water Bottle',
        category: 'Personal Items',
        lostLocation: 'Block A',
        location: 'Block A',
        dateLost: new Date('2026-09-26T11:00:00.000Z'),
        description: `${DEMO_TAG} Stainless steel blue water bottle left in Room A-204 after class.`,
        color: 'Blue',
        status: ITEM_STATUSES.STATUS_ACTIVE || 'ACTIVE',
        reporter: userMap['arjun.nair@campus.demo']._id,
        primaryImage: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=600&q=80'
      },
      {
        itemName: 'Student ID Card',
        category: 'Documents',
        lostLocation: 'Computer Lab',
        location: 'Computer Lab',
        dateLost: new Date('2026-09-25T15:00:00.000Z'),
        description: `${DEMO_TAG} Student identity card for Arjun Nair (CS-2024-089).`,
        color: 'Teal / White',
        status: 'RETURNED',
        reporter: userMap['arjun.nair@campus.demo']._id,
        primaryImage: 'https://images.unsplash.com/photo-1589330694653-dad6d3240e2b?auto=format&fit=crop&w=600&q=80'
      },
      {
        itemName: 'Black Backpack',
        category: 'Bags',
        lostLocation: 'Seminar Hall',
        location: 'Seminar Hall',
        dateLost: new Date('2026-09-27T10:00:00.000Z'),
        description: `${DEMO_TAG} Black travel backpack with laptop sleeve and water bottle pocket.`,
        color: 'Black',
        status: ITEM_STATUSES.STATUS_ACTIVE || 'ACTIVE',
        reporter: userMap['fathima.rahman@campus.demo']._id,
        primaryImage: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=600&q=80'
      }
    ];

    for (const item of additionalLost) {
      const exists = await LostItem.findOne({ itemName: item.itemName, reporter: item.reporter });
      if (!exists) {
        await LostItem.create(item);
        console.log(`  + Created Lost Item: ${item.itemName}`);
      }
    }

    // Additional Found Items
    const additionalFound = [
      {
        itemName: 'Blue Water Bottle',
        category: 'Personal Items',
        location: 'Block A',
        storageLocation: 'Campus Security / Lost & Found Desk',
        dateFound: new Date('2026-09-26T12:00:00.000Z'),
        description: `${DEMO_TAG} Blue insulated water bottle recovered from Block A classroom.`,
        color: 'Blue',
        status: ITEM_STATUSES.STATUS_FOUND || 'FOUND',
        reporter: userMap['arjun.nair@campus.demo']._id,
        primaryImage: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=600&q=80'
      },
      {
        itemName: 'USB Drive (SanDisk 64GB)',
        category: 'Electronics',
        location: 'Computer Lab',
        storageLocation: 'Lab Assistant Office Room 104',
        dateFound: new Date('2026-09-27T16:00:00.000Z'),
        description: `${DEMO_TAG} Red and black sliding SanDisk USB 3.0 flash drive found in Lab 2.`,
        color: 'Red / Black',
        status: ITEM_STATUSES.STATUS_FOUND || 'FOUND',
        reporter: userMap['rahul.menon@campus.demo']._id,
        primaryImage: 'https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd?auto=format&fit=crop&w=600&q=80'
      },
      {
        itemName: 'Black Backpack',
        category: 'Bags',
        location: 'Seminar Hall',
        storageLocation: 'Campus Security / Lost & Found Desk',
        dateFound: new Date('2026-09-27T14:00:00.000Z'),
        description: `${DEMO_TAG} Black backpack turned in by custodian after orientation seminar.`,
        color: 'Black',
        status: ITEM_STATUSES.STATUS_FOUND || 'FOUND',
        reporter: userMap['fathima.rahman@campus.demo']._id,
        primaryImage: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=600&q=80'
      }
    ];

    for (const item of additionalFound) {
      const exists = await FoundItem.findOne({ itemName: item.itemName, reporter: item.reporter });
      if (!exists) {
        await FoundItem.create(item);
        console.log(`  + Created Found Item: ${item.itemName}`);
      }
    }

    console.log('\nStep 3: Provisioning Deterministic Match...');
    let match = await Match.findOne({ lostItem: lostLaptop._id, foundItem: foundLaptop._id });
    if (!match) {
      match = await Match.create({
        lostItem: lostLaptop._id,
        foundItem: foundLaptop._id,
        itemName: 'Black HP Laptop',
        matchScore: 94,
        matchLevel: MATCH_LEVELS?.HIGH || 'HIGH_POSSIBILITY',
        matchingFactors: {
          category: 25,
          itemName: 25,
          location: 20,
          date: 14,
          description: 10,
          reasons: [
            '✓ Same category (Electronics)',
            '✓ Same location (College Library)',
            '✓ Similar date (September 28, 2026)',
            '✓ Similar description (Black HP Laptop with silver sticker)'
          ]
        },
        status: 'PENDING',
        notificationSent: true
      });
      console.log('  + Created Match: 94% Correlation for Black HP Laptop');
    }

    console.log('\nStep 4: Provisioning Ownership Claim & Handover Return...');
    let claim = await Claim.findOne({ item: foundLaptop._id, claimant: userMap['arjun.nair@campus.demo']._id });
    if (!claim) {
      claim = await Claim.create({
        item: foundLaptop._id,
        foundItemId: foundLaptop._id,
        claimant: userMap['arjun.nair@campus.demo']._id,
        proofDetails: 'I believe this is my laptop. The silver sticker is located next to the HP logo, and it contains university course assignments in the BCA folder.',
        status: 'approved',
        verificationStatus: 'approved',
        adminNotes: 'Silver sticker verified next to HP logo. BCA student ID matches registration.'
      });
      console.log('  + Created Claim: Approved for Arjun Nair');
    }

    let returnRecord = await Return.findOne({ claim: claim._id });
    if (!returnRecord) {
      returnRecord = await Return.create({
        claim: claim._id,
        item: foundLaptop._id,
        owner: userMap['arjun.nair@campus.demo']._id,
        finder: userMap['rahul.menon@campus.demo']._id,
        status: 'READY_FOR_RETURN',
        returnLocation: 'Campus Security / Lost & Found Desk',
        meetingLocation: 'Campus Security / Lost & Found Desk',
        verificationCode: '7842',
        handoverNotes: 'Owner Arjun Nair (CS-2024-089) verified. Handover ready at Security Desk.'
      });
      console.log('  + Created Return Record: READY_FOR_RETURN at Campus Security Desk');
    }

    console.log('\nStep 5: Provisioning Student Notifications...');
    const demoNotifs = [
      {
        recipient: userMap['arjun.nair@campus.demo']._id,
        type: NOTIFICATION_TYPES?.MATCH_FOUND || 'MATCH_FOUND',
        title: 'Possible match found for Black HP Laptop',
        message: 'A Black HP Laptop found at College Library has a 94% match with your lost report.',
        link: '/matches'
      },
      {
        recipient: userMap['arjun.nair@campus.demo']._id,
        type: NOTIFICATION_TYPES?.CLAIM_SUBMITTED || 'CLAIM_SUBMITTED',
        title: 'Claim submitted successfully',
        message: 'Your claim for Black HP Laptop has been registered and sent to security desk review.',
        link: '/my-claims'
      },
      {
        recipient: userMap['arjun.nair@campus.demo']._id,
        type: NOTIFICATION_TYPES?.CLAIM_APPROVED || 'CLAIM_APPROVED',
        title: 'Verification required',
        message: 'Additional verification required: present student ID CS-2024-089 at the Security Desk.',
        link: '/my-returns'
      },
      {
        recipient: userMap['arjun.nair@campus.demo']._id,
        type: NOTIFICATION_TYPES?.SYSTEM_ANNOUNCEMENT || 'SYSTEM_ANNOUNCEMENT',
        title: 'Found item reported near College Library',
        message: 'A high correlation item matching your description was secured by finder Rahul Menon.',
        link: '/browse-found'
      }
    ];

    for (const notif of demoNotifs) {
      await Notification.create(notif);
    }
    console.log(`  + Created ${demoNotifs.length} student notifications for Arjun Nair`);

    console.log('\n====================================================');
    console.log(' Demo Seeding Complete! Ready for Presentation.     ');
    console.log('====================================================');
    console.log('Demo Credentials:');
    console.log('  • Owner:   arjun.nair@campus.demo     / Demo@12345');
    console.log('  • Finder:  rahul.menon@campus.demo    / Demo@12345');
    console.log('  • Student: fathima.rahman@campus.demo / Demo@12345');
    console.log('  • Admin:   admin@campus.demo          / Admin@12345');
    console.log('====================================================');

    await disconnectDatabase();
  } catch (err) {
    console.error('[Error] Seeding failed:', err.message);
    process.exit(1);
  }
};

run();
