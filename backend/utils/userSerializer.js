/**
 * Safe User Serializer / DTO
 * Strips password hashes, reset tokens, and internal security artifacts
 */
export const serializeUser = (user) => {
  if (!user) return null;

  const raw = typeof user.toObject === 'function' ? user.toObject() : { ...user };

  return {
    id: (raw._id || raw.id)?.toString(),
    fullName: raw.fullName || '',
    email: raw.email || '',
    phone: raw.phone || raw.phoneNumber || '',
    registerNumber: raw.registerNumber || '',
    department: raw.department || '',
    course: raw.course || '',
    year: raw.year || null,
    semester: raw.semester || null,
    className: raw.className || raw.classDivision || '',
    role: raw.role || 'student',
    accountStatus: raw.accountStatus || 'active',
    emailVerified: !!raw.emailVerified,
    profileImage: raw.profileImage || '',
    lastLoginAt: raw.lastLoginAt || raw.lastLogin || null,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt
  };
};

export default serializeUser;
