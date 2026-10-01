export const ITEM_CATEGORIES = [
  'Electronics',
  'Mobile Phone',
  'Laptop',
  'Charger',
  'Wallet',
  'Watch',
  'ID Card',
  'Books',
  'Documents',
  'Keys',
  'Bag',
  'Clothing',
  'Accessories',
  'Other'
];

export const STATUS_COLORS = {
  // Lost item statuses
  ACTIVE: { bg: 'bg-[#FFF3E0]', text: 'text-[#D84315]', border: 'border-[#FFE0B2]' },
  MATCH_FOUND: { bg: 'bg-[#FFF8E1]', text: 'text-[#B78103]', border: 'border-[#FFE082]' },
  CLAIM_IN_PROGRESS: { bg: 'bg-[#E3F2FD]', text: 'text-[#1565C0]', border: 'border-[#BBDEFB]' },
  RESOLVED: { bg: 'bg-[#E0F2F1]', text: 'text-[#00695C]', border: 'border-[#B2DFDB]' },
  CLOSED: { bg: 'bg-[#ECEFF1]', text: 'text-[#455A64]', border: 'border-[#CFD8DC]' },

  // Found item statuses
  FOUND: { bg: 'bg-[#E8F5E9]', text: 'text-[#2E7D32]', border: 'border-[#C8E6C9]' },
  UNDER_VERIFICATION: { bg: 'bg-[#E3F2FD]', text: 'text-[#1565C0]', border: 'border-[#BBDEFB]' },
  CLAIMED: { bg: 'bg-[#E0F2F1]', text: 'text-[#00695C]', border: 'border-[#B2DFDB]' },
  RETURNED: { bg: 'bg-[#E8F5E9]', text: 'text-[#2E7D32]', border: 'border-[#C8E6C9]' },
  EXPIRED: { bg: 'bg-[#FFEBEE]', text: 'text-[#D32F2F]', border: 'border-[#FFCDD2]' },

  // Lowercase compatibility
  active: { bg: 'bg-[#FFF3E0]', text: 'text-[#D84315]', border: 'border-[#FFE0B2]' },
  open: { bg: 'bg-[#E8F5E9]', text: 'text-[#2E7D32]', border: 'border-[#C8E6C9]' },
  matched: { bg: 'bg-[#FFF8E1]', text: 'text-[#B78103]', border: 'border-[#FFE082]' },
  claimPending: { bg: 'bg-[#E3F2FD]', text: 'text-[#1565C0]', border: 'border-[#BBDEFB]' },
  resolved: { bg: 'bg-[#E0F2F1]', text: 'text-[#00695C]', border: 'border-[#B2DFDB]' },
  closed: { bg: 'bg-[#ECEFF1]', text: 'text-[#455A64]', border: 'border-[#CFD8DC]' },
  available: { bg: 'bg-[#E8F5E9]', text: 'text-[#2E7D32]', border: 'border-[#C8E6C9]' },
  returned: { bg: 'bg-[#E8F5E9]', text: 'text-[#2E7D32]', border: 'border-[#C8E6C9]' },

  // Claim & Return statuses
  pending: { bg: 'bg-[#FFF3E0]', text: 'text-[#D84315]', border: 'border-[#FFE0B2]' },
  under_review: { bg: 'bg-[#E3F2FD]', text: 'text-[#1565C0]', border: 'border-[#BBDEFB]' },
  approved: { bg: 'bg-[#E8F5E9]', text: 'text-[#2E7D32]', border: 'border-[#C8E6C9]' },
  rejected: { bg: 'bg-[#FFEBEE]', text: 'text-[#D32F2F]', border: 'border-[#FFCDD2]' },
  completed: { bg: 'bg-[#E8F5E9]', text: 'text-[#2E7D32]', border: 'border-[#C8E6C9]' },
  cancelled: { bg: 'bg-[#ECEFF1]', text: 'text-[#455A64]', border: 'border-[#CFD8DC]' },
  disputed: { bg: 'bg-[#FFEBEE]', text: 'text-[#D32F2F]', border: 'border-[#FFCDD2]' }
};

export const CAMPUS_LOCATIONS = [
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
];

export const LOST_STATUS_OPTIONS = [
  'ACTIVE',
  'MATCH_FOUND',
  'CLAIM_IN_PROGRESS',
  'RESOLVED',
  'CLOSED'
];

export const FOUND_STATUS_OPTIONS = [
  'FOUND',
  'UNDER_VERIFICATION',
  'CLAIMED',
  'RETURNED',
  'CLOSED'
];

