/**
 * Campus Lost & Found System — Demo Data Seeding Script
 * 
 * PURPOSE:
 * Provides an optional, manual seed for presentation and demo environments.
 * Populates realistic student accounts, lost/found items, claims, and announcements.
 *
 * SAFETY GUARANTEES:
 * - Will NOT run automatically during normal server startup.
 * - Will NOT overwrite or delete existing production records.
 * - Idempotent: checks for existing emails and item titles before inserting.
 *
 * USAGE:
 *   node scripts/seedDemoData.js
 *
 * TO REMOVE DEMO DATA:
 *   node scripts/seedDemoData.js --clean
 */

import mongoose from 'mongoose';
import { connectDatabase, disconnectDatabase } from '../config/database.js';
import User from '../models/User.js';
import Item from '../models/Item.js';
import LostItem from '../models/LostItem.js';
import FoundItem from '../models/FoundItem.js';
import Announcement from '../models/Announcement.js';
import { ROLES, ACCOUNT_STATUSES, ITEM_CATEGORIES, ITEM_STATUSES } from '../utils/constants.js';

const DEMO_TAG = '[DEMO]';

const run = async () => {
  console.log('====================================================');
  console.log(' Campus Lost & Found — Demo Data Provisioning Tool  ');
  console.log('====================================================');

  const isCleanMode = process.argv.includes('--clean');

  try {
    await connectDatabase();

    if (isCleanMode) {
      console.log('\n[CLEAN MODE] Removing demo data created by this tool...');
      const userRes = await User.deleteMany({ email: { $regex: /@demo\.campus\.edu$/ } });
      const itemRes = await Item.deleteMany({ description: { $regex: /\[DEMO\]/ } });
      const annRes = await Announcement.deleteMany({ title: { $regex: /^\[DEMO\]/ } });
      console.log(`Removed ${userRes.deletedCount} demo users, ${itemRes.deletedCount} demo items, ${annRes.deletedCount} demo announcements.`);
      await disconnectDatabase();
      return;
    }

    console.log('\nStep 1: Provisioning Demo Student Accounts...');
    const demoStudents = [
      {
        fullName: 'Alex Rivera',
        email: 'alex.rivera@demo.campus.edu',
        passwordHash: 'DemoStudent123!',
        registerNumber: 'REG-2026-CS01',
        department: 'Computer Science',
        role: ROLES.STUDENT,
        accountStatus: ACCOUNT_STATUSES.ACTIVE,
        emailVerified: true
      },
      {
        fullName: 'Maya Chen',
        email: 'maya.chen@demo.campus.edu',
        passwordHash: 'DemoStudent123!',
        registerNumber: 'REG-2026-EE02',
        department: 'Electrical Engineering',
        role: ROLES.STUDENT,
        accountStatus: ACCOUNT_STATUSES.ACTIVE,
        emailVerified: true
      },
      {
        fullName: 'Jordan Taylor',
        email: 'jordan.taylor@demo.campus.edu',
        passwordHash: 'DemoStudent123!',
        registerNumber: 'REG-2026-ME03',
        department: 'Mechanical Engineering',
        role: ROLES.STUDENT,
        accountStatus: ACCOUNT_STATUSES.ACTIVE,
        emailVerified: true
      }
    ];

    const studentMap = {};
    for (const s of demoStudents) {
      let user = await User.findOne({ email: s.email });
      if (!user) {
        user = await User.create(s);
        console.log(`  + Created demo student: ${s.fullName} (${s.email})`);
      } else {
        console.log(`  * Exists: ${s.fullName} (${s.email})`);
      }
      studentMap[s.email] = user;
    }

    console.log('\nStep 2: Provisioning Demo Lost & Found Items...');
    const demoItems = [
      {
        type: 'lost',
        itemName: 'Apple MacBook Air M2 Space Gray',
        category: 'Electronics',
        description: `${DEMO_TAG} Left on 3rd floor study table in Central Library with blue hard case.`,
        location: 'Central Library Floor 3',
        lostLocation: 'Central Library Floor 3',
        dateLost: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        status: ITEM_STATUSES.STATUS_ACTIVE || 'ACTIVE',
        reporter: studentMap['alex.rivera@demo.campus.edu']._id
      },
      {
        type: 'found',
        itemName: 'Sony WH-1000XM5 Wireless Headphones',
        category: 'Electronics',
        description: `${DEMO_TAG} Found on bench near Engineering Quad cafeteria. Black color with case.`,
        location: 'Engineering Quad',
        storageLocation: 'Administration & Security Desk',
        dateFound: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        status: ITEM_STATUSES.STATUS_FOUND || 'FOUND',
        reporter: studentMap['maya.chen@demo.campus.edu']._id
      },
      {
        type: 'lost',
        itemName: 'Brown Leather Fossil Wallet',
        category: 'Personal Belongings',
        description: `${DEMO_TAG} Lost near Main Auditorium during orientation seminar. Contains campus ID card.`,
        location: 'Main Auditorium',
        lostLocation: 'Main Auditorium',
        dateLost: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        status: ITEM_STATUSES.STATUS_ACTIVE || 'ACTIVE',
        reporter: studentMap['jordan.taylor@demo.campus.edu']._id
      },
      {
        type: 'found',
        itemName: 'Blue Hydro Flask Water Bottle (32oz)',
        category: 'Accessories',
        description: `${DEMO_TAG} Left behind in Room 204 after Physics lecture. Has campus sticker on front.`,
        location: 'Science & Engineering Block Room 204',
        storageLocation: 'Administration & Security Desk',
        dateFound: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
        status: ITEM_STATUSES.STATUS_FOUND || 'FOUND',
        reporter: studentMap['alex.rivera@demo.campus.edu']._id
      }
    ];

    for (const itemData of demoItems) {
      const exists = await Item.findOne({ itemName: itemData.itemName, description: { $regex: /\[DEMO\]/ } });
      if (!exists) {
        if (itemData.type === 'lost') {
          await LostItem.create(itemData);
        } else {
          await FoundItem.create(itemData);
        }
        console.log(`  + Created demo ${itemData.type} item: "${itemData.itemName}"`);
      } else {
        console.log(`  * Exists: "${itemData.itemName}"`);
      }
    }

    console.log('\nStep 3: Provisioning Demo Campus Announcements...');
    const demoAnnouncements = [
      {
        title: `${DEMO_TAG} Annual Campus Lost & Found Inventory Review`,
        message: 'All items unclaimed after 90 days from the Spring Semester will be transferred to university donation in accordance with policy.',
        priority: 'NORMAL',
        audience: 'ALL_STUDENTS',
        status: 'PUBLISHED',
        publishedAt: new Date(),
        expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        createdBy: studentMap['alex.rivera@demo.campus.edu']._id
      }
    ];

    for (const ann of demoAnnouncements) {
      const exists = await Announcement.findOne({ title: ann.title });
      if (!exists) {
        await Announcement.create(ann);
        console.log(`  + Created demo announcement: "${ann.title}"`);
      } else {
        console.log(`  * Exists: "${ann.title}"`);
      }
    }

    console.log('\n====================================================');
    console.log(' [SUCCESS] Demo data successfully prepared.');
    console.log(' Accounts available for testing:');
    console.log('   - alex.rivera@demo.campus.edu   / DemoStudent123!');
    console.log('   - maya.chen@demo.campus.edu     / DemoStudent123!');
    console.log('   - jordan.taylor@demo.campus.edu / DemoStudent123!');
    console.log(' To remove demo data anytime, run:');
    console.log('   node scripts/seedDemoData.js --clean');
    console.log('====================================================');

    await disconnectDatabase();
  } catch (err) {
    console.error('[Error] Demo seeding failed:', err.message);
    process.exit(1);
  }
};

run();
