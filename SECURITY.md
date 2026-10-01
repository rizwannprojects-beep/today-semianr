# Security Policy & System Hardening Documentation (Phase 8 Baseline)

This document establishes the comprehensive security baseline, defense-in-depth architecture, threat model, and operational procedures for the **Campus Lost & Found Platform**.

---

## 1. Authentication Architecture

### Password Security & Hashing
- **Algorithm**: `bcryptjs` utilizing adaptive work factor / cost salt rounds (12 rounds).
- **Storage**: Only the hashed representation (`passwordHash`) is persisted in MongoDB or cache stores.
- **Leakage Prevention**: Mongoose user schema sets `select: false` on `passwordHash`. Projections and serialization helpers strictly strip `passwordHash`, reset tokens, and session identifiers before emitting JSON responses.
- **Timing & Enumeration Defense**: User authentication uses constant-time string comparisons for hashes. Failed logins return generic `401 Unauthorized` responses ("Invalid email or password") without confirming whether the email exists.

### Token Security & Session Management
- **Token Mechanism**: Dual-token architecture using JSON Web Tokens (JWT).
  - **Access Token**: Short-lived (15 minutes). Signed with `HS256` explicitly enforcing signature algorithm verification on the server (`algorithms: ['HS256']`) to thwart algorithm confusion (`none` or RS-to-HS attacks).
  - **Refresh Token**: Long-lived (7 days). Stored in secure `RefreshToken` database collection with cryptographic token hashing and rotation on use.
- **Cookie Security**:
  - `HttpOnly`: Enabled (prevents JavaScript access via `document.cookie`).
  - `Secure`: Enabled in production (`NODE_ENV === 'production'`) to enforce TLS transmission.
  - `SameSite`: Configured to `lax` (or `strict`) to prevent unauthorized cross-site transmission.
- **Logout & Revocation**:
  - Token blacklisting and database refresh token invalidation ensures immediate session termination upon user logout.
  - Suspended accounts (`isActive: false` or status `SUSPENDED`) are blocked at middleware level on every request.

---

## 2. Authorization & Role-Based Access Control (RBAC)

### Role System
1. **Student (`student`)**:
   - Permitted actions: Report lost/found items, view public listings, manage own reports, submit ownership claims, upload ownership evidence, schedule pickups for verified claims, receive return verification codes for claimed items.
   - Forbidden actions: Access administrative routes, view another student's private claims, verify return codes for own claimed items, inspect private identifying marks on found items.
2. **Staff / Admin (`admin`)**:
   - Permitted actions: Approve/reject claims, review disputes, verify physical return codes, manage item lifecycles, inspect audit logs, review security events, suspend abusive accounts.
   - Privilege limits: Cannot suspend their own account; cannot alter audit logs (immutable).

### IDOR / BOLA Prevention
- Every object lookup (`/api/items/:id`, `/api/claims/:id`, `/api/returns/:id`, `/api/notifications/:id`) enforces server-side ownership or authorized party checks:
  ```javascript
  const isOwner = claim.claimantId.toString() === req.user._id.toString();
  const isAdmin = req.user.role === 'admin';
  if (!isOwner && !isAdmin) {
    return res.status(403).json({ success: false, message: 'Access denied: You do not own this claim' });
  }
  ```
- URLs containing object identifiers are validated against MongoDB `ObjectId.isValid(id)` before query execution to prevent crashes and BSON cast injection.

### Mass Assignment & Privilege Escalation Defense
- Database mutation endpoints explicitly whitelist permitted fields.
- `req.body.role`, `req.body.isActive`, `req.body.status`, and verification states cannot be updated by public requests.
- Public registration strictly binds users to `student`. Administrative assignment requires direct database seeding or elevated administrator action.

---

## 3. Input Validation & Injection Defenses

### NoSQL Injection Protection
- Custom `sanitizeInput` middleware recursively strips all object keys prefixed with `$` (such as `$gt`, `$ne`, `$where`, `$regex`) and dot notation (`.`) from `req.body`, `req.query`, and `req.params`.
- Database queries use strictly typed parameter binding instead of passing raw objects to Mongoose selectors.

### Cross-Site Scripting (XSS)
- React frontend natively escapes rendered string variables in JSX.
- Raw HTML rendering (`dangerouslySetInnerHTML`) is strictly disallowed.
- Server response headers include `X-XSS-Protection: 0` (modern standard per CSP recommendation) with strict Content Security Policy.

### Security HTTP Headers
Configured via `helmet` in `backend/server.js`:
- `Content-Security-Policy`:
  - `default-src 'self'`
  - `script-src 'self'`
  - `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com`
  - `font-src 'self' https://fonts.gstatic.com`
  - `img-src 'self' data: blob:`
  - `frame-ancestors 'none'` (anti-clickjacking)
- `Strict-Transport-Security (HSTS)`: `max-age=31536000; includeSubDomains; preload` (enforced in production).
- `X-Content-Type-Options`: `nosniff`.
- `Referrer-Policy`: `strict-origin-when-cross-origin`.
- `X-Frame-Options`: `DENY`.

---

## 4. File Upload & Storage Security

### Multi-Layer Upload Defense
File uploads (`POST /api/upload`) enforce four layers of verification:
1. **MIME Type Allowlist**: Strictly limited to `image/jpeg`, `image/png`, `image/webp`, and `image/gif`. Vector graphics (`image/svg+xml`) are blocked to eliminate Stored XSS risks.
2. **Safe Extension Mapping**: Client filenames are never used for disk storage. Extensions are derived directly from the verified MIME type (e.g. `.png`, `.jpg`).
3. **Magic Bytes Binary Inspection**: The server reads the initial binary bytes of uploaded files to verify actual format headers:
   - JPEG: `FF D8 FF`
   - PNG: `89 50 4E 47 0D 0A 1A 0A`
   - GIF: `47 49 46 38`
   - WEBP: `52 49 46 46` ... `57 45 42 50`
   Any file whose content mismatches its claimed header is rejected with `400 Bad Request`.
