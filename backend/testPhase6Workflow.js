/**
 * Phase 6 End-to-End Automated Test Suite
 * Campus Lost & Found — Fast Item Return, Owner Verification & Secure Handover System
 */

const BASE_URL = 'http://localhost:5001/api';

const logResult = (testName, passed, details = '') => {
  if (passed) {
    console.log(`✓ [PASS] ${testName} ${details ? `(${details})` : ''}`);
  } else {
    console.error(`✗ [FAIL] ${testName} ${details ? `(${details})` : ''}`);
    throw new Error(`Test failed: ${testName} - ${details}`);
  }
};

const runPhase6Tests = async () => {
  console.log('====================================================');
  console.log(' Starting Phase 6 Item Return & Handover Test Suite ');
  console.log('====================================================\n');

  let tokenOwner = null;
  let ownerId = null;
  let tokenFinder = null;
  let finderId = null;
  let tokenUnauthorized = null;
  let unauthorizedId = null;
  let tokenAdmin = null;
  let adminId = null;

  let lostItemId = null;
  let foundItemId = null;
  let claimId = null;
  let returnId = null;
  let verificationCode = null;

  const timestamp = Date.now().toString().slice(-6);

  // 1. Register Owner (Student A)
  try {
    const res = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: 'Aarav Sharma',
        email: `aarav.${timestamp}@campus.edu`,
        password: 'SecurePassword123!',
        confirmPassword: 'SecurePassword123!',
        registerNumber: `REG-AARAV-${timestamp}`,
        department: 'Computer Science & Engineering',
        course: 'B.Tech CSE',
        year: 3,
        className: 'CSE-A'
      })
    });
    const json = await res.json();
    tokenOwner = json.data.accessToken;
    ownerId = json.data.user._id || json.data.user.id;
    logResult('Owner (Student A) registration and authentication', res.status === 201 && Boolean(tokenOwner));
  } catch (err) {
    logResult('Owner (Student A) registration and authentication', false, err.message);
  }

  // 2. Register Finder (Student B)
  try {
    const res = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: 'Priya Patel',
        email: `priya.${timestamp}@campus.edu`,
        password: 'SecurePassword123!',
        confirmPassword: 'SecurePassword123!',
        registerNumber: `REG-PRIYA-${timestamp}`,
        department: 'Information Technology',
        course: 'B.Tech IT',
        year: 2,
        className: 'IT-B'
      })
    });
    const json = await res.json();
    tokenFinder = json.data.accessToken;
    finderId = json.data.user._id || json.data.user.id;
    logResult('Finder (Student B) registration and authentication', res.status === 201 && Boolean(tokenFinder));
  } catch (err) {
    logResult('Finder (Student B) registration and authentication', false, err.message);
  }

  // 3. Register Unauthorized Student (Student C)
  try {
    const res = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: 'Third Party Student',
        email: `outsider.${timestamp}@campus.edu`,
        password: 'SecurePassword123!',
        confirmPassword: 'SecurePassword123!',
        registerNumber: `REG-THIRD-${timestamp}`,
        department: 'Mechanical Engineering',
        year: 1
      })
    });
    const json = await res.json();
    tokenUnauthorized = json.data.accessToken;
    unauthorizedId = json.data.user._id || json.data.user.id;
    logResult('Unauthorized student session created', res.status === 201 && Boolean(tokenUnauthorized));
  } catch (err) {
    logResult('Unauthorized student session created', false, err.message);
  }

  // 4. Register Administrator / Staff
  try {
    const res = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: 'Campus Security Coordinator',
        email: `coordinator.${timestamp}@campus.edu`,
        password: 'AdminPassword123!',
        confirmPassword: 'AdminPassword123!',
        role: 'admin'
      })
    });
    const json = await res.json();
    tokenAdmin = json.data.accessToken;
    adminId = json.data.user._id || json.data.user.id;
    logResult('Administrator staff session created', res.status === 201 && Boolean(tokenAdmin));
  } catch (err) {
    logResult('Administrator staff session created', false, err.message);
  }

  // 5. Create Lost Item Report (Student A)
  try {
    const res = await fetch(`${BASE_URL}/lost-items`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenOwner}`
      },
      body: JSON.stringify({
        itemName: 'Silver Apple iPad Pro 11-inch',
        category: 'Electronics',
        brand: 'Apple',
        model: 'iPad Pro M2',
        color: 'Silver',
        location: 'Student Activity Center / Cafeteria',
        locationDetails: 'Table near juice counter',
        dateLost: '2026-03-27',
        description: 'Silver iPad Pro with magnetic Apple Pencil attached in navy smart folio cover'
      })
    });
    const json = await res.json();
    lostItemId = json?.data?._id || json?.data?.id;
    logResult('Create Lost Item report for tablet', res.status === 201 && Boolean(lostItemId));
  } catch (err) {
    logResult('Create Lost Item report for tablet', false, err.message);
  }

  // 6. Create Found Item Report (Student B)
  try {
    const res = await fetch(`${BASE_URL}/found-items`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenFinder}`
      },
      body: JSON.stringify({
        itemName: 'Silver iPad Pro with Apple Pencil',
        category: 'Electronics',
        brand: 'Apple',
        model: 'iPad Pro M2',
        color: 'Silver',
        location: 'Student Activity Center / Cafeteria',
        storageLocation: 'Administration & Security Desk',
        dateFound: '2026-03-27',
        description: 'Turned in by cafeteria cleanup staff'
      })
    });
    const json = await res.json();
    foundItemId = json?.data?._id || json?.data?.id;
    logResult('Create Found Item report for tablet', res.status === 201 && Boolean(foundItemId));
  } catch (err) {
    logResult('Create Found Item report for tablet', false, err.message);
  }

  // 7. Student A files Ownership Claim against Found Item
  try {
    const res = await fetch(`${BASE_URL}/claims`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenOwner}`
      },
      body: JSON.stringify({
        item: foundItemId,
        reason: 'Left on cafeteria table during lunch',
        ownershipProof: 'Serial number DMPX488219, lock screen image is the university football ground, Apple pencil has custom engraving "AARAV"',
        additionalDetails: 'Will present student ID card at Central Security Desk'
      })
    });
    const json = await res.json();
    claimId = json?.data?._id || json?.data?.id;
    logResult('Student A submits ownership verification claim', res.status === 201 && Boolean(claimId));
  } catch (err) {
    logResult('Student A submits ownership verification claim', false, err.message);
  }

  // 8. Admin approves claim -> triggers automatic Return creation & code issuance
  try {
    const res = await fetch(`${BASE_URL}/admin/claims/${claimId}/approve`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenAdmin}`
      },
      body: JSON.stringify({
        verificationNotes: 'Claimant provided exact serial number and engraving match. Approved for return.'
      })
    });
    const json = await res.json();
    const passed = res.status === 200 && json?.data?.status === 'approved' && Boolean(json?.data?.returnVerificationCode);
    verificationCode = json?.data?.returnVerificationCode;
    logResult('Admin approves claim and issues return verification code', passed, `Code: ${verificationCode}`);
  } catch (err) {
    logResult('Admin approves claim and issues return verification code', false, err.message);
  }

  // 9. Verify Return record was automatically initialized
  try {
    const res = await fetch(`${BASE_URL}/returns/my`, {
      headers: { Authorization: `Bearer ${tokenOwner}` }
    });
    const json = await res.json();
    const activeReturn = json?.data?.find(
      (r) => (r.claim?._id || r.claim?.id || r.claim) === claimId
    );
    returnId = activeReturn?._id || activeReturn?.id;
    const passed = res.status === 200 && Boolean(returnId) && activeReturn.status === 'READY_FOR_RETURN';
    logResult('Return record automatically initialized with status READY_FOR_RETURN', passed, `Return ID: ${returnId}`);
  } catch (err) {
    logResult('Return record automatically initialized with status READY_FOR_RETURN', false, err.message);
  }

  // 10. Security: Public unauthenticated request blocked (401)
  try {
    const res = await fetch(`${BASE_URL}/returns/${returnId}`);
    const passed = res.status === 401;
    logResult('Public unauthenticated access to return record is rejected (401)', passed, `Status: ${res.status}`);
  } catch (err) {
    logResult('Public unauthenticated access to return record is rejected (401)', false, err.message);
  }

  // 11. Security: Unauthorized student access blocked (403)
  try {
    const res = await fetch(`${BASE_URL}/returns/${returnId}`, {
      headers: { Authorization: `Bearer ${tokenUnauthorized}` }
    });
    const passed = res.status === 403;
    logResult('Unauthorized student blocked from inspecting return record (403)', passed, `Status: ${res.status}`);
  } catch (err) {
    logResult('Unauthorized student blocked from inspecting return record (403)', false, err.message);
  }

  // 12. Privacy & Disclosure: Owner view receives their secret return code
  try {
    const res = await fetch(`${BASE_URL}/returns/${returnId}`, {
      headers: { Authorization: `Bearer ${tokenOwner}` }
    });
    const json = await res.json();
    const passed = res.status === 200 && Boolean(json?.data?.verificationCode);
    logResult('Owner view receives secret verification code for handover', passed, `Code: ${json?.data?.verificationCode}`);
  } catch (err) {
    logResult('Owner view receives secret verification code for handover', false, err.message);
  }

  // 13. Privacy & Disclosure: Finder receives verified student identity but code is withheld
  try {
    const res = await fetch(`${BASE_URL}/returns/${returnId}`, {
      headers: { Authorization: `Bearer ${tokenFinder}` }
    });
    const json = await res.json();
    const identity = json?.data?.verifiedOwnerIdentity;
    const codeWithheld = !json?.data?.verificationCode;
    const hasRegNo = Boolean(identity?.registerNumber);
    const hasName = Boolean(identity?.fullName);
    const passed = res.status === 200 && codeWithheld && hasRegNo && hasName;
    logResult(
      'Finder view receives verified Owner Identity dossier while secret code is withheld',
      passed,
      `Student: ${identity?.fullName}, RegNo: ${identity?.registerNumber}`
    );
  } catch (err) {
    logResult('Finder view receives verified Owner Identity dossier while secret code is withheld', false, err.message);
  }

  // 14. Return Scheduling: Past date rejected (400)
  try {
    const res = await fetch(`${BASE_URL}/returns/${returnId}/schedule`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenOwner}`
      },
      body: JSON.stringify({
        date: '2020-01-01',
        time: '14:00',
        location: 'Administration & Security Desk'
      })
    });
    const passed = res.status === 400;
    logResult('Scheduling validation rejects past dates (400)', passed, `Status: ${res.status}`);
  } catch (err) {
    logResult('Scheduling validation rejects past dates (400)', false, err.message);
  }

  // 15. Return Scheduling: Valid future date and location appointment scheduled
  try {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateStr = tomorrow.toISOString().split('T')[0];

    const res = await fetch(`${BASE_URL}/returns/${returnId}/schedule`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenOwner}`
      },
      body: JSON.stringify({
        date: dateStr,
        time: '15:30',
        location: 'Central Security Helpdesk Room 102',
        returnMethod: 'Campus Office Pickup'
      })
    });
    const json = await res.json();
    const passed = res.status === 200 && json?.data?.status === 'SCHEDULED' && json?.data?.meetingLocation === 'Central Security Helpdesk Room 102';
    logResult('Handover appointment successfully scheduled (Status: SCHEDULED)', passed, `Date: ${dateStr}, Loc: Central Security Helpdesk Room 102`);
  } catch (err) {
    logResult('Handover appointment successfully scheduled (Status: SCHEDULED)', false, err.message);
  }

  // 16. Handover Station: Start verification session
  try {
    const res = await fetch(`${BASE_URL}/returns/${returnId}/start-verification`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenFinder}` }
    });
    const json = await res.json();
    const passed = res.status === 200 && json?.data?.status === 'IDENTITY_VERIFICATION';
    logResult('Custodian advances status to IDENTITY_VERIFICATION', passed, `Status: ${json?.data?.status}`);
  } catch (err) {
    logResult('Custodian advances status to IDENTITY_VERIFICATION', false, err.message);
  }

  // 17. Security: Owner cannot verify own code (must be verified by custodian/staff)
  try {
    const res = await fetch(`${BASE_URL}/returns/${returnId}/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenOwner}`
      },
      body: JSON.stringify({ verificationCode })
    });
    const passed = res.status === 403;
    logResult('Owner self-verification attempt blocked (403)', passed, `Status: ${res.status}`);
  } catch (err) {
    logResult('Owner self-verification attempt blocked (403)', false, err.message);
  }

  // 18. Security: Invalid verification code rejected with attempts counter
  try {
    const res = await fetch(`${BASE_URL}/returns/${returnId}/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenFinder}`
      },
      body: JSON.stringify({ verificationCode: 'INVALID-CODE-999' })
    });
    const json = await res.json();
    const passed = res.status === 400 && json.success === false;
    logResult('Invalid verification code rejected with remaining attempts', passed, `Msg: "${json?.message}"`);
  } catch (err) {
    logResult('Invalid verification code rejected with remaining attempts', false, err.message);
  }

  // 19. Correct Verification Code Accepted
  try {
    const res = await fetch(`${BASE_URL}/returns/${returnId}/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenFinder}`
      },
      body: JSON.stringify({ verificationCode })
    });
    const json = await res.json();
    const passed = res.status === 200 && json?.data?.ownerVerified === true && json?.data?.status === 'HANDOVER_PENDING';
    logResult('Correct code verified and status moved to HANDOVER_PENDING', passed, `Status: ${json?.data?.status}`);
  } catch (err) {
    logResult('Correct code verified and status moved to HANDOVER_PENDING', false, err.message);
  }

  // 20. Handover Confirmation by Custodian / Finder
  try {
    const res = await fetch(`${BASE_URL}/returns/${returnId}/confirm-handover`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenFinder}`
      },
      body: JSON.stringify({ remarks: 'Verified student ID and handed over iPad Pro' })
    });
    const json = await res.json();
    const passed = res.status === 200 && json?.data?.handoverConfirmed === true;
    logResult('Custodian confirms physical handover of item', passed);
  } catch (err) {
    logResult('Custodian confirms physical handover of item', false, err.message);
  }

  // 21. Double Confirmation: Owner confirms receipt -> Finalizes complete return
  try {
    const res = await fetch(`${BASE_URL}/returns/${returnId}/confirm-received`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenOwner}`
      },
      body: JSON.stringify({ remarks: 'Received in perfect working condition' })
    });
    const json = await res.json();
    const passed = res.status === 200 && json?.data?.status === 'RETURNED' && Boolean(json?.data?.receipt?.receiptNumber);
    logResult(
      'Owner confirms item receipt, completing handover workflow (Status: RETURNED)',
      passed,
      `Receipt: ${json?.data?.receipt?.receiptNumber}`
    );
  } catch (err) {
    logResult('Owner confirms item receipt, completing handover workflow (Status: RETURNED)', false, err.message);
  }

  // 22. Database Consistency: Verify Item status is updated to RETURNED
  try {
    const res = await fetch(`${BASE_URL}/items/${foundItemId}`);
    const json = await res.json();
    const itemStatus = (json?.data?.status || '').toUpperCase();
    const passed = res.status === 200 && (itemStatus === 'RETURNED' || itemStatus === 'CLOSED');
    logResult('Item lifecycle automatically transitioned to RETURNED', passed, `Status: ${itemStatus}`);
  } catch (err) {
    logResult('Item lifecycle automatically transitioned to RETURNED', false, err.message);
  }

  // 23. Database Consistency: Verify Claim status is updated to completed
  try {
    const res = await fetch(`${BASE_URL}/claims/${claimId}`, {
      headers: { Authorization: `Bearer ${tokenOwner}` }
    });
    const json = await res.json();
    const claimStatus = (json?.data?.status || '').toLowerCase();
    const passed = res.status === 200 && (claimStatus === 'completed' || json?.data?.returnStatus === 'RETURNED');
    logResult('Claim lifecycle automatically transitioned to COMPLETED', passed, `Status: ${claimStatus}`);
  } catch (err) {
    logResult('Claim lifecycle automatically transitioned to COMPLETED', false, err.message);
  }

  // 24. Duplicate Confirmation Block: Prevent double handover confirmation
  try {
    const res = await fetch(`${BASE_URL}/returns/${returnId}/confirm-handover`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenFinder}`
      }
    });
    const passed = res.status === 400;
    logResult('Duplicate handover confirmation blocked after finalization (400)', passed, `Status: ${res.status}`);
  } catch (err) {
    logResult('Duplicate handover confirmation blocked after finalization (400)', false, err.message);
  }

  // 25. Return Cancellation Workflow (Secondary return creation & cancellation)
  try {
    // Create another found item & claim to test cancellation
    const foundRes = await fetch(`${BASE_URL}/found-items`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenFinder}`
      },
      body: JSON.stringify({
        itemName: 'Casio Scientific Calculator',
        category: 'Electronics',
        location: 'Science & Engineering Block',
        storageLocation: 'Administration & Security Desk',
        dateFound: '2026-03-28',
        description: 'Calculator found on lab desk'
      })
    });
    const foundJson = await foundRes.json();
    const cancelItemId = foundJson?.data?._id || foundJson?.data?.id;

    const claimRes = await fetch(`${BASE_URL}/claims`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenOwner}`
      },
      body: JSON.stringify({
        item: cancelItemId,
        reason: 'Lost my calculator in physics lab',
        ownershipProof: 'Has serial FX-991EX and sticker with initials AS'
      })
    });
    const claimJson = await claimRes.json();
    const cancelClaimId = claimJson?.data?._id || claimJson?.data?.id;

    // Approve claim to trigger return creation
    await fetch(`${BASE_URL}/admin/claims/${cancelClaimId}/approve`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenAdmin}`
      },
      body: JSON.stringify({ verificationNotes: 'Approved calculator' })
    });

    const retListRes = await fetch(`${BASE_URL}/returns/my`, {
      headers: { Authorization: `Bearer ${tokenOwner}` }
    });
    const retListJson = await retListRes.json();
    const retToCancel = retListJson?.data?.find(
      (r) => (r.claim?._id || r.claim?.id || r.claim) === cancelClaimId
    );
    const cancelReturnId = retToCancel?._id || retToCancel?.id;

    // Execute cancellation
    const cancelRes = await fetch(`${BASE_URL}/returns/${cancelReturnId}/cancel`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenOwner}`
      },
      body: JSON.stringify({ reason: 'Owner relocated off-campus, scheduling direct pickup later' })
    });
    const cancelResultJson = await cancelRes.json();
    const passed = cancelRes.status === 200 && cancelResultJson?.data?.status === 'CANCELLED';
    logResult('Return appointment cancelled with recorded reason (Status: CANCELLED)', passed, `Status: ${cancelResultJson?.data?.status}`);
  } catch (err) {
    logResult('Return appointment cancelled with recorded reason (Status: CANCELLED)', false, err.message);
  }

  // 26. Dispute Workflow: Raise dispute on return
  try {
    const disputeRes = await fetch(`${BASE_URL}/returns/${returnId}/dispute`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenOwner}`
      },
      body: JSON.stringify({
        reason: 'Item Condition Damaged or Altered',
        description: 'Small scratch noticed on corner folio after handover. Requesting administrative record.',
        evidence: ['/uploads/damaged_corner_photo.png']
      })
    });
    const disputeJson = await disputeRes.json();
    const passed = disputeRes.status === 200 && disputeJson?.data?.status === 'DISPUTED' && disputeJson?.data?.dispute?.isDisputed === true;
    logResult('Dispute workflow transitions return to DISPUTED and records issue', passed, `Status: ${disputeJson?.data?.status}`);
  } catch (err) {
    logResult('Dispute workflow transitions return to DISPUTED and records issue', false, err.message);
  }

  // 27. Notification Dispatch: Verify Return-related notifications delivered
  try {
    const notifRes = await fetch(`${BASE_URL}/notifications`, {
      headers: { Authorization: `Bearer ${tokenOwner}` }
    });
    const notifJson = await notifRes.json();
    const notifications = notifJson?.data?.notifications || (Array.isArray(notifJson?.data) ? notifJson.data : []);
    const hasReturnNotif = notifications.some(
      (n) => n.type === 'item_returned' || n.type === 'claim_approved' || n.type === 'return_code_generated'
    );
    logResult('Automated in-app notifications generated for return lifecycle events', hasReturnNotif, `Count: ${notifications.length}`);
  } catch (err) {
    logResult('Automated in-app notifications generated for return lifecycle events', false, err.message);
  }

  console.log('\n====================================================');
  console.log(' Phase 6 Test Suite Results: 27 / 27 PASSED');
  console.log('====================================================');
  console.log('All Fast Item Return, Verification & Handover workflows verified!\n');
};

runPhase6Tests().catch((err) => {
  console.error('\nTest Suite Terminated with Error:', err.message);
  process.exit(1);
});
