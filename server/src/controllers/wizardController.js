import { z } from 'zod';
import {
  Club,
  ClubDepartment,
  ClubPosition,
  ClubMembership,
  ClubPositionAssignment,
  ClubInvitation,
  AcademicTerm,
  Membership,
  User,
  AuditLog,
} from '../models/index.js';
import { TEMPLATE_MAP } from '../constants/templates.js';
import { normalizePermissions } from '../constants/permissions.js';
import { generateRawToken, hashInvitationToken } from '../services/rbacService.js';

const draftPayloadSchema = z.object({
  name: z.string().trim().min(2).max(120),
  shortName: z.string().trim().max(40).optional(),
  code: z.string().trim().min(2).max(16).toUpperCase(),
  slug: z.string().trim().max(64).optional(),
  category: z.enum(['TECHNICAL', 'CULTURAL', 'ACADEMIC', 'ENTREPRENEURSHIP', 'SOCIAL', 'SPORTS', 'CUSTOM']).default('TECHNICAL'),
  customCategory: z.string().trim().max(60).optional(),
  description: z.string().trim().max(1000).optional(),
  mission: z.string().trim().max(600).optional(),
  website: z.string().trim().max(240).optional(),
  contactEmail: z.string().trim().email().or(z.literal('')).optional(),
  visibility: z.enum(['PUBLIC_CAMPUS', 'INVITE_ONLY', 'PRIVATE']).default('PUBLIC_CAMPUS'),
  joinPolicy: z.enum(['OPEN', 'REQUEST_APPROVAL', 'INVITE_ONLY']).default('REQUEST_APPROVAL'),
  joinCode: z.string().trim().max(24).optional(),
  facultyCoordinatorId: z.string().nullable().optional(),
  setupStep: z.number().int().min(1).max(8).optional(),
  templateKey: z.string().trim().optional(),
  activeTermId: z.string().nullable().optional(),
  defaultMemberPermissions: z.array(z.string()).optional(),
  governance: z
    .object({
      requireFacultyAdvisor: z.boolean().optional(),
      requireApprovalForEvents: z.boolean().optional(),
      allowPublicJoinRequests: z.boolean().optional(),
      allowSelfSignupWithCode: z.boolean().optional(),
    })
    .optional(),
});

const applyTemplateSchema = z.object({
  templateKey: z.string().trim().min(1),
  replaceExisting: z.boolean().default(true),
});

const activateSchema = z
  .object({
    termId: z.string().optional(),
    newTermName: z.string().trim().min(2).max(60).optional(),
    newTermStartDate: z.string().optional(),
    newTermEndDate: z.string().optional(),
    creatorPositionIds: z.array(z.string()).optional(),
    invitations: z
      .array(
        z.object({
          email: z.string().trim().email(),
          intendedPositionIds: z.array(z.string()).optional(),
          message: z.string().trim().max(500).optional(),
          expiresInDays: z.number().int().min(1).max(30).default(7),
        })
      )
      .optional(),
  })
  .optional();

function slugify(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '') || 'position';
}

