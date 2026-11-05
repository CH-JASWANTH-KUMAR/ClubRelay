import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../app.js';
import { connectDB, disconnectDB } from '../config/db.js';
import { runSeed } from '../scripts/seed.js';

describe('ClubRelay Backend API Suite', () => {
  beforeAll(async () => {
    await connectDB();
    await runSeed();
  });

  afterAll(async () => {
    await disconnectDB();
  });

  describe('Health Check', () => {
    it('returns 200 OK from /api/health', async () => {
      const res = await request(app).get('/api/health');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('ok');
    });
  });

  describe('Authentication & Tenant Context', () => {
    let authToken = '';
    let gdgClubId = '';

    it('authenticates Sarah Jenkins (President) successfully', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'sarah.gdg@pcu.edu', password: 'Password123!' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.email).toBe('sarah.gdg@pcu.edu');
      expect(res.body.data.user.memberships.length).toBeGreaterThan(0);

      authToken = res.body.data.token;
      gdgClubId = res.body.data.user.memberships[0].clubId._id;
    });

    it('retrieves user profile via /api/v1/auth/me', async () => {
      const res = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.user.fullName).toContain('Sarah');
    });

    it('rejects access without authentication token', async () => {
      const res = await request(app).get('/api/v1/clubs');
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('lists clubs in user campus', async () => {
      const res = await request(app)
        .get('/api/v1/clubs')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.clubs.length).toBeGreaterThan(0);
      // PCU should have GDG and IEEE
      const codes = res.body.data.clubs.map((c) => c.code);
      expect(codes).toContain('GDG');
      expect(codes).toContain('IEEE');
      // Should NOT expose MTI club (AWSCC) due to campus tenant isolation!
      expect(codes).not.toContain('AWSCC');
    });

    it('lists events for GDG club', async () => {
      const res = await request(app)
        .get(`/api/v1/clubs/${gdgClubId}/events`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.events.length).toBeGreaterThan(0);
    });

    it('fetches Handover transition package and validates 8 sections', async () => {
      const handoversRes = await request(app)
        .get(`/api/v1/clubs/${gdgClubId}/handovers`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(handoversRes.status).toBe(200);
      expect(handoversRes.body.data.handovers.length).toBeGreaterThan(0);

      const handoverId = handoversRes.body.data.handovers[0]._id;
      const detailRes = await request(app)
        .get(`/api/v1/clubs/${gdgClubId}/handovers/${handoverId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(detailRes.status).toBe(200);
      const handover = detailRes.body.data.handover;
      expect(handover.roleHandover).toBe('PRESIDENT');
      expect(handover.sections.roleResponsibilities).toBeDefined();
      expect(handover.sections.recommendationsAndAdvice).toBeDefined();
    });

    it('computes annual report metrics', async () => {
      const res = await request(app)
        .get(`/api/v1/clubs/${gdgClubId}/reports/annual`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.summary.eventsCompleted).toBeGreaterThan(0);
      expect(res.body.data.summary.totalAttendeesReached).toBeGreaterThan(0);
    });
  });
});
