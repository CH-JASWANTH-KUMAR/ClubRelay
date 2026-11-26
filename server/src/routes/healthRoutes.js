import express from 'express';
import mongoose from 'mongoose';
import rateLimit from 'express-rate-limit';
import { env } from '../config/env.js';

const router = express.Router();

export const healthLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 60, // 60 requests per minute per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    ok: false,
    db: 'down',
  },
  skip: () => env.NODE_ENV === 'test',
});

/**
 * GET /api/v1/health
 * Returns { ok: boolean, db: 'up' | 'down' }
 * Uses Mongoose connection state and a lightweight ping command.
 * Never exposes host names, versions, or collection counts.
 */
router.get('/', healthLimiter, async (req, res) => {
  let isDbUp = false;

  try {
    if (mongoose.connection.readyState === 1 && mongoose.connection.db) {
      await mongoose.connection.db.command({ ping: 1 });
      isDbUp = true;
    }
  } catch {
    isDbUp = false;
  }

  const statusCode = isDbUp ? 200 : 503;
  return res.status(statusCode).json({
    ok: isDbUp,
    db: isDbUp ? 'up' : 'down',
  });
});

export default router;
