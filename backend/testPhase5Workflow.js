/**
 * Integration Test Suite for Phase 5:
 * Smart Matching Engine, Claim System, Ownership Verification & Admin Review
 */

const BASE_URL = 'http://localhost:5001/api';

const logResult = (testName, passed, details = '') => {
  const symbol = passed ? '✓ [PASS]' : '✗ [FAIL]';
  console.log(`${symbol} ${testName} ${details ? '(' + details + ')' : ''}`);
  if (!passed) {
    throw new Error(`Test failed: ${testName} - ${details}`);
  }
};

async function runPhase5TestSuite() {
  console.log('====================================================');
  console.log(' Starting Phase 5 Smart Matching & Claims Test Suite');
  console.log('====================================================\n');

  let tokenStudentA, userAId;
  let tokenStudentB, userBId;
  let tokenAdmin, adminId;

  let lostItemId;
  let foundItemId;
  let incompatibleFoundId;
  let matchId;
  let claimAId;
  let claimBId;

  // 1. Setup Student A (Lost Item Reporter)
  try {
    const res = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: 'Alice Lost Student',
        email: `alice.lost.${Date.now()}@campus.edu`,
        password: 'Password123!',
        confirmPassword: 'Password123!',
        registerNumber: 'REG2024CS101',
        department: 'Computer Science',
        role: 'student'
      })
    });
    const json = await res.json();
    tokenStudentA = json.data.accessToken;
    userAId = json.data.user._id || json.data.user.id;
    logResult('Student A registration and session creation', res.status === 201 && Boolean(tokenStudentA));
  } catch (err) {
    logResult('Student A registration and session creation', false, err.message);
  }

  // 2. Setup Student B (Found Item Finder & Claimant)
  try {
    const res = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: 'Bob Finder Student',
        email: `bob.finder.${Date.now()}@campus.edu`,
        password: 'Password123!',
        confirmPassword: 'Password123!',
        registerNumber: 'REG2024EC202',
        department: 'Electronics',
        role: 'student'
      })
    });
    const json = await res.json();
    tokenStudentB = json.data.accessToken;
    userBId = json.data.user._id || json.data.user.id;
    logResult('Student B registration and session creation', res.status === 201 && Boolean(tokenStudentB));
  } catch (err) {
    logResult('Student B registration and session creation', false, err.message);
  }

  // 3. Setup Administrator / Coordinator
  try {
    const res = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: 'Coordinator Admin',
        email: `admin.security.${Date.now()}@campus.edu`,
        password: 'Password123!',
        confirmPassword: 'Password123!',
        registerNumber: 'ADMIN999',
        department: 'Campus Security',
        role: 'admin'
      })
    });
    const json = await res.json();
    tokenAdmin = json.data.accessToken;
    adminId = json.data.user._id || json.data.user.id;
    logResult('Administrator registration with staff privilege', res.status === 201 && Boolean(tokenAdmin));
  } catch (err) {
    logResult('Administrator registration with staff privilege', false, err.message);
  }

  // 4. Create Lost Item Report (by Student A)
  try {
    const res = await fetch(`${BASE_URL}/lost-items`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenStudentA}`
      },
      body: JSON.stringify({
        itemName: 'Midnight Blue HP Pavilion Laptop',
        category: 'Laptop',
        brand: 'HP',
        model: 'Pavilion 15',
        color: 'Midnight Blue',
        location: 'Central Library',
        locationDetails: '3rd floor cubicle row 4',
        dateLost: '2026-03-25',
        description: 'Left in black laptop sleeve with power adapter inside Central Library study carrel',
        identifyingMarks: 'Serial HP8832-X, sticker of Python logo on top lid'
      })
    });
    const json = await res.json();
    lostItemId = json?.data?._id || json?.data?.id;
    logResult('Create Lost Item report for correlation engine', res.status === 201 && Boolean(lostItemId));
  } catch (err) {
    logResult('Create Lost Item report for correlation engine', false, err.message);
  }

  // 5. Create Incompatible Found Item (Different category, different brand)
  try {
    const res = await fetch(`${BASE_URL}/found-items`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenStudentB}`
      },
      body: JSON.stringify({
        itemName: 'Red Leather Wallet',
        category: 'Wallet',
        brand: 'Tommy Hilfiger',
        color: 'Red',
        location: 'Sports Complex & Gymnasium',
        dateFound: '2026-03-28',
        storageLocation: 'Gymnasium Reception Desk',
        description: 'Red wallet found near badminton court 3'
      })
    });
    const json = await res.json();
    incompatibleFoundId = json?.data?._id || json?.data?.id;
    logResult('Create Incompatible Found Item (Wallet vs Laptop)', res.status === 201 && Boolean(incompatibleFoundId));
  } catch (err) {
    logResult('Create Incompatible Found Item (Wallet vs Laptop)', false, err.message);
  }

  // 6. Verify Incompatible Item does NOT create a match for Student A
  try {
    const res = await fetch(`${BASE_URL}/matches/my`, {
      headers: { Authorization: `Bearer ${tokenStudentA}` }
    });
    const json = await res.json();
    const hasIncompatible = json?.data?.some(
      (m) => (m.foundItem?._id || m.foundItem?.id) === incompatibleFoundId
    );
    logResult('Incompatible records do not trigger false correlation matches', res.status === 200 && !hasIncompatible);
  } catch (err) {
    logResult('Incompatible records do not trigger false correlation matches', false, err.message);
  }

  // 7. Create Highly Compatible Found Item (matching Laptop, HP, Blue, Library)
  try {
    const res = await fetch(`${BASE_URL}/found-items`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenStudentB}`
      },
      body: JSON.stringify({
        itemName: 'HP Pavilion 15 Laptop',
        category: 'Laptop',
        brand: 'HP',
        model: 'Pavilion 15',
        color: 'Midnight Blue',
        location: 'Central Library',
        locationDetails: 'Turned into library helpdesk',
        storageLocation: 'Administration & Security Desk',
        dateFound: '2026-03-26',
        description: 'Dark blue HP laptop turned in by library custodian'
      })
    });
    const json = await res.json();
    foundItemId = json?.data?._id || json?.data?.id;
    logResult('Create Highly Compatible Found Item report', res.status === 201 && Boolean(foundItemId));
  } catch (err) {
    logResult('Create Highly Compatible Found Item report', false, err.message);
  }

  // 8. Matching: Match is Generated and Retrieved via GET /api/matches/my
  try {
    const res = await fetch(`${BASE_URL}/matches/my`, {
      headers: { Authorization: `Bearer ${tokenStudentA}` }
    });
    const json = await res.json();
    const match = json?.data?.find(
      (m) =>
        (m.foundItem?._id || m.foundItem?.id) === foundItemId &&
        (m.lostItem?._id || m.lostItem?.id) === lostItemId
    );
    matchId = match?._id || match?.id;
    const score = match?.matchScore;
    const factors = match?.matchingFactors;
    const passed = res.status === 200 && Boolean(match) && score >= 80 && factors?.reasons?.length > 0;
    logResult(
      'Smart Matching Engine generates correlation match above threshold',
      passed,
      `Score: ${score}%, Level: ${match?.matchLevel}, Reasons: ${factors?.reasons?.length}`
    );
  } catch (err) {
    logResult('Smart Matching Engine generates correlation match above threshold', false, err.message);
  }

  // 9. Matching: Stored Factors Breakdown Verification
  try {
    const res = await fetch(`${BASE_URL}/matches/${matchId}`, {
      headers: { Authorization: `Bearer ${tokenStudentA}` }
    });
    const json = await res.json();
    const factors = json?.data?.matchingFactors;
    const hasCategory = factors?.category === 25;
    const hasBrand = factors?.brand === 15;
    const hasColor = factors?.color === 10;
    const hasLocation = factors?.location === 10;
    const hasReasons = Array.isArray(factors?.reasons) && factors.reasons.length >= 4;
    const passed = res.status === 200 && hasCategory && hasBrand && hasColor && hasLocation && hasReasons;
    logResult(
      'Matching Factors properly breakdown score with detailed human-readable reasons',
      passed,
      `Category: ${factors?.category}, Brand: ${factors?.brand}, Color: ${factors?.color}`
    );
  } catch (err) {
    logResult('Matching Factors properly breakdown score with detailed human-readable reasons', false, err.message);
  }

  // 10. Privacy in Match View: Counterparty private contact details & marks are protected
  try {
    const res = await fetch(`${BASE_URL}/matches/${matchId}`, {
      headers: { Authorization: `Bearer ${tokenStudentA}` }
    });
    const json = await res.json();
    const foundItem = json?.data?.foundItem;
    const hidesMarks = !foundItem?.identifyingMarks && !foundItem?.identifyingFeatures;
    const hidesPhone = !foundItem?.reporter?.phoneNumber && !foundItem?.reporter?.phone;
    const hidesEmail = !foundItem?.reporter?.email;
    const passed = hidesMarks && hidesPhone && hidesEmail;
    logResult('Match view protects counterparty contact credentials and private marks', passed);
  } catch (err) {
    logResult('Match view protects counterparty contact credentials and private marks', false, err.message);
  }

  // 11. Match Status Transition: Mark as Viewed
  try {
    const res = await fetch(`${BASE_URL}/matches/${matchId}/view`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${tokenStudentA}` }
    });
    const json = await res.json();
    const passed = res.status === 200 && json?.data?.status === 'viewed';
    logResult('PATCH /api/matches/:id/view transitions status to viewed', passed, `Status: ${json?.data?.status}`);
  } catch (err) {
    logResult('PATCH /api/matches/:id/view transitions status to viewed', false, err.message);
  }

  // 12. Claims: Self-claim is Rejected (Finder cannot claim their own found item)
  try {
    const res = await fetch(`${BASE_URL}/claims`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenStudentB}` // Student B reported this item
      },
      body: JSON.stringify({
        item: foundItemId,
        reason: 'Attempting self-claim on found item',
        ownershipProof: 'I reported it and now I claim it'
      })
    });
    const json = await res.json();
    const passed = res.status === 400 && json.success === false;
    logResult('Self-claim rejection prevents finder claiming own reported item', passed, `Status: ${res.status}`);
  } catch (err) {
    logResult('Self-claim rejection prevents finder claiming own reported item', false, err.message);
  }

  // 13. Claims: Validation rejects missing ownership proof details
  try {
    const res = await fetch(`${BASE_URL}/claims`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenStudentA}`
      },
      body: JSON.stringify({
        item: foundItemId,
        reason: 'Valid reason',
        ownershipProof: '' // Empty proof
      })
    });
    const json = await res.json();
    const passed = res.status === 400 && json.success === false;
    logResult('Claim validation rejects missing or insufficient ownership proof', passed, `Status: ${res.status}`);
  } catch (err) {
    logResult('Claim validation rejects missing or insufficient ownership proof', false, err.message);
  }

  // 14. Claims: Valid Claim Submission by Student A (Genuine Owner)
  try {
    const res = await fetch(`${BASE_URL}/claims`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenStudentA}`
      },
      body: JSON.stringify({
        item: foundItemId,
        claimType: 'match_claim',
        match: matchId,
        reason: 'Lost this laptop during study session before midterms',
        ownershipProof: 'Serial number HP8832-X, sticker of Python logo on lid, desktop background is campus clocktower, 512GB SSD',
        additionalDetails: 'Will present student ID card and purchase invoice on collection',
        evidence: ['/uploads/laptop_receipt_invoice.pdf']
      })
    });
    const json = await res.json();
    claimAId = json?.data?._id || json?.data?.id;
    const passed = res.status === 201 && json.success === true && Boolean(claimAId);
    logResult('POST /api/claims successfully creates pending ownership claim', passed, `Claim ID: ${claimAId}`);
  } catch (err) {
    logResult('POST /api/claims successfully creates pending ownership claim', false, err.message);
  }

  // 15. Claims: Duplicate Active Claim Prevention (409 Conflict)
  try {
    const res = await fetch(`${BASE_URL}/claims`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenStudentA}`
      },
      body: JSON.stringify({
        item: foundItemId,
        reason: 'Second duplicate claim attempt',
        ownershipProof: 'Trying to claim again while first is pending'
      })
    });
    const json = await res.json();
    const passed = res.status === 409 && json.success === false;
    logResult('Duplicate active claim attempt on same item blocked (409)', passed, `Status: ${res.status}`);
  } catch (err) {
    logResult('Duplicate active claim attempt on same item blocked (409)', false, err.message);
  }

  // 16. Claims: Multiple Claims support (Student C files competing claim)
  let tokenStudentC;
  try {
    const regC = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: 'Charlie Competing Claimant',
        email: `charlie.competing.${Date.now()}@campus.edu`,
        password: 'Password123!',
        confirmPassword: 'Password123!',
        registerNumber: 'REG2024ME303',
        department: 'Mechanical',
        role: 'student'
      })
    });
    const jsonC = await regC.json();
    tokenStudentC = jsonC.data.accessToken;

    const res = await fetch(`${BASE_URL}/claims`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenStudentC}`
      },
      body: JSON.stringify({
        item: foundItemId,
        reason: 'I also lost an HP laptop around that date',
        ownershipProof: 'HP 15 inch blue laptop lost in library'
      })
    });
    const json = await res.json();
    claimBId = json?.data?._id || json?.data?.id;
    const passed = res.status === 201 && Boolean(claimBId);
    logResult('Multiple competing claims allowed to be submitted independently', passed, `Claim B ID: ${claimBId}`);
  } catch (err) {
    logResult('Multiple competing claims allowed to be submitted independently', false, err.message);
  }

  // 17. Security: Student CANNOT approve their own claim directly (401/403)
  try {
    const res = await fetch(`${BASE_URL}/admin/claims/${claimAId}/approve`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenStudentA}` // Student credentials
      },
      body: JSON.stringify({})
    });
    const passed = res.status === 403;
    logResult('Student authorization blocks direct self-approval of claims (403)', passed, `Status: ${res.status}`);
  } catch (err) {
    logResult('Student authorization blocks direct self-approval of claims (403)', false, err.message);
  }

  // 18. Security: Non-owner CANNOT view or modify another student claim
  try {
    const res = await fetch(`${BASE_URL}/claims/${claimAId}`, {
      headers: { Authorization: `Bearer ${tokenStudentC}` } // Charlie trying to inspect Alice's claim
    });
    const passed = res.status === 403;
    logResult('Access control blocks student from viewing another user private claim (403)', passed, `Status: ${res.status}`);
  } catch (err) {
    logResult('Access control blocks student from viewing another user private claim (403)', false, err.message);
  }

  // 19. Evidence Attachment: Student can attach additional proof URL
  try {
    const res = await fetch(`${BASE_URL}/claims/${claimAId}/evidence`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenStudentA}`
      },
      body: JSON.stringify({ evidenceUrl: '/uploads/serial_photo_box.jpg' })
    });
    const json = await res.json();
    const passed = res.status === 200 && json?.data?.evidence?.includes('/uploads/serial_photo_box.jpg');
    logResult('POST /api/claims/:id/evidence attaches additional proof assets', passed);
  } catch (err) {
    logResult('POST /api/claims/:id/evidence attaches additional proof assets', false, err.message);
  }

  // 20. Admin Review: Coordinator views claim details with competing claims count
  try {
    const res = await fetch(`${BASE_URL}/admin/claims/${claimAId}`, {
      headers: { Authorization: `Bearer ${tokenAdmin}` }
    });
    const json = await res.json();
    const passed = res.status === 200 && json?.data?.claim?.ownershipProof && json?.data?.competingClaimsCount >= 1;
    logResult(
      'Admin coordinator can inspect full claim dossier and competing claims',
      passed,
      `Competing claims: ${json?.data?.competingClaimsCount}`
    );
  } catch (err) {
    logResult('Admin coordinator can inspect full claim dossier and competing claims', false, err.message);
  }

  // 21. Review Action: Request Information Requires Notes
  try {
    const res = await fetch(`${BASE_URL}/admin/claims/${claimAId}/request-information`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenAdmin}`
      },
      body: JSON.stringify({ notes: '' }) // Empty notes
    });
    const passed = res.status === 400;
    logResult('Requesting additional information requires non-empty coordinator notes (400)', passed);
  } catch (err) {
    logResult('Requesting additional information requires non-empty coordinator notes (400)', false, err.message);
  }

  // 22. Review Action: Coordinator requests additional verification from Claimant A
  try {
    const res = await fetch(`${BASE_URL}/admin/claims/${claimAId}/request-information`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenAdmin}`
      },
      body: JSON.stringify({ notes: 'Please bring your student ID card and confirm the serial number.' })
    });
    const json = await res.json();
    const passed = res.status === 200 && json?.data?.verificationStatus === 'underreview';
    logResult('Coordinator successfully moves claim to UNDER_REVIEW with instructions', passed);
  } catch (err) {
    logResult('Coordinator successfully moves claim to UNDER_REVIEW with instructions', false, err.message);
  }

  // 23. Review Action: Rejection requires a reason
  try {
    const res = await fetch(`${BASE_URL}/admin/claims/${claimBId}/reject`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenAdmin}`
      },
      body: JSON.stringify({ rejectionReason: '' }) // Missing reason
    });
    const passed = res.status === 400;
    logResult('Admin rejection endpoint requires an explicit rejection reason (400)', passed);
  } catch (err) {
    logResult('Admin rejection endpoint requires an explicit rejection reason (400)', false, err.message);
  }

  // 24. Review Action: Coordinator Approves Claim A and Issues Return Verification Code
  let issuedReturnCode;
  try {
    const res = await fetch(`${BASE_URL}/admin/claims/${claimAId}/approve`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenAdmin}`
      },
      body: JSON.stringify({ verificationNotes: 'Conclusive proof provided via serial number and invoice.' })
    });
    const json = await res.json();
    issuedReturnCode = json?.data?.returnVerificationCode;
    const isApproved = json?.data?.status?.toLowerCase() === 'approved';
    const isReady = json?.data?.returnStatus === 'READY_FOR_PICKUP';
    const passed = res.status === 200 && isApproved && isReady && issuedReturnCode?.startsWith('CL-');
    logResult(
      'Coordinator APPROVES verified claim and generates return verification code',
      passed,
      `Code: ${issuedReturnCode}, ReturnStatus: ${json?.data?.returnStatus}`
    );
  } catch (err) {
    logResult('Coordinator APPROVES verified claim and generates return verification code', false, err.message);
  }

  // 25. Multiple Claims Resolution: Competing claim (Claim B) was automatically rejected
  try {
    const res = await fetch(`${BASE_URL}/admin/claims/${claimBId}`, {
      headers: { Authorization: `Bearer ${tokenAdmin}` }
    });
    const json = await res.json();
    const statusB = json?.data?.claim?.status?.toLowerCase();
    const reasonB = json?.data?.claim?.rejectionReason;
    const passed = res.status === 200 && statusB === 'rejected' && Boolean(reasonB);
    logResult(
      'Approval of verified claim automatically resolves competing claims to REJECTED',
      passed,
      `Claim B Status: ${statusB}`
    );
  } catch (err) {
    logResult('Approval of verified claim automatically resolves competing claims to REJECTED', false, err.message);
  }

  // 26. Item Status Lifecycle: Found Item transitions to CLAIMED
  try {
    const res = await fetch(`${BASE_URL}/found-items/${foundItemId}`);
    const json = await res.json();
    const status = json?.data?.status;
    const passed = res.status === 200 && (status === 'CLAIMED' || status === 'STATUS_CLAIMED' || status === 'claimed');
    logResult('Item lifecycle: found item status successfully updated to CLAIMED', passed, `Item Status: ${status}`);
  } catch (err) {
    logResult('Item lifecycle: found item status successfully updated to CLAIMED', false, err.message);
  }

  // 27. Notifications: Verify student received approval notification
  try {
    const res = await fetch(`${BASE_URL}/notifications`, {
      headers: { Authorization: `Bearer ${tokenStudentA}` }
    });
    const json = await res.json();
    const notifs = json?.data?.notifications || json?.data || [];
    const hasApproval = notifs.some((n) => n.type === 'claim_approved' || n.title?.includes('Approved'));
    const passed = res.status === 200 && hasApproval;
    logResult('Automated notification dispatched to claimant with pickup instructions', passed);
  } catch (err) {
    logResult('Automated notification dispatched to claimant with pickup instructions', false, err.message);
  }

  // 28. Claim Cancellation: Student can cancel eligible pending claim
  try {
    // Create new claim on another item to test cancellation
    const resCreate = await fetch(`${BASE_URL}/claims`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenStudentA}`
      },
      body: JSON.stringify({
        item: incompatibleFoundId,
        reason: 'Accidental claim submission',
        ownershipProof: 'Filing in error, will cancel'
      })
    });
    const jsonCreate = await resCreate.json();
    const cancelTargetId = jsonCreate?.data?._id || jsonCreate?.data?.id;

    const resCancel = await fetch(`${BASE_URL}/claims/${cancelTargetId}/cancel`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${tokenStudentA}` }
    });
    const jsonCancel = await resCancel.json();
    const passed = resCancel.status === 200 && jsonCancel?.data?.status?.toLowerCase() === 'cancelled';
    logResult('Claimant can cancel eligible pending claim (status: cancelled)', passed);
  } catch (err) {
    logResult('Claimant can cancel eligible pending claim (status: cancelled)', false, err.message);
  }

  // 29. Student View: /api/claims/my includes collection verification code for approved claim
  try {
    const res = await fetch(`${BASE_URL}/claims/my`, {
      headers: { Authorization: `Bearer ${tokenStudentA}` }
    });
    const json = await res.json();
    const approvedClaim = (json?.data || []).find((c) => (c._id || c.id) === claimAId);
    const hasCode = approvedClaim?.returnVerificationCode === issuedReturnCode;
    const passed = res.status === 200 && hasCode;
    logResult('Claimant My Claims view displays pickup verification code and desk', passed, `Code: ${issuedReturnCode}`);
  } catch (err) {
    logResult('Claimant My Claims view displays pickup verification code and desk', false, err.message);
  }

  // 30. Match Dismissal: Student can dismiss non-relevant correlation match
  try {
    const res = await fetch(`${BASE_URL}/matches/${matchId}/dismiss`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${tokenStudentA}` }
    });
    const json = await res.json();
    const passed = res.status === 200 && json?.data?.status === 'dismissed';
    logResult('Student can dismiss match from their active correlation queue', passed, `Status: ${json?.data?.status}`);
  } catch (err) {
    logResult('Student can dismiss match from their active correlation queue', false, err.message);
  }

  console.log('\n====================================================');
  console.log(' Phase 5 Test Suite Results: 30 / 30 PASSED');
  console.log('====================================================');
  console.log('All Smart Matching, Claims & Verification workflows verified!\n');
}

runPhase5TestSuite().catch((err) => {
  console.error('\nTest Suite Terminated with Error:', err.message);
  process.exit(1);
});
