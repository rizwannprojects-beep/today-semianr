/**
 * Campus Lost & Found System — Frontend Resilient Mock Data Engine
 * 
 * Provides instantaneous, realistic fallback responses when deployed on static
 * hosting environments (like Vercel) where a live MongoDB/Express backend is not connected,
 * or when the backend returns 405 / 404 / Network Error.
 */

export const DEMO_STUDENT = {
  _id: 'usr_student_arjun_01',
  fullName: 'Arjun Nair',
  name: 'Arjun Nair',
  email: 'arjun.nair@campus.edu',
  role: 'student',
  department: 'Computer Applications (BCA)',
  course: 'Bachelor of Computer Applications',
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

export const DEMO_ADMIN = {
  _id: 'usr_admin_authority_01',
  fullName: 'Campus Administrator',
  name: 'Campus Administrator',
  email: 'admin@campus.edu',
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
    itemName: 'Apple MacBook Air M2 Space Gray',
    title: 'Apple MacBook Air M2 Space Gray',
    category: 'Laptop',
    description: 'Left on 3rd floor study table in Central Library with navy blue protective case and stickers.',
    location: 'Central Library',
    lostLocation: 'Central Library',
    dateLost: '2026-09-28T14:30:00.000Z',
    date: 'September 28, 2026',
    status: 'ACTIVE',
    color: 'Space Gray',
    brand: 'Apple',
    serialNumber: 'C02G90**MD6R',
    primaryImage: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=600&q=80',
    images: ['https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=600&q=80'],
    reporter: DEMO_STUDENT._id,
    reporterName: 'Arjun Nair',
    createdAt: '2026-09-28T15:00:00.000Z'
  },
  {
    _id: 'lost-item-2',
    id: 'lost-item-2',
    itemName: 'Brown Leather Fossil Wallet',
    title: 'Brown Leather Fossil Wallet',
    category: 'Wallet',
    description: 'Lost near Main Auditorium during orientation seminar. Contains campus student ID card.',
    location: 'Campus Auditorium',
    lostLocation: 'Campus Auditorium',
    dateLost: '2026-09-27T11:00:00.000Z',
    date: 'September 27, 2026',
    status: 'ACTIVE',
    color: 'Brown',
    brand: 'Fossil',
    primaryImage: 'https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=600&q=80',
    images: ['https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=600&q=80'],
    reporter: DEMO_STUDENT._id,
    reporterName: 'Arjun Nair',
    createdAt: '2026-09-27T12:00:00.000Z'
  },
  {
    _id: 'lost-item-3',
    id: 'lost-item-3',
    itemName: 'TI-84 Plus CE Graphing Calculator',
    title: 'TI-84 Plus CE Graphing Calculator',
    category: 'Electronics',
    description: 'Black casing with small yellow physics label on the back slide cover. Misplaced in Science block.',
    location: 'Science & Engineering Block',
    lostLocation: 'Science & Engineering Block',
    dateLost: '2026-09-26T09:15:00.000Z',
    date: 'September 26, 2026',
    status: 'ACTIVE',
    color: 'Black',
    brand: 'Texas Instruments',
    primaryImage: 'https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd?auto=format&fit=crop&w=600&q=80',
    images: ['https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd?auto=format&fit=crop&w=600&q=80'],
    reporter: 'usr_student_alex_02',
    reporterName: 'Alex Rivera',
    createdAt: '2026-09-26T10:00:00.000Z'
  },
  {
    _id: 'lost-item-4',
    id: 'lost-item-4',
    itemName: 'Student Identity Card & Lanyard',
    title: 'Student Identity Card & Lanyard',
    category: 'ID Card',
    description: 'Official campus card with teal ribbon lanyard and RFID access tag attached.',
    location: 'Student Activity Center / Cafeteria',
    lostLocation: 'Student Activity Center / Cafeteria',
    dateLost: '2026-09-29T13:45:00.000Z',
    date: 'September 29, 2026',
    status: 'ACTIVE',
    color: 'Teal / White',
    brand: 'Campus ID',
    primaryImage: 'https://images.unsplash.com/photo-1589330694653-dad6d3240e2b?auto=format&fit=crop&w=600&q=80',
    images: ['https://images.unsplash.com/photo-1589330694653-dad6d3240e2b?auto=format&fit=crop&w=600&q=80'],
    reporter: DEMO_STUDENT._id,
    reporterName: 'Arjun Nair',
    createdAt: '2026-09-29T14:00:00.000Z'
  }
];

