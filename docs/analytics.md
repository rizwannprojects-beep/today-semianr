# Campus Lost & Found System — Analytics & Reporting Engine Specification

> **Phase 9 Reference Specification**  
> **Document Status**: Production Baseline  
> **Scope**: Metrics, Aggregation Logic, Timezone Conventions, Data Inclusions & Privacy Controls

---

## 1. Timezone Handling & Date Processing

### Timezone Strategy
- **Database Storage**: All entity timestamps (`createdAt`, `updatedAt`, `reviewedAt`, `completedAt`, `dateLost`, `dateFound`) are stored in strict **UTC (Coordinated Universal Time)** format via ISO 8601 strings in MongoDB.
- **Reporting Boundaries**:
  - Daily interval buckets group records from `00:00:00.000Z` to `23:59:59.999Z`.
  - Date range filters (`today`, `yesterday`, `thisMonth`, etc.) compute the local midnight boundary and convert to UTC for database queries.
  - Custom ranges (`startDate`, `endDate`) pad the end date to `23:59:59.999Z` if no specific time component is supplied by the administrator.
- **Previous Period Comparison**:
  - The previous equivalent period is computed dynamically based on the exact millisecond duration `durationMs = endDate - startDate`.
  - `prevEnd = startDate - 1ms`
  - `prevStart = prevEnd - durationMs`
  - This ensures day-for-day and week-for-week symmetry.

---

## 2. Core Operational Metrics Definitions

### 2.1 Campus Recovery Rate
- **Definition**: The proportion of active lost and found property cases that successfully achieve verified owner return.
- **Formula**:
  $$\text{Recovery Rate} = \left( \frac{\text{Returned Items}}{\text{Eligible Cases}} \right) \times 100$$
  where:
  - $\text{Eligible Cases} = \text{Active Cases} + \text{Resolved/Returned Cases}$
- **Data Sources**: `Item` collection (`status`), `Return` collection (`status`).
- **Included Records**:
  - Active: Items with status in `['active', 'ACTIVE', 'claimed', 'CLAIMED', 'underReview', 'claimPending', 'matched', 'MATCH_FOUND']`.
  - Returned: Items with status in `['returned', 'RETURNED', 'resolved', 'RESOLVED']`, or completed returns (`status === 'RETURNED'`).
- **Excluded Records**:
  - Cancelled reports, expired reports, drafts, or items deleted prior to audit period.
- **Division-by-Zero Handling**: Returns `0%` if eligible cases count is 0.

---

### 2.2 Lost vs. Found Ratio
- **Definition**: The numerical relationship between lost property reports filed by students and found property items turned into custody.
- **Formula**:
  $$\text{Lost-to-Found Ratio} = \frac{\text{Total Lost Reports}}{\text{Total Found Reports}} : 1$$
- **Data Source**: `Item` collection (`type: 'lost' | 'found'`).
- **Included Records**: All items created within the queried window.
- **Excluded Records**: None.
- **Division-by-Zero Handling**: Displays `'N/A'` if found items count is 0, avoiding runtime arithmetic errors.

---

### 2.3 Photographic Verification Rate
- **Definition**: The percentage of incident reports containing at least one photographic asset.
- **Formula**:
  $$\text{Photo Attachment Rate} = \left( \frac{\text{Items with } \text{images.length} > 0}{\text{Total Items}} \right) \times 100$$
- **Data Source**: `Item.images`.
- **Included Records**: All items in audit window.

---

### 2.4 Claim Approval & Rejection Rates
- **Definition**:
  - **Approval Rate**: The percentage of adjudicated claims that resulted in administrative approval for physical handover.
  - **Rejection Rate**: The percentage of adjudicated claims rejected due to fraudulent proof, contradictory marks, or unverified ownership.
  - **Completion Rate**: The percentage of all submitted claims that successfully completed physical return handover.
- **Formulas**:
  $$\text{Approval Rate} = \left( \frac{\text{Approved} + \text{Completed}}{\text{Approved} + \text{Rejected} + \text{Completed}} \right) \times 100$$
  $$\text{Rejection Rate} = \left( \frac{\text{Rejected}}{\text{Approved} + \text{Rejected} + \text{Completed}} \right) \times 100$$
  $$\text{Completion Rate} = \left( \frac{\text{Completed}}{\text{Total Filed Claims}} \right) \times 100$$
- **Data Source**: `Claim` collection (`status`).
- **Included Records**: Claims with terminal statuses (`APPROVED`, `REJECTED`, `COMPLETED`).
- **Excluded Records**: Pending claims or claims under active inquiry (`MORE_INFO_REQUIRED`) are excluded from approval/rejection denominators to prevent artificial deflation.

