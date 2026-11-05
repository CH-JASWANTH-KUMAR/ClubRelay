import express from 'express';
import { listPendingApprovals, reviewProposal, listEventApprovals } from '../controllers/approvalController.js';
import { requireAuth } from '../middleware/auth.js';
import { requireCampusRole } from '../middleware/tenant.js';

const router = express.Router();

router.use(requireAuth);

router.get('/pending', requireCampusRole('FACULTY_COORDINATOR', 'CAMPUS_ADMIN'), listPendingApprovals);
router.post('/events/:eventId/review', requireCampusRole('FACULTY_COORDINATOR', 'CAMPUS_ADMIN'), reviewProposal);
router.get('/events/:eventId', listEventApprovals);

export default router;