export const INITIAL_FOUND_ITEMS = [
  {
    _id: 'found-item-1',
    id: 'found-item-1',
    itemName: 'Sony WH-1000XM5 Wireless Headphones',
    title: 'Sony WH-1000XM5 Wireless Headphones',
    category: 'Electronics',
    description: 'Found on concrete bench near Engineering Quad cafeteria. Matte black in protective zip case.',
    location: 'Engineering Quad',
    storageLocation: 'Administration & Security Desk',
    dateFound: '2026-09-30T16:00:00.000Z',
    date: 'September 30, 2026',
    status: 'FOUND',
    color: 'Black',
    brand: 'Sony',
    primaryImage: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80',
    images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80'],
    finder: 'usr_student_maya_03',
    finderName: 'Maya Chen',
    createdAt: '2026-09-30T16:30:00.000Z'
  },
  {
    _id: 'found-item-2',
    id: 'found-item-2',
    itemName: 'Blue Hydro Flask Water Bottle (32oz)',
    title: 'Blue Hydro Flask Water Bottle (32oz)',
    category: 'Accessories',
    description: 'Left behind on row 4 seat after Physics lecture. Has university holographic badge.',
    location: 'Science & Engineering Block',
    storageLocation: 'Administration & Security Desk',
    dateFound: '2026-09-29T12:00:00.000Z',
    date: 'September 29, 2026',
    status: 'FOUND',
    color: 'Pacific Blue',
    brand: 'Hydro Flask',
    primaryImage: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=600&q=80',
    images: ['https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=600&q=80'],
    finder: DEMO_STUDENT._id,
    finderName: 'Arjun Nair',
    createdAt: '2026-09-29T12:30:00.000Z'
  },
  {
    _id: 'found-item-3',
    id: 'found-item-3',
    itemName: 'Casio Scientific Calculator FX-991CW',
    title: 'Casio Scientific Calculator FX-991CW',
    category: 'Electronics',
    description: 'Found on desk in Computer Lab 3 with slide lid closed.',
    location: 'Computer & IT Complex',
    storageLocation: 'Lab Assistant Office Room 104',
    dateFound: '2026-09-28T17:15:00.000Z',
    date: 'September 28, 2026',
    status: 'FOUND',
    color: 'Black / White',
    brand: 'Casio',
    primaryImage: 'https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd?auto=format&fit=crop&w=600&q=80',
    images: ['https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd?auto=format&fit=crop&w=600&q=80'],
    finder: 'usr_student_alex_02',
    finderName: 'Alex Rivera',
    createdAt: '2026-09-28T17:45:00.000Z'
  },
  {
    _id: 'found-item-4',
    id: 'found-item-4',
    itemName: 'Apple AirPods Pro 2nd Gen Case',
    title: 'Apple AirPods Pro 2nd Gen Case',
    category: 'Electronics',
    description: 'White MagSafe charging case found in library study pod B.',
    location: 'Central Library',
    storageLocation: 'Administration & Security Desk',
    dateFound: '2026-09-27T14:00:00.000Z',
    date: 'September 27, 2026',
    status: 'FOUND',
    color: 'White',
    brand: 'Apple',
    primaryImage: 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?auto=format&fit=crop&w=600&q=80',
    images: ['https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?auto=format&fit=crop&w=600&q=80'],
    finder: 'usr_student_jordan_04',
    finderName: 'Jordan Taylor',
    createdAt: '2026-09-27T14:30:00.000Z'
  }
];

export const INITIAL_CLAIMS = [
  {
    _id: 'claim-demo-1',
    id: 'claim-demo-1',
    itemId: 'found-item-1',
    item: INITIAL_FOUND_ITEMS[0],
    itemName: 'Sony WH-1000XM5 Wireless Headphones',
    claimant: DEMO_STUDENT,
    claimer: DEMO_STUDENT._id,
    claimerName: 'Arjun Nair',
    proofDescription: 'Can provide matching serial number and digital receipt from official retailer store.',
    status: 'approved',
    verificationStatus: 'approved',
    adminNotes: 'Serial number verified against student purchase receipt.',
    createdAt: '2026-09-30T17:00:00.000Z'
  }
];

export const INITIAL_MATCHES = [
  {
    _id: 'match-demo-1',
    id: 'match-demo-1',
    lostItem: INITIAL_LOST_ITEMS[0],
    foundItem: INITIAL_FOUND_ITEMS[0],
    itemName: 'Apple MacBook Air / Sony Electronics Match',
    confidenceScore: 88,
    similarityScore: 88,
    matchReason: 'High visual and geographic correlation in Central Library / Quad perimeter.',
    status: 'pending',
    viewed: false,
    createdAt: '2026-09-30T18:00:00.000Z'
  }
];

export const INITIAL_NOTIFICATIONS = [
  {
    _id: 'notif-1',
    id: 'notif-1',
    title: 'Potential match found!',
    message: 'Your Apple MacBook Air M2 has a possible high-confidence match.',
    time: '10 mins ago',
    type: 'match',
    isRead: false,
    createdAt: new Date(Date.now() - 10 * 60000).toISOString()
  },
  {
    _id: 'notif-2',
    id: 'notif-2',
    title: 'Claim approved',
    message: 'Your ownership claim for Sony Headphones has been verified and approved.',
    time: '2 hours ago',
    type: 'claim',
    isRead: false,
    createdAt: new Date(Date.now() - 120 * 60000).toISOString()
  },
  {
    _id: 'notif-3',
    id: 'notif-3',
    title: 'New campus announcement',
    message: 'Annual Campus Lost & Found Inventory Review scheduled for this Friday.',
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
  }
];

export const INITIAL_ADMIN_USERS = [
  DEMO_STUDENT,
  DEMO_ADMIN,
  {
    _id: 'usr_student_alex_02',
    fullName: 'Alex Rivera',
    name: 'Alex Rivera',
    email: 'alex.rivera@campus.edu',
    role: 'student',
    department: 'Computer Science',
    registerNumber: 'REG-2026-CS01',
    phone: '+91 98765 11111',
    accountStatus: 'active',
    emailVerified: true
  },
  {
    _id: 'usr_student_maya_03',
    fullName: 'Maya Chen',
    name: 'Maya Chen',
    email: 'maya.chen@campus.edu',
    role: 'student',
    department: 'Electrical Engineering',
    registerNumber: 'REG-2026-EE02',
    phone: '+91 98765 22222',
    accountStatus: 'active',
    emailVerified: true
  },
  {
    _id: 'usr_student_jordan_04',
    fullName: 'Jordan Taylor',
    name: 'Jordan Taylor',
    email: 'jordan.taylor@campus.edu',
    role: 'student',
    department: 'Mechanical Engineering',
    registerNumber: 'REG-2026-ME03',
    phone: '+91 98765 33333',
    accountStatus: 'active',
    emailVerified: true
  }
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
