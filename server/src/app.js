import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import { env } from './config/env.js';

import authRoutes from './routes/authRoutes.js';
import campusRoutes from './routes/campusRoutes.js';
import clubRoutes from './routes/clubRoutes.js';
import eventRoutes from './routes/eventRoutes.js';
import taskRoutes from './routes/taskRoutes.js';
import approvalRoutes from './routes/approvalRoutes.js';
import knowledgeRoutes from './routes/knowledgeRoutes.js';
import contactRoutes from './routes/contactRoutes.js';
import decisionRoutes from './routes/decisionRoutes.js';
import handoverRoutes from './routes/handoverRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import onboardingRoutes from './routes/onboardingRoutes.js';
import healthRoutes from './routes/healthRoutes.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();

app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  })
);

// Explicit CORS Origin Allowlist
const rawOrigins = (env.CLIENT_ORIGIN || '').split(',').map((o) => o.trim()).filter(Boolean);
const devOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
];
const allowedOrigins = new Set(
  env.NODE_ENV === 'production'
    ? rawOrigins
    : [...rawOrigins, ...devOrigins]
);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow non-browser requests (like server-to-server, curl, tests) where origin is undefined
      if (!origin || allowedOrigins.has(origin)) {
        return callback(null, true);
      }
      return callback(new Error(`Origin ${origin} not permitted by ClubRelay CORS policy`));
    },
    credentials: true,
  })
);

app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate Limiters
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // 30 attempts per IP per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: 'TOO_MANY_REQUESTS',
      message: 'Too many authentication attempts. Please try again in 15 minutes.',
    },
  },
  skip: () => env.NODE_ENV === 'test', // avoid test suite throttling
});

const registerLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // stricter limit for registration attempts per IP per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: 'TOO_MANY_REQUESTS',
      message: 'Too many registration attempts. Please try again later.',
    },
  },
  skip: () => env.NODE_ENV === 'test',
});

const resolveLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: 'TOO_MANY_REQUESTS',
      message: 'Too many domain lookup requests. Please slow down.',
    },
  },
  skip: () => env.NODE_ENV === 'test',
});

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'ClubRelay API', environment: env.NODE_ENV, timestamp: new Date().toISOString() });
});

// Database-backed Health Check
app.use('/api/v1/health', healthRoutes);

// Mount Rate-Limited Auth & Campus Resolution Endpoints
app.use('/api/v1/auth/login', authLimiter);
app.use('/api/v1/auth/register', registerLimiter);
app.use('/api/v1/auth/google', authLimiter);
app.use('/api/v1/auth/github', authLimiter);
app.use('/api/v1/campuses/resolve', resolveLimiter);

// Mount API v1 Endpoints
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/campuses', campusRoutes);
app.use('/api/v1/clubs', clubRoutes);
app.use('/api/v1', onboardingRoutes);
app.use('/api/v1', eventRoutes);
app.use('/api/v1', taskRoutes);
app.use('/api/v1/approvals', approvalRoutes);
app.use('/api/v1', knowledgeRoutes);
app.use('/api/v1', contactRoutes);
app.use('/api/v1', decisionRoutes);
app.use('/api/v1', handoverRoutes);
app.use('/api/v1', reportRoutes);
app.use('/api/v1/notifications', notificationRoutes);

// Centralized error handler
app.use(errorHandler);

export default app;
