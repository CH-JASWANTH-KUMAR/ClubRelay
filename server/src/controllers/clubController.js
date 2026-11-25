import mongoose from 'mongoose';
import { z } from 'zod';
import {
  Club,
  Membership,
  ClubMembership,
  ClubDepartment,
  ClubPosition,
  ClubPositionAssignment,
  ClubJoinRequest,
  User,
  Event,
  Handover,
  AcademicTerm,
} from '../models/index.js';
import { resolveClubAccess } from '../services/rbacService.js';

const createClubSchema = z.object({
  name: z.string().min(2),
  code: z.string().min(2).max(10).toUpperCase(),
  category: z.enum(['TECHNICAL', 'CULTURAL', 'ACADEMIC', 'ENTREPRENEURSHIP', 'SOCIAL', 'SPORTS']),
  description: z.string().optional(),
  facultyCoordinatorId: z.string().optional(),
  logoUrl: z.string().optional(),
});

const addMemberSchema = z.object({
  email: z.string().email(),
  clubRole: z.enum(['PRESIDENT', 'SECRETARY', 'CORE_TEAM', 'GENERAL_MEMBER']),
  title: z.string().optional(),
  academicTermId: z.string().optional(),
});

export async function listClubs(req, res, next) {
  try {
    const filter = {
      campusId: req.campusId || null,
      status: { $ne: 'DRAFT' },
    };
    if (req.query.category) {
      filter.category = req.query.category;
    }

    const clubs = await Club.find(filter)
      .populate('facultyCoordinatorId', 'fullName department avatarUrl')
      .sort({ name: 1 });

    return res.json({
      success: true,
      data: { clubs },
    });
  } catch (err) {
    next(err);
  }
}

export async function createClub(req, res, next) {
  try {
    const data = createClubSchema.parse(req.body);

    const club = await Club.create({
      campusId: req.campusId,
      name: data.name,
      code: data.code,
      category: data.category,
      description: data.description || '',
      facultyCoordinatorId: data.facultyCoordinatorId || null,
      logoUrl: data.logoUrl || '',
    });

    return res.status(201).json({
      success: true,
      data: { club },
    });
  } catch (err) {
    next(err);
  }
}

