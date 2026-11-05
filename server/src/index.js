import dotenv from 'dotenv';
dotenv.config();

import app from './app.js';
import { connectDB } from './config/db.js';
import { Campus } from './models/index.js';
import { runSeed } from './scripts/seed.js';

const PORT = process.env.PORT || 5000;

async function bootstrap() {
  try {
    await connectDB();

    // Auto-seed if database is fresh
    const campusCount = await Campus.countDocuments();
    if (campusCount === 0) {
      console.log('[Bootstrap] No existing campus found. Auto-seeding initial data...');
      await runSeed();
      await connectDB(); // re-verify connection
    }

    app.listen(PORT, () => {
      console.log(`[ClubRelay API] Server listening on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('[Bootstrap Error]:', err);
    process.exit(1);
  }
}

bootstrap();

