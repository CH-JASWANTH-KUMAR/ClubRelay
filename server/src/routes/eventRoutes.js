import express from 'express';
import {
  listClubEvents,
  createEvent,
  getEvent,
  updateEvent,
  submitProposal,
  saveRetrospective,
  listEventTemplates,
} from '../controllers/eventController.js';
import { requireAuth } from '../middleware/auth.js';
import { requireClubRole } from '../middleware/tenant.js';

const router = express.Router();

router.use(requireAuth);

router.get('/event-templates', listEventTemplates);

router.get('/clubs/:clubId/events', listClubEvents);
router.post('/clubs/:clubId/events', requireClubRole('CORE_TEAM'), createEvent);

router.get('/events/:eventId', getEvent);
router.put('/events/:eventId', updateEvent);
router.post('/events/:eventId/submit', submitProposal);
router.post('/events/:eventId/retrospective', saveRetrospective);

export default router;
