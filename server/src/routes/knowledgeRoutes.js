import express from 'express';
import {
  listKnowledge,
  createKnowledge,
  getKnowledge,
  updateKnowledge,
} from '../controllers/knowledgeController.js';
import { requireAuth } from '../middleware/auth.js';
import { requireClubRole } from '../middleware/tenant.js';

const router = express.Router();

router.use(requireAuth);

router.get('/clubs/:clubId/knowledge', listKnowledge);
router.post('/clubs/:clubId/knowledge', requireClubRole('CORE_TEAM'), createKnowledge);
router.get('/clubs/:clubId/knowledge/:id', getKnowledge);
router.put('/clubs/:clubId/knowledge/:id', requireClubRole('CORE_TEAM'), updateKnowledge);

export default router;
