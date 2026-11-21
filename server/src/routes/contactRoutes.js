import express from 'express';
import { listContacts, createContact, updateContact } from '../controllers/contactController.js';
import { requireAuth } from '../middleware/auth.js';
import { requireClubRole } from '../middleware/tenant.js';

const router = express.Router();

router.use(requireAuth);

router.get(
  '/clubs/:clubId/contacts',
  requireClubRole('GENERAL_MEMBER', { allowCampusAdmin: true, allowAssignedFaculty: true }),
  listContacts
);
router.post('/clubs/:clubId/contacts', requireClubRole('CORE_TEAM', { allowCampusAdmin: true }), createContact);
router.put('/clubs/:clubId/contacts/:id', requireClubRole('CORE_TEAM', { allowCampusAdmin: true }), updateContact);

export default router;
