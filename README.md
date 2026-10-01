# Campus Lost & Found System

> **Enterprise-Grade Campus Property Recovery, Ownership Verification & Administration Platform**  
> Built for university campuses to streamline lost item recovery, automate matching, verify ownership claims, manage secure returns, and provide administrative auditing and analytics.

---

## 1. Project Purpose & Overview

On college and university campuses, thousands of personal belongings—laptops, calculators, student IDs, keys, wallets, and textbooks—are misplaced each semester. Traditional physical lost-and-found desks suffer from fragmented logs, lack of verification, false claims, and poor student visibility.

The **Campus Lost & Found System** provides a centralized, secure, and intuitive web platform that connects students who lost items with students or staff who found them. It features an algorithmic multi-factor matching engine, a cryptographic two-party return verification workflow, role-based administrative moderation, privacy-preserving notification streams, and real-time operational analytics.

---

## 2. Key Features

- **Student Authentication & RBAC**: Secure JWT-based authentication with student ID validation, profile editing, and password recovery.
- **Lost & Found Reporting**: Fast reporting forms with image uploads, location selection, category tagging, and date boundaries.
- **Smart Matching Engine**: Automatic correlation comparing keywords, categories, brands, colors, and locations with human-readable match explanations and confidence tiers.
- **Ownership Verification & Claims**: Structured multi-step claim workflow where claimants submit identifying marks and evidence without exposing sensitive details to the public.
- **Secure Returns & Handover**: Two-party physical pickup coordination with single-use verification codes, attempt counters, and dispute handling.
- **Notification & Communication System**: Complete notification center with category filtering (Claims, Matches, Returns, Announcements, Security), priority badges, mark-all-read, unread badge counters, and email notifications.
- **Notification Preferences (`/settings/notifications`)**: User-controlled toggles for email and in-app alerts, with non-disableable security alert locks.
- **Campus Announcements**: Administrative announcement broadcasting with audience targeting (All Students, Department, Year) and scheduled publication.
- **Administrative Command Center**: Comprehensive control for security officers and desk managers—moderate items, adjudicate claims, inspect competing claims, review disputes, manage users, and inspect security events.
- **Analytics & Reporting**: Real-time recovery rates, category trends, location hotspots, resolution times, and formula-injection-safe CSV data exports.
- **Audit Logging**: Immutable, append-only audit trail logging all security, moderation, and handover events.

---

## 3. Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, Vite, Tailwind CSS v4, React Router v7, Axios, Lucide React Icons |
| **Backend** | Node.js (ES Modules), Express.js (v4.21), RESTful Architecture |
| **Database** | MongoDB with Mongoose 8 ODM (supports MongoDB Atlas and local instances) |
| **Authentication** | JSON Web Tokens (`jsonwebtoken`), `bcryptjs` (cost factor 12), Role-Based Access Control |
| **Security & Privacy** | `helmet`, `cors`, `express-rate-limit`, `express-validator`, NoSQL injection sanitizers, XSS mitigation, OWASP CSV defense |
| **File Storage** | Multer with disk storage, magic bytes signature validation, and UUID filenames |
| **Testing** | Modular Node.js native test runners across all 10 project phases |

---

## 4. System Architecture

The application adopts a layered, modular client-server architecture:

```
[ Client: React + Vite + Tailwind CSS ]
                  │
                  ▼ HTTPS / JSON REST
[ Express API Gateway & Security Perimeter ]
  ├─ Helmet Headers (CSP, HSTS, X-Frame-Options)
  ├─ CORS & Rate Limiters (Global, Auth, Analytics)
  ├─ Input Sanitizer (NoSQL $ and . key stripping)
  └─ JWT & RBAC Middleware
                  │
                  ▼
[ Route Handlers & Controllers ]
  ├─ AuthController, LostItemController, FoundItemController
  ├─ ClaimController, ReturnController, NotificationController
  ├─ AdminController, AnalyticsController
                  │
                  ▼
[ Domain Services Layer ]
  ├─ MatchingService (Multi-attribute scoring algorithm)
  ├─ NotificationService (Preference checks, deduplication, reminders)
  ├─ EmailService (Template renderer, duplicate suppressor)
  ├─ AuditService (Immutable event recorder)
  └─ AnalyticsService (Aggregation pipelines & date-range math)
                  │
                  ▼
[ Database Layer: MongoDB (Mongoose 8 ODM) ]
```

