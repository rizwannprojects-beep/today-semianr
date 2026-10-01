/**
 * Campus Lost & Found System — Standardized Presentation Dataset
 * 
 * Configured specifically for presentation demo and screen recording:
 * - Student 1 (Owner): Arjun Nair (arjun.nair@campus.demo / Demo@12345)
 * - Student 2 (Finder): Rahul Menon (rahul.menon@campus.demo / Demo@12345)
 * - Student 3 (Another User): Fathima Rahman (fathima.rahman@campus.demo / Demo@12345)
 * - Admin: Campus Admin (admin@campus.demo / Admin@12345)
 */

export const DEMO_STUDENT = {
  _id: 'usr_student_arjun_01',
  fullName: 'Arjun Nair',
  name: 'Arjun Nair',
  email: 'arjun.nair@campus.demo',
  role: 'student',
  department: 'Computer Applications',
  course: 'BCA',
  registerNumber: 'CS-2024-089',
  rollNumber: 'CS-2024-089',
  phone: '+91 98765 43210',
  year: 3,
  semester: 5,
  className: 'BCA-3A',
  accountStatus: 'active',
  emailVerified: true,
  avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
  joinedAt: '2026-08-15T09:00:00.000Z'
};

export const DEMO_FINDER = {
  _id: 'usr_student_rahul_02',
  fullName: 'Rahul Menon',
  name: 'Rahul Menon',
  email: 'rahul.menon@campus.demo',
  role: 'student',
  department: 'Computer Applications',
  course: 'BCA',
  registerNumber: 'CS-2024-117',
  rollNumber: 'CS-2024-117',
  phone: '+91 98765 43211',
  year: 3,
  semester: 5,
  className: 'BCA-3A',
  accountStatus: 'active',
  emailVerified: true,
  avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
  joinedAt: '2026-08-15T09:00:00.000Z'
};

export const DEMO_STUDENT_3 = {
  _id: 'usr_student_fathima_03',
  fullName: 'Fathima Rahman',
  name: 'Fathima Rahman',
  email: 'fathima.rahman@campus.demo',
  role: 'student',
  department: 'Computer Applications',
  course: 'BCA',
  registerNumber: 'CS-2024-142',
  rollNumber: 'CS-2024-142',
  phone: '+91 98765 43212',
  year: 3,
  semester: 5,
  className: 'BCA-3B',
  accountStatus: 'active',
  emailVerified: true,
  avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
  joinedAt: '2026-08-15T09:00:00.000Z'
};

export const DEMO_ADMIN = {
  _id: 'usr_admin_authority_01',
  fullName: 'Campus Admin',
  name: 'Campus Admin',
  email: 'admin@campus.demo',
  role: 'admin',
  department: 'Campus Security & Administration',
  registerNumber: 'ADMIN-001',
  phone: '+1 (555) 019-4820',
  accountStatus: 'active',
  emailVerified: true,
  avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80',
  joinedAt: '2026-01-10T09:00:00.000Z'
};

export const INITIAL_LOST_ITEMS = [
  {
    _id: 'lost-item-1',
    id: 'lost-item-1',
    itemName: 'Black HP Laptop',
    title: 'Black HP Laptop',
    category: 'Electronics',
    description: 'Black HP laptop with a small silver sticker near the HP logo. The laptop was last seen on a study table near the library reading area.',
    location: 'College Library',
    lostLocation: 'College Library',
    dateLost: '2026-09-28T14:30:00.000Z',
    date: 'September 28, 2026',
    status: 'LOST',
    color: 'Black',
    brand: 'HP',
    identifyingMarks: 'Silver sticker next to HP logo, BCA assignment folder on desktop.',
    primaryImage: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=600&q=80',
    images: ['https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=600&q=80'],
    reporter: DEMO_STUDENT._id,
    reporterName: 'Arjun Nair',
    createdAt: '2026-09-28T15:00:00.000Z'
  },
  {
    _id: 'lost-item-2',
    id: 'lost-item-2',
    itemName: 'Blue Water Bottle',
    title: 'Blue Water Bottle',
    category: 'Personal Items',
    description: 'Stainless steel blue water bottle left in Room A-204 after class.',
    location: 'Block A',
    lostLocation: 'Block A',
    dateLost: '2026-09-26T11:00:00.000Z',
    date: 'September 26, 2026',
    status: 'LOST',
    color: 'Blue',
    brand: 'Hydro Flask',
    primaryImage: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=600&q=80',
    images: ['https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=600&q=80'],
    reporter: DEMO_STUDENT._id,
    reporterName: 'Arjun Nair',
    createdAt: '2026-09-26T11:30:00.000Z'
  },
  {
    _id: 'lost-item-3',
    id: 'lost-item-3',
    itemName: 'Student ID Card',
    title: 'Student ID Card',
    category: 'Documents',
    description: 'Student identity card for Arjun Nair (CS-2024-089) with blue lanyard.',
    location: 'Computer Lab',
    lostLocation: 'Computer Lab',
    dateLost: '2026-09-25T15:00:00.000Z',
    date: 'September 25, 2026',
    status: 'RETURNED',
    color: 'Teal / White',
    brand: 'Campus ID',
    primaryImage: 'https://images.unsplash.com/photo-1589330694653-dad6d3240e2b?auto=format&fit=crop&w=600&q=80',
    images: ['https://images.unsplash.com/photo-1589330694653-dad6d3240e2b?auto=format&fit=crop&w=600&q=80'],
    reporter: DEMO_STUDENT._id,
    reporterName: 'Arjun Nair',
    createdAt: '2026-09-25T15:30:00.000Z'
  },
  {
    _id: 'lost-item-4',
    id: 'lost-item-4',
    itemName: 'Black Backpack',
    title: 'Black Backpack',
    category: 'Bags',
    description: 'Black travel backpack with laptop sleeve and water bottle pocket.',
    location: 'Seminar Hall',
    lostLocation: 'Seminar Hall',
    dateLost: '2026-09-27T10:00:00.000Z',
    date: 'September 27, 2026',
    status: 'LOST',
    color: 'Black',
    brand: 'American Tourister',
    primaryImage: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=600&q=80',
    images: ['https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=600&q=80'],
    reporter: DEMO_STUDENT_3._id,
    reporterName: 'Fathima Rahman',
    createdAt: '2026-09-27T10:30:00.000Z'
  }
];

