import http from 'http';

const BASE_URL = 'http://localhost:5001';

const request = (method, path, body = null, headers = {}) => {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      method,
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          const json = data ? JSON.parse(data) : {};
          resolve({ status: res.statusCode, headers: res.headers, body: json, raw: data });
        } catch (e) {
          resolve({ status: res.statusCode, headers: res.headers, body: null, raw: data });
        }
      });
    });

    req.on('error', reject);
    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
};

const runPhase7Tests = async () => {
  console.log('====================================================');
  console.log(' PHASE 7 — ADMIN CONTROL CENTER WORKFLOW TESTS       ');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  const assert = (condition, message, details = '') => {
    if (condition) {
      console.log(`[PASS] ${message} ${details ? `(${details})` : ''}`);
      passed++;
    } else {
      console.error(`[FAIL] ${message} ${details ? `(${details})` : ''}`);
      failed++;
    }
  };

  try {
    // 1. Check API Health
    const health = await request('GET', '/api/health');
    assert(health.status === 200, 'API health check responds with 200 OK');

    // 2. Setup Student & Admin Accounts
    const timestamp = Date.now().toString().slice(-6);
    const studentEmail = `student.${timestamp}@campus.edu`;
    const adminEmail = `admin.${timestamp}@campus.edu`;

    const studentReg = await request('POST', '/api/auth/register', {
      fullName: 'Alice Student',
      email: studentEmail,
      password: 'SecurePassword123!',
      confirmPassword: 'SecurePassword123!',
      registerNumber: `REG-ALICE-${timestamp}`,
      department: 'Computer Science',
      year: 3
    });
    assert(studentReg.status === 201, 'Student registered successfully', studentReg.body?.message);
    const studentToken = studentReg.body.data?.accessToken;
    const studentUser = studentReg.body.data?.user;

    const adminReg = await request('POST', '/api/auth/register', {
      fullName: 'Campus Security Chief',
      email: adminEmail,
      password: 'AdminPassword123!',
      confirmPassword: 'AdminPassword123!',
      role: 'admin',
      department: 'Campus Security'
    });
    assert(adminReg.status === 201, 'Admin registered successfully', adminReg.body?.message);
    const adminToken = adminReg.body.data?.accessToken;
    const adminUser = adminReg.body.data?.user;

    // 3. Authorization Tests
    // 3.1 Unauthenticated access to /admin/dashboard
    const unauthDash = await request('GET', '/api/admin/dashboard');
    assert(unauthDash.status === 401, 'Unauthenticated access to /api/admin/dashboard blocked (401)');

    // 3.2 Student access to /admin/dashboard
    const studentDash = await request('GET', '/api/admin/dashboard', null, {
      Authorization: `Bearer ${studentToken}`
    });
    assert(studentDash.status === 403, 'Student access to /api/admin/dashboard blocked (403 Forbidden)');

    // 3.3 Admin access to /admin/dashboard
    const adminDash = await request('GET', '/api/admin/dashboard', null, {
      Authorization: `Bearer ${adminToken}`
    });
    assert(adminDash.status === 200 && adminDash.body.success, 'Admin access to /api/admin/dashboard succeeds with 200 OK');
    assert(adminDash.body.data?.stats?.users !== undefined, 'Dashboard stats include real Users metrics');
    assert(adminDash.body.data?.stats?.items !== undefined, 'Dashboard stats include real Items metrics');
    assert(adminDash.body.data?.stats?.claims !== undefined, 'Dashboard stats include real Claims metrics');
    assert(adminDash.body.data?.stats?.returns !== undefined, 'Dashboard stats include real Returns metrics');

    // 4. User Management Tests
    // 4.1 Search and filter users
    const usersList = await request('GET', '/api/admin/users?search=Alice', null, {
      Authorization: `Bearer ${adminToken}`
    });
    assert(usersList.status === 200 && usersList.body.data?.users?.length >= 1, 'Admin can search users by query');

    // 4.2 Get single user details
    const studentId = studentUser._id || studentUser.id;
    const userDetail = await request('GET', `/api/admin/users/${studentId}`, null, {
      Authorization: `Bearer ${adminToken}`
    });
    assert(userDetail.status === 200, 'Admin can fetch detailed user profile');
    assert(userDetail.body.data?.user?.passwordHash === undefined, 'User details response protects privacy (no passwordHash)');

    // 4.3 Self-suspension blocked
    const selfSuspend = await request('PATCH', `/api/admin/users/${adminUser._id || adminUser.id}/suspend`, {
      reason: 'Testing self-suspension'
    }, {
      Authorization: `Bearer ${adminToken}`
    });
    assert(selfSuspend.status === 400, 'Admin is prevented from suspending their own account');

    // 4.4 Suspend student account
    const suspendRes = await request('PATCH', `/api/admin/users/${studentId}/suspend`, {
      reason: 'Policy violation during campus test'
    }, {
      Authorization: `Bearer ${adminToken}`
    });
    assert(suspendRes.status === 200 && suspendRes.body.data?.user?.accountStatus === 'suspended', 'Student account suspended with reason');

    // 4.5 Verify suspended student is blocked from actions
    const suspendedAction = await request('POST', '/api/lost-items', {
      itemName: 'Lost Keys while Suspended',
      description: 'Keychain with car keys',
      category: 'Keys',
      location: 'Main Gate',
      dateLost: new Date().toISOString()
    }, {
      Authorization: `Bearer ${studentToken}`
    });
    assert(suspendedAction.status === 403, 'Suspended student is blocked from creating items (403)');

    // 4.6 Reactivate student account
    const reactivateRes = await request('PATCH', `/api/admin/users/${studentId}/reactivate`, {
      reason: 'Account reviewed and restored'
    }, {
      Authorization: `Bearer ${adminToken}`
    });
    assert(reactivateRes.status === 200 && reactivateRes.body.data?.user?.accountStatus === 'active', 'Student account reactivated successfully');

    // 5. Item Moderation Tests
    // 5.1 Create item as student
    const itemRes = await request('POST', '/api/lost-items', {
      itemName: 'HP Pavilion Laptop Blue',
      description: 'Left in library study cubicle 4B',
      category: 'Electronics',
      location: 'Central Library',
      dateLost: new Date().toISOString()
    }, {
      Authorization: `Bearer ${studentToken}`
    });
    assert(itemRes.status === 201, 'Student can create item report after reactivation');
    const itemId = itemRes.body.data?._id || itemRes.body.data?.id;

    // 5.2 Admin list lost items
    const lostList = await request('GET', '/api/admin/lost-items', null, {
      Authorization: `Bearer ${adminToken}`
    });
    assert(lostList.status === 200 && Array.isArray(lostList.body.data?.items), 'Admin can list lost items');

    // 5.3 Admin moderate item (hide / restore)
    const hideRes = await request('PATCH', `/api/admin/items/${itemId}/moderate`, {
      action: 'hide',
      notes: 'Contains potential duplicate info'
    }, {
      Authorization: `Bearer ${adminToken}`
    });
    assert(hideRes.status === 200 && hideRes.body.data?.item?.status === 'FLAGGED', 'Admin can moderate item to FLAGGED/hidden');

    const restoreRes = await request('PATCH', `/api/admin/items/${itemId}/moderate`, {
      action: 'restore',
      notes: 'Cleared upon review'
    }, {
      Authorization: `Bearer ${adminToken}`
    });
    assert(restoreRes.status === 200 && restoreRes.body.data?.item?.status === 'ACTIVE', 'Admin can restore moderated item to ACTIVE');

    // 6. Claim Management Tests
    // 6.1 Create a found item
    const foundRes = await request('POST', '/api/found-items', {
      itemName: 'Found HP Pavilion Laptop Blue',
      description: 'Found on table in library',
      category: 'Electronics',
      location: 'Central Library',
      dateFound: new Date().toISOString()
    }, {
      Authorization: `Bearer ${adminToken}`
    });
    const foundId = foundRes.body.data?._id || foundRes.body.data?.id;

    // 6.2 Submit claim as student
    const claimRes = await request('POST', '/api/claims', {
      itemId: foundId,
      reason: 'This is my HP laptop',
      ownershipProof: 'Serial number SN883921 and stickers on lid'
    }, {
      Authorization: `Bearer ${studentToken}`
    });
    assert(claimRes.status === 201, 'Student submits ownership claim');
    const claimId = claimRes.body.data?._id || claimRes.body.data?.id;

    // 6.3 Admin get single claim for side-by-side review
    const claimDetail = await request('GET', `/api/admin/claims/${claimId}`, null, {
      Authorization: `Bearer ${adminToken}`
    });
    assert(claimDetail.status === 200 && claimDetail.body.data?.claim !== undefined, 'Admin can view claim review details');

    // 6.4 Request more information
    const reqInfo = await request('POST', `/api/admin/claims/${claimId}/request-information`, {
      message: 'Please provide proof of purchase or laptop warranty card.'
    }, {
      Authorization: `Bearer ${adminToken}`
    });
    assert(
      reqInfo.status === 200 &&
      (reqInfo.body.data?.claim?.status?.toLowerCase() === 'underreview' ||
       reqInfo.body.data?.claim?.status === 'MORE_INFO_REQUESTED'),
      'Admin can request more info from claimant'
    );

    // 6.5 Approve claim
    const approveClaimRes = await request('POST', `/api/admin/claims/${claimId}/approve`, {
      notes: 'Verified sticker and login lockscreen'
    }, {
      Authorization: `Bearer ${adminToken}`
    });
    assert(approveClaimRes.status === 200 && approveClaimRes.body.data?.claim?.status === 'approved', 'Admin can approve verified claim');

    // 7. Returns & Disputes Tests
    const returnsList = await request('GET', '/api/admin/returns', null, {
      Authorization: `Bearer ${adminToken}`
    });
    assert(returnsList.status === 200 && Array.isArray(returnsList.body.data?.returns), 'Admin can list returns');

    const disputesList = await request('GET', '/api/admin/disputes', null, {
      Authorization: `Bearer ${adminToken}`
    });
    assert(disputesList.status === 200 && Array.isArray(disputesList.body.data?.disputes), 'Admin can list disputes');

    // 8. Moderation Flags Tests
    const flagRes = await request('POST', '/api/reports', {
      targetType: 'Item',
      targetId: itemId,
      reason: 'Inappropriate content',
      description: 'Reported for review'
    }, {
      Authorization: `Bearer ${studentToken}`
    });
    assert(flagRes.status === 201, 'Student can submit moderation report / flag');
    const reportId = flagRes.body.data?._id || flagRes.body.data?.id;

    const modReports = await request('GET', '/api/admin/reports', null, {
      Authorization: `Bearer ${adminToken}`
    });
    assert(modReports.status === 200 && modReports.body.data?.reports?.length >= 1, 'Admin can list moderation flag reports');

    const resolveReport = await request('PATCH', `/api/admin/reports/${reportId}/resolve`, {
      status: 'RESOLVED',
      resolutionNotes: 'Flag inspected and cleared'
    }, {
      Authorization: `Bearer ${adminToken}`
    });
    assert(resolveReport.status === 200 && resolveReport.body.data?.report?.status === 'RESOLVED', 'Admin can resolve moderation report');

    // 9. Campus Announcements Tests
    const createAnn = await request('POST', '/api/admin/announcements', {
      title: 'Main Security Desk Hours Change',
      message: 'Office will close early at 3 PM this Friday for campus maintenance.',
      priority: 'HIGH',
      targetAudience: 'ALL'
    }, {
      Authorization: `Bearer ${adminToken}`
    });
    assert(createAnn.status === 201, 'Admin can create campus announcement');
    const annId = createAnn.body.data?._id || createAnn.body.data?.id;

    const getAnn = await request('GET', '/api/announcements');
    assert(getAnn.status === 200 && getAnn.body.data?.announcements?.length >= 1, 'Students and public can view active announcements');

    const delAnn = await request('DELETE', `/api/admin/announcements/${annId}`, null, {
      Authorization: `Bearer ${adminToken}`
    });
    assert(delAnn.status === 200, 'Admin can delete / archive announcement');

    // 10. Audit Logs & Security Events
    const auditRes = await request('GET', '/api/admin/audit-logs', null, {
      Authorization: `Bearer ${adminToken}`
    });
    assert(auditRes.status === 200 && Array.isArray(auditRes.body.data?.logs), 'Admin can view read-only audit log stream');

    const secRes = await request('GET', '/api/admin/security-events', null, {
      Authorization: `Bearer ${adminToken}`
    });
    assert(secRes.status === 200 && Array.isArray(secRes.body.data?.events), 'Admin can view security events dashboard');

    // 11. CSV Export Tests
    const exportItems = await request('GET', '/api/admin/export/items', null, {
      Authorization: `Bearer ${adminToken}`
    });
    assert(exportItems.status === 200 && exportItems.headers['content-type']?.includes('text/csv'), 'Admin can export items to CSV');

    const exportClaims = await request('GET', '/api/admin/export/claims', null, {
      Authorization: `Bearer ${adminToken}`
    });
    assert(exportClaims.status === 200 && exportClaims.headers['content-type']?.includes('text/csv'), 'Admin can export claims to CSV');

    const exportReturns = await request('GET', '/api/admin/export/returns', null, {
      Authorization: `Bearer ${adminToken}`
    });
    assert(exportReturns.status === 200 && exportReturns.headers['content-type']?.includes('text/csv'), 'Admin can export returns to CSV');

  } catch (err) {
    console.error('[TEST SUITE ERROR]', err);
    failed++;
  }

  console.log('\n====================================================');
  console.log(` PHASE 7 TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================');

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
};

runPhase7Tests();
