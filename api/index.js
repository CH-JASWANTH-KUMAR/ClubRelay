import app from '../server/src/app.js';
import { connectDB } from '../server/src/config/db.js';

export default async function handler(req, res) {
  try {
    await connectDB();
    return app(req, res);
  } catch (err) {
    console.error('[Vercel Serverless Handler Error]:', err);
    res.status(500).json({
      success: false,
      error: { code: 'SERVERLESS_DB_ERROR', message: 'Failed to connect to database' },
    });
  }
}
