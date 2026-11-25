import express from 'express';
import {
  getOnboardingSummary,
  discoverOrganizations,
  submitCampusRequest,
  acceptInvitation,
} from '../controllers/onboardingController.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.use(requireAuth);

router.get('/onboarding/summary', getOnboardingSummary);
router.get('/onboarding/discover', discoverOrganizations);
router.post('/onboarding/campus-request', submitCampusRequest);
router.post('/invitations/accept', acceptInvitation);

export default router;