export const INITIAL_FOUND_ITEMS = [
  {
    _id: 'found-item-1',
    id: 'found-item-1',
    itemName: 'Black HP Laptop',
    title: 'Black HP Laptop',
    category: 'Electronics',
    description: 'Found a black HP laptop on a study table near the library reading area. There is a small silver sticker near the HP logo.',
    location: 'College Library',
    storageLocation: 'Campus Security / Lost & Found Desk',
    dateFound: '2026-09-28T16:00:00.000Z',
    date: 'September 28, 2026',
    status: 'FOUND',
    color: 'Black',
    brand: 'HP',
    primaryImage: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=600&q=80',
    images: ['https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=600&q=80'],
    finder: DEMO_FINDER._id,
    finderName: 'Rahul Menon',
    createdAt: '2026-09-28T16:30:00.000Z'
  },
  {
    _id: 'found-item-2',
    id: 'found-item-2',
    itemName: 'Blue Water Bottle',
    title: 'Blue Water Bottle',
    category: 'Personal Items',
    description: 'Blue insulated water bottle recovered from Block A classroom.',
    location: 'Block A',
    storageLocation: 'Campus Security / Lost & Found Desk',
    dateFound: '2026-09-26T12:00:00.000Z',
    date: 'September 26, 2026',
    status: 'FOUND',
    color: 'Blue',
    brand: 'Hydro Flask',
    primaryImage: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=600&q=80',
    images: ['https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=600&q=80'],
    finder: DEMO_STUDENT._id,
    finderName: 'Arjun Nair',
    createdAt: '2026-09-26T12:30:00.000Z'
  },
  {
    _id: 'found-item-3',
    id: 'found-item-3',
    itemName: 'USB Drive',
    title: 'USB Drive',
    category: 'Electronics',
    description: 'Red and black sliding SanDisk USB 3.0 flash drive found in Lab 2.',
    location: 'Computer Lab',
    storageLocation: 'Lab Assistant Office Room 104',
    dateFound: '2026-09-27T16:00:00.000Z',
    date: 'September 27, 2026',
    status: 'FOUND',
    color: 'Red / Black',
    brand: 'SanDisk',
    primaryImage: 'https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd?auto=format&fit=crop&w=600&q=80',
    images: ['https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd?auto=format&fit=crop&w=600&q=80'],
    finder: DEMO_FINDER._id,
    finderName: 'Rahul Menon',
    createdAt: '2026-09-27T16:30:00.000Z'
  },
  {
    _id: 'found-item-4',
    id: 'found-item-4',
    itemName: 'Black Backpack',
    title: 'Black Backpack',
    category: 'Bags',
    description: 'Black backpack turned in by custodian after orientation seminar.',
    location: 'Seminar Hall',
    storageLocation: 'Campus Security / Lost & Found Desk',
    dateFound: '2026-09-27T14:00:00.000Z',
    date: 'September 27, 2026',
    status: 'FOUND',
    color: 'Black',
    brand: 'American Tourister',
    primaryImage: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=600&q=80',
    images: ['https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=600&q=80'],
    finder: DEMO_STUDENT_3._id,
    finderName: 'Fathima Rahman',
    createdAt: '2026-09-27T14:30:00.000Z'
  }
];

export const INITIAL_MATCHES = [
  {
    _id: 'match-demo-1',
    id: 'match-demo-1',
    lostItem: INITIAL_LOST_ITEMS[0],
    foundItem: INITIAL_FOUND_ITEMS[0],
    itemName: 'Black HP Laptop',
    matchScore: 94,
    matchingScore: 94,
    matchLevel: 'HIGH_POSSIBILITY',
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
    status: 'pending',
    viewed: false,
    createdAt: '2026-09-28T16:35:00.000Z'
  }
];

