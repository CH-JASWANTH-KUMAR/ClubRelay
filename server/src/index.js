import { env } from './config/env.js';
import app from './app.js';
import { connectDB } from './config/db.js';

const PORT = env.PORT || 5000;

async function bootstrap() {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`[ClubRelay API] Server listening on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('[Bootstrap Error]:', err?.message || err);
    process.exit(1);
  }
}

bootstrap();

