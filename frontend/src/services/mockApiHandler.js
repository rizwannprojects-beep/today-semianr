import {
  DEMO_STUDENT,
  DEMO_ADMIN,
  INITIAL_LOST_ITEMS,
  INITIAL_FOUND_ITEMS,
  INITIAL_CLAIMS,
  INITIAL_MATCHES,
  INITIAL_RETURNS,
  INITIAL_NOTIFICATIONS,
  INITIAL_ANNOUNCEMENTS,
  INITIAL_ADMIN_USERS,
  getStorage,
  setStorage
} from './mockData.js';

export const handleMockRequest = async (config) => {
  const method = (config.method || 'get').toLowerCase();
  const fullUrl = config.url || '';
  // Strip query string and leading slashes
  const [cleanPath, queryString] = fullUrl.split('?');
  const path = cleanPath.replace(/^(\/api\/v1|\/api)/, '').replace(/^\/+/, '');
  const queryParams = new URLSearchParams(queryString || '');

  // Parse body
  let data = {};
  if (config.data) {
    try {
      data = typeof config.data === 'string' ? JSON.parse(config.data) : config.data;
    } catch {
      data = config.data;
    }
  }

  // Current user from local storage
  let currentUser = DEMO_STUDENT;
  try {
    const saved = localStorage.getItem('currentUser');
    if (saved) currentUser = JSON.parse(saved);
  } catch {}

  // 1. AUTH ROUTES
  if (path === 'auth/login' && method === 'post') {
    const email = (data.email || '').toLowerCase().trim();

    if (email === 'admin@campus.edu') {
      return {
        success: true,
        data: {
          user: DEMO_ADMIN,
          accessToken: `demo_admin_jwt_${Date.now()}`
        },
        message: 'Signed in as Campus Administrator'
      };
    }

    if (email === 'arjun.nair@campus.edu' || email.includes('arjun')) {
      return {
        success: true,
        data: {
          user: DEMO_STUDENT,
          accessToken: `demo_student_jwt_${Date.now()}`
        },
        message: 'Signed in as Arjun Nair'
      };
    }

    // Check custom registered users
    const registered = getStorage('registered_users', []);
    const match = registered.find((u) => u.email.toLowerCase() === email);
    if (match) {
      return {
        success: true,
        data: {
          user: match,
          accessToken: `demo_local_jwt_${Date.now()}`
        },
        message: `Signed in as ${match.fullName}`
      };
    }

    // Allow user to demo login with any credentials entered during recording
    const genericUser = {
      _id: `usr_${Date.now()}`,
      fullName: email.split('@')[0] || 'Campus Student',
      name: email.split('@')[0] || 'Campus Student',
      email,
      role: 'student',
      department: 'Computer Applications',
      registerNumber: 'CS-2024-089',
      phone: '+91 98765 00000',
      accountStatus: 'active',
      emailVerified: true
    };
    return {
      success: true,
      data: {
        user: genericUser,
        accessToken: `demo_jwt_${Date.now()}`
      },
      message: 'Signed in successfully'
    };
  }

  if (path === 'auth/register' && method === 'post') {
    const newUser = {
      _id: `usr_${Date.now()}`,
      fullName: data.name || data.fullName || 'New Student',
      name: data.name || data.fullName || 'New Student',
      email: (data.email || '').toLowerCase().trim(),
      role: 'student',
      department: data.department || 'Computer Applications (BCA)',
      registerNumber: data.rollNumber || data.registerNumber || 'REG-2026',
      rollNumber: data.rollNumber || data.registerNumber || 'REG-2026',
      phone: data.phone || '+91 98765 00000',
      year: data.year ? parseInt(data.year, 10) : 3,
      accountStatus: 'active',
      emailVerified: true,
      createdAt: new Date().toISOString()
    };
    const registered = getStorage('registered_users', []);
    registered.push(newUser);
    setStorage('registered_users', registered);

    return {
      success: true,
      data: {
        user: newUser,
        accessToken: `demo_reg_jwt_${Date.now()}`
      },
      message: 'Student account provisioned successfully'
    };
  }

  if (path === 'auth/me' && method === 'get') {
    return {
      success: true,
      data: { user: currentUser }
    };
  }

  if (path === 'auth/logout' && method === 'post') {
    return { success: true, message: 'Logged out successfully' };
  }

  if (path === 'auth/refresh' && method === 'post') {
    return {
      success: true,
      data: { accessToken: `demo_refreshed_jwt_${Date.now()}` }
    };
  }

  // 2. USER PROFILE
  if (path === 'users/profile' && method === 'patch') {
    const updated = { ...currentUser, ...data };
    localStorage.setItem('currentUser', JSON.stringify(updated));
    return {
      success: true,
      data: { user: updated },
      message: 'Student profile updated successfully'
    };
  }

  // 3. LOST ITEMS
  if (path === 'lost-items') {
    const lostItems = getStorage('lost_items', INITIAL_LOST_ITEMS);

    if (method === 'get') {
      let filtered = [...lostItems];
      const search = queryParams.get('search')?.toLowerCase();
      const cat = queryParams.get('category');
      const loc = queryParams.get('location');

      if (search) {
        filtered = filtered.filter(
          (item) =>
            item.itemName?.toLowerCase().includes(search) ||
            item.title?.toLowerCase().includes(search) ||
            item.description?.toLowerCase().includes(search) ||
            item.brand?.toLowerCase().includes(search)
        );
      }
      if (cat && cat !== 'all') {
        filtered = filtered.filter((item) => item.category?.toLowerCase() === cat.toLowerCase());
      }
      if (loc && loc !== 'all') {
        filtered = filtered.filter((item) => item.location?.toLowerCase().includes(loc.toLowerCase()));
      }

      return {
        success: true,
        data: {
          data: filtered,
          items: filtered,
          meta: {
            pagination: {
              page: 1,
              totalPages: 1,
              totalItems: filtered.length
            }
          }
        }
      };
    }

    if (method === 'post') {
      const newItem = {
        _id: `lost-${Date.now()}`,
        id: `lost-${Date.now()}`,
        itemName: data.itemName || data.title || 'Untitled Lost Item',
        title: data.itemName || data.title || 'Untitled Lost Item',
        category: data.category || 'Other',
        description: data.description || '',
        location: data.lostLocation || data.location || 'Campus Ground',
        lostLocation: data.lostLocation || data.location || 'Campus Ground',
        dateLost: data.dateLost || new Date().toISOString(),
        date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
        status: 'ACTIVE',
        color: data.color || 'Not specified',
        brand: data.brand || '',
        serialNumber: data.serialNumber || '',
        primaryImage: data.primaryImage || data.images?.[0] || 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=600&q=80',
        images: data.images?.length ? data.images : ['https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=600&q=80'],
        reporter: currentUser._id,
        reporterName: currentUser.fullName,
        createdAt: new Date().toISOString()
      };
      lostItems.unshift(newItem);
      setStorage('lost_items', lostItems);
      return { success: true, data: newItem, message: 'Lost item reported and published to campus registry' };
    }
  }

  if (path === 'lost-items/my' && method === 'get') {
    const lostItems = getStorage('lost_items', INITIAL_LOST_ITEMS);
    const myItems = lostItems.filter((i) => i.reporter === currentUser._id || i.reporterName === currentUser.fullName || i.reporterName === 'Arjun Nair');
    return { success: true, data: myItems.length ? myItems : lostItems.slice(0, 5) };
  }

  if (path.startsWith('lost-items/')) {
    const id = path.replace('lost-items/', '');
    const lostItems = getStorage('lost_items', INITIAL_LOST_ITEMS);
    const found = lostItems.find((i) => i._id === id || i.id === id) || lostItems[0];
    return { success: true, data: found };
  }

  // 4. FOUND ITEMS
  if (path === 'found-items') {
    const foundItems = getStorage('found_items', INITIAL_FOUND_ITEMS);

    if (method === 'get') {
      let filtered = [...foundItems];
      const search = queryParams.get('search')?.toLowerCase();
      const cat = queryParams.get('category');
      const loc = queryParams.get('location');

      if (search) {
        filtered = filtered.filter(
          (item) =>
            item.itemName?.toLowerCase().includes(search) ||
            item.title?.toLowerCase().includes(search) ||
            item.description?.toLowerCase().includes(search) ||
            item.brand?.toLowerCase().includes(search)
        );
      }
      if (cat && cat !== 'all') {
        filtered = filtered.filter((item) => item.category?.toLowerCase() === cat.toLowerCase());
      }
      if (loc && loc !== 'all') {
        filtered = filtered.filter((item) => item.location?.toLowerCase().includes(loc.toLowerCase()));
      }

      return {
        success: true,
        data: {
          data: filtered,
          items: filtered,
          meta: {
            pagination: {
              page: 1,
              totalPages: 1,
              totalItems: filtered.length
            }
          }
        }
      };
    }

    if (method === 'post') {
      const newItem = {
        _id: `found-${Date.now()}`,
        id: `found-${Date.now()}`,
        itemName: data.itemName || data.title || 'Untitled Found Item',
        title: data.itemName || data.title || 'Untitled Found Item',
        category: data.category || 'Other',
        description: data.description || '',
        location: data.location || 'Campus Ground',
        storageLocation: data.storageLocation || 'Administration & Security Desk (Holding)',
        dateFound: data.dateFound || new Date().toISOString(),
        date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
        status: 'FOUND',
        color: data.color || 'Not specified',
        brand: data.brand || '',
        primaryImage: data.primaryImage || data.images?.[0] || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80',
        images: data.images?.length ? data.images : ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80'],
        finder: currentUser._id,
        finderName: currentUser.fullName,
        createdAt: new Date().toISOString()
      };
      foundItems.unshift(newItem);
      setStorage('found_items', foundItems);
      return { success: true, data: newItem, message: 'Found item recorded and custody logged' };
    }
  }

  if (path === 'found-items/my' && method === 'get') {
    const foundItems = getStorage('found_items', INITIAL_FOUND_ITEMS);
    const myItems = foundItems.filter((i) => i.finder === currentUser._id || i.finderName === currentUser.fullName || i.finderName === 'Arjun Nair');
    return { success: true, data: myItems.length ? myItems : foundItems.slice(0, 4) };
  }

  if (path.startsWith('found-items/')) {
    const id = path.replace('found-items/', '');
    const foundItems = getStorage('found_items', INITIAL_FOUND_ITEMS);
    const found = foundItems.find((i) => i._id === id || i.id === id) || foundItems[0];
    return { success: true, data: found };
  }

  // 5. GENERIC ITEMS QUERY
  if (path === 'items' && method === 'get') {
    const lostItems = getStorage('lost_items', INITIAL_LOST_ITEMS);
    const foundItems = getStorage('found_items', INITIAL_FOUND_ITEMS);
    const combined = [...lostItems, ...foundItems];
    return {
      success: true,
      data: {
        data: combined,
        items: combined,
        meta: { pagination: { totalPages: 1, totalItems: combined.length } }
      }
    };
  }

  if (path.startsWith('items/') && method === 'get') {
    const id = path.replace('items/', '');
    const lostItems = getStorage('lost_items', INITIAL_LOST_ITEMS);
    const foundItems = getStorage('found_items', INITIAL_FOUND_ITEMS);
    const all = [...lostItems, ...foundItems];
    const item = all.find((i) => i._id === id || i.id === id) || all[0];
    return { success: true, data: item };
  }

  // 6. UPLOADS (Returns instantaneous mock photo URL)
  if (path === 'upload' && method === 'post') {
    return {
      success: true,
      data: {
        url: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=600&q=80',
        imageUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=600&q=80'
      },
      message: 'Photo uploaded and securely stored'
    };
  }

  // 7. CLAIMS
  if (path === 'claims' || path === 'claims/my') {
    const claims = getStorage('claims', INITIAL_CLAIMS);

    if (method === 'get') {
      return { success: true, data: claims };
    }

    if (method === 'post') {
      const foundItems = getStorage('found_items', INITIAL_FOUND_ITEMS);
      const targetItem = foundItems.find((i) => i._id === data.itemId || i.id === data.itemId) || foundItems[0];
      const newClaim = {
        _id: `claim-${Date.now()}`,
        id: `claim-${Date.now()}`,
        itemId: targetItem._id,
        item: targetItem,
        itemName: targetItem.itemName || 'Claimed Belonging',
        claimant: currentUser,
        claimer: currentUser._id,
        claimerName: currentUser.fullName,
        proofDescription: data.proofDescription || 'Ownership verification proof provided by student.',
        status: 'pending',
        verificationStatus: 'pending',
        createdAt: new Date().toISOString()
      };
      claims.unshift(newClaim);
      setStorage('claims', claims);
      return { success: true, data: newClaim, message: 'Ownership claim submitted for administrative review' };
    }
  }

  if (path.startsWith('claims/')) {
    const sub = path.replace('claims/', '');
    const claims = getStorage('claims', INITIAL_CLAIMS);

    if (sub.endsWith('/cancel') && method === 'post') {
      const id = sub.replace('/cancel', '');
      const updated = claims.map((c) => (c._id === id || c.id === id ? { ...c, status: 'cancelled' } : c));
      setStorage('claims', updated);
      return { success: true, message: 'Claim cancelled successfully' };
    }

    if (sub.endsWith('/approve') && method === 'post') {
      const id = sub.replace('/approve', '');
      const updated = claims.map((c) => (c._id === id || c.id === id ? { ...c, status: 'approved', verificationStatus: 'approved' } : c));
      setStorage('claims', updated);
      return { success: true, message: 'Claim approved. Handover ticket generated.' };
    }

    if (sub.endsWith('/reject') && method === 'post') {
      const id = sub.replace('/reject', '');
      const updated = claims.map((c) => (c._id === id || c.id === id ? { ...c, status: 'rejected' } : c));
      setStorage('claims', updated);
      return { success: true, message: 'Claim rejected.' };
    }

    if (method === 'get') {
      const claim = claims.find((c) => c._id === sub || c.id === sub) || claims[0];
      return { success: true, data: claim };
    }
  }

  // 8. SMART MATCH ENGINE
  if (path === 'matches' && method === 'get') {
    const matches = getStorage('matches', INITIAL_MATCHES);
    return { success: true, data: matches };
  }

  if (path.startsWith('matches/')) {
    const sub = path.replace('matches/', '');
    const matches = getStorage('matches', INITIAL_MATCHES);

    if (sub.endsWith('/dismiss') && method === 'post') {
      const id = sub.replace('/dismiss', '');
      const updated = matches.map((m) => (m._id === id || m.id === id ? { ...m, status: 'dismissed' } : m));
      setStorage('matches', updated);
      return { success: true, message: 'Match dismissed' };
    }

    if (sub.endsWith('/view') && method === 'post') {
      return { success: true, message: 'Match marked as viewed' };
    }

    const match = matches.find((m) => m._id === sub || m.id === sub) || matches[0];
    return { success: true, data: match };
  }

  // 9. PHYSICAL RETURN HANDOVERS
  if (path === 'returns' && method === 'get') {
    const returns = getStorage('returns', INITIAL_RETURNS);
    return { success: true, data: returns };
  }

  if (path.startsWith('returns/')) {
    const sub = path.replace('returns/', '');
    const returns = getStorage('returns', INITIAL_RETURNS);

    if (sub.endsWith('/confirm-received') && method === 'post') {
      const id = sub.replace('/confirm-received', '');
      const updated = returns.map((r) => (r._id === id || r.id === id ? { ...r, status: 'completed' } : r));
      setStorage('returns', updated);
      return { success: true, message: 'Receipt confirmed by student owner!' };
    }

    if (sub.endsWith('/schedule') && method === 'post') {
      return { success: true, message: 'Handover appointment scheduled.' };
    }

    if (method === 'get') {
      const ret = returns.find((r) => r._id === sub || r.id === sub) || returns[0];
      return { success: true, data: ret };
    }
  }

  // 10. NOTIFICATIONS & PREFERENCES
  if (path === 'notifications/unread-count') {
    return { success: true, data: { unreadCount: 3 } };
  }

  if (path === 'notifications' && method === 'get') {
    const notifs = getStorage('notifications', INITIAL_NOTIFICATIONS);
    return { success: true, data: notifs };
  }

  if (path.startsWith('notifications/') && path.endsWith('/read') && method === 'patch') {
    return { success: true, message: 'Notification marked as read' };
  }

  if (path === 'notifications/read-all' && method === 'patch') {
    return { success: true, message: 'All notifications marked as read' };
  }

  if (path === 'notification-preferences') {
    return {
      success: true,
      data: {
        emailMatchAlerts: true,
        emailClaimUpdates: true,
        emailAnnouncements: true,
        pushNotifications: true
      }
    };
  }

  // 11. ANNOUNCEMENTS
  if (path === 'announcements' || path === 'admin/announcements') {
    return { success: true, data: INITIAL_ANNOUNCEMENTS };
  }

  // 12. ADMIN CONSOLE ROUTES
  if (path === 'admin/dashboard') {
    return {
      success: true,
      data: {
        stats: {
          users: { total: 142, active: 138, suspended: 4, newStudents: 23 },
          items: { total: 84, lost: 52, found: 32, resolved: 39, activeMatches: 14 },
          claims: { total: 29, pending: 6, approved: 19, rejected: 4 },
          returns: { total: 18, scheduled: 3, completed: 15, disputed: 0 }
        },
        recentActivities: [
          {
            _id: 'act-1',
            type: 'claim_approved',
            description: 'Ownership claim for Sony WH-1000XM5 approved for Arjun Nair (CS-2024-089)',
            timestamp: new Date(Date.now() - 15 * 60000).toISOString()
          },
          {
            _id: 'act-2',
            type: 'item_found',
            description: 'New found item registered: Blue Hydro Flask Water Bottle (Science Block)',
            timestamp: new Date(Date.now() - 120 * 60000).toISOString()
          },
          {
            _id: 'act-3',
            type: 'item_lost',
            description: 'New lost report submitted: Apple MacBook Air M2 (Central Library)',
            timestamp: new Date(Date.now() - 360 * 60000).toISOString()
          },
          {
            _id: 'act-4',
            type: 'handover_completed',
            description: 'Physical handover completed for AirPods Pro Case to Jordan Taylor',
            timestamp: new Date(Date.now() - 1440 * 60000).toISOString()
          }
        ]
      }
    };
  }

  if (path === 'admin/users') {
    return {
      success: true,
      data: {
        users: INITIAL_ADMIN_USERS,
        meta: { totalPages: 1, totalUsers: INITIAL_ADMIN_USERS.length }
      }
    };
  }

  if (path.startsWith('admin/users/')) {
    const id = path.replace('admin/users/', '').split('/')[0];
    const user = INITIAL_ADMIN_USERS.find((u) => u._id === id) || INITIAL_ADMIN_USERS[0];
    return { success: true, data: user, message: 'User status updated' };
  }

  if (path === 'admin/items' || path === 'admin/lost-items' || path === 'admin/found-items') {
    const lostItems = getStorage('lost_items', INITIAL_LOST_ITEMS);
    const foundItems = getStorage('found_items', INITIAL_FOUND_ITEMS);
    const all = [...lostItems, ...foundItems];
    return {
      success: true,
      data: {
        items: all,
        meta: { totalPages: 1, totalItems: all.length }
      }
    };
  }

  if (path === 'admin/claims') {
    const claims = getStorage('claims', INITIAL_CLAIMS);
    return {
      success: true,
      data: {
        claims,
        meta: { totalPages: 1, totalClaims: claims.length }
      }
    };
  }

  if (path === 'admin/matches') {
    const matches = getStorage('matches', INITIAL_MATCHES);
    return { success: true, data: matches };
  }

  if (path === 'admin/returns') {
    const returns = getStorage('returns', INITIAL_RETURNS);
    return { success: true, data: returns };
  }

  if (path === 'admin/disputes') {
    return { success: true, data: [] };
  }

  if (path === 'admin/reports') {
    return { success: true, data: [] };
  }

  if (path === 'admin/audit-logs') {
    return {
      success: true,
      data: [
        {
          _id: 'log-1',
          action: 'CLAIM_APPROVE',
          user: 'admin@campus.edu',
          details: 'Approved claim for item: Sony WH-1000XM5 (claim-demo-1)',
          ip: '10.0.4.15',
          timestamp: new Date(Date.now() - 30 * 60000).toISOString()
        },
        {
          _id: 'log-2',
          action: 'ITEM_STATUS_CHANGE',
          user: 'admin@campus.edu',
          details: 'Moved Found Item #found-item-1 to Locker 04',
          ip: '10.0.4.15',
          timestamp: new Date(Date.now() - 90 * 60000).toISOString()
        },
        {
          _id: 'log-3',
          action: 'USER_LOGIN',
          user: 'arjun.nair@campus.edu',
          details: 'Student session authenticated via 2FA token',
          ip: '10.0.12.89',
          timestamp: new Date(Date.now() - 180 * 60000).toISOString()
        }
      ]
    };
  }

  if (path === 'admin/security-events') {
    return {
      success: true,
      data: [
        {
          _id: 'sec-1',
          eventType: 'FAILED_PIN_ATTEMPT',
          severity: 'LOW',
          details: 'Single incorrect PIN entered at Security Kiosk B — resolved.',
          timestamp: new Date(Date.now() - 240 * 60000).toISOString()
        }
      ]
    };
  }

  if (path.startsWith('admin/analytics/')) {
    return {
      success: true,
      data: {
        totalReports: 84,
        recoveryRate: '78.5%',
        averageResolutionHours: 18.2,
        activeMatches: 14,
        categories: [
          { name: 'Electronics', count: 34 },
          { name: 'Wallets & Bags', count: 22 },
          { name: 'ID Cards & Keys', count: 18 },
          { name: 'Accessories', count: 10 }
        ],
        locations: [
          { name: 'Central Library', count: 28 },
          { name: 'Academic Blocks', count: 24 },
          { name: 'Cafeteria / SAC', count: 16 },
          { name: 'Sports Complex', count: 10 },
          { name: 'Auditorium', count: 6 }
        ],
        monthlyTrends: [
          { month: 'May', count: 18 },
          { month: 'Jun', count: 24 },
          { month: 'Jul', count: 32 },
          { month: 'Aug', count: 45 },
          { month: 'Sep', count: 68 }
        ]
      }
    };
  }

  // Default fallback for any unhandled GET/POST
  return {
    success: true,
    data: {},
    message: 'Processed successfully via Presentation Demo Mode'
  };
};
