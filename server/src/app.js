import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';

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
import { errorHandler } from './middleware/errorHandler.js';

const app = express();

app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  })
);

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'ClubRelay API', timestamp: new Date().toISOString() });
});

// Mount API v1 Endpoints
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/campuses', campusRoutes);
app.use('/api/v1/clubs', clubRoutes);
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

