import express from 'express';
import { listCampuses, getCampusDetails, getCampusStats, listTerms } from '../controllers/campusController.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.get('/', listCampuses);
router.get('/:campusId', getCampusDetails);
router.get('/:campusId/stats', requireAuth, getCampusStats);
router.get('/:campusId/terms', requireAuth, listTerms);

export default router;
