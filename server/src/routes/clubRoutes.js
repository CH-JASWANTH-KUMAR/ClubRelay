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
import {
  createDraftClub,
  updateDraftClub,
  applyStarterTemplate,
  activateDraftClub,
  updateClubSettings,
} from '../controllers/wizardController.js';
import {
  getClubStructure,
  createDepartment,
  updateDepartment,
  deleteDepartment,
  createPosition,
  updatePosition,
  deletePosition,
  assignPositionToMember,
  endPositionAssignment,
  listClubInvitations,
  createClubInvitation,
  revokeClubInvitation,
  createJoinRequest,
  listJoinRequests,
  reviewJoinRequest,
  suspendMember,
  reinstateMember,
  transferWorkspaceOwnership,
  createClubTerm,
} from '../controllers/structureController.js';
import { requireAuth } from '../middleware/auth.js';
import {
  requireClubPermission,
  requireCampusRole,
} from '../middleware/tenant.js';

const router = express.Router();

router.use(requireAuth);

// Organization listing & creation
router.get('/', listClubs);
router.post('/', requireCampusRole('CAMPUS_ADMIN'), createClub);
router.post('/wizard/draft', createDraftClub);

// Draft & Wizard endpoints
router.put(
  '/:clubId/wizard/draft',
  requireClubPermission(['club.manage_settings', 'club.manage_structure'], { allowCampusAdmin: true }),
  updateDraftClub
);
router.post(
  '/:clubId/wizard/apply-template',
  requireClubPermission(['club.manage_structure'], { allowCampusAdmin: true }),
  applyStarterTemplate
);
router.post(
  '/:clubId/wizard/activate',
  requireClubPermission(['club.manage_settings'], { allowCampusAdmin: true }),
  activateDraftClub
);

// Settings, Terms & Workspace Ownership
router.put(
  '/:clubId/settings',
  requireClubPermission(['club.manage_settings'], { allowCampusAdmin: true }),
  updateClubSettings
);
router.post(
  '/:clubId/terms',
  requireClubPermission(['club.manage_terms', 'club.manage_settings'], { allowCampusAdmin: true }),
  createClubTerm
);
router.post(
  '/:clubId/transfer-ownership',
  requireClubPermission(['club.transfer_ownership'], { allowCampusAdmin: true }),
  transferWorkspaceOwnership
);

// Overview & Structure Builder
router.get('/:clubId', getClub);
router.get(
  '/:clubId/structure',
  requireClubPermission(['club.view_overview', 'club.manage_structure'], {
    allowCampusAdmin: true,
    allowAssignedFaculty: true,
  }),
  getClubStructure
);

// Departments & Positions
router.post(
  '/:clubId/departments',
  requireClubPermission(['club.manage_structure'], { allowCampusAdmin: true }),
  createDepartment
);
router.put(
  '/:clubId/departments/:deptId',
  requireClubPermission(['club.manage_structure'], { allowCampusAdmin: true }),
  updateDepartment
);
router.delete(
  '/:clubId/departments/:deptId',
  requireClubPermission(['club.manage_structure'], { allowCampusAdmin: true }),
  deleteDepartment
);
router.post(
  '/:clubId/positions',
  requireClubPermission(['club.manage_structure'], { allowCampusAdmin: true }),
  createPosition
);
router.put(
  '/:clubId/positions/:positionId',
  requireClubPermission(['club.manage_structure'], { allowCampusAdmin: true }),
  updatePosition
);
router.delete(
  '/:clubId/positions/:positionId',
  requireClubPermission(['club.manage_structure'], { allowCampusAdmin: true }),
  deletePosition
);

// Members, Assignments, Invitations & Join Requests
router.get(
  '/:clubId/members',
  requireClubPermission(['members.view', 'club.view_overview'], {
    allowCampusAdmin: true,
    allowAssignedFaculty: true,
  }),
  getMembers
);
router.post(
  '/:clubId/members',
  requireClubPermission(['members.manage', 'members.invite'], { allowCampusAdmin: true }),
  addMember
);
router.put(
  '/:clubId/members/:memberId',
  requireClubPermission(['members.manage', 'members.assign_positions'], { allowCampusAdmin: true }),
  updateMemberRole
);
router.delete(
  '/:clubId/members/:memberId',
  requireClubPermission(['members.manage'], { allowCampusAdmin: true }),
  removeMember
);
router.post(
  '/:clubId/members/:userId/suspend',
  requireClubPermission(['members.manage'], { allowCampusAdmin: true }),
  suspendMember
);
router.post(
  '/:clubId/members/:userId/reinstate',
  requireClubPermission(['members.manage'], { allowCampusAdmin: true }),
  reinstateMember
);

router.post(
  '/:clubId/assignments',
  requireClubPermission(['members.assign_positions'], { allowCampusAdmin: true }),
  assignPositionToMember
);
router.post(
  '/:clubId/assignments/:assignmentId/end',
  requireClubPermission(['members.assign_positions'], { allowCampusAdmin: true }),
  endPositionAssignment
);

router.get(
  '/:clubId/invitations',
  requireClubPermission(['members.invite', 'members.manage'], { allowCampusAdmin: true }),
  listClubInvitations
);
router.post(
  '/:clubId/invitations',
  requireClubPermission(['members.invite'], { allowCampusAdmin: true }),
  createClubInvitation
);
router.post(
  '/:clubId/invitations/:invId/revoke',
  requireClubPermission(['members.invite'], { allowCampusAdmin: true }),
  revokeClubInvitation
);

router.post('/:clubId/join-requests', createJoinRequest);
router.get(
  '/:clubId/join-requests',
  requireClubPermission(['members.approve_requests', 'members.manage'], { allowCampusAdmin: true }),
  listJoinRequests
);
router.post(
  '/:clubId/join-requests/:requestId/review',
  requireClubPermission(['members.approve_requests', 'members.manage'], { allowCampusAdmin: true }),
  reviewJoinRequest
);

export default router;