---

## 5. Main Modules & Directory Structure

```
├── backend/
│   ├── config/               # Database connection and environment config
│   ├── controllers/          # HTTP request handlers for all domains
│   ├── middleware/           # Auth, role guards, validation, rate limiting, sanitization
│   ├── models/               # 11 Mongoose database models
│   ├── routes/               # API route definitions
│   ├── scripts/              # Administrative initialization and demo data seeding
│   ├── services/             # Core business logic: matching, audit, notifications, email, analytics
│   ├── test*.js              # Automated test suites for all phases
│   ├── uploads/              # Validated uploaded item images
│   ├── utils/                # Constants, API response wrappers, helpers
│   ├── server.js             # Express application entrypoint
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/       # Buttons, cards, badges, inputs, modals, navbar
│   │   ├── context/          # AuthContext for reactive session management
│   │   ├── hooks/            # Custom React hooks (useAuth)
│   │   ├── layouts/          # MainLayout (public) and DashboardLayout (sidebar)
│   │   ├── pages/            # Student and Admin pages
│   │   │   ├── admin/        # Admin dashboard, items, claims, disputes, announcements, analytics
│   │   │   └── ...           # Dashboard, Browse, Report, Claims, Matches, Returns, Notifications
│   │   ├── routes/           # AppRoutes route table with guards
│   │   ├── services/         # Axios API clients
│   │   ├── utils/            # Category lists, status constants, formatters
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── vite.config.js
│   └── package.json
│
├── docs/                     # Architectural, database, and analytics documentation
├── README.md                 # Project overview and setup guide
└── SECURITY.md               # Security baseline and threat model
```

---

## 6. Database Models

The system defines 11 specialized Mongoose schemas:

1. **`User`** — Student and administrator identities, hashed credentials, department, academic year, and status.
2. **`Item`** — Unified base item document for polymorphic queries and cross-type indexes.
3. **`LostItem`** — Detailed lost item reports with incident dates and search vectors.
4. **`FoundItem`** — Turned-in items with secure physical storage locations.
5. **`Claim`** — Ownership claims, proof descriptions, attached evidence, and review status.
6. **`Match`** — Algorithmic similarity scores, breakdown factors, and user view/dismiss state.
7. **`Return`** — Handover coordination, scheduled appointments, single-use verification codes, attempt counters, and receipts.
8. **`Notification`** — User alerts, priorities, category types, read states, and deduplication keys.
9. **`NotificationPreference`** — Per-user notification toggles across in-app and email channels.
10. **`Announcement`** — Campus-wide broadcasts with audience filters and scheduling.
11. **`AuditLog`** — Immutable operational audit log records.

---

## 7. Authentication & Access Control

- **Password Security**: Bcrypt with cost factor 12. Password fields use `select: false` to prevent accidental exposure.
- **Token Security**: Dual-token architecture using short-lived JWT access tokens (15m) and long-lived refresh tokens (7d).
- **Role-Based Guards**: Two primary roles: `student` and `admin`.
- **IDOR / BOLA Defenses**: Every resource mutation verifies object ownership (`resource.userId === req.user._id`).
- **Account State Verification**: Suspended accounts are immediately blocked from executing actions via session middleware.

---

## 8. Security & Privacy Guarantees

- **Zero Secrets in Notifications**: Passwords, tokens, and single-use return verification codes are never included in notification bodies or email messages.
- **Privacy Shield on Public Feeds**: Private identifying marks and finder/reporter contact details are scrubbed from public item listings.
- **File Upload Hardening**: Strictly validates MIME types and binary magic bytes (PNG, JPEG, WEBP). Blocks SVG vectors to prevent stored XSS.
- **NoSQL Injection Neutralization**: Strips `$` and `.` operators from incoming request payloads.
- **OWASP CSV Formula Defense**: Prepends leading single quotes (`'`) to cells starting with `=`, `+`, `-`, or `@` during CSV exports.

---

## 9. Administrative Command Center

