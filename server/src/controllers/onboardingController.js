import { z } from 'zod';
import {
  Club,
  ClubMembership,
  ClubPosition,
  ClubPositionAssignment,
  ClubInvitation,
  ClubJoinRequest,
  CampusRequest,
  Membership,
  User,
  AuditLog,
  Notification,
} from '../models/index.js';
import { PERMISSION_MODULES } from '../constants/permissions.js';
import { ORGANIZATION_TEMPLATES } from '../constants/templates.js';
import { hashInvitationToken } from '../services/rbacService.js';

const campusRequestSchema = z
  .object({
    universityName: z.string().trim().min(2, 'University or institution name is required').max(140),
    domain: z.string().trim().min(3, 'Institutional domain is required').max(120),
    city: z.string().trim().max(100).optional(),
    notes: z.string().trim().max(500).optional(),
  })
  .strict();

const acceptInvitationSchema = z
  .object({
    token: z.string().trim().min(16).optional(),
    invitationId: z.string().trim().optional(),
  })
  .refine((v) => Boolean(v.token || v.invitationId), {
    message: 'An invitation token or invitation ID is required.',
  });

export async function getOnboardingSummary(req, res, next) {
  try {
    const campusId = req.campusId || null;
    const now = new Date();
    const userEmail = (req.user.email || '').toLowerCase();

    const [
      draftClubs,
      pendingInvites,
      myJoinRequests,
      publicClubs,
      facultyCoordinators,
      campusRequests,
    ] = await Promise.all([
      Club.find({ workspaceOwnerId: req.user._id, status: { $in: ['DRAFT', 'PENDING_REVIEW'] } })
        .select('_id name shortName code category customCategory status setupStep templateKey campusId updatedAt')
        .sort({ updatedAt: -1 })
        .lean(),
      userEmail
        ? ClubInvitation.find({
            email: userEmail,
            status: 'PENDING',
            expiresAt: { $gt: now },
          })
            .populate('clubId', 'name shortName code category description campusId visibility status')
            .populate('invitedById', 'fullName')
            .populate('intendedPositionIds', 'name description')
            .sort({ createdAt: -1 })
            .lean()
        : [],
      ClubJoinRequest.find({ userId: req.user._id })
        .populate('clubId', 'name shortName code category status')
        .sort({ createdAt: -1 })
        .lean(),
      campusId
        ? Club.find({
            campusId,
            status: 'ACTIVE',
            visibility: 'PUBLIC_CAMPUS',
          })
            .select('_id name shortName code category customCategory description mission joinPolicy visibility')
            .sort({ name: 1 })
            .lean()
        : [],
      campusId
        ? User.find({
            campusId,
            campusRole: 'FACULTY_COORDINATOR',
            isActive: true,
          })
            .select('_id fullName department')
            .sort({ fullName: 1 })
            .lean()
        : [],
      CampusRequest.find({ userId: req.user._id }).sort({ createdAt: -1 }).lean(),
    ]);

    const memberClubIds = new Set(
      (req.user.memberships || []).map((m) => (m.clubId?._id || m.clubId)?.toString())
    );
    const pendingJoinClubIds = new Set(
      myJoinRequests
        .filter((r) => r.status === 'PENDING' && r.clubId)
        .map((r) => (r.clubId._id || r.clubId).toString())
    );

    // Enrich campus discovery orgs with member counts & user status
    const clubIds = publicClubs.map((c) => c._id);
    const [cmCounts, lmCounts] = clubIds.length
      ? await Promise.all([
          ClubMembership.aggregate([
            { $match: { clubId: { $in: clubIds }, status: 'ACTIVE' } },
            { $group: { _id: '$clubId', count: { $sum: 1 } } },
          ]),
          Membership.aggregate([
            { $match: { clubId: { $in: clubIds }, status: 'ACTIVE' } },
            { $group: { _id: '$clubId', count: { $sum: 1 } } },
          ]),
        ])
      : [[], []];

    const countMap = new Map();
    for (const row of cmCounts) countMap.set(row._id.toString(), row.count);
    for (const row of lmCounts) {
      const k = row._id.toString();
      if (!countMap.has(k) || row.count > countMap.get(k)) {
        countMap.set(k, row.count);
      }
    }

    const campusOrganizations = publicClubs.map((c) => ({
      ...c,
      memberCount: countMap.get(c._id.toString()) || 0,
      alreadyMember: memberClubIds.has(c._id.toString()),
      pendingRequest: pendingJoinClubIds.has(c._id.toString()),
    }));

    return res.json({
      success: true,
      data: {
        campus: req.user.campusId || null,
        accountType: req.user.accountType || (campusId ? 'CAMPUS' : 'PERSONAL'),
        campusPolicy: req.user.campusId?.settings || {
          allowStudentClubCreation: true,
          requireFacultyApprovalForNewClubs: false,
          requireFacultyAdvisorOnClubs: false,
        },
        facultyCoordinators,
        draftClubs,
        pendingInvitations: pendingInvites.map((inv) => ({
          _id: inv._id,
          club: inv.clubId,
          invitedBy: inv.invitedById,
          intendedPositions: inv.intendedPositionIds || [],
          message: inv.message,
          expiresAt: inv.expiresAt,
          createdAt: inv.createdAt,
        })),
        joinRequests: myJoinRequests,
        campusRequests,
        campusOrganizations,
        templates: ORGANIZATION_TEMPLATES,
        permissionsCatalogue: PERMISSION_MODULES,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function discoverOrganizations(req, res, next) {
  try {
    const campusId = req.campusId || null;
    const q = typeof req.query.q === 'string' ? req.query.q.trim() : '';
    const category = typeof req.query.category === 'string' ? req.query.category.trim() : '';
    const joinCode = typeof req.query.joinCode === 'string' ? req.query.joinCode.trim().toUpperCase() : '';

    let clubs = [];

    if (joinCode) {
      const matchFilter = {
        status: 'ACTIVE',
        joinCode,
      };
      if (campusId) {
        matchFilter.$or = [{ campusId }, { campusId: null }];
      } else {
        matchFilter.campusId = null;
      }
      clubs = await Club.find(matchFilter)
        .select('_id name shortName code category customCategory description mission joinPolicy visibility campusId')
        .lean();
    } else if (campusId) {
      const filter = {
        campusId,
        status: 'ACTIVE',
        visibility: 'PUBLIC_CAMPUS',
      };
      if (category && category !== 'ALL') {
        filter.category = category;
      }
      if (q) {
        const regex = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
        filter.$or = [{ name: regex }, { shortName: regex }, { code: regex }, { description: regex }];
      }
      clubs = await Club.find(filter)
        .select('_id name shortName code category customCategory description mission joinPolicy visibility campusId')
        .sort({ name: 1 })
        .lean();
    }

    const memberClubIds = new Set(
      (req.user.memberships || []).map((m) => (m.clubId?._id || m.clubId)?.toString())
    );
    const pendingRequests = await ClubJoinRequest.find({
      userId: req.user._id,
      status: 'PENDING',
    })
      .select('clubId')
      .lean();
    const pendingClubIds = new Set(pendingRequests.map((r) => r.clubId.toString()));

    const clubIds = clubs.map((c) => c._id);
    const memberCounts = clubIds.length
      ? await ClubMembership.aggregate([
          { $match: { clubId: { $in: clubIds }, status: 'ACTIVE' } },
          { $group: { _id: '$clubId', count: { $sum: 1 } } },
        ])
      : [];
    const countMap = new Map(memberCounts.map((r) => [r._id.toString(), r.count]));

    const organizations = clubs.map((club) => ({
      ...club,
      memberCount: countMap.get(club._id.toString()) || 0,
      alreadyMember: memberClubIds.has(club._id.toString()),
      pendingRequest: pendingClubIds.has(club._id.toString()),
    }));

    return res.json({
      success: true,
      data: { organizations },
    });
  } catch (err) {
    next(err);
  }
}

export async function submitCampusRequest(req, res, next) {
  try {
    const data = campusRequestSchema.parse(req.body);
    const requestDoc = await CampusRequest.create({
      userId: req.user._id,
      email: req.user.email,
      universityName: data.universityName,
      domain: data.domain.toLowerCase(),
      city: data.city || '',
      notes: data.notes || '',
      status: 'SUBMITTED',
    });

    await AuditLog.create({
      campusId: req.campusId || null,
      actorId: req.user._id,
      action: 'CAMPUS_SETUP_REQUESTED',
      targetType: 'CampusRequest',
      targetId: requestDoc._id,
      metadata: { domain: requestDoc.domain },
    });

    return res.status(201).json({
      success: true,
      message: 'Campus setup request submitted for administrator review.',
      data: { campusRequest: requestDoc },
    });
  } catch (err) {
    next(err);
  }
}

export async function acceptInvitation(req, res, next) {
  try {
    const data = acceptInvitationSchema.parse(req.body);
    const now = new Date();

    const query = data.token
      ? { tokenHash: hashInvitationToken(data.token) }
      : { _id: data.invitationId };

    const invitation = await ClubInvitation.findOne(query).populate('clubId');
    if (!invitation || !invitation.clubId) {
      return res.status(404).json({
        success: false,
        error: { code: 'INVITATION_NOT_FOUND', message: 'Invitation not found or invalid.' },
      });
    }

    if (invitation.status === 'REVOKED') {
      return res.status(410).json({
        success: false,
        error: { code: 'INVITATION_REVOKED', message: 'This invitation was revoked by an organization administrator.' },
      });
    }

    if (invitation.status === 'ACCEPTED') {
      return res.status(409).json({
        success: false,
        error: { code: 'INVITATION_ALREADY_USED', message: 'This invitation has already been accepted.' },
      });
    }

    if (invitation.status === 'EXPIRED' || invitation.expiresAt <= now) {
      if (invitation.status !== 'EXPIRED') {
        invitation.status = 'EXPIRED';
        await invitation.save();
      }
      return res.status(410).json({
        success: false,
        error: { code: 'INVITATION_EXPIRED', message: 'This invitation has expired. Ask an organization admin for a new invite.' },
      });
    }

    // Strict recipient match verification
    if (invitation.email.toLowerCase() !== (req.user.email || '').toLowerCase()) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'INVITATION_EMAIL_MISMATCH',
          message: 'This invitation was issued for a different email address.',
        },
      });
    }

    const club = invitation.clubId;
    if (
      club.campusId &&
      req.campusId &&
      club.campusId.toString() !== req.campusId.toString()
    ) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'TENANT_MISMATCH',
          message: 'This organization belongs to a different campus workspace.',
        },
      });
    }

    // Atomic single-use claim to prevent concurrent replay
    const claimed = await ClubInvitation.findOneAndUpdate(
      {
        _id: invitation._id,
        status: 'PENDING',
        expiresAt: { $gt: now },
      },
      {
        $set: {
          status: 'ACCEPTED',
          acceptedAt: now,
          acceptedByUserId: req.user._id,
        },
      },
      { new: true }
    );

    if (!claimed) {
      return res.status(409).json({
        success: false,
        error: { code: 'INVITATION_ALREADY_USED', message: 'Invitation is no longer available.' },
      });
    }

    let clubMembership = await ClubMembership.findOne({
      clubId: club._id,
      userId: req.user._id,
    });

    if (clubMembership) {
      clubMembership.status = 'ACTIVE';
      clubMembership.suspendedAt = null;
      clubMembership.leftAt = null;
      await clubMembership.save();
    } else {
      clubMembership = await ClubMembership.create({
        campusId: club.campusId || null,
        clubId: club._id,
        userId: req.user._id,
        status: 'ACTIVE',
        joinedAt: now,
        invitedById: claimed.invitedById,
      });
    }

    // Also create legacy Membership entry if club operates on a campus term so legacy views stay synced
    const termId = claimed.academicTermId || club.activeTermId || null;
    if (club.campusId && termId) {
      await Membership.findOneAndUpdate(
        {
          campusId: club.campusId,
          clubId: club._id,
          userId: req.user._id,
          academicTermId: termId,
        },
        {
          $setOnInsert: {
            campusId: club.campusId,
            clubId: club._id,
            userId: req.user._id,
            academicTermId: termId,
            clubRole: 'GENERAL_MEMBER',
          },
          $set: { status: 'ACTIVE' },
        },
        { upsert: true }
      );
    }

    // Activate intended custom position assignments (respecting maxHolders if set)
    const assignedPositions = [];
    for (const posId of claimed.intendedPositionIds || []) {
      const pos = await ClubPosition.findOne({ _id: posId, clubId: club._id, isActive: true });
      if (!pos) continue;

      if (pos.maxHolders) {
        const currentHolders = await ClubPositionAssignment.countDocuments({
          clubId: club._id,
          positionId: pos._id,
          status: 'ACTIVE',
        });
        if (currentHolders >= pos.maxHolders) {
          continue;
        }
      }

      const existingActive = await ClubPositionAssignment.findOne({
        clubId: club._id,
        userId: req.user._id,
        positionId: pos._id,
        status: 'ACTIVE',
      });

      if (!existingActive) {
        await ClubPositionAssignment.create({
          campusId: club.campusId || null,
          clubId: club._id,
          membershipId: clubMembership._id,
          userId: req.user._id,
          positionId: pos._id,
          academicTermId: termId,
          effectiveFrom: now,
          status: 'ACTIVE',
          assignedById: claimed.invitedById,
        });
      }
      assignedPositions.push({ _id: pos._id, name: pos.name });
    }

    req.user.lastActiveClubId = club._id;
    await req.user.save();

    await AuditLog.create({
      campusId: club.campusId || null,
      clubId: club._id,
      actorId: req.user._id,
      action: 'INVITATION_ACCEPTED',
      targetType: 'ClubInvitation',
      targetId: claimed._id,
      metadata: {
        assignedPositionCount: assignedPositions.length,
      },
    });

    await Notification.create({
      campusId: club.campusId || null,
      userId: claimed.invitedById,
      type: 'MEMBER_JOINED',
      title: `Invitation Accepted: ${club.name}`,
      message: `${req.user.fullName} joined ${club.name} via invitation.`,
      link: `/clubs/${club._id}/members`,
    });

    return res.json({
      success: true,
      message: `Joined ${club.name} successfully.`,
      data: {
        club: { _id: club._id, name: club.name, code: club.code },
        membership: clubMembership,
        assignedPositions,
      },
    });
  } catch (err) {
    next(err);
  }
}

