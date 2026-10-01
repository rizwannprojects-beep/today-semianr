# Campus Lost & Found — REST API Specification (v1)

## 1. Response Standard

All endpoints return a uniform JSON envelope format:

### Success Response
```json
{
  "success": true,
  "message": "Resource retrieved successfully",
  "data": { ... },
  "meta": null,
  "error": null
}
```

### Paginated Response
```json
{
  "success": true,
  "message": "Items retrieved successfully",
  "data": [ ... ],
  "meta": {
    "pagination": {
      "page": 1,
      "limit": 12,
      "totalItems": 48,
      "totalPages": 4
    }
  },
  "error": null
}
```

### Error Response
```json
{
  "success": false,
  "message": "Detailed error summary",
  "data": null,
  "error": {
    "statusCode": 400,
    "details": [ ... ]
  }
}
```

---

## 2. API Endpoints Catalog

### 2.1 Health & Diagnostics
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/v1/health` | Public | System uptime, environment, and MongoDB connection status |

### 2.2 Authentication (`/api/v1/auth`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/v1/auth/register` | Public (Rate-limited) | Register a student account with academic fields |
| `POST` | `/api/v1/auth/login` | Public (Rate-limited) | Authenticate user, issue access token & refresh cookie |
| `POST` | `/api/v1/auth/refresh` | Public | Issue new access token using valid refresh cookie |
| `POST` | `/api/v1/auth/logout` | Public | Invalidate and clear refresh token cookie |
| `GET` | `/api/v1/auth/me` | Authenticated | Retrieve current user profile and session data |

### 2.3 Lost Items (`/api/v1/lost-items`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/v1/lost-items` | Public | Paginated list with category, status, and text search |
| `GET` | `/api/v1/lost-items/:id` | Public | Detailed view of a single lost report |
| `POST` | `/api/v1/lost-items` | Authenticated | File a new lost item report |
| `GET` | `/api/v1/lost-items/my` | Authenticated | Retrieve items reported missing by current user |

### 2.4 Found Items (`/api/v1/found-items`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/v1/found-items` | Public | Paginated catalog with category, status, and text search |
| `GET` | `/api/v1/found-items/:id` | Public | Detailed view of a single turned-in found item |
| `POST` | `/api/v1/found-items` | Authenticated | File report for an item turned into a campus desk |
| `GET` | `/api/v1/found-items/my` | Authenticated | Retrieve items turned in by current user |

### 2.5 Claims (`/api/v1/claims`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/v1/claims/my` | Authenticated | List all ownership verification claims filed by user |
| `POST` | `/api/v1/claims` | Authenticated | Submit an ownership claim with identifying proof |

### 2.6 Matches (`/api/v1/matches`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/v1/matches` | Authenticated | List algorithmically detected matches for user's reports |

### 2.7 Notifications (`/api/v1/notifications`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/v1/notifications` | Authenticated | Fetch notifications and unread counter |
| `PATCH`| `/api/v1/notifications/:id/read` | Authenticated | Mark a notification as read |

### 2.8 Student Profiles (`/api/v1/users`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/v1/users/profile` | Authenticated | Fetch active user's academic and contact details |
| `PATCH`| `/api/v1/users/profile` | Authenticated | Update editable profile attributes |

### 2.9 Admin Panel (`/api/v1/admin`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/v1/admin/stats` | Admin Only | High-level system statistics (users, items, claims) |
| `GET` | `/api/v1/admin/audit-logs` | Admin Only | Paginated immutable audit trail |
| `GET` | `/api/v1/admin/users` | Admin Only | List registered campus users |