export const INITIAL_CLAIMS = [
  {
    _id: 'claim-demo-1',
    id: 'claim-demo-1',
    itemId: 'found-item-1',
    item: INITIAL_FOUND_ITEMS[0],
    itemName: 'Black HP Laptop',
    claimant: DEMO_STUDENT,
    claimer: DEMO_STUDENT._id,
    claimerName: 'Arjun Nair',
    proofDescription: 'I believe this is my laptop. The silver sticker is located next to the HP logo, and it contains university course assignments in the BCA folder.',
    status: 'approved',
    verificationStatus: 'approved',
    adminNotes: 'Ownership verified: silver sticker location and BCA registration details confirmed.',
    createdAt: '2026-09-28T17:00:00.000Z'
  }
];

export const INITIAL_RETURNS = [
  {
    _id: 'return-demo-1',
    id: 'return-demo-1',
    claimId: 'claim-demo-1',
    item: INITIAL_FOUND_ITEMS[0],
    itemName: 'Black HP Laptop',
    recipient: DEMO_STUDENT,
    recipientName: 'Arjun Nair',
    ownerName: 'Arjun Nair',
    ownerRegisterNumber: 'CS-2024-089',
    ownerDepartment: 'Computer Applications',
    ownerYear: '3',
    finderName: 'Rahul Menon',
    foundLocation: 'College Library',
    custodian: 'Campus Security / Lost & Found Desk',
    returnLocation: 'Campus Security / Lost & Found Desk',
    meetingLocation: 'Campus Security / Lost & Found Desk',
    status: 'READY_FOR_RETURN',
    verificationCode: '7842',
    verificationPin: '7842',
    scheduledDate: '2026-09-29T14:00:00.000Z',
    instructions: 'Present university ID card CS-2024-089 along with 4-digit verification code 7842 to the desk officer.',
    createdAt: '2026-09-28T18:00:00.000Z'
  }
];

export const INITIAL_NOTIFICATIONS = [
  {
    _id: 'notif-1',
    id: 'notif-1',
    title: 'Possible match found for Black HP Laptop',
    message: 'Your lost Black HP Laptop may match a found item located at College Library.',
    time: '10 mins ago',
    type: 'match',
    isRead: false,
    createdAt: new Date(Date.now() - 10 * 60000).toISOString()
  },
  {
    _id: 'notif-2',
    id: 'notif-2',
    title: 'Claim submitted successfully',
    message: 'Your claim for Black HP Laptop has been submitted.',
    time: '30 mins ago',
    type: 'claim',
    isRead: false,
    createdAt: new Date(Date.now() - 30 * 60000).toISOString()
  },
  {
    _id: 'notif-3',
    id: 'notif-3',
    title: 'Verification required',
    message: 'Additional ownership information is required.',
    time: '2 hours ago',
    type: 'claim',
    isRead: false,
    createdAt: new Date(Date.now() - 120 * 60000).toISOString()
  },
  {
    _id: 'notif-4',
    id: 'notif-4',
    title: 'Found item reported near College Library',
    message: 'A Black HP Laptop was reported found near College Library reading area.',
    time: 'Yesterday',
    type: 'announcement',
    isRead: true,
    createdAt: new Date(Date.now() - 1440 * 60000).toISOString()
  }
];

export const INITIAL_ANNOUNCEMENTS = [
  {
    _id: 'ann-1',
    id: 'ann-1',
    title: 'Annual Campus Lost & Found Inventory Review',
    message: 'All items unclaimed after 90 days from the Spring Semester will be transferred to university donation in accordance with policy.',
    priority: 'NORMAL',
    audience: 'ALL_STUDENTS',
    status: 'PUBLISHED',
    publishedAt: '2026-09-28T09:00:00.000Z',
    createdAt: '2026-09-28T09:00:00.000Z'
  },
  {
    _id: 'ann-2',
    id: 'ann-2',
    title: 'Extended Security Desk Hours for Examination Week',
    message: 'The central Lost & Found Helpdesk at Room G-04 will remain open until 8:00 PM on weekdays during finals week.',
    priority: 'HIGH',
    audience: 'ALL_STUDENTS',
    status: 'PUBLISHED',
    publishedAt: '2026-09-29T10:00:00.000Z',
    createdAt: '2026-09-29T10:00:00.000Z'
  }
];

export const INITIAL_ADMIN_USERS = [
  DEMO_STUDENT,
  DEMO_FINDER,
  DEMO_STUDENT_3,
  DEMO_ADMIN
];

// Helper for local storage persistence
export const getStorage = (key, defaultVal) => {
  try {
    const raw = localStorage.getItem(`demo_${key}`);
    return raw ? JSON.parse(raw) : defaultVal;
  } catch {
    return defaultVal;
  }
};

export const setStorage = (key, val) => {
  try {
    localStorage.setItem(`demo_${key}`, JSON.stringify(val));
  } catch {}
};
