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

router.get('/clubs/:clubId/handovers', listHandovers);
router.post('/clubs/:clubId/handovers', requireClubRole('PRESIDENT'), createHandover);

router.get('/clubs/:clubId/handovers/:id', getHandover);
router.put('/clubs/:clubId/handovers/:id/section', updateHandoverSection);
router.post('/clubs/:clubId/handovers/:id/acknowledge', acknowledgeHandover);
router.post('/clubs/:clubId/handovers/:id/complete', requireClubRole('PRESIDENT'), completeHandover);

export default router;