Staff and administrators have dedicated access to `/admin` routes:
- **Dashboard**: High-level platform health, pending review queues, and quick moderation actions.
- **Item Moderation**: Flag, hide, or restore reported items violating university guidelines.
- **Claim Adjudication**: Inspect ownership proof dossiers, compare competing claims, request more information, approve, or reject with recorded reasons.
- **Return & Dispute Management**: Monitor handover appointments, oversee return disputes, and record official resolutions.
- **Announcements**: Draft, schedule, target, and publish campus-wide announcements.
- **Audit Logs**: Filterable, read-only system audit log stream.
- **Security Events**: Real-time security alert monitoring.

---

## 10. Analytics & Reporting Engine

The analytics suite (`/admin/analytics`) aggregates live database metrics:
- **Key Metrics**: Total Lost, Total Found, Recovery Rate, Active Claims, Completed Returns.
- **Category & Location Hotspots**: Top missing categories (Electronics, Wallets, IDs) and high-incident campus buildings.
- **Period Trend Comparisons**: Comparison against prior period baselines with percentage variance.
- **Privacy-Safe Department Metrics**: Aggregate totals only; student PII is stripped.
- **Export Options**: Export Items, Claims, and Returns to CSV with executive summary rows.

---

## 11. Installation & Setup

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **MongoDB**: Local MongoDB instance (`mongodb://127.0.0.1:27017`) or MongoDB Atlas URI

### Installation Steps

1. **Clone or navigate to the project directory**:
   ```bash
   cd "c:/Users/rizwa/OneDrive/Desktop/new mini"
   ```

2. **Install Backend Dependencies**:
   ```bash
   cd backend
   npm install
   ```

3. **Install Frontend Dependencies**:
   ```bash
   cd ../frontend
   npm install
   ```

---

## 12. Environment Variables

Create `.env` in the `backend/` directory:

```ini
PORT=5001
NODE_ENV=development
MONGO_URI=mongodb://127.0.0.1:27017/campus_lost_and_found
JWT_ACCESS_SECRET=your_super_secret_access_key_replace_in_prod
JWT_REFRESH_SECRET=your_super_secret_refresh_key_replace_in_prod
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173

# Optional: Email Notifications (Falls back to LOG_ONLY mode if omitted)
# SMTP_HOST=smtp.mailtrap.io
# SMTP_PORT=2525
# SMTP_USER=your_user
# SMTP_PASS=your_password
# EMAIL_FROM="Campus Lost & Found <noreply@campus.edu>"
```

Create `.env` in the `frontend/` directory:

```ini
VITE_API_BASE_URL=http://localhost:5001/api
```

---

## 13. Running the Application

### Start the Backend Server:
```bash
cd backend
npm start
# Server listens on http://localhost:5001
# Health check: http://localhost:5001/api/health
```

### Start the Frontend Client:
```bash
cd frontend
npm run dev
# Vite client starts on http://localhost:5173
```

### Optional: Provision Demo Accounts & Data:
```bash
cd backend
node scripts/seedDemoData.js
# Creates demo student accounts and sample items for presentation
# To clean up later: node scripts/seedDemoData.js --clean
```

---

## 14. Testing & Verification

The project includes automated regression test suites covering every phase:

```bash
cd backend

# Run Core Models Validation
node testModels.js

# Run API Security & Routing Suite (32 tests)
node testApi.js

# Run Lost & Found Reporting Suite (20 tests)
node testPhase4Workflow.js

# Run Smart Matching & Claims Verification Suite (30 tests)
node testPhase5Workflow.js

# Run Returns, Handover & Verification Suite (27 tests)
node testPhase6Workflow.js

# Run Admin Control Center & Audit Suite (38 tests)
node testPhase7Workflow.js

# Run Security Hardening & Threat Defense Suite (38 tests)
node testSecurityHardening.js

# Run Analytics, Reporting & CSV Export Suite (24 tests)
node testAnalytics.js

# Run Notifications, Preferences & Announcements Suite (28 tests)
node testPhase10Workflow.js
```

---

## 15. Production Build

To build the frontend for production deployment:

```bash
cd frontend
npm run build
```

The compiled, minified bundle will be output to `frontend/dist/`.

---

## 16. Security Auditing

Run security vulnerability audit across dependencies:

```bash
# In backend:
cd backend && npm audit

# In frontend:
cd frontend && npm audit
```

Both packages maintain **0 vulnerabilities**.

---

## 17. License & Compliance

Designed and developed for academic campus deployment under institutional policies. All personal identifying data is handled in compliance with student privacy regulations.
