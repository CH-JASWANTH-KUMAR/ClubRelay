import { z } from 'zod';
import {
  Club,
  ClubDepartment,
  ClubPosition,
  ClubMembership,
  ClubPositionAssignment,
  ClubInvitation,
  ClubJoinRequest,
  AcademicTerm,
  Membership,
  User,
  AuditLog,
  Notification,
} from '../models/index.js';
import { PERMISSION_MODULES, normalizePermissions } from '../constants/permissions.js';
import {
  generateRawToken,
  hashInvitationToken,
  wouldCreatePositionCycle,
} from '../services/rbacService.js';

const departmentSchema = z.object({
  name: z.string().trim().min(2).max(80),
  description: z.string().trim().max(400).optional(),
  color: z.string().trim().max(24).optional(),
  sortOrder: z.number().int().optional(),
  isActive: z.boolean().optional(),
});

const positionSchema = z.object({
  name: z.string().trim().min(2).max(80),
  description: z.string().trim().max(500).optional(),
  departmentId: z.string().nullable().optional(),
  parentPositionId: z.string().nullable().optional(),
  isLeadership: z.boolean().optional(),
  maxHolders: z.number().int().min(1).nullable().optional(),
  permissions: z.array(z.string()).default([]),
  sortOrder: z.number().int().optional(),
  isActive: z.boolean().optional(),
});

const assignPositionSchema = z.object({
  userId: z.string().min(1),
  positionId: z.string().min(1),
  academicTermId: z.string().nullable().optional(),
  termLabel: z.string().trim().max(60).optional(),
  effectiveTo: z.string().nullable().optional(),
});

const createInvitationSchema = z.object({
  email: z.string().trim().email(),
  intendedPositionIds: z.array(z.string()).default([]),
  academicTermId: z.string().nullable().optional(),
  message: z.string().trim().max(500).optional(),
  expiresInDays: z.number().int().min(1).max(30).default(7),
});

const joinRequestSchema = z.object({
  message: z.string().trim().max(500).optional(),
  preferredPositionIds: z.array(z.string()).optional(),
});

const reviewJoinRequestSchema = z.object({
  decision: z.enum(['APPROVED', 'REJECTED']),
  assignPositionIds: z.array(z.string()).optional(),
  reviewNotes: z.string().trim().max(500).optional(),
});

const createTermSchema = z.object({
  name: z.string().trim().min(2).max(60),
  startDate: z.string(),
  endDate: z.string(),
  setActive: z.boolean().default(true),
});

function slugify(value) {
  return (
    String(value || '')
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '') || 'role'
  );
}

