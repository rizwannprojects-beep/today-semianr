/**
 * Automated Test Suite for Campus Lost & Found Backend API (Phase 2)
 */

const BASE_URL = 'http://localhost:5001/api';

const results = [];

const logResult = (testName, passed, details = '') => {
  results.push({ testName, passed, details });
  const symbol = passed ? '✓ [PASS]' : '✗ [FAIL]';
  console.log(`${symbol} ${testName} ${details ? `(${details})` : ''}`);
};

const ensureServerReady = async () => {
  for (let i = 0; i < 3; i++) {
    try {
      const res = await fetch(`${BASE_URL}/health`);
      if (res.status === 200) return;
    } catch (e) {}
    await new Promise((r) => setTimeout(r, 200));
  }
  try {
    await import('./server.js');
    for (let i = 0; i < 30; i++) {
      try {
        const res = await fetch(`${BASE_URL}/health`);
        if (res.status === 200) return;
      } catch (e) {}
      await new Promise((r) => setTimeout(r, 300));
    }
  } catch (err) {
    console.error('Failed to auto-start server for tests:', err);
  }
};

const runTests = async () => {
  await ensureServerReady();
  console.log('====================================================');
  console.log(' Starting Campus Lost & Found Phase 2 API Test Suite ');
  console.log('====================================================\n');

  // Test 1: Health check endpoint
  try {
    const res = await fetch(`${BASE_URL}/health`);
    const json = await res.json();
    const passed = res.status === 200 && json.success === true && json.message === 'Campus Lost & Found API is running';
    logResult('GET /api/health response format', passed, `Status: ${res.status}, DB: ${json.database}`);
  } catch (err) {
    logResult('GET /api/health response format', false, err.message);
  }

  // Test 2: Input validation on Register (invalid email and short password)
  try {
    const res = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: 'A',
        email: 'invalid-email-format',
        password: '123'
      })
    });
    const json = await res.json();
    const passed = res.status === 400 && json.success === false && Array.isArray(json.errors) && json.errors.length > 0;
    logResult('POST /api/auth/register rejection of invalid input', passed, `Status: ${res.status}, Errors: ${json.errors?.length}`);
  } catch (err) {
    logResult('POST /api/auth/register rejection of invalid input', false, err.message);
  }

  // Test 3: Input validation on Login (missing password)
  try {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'student@campus.edu' })
    });
    const json = await res.json();
    const passed = res.status === 400 && json.success === false;
    logResult('POST /api/auth/login validation of required fields', passed, `Status: ${res.status}`);
  } catch (err) {
    logResult('POST /api/auth/login validation of required fields', false, err.message);
  }

  // Test 4: Protected route authentication guard (no token)
  try {
    const res = await fetch(`${BASE_URL}/auth/me`);
    const json = await res.json();
    const passed = res.status === 401 && json.success === false;
    logResult('GET /api/auth/me rejects unauthenticated request', passed, `Status: ${res.status}, Message: "${json.message}"`);
  } catch (err) {
    logResult('GET /api/auth/me rejects unauthenticated request', false, err.message);
  }

  // Test 5: Protected route with malformed token
  try {
    const res = await fetch(`${BASE_URL}/auth/me`, {
      headers: { Authorization: 'Bearer this.is.not.a.valid.jwt.token' }
    });
    const json = await res.json();
    const passed = res.status === 401 && json.success === false;
    logResult('GET /api/auth/me rejects invalid JWT token', passed, `Status: ${res.status}`);
  } catch (err) {
    logResult('GET /api/auth/me rejects invalid JWT token', false, err.message);
  }

  // Test 6: Users protected route
  try {
    const res = await fetch(`${BASE_URL}/users/me`);
    const json = await res.json();
    const passed = res.status === 401 && json.success === false;
    logResult('GET /api/users/me authentication guard', passed, `Status: ${res.status}`);
  } catch (err) {
    logResult('GET /api/users/me authentication guard', false, err.message);
  }

  // Test 7: Claims protected route
  try {
    const res = await fetch(`${BASE_URL}/claims/my`);
    const json = await res.json();
    const passed = res.status === 401 && json.success === false;
    logResult('GET /api/claims/my authentication guard', passed, `Status: ${res.status}`);
  } catch (err) {
    logResult('GET /api/claims/my authentication guard', false, err.message);
  }

  // Test 8: Matches protected route
  try {
    const res = await fetch(`${BASE_URL}/matches/my`);
    const json = await res.json();
    const passed = res.status === 401 && json.success === false;
    logResult('GET /api/matches/my authentication guard', passed, `Status: ${res.status}`);
  } catch (err) {
    logResult('GET /api/matches/my authentication guard', false, err.message);
  }

  // Test 9: Notifications protected route
  try {
    const res = await fetch(`${BASE_URL}/notifications`);
    const json = await res.json();
    const passed = res.status === 401 && json.success === false;
    logResult('GET /api/notifications authentication guard', passed, `Status: ${res.status}`);
  } catch (err) {
    logResult('GET /api/notifications authentication guard', false, err.message);
  }

  // Test 10: Admin dashboard strict role protection (no token)
  try {
    const res = await fetch(`${BASE_URL}/admin/dashboard`);
    const json = await res.json();
    const passed = res.status === 401 && json.success === false;
    logResult('GET /api/admin/dashboard blocks unauthenticated requests', passed, `Status: ${res.status}`);
  } catch (err) {
    logResult('GET /api/admin/dashboard blocks unauthenticated requests', false, err.message);
  }

  // Test 11: Invalid MongoDB ObjectId parameter validation
  try {
    const res = await fetch(`${BASE_URL}/items/not-a-valid-object-id`);
    const json = await res.json();
    const passed = res.status === 400 && json.success === false;
    logResult('GET /api/items/:id validates ObjectId format', passed, `Status: ${res.status}, Message: "${json.message}"`);
  } catch (err) {
    logResult('GET /api/items/:id validates ObjectId format', false, err.message);
  }

  // Test 12: Unknown route 404 handler
  try {
    const res = await fetch(`${BASE_URL}/completely-unknown-route`);
    const json = await res.json();
    const passed = res.status === 404 && json.success === false;
    logResult('Undefined route returns clean 404 JSON', passed, `Status: ${res.status}`);
  } catch (err) {
    logResult('Undefined route returns clean 404 JSON', false, err.message);
  }

  // Test 13: Refresh token missing check
  try {
    const res = await fetch(`${BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    });
    const json = await res.json();
    const passed = res.status === 401 && json.success === false;
    logResult('POST /api/auth/refresh rejects missing refresh token', passed, `Status: ${res.status}`);
  } catch (err) {
    logResult('POST /api/auth/refresh rejects missing refresh token', false, err.message);
  }

  // Test 14: Forgot-password endpoint validation (invalid email)
  try {
    const res = await fetch(`${BASE_URL}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'not-an-email' })
    });
    const json = await res.json();
    const passed = res.status === 400 && json.success === false;
    logResult('POST /api/auth/forgot-password rejects invalid email', passed, `Status: ${res.status}`);
  } catch (err) {
    logResult('POST /api/auth/forgot-password rejects invalid email', false, err.message);
  }

  // Test 15: Forgot-password endpoint valid format (privacy-preserving 200)
  try {
    const res = await fetch(`${BASE_URL}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'teststudent@campus.edu' })
    });
    const json = await res.json();
    const passed = res.status === 200 && json.success === true && typeof json.message === 'string';
    logResult('POST /api/auth/forgot-password privacy-safe response', passed, `Status: ${res.status}`);
  } catch (err) {
    logResult('POST /api/auth/forgot-password privacy-safe response', false, err.message);
  }

  // Test 16: Reset-password endpoint rejects weak password
  try {
    const res = await fetch(`${BASE_URL}/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token: 'd'.repeat(64),
        password: 'weak',
        confirmPassword: 'weak'
      })
    });
    const json = await res.json();
    const passed = res.status === 400 && json.success === false;
    logResult('POST /api/auth/reset-password rejects weak password', passed, `Status: ${res.status}`);
  } catch (err) {
    logResult('POST /api/auth/reset-password rejects weak password', false, err.message);
  }

  // Test 17: Reset-password endpoint rejects mismatched passwords
  try {
    const res = await fetch(`${BASE_URL}/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token: 'd'.repeat(64),
        password: 'SecurePass123!@#',
        confirmPassword: 'DifferentPassword456!@#'
      })
    });
    const json = await res.json();
    const passed = res.status === 400 && json.success === false;
    logResult('POST /api/auth/reset-password rejects password mismatch', passed, `Status: ${res.status}`);
  } catch (err) {
    logResult('POST /api/auth/reset-password rejects password mismatch', false, err.message);
  }

  // Test 18: Logout endpoint works cleanly
  try {
    const res = await fetch(`${BASE_URL}/auth/logout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    const json = await res.json();
    const passed = res.status === 200 && json.success === true;
    logResult('POST /api/auth/logout succeeds cleanly', passed, `Status: ${res.status}`);
  } catch (err) {
    logResult('POST /api/auth/logout succeeds cleanly', false, err.message);
  }

  // Test 19: GET /api/lost-items responds with items list and pagination
  try {
    const res = await fetch(`${BASE_URL}/lost-items`);
    const json = await res.json();
    const passed = res.status === 200 && json.success === true && Array.isArray(json.data);
    logResult('GET /api/lost-items retrieves lost items feed', passed, `Status: ${res.status}, Count: ${json.data?.length}`);
  } catch (err) {
    logResult('GET /api/lost-items retrieves lost items feed', false, err.message);
  }

  // Test 20: GET /api/found-items responds with items list and pagination
  try {
    const res = await fetch(`${BASE_URL}/found-items`);
    const json = await res.json();
    const passed = res.status === 200 && json.success === true && Array.isArray(json.data);
    logResult('GET /api/found-items retrieves found items feed', passed, `Status: ${res.status}, Count: ${json.data?.length}`);
  } catch (err) {
    logResult('GET /api/found-items retrieves found items feed', false, err.message);
  }

  // Test 21: GET /api/lost-items/my rejects unauthenticated request
  try {
    const res = await fetch(`${BASE_URL}/lost-items/my`);
    const json = await res.json();
    const passed = res.status === 401 && json.success === false;
    logResult('GET /api/lost-items/my authentication guard', passed, `Status: ${res.status}`);
  } catch (err) {
    logResult('GET /api/lost-items/my authentication guard', false, err.message);
  }

  // Test 22: GET /api/found-items/my rejects unauthenticated request
  try {
    const res = await fetch(`${BASE_URL}/found-items/my`);
    const json = await res.json();
    const passed = res.status === 401 && json.success === false;
    logResult('GET /api/found-items/my authentication guard', passed, `Status: ${res.status}`);
  } catch (err) {
    logResult('GET /api/found-items/my authentication guard', false, err.message);
  }

  // Test 23: POST /api/upload rejects unauthenticated upload request
  try {
    const res = await fetch(`${BASE_URL}/upload`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    });
    const json = await res.json();
    const passed = res.status === 401 && json.success === false;
    logResult('POST /api/upload authentication guard', passed, `Status: ${res.status}`);
  } catch (err) {
    logResult('POST /api/upload authentication guard', false, err.message);
  }

  // Test 24: GET /api/items supports multi-term smart search query parameter
  try {
    const res = await fetch(`${BASE_URL}/items?search=black+samsung+phone&type=lost`);
    const json = await res.json();
    const passed = res.status === 200 && json.success === true && Array.isArray(json.data);
    logResult('GET /api/items smart multi-term search query', passed, `Status: ${res.status}`);
  } catch (err) {
    logResult('GET /api/items smart multi-term search query', false, err.message);
  }

  // Test 25: POST /api/lost-items rejects unauthenticated reporting
  try {
    const res = await fetch(`${BASE_URL}/lost-items`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        itemName: 'Lost iPhone',
        category: 'Mobile Phone',
        description: 'Black iPhone left in lab',
        location: 'Central Library',
        dateLost: '2026-03-01'
      })
    });
    const json = await res.json();
    const passed = res.status === 401 && json.success === false;
    logResult('POST /api/lost-items authentication guard', passed, `Status: ${res.status}`);
  } catch (err) {
    logResult('POST /api/lost-items authentication guard', false, err.message);
  }

  // Test 26: POST /api/found-items rejects unauthenticated reporting
  try {
    const res = await fetch(`${BASE_URL}/found-items`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        itemName: 'Found Calculator',
        category: 'Electronics',
        description: 'Casio fx-991EX calculator found on bench',
        location: 'Main Academic Block',
        dateFound: '2026-03-01'
      })
    });
    const json = await res.json();
    const passed = res.status === 401 && json.success === false;
    logResult('POST /api/found-items authentication guard', passed, `Status: ${res.status}`);
  } catch (err) {
    logResult('POST /api/found-items authentication guard', false, err.message);
  }

  // Test 27: GET /api/lost-items supports category & status filters
  try {
    const res = await fetch(`${BASE_URL}/lost-items?category=Electronics&status=ACTIVE&limit=5`);
    const json = await res.json();
    const passed = res.status === 200 && json.success === true && Array.isArray(json.data);
    logResult('GET /api/lost-items with category & status filters', passed, `Status: ${res.status}`);
  } catch (err) {
    logResult('GET /api/lost-items with category & status filters', false, err.message);
  }

  // Test 28: GET /api/found-items supports location filter and pagination metadata
  try {
    const res = await fetch(`${BASE_URL}/found-items?location=Library&page=1&limit=6`);
    const json = await res.json();
    const passed = res.status === 200 && json.success === true && json.meta?.pagination?.limit === 6;
    logResult('GET /api/found-items location filter & pagination metadata', passed, `Status: ${res.status}`);
  } catch (err) {
    logResult('GET /api/found-items location filter & pagination metadata', false, err.message);
  }

  // Test 29: GET /api/items sorting options
  try {
    const res = await fetch(`${BASE_URL}/items?sort=recently_updated&limit=4`);
    const json = await res.json();
    const passed = res.status === 200 && json.success === true;
    logResult('GET /api/items sorting parameter (recently_updated)', passed, `Status: ${res.status}`);
  } catch (err) {
    logResult('GET /api/items sorting parameter (recently_updated)', false, err.message);
  }

  // Test 30: PUT /api/lost-items/:id rejects unauthenticated report modification
  try {
    const res = await fetch(`${BASE_URL}/lost-items/507f1f77bcf86cd799439011`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ itemName: 'Hacked Title' })
    });
    const json = await res.json();
    const passed = res.status === 401 && json.success === false;
    logResult('PUT /api/lost-items/:id authentication guard', passed, `Status: ${res.status}`);
  } catch (err) {
    logResult('PUT /api/lost-items/:id authentication guard', false, err.message);
  }

  // Test 31: DELETE /api/found-items/:id rejects unauthenticated deletion
  try {
    const res = await fetch(`${BASE_URL}/found-items/507f1f77bcf86cd799439011`, {
      method: 'DELETE'
    });
    const json = await res.json();
    const passed = res.status === 401 && json.success === false;
    logResult('DELETE /api/found-items/:id authentication guard', passed, `Status: ${res.status}`);
  } catch (err) {
    logResult('DELETE /api/found-items/:id authentication guard', false, err.message);
  }

  // Test 32: Valid ObjectId format check on non-existent item returns 404
  try {
    const res = await fetch(`${BASE_URL}/items/507f1f77bcf86cd799439011`);
    const json = await res.json();
    const passed = res.status === 404 && json.success === false;
    logResult('GET /api/items/:id returns 404 for non-existent valid ObjectId', passed, `Status: ${res.status}`);
  } catch (err) {
    logResult('GET /api/items/:id returns 404 for non-existent valid ObjectId', false, err.message);
  }

  // Test 33: POST /api/contact validation of required fields
  try {
    const res = await fetch(`${BASE_URL}/contact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: '' })
    });
    const json = await res.json();
    const passed = res.status === 400 && json.success === false;
    logResult('POST /api/contact validation of required fields', passed, `Status: ${res.status}`);
  } catch (err) {
    logResult('POST /api/contact validation of required fields', false, err.message);
  }

  // Test 34: GET /api/announcements public list
  try {
    const res = await fetch(`${BASE_URL}/announcements`);
    const json = await res.json();
    const passed = res.status === 200 && json.success === true;
    logResult('GET /api/announcements public endpoint access', passed, `Status: ${res.status}`);
  } catch (err) {
    logResult('GET /api/announcements public endpoint access', false, err.message);
  }

  // Test 35: GET /api/admin/analytics/overview authentication guard
  try {
    const res = await fetch(`${BASE_URL}/admin/analytics/overview`);
    const json = await res.json();
    const passed = res.status === 401 && json.success === false;
    logResult('GET /api/admin/analytics/overview authentication guard', passed, `Status: ${res.status}`);
  } catch (err) {
    logResult('GET /api/admin/analytics/overview authentication guard', false, err.message);
  }

  // Summary
  const passedCount = results.filter((r) => r.passed).length;
  const totalCount = results.length;
  console.log('\n====================================================');
  console.log(` Test Suite Results: ${passedCount} / ${totalCount} PASSED`);
  console.log('====================================================');

  if (passedCount === totalCount) {
    console.log('\nAll API security, validation, reporting, and routing tests passed successfully!');
    process.exit(0);
  } else {
    console.error(`\n${totalCount - passedCount} test(s) failed.`);
    process.exit(1);
  }
};

runTests();
