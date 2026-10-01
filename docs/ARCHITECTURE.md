# Campus Lost & Found System Architecture

## 1. Overview
The **Campus Lost & Found** application is a production-oriented, scalable platform built specifically for college campuses. It facilitates reporting, tracking, matching, verifying ownership, and securely returning lost and found items among students, faculty, and campus security personnel.

---

## 2. System Architecture Layers

```
                      +-----------------------------+
                      |   React 19 + Vite Frontend  |
                      |  (Tailwind v4, React Router)|
                      +--------------+--------------+
                                     |
                                     | HTTP/REST (JSON)
                                     v
                      +-----------------------------+
                      |    Express.js Web Server    |
                      |  (Helmet, CORS, RateLimit)  |
                      +--------------+--------------+
                                     |
                                     v
                      +-----------------------------+
                      |    Routing & Middlewares    |
                      | (Auth, Roles, Validate, Err)|
                      +--------------+--------------+
                                     |
                      +--------------+--------------+
                      |                             |
                      v                             v
           +--------------------+         +--------------------+
           |    Controllers     |         |      Services      |
           | (Req/Res handling) | <-----> |(Tokens, Audit, Bus)|
           +---------+----------+         +---------+----------+
                     |                              |
                     +--------------+---------------+
                                    |
                                    v
                      +-----------------------------+
                      |     Mongoose ODM Layer      |
                      |  (Indexes, Hooks, Validation|
                      +--------------+--------------+
                                     |
                                     v
                      +-----------------------------+
                      |       MongoDB Database      |
                      +-----------------------------+
```

### 2.1 Backend Layers
1. **Config Layer (`/config`)**:
   - `env.js`: Centralized, validated environment configuration with secure defaults.
   - `db.js`: Resilient MongoDB connection manager with reconnection hooks and graceful lifecycle shutdown.
2. **Middleware Layer (`/middleware`)**:
   - `authMiddleware.js`: Verifies short-lived JWT access tokens and fetches the active user record.
   - `roleMiddleware.js`: Restricts routes to authorized roles (e.g., student vs. admin).
   - `rateLimiter.js`: Global protection against DDoS/scraping and targeted brute-force guards on authentication routes.
   - `validate.js`: Generic Express-validator middleware evaluating schema rules and throwing standard unprocessable entity errors.
   - `errorHandler.js`: Intercepts operational errors, Mongoose duplicate key errors, CastErrors, and syntax issues. Omits stack traces in production.
   - `notFound.js`: Clean 404 handler for missing endpoints.
3. **Controller Layer (`/controllers`)**:
   - Handles HTTP input/output formatting, calling services and models without mixing presentation concerns.
4. **Service Layer (`/services`)**:
   - `tokenService.js`: Issues short-lived access tokens (15m) and secure refresh tokens (7d).
   - `auditService.js`: Non-blocking audit logger tracking sensitive actions (logins, role modifications, claim approvals).
5. **Model Layer (`/models`)**:
   - Mongoose schemas with indexed search properties, compound filters, password hashing hooks, and JSON sanitization.

### 2.2 Frontend Layers
1. **API Client Layer (`/src/services`)**:
   - Axios instance with base URL configuration, request interceptor attaching JWT headers, and response interceptor for automatic refresh token retries.
2. **Context & State (`/src/context`)**:
   - `AuthContext`: Centralized authentication store managing current user, token state, login, registration, and logout.
3. **Component System (`/src/components`)**:
   - Reusable UI building blocks: `Button`, `Input`, `Card`, `StatusBadge`, `ProtectedRoute`, `Navbar`, and `Footer`.
4. **Layout Layer (`/src/layouts`)**:
   - `MainLayout`: Public shell with navigation header and footer.
   - `DashboardLayout`: Protected student workspace with navigation sidebar and academic profile summary.
5. **Theme & Styling (`/src/index.css`)**:
   - Custom palette: Deep dark teal/green background (`#071615`), dark surfaces (`#0c201d`, `#112a26`), subtle teal borders (`#1b423c`), and warm golden amber accents (`#e5a93c`, `#f59e0b`).

---

## 3. Security & Privacy Architecture

### 3.1 Authentication & Token Lifecycle
- **Access Tokens**: Short-lived (15 minutes), containing non-sensitive payload (`sub`, `role`, `email`).
- **Refresh Tokens**: Stored in `httpOnly`, `sameSite`, and `secure` cookies (7 days expiry), preventing client-side script access.
- **Password Protection**: Passwords are salted and hashed using `bcrypt` (12 rounds) via pre-save hooks. Raw passwords are never persisted.
- **Selective Field Exclusion**: The `passwordHash` field is configured with `select: false` on the User model and stripped out during JSON transformation.

### 3.2 Student Privacy Shield
- Public item listings never expose private student contact information (such as personal phone numbers or roll numbers).
- Inquiries and claims must be submitted through platform verification flows.
- Confidential identifying details (such as serial numbers, secret stickers, or passcode hints) are stored in dedicated private fields and omitted from public feeds.

---

## 4. Scalability & High Performance
- **Text Search Indexing**: Full-text compound indexes with weights on `itemName`, `description`, and location fields.
- **Compound Query Indexes**: `status + category + date` indexes ensure queries remain $O(\log N)$ regardless of database growth.
- **Reverse Proxy Ready**: Configured with `app.set('trust proxy', 1)` to run seamlessly behind Nginx, Cloudflare, or AWS ALB.
