# Campus Lost & Found — Database Architecture & Schema Design

## 1. Overview
The database layer is constructed with **MongoDB** and **Mongoose ODM**. It provides strict schema validation, timestamp auditing, normalized references, and high-performance search indexes designed to scale efficiently.

---

## 2. Entity Relationship Model

```
       +--------------------+
       |        User        |
       +---------+----------+
                 |
        +--------+--------+---------------+----------------+
        |                 |               |                |
        v (1:N)           v (1:N)         v (1:N)          v (1:N)
 +-------------+   +-------------+   +---------+   +--------------+
 |  LostItem   |   |  FoundItem  |   |  Claim  |   | Notification |
 +------+------+   +------+------+   +----+----+   +--------------+
        |                 |               |
        |                 +---------------+
        |                 | (1:N)
        +--------+--------+
                 |
                 v (N:M)
           +-----------+
           |   Match   |
           +-----------+
```

---

## 3. Detailed Schema Definitions

### 3.1 User (`User.js`)
Stores authenticated accounts across campus roles.
- `name`: String, required, trimmed, max 100
- `email`: String, required, unique, lowercase, trimmed, regex validated
- `phone`: String, optional, max 20 (protected)
- `passwordHash`: String, select: false, bcrypt-hashed
- `role`: String enum (`student`, `admin`), default: `student`
- `registerNumber`: String, sparse index, unique, uppercase
- `department`: String, max 100
- `course`: String, max 100
- `year`: Number (1–6)
- `semester`: Number (1–12)
- `classDivision`: String, max 10
- `profilePhoto`: String (URL)
- `accountStatus`: String enum (`active`, `suspended`, `pending`, `deactivated`), default: `active`
- `emailVerified`: Boolean, default: false
- `phoneVerified`: Boolean, default: false
- `lastLoginAt`: Date
- `timestamps`: true (`createdAt`, `updatedAt`)

**Indexes:**
- `{ email: 1 }` (unique)
- `{ registerNumber: 1 }` (sparse, unique)
- `{ role: 1, accountStatus: 1 }`

---

### 3.2 LostItem (`LostItem.js`)
Items reported missing by students or staff.
- `reporter`: ObjectId (ref: `User`), required
- `itemName`: String, required, trimmed, max 120
- `category`: String enum (`Electronics`, `Books & Stationery`, `ID Cards & Documents`, `Wallets & Bags`, `Keys`, `Clothing & Accessories`, `Bottles & Lunchboxes`, `Sports Equipment`, `Jewelry & Watches`, `Other`)
- `description`: String, required, max 2000
- `images`: Array of Strings (URLs)
- `lostDate`: Date, required
- `lostLocation`: String, required, max 200
- `identifyingDetails`: String, private verification hints, max 1000
- `status`: String enum (`open`, `matched`, `claimed`, `resolved`, `closed`), default: `open`
- `contactPreference`: String enum (`in_app`, `email`, `phone`), default: `in_app`
- `timestamps`: true

**Indexes:**
- Compound: `{ status: 1, category: 1, lostDate: -1 }`
- Compound: `{ reporter: 1, createdAt: -1 }`
- Full-Text: `{ itemName: 'text', description: 'text', lostLocation: 'text' }` (Weights: itemName: 10, lostLocation: 5, description: 2)

---

### 3.3 FoundItem (`FoundItem.js`)
Items turned in or discovered on campus grounds.
- `reporter`: ObjectId (ref: `User`), required
- `itemName`: String, required, trimmed, max 120
- `category`: String enum (same as LostItem)
- `description`: String, required, max 2000
- `images`: Array of Strings
- `foundDate`: Date, required
- `foundLocation`: String, required, max 200
- `identifyingDetails`: String, confidential details for verification
- `status`: String enum (`available`, `claim_pending`, `verified`, `returned`, `disposed`), default: `available`
- `storageLocation`: String, campus custody desk (e.g. `Security Desk - Main Gate`)
- `timestamps`: true

**Indexes:**
- Compound: `{ status: 1, category: 1, foundDate: -1 }`
- Compound: `{ reporter: 1, createdAt: -1 }`
- Full-Text: `{ itemName: 'text', description: 'text', foundLocation: 'text' }`

---

### 3.4 Claim (`Claim.js`)
Ownership claims submitted against found items.
- `foundItem`: ObjectId (ref: `FoundItem`), required
- `claimant`: ObjectId (ref: `User`), required
- `proofDetails`: String, required, max 3000
- `proofImages`: Array of Strings
- `verificationStatus`: String enum (`pending`, `under_review`, `approved`, `rejected`, `cancelled`), default: `pending`
- `reviewedBy`: ObjectId (ref: `User`), default: null
- `reviewedAt`: Date
- `rejectionReason`: String, default: null
- `handoverDate`: Date
- `timestamps`: true

**Indexes:**
- Compound: `{ foundItem: 1, claimant: 1 }`
- Compound: `{ verificationStatus: 1, createdAt: -1 }`
- Compound: `{ claimant: 1, createdAt: -1 }`

---

### 3.5 Match (`Match.js`)
Algorithmic or rule-based match correlations between lost and found reports.
- `lostItem`: ObjectId (ref: `LostItem`), required
- `foundItem`: ObjectId (ref: `FoundItem`), required
- `matchingScore`: Number (0–100), required
- `matchingFactors`: Object (`categoryMatch`, `titleSimilarity`, `locationProximity`, `dateProximityDays`, `notes`)
- `status`: String enum (`suggested`, `notified`, `confirmed`, `dismissed`), default: `suggested`
- `timestamps`: true

**Indexes:**
- Unique Compound: `{ lostItem: 1, foundItem: 1 }` (prevents duplicate match pairs)
- Compound: `{ status: 1, matchingScore: -1 }`

---

### 3.6 Notification (`Notification.js`)
High-priority alerts for students regarding their items and claims.
- `user`: ObjectId (ref: `User`), required
- `type`: String enum (`match_found`, `claim_received`, `claim_approved`, `claim_rejected`, `item_status_change`, `admin_alert`, `system_broadcast`)
- `title`: String, required, max 150
- `message`: String, required, max 1000
- `read`: Boolean, default: false
- `readAt`: Date
- `relatedEntity`: String enum (`LostItem`, `FoundItem`, `Claim`, `Match`, `User`, null)
- `relatedId`: ObjectId
- `timestamps`: true

**Indexes:**
- Compound: `{ user: 1, read: 1, createdAt: -1 }`

---

### 3.7 AuditLog (`AuditLog.js`)
Immutable trail tracking critical administrative and security events.
- `actor`: ObjectId (ref: `User`), default: null
- `actorEmail`: String, default: 'system'
- `action`: String, required (e.g. `USER_REGISTERED`, `USER_LOGIN`, `CLAIM_APPROVED`)
- `entity`: String, required (e.g. `User`, `Claim`, `FoundItem`)
- `entityId`: String
- `metadata`: Mixed Object
- `ipAddress`: String
- `userAgent`: String
- `timestamps`: true

**Indexes:**
- Compound: `{ action: 1, createdAt: -1 }`
- Compound: `{ entity: 1, entityId: 1 }`
- Compound: `{ actor: 1, createdAt: -1 }`