export async function createDraftClub(req, res, next) {
  try {
    const data = draftPayloadSchema.parse(req.body);
    const campus = req.user.campusId && typeof req.user.campusId === 'object' ? req.user.campusId : null;
    const campusId = req.campusId || null;

    if (
      campus &&
      campus.settings?.allowStudentClubCreation === false &&
      req.user.campusRole === 'STUDENT'
    ) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'STUDENT_ORG_CREATION_DISABLED',
          message: 'Your campus requires administrator approval before students can create new organizations.',
        },
      });
    }

    const codeExists = await Club.findOne({ campusId, code: data.code });
    if (codeExists) {
      return res.status(409).json({
        success: false,
        error: {
          code: 'DUPLICATE_CLUB_CODE',
          message: `An organization with code "${data.code}" already exists in this workspace.`,
        },
      });
    }

    // Attach default active campus term if available
    let activeTermId = data.activeTermId || null;
    if (!activeTermId && campusId) {
      const currentTerm = await AcademicTerm.findOne({ campusId, isCurrent: true }).select('_id');
      if (currentTerm) activeTermId = currentTerm._id;
    }

    const club = await Club.create({
      campusId,
      workspaceOwnerId: req.user._id,
      facultyCoordinatorId: data.facultyCoordinatorId || null,
      name: data.name,
      shortName: data.shortName || '',
      code: data.code,
      slug: data.slug ? slugify(data.slug) : slugify(data.code),
      category: data.category,
      customCategory: data.category === 'CUSTOM' ? data.customCategory || '' : '',
      description: data.description || '',
      mission: data.mission || '',
      website: data.website || '',
      contactEmail: data.contactEmail || '',
      visibility: campusId ? data.visibility : 'PRIVATE',
      joinPolicy: data.joinPolicy,
      joinCode: (data.joinCode || '').toUpperCase(),
      status: 'DRAFT',
      setupStep: data.setupStep || 2,
      templateKey: data.templateKey || 'custom',
      structureMode: 'CUSTOM',
      activeTermId,
      defaultMemberPermissions: data.defaultMemberPermissions
        ? normalizePermissions(data.defaultMemberPermissions)
        : undefined,
      governance: {
        requireFacultyAdvisor:
          data.governance?.requireFacultyAdvisor ?? Boolean(campus?.settings?.requireFacultyAdvisorOnClubs),
        requireApprovalForEvents:
          data.governance?.requireApprovalForEvents ?? (campus ? campus.settings?.requireFacultyApprovalForEvents !== false : false),
        allowPublicJoinRequests: data.governance?.allowPublicJoinRequests ?? data.joinPolicy !== 'INVITE_ONLY',
        allowSelfSignupWithCode: data.governance?.allowSelfSignupWithCode ?? true,
      },
    });

    await ClubMembership.create({
      campusId,
      clubId: club._id,
      userId: req.user._id,
      status: 'ACTIVE',
      joinedAt: new Date(),
    });

    await AuditLog.create({
      campusId,
      clubId: club._id,
      actorId: req.user._id,
      action: 'ORGANIZATION_DRAFT_CREATED',
      targetType: 'Club',
      targetId: club._id,
      metadata: { code: club.code },
    });

    return res.status(201).json({
      success: true,
      data: { club },
    });
  } catch (err) {
    next(err);
  }
}

export async function updateDraftClub(req, res, next) {
  try {
    const data = draftPayloadSchema.partial().parse(req.body);
    const club = req.club;

    const updatableFields = [
      'name',
      'shortName',
      'code',
      'slug',
      'category',
      'customCategory',
      'description',
      'mission',
      'website',
      'contactEmail',
      'visibility',
      'joinPolicy',
      'facultyCoordinatorId',
      'setupStep',
      'templateKey',
      'activeTermId',
    ];

    for (const field of updatableFields) {
      if (data[field] !== undefined) {
        club[field] = data[field];
      }
    }

    if (data.joinCode !== undefined) {
      club.joinCode = (data.joinCode || '').toUpperCase();
    }
    if (data.defaultMemberPermissions !== undefined) {
      club.defaultMemberPermissions = normalizePermissions(data.defaultMemberPermissions);
    }
    if (data.governance) {
      club.governance = {
        ...(club.governance?.toObject ? club.governance.toObject() : club.governance || {}),
        ...data.governance,
      };
    }

    await club.save();

    return res.json({
      success: true,
      data: { club },
    });
  } catch (err) {
    next(err);
  }
}

