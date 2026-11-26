import express from 'express';
import { listContacts, createContact, updateContact } from '../controllers/contactController.js';
import { requireAuth } from '../middleware/auth.js';
import { requireClubPermission } from '../middleware/tenant.js';

const router = express.Router();

router.use(requireAuth);

router.get(
  '/clubs/:clubId/contacts',
  requireClubPermission(['contacts.view'], { allowCampusAdmin: true, allowAssignedFaculty: true }),
  listContacts
);
router.post(
  '/clubs/:clubId/contacts',
  requireClubPermission(['contacts.create'], { allowCampusAdmin: true }),
  createContact
);
router.put(
  '/clubs/:clubId/contacts/:id',
  requireClubPermission(['contacts.edit'], { allowCampusAdmin: true }),
  updateContact
);

export default router;
