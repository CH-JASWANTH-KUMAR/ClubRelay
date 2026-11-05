import express from 'express';
import { listDecisions, recordDecision } from '../controllers/decisionController.js';
import { requireAuth } from '../middleware/auth.js';
import { requireClubRole } from '../middleware/tenant.js';

const router = express.Router();

router.use(requireAuth);

router.get('/clubs/:clubId/decisions', listDecisions);
router.post('/clubs/:clubId/decisions', requireClubRole('SECRETARY'), recordDecision);

export default router;
