import express from 'express';
import {
  listClubs,
  createClub,
  getClub,
  getMembers,
  addMember,
  updateMemberRole,
  removeMember,
} from '../controllers/clubController.js';
import { requireAuth } from '../middleware/auth.js';
import { requireClubRole, requireCampusRole } from '../middleware/tenant.js';

const router = express.Router();

router.use(requireAuth);

router.get('/', listClubs);
router.post('/', requireCampusRole('CAMPUS_ADMIN'), createClub);

router.get('/:clubId', getClub);
router.get('/:clubId/members', getMembers);
router.post('/:clubId/members', requireClubRole('SECRETARY'), addMember);
router.put('/:clubId/members/:memberId', requireClubRole('PRESIDENT'), updateMemberRole);
router.delete('/:clubId/members/:memberId', requireClubRole('PRESIDENT'), removeMember);

export default router;