export async function getClub(req, res, next) {
  try {
    const club = await Club.findById(req.params.clubId)
      .populate('facultyCoordinatorId', 'fullName department avatarUrl email')
      .populate('workspaceOwnerId', 'fullName avatarUrl department')
      .populate('activeTermId', 'name startDate endDate isCurrent');

    if (!club) {
      return res.status(404).json({
        success: false,
        error: { code: 'CLUB_NOT_FOUND', message: 'Organization not found in this workspace.' },
      });
    }

    // Tenant isolation check
    const clubCampusStr = club.campusId ? club.campusId.toString() : null;
    const reqCampusStr = req.campusId ? req.campusId.toString() : null;
    if (clubCampusStr && reqCampusStr && clubCampusStr !== reqCampusStr) {
      return res.status(404).json({
        success: false,
        error: { code: 'CLUB_NOT_FOUND', message: 'Organization not found in this campus workspace.' },
      });
    }

    const access = await resolveClubAccess(req.user, club, {
      allowCampusAdmin: true,
      allowAssignedFaculty: true,
    });

    if (access.tenantMismatch || (!clubCampusStr && !access.allowed)) {
      return res.status(404).json({
        success: false,
        error: { code: 'CLUB_NOT_FOUND', message: 'Organization not found in this workspace.' },
      });
    }

    const isAuthorized = access.allowed;
    const userFields = isAuthorized
      ? 'fullName email avatarUrl department'
      : 'fullName avatarUrl department';

    // Load custom structure & assignments first; fall back to legacy Membership when unmigrated
    const [departments, positions, activeAssignments, legacyLeadership, legacyCount, customCount, eventCount, latestHandover, pendingJoinRequestsCount] =
      await Promise.all([
        ClubDepartment.find({ clubId: club._id, isActive: true }).sort({ sortOrder: 1 }).lean(),
        ClubPosition.find({ clubId: club._id, isActive: true }).sort({ sortOrder: 1 }).lean(),
        ClubPositionAssignment.find({ clubId: club._id, status: 'ACTIVE' })
          .populate('positionId', 'name isLeadership departmentId parentPositionId sortOrder')
          .populate('userId', userFields)
          .populate('academicTermId', 'name isCurrent')
          .sort({ createdAt: 1 })
          .lean(),
        Membership.find({
          clubId: club._id,
          status: 'ACTIVE',
          clubRole: { $in: ['PRESIDENT', 'SECRETARY', 'CORE_TEAM'] },
        }).populate('userId', userFields),
        Membership.countDocuments({ clubId: club._id, status: 'ACTIVE' }),
        ClubMembership.countDocuments({ clubId: club._id, status: 'ACTIVE' }),
        Event.countDocuments({ clubId: club._id }),
        isAuthorized
          ? Handover.findOne({ clubId: club._id })
              .populate('outgoingLeaderId', 'fullName email')
              .populate('incomingLeaderId', 'fullName email')
              .populate('positionId', 'name')
              .sort({ createdAt: -1 })
          : null,
        access.capabilities.has('members.approve_requests')
          ? ClubJoinRequest.countDocuments({ clubId: club._id, status: 'PENDING' })
          : 0,
      ]);

    // Build unified leadership roster using top-level/leadership custom positions when available
    let leadership = [];
    const customLeaders = activeAssignments.filter(
      (a) =>
        a.userId &&
        a.positionId &&
        (a.positionId.isLeadership || !a.positionId.parentPositionId)
    );

    if (customLeaders.length > 0) {
      leadership = customLeaders.map((a) => ({
        _id: a._id,
        userId: a.userId,
        positionId: a.positionId._id,
        title: a.positionId.name,
        clubRole: a.positionId.name,
        isLeadership: Boolean(a.positionId.isLeadership),
        academicTermId: a.academicTermId,
        status: a.status,
      }));
    } else if (legacyLeadership.length > 0) {
      leadership = legacyLeadership;
    }

    const sanitizedClub = club.toObject();
    if (!isAuthorized && sanitizedClub.facultyCoordinatorId) {
      delete sanitizedClub.facultyCoordinatorId.email;
      delete sanitizedClub.facultyCoordinatorId.phone;
    }

    const memberCount = Math.max(customCount, legacyCount);

    const metrics = {
      memberCount,
      eventCount,
      positionsCount: positions.length,
      departmentsCount: departments.length,
      pendingJoinRequestsCount,
      handoverProgress: isAuthorized && latestHandover ? latestHandover.completionPercentage : null,
      latestHandoverStatus: isAuthorized && latestHandover ? latestHandover.status : null,
    };

    return res.json({
      success: true,
      data: {
        club: sanitizedClub,
        departments,
        positions,
        leadership,
        latestHandover: isAuthorized ? latestHandover : null,
        metrics,
        isAuthorized,
        userAccess: {
          capabilities: access.capabilitiesList,
          positions: access.positions,
          isWorkspaceOwner: access.isWorkspaceOwner,
          isCampusAdmin: access.isCampusAdmin,
          isAssignedFaculty: access.isAssignedFaculty,
        },
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function getMembers(req, res, next) {
  try {
    const canViewSensitive =
      req.user.campusRole === 'CAMPUS_ADMIN' ||
      req.userCapabilities?.has('members.view_sensitive') ||
      ['PRESIDENT', 'SECRETARY'].includes(req.userClubRole);

    const selectFields = canViewSensitive
      ? 'fullName email avatarUrl department phone'
      : 'fullName email avatarUrl department';

    const clubId = req.params.clubId;
    const includeHistory = req.query.includeHistory === 'true';
    const includeAllStatus = req.query.includeAllStatus === 'true';
    const filterTermId = req.query.academicTermId || null;

    const legacyFilter = {
      clubId,
      status: 'ACTIVE',
    };
    if (filterTermId) legacyFilter.academicTermId = filterTermId;

    const customFilter = {
      clubId,
      status: includeAllStatus ? { $in: ['ACTIVE', 'SUSPENDED'] } : 'ACTIVE',
    };

    const assignmentFilter = { clubId };
    if (!includeHistory) assignmentFilter.status = 'ACTIVE';
    if (filterTermId) {
      assignmentFilter.$or = [{ academicTermId: filterTermId }, { academicTermId: null }];
    }

    const [customMembers, legacyMembers, assignments, positions] = await Promise.all([
      ClubMembership.find(customFilter)
        .populate('userId', selectFields)
        .sort({ joinedAt: 1 })
        .lean(),
      Membership.find(legacyFilter)
        .populate('userId', selectFields)
        .populate('academicTermId', 'name isCurrent startDate endDate')
        .sort({ clubRole: 1, createdAt: 1 })
        .lean(),
      ClubPositionAssignment.find(assignmentFilter)
        .populate('positionId', 'name isLeadership departmentId permissions')
        .populate('academicTermId', 'name isCurrent')
        .sort({ effectiveFrom: -1 })
        .lean(),
      ClubPosition.find({ clubId, isActive: true }).sort({ sortOrder: 1 }).lean(),
    ]);

    const assignmentsByUser = new Map();
    for (const a of assignments) {
      const uid = a.userId?.toString();
      if (!uid) continue;
      if (!assignmentsByUser.has(uid)) assignmentsByUser.set(uid, []);
      assignmentsByUser.get(uid).push(a);
    }

    // Merge ClubMembership and legacy Membership deduplicated by userId when no specific term forces multiple
    const mergedByUser = new Map();
    const blockedStatuses = new Map();
    const allCustomDocs = await ClubMembership.find({ clubId }).select('userId status').lean();
    for (const doc of allCustomDocs) {
      blockedStatuses.set(doc.userId.toString(), doc.status);
    }

    for (const cm of customMembers) {
      if (!cm.userId) continue;
      const uid = cm.userId._id.toString();
      const userAssignments = assignmentsByUser.get(uid) || [];
      const activePos = userAssignments.filter((a) => a.status === 'ACTIVE' && a.positionId);

      mergedByUser.set(uid, {
        _id: cm._id,
        clubId: cm.clubId,
        userId: cm.userId,
        status: cm.status,
        membershipType: cm.membershipType,
        joinedAt: cm.joinedAt,
        clubRole: activePos[0]?.positionId?.name || cm.legacyRole || 'MEMBER',
        title: activePos.map((a) => a.positionId.name).join(', ') || cm.legacyRole || 'Member',
        isWorkspaceOwner:
          req.club?.workspaceOwnerId?.toString() === uid,
        assignedPositions: userAssignments,
        academicTermId: activePos[0]?.academicTermId || null,
      });
    }

    for (const lm of legacyMembers) {
      if (!lm.userId) continue;
      const uid = lm.userId._id.toString();
      const customStatus = blockedStatuses.get(uid);
      if (customStatus && customStatus !== 'ACTIVE' && !includeAllStatus) continue;

      if (!mergedByUser.has(uid)) {
        const userAssignments = assignmentsByUser.get(uid) || [];
        mergedByUser.set(uid, {
          ...lm,
          isWorkspaceOwner: req.club?.workspaceOwnerId?.toString() === uid,
          assignedPositions: userAssignments,
        });
      } else if (!mergedByUser.get(uid).academicTermId && lm.academicTermId) {
        mergedByUser.get(uid).academicTermId = lm.academicTermId;
      }
    }

    return res.json({
      success: true,
      data: {
        members: Array.from(mergedByUser.values()),
        positions,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function addMember(req, res, next) {
  try {
    const data = addMemberSchema.parse(req.body);

    const targetUser = await User.findOne({
      campusId: req.campusId,
      email: data.email.toLowerCase(),
    });

    if (!targetUser) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: 'No registered student found with this email on this campus.',
        },
      });
    }

    let targetTerm;
    if (data.academicTermId) {
      if (!mongoose.Types.ObjectId.isValid(data.academicTermId)) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_ACADEMIC_TERM',
            message: 'Academic term ID must be a valid identifier.',
          },
        });
      }

      targetTerm = await AcademicTerm.findOne({
        _id: data.academicTermId,
        campusId: req.campusId,
      });

      if (!targetTerm) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'ACADEMIC_TERM_NOT_FOUND',
            message: 'The selected academic term does not exist on this campus.',
          },
        });
      }
    } else {
      targetTerm = await AcademicTerm.findOne({
        campusId: req.campusId,
        isCurrent: true,
      });

      if (!targetTerm) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'NO_CURRENT_TERM',
            message: 'No active academic term configured for this campus.',
          },
        });
      }
    }

    // Check existing membership for this specific term
    const existingMembership = await Membership.findOne({
      campusId: req.campusId,
      clubId: req.params.clubId,
      userId: targetUser._id,
      academicTermId: targetTerm._id,
    });

    if (existingMembership) {
      if (existingMembership.status === 'ACTIVE') {
        return res.status(400).json({
          success: false,
          error: {
            code: 'MEMBERSHIP_ALREADY_EXISTS',
            message: 'This user already holds an active membership for the selected academic term.',
          },
        });
      }

      // Reactivate previously inactive/revoked membership for this specific term
      existingMembership.status = 'ACTIVE';
      existingMembership.clubRole = data.clubRole;
      existingMembership.title = data.title || '';
      await existingMembership.save();

      const populated = await Membership.findById(existingMembership._id)
        .populate('userId', 'fullName email avatarUrl department phone')
        .populate('academicTermId', 'name isCurrent');

      return res.status(200).json({
        success: true,
        data: { membership: populated },
      });
    }

    const membership = await Membership.create({
      campusId: req.campusId,
      clubId: req.params.clubId,
      userId: targetUser._id,
      academicTermId: targetTerm._id,
      clubRole: data.clubRole,
      title: data.title || '',
      status: 'ACTIVE',
    });

    const populated = await Membership.findById(membership._id)
      .populate('userId', 'fullName email avatarUrl department phone')
      .populate('academicTermId', 'name isCurrent');

    return res.status(201).json({
      success: true,
      data: { membership: populated },
    });
  } catch (err) {
    next(err);
  }
}

