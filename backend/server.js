import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import environment from './config/environment.js';
import { connectDatabase, disconnectDatabase, getConnectionStatus } from './config/database.js';

// Route imports
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import itemRoutes from './routes/itemRoutes.js';
import lostItemRoutes from './routes/lostItemRoutes.js';
import foundItemRoutes from './routes/foundItemRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import claimRoutes from './routes/claimRoutes.js';
import matchRoutes from './routes/matchRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import returnRoutes from './routes/returnRoutes.js';
import { UPLOADS_DIR } from './utils/fileUpload.js';

import { apiLimiter } from './middleware/rateLimitMiddleware.js';
import { notFoundHandler, errorHandler } from './middleware/errorMiddleware.js';
import authenticate from './middleware/authMiddleware.js';
import { createModerationReport, getAnnouncements } from './controllers/adminController.js';
import { getNotificationPreferences, updateNotificationPreferences } from './controllers/notificationController.js';
import sanitizeInputs from './middleware/sanitizeMiddleware.js';

const app = express();

// Disable x-powered-by header to avoid information disclosure
app.disable('x-powered-by');

// Trust reverse proxy for accurate IP tracking & rate limiting
app.set('trust proxy', 1);

// 1. Hardened Security Headers with Content-Security-Policy & HSTS
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'blob:', 'http:', 'https:'],
      connectSrc: ["'self'", environment.clientUrl, 'http://localhost:5173', 'http://localhost:5174', 'http://localhost:5001'],
      frameAncestors: ["'none'"]
    }
  },
  hsts: environment.isProduction ? { maxAge: 31536000, includeSubDomains: true, preload: true } : false
}));

// 2. CORS Configuration
const allowedOrigins = [
  environment.clientUrl,
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:3000'
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`Origin '${origin}' not permitted by CORS policy`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// 3. Request Parsing & Body Size Limits
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));
app.use(cookieParser());

// 4. Global NoSQL Injection and Input Sanitization
app.use(sanitizeInputs);

// 5. Static holding directory for uploaded item photos with secure headers
app.use('/uploads', express.static(UPLOADS_DIR, {
  setHeaders: (res) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  }
}));

// 6. Rate Limiting on /api
app.use('/api', apiLimiter);

// 5. Health Check Endpoint (supports both /api/health and /api/v1/health)
app.get(['/api/health', '/api/v1/health'], (req, res) => {
  const isDbConnected = getConnectionStatus() === 'connected';
  res.status(200).json({
    success: true,
    message: 'Campus Lost & Found API is running',
    database: isDbConnected ? 'connected' : 'disconnected'
  });
});

// 6. Mount REST API Subrouters (supports both /api and /api/v1)
const mountRouters = (prefix) => {
  app.use(`${prefix}/auth`, authRoutes);
  app.use(`${prefix}/users`, userRoutes);
  app.use(`${prefix}/items`, itemRoutes);
  app.use(`${prefix}/lost-items`, lostItemRoutes);
  app.use(`${prefix}/found-items`, foundItemRoutes);
  app.use(`${prefix}/upload`, uploadRoutes);
  app.use(`${prefix}/claims`, claimRoutes);
  app.use(`${prefix}/matches`, matchRoutes);
  app.use(`${prefix}/notifications`, notificationRoutes);
  app.use(`${prefix}/admin`, adminRoutes);
  app.use(`${prefix}/returns`, returnRoutes);
  app.post(`${prefix}/reports`, authenticate, createModerationReport);
  app.get(`${prefix}/announcements`, getAnnouncements);
  // Notification preferences routes
  app.get(`${prefix}/notification-preferences`, authenticate, getNotificationPreferences);
  app.patch(`${prefix}/notification-preferences`, authenticate, updateNotificationPreferences);
};

mountRouters('/api');
mountRouters('/api/v1');

// Root diagnostic route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Campus Lost & Found Backend REST API is running',
    health: '/api/health'
  });
});

// 7. Unknown Routes (404)
app.use(notFoundHandler);

// 8. Centralized Global Error Handler
app.use(errorHandler);

let server;

/**
 * Initialize application and start HTTP listener after database connection
 */
const startServer = async () => {
  try {
    // 1. Connect to MongoDB
    console.log(`[Server] Connecting to database at: ${environment.mongoUri}...`);
    try {
      await connectDatabase();
    } catch (dbErr) {
      console.warn(`[Server Warning] MongoDB connection could not be established immediately: ${dbErr.message}`);
      if (environment.isProduction) {
        process.exit(1);
      }
      console.warn('[Server Warning] Continuing in development mode so endpoints and models can be tested.');
    }

    // 2. Start HTTP Listener on all local interfaces (0.0.0.0)
    server = app.listen(environment.port, '0.0.0.0', () => {
      console.log('====================================================');
      console.log(' Campus Lost & Found Backend Server (Phase 2)       ');
      console.log(` Environment : ${environment.nodeEnv}`);
      console.log(` Port        : ${environment.port}`);
      console.log(` API Health  : http://localhost:${environment.port}/api/health`);
      console.log(` Database    : ${getConnectionStatus()}`);
      console.log('====================================================');
    });
  } catch (err) {
    console.error('[Server Fatal] Failed to launch server:', err.message);
    process.exit(1);
  }
};

// Graceful termination handling
const handleGracefulShutdown = async (signal) => {
  console.log(`\n[Server] Received ${signal}. Shutting down HTTP server gracefully...`);
  if (server) {
    server.close(async () => {
      console.log('[Server] HTTP listener closed.');
      await disconnectDatabase();
      console.log('[Server] Graceful exit complete.');
      process.exit(0);
    });
  } else {
    process.exit(0);
  }
};

process.on('SIGTERM', () => handleGracefulShutdown('SIGTERM'));
process.on('SIGINT', () => handleGracefulShutdown('SIGINT'));

process.on('unhandledRejection', (reason) => {
  console.error('[Server] Unhandled Promise Rejection:', reason?.message || reason);
});

process.on('uncaughtException', (err) => {
  console.error('[Server] Uncaught Exception:', err.message);
  process.exit(1);
});

startServer();

export default app;
