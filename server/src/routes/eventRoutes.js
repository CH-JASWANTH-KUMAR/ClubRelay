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
import { requireClubPermission } from '../middleware/tenant.js';

const router = express.Router();

router.use(requireAuth);

router.get('/event-templates', listEventTemplates);

// Tenant-isolated club event endpoints
router.get(
  '/clubs/:clubId/events',
  requireClubPermission(['events.view'], { allowCampusAdmin: true, allowAssignedFaculty: true }),
  listClubEvents
);
router.post(
  '/clubs/:clubId/events',
  requireClubPermission(['events.create'], { allowCampusAdmin: true, errorCode: 'INSUFFICIENT_CLUB_ROLE' }),
  createEvent
);

router.get('/events/:eventId', getEvent);
router.put('/events/:eventId', updateEvent);
router.post('/events/:eventId/submit', submitProposal);
router.post('/events/:eventId/retrospective', saveRetrospective);

export default router;
