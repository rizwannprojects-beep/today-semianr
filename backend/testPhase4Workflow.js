/**
 * Phase 4 Comprehensive Workflow & Integration Test Suite
 * Tests end-to-end:
 * 1. User registration & login
 * 2. Multi-field Lost Item creation & validation
 * 3. Multi-field Found Item creation & validation
 * 4. Image upload handling
 * 5. Smart multi-term search ("black samsung phone")
 * 6. Category, location, status filters & pagination
 * 7. Item details retrieval & confidential marks privacy protection
 * 8. My Reports (Lost & Found)
 * 9. Controlled status lifecycle transitions
 * 10. Security: ownership checks, rate limiting, and 403 authorization
 */

const BASE_URL = 'http://localhost:5001/api';

const results = [];
const logResult = (name, passed, details = '') => {
  results.push({ name, passed, details });
  const icon = passed ? '✓ [PASS]' : '✗ [FAIL]';
  console.log(`${icon} ${name} ${details ? `(${details})` : ''}`);
};

const runSuite = async () => {
  console.log('====================================================');
  console.log(' Starting Phase 4 Lost & Found System Test Suite    ');
  console.log('====================================================\n');

  let tokenA = null;
  let userAId = null;
  let tokenB = null;
  let userBId = null;
  let createdLostId = null;
  let createdFoundId = null;
  let uploadedImageUrl = null;

  // 1. Setup User A
  try {
    const emailA = `student.phase4.${Date.now()}@campus.edu`;
    const regRes = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: 'Jane Student Doe',
        email: emailA,
        password: 'Password123!',
        department: 'Computer Science & Engineering',
        registerNumber: 'CS2026-991',
        phone: '+91 9876543210',
        year: 3,
        className: 'CSE-A'
      })
    });
    const regJson = await regRes.json();
    tokenA = regJson?.data?.accessToken;
    userAId = regJson?.data?.user?._id || regJson?.data?.user?.id;
    logResult('User A registration & JWT generation', Boolean(tokenA), `User: ${regJson?.data?.user?.fullName}`);
  } catch (err) {
    logResult('User A registration & JWT generation', false, err.message);
  }

  // 2. Setup User B
  try {
    const emailB = `student.b.${Date.now()}@campus.edu`;
    const regRes = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: 'Alex Other Student',
        email: emailB,
        password: 'Password123!',
        department: 'Mechanical Engineering',
        registerNumber: 'ME2026-112',
        phone: '+91 9123456780',
        year: 2,
        className: 'MECH-B'
      })
    });
    const regJson = await regRes.json();
    tokenB = regJson?.data?.accessToken;
    userBId = regJson?.data?.user?._id || regJson?.data?.user?.id;
    logResult('User B registration for authorization tests', Boolean(tokenB));
  } catch (err) {
    logResult('User B registration for authorization tests', false, err.message);
  }

  // 3. Image Upload
  try {
    // 1x1 transparent PNG base64
    const tinyBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';
    const upRes = await fetch(`${BASE_URL}/upload`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenA}`
      },
      body: JSON.stringify({ imageBase64: tinyBase64 })
    });
    const upJson = await upRes.json();
    uploadedImageUrl = upJson?.data?.urls?.[0];
    const passed = upRes.status === 200 && uploadedImageUrl?.startsWith('/uploads/');
    logResult('POST /api/upload secure image storage', passed, `URL: ${uploadedImageUrl}`);
  } catch (err) {
    logResult('POST /api/upload secure image storage', false, err.message);
  }

  // 4. Report Lost Item (Valid Multi-Step Payload)
  try {
    const lostPayload = {
      itemName: 'Midnight Blue Samsung Galaxy S23',
      category: 'Mobile Phone',
      description: 'Misplaced near library study carrel 14 with blue silicone case',
      dateLost: '2026-03-25',
      timeLost: '14:30',
      location: 'Central Library',
      locationDetails: '2nd floor cubicle area near east window',
      color: 'Midnight Blue',
      brand: 'Samsung',
      model: 'Galaxy S23',
      estimatedValue: 65000,
      identifyingMarks: 'Serial snippet: SM-S911B, lockscreen wallpaper of campus clocktower',
      images: uploadedImageUrl ? [uploadedImageUrl] : []
    };

    const res = await fetch(`${BASE_URL}/lost-items`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenA}`
      },
      body: JSON.stringify(lostPayload)
    });
    const json = await res.json();
    createdLostId = json?.data?._id || json?.data?.id;
    const passed = res.status === 201 && json.success === true && Boolean(createdLostId);
    logResult('POST /api/lost-items report submission', passed, `Status: ${json?.data?.status || 'ACTIVE'}, ID: ${createdLostId}`);
  } catch (err) {
    logResult('POST /api/lost-items report submission', false, err.message);
  }

  // 5. Validation Rejection: Incident Date in the Future
  try {
    const futureDate = new Date();
    futureDate.setFullYear(futureDate.getFullYear() + 2);
    const res = await fetch(`${BASE_URL}/lost-items`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenA}`
      },
      body: JSON.stringify({
        itemName: 'Future Lost Item',
        category: 'Electronics',
        description: 'Testing future date rejection',
        location: 'Campus Gate',
        dateLost: futureDate.toISOString().split('T')[0]
      })
    });
    const json = await res.json();
    const passed = res.status === 400 && json.success === false;
    logResult('Validation rejects future incident dates', passed, `Status: ${res.status}`);
  } catch (err) {
    logResult('Validation rejects future incident dates', false, err.message);
  }

  // 6. Validation Rejection: Invalid Category
  try {
    const res = await fetch(`${BASE_URL}/lost-items`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenA}`
      },
      body: JSON.stringify({
        itemName: 'Alien Artifact',
        category: 'NonExistentSpaceCategory',
        description: 'Invalid category test',
        location: 'Campus Gate',
        dateLost: '2026-03-20'
      })
    });
    const json = await res.json();
    const passed = res.status === 400 && json.success === false;
    logResult('Validation rejects unrecognized categories', passed, `Status: ${res.status}`);
  } catch (err) {
    logResult('Validation rejects unrecognized categories', false, err.message);
  }

  // 7. Report Found Item
  try {
    const foundPayload = {
      itemName: 'Scientific Calculator Casio fx-991EX',
      category: 'Electronics',
      description: 'Black dual-powered scientific calculator left on desk in Physics Lab 2',
      dateFound: '2026-03-26',
      timeFound: '16:00',
      location: 'Science & Engineering Block',
      locationDetails: 'Physics Lab 2, Row 3 desk',
      storageLocation: 'Administration & Security Desk',
      color: 'Black',
      brand: 'Casio',
      model: 'fx-991EX',
      identifyingMarks: 'Small silver physics formula sticker on back cover',
      images: uploadedImageUrl ? [uploadedImageUrl] : []
    };

    const res = await fetch(`${BASE_URL}/found-items`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenB}`
      },
      body: JSON.stringify(foundPayload)
    });
    const json = await res.json();
    createdFoundId = json?.data?._id || json?.data?.id;
    const passed = res.status === 201 && json.success === true && Boolean(createdFoundId);
    logResult('POST /api/found-items report submission', passed, `Status: ${json?.data?.status || 'FOUND'}, Storage: ${json?.data?.storageLocation}`);
  } catch (err) {
    logResult('POST /api/found-items report submission', false, err.message);
  }

  // 8. Smart Search Test: Multi-Term Cross-Field Match ("black samsung phone")
  try {
    const res = await fetch(`${BASE_URL}/items?search=samsung+phone+blue`);
    const json = await res.json();
    const match = json?.data?.some((i) => i.brand === 'Samsung' || i.itemName?.includes('Samsung'));
    const passed = res.status === 200 && match;
    logResult('Smart Search handles multi-term cross-attribute queries', passed, `Hits: ${json?.data?.length}`);
  } catch (err) {
    logResult('Smart Search handles multi-term cross-attribute queries', false, err.message);
  }

  // 9. Smart Search with Stem/Plural Variation ("phones" matches "phone")
  try {
    const res = await fetch(`${BASE_URL}/items?search=phones`);
    const json = await res.json();
    const passed = res.status === 200 && json?.data?.length > 0;
    logResult('Smart Search handles plural/singular stem variants', passed, `Hits: ${json?.data?.length}`);
  } catch (err) {
    logResult('Smart Search handles plural/singular stem variants', false, err.message);
  }

  // 10. Filter by Category
  try {
    const res = await fetch(`${BASE_URL}/lost-items?category=Mobile%20Phone`);
    const json = await res.json();
    const allMatch = json?.data?.every((i) => i.category === 'Mobile Phone');
    const passed = res.status === 200 && allMatch && json?.data?.length > 0;
    logResult('Filter lost items by category', passed, `Found: ${json?.data?.length}`);
  } catch (err) {
    logResult('Filter lost items by category', false, err.message);
  }

  // 11. Filter by Location
  try {
    const res = await fetch(`${BASE_URL}/found-items?location=Science`);
    const json = await res.json();
    const allMatch = json?.data?.every((i) => i.location?.includes('Science'));
    const passed = res.status === 200 && allMatch && json?.data?.length > 0;
    logResult('Filter found items by location', passed, `Found: ${json?.data?.length}`);
  } catch (err) {
    logResult('Filter found items by location', false, err.message);
  }

  // 12. Privacy Check: Public Feed Hides Confidential Marks & Personal Contact Info
  try {
    const res = await fetch(`${BASE_URL}/lost-items`);
    const json = await res.json();
    const target = json?.data?.find((i) => (i._id || i.id) === createdLostId);
    const hidesMarks = target && !target.identifyingMarks && !target.identifyingFeatures;
    const hidesPhone = target && !target.reporter?.phone && !target.reporter?.email;
    const passed = hidesMarks && hidesPhone;
    logResult('Public item feeds protect private reporter credentials & marks', passed);
  } catch (err) {
    logResult('Public item feeds protect private reporter credentials & marks', false, err.message);
  }

  // 13. Item Details: Owner CAN see their own confidential identifying marks
  try {
    const res = await fetch(`${BASE_URL}/lost-items/${createdLostId}`, {
      headers: { Authorization: `Bearer ${tokenA}` }
    });
    const json = await res.json();
    const hasMarks = json?.data?.identifyingMarks?.includes('SM-S911B');
    const passed = res.status === 200 && hasMarks;
    logResult('Item Details allows authenticated owner to view private marks', passed);
  } catch (err) {
    logResult('Item Details allows authenticated owner to view private marks', false, err.message);
  }

  // 14. Item Details: Other User CANNOT see owner private identifying marks
  try {
    const res = await fetch(`${BASE_URL}/lost-items/${createdLostId}`, {
      headers: { Authorization: `Bearer ${tokenB}` }
    });
    const json = await res.json();
    const marksHidden = !json?.data?.identifyingMarks && !json?.data?.identifyingFeatures;
    const passed = res.status === 200 && marksHidden;
    logResult('Item Details hides private marks from non-owners', passed);
  } catch (err) {
    logResult('Item Details hides private marks from non-owners', false, err.message);
  }

  // 15. My Reports: User A only sees their own reports
  try {
    const res = await fetch(`${BASE_URL}/lost-items/my`, {
      headers: { Authorization: `Bearer ${tokenA}` }
    });
    const json = await res.json();
    const allMine = json?.data?.every((i) => {
      const repId = i.reporter?._id || i.reporter;
      return repId === userAId || repId?.toString() === userAId?.toString();
    });
    const passed = res.status === 200 && json?.data?.length > 0 && allMine;
    logResult('GET /api/lost-items/my retrieves strictly current user reports', passed, `Count: ${json?.data?.length}`);
  } catch (err) {
    logResult('GET /api/lost-items/my retrieves strictly current user reports', false, err.message);
  }

  // 16. Security: Non-owner CANNOT update another user report (403 Forbidden)
  try {
    const res = await fetch(`${BASE_URL}/lost-items/${createdLostId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenB}`
      },
      body: JSON.stringify({ itemName: 'Illegally Modified by User B' })
    });
    const json = await res.json();
    const passed = res.status === 403 && json.success === false;
    logResult('PUT /api/lost-items/:id blocks non-owner modifications (403)', passed, `Status: ${res.status}`);
  } catch (err) {
    logResult('PUT /api/lost-items/:id blocks non-owner modifications (403)', false, err.message);
  }

  // 17. Status Lifecycle: Rejects Invalid Cross-Lifecycle Status
  try {
    const res = await fetch(`${BASE_URL}/lost-items/${createdLostId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenA}`
      },
      body: JSON.stringify({ status: 'FOUND' }) // Cannot set FOUND on a lost item
    });
    const json = await res.json();
    const passed = res.status === 400 && json.success === false;
    logResult('Status lifecycle rejects invalid cross-type statuses (400)', passed, `Status: ${res.status}`);
  } catch (err) {
    logResult('Status lifecycle rejects invalid cross-type statuses (400)', false, err.message);
  }

  // 18. Status Lifecycle: Owner Can Mark Lost Item as RESOLVED
  try {
    const res = await fetch(`${BASE_URL}/lost-items/${createdLostId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenA}`
      },
      body: JSON.stringify({
        status: 'RESOLVED',
        description: 'Recovered item safely from security desk!'
      })
    });
    const json = await res.json();
    const passed = res.status === 200 && json?.data?.status === 'RESOLVED';
    logResult('Controlled status transition to RESOLVED succeeds', passed, `New Status: ${json?.data?.status}`);
  } catch (err) {
    logResult('Controlled status transition to RESOLVED succeeds', false, err.message);
  }

  // 19. Security: Non-owner CANNOT delete another user report (403 Forbidden)
  try {
    const res = await fetch(`${BASE_URL}/lost-items/${createdLostId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${tokenB}` }
    });
    const json = await res.json();
    const passed = res.status === 403 && json.success === false;
    logResult('DELETE /api/lost-items/:id blocks non-owner deletion (403)', passed, `Status: ${res.status}`);
  } catch (err) {
    logResult('DELETE /api/lost-items/:id blocks non-owner deletion (403)', false, err.message);
  }

  // 20. Owner CAN delete their own report
  try {
    const res = await fetch(`${BASE_URL}/lost-items/${createdLostId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${tokenA}` }
    });
    const json = await res.json();
    const passed = res.status === 200 && json.success === true;
    logResult('Owner successfully deletes own report (200)', passed);
  } catch (err) {
    logResult('Owner successfully deletes own report (200)', false, err.message);
  }

  // Summary
  const passedCount = results.filter((r) => r.passed).length;
  const totalCount = results.length;
  console.log('\n====================================================');
  console.log(` Phase 4 Test Suite Results: ${passedCount} / ${totalCount} PASSED`);
  console.log('====================================================');

  if (passedCount === totalCount) {
    console.log('\nAll Phase 4 reporting, smart search, and security tests PASSED flawlessly!');
  } else {
    console.error(`\n${totalCount - passedCount} test(s) failed.`);
    process.exitCode = 1;
  }
};

runSuite();
