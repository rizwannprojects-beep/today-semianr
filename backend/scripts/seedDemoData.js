/**
 * Campus Lost & Found System — Official Demo & Development Seeding Script
 * 
 * POPULATES REALISTIC, STANDARDIZED PRESENTATION ACCOUNTS AND SCENARIOS:
 * 
 * DEMO ACCOUNTS (Section 25):
 * - Student: student.demo@campus.local / DemoStudent@2026
 * - Admin:   admin.demo@campus.local   / DemoAdmin@2026
 * 
 * PRESENTATION STUDENTS (Section 24):
 * - Arjun Nair (arjun.nair@campus.demo / student.demo@campus.local)
 * - Aisha Rahman (aisha.rahman@campus.local)
 * - Fahad Ali (fahad.ali@campus.local)
 * - Neha Krishnan (neha.krishnan@campus.local)
 * - Muhammed Shamil (muhammed.shamil@campus.local)
 * - Ananya Menon (ananya.menon@campus.local)
 * 
 * PRESENTATION ITEMS (Section 24):
 * 1. Black HP Laptop
 * 2. Apple MacBook Air M2
 * 3. Sony WH-1000XM5 Headphones
 * 4. Blue Water Bottle
 * 5. Student ID Card
 * 6. Black Backpack
 * 7. Scientific Calculator
 * 8. USB Drive
 * 9. College Notebook
 * 10. House Keys
 * 
 * MIXTURE OF LIFECYCLE STATES:
 * - LOST, FOUND, CLAIMED, VERIFICATION_PENDING, RETURNED
 * 
 * Also seeds Claims, Matches, Returns, Notifications, Audit Logs, and Contact Messages.
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
import AuditLog from '../models/AuditLog.js';
import ContactMessage from '../models/ContactMessage.js';
import ModerationReport from '../models/ModerationReport.js';
import {
  ROLES,
  ACCOUNT_STATUSES,
  ITEM_CATEGORIES,
  ITEM_STATUSES,
  NOTIFICATION_TYPES,
  MATCH_LEVELS,
  AUDIT_ACTIONS
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
      await User.deleteMany({ email: { $regex: /@(campus\.demo|campus\.local)$/ } });
      await Item.deleteMany({ description: { $regex: /\[DEMO\]/ } });
      await Match.deleteMany({});
      await Claim.deleteMany({});
      await Return.deleteMany({});
      await Notification.deleteMany({});
      await Announcement.deleteMany({ title: { $regex: /\[DEMO\]/ } });
      await AuditLog.deleteMany({ actorEmail: { $regex: /@(campus\.demo|campus\.local)$/ } });
      await ContactMessage.deleteMany({ email: { $regex: /@(campus\.demo|campus\.local)$/ } });
      console.log('Demo database cleaned successfully.');
      await disconnectDatabase();
      return;
    }

    console.log('\nStep 1: Provisioning Presentation Accounts (Section 24 & 25)...');
    const demoUsers = [
      // Required Demo Student (Section 25)
      {
        fullName: 'Arjun Nair',
        name: 'Arjun Nair',
        email: 'student.demo@campus.local',
        passwordHash: 'DemoStudent@2026',
        phone: '+91 98765 43210',
        phoneNumber: '+91 98765 43210',
        registerNumber: 'CS-2024-0089',
        className: 'BCA S5',
        course: 'Bachelor of Computer Applications',
        department: 'Computer Applications',
        year: 3,
        semester: 5,
        role: ROLES.STUDENT,
        accountStatus: ACCOUNT_STATUSES.ACTIVE,
        emailVerified: true,
        isActive: true,
        isVerified: true
      },
      // Required Demo Admin (Section 25)
      {
        fullName: 'Campus Administrator',
        name: 'Campus Administrator',
        email: 'admin.demo@campus.local',
        passwordHash: 'DemoAdmin@2026',
        phone: '+91 98765 00001',
        phoneNumber: '+91 98765 00001',
        registerNumber: 'STAFF-ADMIN-01',
        className: 'Administration',
        course: 'Campus Operations',
        department: 'Security & Campus Recovery Desk',
        role: ROLES.ADMIN,
        accountStatus: ACCOUNT_STATUSES.ACTIVE,
        emailVerified: true,
        isActive: true,
        isVerified: true
      },
      // Presentation Arjun Nair (compatibility with existing test suites)
      {
        fullName: 'Arjun Nair',
        name: 'Arjun Nair',
        email: 'arjun.nair@campus.demo',
        passwordHash: 'Demo@12345',
        phone: '+91 98765 43210',
        phoneNumber: '+91 98765 43210',
        registerNumber: 'CS-2024-0089',
        className: 'BCA S5',
        course: 'Bachelor of Computer Applications',
        department: 'Computer Applications',
        year: 3,
        semester: 5,
        role: ROLES.STUDENT,
        accountStatus: ACCOUNT_STATUSES.ACTIVE,
        emailVerified: true,
        isActive: true,
        isVerified: true
      },
      // Presentation Finder Rahul Menon
      {
        fullName: 'Rahul Menon',
        name: 'Rahul Menon',
        email: 'rahul.menon@campus.demo',
        passwordHash: 'Demo@12345',
        phone: '+91 98765 43211',
        phoneNumber: '+91 98765 43211',
        registerNumber: 'CS-2024-0117',
        className: 'BCA S5',
        course: 'Bachelor of Computer Applications',
        department: 'Computer Applications',
        year: 3,
        semester: 5,
        role: ROLES.STUDENT,
        accountStatus: ACCOUNT_STATUSES.ACTIVE,
        emailVerified: true,
        isActive: true,
        isVerified: true
      },
      // Presentation Admin
      {
        fullName: 'Campus Admin',
        name: 'Campus Admin',
        email: 'admin@campus.demo',
        passwordHash: 'Admin@12345',
        phone: '+1 (555) 019-4820',
        phoneNumber: '+1 (555) 019-4820',
        registerNumber: 'ADMIN-001',
        department: 'Campus Security & Administration',
        course: 'Administration',
        role: ROLES.ADMIN,
        accountStatus: ACCOUNT_STATUSES.ACTIVE,
        emailVerified: true,
        isActive: true,
        isVerified: true
      },
      // Example Student 2: Aisha Rahman
      {
        fullName: 'Aisha Rahman',
        name: 'Aisha Rahman',
        email: 'aisha.rahman@campus.local',
        passwordHash: 'DemoStudent@2026',
        phone: '+91 98765 43213',
        phoneNumber: '+91 98765 43213',
        registerNumber: 'CS-2024-0102',
        className: 'B.Tech CSE S3',
        course: 'Computer Science and Engineering',
        department: 'Computer Science',
        year: 2,
        semester: 3,
        role: ROLES.STUDENT,
        accountStatus: ACCOUNT_STATUSES.ACTIVE,
        emailVerified: true,
        isActive: true,
        isVerified: true
      },
      // Example Student 3: Fahad Ali
      {
        fullName: 'Fahad Ali',
        name: 'Fahad Ali',
        email: 'fahad.ali@campus.local',
        passwordHash: 'DemoStudent@2026',
        phone: '+91 98765 43214',
        phoneNumber: '+91 98765 43214',
        registerNumber: 'ME-2024-0045',
        className: 'B.Tech ME S5',
        course: 'Mechanical Engineering',
        department: 'Mechanical Engineering',
        year: 3,
        semester: 5,
        role: ROLES.STUDENT,
        accountStatus: ACCOUNT_STATUSES.ACTIVE,
        emailVerified: true,
        isActive: true,
        isVerified: true
      },
      // Example Student 4: Neha Krishnan
      {
        fullName: 'Neha Krishnan',
        name: 'Neha Krishnan',
        email: 'neha.krishnan@campus.local',
        passwordHash: 'DemoStudent@2026',
        phone: '+91 98765 43215',
        phoneNumber: '+91 98765 43215',
        registerNumber: 'EC-2024-0078',
        className: 'B.Tech ECE S5',
        course: 'Electronics and Communication',
        department: 'Electronics Engineering',
        year: 3,
        semester: 5,
        role: ROLES.STUDENT,
        accountStatus: ACCOUNT_STATUSES.ACTIVE,
        emailVerified: true,
        isActive: true,
        isVerified: true
      },
      // Example Student 5: Muhammed Shamil
      {
        fullName: 'Muhammed Shamil',
        name: 'Muhammed Shamil',
        email: 'muhammed.shamil@campus.local',
        passwordHash: 'DemoStudent@2026',
        phone: '+91 98765 43216',
        phoneNumber: '+91 98765 43216',
        registerNumber: 'CS-2024-0120',
        className: 'B.Tech CSE S7',
        course: 'Computer Science and Engineering',
        department: 'Computer Science',
        year: 4,
        semester: 7,
        role: ROLES.STUDENT,
        accountStatus: ACCOUNT_STATUSES.ACTIVE,
        emailVerified: true,
        isActive: true,
        isVerified: true
      },
      // Example Student 6: Ananya Menon
      {
        fullName: 'Ananya Menon',
        name: 'Ananya Menon',
        email: 'ananya.menon@campus.local',
        passwordHash: 'DemoStudent@2026',
        phone: '+91 98765 43217',
        phoneNumber: '+91 98765 43217',
        registerNumber: 'EE-2024-0033',
        className: 'B.Tech EEE S3',
        course: 'Electrical and Electronics',
        department: 'Electrical Engineering',
        year: 2,
        semester: 3,
        role: ROLES.STUDENT,
        accountStatus: ACCOUNT_STATUSES.ACTIVE,
        emailVerified: true,
        isActive: true,
        isVerified: true
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

    const arjun = userMap['student.demo@campus.local'] || userMap['arjun.nair@campus.demo'];
    const admin = userMap['admin.demo@campus.local'] || userMap['admin@campus.demo'];
    const rahul = userMap['rahul.menon@campus.demo'];
    const aisha = userMap['aisha.rahman@campus.local'];
    const fahad = userMap['fahad.ali@campus.local'];
    const neha = userMap['neha.krishnan@campus.local'];
    const shamil = userMap['muhammed.shamil@campus.local'];
    const ananya = userMap['ananya.menon@campus.local'];

    console.log('\nStep 2: Provisioning Required Presentation Items (Section 24)...');

    // 1. Black HP Laptop (Lost by Arjun Nair)
    let lostLaptop = await LostItem.findOne({ itemName: 'Black HP Laptop', reporter: arjun._id });
    if (!lostLaptop) {
      lostLaptop = await LostItem.create({
        itemCode: 'LF-2026-0001',
        title: 'Black HP Laptop',
        itemName: 'Black HP Laptop',
        category: 'Electronics',
        lostLocation: 'College Library',
        location: 'College Library',
        dateLost: new Date('2026-09-28T14:30:00.000Z'),
        date: new Date('2026-09-28T14:30:00.000Z'),
        description: `${DEMO_TAG} Black HP laptop with a small silver sticker near the HP logo. The laptop was last seen on a study table near the library reading area.`,
        identifyingFeatures: 'Silver sticker next to HP logo, blue desktop wallpaper, BCA assignment folders.',
        color: 'Black',
        brand: 'HP',
        serialNumber: 'HP-CND4921X90',
        status: 'CLAIM_IN_PROGRESS',
        reporter: arjun._id,
        reportedBy: arjun._id,
        primaryImage: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=600&q=80',
        images: ['https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=600&q=80']
      });
      console.log('  + Created Lost Item: Black HP Laptop (LF-2026-0001)');
    }

    // 2. Found Black HP Laptop (Found by Rahul Menon)
    let foundLaptop = await FoundItem.findOne({ itemName: 'Black HP Laptop', reporter: rahul._id });
    if (!foundLaptop) {
      foundLaptop = await FoundItem.create({
        itemCode: 'LF-2026-0002',
        title: 'Black HP Laptop',
        itemName: 'Black HP Laptop',
        category: 'Electronics',
        location: 'College Library',
        storageLocation: 'Campus Security / Lost & Found Desk',
        holdingLocation: 'Campus Security / Lost & Found Desk',
        dateFound: new Date('2026-09-28T16:00:00.000Z'),
        date: new Date('2026-09-28T16:00:00.000Z'),
        description: `${DEMO_TAG} Found a black HP laptop on a study table near the library reading area. There is a small silver sticker near the HP logo.`,
        identifyingFeatures: 'Silver sticker next to HP logo, charging adapter included.',
        color: 'Black',
        brand: 'HP',
        serialNumber: 'HP-CND4921X90',
        status: 'CLAIMED',
        reporter: rahul._id,
        reportedBy: rahul._id,
        foundBy: rahul._id,
        currentHolder: 'Security Desk Officer',
        primaryImage: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=600&q=80',
        images: ['https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=600&q=80']
      });
      console.log('  + Created Found Item: Black HP Laptop (LF-2026-0002)');
    }

    // 3. Apple MacBook Air M2 (Lost by Aisha Rahman)
    let macbook = await LostItem.findOne({ itemName: 'Apple MacBook Air M2' });
    if (!macbook) {
      macbook = await LostItem.create({
        itemCode: 'LF-2026-0003',
        title: 'Apple MacBook Air M2',
        itemName: 'Apple MacBook Air M2',
        category: 'Electronics',
        lostLocation: 'Science & Engineering Block, Room 302',
        location: 'Science & Engineering Block, Room 302',
        dateLost: new Date('2026-09-29T11:00:00.000Z'),
        date: new Date('2026-09-29T11:00:00.000Z'),
        description: `${DEMO_TAG} Space Gray 13-inch MacBook Air M2 with a dark matte case and Python/React developer stickers.`,
        identifyingFeatures: 'Matte gray finish, Python sticker on top right shell, username "aisha_r" on login screen.',
        color: 'Space Gray',
        brand: 'Apple',
        serialNumber: 'C02G90XXMD6M',
        status: 'LOST',
        reporter: aisha._id,
        reportedBy: aisha._id,
        primaryImage: 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?auto=format&fit=crop&w=600&q=80',
        images: ['https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?auto=format&fit=crop&w=600&q=80']
      });
      console.log('  + Created Lost Item: Apple MacBook Air M2 (LF-2026-0003)');
    }

    // 4. Sony WH-1000XM5 Headphones (Found by Fahad Ali)
    let headphones = await FoundItem.findOne({ itemName: 'Sony WH-1000XM5 Headphones' });
    if (!headphones) {
      headphones = await FoundItem.create({
        itemCode: 'LF-2026-0004',
        title: 'Sony WH-1000XM5 Headphones',
        itemName: 'Sony WH-1000XM5 Headphones',
        category: 'Electronics',
        location: 'Student Activity Center / Cafeteria',
        storageLocation: 'Campus Security / Lost & Found Desk',
        holdingLocation: 'Campus Security / Lost & Found Desk',
        dateFound: new Date('2026-09-29T15:30:00.000Z'),
        date: new Date('2026-09-29T15:30:00.000Z'),
        description: `${DEMO_TAG} Silver/off-white wireless noise-cancelling headphones found on cafeteria booth seating with gray zippered travel case.`,
        identifyingFeatures: 'Silver/cream headband, zippered case containing 3.5mm auxiliary cord.',
        color: 'Silver',
        brand: 'Sony',
        status: 'FOUND',
        reporter: fahad._id,
        reportedBy: fahad._id,
        foundBy: fahad._id,
        primaryImage: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80',
        images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80']
      });
      console.log('  + Created Found Item: Sony WH-1000XM5 Headphones (LF-2026-0004)');
    }

    // 5. Blue Water Bottle (Lost & Found pair)
    let lostBottle = await LostItem.findOne({ itemName: 'Blue Water Bottle' });
    if (!lostBottle) {
      lostBottle = await LostItem.create({
        itemCode: 'LF-2026-0005',
        title: 'Blue Water Bottle',
        itemName: 'Blue Water Bottle',
        category: 'Personal Items',
        lostLocation: 'Main Academic Block',
        location: 'Main Academic Block',
        dateLost: new Date('2026-09-26T11:00:00.000Z'),
        date: new Date('2026-09-26T11:00:00.000Z'),
        description: `${DEMO_TAG} Stainless steel insulated blue water bottle left in Room A-204 after lecture.`,
        identifyingFeatures: 'Small scratch near base, matte navy finish.',
        color: 'Blue',
        brand: 'Milton',
        status: 'LOST',
        reporter: arjun._id,
        reportedBy: arjun._id,
        primaryImage: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=600&q=80'
      });
      console.log('  + Created Lost Item: Blue Water Bottle (LF-2026-0005)');
    }

    let foundBottle = await FoundItem.findOne({ itemName: 'Blue Water Bottle' });
    if (!foundBottle) {
      foundBottle = await FoundItem.create({
        itemCode: 'LF-2026-0006',
        title: 'Blue Water Bottle',
        itemName: 'Blue Water Bottle',
        category: 'Personal Items',
        location: 'Main Academic Block',
        storageLocation: 'Campus Security / Lost & Found Desk',
        holdingLocation: 'Campus Security / Lost & Found Desk',
        dateFound: new Date('2026-09-26T12:30:00.000Z'),
        date: new Date('2026-09-26T12:30:00.000Z'),
        description: `${DEMO_TAG} Blue insulated stainless steel bottle recovered from Block A classroom floor.`,
        identifyingFeatures: 'Small scratch near bottom rim.',
        color: 'Blue',
        brand: 'Milton',
        status: 'FOUND',
        reporter: rahul._id,
        reportedBy: rahul._id,
        foundBy: rahul._id,
        primaryImage: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=600&q=80'
      });
      console.log('  + Created Found Item: Blue Water Bottle (LF-2026-0006)');
    }

    // 6. Student ID Card (RETURNED)
    let studentIdCard = await FoundItem.findOne({ itemName: 'Student ID Card' });
    if (!studentIdCard) {
      studentIdCard = await FoundItem.create({
        itemCode: 'LF-2026-0007',
        title: 'Student ID Card',
        itemName: 'Student ID Card',
        category: 'ID Cards',
        location: 'Computer & IT Complex',
        storageLocation: 'Campus Security / Lost & Found Desk',
        holdingLocation: 'Campus Security / Lost & Found Desk',
        dateFound: new Date('2026-09-25T10:00:00.000Z'),
        date: new Date('2026-09-25T10:00:00.000Z'),
        description: `${DEMO_TAG} Official University Identity card for Arjun Nair (CS-2024-0089). Handed over to student at security desk.`,
        identifyingFeatures: 'BCA Department, Register Number CS-2024-0089.',
        color: 'Teal / White',
        status: 'RETURNED',
        reporter: shamil._id,
        reportedBy: shamil._id,
        foundBy: shamil._id,
        primaryImage: 'https://images.unsplash.com/photo-1589330694653-dad6d3240e2b?auto=format&fit=crop&w=600&q=80'
      });
      console.log('  + Created Item: Student ID Card [RETURNED] (LF-2026-0007)');
    }

    // 7. Black Backpack (CLAIMED / UNDER_REVIEW)
    let backpack = await FoundItem.findOne({ itemName: 'Black Backpack' });
    if (!backpack) {
      backpack = await FoundItem.create({
        itemCode: 'LF-2026-0008',
        title: 'Black Backpack',
        itemName: 'Black Backpack',
        category: 'Bags',
        location: 'Campus Auditorium',
        storageLocation: 'Campus Security / Lost & Found Desk',
        holdingLocation: 'Campus Security / Lost & Found Desk',
        dateFound: new Date('2026-09-27T16:00:00.000Z'),
        date: new Date('2026-09-27T16:00:00.000Z'),
        description: `${DEMO_TAG} Black travel backpack with laptop compartment and red accent zipper pulls. Found on Row G seat 14.`,
        identifyingFeatures: 'Red zipper pulls, contains scientific calculator and notebook.',
        color: 'Black',
        brand: 'Wildcraft',
        status: 'CLAIMED',
        reporter: neha._id,
        reportedBy: neha._id,
        foundBy: neha._id,
        primaryImage: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=600&q=80'
      });
      console.log('  + Created Found Item: Black Backpack [CLAIMED] (LF-2026-0008)');
    }

    // 8. Scientific Calculator (FOUND)
    let calculator = await FoundItem.findOne({ itemName: 'Scientific Calculator' });
    if (!calculator) {
      calculator = await FoundItem.create({
        itemCode: 'LF-2026-0009',
        title: 'Scientific Calculator',
        itemName: 'Scientific Calculator',
        category: 'Electronics',
        location: 'Science & Engineering Block, Room 108',
        storageLocation: 'Department Office Room 102',
        holdingLocation: 'Department Office Room 102',
        dateFound: new Date('2026-09-29T14:00:00.000Z'),
        date: new Date('2026-09-29T14:00:00.000Z'),
        description: `${DEMO_TAG} Casio fx-991EX ClassWiz scientific calculator with sliding hard protective cover.`,
        identifyingFeatures: 'Black slide case, pencil mark on back battery cover.',
        color: 'Black / White',
        brand: 'Casio',
        status: 'FOUND',
        reporter: fahad._id,
        reportedBy: fahad._id,
        foundBy: fahad._id,
        primaryImage: 'https://images.unsplash.com/photo-1611117775350-ac3950990985?auto=format&fit=crop&w=600&q=80'
      });
      console.log('  + Created Found Item: Scientific Calculator (LF-2026-0009)');
    }

    // 9. USB Drive (VERIFICATION_PENDING)
    let usbDrive = await FoundItem.findOne({ itemName: 'USB Drive (SanDisk 64GB)' });
    if (!usbDrive) {
      usbDrive = await FoundItem.create({
        itemCode: 'LF-2026-0010',
        title: 'USB Drive (SanDisk 64GB)',
        itemName: 'USB Drive (SanDisk 64GB)',
        category: 'Electronics',
        location: 'Computer & IT Complex',
        storageLocation: 'Lab Assistant Office Room 104',
        holdingLocation: 'Lab Assistant Office Room 104',
        dateFound: new Date('2026-09-27T17:00:00.000Z'),
        date: new Date('2026-09-27T17:00:00.000Z'),
        description: `${DEMO_TAG} Red and black sliding SanDisk Ultra USB 3.0 flash drive left connected to Lab Computer 14.`,
        identifyingFeatures: 'SanDisk 64GB red slider, volume label "PROJECTS".',
        color: 'Red / Black',
        brand: 'SanDisk',
        status: 'VERIFICATION_PENDING',
        reporter: shamil._id,
        reportedBy: shamil._id,
        foundBy: shamil._id,
        primaryImage: 'https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd?auto=format&fit=crop&w=600&q=80'
      });
      console.log('  + Created Found Item: USB Drive [VERIFICATION_PENDING] (LF-2026-0010)');
    }

    // 10. College Notebook (LOST by Ananya Menon)
    let notebook = await LostItem.findOne({ itemName: 'College Notebook (Spiral Bound)' });
    if (!notebook) {
      notebook = await LostItem.create({
        itemCode: 'LF-2026-0011',
        title: 'College Notebook (Spiral Bound)',
        itemName: 'College Notebook (Spiral Bound)',
        category: 'Books',
        lostLocation: 'Central Library',
        location: 'Central Library',
        dateLost: new Date('2026-09-30T09:00:00.000Z'),
        date: new Date('2026-09-30T09:00:00.000Z'),
        description: `${DEMO_TAG} A4 sized 5-subject spiral notebook with orange polypropylene cover containing Electrical Machines notes.`,
        identifyingFeatures: 'Orange cover, name "Ananya Menon EE" written on the index page.',
        color: 'Orange',
        brand: 'Classmate',
        status: 'LOST',
        reporter: ananya._id,
        reportedBy: ananya._id,
        primaryImage: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80'
      });
      console.log('  + Created Lost Item: College Notebook (LF-2026-0011)');
    }

    // 11. House Keys (FOUND)
    let houseKeys = await FoundItem.findOne({ itemName: 'House Keys (with Brass Keychain)' });
    if (!houseKeys) {
      houseKeys = await FoundItem.create({
        itemCode: 'LF-2026-0012',
        title: 'House Keys (with Brass Keychain)',
        itemName: 'House Keys (with Brass Keychain)',
        category: 'Keys',
        location: 'Sports Complex & Gymnasium',
        storageLocation: 'Campus Security / Lost & Found Desk',
        holdingLocation: 'Campus Security / Lost & Found Desk',
        dateFound: new Date('2026-09-30T17:30:00.000Z'),
        date: new Date('2026-09-30T17:30:00.000Z'),
        description: `${DEMO_TAG} Ring with three metal door keys and a brass eagle keychain found near the badminton court lockers.`,
        identifyingFeatures: 'Three keys (one Godrej, two silver), heavy brass eagle keychain.',
        color: 'Brass / Silver',
        status: 'FOUND',
        reporter: fahad._id,
        reportedBy: fahad._id,
        foundBy: fahad._id,
        primaryImage: 'https://images.unsplash.com/photo-1582139329536-e7284fece509?auto=format&fit=crop&w=600&q=80'
      });
      console.log('  + Created Found Item: House Keys (LF-2026-0012)');
    }

    console.log('\nStep 3: Provisioning Smart Correlation Matches (Section 9)...');
    let match = await Match.findOne({ lostItem: lostLaptop._id, foundItem: foundLaptop._id });
    if (!match) {
      match = await Match.create({
        lostItem: lostLaptop._id,
        foundItem: foundLaptop._id,
        itemName: 'Black HP Laptop',
        matchScore: 94,
        matchLevel: MATCH_LEVELS?.HIGH_POSSIBILITY || 'HIGH_POSSIBILITY',
        matchingFactors: {
          category: 20,
          itemName: 20,
          description: 20,
          brand: 10,
          color: 10,
          location: 10,
          date: 4,
          reasons: [
            '✓ Category match: Electronics (20%)',
            '✓ Name similarity: Black HP Laptop (20%)',
            '✓ Description match: Silver sticker next to HP logo (20%)',
            '✓ Exact brand match: HP (10%)',
            '✓ Exact color match: Black (10%)',
            '✓ Proximity location: College Library (10%)'
          ]
        },
        status: 'CONFIRMED',
        notificationSent: true
      });
      console.log('  + Created Match: 94% Correlation for Black HP Laptop (CONFIRMED)');
    }

    let bottleMatch = await Match.findOne({ lostItem: lostBottle._id, foundItem: foundBottle._id });
    if (!bottleMatch) {
      bottleMatch = await Match.create({
        lostItem: lostBottle._id,
        foundItem: foundBottle._id,
        itemName: 'Blue Water Bottle',
        matchScore: 88,
        matchLevel: MATCH_LEVELS?.HIGH_POSSIBILITY || 'HIGH_POSSIBILITY',
        matchingFactors: {
          category: 20,
          itemName: 18,
          description: 18,
          brand: 10,
          color: 10,
          location: 8,
          date: 4,
          reasons: [
            '✓ Category match: Personal Items (20%)',
            '✓ Brand match: Milton (10%)',
            '✓ Color match: Blue (10%)',
            '✓ Location match: Main Academic Block (8%)'
          ]
        },
        status: 'PENDING',
        notificationSent: true
      });
      console.log('  + Created Match: 88% Correlation for Blue Water Bottle (PENDING)');
    }

    console.log('\nStep 4: Provisioning Ownership Claims (Section 10 & 11)...');
    let claim = await Claim.findOne({ item: foundLaptop._id, claimant: arjun._id });
    if (!claim) {
      claim = await Claim.create({
        claimId: 'CLM-2026-0001',
        item: foundLaptop._id,
        itemId: foundLaptop._id,
        claimant: arjun._id,
        claimantId: arjun._id,
        reason: 'I left my laptop on the library reading table during afternoon study session.',
        proofDescription: 'I have the original purchase invoice and university assignment files stored under CS-2024-0089.',
        ownershipProof: 'Serial Number: HP-CND4921X90. Sticker is silver reflective next to the HP logo.',
        identifyingInformation: 'Serial Number: HP-CND4921X90. Sticker is silver reflective next to the HP logo.',
        status: 'approved',
        reviewedBy: admin._id,
        reviewedAt: new Date('2026-09-29T10:00:00.000Z'),
        adminNotes: 'Serial number HP-CND4921X90 confirmed against student institutional purchase registration. Claim APPROVED.',
        verificationNotes: 'Serial number HP-CND4921X90 confirmed against student institutional purchase registration. Claim APPROVED.'
      });
      console.log('  + Created Claim: CLM-2026-0001 (APPROVED) for Arjun Nair');
    }

    let backpackClaim = await Claim.findOne({ item: backpack._id });
    if (!backpackClaim) {
      backpackClaim = await Claim.create({
        claimId: 'CLM-2026-0002',
        item: backpack._id,
        itemId: backpack._id,
        claimant: fahad._id,
        claimantId: fahad._id,
        reason: 'Left my backpack in auditorium row G after engineering symposium.',
        proofDescription: 'Wildcraft bag with red pull cords. Contains mechanical drafting tools inside.',
        ownershipProof: 'Inside front zipper has an engineering drawing stencil with my name "Fahad Ali ME".',
        identifyingInformation: 'Inside front zipper has an engineering drawing stencil with my name "Fahad Ali ME".',
        status: 'underReview',
        adminNotes: 'Awaiting student arrival at Security Desk with ID ME-2024-0045.'
      });
      console.log('  + Created Claim: CLM-2026-0002 (UNDER_REVIEW) for Fahad Ali');
    }

    console.log('\nStep 5: Provisioning Fast Return Records (Section 12)...');
    let returnRecord = await Return.findOne({ claim: claim._id });
    if (!returnRecord) {
      returnRecord = await Return.create({
        returnId: 'R-2026-0001',
        claim: claim._id,
        item: foundLaptop._id,
        itemId: foundLaptop._id,
        owner: arjun._id,
        ownerId: arjun._id,
        finder: rahul._id,
        approvedBy: admin._id,
        status: 'READY_FOR_RETURN',
        meetingLocation: 'Campus Security / Lost & Found Desk',
        handoverLocation: 'Campus Security / Lost & Found Desk',
        handoverCode: 'RET-482913',
        notes: 'Handover code RET-482913 generated. Verification required: Present student ID CS-2024-0089 at Campus Security Desk.'
      });
      console.log('  + Created Return Record: R-2026-0001 (READY_FOR_RETURN, Handover Code: RET-482913)');
    }

    // Historical completed return for ID Card
    let idCardReturn = await Return.findOne({ item: studentIdCard._id });
    if (!idCardReturn) {
      idCardReturn = await Return.create({
        returnId: 'R-2026-0002',
        claim: claim._id, // placeholder relation
        item: studentIdCard._id,
        itemId: studentIdCard._id,
        owner: arjun._id,
        ownerId: arjun._id,
        finder: shamil._id,
        approvedBy: admin._id,
        status: 'RETURNED',
        meetingLocation: 'Campus Security / Lost & Found Desk',
        handoverLocation: 'Campus Security / Lost & Found Desk',
        handoverCode: 'RET-109284',
        completedAt: new Date('2026-09-26T15:00:00.000Z'),
        notes: 'ID Card verified against student university records and returned successfully.'
      });
      console.log('  + Created Return Record: R-2026-0002 (RETURNED, Handover Code: RET-109284)');
    }

    console.log('\nStep 6: Provisioning Student Notifications (Section 13)...');
    const demoNotifs = [
      {
        recipient: arjun._id,
        userId: arjun._id,
        type: NOTIFICATION_TYPES?.NEW_POSSIBLE_MATCH || 'new_possible_match',
        title: 'Potential match found for your Black HP Laptop',
        message: 'A Black HP Laptop found at College Library has a 94% algorithmic match with your lost report.',
        relatedItemId: lostLaptop._id,
        actionUrl: '/matches',
        isRead: false
      },
      {
        recipient: arjun._id,
        userId: arjun._id,
        type: 'claim_approved',
        title: 'Ownership Claim Approved',
        message: 'Your claim for Black HP Laptop has been verified and approved by Campus Security.',
        relatedItemId: foundLaptop._id,
        relatedClaimId: claim._id,
        actionUrl: '/my-returns',
        isRead: false
      },
      {
        recipient: arjun._id,
        userId: arjun._id,
        type: 'return_ready',
        title: 'Return Ready for Collection',
        message: 'Your item is ready for pickup at Campus Security Desk. Your Handover Code is RET-482913.',
        relatedItemId: foundLaptop._id,
        actionUrl: '/my-returns',
        isRead: false
      },
      {
        recipient: fahad._id,
        userId: fahad._id,
        type: 'claim_submitted',
        title: 'Claim Under Review',
        message: 'Your claim for Black Backpack is currently being reviewed by security administration.',
        relatedItemId: backpack._id,
        actionUrl: '/my-claims',
        isRead: true
      },
      {
        recipient: arjun._id,
        userId: arjun._id,
        type: 'system_alert',
        title: 'Item Returned: Student ID Card',
        message: 'Your Student ID Card (CS-2024-0089) was successfully handed over and closed.',
        relatedItemId: studentIdCard._id,
        actionUrl: '/history',
        isRead: true
      }
    ];

    for (const notif of demoNotifs) {
      await Notification.create(notif);
    }
    console.log(`  + Created ${demoNotifs.length} verified notifications`);

    console.log('\nStep 7: Provisioning Audit Logs (Section 22)...');
    const demoAudits = [
      {
        actor: admin._id,
        actorId: admin._id,
        actorEmail: admin.email,
        action: 'APPROVE_CLAIM',
        entityType: 'Claim',
        targetType: 'Claim',
        entityId: claim._id.toString(),
        targetId: claim._id.toString(),
        metadata: { claimId: 'CLM-2026-0001', itemId: foundLaptop._id.toString(), claimant: arjun.email },
        ipAddress: '127.0.0.1',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
      },
      {
        actor: admin._id,
        actorId: admin._id,
        actorEmail: admin.email,
        action: 'CREATE_RETURN',
        entityType: 'Return',
        targetType: 'Return',
        entityId: returnRecord._id.toString(),
        targetId: returnRecord._id.toString(),
        metadata: { returnCode: 'RET-482913', handoverLocation: 'Campus Security Desk' },
        ipAddress: '127.0.0.1',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
      },
      {
        actor: arjun._id,
        actorId: arjun._id,
        actorEmail: arjun.email,
        action: 'SUBMIT_CLAIM',
        entityType: 'Claim',
        targetType: 'Claim',
        entityId: claim._id.toString(),
        targetId: claim._id.toString(),
        metadata: { itemCode: 'LF-2026-0002' },
        ipAddress: '127.0.0.1',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
      },
      {
        actor: rahul._id,
        actorId: rahul._id,
        actorEmail: rahul.email,
        action: 'CREATE_ITEM',
        entityType: 'Item',
        targetType: 'Item',
        entityId: foundLaptop._id.toString(),
        targetId: foundLaptop._id.toString(),
        metadata: { type: 'found', itemName: 'Black HP Laptop', itemCode: 'LF-2026-0002' },
        ipAddress: '127.0.0.1',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
      },
      {
        actor: arjun._id,
        actorId: arjun._id,
        actorEmail: arjun.email,
        action: 'LOGIN',
        entityType: 'User',
        targetType: 'User',
        entityId: arjun._id.toString(),
        targetId: arjun._id.toString(),
        metadata: { loginMethod: 'password', role: 'student' },
        ipAddress: '127.0.0.1',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
      }
    ];

    for (const audit of demoAudits) {
      await AuditLog.create(audit);
    }
    console.log(`  + Created ${demoAudits.length} security audit logs`);

    console.log('\nStep 8: Provisioning Contact Messages & Announcements...');
    let contact = await ContactMessage.findOne({ email: 'student.demo@campus.local' });
    if (!contact) {
      contact = await ContactMessage.create({
        name: 'Arjun Nair',
        email: 'student.demo@campus.local',
        subject: 'Query regarding Security Desk collection hours',
        message: 'Could you confirm the Saturday timings for the Campus Security Lost & Found collection desk?',
        status: 'new'
      });
      console.log('  + Created Contact Message from Arjun Nair');
    }

    console.log('\n====================================================');
    console.log(' Demo Seeding Complete! Ready for Evaluation & Video ');
    console.log('====================================================');
    console.log('DEMO ACCOUNTS (Section 25):');
    console.log('  • Student: student.demo@campus.local / DemoStudent@2026');
    console.log('  • Admin:   admin.demo@campus.local   / DemoAdmin@2026');
    console.log('PRESENTATION ACCOUNTS:');
    console.log('  • Owner:   arjun.nair@campus.demo    / Demo@12345');
    console.log('  • Finder:  rahul.menon@campus.demo   / Demo@12345');
    console.log('  • Admin:   admin@campus.demo         / Admin@12345');
    console.log('====================================================\n');

    await disconnectDatabase();
  } catch (err) {
    console.error('[Error] Seeding failed:', err);
    process.exit(1);
  }
};

run();
