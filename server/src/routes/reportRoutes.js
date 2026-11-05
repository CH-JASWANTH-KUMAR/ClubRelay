import express from 'express';
import { getAnnualReport, exportCsv } from '../controllers/reportController.js';
import { requireAuth } from '../middleware/auth.js';
import { requireClubRole } from '../middleware/tenant.js';

const router = express.Router();

router.use(requireAuth);

router.get(
  '/clubs/:clubId/reports/annual',
  requireClubRole('GENERAL_MEMBER', { allowCampusAdmin: true, allowAssignedFaculty: true }),
  getAnnualReport
);

router.get(
  '/clubs/:clubId/reports/export/csv',
  requireClubRole('GENERAL_MEMBER', { allowCampusAdmin: true, allowAssignedFaculty: true }),
  exportCsv
);

export default router;
