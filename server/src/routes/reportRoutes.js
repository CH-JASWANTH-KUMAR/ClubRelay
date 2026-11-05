import express from 'express';
import { getAnnualReport, exportCsv } from '../controllers/reportController.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.use(requireAuth);

router.get('/clubs/:clubId/reports/annual', getAnnualReport);
router.get('/clubs/:clubId/reports/export/csv', exportCsv);

export default router;
