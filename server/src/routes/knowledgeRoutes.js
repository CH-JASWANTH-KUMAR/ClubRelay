import express from 'express';
import {
  listKnowledge,
  createKnowledge,
  getKnowledge,
  updateKnowledge,
} from '../controllers/knowledgeController.js';
import { requireAuth } from '../middleware/auth.js';
import { requireClubPermission } from '../middleware/tenant.js';

const router = express.Router();

router.use(requireAuth);

router.get(
  '/clubs/:clubId/knowledge',
  requireClubPermission(['knowledge.view'], { allowCampusAdmin: true, allowAssignedFaculty: true }),
  listKnowledge
);
router.post(
  '/clubs/:clubId/knowledge',
  requireClubPermission(['knowledge.create'], { allowCampusAdmin: true }),
  createKnowledge
);
router.get(
  '/clubs/:clubId/knowledge/:id',
  requireClubPermission(['knowledge.view'], { allowCampusAdmin: true, allowAssignedFaculty: true }),
  getKnowledge
);
router.put(
  '/clubs/:clubId/knowledge/:id',
  requireClubPermission(['knowledge.edit'], { allowCampusAdmin: true }),
  updateKnowledge
);

export default router;