export async function applyStarterTemplate(req, res, next) {
  try {
    const data = applyTemplateSchema.parse(req.body);
    const template = TEMPLATE_MAP.get(data.templateKey);
    if (!template) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_TEMPLATE', message: 'Selected starter template does not exist.' },
      });
    }

    const club = req.club;

    // Only replace cleanly when draft OR explicit replaceExisting with no active assignments blocked
    if (data.replaceExisting) {
      const existingAssignmentsCount = await ClubPositionAssignment.countDocuments({
        clubId: club._id,
        status: 'ACTIVE',
      });
      if (club.status === 'ACTIVE' && existingAssignmentsCount > 0) {
        return res.status(409).json({
          success: false,
          error: {
            code: 'TEMPLATE_REPLACE_BLOCKED',
            message: 'End active position assignments before replacing an active organization template.',
          },
        });
      }
      await Promise.all([
        ClubPosition.deleteMany({ clubId: club._id }),
        ClubDepartment.deleteMany({ clubId: club._id }),
      ]);
    }

    const deptIdByKey = new Map();
    for (let i = 0; i < template.departments.length; i++) {
      const dept = template.departments[i];
      const createdDept = await ClubDepartment.create({
        campusId: club.campusId || null,
        clubId: club._id,
        name: dept.name,
        description: dept.description || '',
        color: dept.color || '#315BDB',
        sortOrder: i,
      });
      deptIdByKey.set(dept.key, createdDept._id);
    }

    const posIdByKey = new Map();
    const createdPositions = [];
    // Two-pass creation so parentKey references resolve cleanly in any order
    for (let i = 0; i < template.positions.length; i++) {
      const pos = template.positions[i];
      const createdPos = await ClubPosition.create({
        campusId: club.campusId || null,
        clubId: club._id,
        departmentId: pos.departmentKey ? deptIdByKey.get(pos.departmentKey) || null : null,
        name: pos.name,
        slug: slugify(`${pos.key}-${i}`),
        description: pos.description || '',
        parentPositionId: null,
        isLeadership: Boolean(pos.isLeadership),
        maxHolders: pos.maxHolders ?? null,
        permissions: normalizePermissions(pos.permissions || []),
        sortOrder: i,
      });
      posIdByKey.set(pos.key, createdPos);
      createdPositions.push(createdPos);
    }

    for (const pos of template.positions) {
      if (pos.parentKey && posIdByKey.has(pos.parentKey)) {
        const childDoc = posIdByKey.get(pos.key);
        const parentDoc = posIdByKey.get(pos.parentKey);
        if (childDoc && parentDoc) {
          childDoc.parentPositionId = parentDoc._id;
          await childDoc.save();
        }
      }
    }

    club.templateKey = template.key;
    club.structureMode = 'CUSTOM';
    club.setupStep = Math.max(club.setupStep || 3, 4);
    await club.save();

    const [departments, positions] = await Promise.all([
      ClubDepartment.find({ clubId: club._id }).sort({ sortOrder: 1 }).lean(),
      ClubPosition.find({ clubId: club._id }).sort({ sortOrder: 1 }).lean(),
    ]);

    return res.json({
      success: true,
      data: { club, departments, positions },
    });
  } catch (err) {
    next(err);
  }
}