4. **Size & Path Traversal Guards**:
   - Maximum upload size is strictly capped at 5 MB.
   - Filenames are generated using cryptographic UUIDs (`crypto.randomUUID()`).
   - File deletion endpoints check filenames against `SAFE_FILENAME_REGEX` (`/^[a-zA-Z0-9_\-\.]+$/`) and ensure resolved paths remain inside the target upload directory.

---

## 5. Verification Code & Handover Security

### Fast Return Verification Lifecycle
- **Code Generation**: Codes are generated via cryptographically secure random values (e.g., `CL-XXXXXX`).
- **Storage**: Stored alongside expiration timestamps (default: 48 hours).
- **Anti-Brute Force**: Attempt counters track incorrect entries (maximum 5 attempts). Once exceeded, code verification is locked.
- **Replay Protection**:
  - Once verified, the return record enters `HANDOVER_PENDING` and code verification is deactivated.
  - Subsequent verification attempts on already verified or completed returns are rejected with `400 Bad Request`.
- **Role Verification**:
  - The item owner cannot verify their own return code (only the finder or staff custodian can verify the code).
  - The item owner cannot confirm handover delivery (custodian confirms physical transfer, owner confirms final receipt).

---

## 6. Rate Limiting & Abuse Prevention

Configured via `express-rate-limit`:
- **Global API Limiter**: 100 requests per 15 minutes per IP.
- **Authentication Limiter**: 15 requests per 15 minutes (applied to `/api/auth/login`, `/api/auth/register`).
- **Password Reset Limiter**: 5 requests per 15 minutes.
- **Verification Limiter**: 10 code checks per 15 minutes.
- **Upload Limiter**: 20 uploads per 15 minutes.
- **Admin Action Limiter**: 60 requests per 15 minutes.

---

## 7. Audit Logging & Security Event Monitoring

### Audit Trail
- Administrative actions (claim approvals/rejections, user suspensions, role changes, return verifications) are recorded in the `AuditLog` collection.
- Logs capture: `actorId`, `actorRole`, `action`, `targetType`, `targetId`, `ipAddress`, `userAgent`, and `metadata`.
- **Sensitive Data Redaction**: An automated redaction filter recursively scrubs passwords, hashes, tokens, verification codes, and authorization secrets before persistence.
- **Immutability**: Audit logs cannot be modified or deleted via any public or administrative API.

---

## 8. Incident Response Basics

1. **Suspected Account Compromise**:
   - Immediate administrative account suspension via `PATCH /api/admin/users/:id/status` (sets `isActive: false`, `status: 'SUSPENDED'`).
   - Invalidate all active refresh tokens for the account.
2. **Secret Leakage (JWT / DB Credentials)**:
   - Revoke and regenerate `JWT_SECRET` and `JWT_REFRESH_SECRET` in environment variables.
   - Restart backend instances (invalidates all active sessions globally).
   - Rotate database credentials and update connection strings.
3. **Malicious File Upload Detection**:
   - Identify file identifier from audit logs.
   - Remove file from `uploads/` directory.
   - Delete corresponding reference in `Item` or `Claim` document.

---

## 9. Production Security Checklist

| Check | Item | Status | Verification Note |
| :---: | :--- | :---: | :--- |
| [x] | **HTTPS Configured** | Verified | Enforced via HSTS headers and TLS documentation |
| [x] | **Secure Cookies** | Verified | `HttpOnly`, `Secure: true` in production, `SameSite: lax` |
| [x] | **CORS Restricted** | Verified | Origin validation against `CLIENT_URL` with explicit methods |
| [x] | **Security Headers** | Verified | Full Helmet configuration with CSP, HSTS, X-Content-Type |
| [x] | **Rate Limiting Active** | Verified | Auth, upload, verification, and admin rate limiters active |
| [x] | **Database Secured** | Verified | Auth-enabled connection string, least-privilege DB user |
| [x] | **Secrets Protected** | Verified | `.env` git-ignored, high-entropy secrets validated at startup |
| [x] | **Debug Disabled** | Verified | Production error handler masks internal stack traces |
| [x] | **Error Responses Sanitized** | Verified | Standardized `{ success: false, message, code }` schema |
| [x] | **File Uploads Secured** | Verified | Magic bytes verified, SVG blocked, UUID filenames, 5MB limit |
| [x] | **Authentication Hardened** | Verified | Bcrypt 12 rounds, HS256 algorithm enforcement, 15m expiration |
| [x] | **Authorization Verified** | Verified | IDOR/BOLA checks on items, claims, returns, and profiles |
| [x] | **Admin Panel Protected** | Verified | RBAC role middleware, self-suspension guard, rate limiting |
| [x] | **Audit Logs Protected** | Verified | Redacted sensitive keys, immutable database logs |
| [x] | **Verification Codes Secured** | Verified | One-time use, attempt counters, replay protection |
| [x] | **Private Evidence Protected** | Verified | Only visible to authorized claimant and administrative staff |
| [x] | **Dependencies Audited** | Verified | Verified with zero critical/high vulnerabilities |
| [x] | **Data Privacy Enforced** | Verified | Public items strip reporter contact & private identifying marks |
