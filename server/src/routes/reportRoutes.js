import express from 'express';
import { getAnnualReport, exportCsv } from '../controllers/reportController.js';
import { requireAuth } from '../middleware/auth.js';
import { requireClubPermission } from '../middleware/tenant.js';

const router = express.Router();

router.use(requireAuth);

router.get(
  '/clubs/:clubId/reports/annual',
  requireClubPermission(['reports.view'], { allowCampusAdmin: true, allowAssignedFaculty: true }),
  getAnnualReport
);

router.get(
  '/clubs/:clubId/reports/export/csv',
  requireClubPermission(['reports.export', 'reports.view'], { allowCampusAdmin: true, allowAssignedFaculty: true }),
  exportCsv
);

export default router;