---

### 2.5 Average Claim Processing Time
- **Definition**: The average elapsed duration between student claim submission and administrative review decision.
- **Formula**:
  $$\text{Average Processing Hours} = \frac{1}{N} \sum_{i=1}^{N} \left( \frac{\text{reviewedAt}_i - \text{createdAt}_i}{3600000} \right)$$
- **Data Source**: `Claim.createdAt`, `Claim.reviewedAt`.
- **Included Records**: Claims where `reviewedAt` is populated and `reviewedAt >= createdAt`.
- **Excluded Records**: Claims currently awaiting initial staff review.

---

### 2.6 Smart Matching Engine Confidence Tiers
- **Definition**: Categorization of algorithmically paired lost-found records into distinct confidence tiers.
- **Tiers**:
  - **High Confidence**: Match score $\ge 80\%$ or `matchLevel === 'HIGH_POSSIBILITY'`.
  - **Possible Match**: $50\% \le \text{Match score} < 80\%$ or `matchLevel === 'POSSIBLE'`.
  - **Low Confidence**: Match score $< 50\%$ or `matchLevel === 'LOW_POSSIBILITY'`.
- **Formula**:
  $$\text{Verification Rate} = \left( \frac{\text{Verified Matches} + \text{Resolved Matches}}{\text{Total Generated Matches}} \right) \times 100$$
- **Data Source**: `Match` collection (`matchScore`, `matchLevel`, `status`).

---

### 2.7 Return Handover Completion Duration
- **Definition**: The average time elapsed from initial return record creation (claim approved) to physical owner receipt confirmation.
- **Formula**:
  $$\text{Average Handover Hours} = \frac{1}{M} \sum_{j=1}^{M} \left( \frac{\text{completedAt}_j - \text{createdAt}_j}{3600000} \right)$$
- **Data Source**: `Return.createdAt`, `Return.completedAt`.
- **Included Records**: Returns with status `RETURNED` or where `completedAt` is recorded.
- **Excluded Records**: Scheduled appointments pending physical meeting.

---

## 3. Categorical & Spatial Aggregation

### 3.1 Item Categories
- Aggregates report counts across institutional item categories (Electronics, Wallets, Bags, ID Cards, Keys, Books, etc.).
- Computes category-specific recovery rates:
  $$\text{Category Recovery Rate} = \left( \frac{\text{Returned in Category}}{\text{Total in Category}} \right) \times 100$$

### 3.2 Campus Spatial Normalization
- Free-text location inputs are mapped through the institutional campus ontology (`CANONICAL_CAMPUS_LOCATIONS`):
  - `"Library"`, `"Main Library"`, `"College Library"` $\rightarrow$ `"Central Library"`
  - `"Cafeteria"`, `"Canteen"`, `"SAC"` $\rightarrow$ `"Student Activity Center / Cafeteria"`
  - `"Gym"`, `"Gymnasium"` $\rightarrow$ `"Sports Complex & Gymnasium"`
  - `"Security Office"`, `"Admin Desk"` $\rightarrow$ `"Administration & Security Desk"`

---

## 4. Privacy & Demographic Safeguards

### 4.1 Department & Academic Year Reporting
- **Suppression of Student Identifiers**: Individual student names, register numbers, email addresses, and phone numbers are strictly excluded from all analytical responses.
- **Minimum Count Threshold**: Department counts below 1 are omitted from listings.
- **Aggregate Academic Years**: Segmented strictly by year cohorts (1st Year, 2nd Year, 3rd Year, 4th Year, Postgraduate) without granular class divisions.

---

## 5. Security & Export Architecture

### 5.1 OWASP CSV Formula Injection Defense
- When generating CSV exports (`/api/admin/analytics/export`), all cell values are scrutinized.
- If any cell begins with formula characters (`=`, `+`, `-`, `@`, `\t`, `\r`), it is neutralized by prefixing an apostrophe (`'`) and enclosing in standard CSV escaped quotes.
- This prevents execution of DDE formulas or macro exploits in spreadsheet software (Microsoft Excel, LibreOffice, Apple Numbers, Google Sheets).

### 5.2 Access Control & Rate Limiting
- **Authentication**: Strict JWT authentication header requirement.
- **Role Enforcement**: Limited to `admin`, `superadmin`, and authorized `staff`.
- **Throttling**: Bound to `analyticsLimiter` (maximum 60 analytics queries per 15-minute window in production) to mitigate denial-of-service risks against database aggregation engines.
