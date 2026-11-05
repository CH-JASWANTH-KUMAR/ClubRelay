import { env } from './config/env.js';
import app from './app.js';
import { connectDB } from './config/db.js';
import { Campus } from './models/index.js';
import { runSeed } from './scripts/seed.js';

const PORT = env.PORT || 5000;

async function bootstrap() {
  try {
    await connectDB();

    // Auto-seed only in development/test if database is fresh
    const campusCount = await Campus.countDocuments();
    if (campusCount === 0 && env.NODE_ENV !== 'production') {
      console.log('[Bootstrap] No existing campus found. Auto-seeding initial development data...');
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