export async function activateDraftClub(req, res, next) {
  try {
    const data = activateSchema.parse(req.body) || {};
    const club = req.club;
    const campus = req.user.campusId && typeof req.user.campusId === 'object' ? req.user.campusId : null;

    if (
      campus?.settings?.requireFacultyAdvisorOnClubs &&
      !club.facultyCoordinatorId
    ) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'FACULTY_ADVISOR_REQUIRED',
          message: 'Your campus policy requires selecting a faculty advisor before activation.',
        },
      });
    }

    // Resolve or create Academic Term
    let activeTerm = null;
    if (data.termId) {
      activeTerm = await AcademicTerm.findOne({ _id: data.termId });
    } else if (data.newTermName) {
      const start = data.newTermStartDate ? new Date(data.newTermStartDate) : new Date();
      const end = data.newTermEndDate
        ? new Date(data.newTermEndDate)
        : new Date(new Date().setFullYear(new Date().getFullYear() + 1));

      activeTerm = await AcademicTerm.findOne({
        campusId: club.campusId || null,
        clubId: club.campusId ? null : club._id,
        name: data.newTermName,
      });
      if (!activeTerm) {
        activeTerm = await AcademicTerm.create({
          campusId: club.campusId || null,
          clubId: club.campusId ? null : club._id,
          name: data.newTermName,
          startDate: start,
          endDate: end,
          isCurrent: true,
        });
      }
    } else if (club.activeTermId) {
      activeTerm = await AcademicTerm.findById(club.activeTermId);
    } else if (club.campusId) {
      activeTerm = await AcademicTerm.findOne({ campusId: club.campusId, isCurrent: true });
    }

    if (!activeTerm) {
      const nowYear = new Date().getFullYear();
      const label = `${nowYear}-${nowYear + 1}`;
      activeTerm = await AcademicTerm.create({
        campusId: club.campusId || null,
        clubId: club.campusId ? null : club._id,
        name: label,
        startDate: new Date(nowYear, 7, 1),
        endDate: new Date(nowYear + 1, 6, 31),
        isCurrent: true,
      });
    }

    club.activeTermId = activeTerm._id;

    // Respect campus approval requirement for student-created organizations
    const requiresPendingReview =
      Boolean(campus?.settings?.requireFacultyApprovalForNewClubs) &&
      req.user.campusRole === 'STUDENT';

    club.status = requiresPendingReview ? 'PENDING_REVIEW' : 'ACTIVE';
    club.setupStep = 8;
    club.structureMode = 'CUSTOM';
    await club.save();

    let ownerMembership = await ClubMembership.findOne({
      clubId: club._id,
      userId: req.user._id,
    });
    if (!ownerMembership) {
      ownerMembership = await ClubMembership.create({
        campusId: club.campusId || null,
        clubId: club._id,
        userId: req.user._id,
        status: 'ACTIVE',
        joinedAt: new Date(),
      });
    }

    // Assign founder's chosen initial positions if provided
    if (Array.isArray(data.creatorPositionIds)) {
      for (const posId of data.creatorPositionIds) {
        const pos = await ClubPosition.findOne({ _id: posId, clubId: club._id, isActive: true });
        if (!pos) continue;
        const exists = await ClubPositionAssignment.findOne({
          clubId: club._id,
          userId: req.user._id,
          positionId: pos._id,
          status: 'ACTIVE',
        });
        if (!exists) {
          await ClubPositionAssignment.create({
            campusId: club.campusId || null,
            clubId: club._id,
            membershipId: ownerMembership._id,
            userId: req.user._id,
            positionId: pos._id,
            academicTermId: activeTerm._id,
            termLabel: activeTerm.name,
            effectiveFrom: new Date(),
            status: 'ACTIVE',
            assignedById: req.user._id,
          });
        }
      }
    }

    // Sync legacy membership row if on campus so legacy queries keep working
    if (club.campusId && activeTerm) {
      await Membership.findOneAndUpdate(
        {
          campusId: club.campusId,
          clubId: club._id,
          userId: req.user._id,
          academicTermId: activeTerm._id,
        },
        {
          $setOnInsert: {
            campusId: club.campusId,
            clubId: club._id,
            userId: req.user._id,
            academicTermId: activeTerm._id,
            clubRole: 'PRESIDENT',
            title: 'Workspace Owner',
          },
          $set: { status: 'ACTIVE' },
        },
        { upsert: true }
      );
    }

    // Create optional launch invitations
    const createdInvitations = [];
    if (Array.isArray(data.invitations)) {
      for (const invItem of data.invitations) {
        const rawToken = generateRawToken();
        const expiresAt = new Date(Date.now() + (invItem.expiresInDays || 7) * 24 * 60 * 60 * 1000);
        const invDoc = await ClubInvitation.create({
          campusId: club.campusId || null,
          clubId: club._id,
          invitedById: req.user._id,
          email: invItem.email.toLowerCase(),
          tokenHash: hashInvitationToken(rawToken),
          intendedPositionIds: invItem.intendedPositionIds || [],
          academicTermId: activeTerm._id,
          message: invItem.message || '',
          status: 'PENDING',
          expiresAt,
        });
        createdInvitations.push({
          _id: invDoc._id,
          email: invDoc.email,
          expiresAt: invDoc.expiresAt,
          inviteUrl: `/invitations/accept?token=${rawToken}`,
        });
      }
    }

    await User.findByIdAndUpdate(req.user._id, { lastActiveClubId: club._id });

    await AuditLog.create({
      campusId: club.campusId || null,
      clubId: club._id,
      actorId: req.user._id,
      action: 'ORGANIZATION_ACTIVATED',
      targetType: 'Club',
      targetId: club._id,
      metadata: { status: club.status, invitationCount: createdInvitations.length },
    });

    return res.json({
      success: true,
      message:
        club.status === 'PENDING_REVIEW'
          ? 'Organization submitted for campus review.'
          : 'Organization workspace is now active.',
      data: {
        club,
        activeTerm,
        createdInvitations,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function updateClubSettings(req, res, next) {
  try {
    const data = draftPayloadSchema.partial().parse(req.body);
    const club = req.club;

    const allowed = [
      'name',
      'shortName',
      'category',
      'customCategory',
      'description',
      'mission',
      'website',
      'contactEmail',
      'visibility',
      'joinPolicy',
      'facultyCoordinatorId',
      'activeTermId',
    ];
    for (const key of allowed) {
      if (data[key] !== undefined) club[key] = data[key];
    }
    if (data.joinCode !== undefined) club.joinCode = (data.joinCode || '').toUpperCase();
    if (data.defaultMemberPermissions !== undefined) {
      club.defaultMemberPermissions = normalizePermissions(data.defaultMemberPermissions);
    }
    if (data.governance) {
      club.governance = {
        ...(club.governance?.toObject ? club.governance.toObject() : club.governance || {}),
        ...data.governance,
      };
    }

    await club.save();

    await AuditLog.create({
      campusId: club.campusId || null,
      clubId: club._id,
      actorId: req.user._id,
      action: 'ORGANIZATION_SETTINGS_UPDATED',
      targetType: 'Club',
      targetId: club._id,
    });

    return res.json({
      success: true,
      data: { club },
    });
  } catch (err) {
    next(err);
  }
}

