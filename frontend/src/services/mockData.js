/**
 * Campus Lost & Found System — High-Fidelity Presentation Dataset
 * 
 * Curated for academic demonstrations, screen recordings, and seminar presentations.
 * Contains realistic, university-context student reports, cataloged belongings,
 * smart AI matches, claim verifications, return handovers, and admin telemetry.
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
    description: 'Left on 3rd floor study table in Central Library with navy blue matte protective sleeve and university sticker.',
    location: 'Central Library',
    lostLocation: 'Central Library Floor 3',
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
    reward: 'Campus Gratitude Token',
    createdAt: '2026-09-28T15:00:00.000Z'
  },
  {
    _id: 'lost-item-2',
    id: 'lost-item-2',
    itemName: 'Brown Leather Fossil Bi-Fold Wallet',
    title: 'Brown Leather Fossil Bi-Fold Wallet',
    category: 'Wallet',
    description: 'Lost near Main Auditorium during orientation seminar. Contains campus student ID card and Metro smart card.',
    location: 'Campus Auditorium',
    lostLocation: 'Campus Auditorium Row F',
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
    itemName: 'Student Identity Card & Teal Lanyard',
    title: 'Student Identity Card & Teal Lanyard',
    category: 'ID Card',
    description: 'Official student ID for Arjun Nair (CS-2024-089) with campus RFID contactless gate access pass attached.',
    location: 'Student Activity Center / Cafeteria',
    lostLocation: 'Student Activity Center / Cafeteria',
    dateLost: '2026-09-29T13:45:00.000Z',
    date: 'September 29, 2026',
    status: 'ACTIVE',
    color: 'Teal / White',
    brand: 'Campus ID Pass',
    primaryImage: 'https://images.unsplash.com/photo-1589330694653-dad6d3240e2b?auto=format&fit=crop&w=600&q=80',
    images: ['https://images.unsplash.com/photo-1589330694653-dad6d3240e2b?auto=format&fit=crop&w=600&q=80'],
    reporter: DEMO_STUDENT._id,
    reporterName: 'Arjun Nair',
    createdAt: '2026-09-29T14:00:00.000Z'
  },
  {
    _id: 'lost-item-4',
    id: 'lost-item-4',
    itemName: 'TI-84 Plus CE Graphing Calculator',
    title: 'TI-84 Plus CE Graphing Calculator',
    category: 'Electronics',
    description: 'Black casing with small yellow physics lab label on the back slide cover. Misplaced in Science block.',
    location: 'Science & Engineering Block',
    lostLocation: 'Science & Engineering Block Room 102',
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
    _id: 'lost-item-5',
    id: 'lost-item-5',
    itemName: 'iPhone 15 Pro (Blue Titanium)',
    title: 'iPhone 15 Pro (Blue Titanium)',
    category: 'Mobile Phone',
    description: 'Misplaced near the Computer Science server lab benches. Dark translucent MagSafe protective case.',
    location: 'Computer & IT Complex',
    lostLocation: 'Computer & IT Complex Lab 2',
    dateLost: '2026-09-30T10:20:00.000Z',
    date: 'September 30, 2026',
    status: 'ACTIVE',
    color: 'Blue Titanium',
    brand: 'Apple',
    primaryImage: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=600&q=80',
    images: ['https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=600&q=80'],
    reporter: 'usr_student_maya_03',
    reporterName: 'Maya Chen',
    createdAt: '2026-09-30T11:00:00.000Z'
  },
  {
    _id: 'lost-item-6',
    id: 'lost-item-6',
    itemName: 'Dell 65W Type-C Laptop Fast Charger',
    title: 'Dell 65W Type-C Laptop Fast Charger',
    category: 'Charger',
    description: 'Original black OEM brick with wrapped power cable. Left plugged in library desk power outlet #12.',
    location: 'Central Library',
    lostLocation: 'Central Library Desk #12',
    dateLost: '2026-09-25T16:00:00.000Z',
    date: 'September 25, 2026',
    status: 'ACTIVE',
    color: 'Black',
    brand: 'Dell',
    primaryImage: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=600&q=80',
    images: ['https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=600&q=80'],
    reporter: 'usr_student_rahul_05',
    reporterName: 'Rahul Sharma',
    createdAt: '2026-09-25T16:30:00.000Z'
  },
  {
    _id: 'lost-item-7',
    id: 'lost-item-7',
    itemName: 'The North Face Jester Backpack',
    title: 'The North Face Jester Backpack',
    category: 'Bag',
    description: 'Dark grey water-resistant backpack containing engineering notebooks and pencil case.',
    location: 'Sports Complex & Gymnasium',
    lostLocation: 'Gymnasium Locker Room Bench',
    dateLost: '2026-09-29T18:00:00.000Z',
    date: 'September 29, 2026',
    status: 'ACTIVE',
    color: 'Charcoal Grey',
    brand: 'The North Face',
    primaryImage: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=600&q=80',
    images: ['https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=600&q=80'],
    reporter: 'usr_student_priya_06',
    reporterName: 'Priya Patel',
    createdAt: '2026-09-29T19:00:00.000Z'
  },
  {
    _id: 'lost-item-8',
    id: 'lost-item-8',
    itemName: 'Hostel Room & Bike Keys with Brass Carabiner',
    title: 'Hostel Room & Bike Keys with Brass Carabiner',
    category: 'Keys',
    description: 'Set of 3 Yale keys with heavy duty brass spring clip and blue plastic keychain tag labeled #304.',
    location: 'North / South Parking Bay',
    lostLocation: 'North Bike Stand #2',
    dateLost: '2026-09-28T08:30:00.000Z',
    date: 'September 28, 2026',
    status: 'ACTIVE',
    color: 'Metallic / Blue',
    brand: 'Yale',
    primaryImage: 'https://images.unsplash.com/photo-1582139329536-e7284fece509?auto=format&fit=crop&w=600&q=80',
    images: ['https://images.unsplash.com/photo-1582139329536-e7284fece509?auto=format&fit=crop&w=600&q=80'],
    reporter: 'usr_student_sneha_07',
    reporterName: 'Sneha Roy',
    createdAt: '2026-09-28T09:00:00.000Z'
  }
];

export const INITIAL_FOUND_ITEMS = [
  {
    _id: 'found-item-1',
    id: 'found-item-1',
    itemName: 'Sony WH-1000XM5 Noise Canceling Headphones',
    title: 'Sony WH-1000XM5 Noise Canceling Headphones',
    category: 'Electronics',
    description: 'Found on concrete bench near Engineering Quad cafeteria. Matte black in protective zipper carrying case.',
    location: 'Engineering Quad',
    storageLocation: 'Administration & Security Desk (Locker 04)',
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
    itemName: 'Blue Hydro Flask Wide Mouth Water Bottle (32oz)',
    title: 'Blue Hydro Flask Wide Mouth Water Bottle (32oz)',
    category: 'Accessories',
    description: 'Left behind on row 4 seat after Physics lecture. Has campus engineering holographic emblem sticker.',
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
    description: 'Found on desk in Computer Lab 3 with slide lid closed. Battery fully functional.',
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
    itemName: 'Apple AirPods Pro 2nd Gen in MagSafe Case',
    title: 'Apple AirPods Pro 2nd Gen in MagSafe Case',
    category: 'Electronics',
    description: 'White MagSafe charging case with lanyard loop found in library silent study pod B.',
    location: 'Central Library',
    storageLocation: 'Administration & Security Desk (Safe Box A)',
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
  },
  {
    _id: 'found-item-5',
    id: 'found-item-5',
    itemName: 'Fossil Slim Leather Card Wallet',
    title: 'Fossil Slim Leather Card Wallet',
    category: 'Wallet',
    description: 'Turned into security desk by custodian. Found on Auditorium steps after convocation rehearsal.',
    location: 'Campus Auditorium',
    storageLocation: 'Administration & Security Desk',
    dateFound: '2026-09-27T15:30:00.000Z',
    date: 'September 27, 2026',
    status: 'FOUND',
    color: 'Dark Brown',
    brand: 'Fossil',
    primaryImage: 'https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=600&q=80',
    images: ['https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=600&q=80'],
    finder: 'usr_admin_authority_01',
    finderName: 'Security Desk Staff',
    createdAt: '2026-09-27T16:00:00.000Z'
  },
  {
    _id: 'found-item-6',
    id: 'found-item-6',
    itemName: 'Student Identity Card & University Lanyard',
    title: 'Student Identity Card & University Lanyard',
    category: 'ID Card',
    description: 'Plastic student ID found on cafeteria dining table #8 with teal ribbon lanyard.',
    location: 'Student Activity Center / Cafeteria',
    storageLocation: 'Student Desk Help Counter',
    dateFound: '2026-09-29T14:30:00.000Z',
    date: 'September 29, 2026',
    status: 'FOUND',
    color: 'Teal',
    brand: 'Campus ID',
    primaryImage: 'https://images.unsplash.com/photo-1589330694653-dad6d3240e2b?auto=format&fit=crop&w=600&q=80',
    images: ['https://images.unsplash.com/photo-1589330694653-dad6d3240e2b?auto=format&fit=crop&w=600&q=80'],
    finder: 'usr_student_rahul_05',
    finderName: 'Rahul Sharma',
    createdAt: '2026-09-29T15:00:00.000Z'
  },
  {
    _id: 'found-item-7',
    id: 'found-item-7',
    itemName: 'Samsung Galaxy Watch 5 (Graphite 44mm)',
    title: 'Samsung Galaxy Watch 5 (Graphite 44mm)',
    category: 'Watch',
    description: 'Found by gym trainer near indoor basketball court bleachers. Black silicone sport strap.',
    location: 'Sports Complex & Gymnasium',
    storageLocation: 'Sports Complex Office G-12',
    dateFound: '2026-09-30T18:00:00.000Z',
    date: 'September 30, 2026',
    status: 'FOUND',
    color: 'Graphite Black',
    brand: 'Samsung',
    primaryImage: 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=600&q=80',
    images: ['https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=600&q=80'],
    finder: 'usr_student_priya_06',
    finderName: 'Priya Patel',
    createdAt: '2026-09-30T18:30:00.000Z'
  },
  {
    _id: 'found-item-8',
    id: 'found-item-8',
    itemName: 'Titanium Rimless Prescription Eyeglasses',
    title: 'Titanium Rimless Prescription Eyeglasses',
    category: 'Accessories',
    description: 'Found inside black magnetic hardshell case in Reading Hall B.',
    location: 'Central Library',
    storageLocation: 'Administration & Security Desk',
    dateFound: '2026-09-28T16:00:00.000Z',
    date: 'September 28, 2026',
    status: 'FOUND',
    color: 'Silver',
    brand: 'Silhouette',
    primaryImage: 'https://images.unsplash.com/photo-1574258495973-f010dfbb5371?auto=format&fit=crop&w=600&q=80',
    images: ['https://images.unsplash.com/photo-1574258495973-f010dfbb5371?auto=format&fit=crop&w=600&q=80'],
    finder: 'usr_student_sneha_07',
    finderName: 'Sneha Roy',
    createdAt: '2026-09-28T16:30:00.000Z'
  }
];

export const INITIAL_CLAIMS = [
  {
    _id: 'claim-demo-1',
    id: 'claim-demo-1',
    itemId: 'found-item-1',
    item: INITIAL_FOUND_ITEMS[0],
    itemName: 'Sony WH-1000XM5 Noise Canceling Headphones',
    claimant: DEMO_STUDENT,
    claimer: DEMO_STUDENT._id,
    claimerName: 'Arjun Nair',
    proofDescription: 'Verified with original retail invoice matching serial S/N 89281-W and matched paired Bluetooth device ID.',
    status: 'approved',
    verificationStatus: 'approved',
    adminNotes: 'Proof verified against invoice and security physical inspection. Handover scheduled for Security Desk.',
    createdAt: '2026-09-30T17:00:00.000Z'
  },
  {
    _id: 'claim-demo-2',
    id: 'claim-demo-2',
    itemId: 'found-item-5',
    item: INITIAL_FOUND_ITEMS[4],
    itemName: 'Fossil Slim Leather Card Wallet',
    claimant: DEMO_STUDENT,
    claimer: DEMO_STUDENT._id,
    claimerName: 'Arjun Nair',
    proofDescription: 'Inside compartment contains university cafeteria meal card and Metro pass in my name (Arjun Nair).',
    status: 'under_review',
    verificationStatus: 'pending',
    adminNotes: 'Awaiting student verification at physical security counter.',
    createdAt: '2026-10-01T09:30:00.000Z'
  },
  {
    _id: 'claim-demo-3',
    id: 'claim-demo-3',
    itemId: 'found-item-4',
    item: INITIAL_FOUND_ITEMS[3],
    itemName: 'Apple AirPods Pro 2nd Gen in MagSafe Case',
    claimant: {
      _id: 'usr_student_jordan_04',
      fullName: 'Jordan Taylor',
      email: 'jordan.taylor@campus.edu'
    },
    claimer: 'usr_student_jordan_04',
    claimerName: 'Jordan Taylor',
    proofDescription: 'Can trigger Apple Find My play-sound chime to demonstrate pairing live at security desk.',
    status: 'approved',
    verificationStatus: 'approved',
    adminNotes: 'Live audio chime confirmation completed by security officer.',
    createdAt: '2026-09-29T11:00:00.000Z'
  }
];

export const INITIAL_MATCHES = [
  {
    _id: 'match-demo-1',
    id: 'match-demo-1',
    lostItem: INITIAL_LOST_ITEMS[2],
    foundItem: INITIAL_FOUND_ITEMS[5],
    itemName: 'Campus Student ID Card & Teal Lanyard Match',
    confidenceScore: 96,
    similarityScore: 96,
    matchReason: 'Direct textual name match ("Arjun Nair"), identical student roll number, and cafeteria location tag.',
    status: 'pending',
    viewed: false,
    createdAt: '2026-09-29T15:10:00.000Z'
  },
  {
    _id: 'match-demo-2',
    id: 'match-demo-2',
    lostItem: INITIAL_LOST_ITEMS[1],
    foundItem: INITIAL_FOUND_ITEMS[4],
    itemName: 'Brown Leather Fossil Wallet Match',
    confidenceScore: 89,
    similarityScore: 89,
    matchReason: 'Brand (Fossil), color (Brown), item type (Wallet), and location match (Campus Auditorium Foyer).',
    status: 'pending',
    viewed: false,
    createdAt: '2026-09-27T16:15:00.000Z'
  },
  {
    _id: 'match-demo-3',
    id: 'match-demo-3',
    lostItem: INITIAL_LOST_ITEMS[0],
    foundItem: INITIAL_FOUND_ITEMS[0],
    itemName: 'High-Value Electronics Tech Correlation',
    confidenceScore: 78,
    similarityScore: 78,
    matchReason: 'Spatial proximity (Library / Engineering Quad) and matching time window on September 28–30.',
    status: 'pending',
    viewed: true,
    createdAt: '2026-09-30T18:00:00.000Z'
  }
];

export const INITIAL_RETURNS = [
  {
    _id: 'return-demo-1',
    id: 'return-demo-1',
    claimId: 'claim-demo-1',
    item: INITIAL_FOUND_ITEMS[0],
    itemName: 'Sony WH-1000XM5 Noise Canceling Headphones',
    recipient: DEMO_STUDENT,
    recipientName: 'Arjun Nair',
    custodian: 'Campus Security Administration',
    officerInCharge: 'Officer K. Verma (Badge #SEC-104)',
    status: 'scheduled',
    verificationCode: '7842',
    verificationPin: '7842',
    scheduledDate: '2026-10-02T14:30:00.000Z',
    location: 'Administration & Security Desk (Ground Floor, Room G-04)',
    instructions: 'Present university ID card CS-2024-089 along with 4-digit verification code 7842 to Officer Verma.',
    createdAt: '2026-09-30T18:00:00.000Z'
  },
  {
    _id: 'return-demo-2',
    id: 'return-demo-2',
    claimId: 'claim-demo-3',
    item: INITIAL_FOUND_ITEMS[3],
    itemName: 'Apple AirPods Pro 2nd Gen Case',
    recipient: {
      _id: 'usr_student_jordan_04',
      fullName: 'Jordan Taylor'
    },
    recipientName: 'Jordan Taylor',
    custodian: 'Campus Security Administration',
    officerInCharge: 'Officer R. Sharma (Badge #SEC-089)',
    status: 'completed',
    verificationCode: '3195',
    verificationPin: '3195',
    completedAt: '2026-09-30T16:00:00.000Z',
    location: 'Administration & Security Desk',
    remarks: 'Physical handover complete. Signature confirmed on campus recovery ledger.',
    createdAt: '2026-09-29T12:00:00.000Z'
  }
];

export const INITIAL_NOTIFICATIONS = [
  {
    _id: 'notif-1',
    id: 'notif-1',
    title: 'High-confidence match found! (96%)',
    message: 'Your Student ID Card has a 96% match found at Student Activity Center.',
    time: '10 mins ago',
    type: 'match',
    isRead: false,
    createdAt: new Date(Date.now() - 10 * 60000).toISOString()
  },
  {
    _id: 'notif-2',
    id: 'notif-2',
    title: 'Claim Approved — Handover Ready',
    message: 'Your claim for Sony WH-1000XM5 Headphones was verified. Handover PIN: 7842.',
    time: '2 hours ago',
    type: 'claim',
    isRead: false,
    createdAt: new Date(Date.now() - 120 * 60000).toISOString()
  },
  {
    _id: 'notif-3',
    id: 'notif-3',
    title: 'New Found Item Cataloged',
    message: 'Your reported found item (Blue Hydro Flask) has been placed into secure holding.',
    time: '5 hours ago',
    type: 'item',
    isRead: false,
    createdAt: new Date(Date.now() - 300 * 60000).toISOString()
  },
  {
    _id: 'notif-4',
    id: 'notif-4',
    title: 'Annual Campus Inventory Review',
    message: 'All items unclaimed after 90 days are transferred to university donation in accordance with policy.',
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
  DEMO_ADMIN,
  {
    _id: 'usr_student_alex_02',
    fullName: 'Alex Rivera',
    name: 'Alex Rivera',
    email: 'alex.rivera@campus.edu',
    role: 'student',
    department: 'Computer Science & Engineering',
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
  },
  {
    _id: 'usr_student_priya_06',
    fullName: 'Priya Patel',
    name: 'Priya Patel',
    email: 'priya.patel@campus.edu',
    role: 'student',
    department: 'Information Technology',
    registerNumber: 'REG-2026-IT05',
    phone: '+91 98765 55555',
    accountStatus: 'active',
    emailVerified: true
  },
  {
    _id: 'usr_student_rahul_05',
    fullName: 'Rahul Sharma',
    name: 'Rahul Sharma',
    email: 'rahul.sharma@campus.edu',
    role: 'student',
    department: 'Civil & Infrastructure Engineering',
    registerNumber: 'REG-2026-CE04',
    phone: '+91 98765 44444',
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
