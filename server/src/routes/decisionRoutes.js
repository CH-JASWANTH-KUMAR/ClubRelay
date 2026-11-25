import express from 'express';
import { listDecisions, recordDecision } from '../controllers/decisionController.js';
import { requireAuth } from '../middleware/auth.js';
import { requireClubPermission } from '../middleware/tenant.js';

const router = express.Router();

router.use(requireAuth);

router.get(
  '/clubs/:clubId/decisions',
  requireClubPermission(['decisions.view'], { allowCampusAdmin: true, allowAssignedFaculty: true }),
  listDecisions
);
router.post(
  '/clubs/:clubId/decisions',
  requireClubPermission(['decisions.record'], { allowCampusAdmin: true, errorCode: 'INSUFFICIENT_CLUB_ROLE' }),
  recordDecision
);

export default router;
