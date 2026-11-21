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

router.get(
  '/clubs/:clubId/knowledge',
  requireClubRole('GENERAL_MEMBER', { allowCampusAdmin: true, allowAssignedFaculty: true }),
  listKnowledge
);
router.post(
  '/clubs/:clubId/knowledge',
  requireClubRole('CORE_TEAM', { allowCampusAdmin: true }),
  createKnowledge
);
router.get(
  '/clubs/:clubId/knowledge/:id',
  requireClubRole('GENERAL_MEMBER', { allowCampusAdmin: true, allowAssignedFaculty: true }),
  getKnowledge
);
router.put(
  '/clubs/:clubId/knowledge/:id',
  requireClubRole('CORE_TEAM', { allowCampusAdmin: true }),
  updateKnowledge
);

export default router;
