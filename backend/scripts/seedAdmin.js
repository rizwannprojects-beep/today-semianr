import { connectDatabase, disconnectDatabase } from '../config/database.js';
import User from '../models/User.js';
import { ROLES, ACCOUNT_STATUSES } from '../utils/constants.js';
import environment from '../config/environment.js';

/**
 * Controlled Bootstrap Script for Initializing the Campus Administrator Account
 * DO NOT expose admin registration to the public frontend.
 */
const seedAdmin = async () => {
  console.log('====================================================');
  console.log(' Campus Lost & Found — Admin Account Initialization ');
  console.log('====================================================');

  try {
    await connectDatabase();

    const adminName = process.env.ADMIN_NAME || 'Campus Administrator';
    const adminEmail = (process.env.ADMIN_EMAIL || 'admin@campus.edu').toLowerCase().trim();
    const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@Campus2026!';

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: adminEmail });

    if (existingAdmin) {
      console.log(`[Notice] Admin account with email '${adminEmail}' already exists in database.`);
      console.log(`Current Role: ${existingAdmin.role} | Status: ${existingAdmin.accountStatus}`);
      await disconnectDatabase();
      return;
    }

    // Create the first admin user
    const adminUser = await User.create({
      fullName: adminName,
      email: adminEmail,
      passwordHash: adminPassword, // Pre-save hook hashes with bcrypt
      phone: '+1 (555) 019-4820',
      phoneNumber: '+1 (555) 019-4820',
      registerNumber: 'ADMIN-001',
      department: 'Campus Security & Administration',
      role: ROLES.ADMIN,
      accountStatus: ACCOUNT_STATUSES.ACTIVE,
      emailVerified: true
    });

    console.log('[SUCCESS] Administrator account successfully provisioned!');
    console.log(`Admin Name   : ${adminUser.fullName}`);
    console.log(`Admin Email  : ${adminUser.email}`);
    console.log(`Assigned Role: ${adminUser.role}`);
    console.log(`Department   : ${adminUser.department}`);
    console.log('Credentials can now be used on the standard /login page to access the Admin Panel.');

    await disconnectDatabase();
  } catch (error) {
    console.error('[Error] Admin initialization failed:', error.message);
    process.exit(1);
  }
};

seedAdmin();