export async function getClubStructure(req, res, next) {
  try {
    const club = req.club;
    const termFilterId = req.query.academicTermId || club.activeTermId || null;

    const termQuery = club.campusId
      ? { $or: [{ campusId: club.campusId, clubId: null }, { clubId: club._id }] }
      : { clubId: club._id };

    const [departments, positions, assignments, terms] = await Promise.all([
      ClubDepartment.find({ clubId: club._id }).sort({ sortOrder: 1, name: 1 }).lean(),
      ClubPosition.find({ clubId: club._id }).sort({ sortOrder: 1, name: 1 }).lean(),
      ClubPositionAssignment.find({
        clubId: club._id,
        status: 'ACTIVE',
      })
        .populate('userId', 'fullName avatarUrl department')
        .populate('academicTermId', 'name isCurrent')
        .lean(),
      AcademicTerm.find(termQuery).sort({ startDate: -1 }).lean(),
    ]);

    const assignmentsByPosition = {};
    for (const a of assignments) {
      const pid = a.positionId.toString();
      if (!assignmentsByPosition[pid]) assignmentsByPosition[pid] = [];
      assignmentsByPosition[pid].push({
        _id: a._id,
        user: a.userId,
        academicTerm: a.academicTermId,
        termLabel: a.termLabel || a.academicTermId?.name || '',
        effectiveFrom: a.effectiveFrom,
        effectiveTo: a.effectiveTo,
        status: a.status,
      });
    }

    const activeTerm =
      terms.find((t) => termFilterId && t._id.toString() === termFilterId.toString()) ||
      terms.find((t) => t.isCurrent) ||
      terms[0] ||
      null;

    return res.json({
      success: true,
      data: {
        club: {
          _id: club._id,
          name: club.name,
          code: club.code,
          status: club.status,
          structureMode: club.structureMode,
          workspaceOwnerId: club.workspaceOwnerId,
          activeTermId: club.activeTermId,
        },
        departments,
        positions,
        assignmentsByPosition,
        terms,
        activeTerm,
        permissionsCatalogue: PERMISSION_MODULES,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function createDepartment(req, res, next) {
  try {
    const data = departmentSchema.parse(req.body);
    const department = await ClubDepartment.create({
      campusId: req.club.campusId || null,
      clubId: req.club._id,
      name: data.name,
      description: data.description || '',
      color: data.color || '#315BDB',
      sortOrder: data.sortOrder ?? 0,
    });

    return res.status(201).json({
      success: true,
      data: { department },
    });
  } catch (err) {
    next(err);
  }
}

export async function updateDepartment(req, res, next) {
  try {
    const data = departmentSchema.partial().parse(req.body);
    const department = await ClubDepartment.findOneAndUpdate(
      { _id: req.params.deptId, clubId: req.club._id },
      { $set: data },
      { new: true }
    );
    if (!department) {
      return res.status(404).json({
        success: false,
        error: { code: 'DEPARTMENT_NOT_FOUND', message: 'Department not found.' },
      });
    }
    return res.json({ success: true, data: { department } });
  } catch (err) {
    next(err);
  }
}

export async function deleteDepartment(req, res, next) {
  try {
    const department = await ClubDepartment.findOneAndDelete({
      _id: req.params.deptId,
      clubId: req.club._id,
    });
    if (!department) {
      return res.status(404).json({
        success: false,
        error: { code: 'DEPARTMENT_NOT_FOUND', message: 'Department not found.' },
      });
    }
    await ClubPosition.updateMany(
      { clubId: req.club._id, departmentId: department._id },
      { $set: { departmentId: null } }
    );
    return res.json({ success: true, message: 'Department deleted.' });
  } catch (err) {
    next(err);
  }
}

export async function createPosition(req, res, next) {
  try {
    const data = positionSchema.parse(req.body);

    if (data.parentPositionId) {
      const parent = await ClubPosition.findOne({
        _id: data.parentPositionId,
        clubId: req.club._id,
      });
      if (!parent) {
        return res.status(400).json({
          success: false,
          error: { code: 'INVALID_PARENT_POSITION', message: 'Parent position does not belong to this organization.' },
        });
      }
    }

    if (data.departmentId) {
      const dept = await ClubDepartment.findOne({ _id: data.departmentId, clubId: req.club._id });
      if (!dept) {
        return res.status(400).json({
          success: false,
          error: { code: 'INVALID_DEPARTMENT', message: 'Department does not belong to this organization.' },
        });
      }
    }

    const baseSlug = slugify(data.name);
    let slug = baseSlug;
    let suffix = 1;
    while (await ClubPosition.exists({ clubId: req.club._id, slug })) {
      slug = `${baseSlug}-${suffix++}`;
    }

    const position = await ClubPosition.create({
      campusId: req.club.campusId || null,
      clubId: req.club._id,
      departmentId: data.departmentId || null,
      name: data.name,
      slug,
      description: data.description || '',
      parentPositionId: data.parentPositionId || null,
      isLeadership: Boolean(data.isLeadership),
      maxHolders: data.maxHolders ?? null,
      permissions: normalizePermissions(data.permissions),
      sortOrder: data.sortOrder ?? 0,
      isActive: data.isActive ?? true,
    });

    req.club.structureMode = 'CUSTOM';
    await req.club.save();

    await AuditLog.create({
      campusId: req.club.campusId || null,
      clubId: req.club._id,
      actorId: req.user._id,
      action: 'POSITION_CREATED',
      targetType: 'ClubPosition',
      targetId: position._id,
      metadata: { name: position.name, permissionsCount: position.permissions.length },
    });

    return res.status(201).json({
      success: true,
      data: { position },
    });
  } catch (err) {
    next(err);
  }
}

export async function updatePosition(req, res, next) {
  try {
    const data = positionSchema.partial().parse(req.body);
    const position = await ClubPosition.findOne({
      _id: req.params.positionId,
      clubId: req.club._id,
    });

    if (!position) {
      return res.status(404).json({
        success: false,
        error: { code: 'POSITION_NOT_FOUND', message: 'Position not found.' },
      });
    }

    if (data.parentPositionId !== undefined && data.parentPositionId !== null) {
      const parent = await ClubPosition.findOne({
        _id: data.parentPositionId,
        clubId: req.club._id,
      });
      if (!parent) {
        return res.status(400).json({
          success: false,
          error: { code: 'INVALID_PARENT_POSITION', message: 'Parent position must belong to this organization.' },
        });
      }

      const hasCycle = await wouldCreatePositionCycle(
        req.club._id,
        position._id,
        data.parentPositionId
      );
      if (hasCycle) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'CIRCULAR_POSITION_HIERARCHY',
            message: 'Parent assignment would create a circular reporting hierarchy.',
          },
        });
      }
    }

    if (data.maxHolders !== undefined && data.maxHolders !== null) {
      const activeCount = await ClubPositionAssignment.countDocuments({
        clubId: req.club._id,
        positionId: position._id,
        status: 'ACTIVE',
      });
      if (activeCount > data.maxHolders) {
        return res.status(409).json({
          success: false,
          error: {
            code: 'HOLDER_LIMIT_EXCEEDED',
            message: `Cannot set max holders to ${data.maxHolders}; ${activeCount} active holder(s) currently occupy this position.`,
          },
        });
      }
    }

    if (data.name !== undefined) position.name = data.name;
    if (data.description !== undefined) position.description = data.description;
    if (data.departmentId !== undefined) position.departmentId = data.departmentId;
    if (data.parentPositionId !== undefined) position.parentPositionId = data.parentPositionId;
    if (data.isLeadership !== undefined) position.isLeadership = data.isLeadership;
    if (data.maxHolders !== undefined) position.maxHolders = data.maxHolders;
    if (data.permissions !== undefined) position.permissions = normalizePermissions(data.permissions);
    if (data.sortOrder !== undefined) position.sortOrder = data.sortOrder;
    if (data.isActive !== undefined) position.isActive = data.isActive;

    await position.save();

    await AuditLog.create({
      campusId: req.club.campusId || null,
      clubId: req.club._id,
      actorId: req.user._id,
      action: 'POSITION_UPDATED',
      targetType: 'ClubPosition',
      targetId: position._id,
      metadata: { name: position.name, isActive: position.isActive },
    });

    return res.json({
      success: true,
      data: { position },
    });
  } catch (err) {
    next(err);
  }
}

export async function deletePosition(req, res, next) {
  try {
    const position = await ClubPosition.findOne({
      _id: req.params.positionId,
      clubId: req.club._id,
    });
    if (!position) {
      return res.status(404).json({
        success: false,
        error: { code: 'POSITION_NOT_FOUND', message: 'Position not found.' },
      });
    }

    const activeAssignments = await ClubPositionAssignment.countDocuments({
      clubId: req.club._id,
      positionId: position._id,
      status: 'ACTIVE',
    });

    if (activeAssignments > 0) {
      return res.status(409).json({
        success: false,
        error: {
          code: 'POSITION_HAS_ACTIVE_HOLDERS',
          message: 'End or reassign active position holders before deleting this position.',
        },
      });
    }

    // Re-parent any child positions cleanly so the tree remains connected
    await ClubPosition.updateMany(
      { clubId: req.club._id, parentPositionId: position._id },
      { $set: { parentPositionId: position.parentPositionId || null } }
    );

    const historicalCount = await ClubPositionAssignment.countDocuments({
      clubId: req.club._id,
      positionId: position._id,
    });

    if (historicalCount > 0) {
      // Preserve historical assignments integrity by archiving rather than hard deleting
      position.isActive = false;
      position.parentPositionId = null;
      await position.save();
      return res.json({
        success: true,
        message: 'Position archived to preserve historical tenure records.',
        data: { archived: true, position },
      });
    }

    await ClubPosition.deleteOne({ _id: position._id });
    return res.json({
      success: true,
      message: 'Position deleted.',
      data: { archived: false },
    });
  } catch (err) {
    next(err);
  }
}

export async function assignPositionToMember(req, res, next) {
  try {
    const data = assignPositionSchema.parse(req.body);
    const [position, membership] = await Promise.all([
      ClubPosition.findOne({ _id: data.positionId, clubId: req.club._id, isActive: true }),
      ClubMembership.findOne({ clubId: req.club._id, userId: data.userId, status: 'ACTIVE' }),
    ]);

    if (!position) {
      return res.status(404).json({
        success: false,
        error: { code: 'POSITION_NOT_FOUND', message: 'Active position not found in this organization.' },
      });
    }

    let resolvedMembership = membership;
    if (!resolvedMembership) {
      const legacy = await Membership.findOne({
        clubId: req.club._id,
        userId: data.userId,
        status: 'ACTIVE',
      });
      if (!legacy) {
        return res.status(400).json({
          success: false,
          error: { code: 'MEMBER_NOT_ACTIVE', message: 'User must be an active member before assigning a position.' },
        });
      }
      resolvedMembership = await ClubMembership.create({
        campusId: req.club.campusId || null,
        clubId: req.club._id,
        userId: data.userId,
        status: 'ACTIVE',
        joinedAt: legacy.joinedAt || new Date(),
        legacyRole: legacy.clubRole,
      });
    }

    const existingDuplicate = await ClubPositionAssignment.findOne({
      clubId: req.club._id,
      userId: data.userId,
      positionId: position._id,
      status: 'ACTIVE',
    });

    if (existingDuplicate) {
      return res.status(409).json({
        success: false,
        error: { code: 'ALREADY_ASSIGNED', message: 'Member already holds this active position.' },
      });
    }

    if (position.maxHolders) {
      const count = await ClubPositionAssignment.countDocuments({
        clubId: req.club._id,
        positionId: position._id,
        status: 'ACTIVE',
      });
      if (count >= position.maxHolders) {
        return res.status(409).json({
          success: false,
          error: {
            code: 'HOLDER_LIMIT_REACHED',
            message: `${position.name} allows at most ${position.maxHolders} concurrent holder(s).`,
          },
        });
      }
    }

    const termId = data.academicTermId || req.club.activeTermId || null;
    const assignment = await ClubPositionAssignment.create({
      campusId: req.club.campusId || null,
      clubId: req.club._id,
      membershipId: resolvedMembership._id,
      userId: data.userId,
      positionId: position._id,
      academicTermId: termId,
      termLabel: data.termLabel || '',
      effectiveFrom: new Date(),
      effectiveTo: data.effectiveTo ? new Date(data.effectiveTo) : null,
      status: 'ACTIVE',
      assignedById: req.user._id,
    });

    const populated = await ClubPositionAssignment.findById(assignment._id)
      .populate('positionId', 'name permissions isLeadership departmentId')
      .populate('userId', 'fullName email avatarUrl department')
      .populate('academicTermId', 'name isCurrent');

    await AuditLog.create({
      campusId: req.club.campusId || null,
      clubId: req.club._id,
      actorId: req.user._id,
      action: 'POSITION_ASSIGNED',
      targetType: 'ClubPositionAssignment',
      targetId: assignment._id,
      metadata: { targetUserId: data.userId, positionId: position._id.toString() },
    });

    return res.status(201).json({
      success: true,
      data: { assignment: populated },
    });
  } catch (err) {
    next(err);
  }
}

export async function endPositionAssignment(req, res, next) {
  try {
    const reason = typeof req.body?.reason === 'string' ? req.body.reason.trim() : 'Tenure completed';
    const status = req.body?.status === 'REVOKED' ? 'REVOKED' : 'ENDED';

    const assignment = await ClubPositionAssignment.findOne({
      _id: req.params.assignmentId,
      clubId: req.club._id,
    });

    if (!assignment) {
      return res.status(404).json({
        success: false,
        error: { code: 'ASSIGNMENT_NOT_FOUND', message: 'Position assignment not found.' },
      });
    }

    assignment.status = status;
    assignment.effectiveTo = new Date();
    assignment.endedReason = reason;
    await assignment.save();

    await AuditLog.create({
      campusId: req.club.campusId || null,
      clubId: req.club._id,
      actorId: req.user._id,
      action: 'POSITION_TENURE_ENDED',
      targetType: 'ClubPositionAssignment',
      targetId: assignment._id,
      metadata: { status, reason },
    });

    return res.json({
      success: true,
      data: { assignment },
    });
  } catch (err) {
    next(err);
  }
}

export async function listClubInvitations(req, res, next) {
  try {
    const invitations = await ClubInvitation.find({ clubId: req.club._id })
      .select('-tokenHash')
      .populate('invitedById', 'fullName')
      .populate('intendedPositionIds', 'name')
      .sort({ createdAt: -1 })
      .lean();

    return res.json({
      success: true,
      data: { invitations },
    });
  } catch (err) {
    next(err);
  }
}

export async function createClubInvitation(req, res, next) {
  try {
    const data = createInvitationSchema.parse(req.body);
    const emailLower = data.email.toLowerCase();

    // Validate intended positions belong to this club
    const validPositions = data.intendedPositionIds.length
      ? await ClubPosition.find({
          _id: { $in: data.intendedPositionIds },
          clubId: req.club._id,
          isActive: true,
        }).select('_id name')
      : [];

    const rawToken = generateRawToken();
    const expiresAt = new Date(Date.now() + data.expiresInDays * 24 * 60 * 60 * 1000);

    const invitation = await ClubInvitation.create({
      campusId: req.club.campusId || null,
      clubId: req.club._id,
      invitedById: req.user._id,
      email: emailLower,
      tokenHash: hashInvitationToken(rawToken),
      intendedPositionIds: validPositions.map((p) => p._id),
      academicTermId: data.academicTermId || req.club.activeTermId || null,
      message: data.message || '',
      status: 'PENDING',
      expiresAt,
    });

    await AuditLog.create({
      campusId: req.club.campusId || null,
      clubId: req.club._id,
      actorId: req.user._id,
      action: 'INVITATION_CREATED',
      targetType: 'ClubInvitation',
      targetId: invitation._id,
      metadata: { positionCount: validPositions.length },
    });

    return res.status(201).json({
      success: true,
      data: {
        invitation: {
          _id: invitation._id,
          email: invitation.email,
          status: invitation.status,
          expiresAt: invitation.expiresAt,
          intendedPositions: validPositions,
        },
        // Returned once on creation so admin can share invite link securely
        inviteToken: rawToken,
        inviteUrl: `/invitations/accept?token=${rawToken}`,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function revokeClubInvitation(req, res, next) {
  try {
    const invitation = await ClubInvitation.findOneAndUpdate(
      { _id: req.params.invId, clubId: req.club._id, status: 'PENDING' },
      {
        $set: {
          status: 'REVOKED',
          revokedAt: new Date(),
          revokedById: req.user._id,
        },
      },
      { new: true }
    ).select('-tokenHash');

    if (!invitation) {
      return res.status(404).json({
        success: false,
        error: { code: 'INVITATION_NOT_FOUND', message: 'Pending invitation not found.' },
      });
    }

    await AuditLog.create({
      campusId: req.club.campusId || null,
      clubId: req.club._id,
      actorId: req.user._id,
      action: 'INVITATION_REVOKED',
      targetType: 'ClubInvitation',
      targetId: invitation._id,
    });

    return res.json({
      success: true,
      data: { invitation },
    });
  } catch (err) {
    next(err);
  }
}

export async function createJoinRequest(req, res, next) {
  try {
    const data = joinRequestSchema.parse(req.body || {});
    const club = await Club.findById(req.params.clubId);

    if (!club || club.status !== 'ACTIVE') {
      return res.status(404).json({
        success: false,
        error: { code: 'CLUB_NOT_FOUND', message: 'Active organization not found.' },
      });
    }

    if (club.campusId && (!req.campusId || club.campusId.toString() !== req.campusId.toString())) {
      return res.status(403).json({
        success: false,
        error: { code: 'TENANT_MISMATCH', message: 'Cannot join an organization from another campus workspace.' },
      });
    }

    const existingMembership = await ClubMembership.findOne({
      clubId: club._id,
      userId: req.user._id,
    });
    if (existingMembership && existingMembership.status === 'ACTIVE') {
      return res.status(409).json({
        success: false,
        error: { code: 'ALREADY_MEMBER', message: 'You are already an active member of this organization.' },
      });
    }
    if (existingMembership && existingMembership.status === 'SUSPENDED') {
      return res.status(403).json({
        success: false,
        error: { code: 'MEMBERSHIP_SUSPENDED', message: 'Your membership in this organization is currently suspended.' },
      });
    }

    if (club.joinPolicy === 'INVITE_ONLY') {
      return res.status(403).json({
        success: false,
        error: { code: 'INVITE_ONLY_ORG', message: 'This organization accepts members by invitation only.' },
      });
    }

    // Immediate join when joinPolicy === 'OPEN'
    if (club.joinPolicy === 'OPEN') {
      const membership = existingMembership
        ? await ClubMembership.findByIdAndUpdate(
            existingMembership._id,
            { $set: { status: 'ACTIVE', leftAt: null, joinedAt: new Date() } },
            { new: true }
          )
        : await ClubMembership.create({
            campusId: club.campusId || null,
            clubId: club._id,
            userId: req.user._id,
            status: 'ACTIVE',
            joinedAt: new Date(),
          });

      if (club.campusId && club.activeTermId) {
        await Membership.findOneAndUpdate(
          {
            campusId: club.campusId,
            clubId: club._id,
            userId: req.user._id,
            academicTermId: club.activeTermId,
          },
          {
            $setOnInsert: {
              campusId: club.campusId,
              clubId: club._id,
              userId: req.user._id,
              academicTermId: club.activeTermId,
              clubRole: 'GENERAL_MEMBER',
            },
            $set: { status: 'ACTIVE' },
          },
          { upsert: true }
        );
      }

      return res.status(201).json({
        success: true,
        message: `Joined ${club.name}.`,
        data: { joinedImmediately: true, membership },
      });
    }

    const existingReq = await ClubJoinRequest.findOne({
      clubId: club._id,
      userId: req.user._id,
      status: 'PENDING',
    });
    if (existingReq) {
      return res.status(409).json({
        success: false,
        error: { code: 'REQUEST_PENDING', message: 'You already have a pending join request for this organization.' },
      });
    }

    const joinRequest = await ClubJoinRequest.create({
      campusId: club.campusId || null,
      clubId: club._id,
      userId: req.user._id,
      message: data.message || '',
      preferredPositionIds: data.preferredPositionIds || [],
      status: 'PENDING',
    });

    if (club.workspaceOwnerId) {
      await Notification.create({
        campusId: club.campusId || null,
        userId: club.workspaceOwnerId,
        type: 'JOIN_REQUEST',
        title: `New Join Request: ${club.name}`,
        message: `${req.user.fullName} requested to join ${club.name}.`,
        link: `/clubs/${club._id}/members`,
      });
    }

    return res.status(201).json({
      success: true,
      message: 'Join request submitted for review.',
      data: { joinedImmediately: false, joinRequest },
    });
  } catch (err) {
    next(err);
  }
}

export async function listJoinRequests(req, res, next) {
  try {
    const requests = await ClubJoinRequest.find({
      clubId: req.club._id,
    })
      .populate('userId', 'fullName email department avatarUrl')
      .populate('preferredPositionIds', 'name')
      .populate('reviewedById', 'fullName')
      .sort({ createdAt: -1 })
      .lean();

    return res.json({
      success: true,
      data: { joinRequests: requests },
    });
  } catch (err) {
    next(err);
  }
}

export async function reviewJoinRequest(req, res, next) {
  try {
    const data = reviewJoinRequestSchema.parse(req.body);
    const requestDoc = await ClubJoinRequest.findOne({
      _id: req.params.requestId,
      clubId: req.club._id,
      status: 'PENDING',
    });

    if (!requestDoc) {
      return res.status(404).json({
        success: false,
        error: { code: 'JOIN_REQUEST_NOT_FOUND', message: 'Pending join request not found.' },
      });
    }

    requestDoc.status = data.decision;
    requestDoc.reviewedById = req.user._id;
    requestDoc.reviewedAt = new Date();
    requestDoc.reviewNotes = data.reviewNotes || '';
    await requestDoc.save();

    if (data.decision === 'APPROVED') {
      let clubMembership = await ClubMembership.findOne({
        clubId: req.club._id,
        userId: requestDoc.userId,
      });

      if (clubMembership) {
        clubMembership.status = 'ACTIVE';
        clubMembership.suspendedAt = null;
        clubMembership.leftAt = null;
        await clubMembership.save();
      } else {
        clubMembership = await ClubMembership.create({
          campusId: req.club.campusId || null,
          clubId: req.club._id,
          userId: requestDoc.userId,
          status: 'ACTIVE',
          joinedAt: new Date(),
        });
      }

      if (req.club.campusId && req.club.activeTermId) {
        await Membership.findOneAndUpdate(
          {
            campusId: req.club.campusId,
            clubId: req.club._id,
            userId: requestDoc.userId,
            academicTermId: req.club.activeTermId,
          },
          {
            $setOnInsert: {
              campusId: req.club.campusId,
              clubId: req.club._id,
              userId: requestDoc.userId,
              academicTermId: req.club.activeTermId,
              clubRole: 'GENERAL_MEMBER',
            },
            $set: { status: 'ACTIVE' },
          },
          { upsert: true }
        );
      }

      for (const posId of data.assignPositionIds || []) {
        const pos = await ClubPosition.findOne({ _id: posId, clubId: req.club._id, isActive: true });
        if (!pos) continue;
        const already = await ClubPositionAssignment.findOne({
          clubId: req.club._id,
          userId: requestDoc.userId,
          positionId: pos._id,
          status: 'ACTIVE',
        });
        if (!already) {
          await ClubPositionAssignment.create({
            campusId: req.club.campusId || null,
            clubId: req.club._id,
            membershipId: clubMembership._id,
            userId: requestDoc.userId,
            positionId: pos._id,
            academicTermId: req.club.activeTermId || null,
            effectiveFrom: new Date(),
            status: 'ACTIVE',
            assignedById: req.user._id,
          });
        }
      }

      await Notification.create({
        campusId: req.club.campusId || null,
        userId: requestDoc.userId,
        type: 'JOIN_APPROVED',
        title: `Welcome to ${req.club.name}`,
        message: `Your request to join ${req.club.name} was approved.`,
        link: `/clubs/${req.club._id}`,
      });
    }

    await AuditLog.create({
      campusId: req.club.campusId || null,
      clubId: req.club._id,
      actorId: req.user._id,
      action: `JOIN_REQUEST_${data.decision}`,
      targetType: 'ClubJoinRequest',
      targetId: requestDoc._id,
    });

    return res.json({
      success: true,
      data: { joinRequest: requestDoc },
    });
  } catch (err) {
    next(err);
  }
}

export async function suspendMember(req, res, next) {
  try {
    const targetUserId = req.params.userId;
    if (
      req.club.workspaceOwnerId &&
      req.club.workspaceOwnerId.toString() === targetUserId &&
      !req.isCampusAdmin
    ) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'CANNOT_SUSPEND_OWNER',
          message: 'Transfer workspace ownership before suspending the workspace owner.',
        },
      });
    }

    const reason = typeof req.body?.reason === 'string' ? req.body.reason.trim() : '';

    let clubMembership = await ClubMembership.findOne({
      clubId: req.club._id,
      userId: targetUserId,
    });

    if (!clubMembership) {
      const legacy = await Membership.findOne({ clubId: req.club._id, userId: targetUserId });
      if (!legacy) {
        return res.status(404).json({
          success: false,
          error: { code: 'MEMBERSHIP_NOT_FOUND', message: 'Member not found in this organization.' },
        });
      }
      clubMembership = await ClubMembership.create({
        campusId: req.club.campusId || null,
        clubId: req.club._id,
        userId: targetUserId,
        status: 'SUSPENDED',
        suspendedAt: new Date(),
        suspensionReason: reason,
        legacyRole: legacy.clubRole,
      });
    } else {
      clubMembership.status = 'SUSPENDED';
      clubMembership.suspendedAt = new Date();
      clubMembership.suspensionReason = reason;
      await clubMembership.save();
    }

    await Promise.all([
      Membership.updateMany(
        { clubId: req.club._id, userId: targetUserId, status: 'ACTIVE' },
        { $set: { status: 'REVOKED' } }
      ),
      ClubPositionAssignment.updateMany(
        { clubId: req.club._id, userId: targetUserId, status: 'ACTIVE' },
        { $set: { status: 'REVOKED', effectiveTo: new Date(), endedReason: reason || 'Member suspended' } }
      ),
    ]);

    await AuditLog.create({
      campusId: req.club.campusId || null,
      clubId: req.club._id,
      actorId: req.user._id,
      action: 'MEMBER_SUSPENDED',
      targetType: 'ClubMembership',
      targetId: clubMembership._id,
      metadata: { targetUserId, reason },
    });

    return res.json({
      success: true,
      data: { membership: clubMembership },
    });
  } catch (err) {
    next(err);
  }
}

export async function reinstateMember(req, res, next) {
  try {
    const clubMembership = await ClubMembership.findOneAndUpdate(
      { clubId: req.club._id, userId: req.params.userId },
      { $set: { status: 'ACTIVE', suspendedAt: null, suspensionReason: '' } },
      { new: true }
    );
    if (!clubMembership) {
      return res.status(404).json({
        success: false,
        error: { code: 'MEMBERSHIP_NOT_FOUND', message: 'Member record not found.' },
      });
    }
    return res.json({
      success: true,
      data: { membership: clubMembership },
    });
  } catch (err) {
    next(err);
  }
}

export async function transferWorkspaceOwnership(req, res, next) {
  try {
    const newOwnerId = req.body?.newOwnerId;
    if (!newOwnerId) {
      return res.status(400).json({
        success: false,
        error: { code: 'MISSING_NEW_OWNER', message: 'Target user ID is required.' },
      });
    }

    if (
      req.club.workspaceOwnerId &&
      req.club.workspaceOwnerId.toString() !== req.user._id.toString() &&
      req.user.campusRole !== 'CAMPUS_ADMIN'
    ) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'OWNER_ONLY',
          message: 'Only the current workspace owner or campus admin can transfer ownership.',
        },
      });
    }

    const [cm, lm] = await Promise.all([
      ClubMembership.findOne({ clubId: req.club._id, userId: newOwnerId, status: 'ACTIVE' }),
      Membership.findOne({ clubId: req.club._id, userId: newOwnerId, status: 'ACTIVE' }),
    ]);

    if (!cm && !lm) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'TARGET_NOT_ACTIVE_MEMBER',
          message: 'Ownership can only be transferred to an active organization member.',
        },
      });
    }

    const previousOwnerId = req.club.workspaceOwnerId;
    req.club.workspaceOwnerId = newOwnerId;
    await req.club.save();

    await AuditLog.create({
      campusId: req.club.campusId || null,
      clubId: req.club._id,
      actorId: req.user._id,
      action: 'WORKSPACE_OWNERSHIP_TRANSFERRED',
      targetType: 'Club',
      targetId: req.club._id,
      metadata: {
        previousOwnerId: previousOwnerId ? previousOwnerId.toString() : null,
        newOwnerId: newOwnerId.toString(),
      },
    });

    return res.json({
      success: true,
      data: { club: req.club },
    });
  } catch (err) {
    next(err);
  }
}

export async function createClubTerm(req, res, next) {
  try {
    const data = createTermSchema.parse(req.body);
    const scope = req.club.campusId
      ? { campusId: req.club.campusId, clubId: null }
      : { campusId: null, clubId: req.club._id };

    if (data.setActive) {
      await AcademicTerm.updateMany(scope, { $set: { isCurrent: false } });
    }

    const term = await AcademicTerm.create({
      ...scope,
      name: data.name,
      startDate: new Date(data.startDate),
      endDate: new Date(data.endDate),
      isCurrent: Boolean(data.setActive),
    });

    if (data.setActive) {
      req.club.activeTermId = term._id;
      await req.club.save();
    }

    await AuditLog.create({
      campusId: req.club.campusId || null,
      clubId: req.club._id,
      actorId: req.user._id,
      action: 'ACADEMIC_TERM_CREATED',
      targetType: 'AcademicTerm',
      targetId: term._id,
      metadata: { name: term.name, setActive: data.setActive },
    });

    return res.status(201).json({
      success: true,
      data: { term, activeTermId: req.club.activeTermId },
    });
  } catch (err) {
    next(err);
  }
}

