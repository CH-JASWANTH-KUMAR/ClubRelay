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
import { requireClubPermission } from '../middleware/tenant.js';

const router = express.Router();

router.use(requireAuth);

router.get(
  '/clubs/:clubId/handovers',
  requireClubPermission(['handover.view', 'handover.manage_own', 'handover.manage_all', 'club.view_overview'], {
    allowCampusAdmin: true,
    allowAssignedFaculty: true,
  }),
  listHandovers
);

router.post(
  '/clubs/:clubId/handovers',
  requireClubPermission(['handover.manage_own', 'handover.manage_all'], { allowCampusAdmin: true }),
  createHandover
);

router.get(
  '/clubs/:clubId/handovers/:id',
  requireClubPermission(['handover.view', 'handover.manage_own', 'handover.manage_all', 'club.view_overview'], {
    allowCampusAdmin: true,
    allowAssignedFaculty: true,
  }),
  getHandover
);

router.put(
  '/clubs/:clubId/handovers/:id/section',
  requireClubPermission(['handover.manage_own', 'handover.manage_all'], { allowCampusAdmin: true }),
  updateHandoverSection
);

router.post(
  '/clubs/:clubId/handovers/:id/acknowledge',
  requireClubPermission(['club.view_overview', 'handover.view', 'handover.manage_own'], { allowCampusAdmin: false }),
  acknowledgeHandover
);

router.post(
  '/clubs/:clubId/handovers/:id/complete',
  requireClubPermission(['handover.manage_own', 'handover.manage_all', 'handover.approve'], {
    allowCampusAdmin: true,
  }),
  completeHandover
);

export default router;
