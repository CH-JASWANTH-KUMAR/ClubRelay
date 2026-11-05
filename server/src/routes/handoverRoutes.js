import express from 'express';
import {
  listHandovers,
  createHandover,
  getHandover,
  updateHandoverSection,
  acknowledgeHandover,
  completeHandover,
} from '../controllers/handoverController.js';
import { requireAuth } from '../middleware/auth.js';
import { requireClubRole } from '../middleware/tenant.js';

const router = express.Router();

router.use(requireAuth);

router.get(
  '/clubs/:clubId/handovers',
  requireClubRole('GENERAL_MEMBER', { allowCampusAdmin: true, allowAssignedFaculty: true }),
  listHandovers
);

router.post(
  '/clubs/:clubId/handovers',
  requireClubRole('PRESIDENT', { allowCampusAdmin: true }),
  createHandover
);

router.get(
  '/clubs/:clubId/handovers/:id',
  requireClubRole('GENERAL_MEMBER', { allowCampusAdmin: true, allowAssignedFaculty: true }),
  getHandover
);

router.put(
  '/clubs/:clubId/handovers/:id/section',
  requireClubRole('CORE_TEAM', { allowCampusAdmin: true }),
  updateHandoverSection
);

router.post(
  '/clubs/:clubId/handovers/:id/acknowledge',
  requireClubRole('GENERAL_MEMBER'),
  acknowledgeHandover
);

router.post(
  '/clubs/:clubId/handovers/:id/complete',
  requireClubRole('CORE_TEAM', { allowCampusAdmin: true }),
  completeHandover
);

export default router;
