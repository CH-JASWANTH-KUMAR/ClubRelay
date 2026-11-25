import { env } from './config/env.js';
import app from './app.js';
import { connectDB, disconnectDB } from './config/db.js';

const PORT = env.PORT || 5000;

async function bootstrap() {
  try {
    await connectDB();

    const server = app.listen(PORT, () => {
      console.log(`[ClubRelay API] Server listening on http://localhost:${PORT}`);
    });

    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.error(
          `[Bootstrap Error]: Port ${PORT} is already in use. Stop any duplicate dev server process before starting.`
        );
      } else {
        console.error('[Bootstrap Error]:', err?.message || err);
      }
      process.exit(1);
    });

    let shuttingDown = false;
    const shutdown = async (signal) => {
      if (shuttingDown) return;
      shuttingDown = true;

      server.close(async () => {
        try {
          await disconnectDB();
        } finally {
          if (signal === 'SIGUSR2') {
            process.kill(process.pid, 'SIGUSR2');
          } else {
            process.exit(0);
          }
        }
      });

      setTimeout(() => process.exit(0), 2000).unref();
    };

    process.once('SIGTERM', () => shutdown('SIGTERM'));
    process.once('SIGINT', () => shutdown('SIGINT'));
    process.once('SIGUSR2', () => shutdown('SIGUSR2'));
  } catch (err) {
    console.error('[Bootstrap Error]:', err?.message || err);
    process.exit(1);
  }
}

bootstrap();