export async function updateMemberRole(req, res, next) {
  try {
    const { clubRole, title } = req.body;

    const membership = await Membership.findOneAndUpdate(
      {
        _id: req.params.memberId,
        clubId: req.params.clubId,
        campusId: req.campusId,
      },
      {
        ...(clubRole && { clubRole }),
        ...(title !== undefined && { title }),
      },
      { new: true }
    ).populate('userId', 'fullName email avatarUrl');

    if (!membership) {
      return res.status(404).json({
        success: false,
        error: { code: 'MEMBERSHIP_NOT_FOUND', message: 'Membership not found.' },
      });
    }

    return res.json({
      success: true,
      data: { membership },
    });
  } catch (err) {
    next(err);
  }
}

export async function removeMember(req, res, next) {
  try {
    const legacy = await Membership.findOneAndUpdate(
      {
        _id: req.params.memberId,
        clubId: req.params.clubId,
        campusId: req.campusId || null,
      },
      { status: 'REVOKED' },
      { new: true }
    );

    const custom = await ClubMembership.findOneAndUpdate(
      {
        $or: [{ _id: req.params.memberId }, { userId: req.params.memberId }],
        clubId: req.params.clubId,
      },
      { status: 'LEFT', leftAt: new Date() },
      { new: true }
    );

    if (!legacy && !custom) {
      return res.status(404).json({
        success: false,
        error: { code: 'MEMBERSHIP_NOT_FOUND', message: 'Membership not found.' },
      });
    }

    const targetUserId = custom?.userId || legacy?.userId;
    if (targetUserId) {
      await Promise.all([
        ClubMembership.updateMany(
          { clubId: req.params.clubId, userId: targetUserId, status: 'ACTIVE' },
          { $set: { status: 'LEFT', leftAt: new Date() } }
        ),
        Membership.updateMany(
          { clubId: req.params.clubId, userId: targetUserId, status: 'ACTIVE' },
          { $set: { status: 'REVOKED' } }
        ),
        ClubPositionAssignment.updateMany(
          { clubId: req.params.clubId, userId: targetUserId, status: 'ACTIVE' },
          { $set: { status: 'ENDED', effectiveTo: new Date(), endedReason: 'Removed from organization' } }
        ),
      ]);
    }

    return res.json({
      success: true,
      message: 'Member removed successfully.',
    });
  } catch (err) {
    next(err);
  }
}
