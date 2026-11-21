import mongoose from 'mongoose';
import { z } from 'zod';
import {
  Handover,
  Membership,
  User,
  AcademicTerm,
  AuditLog,
  Notification,
} from '../models/index.js';

export const HANDOVER_ROLE_MAP = {
  PRESIDENT: {
    incomingRole: 'PRESIDENT',
    incomingTitle: 'Club President',
    outgoingRole: 'CORE_TEAM',
    outgoingTitle: 'Past President / Senior Advisor',
    requiredOutgoingRole: 'PRESIDENT',
  },
  SECRETARY: {
    incomingRole: 'SECRETARY',
    incomingTitle: 'Club Secretary',
    outgoingRole: 'CORE_TEAM',
    outgoingTitle: 'Past Secretary / Advisor',
    requiredOutgoingRole: 'SECRETARY',
  },
  CORE_LEAD: {
    incomingRole: 'CORE_TEAM',
    incomingTitle: 'Core Team Lead',
    outgoingRole: 'CORE_TEAM',
    outgoingTitle: 'Former Core Lead / Senior Advisor',
    requiredOutgoingRole: 'CORE_TEAM',
  },
};

const initiateHandoverSchema = z
  .object({
    outgoingLeaderEmail: z.string().email().optional(),
    incomingLeaderEmail: z.string().email(),
    roleHandover: z.enum(['PRESIDENT', 'SECRETARY', 'CORE_LEAD']),
    fromTermId: z.string(),
    toTermId: z.string(),
  })
  .strict();

const updateSectionSchema = z
  .object({
    sectionName: z.enum([
      'roleResponsibilities',
      'outstandingTasks',
      'pendingCommitments',
      'futureEventSchedules',
      'importantDocuments',
      'contactsAndPartners',
      'reusablePlaybooks',
      'recommendationsAndAdvice',
    ]),
    content: z.string().optional(),
    completed: z.boolean().optional(),
    taskList: z
      .array(
        z.object({
          task: z.string(),
          status: z.string().optional(),
          deadline: z.string().optional(),
        })
      )
      .optional(),
    commitments: z
      .array(
        z.object({
          title: z.string(),
          party: z.string(),
          notes: z.string().optional(),
        })
      )
      .optional(),
    schedules: z
      .array(
        z.object({
          eventTitle: z.string(),
          tentativeDate: z.string(),
          venue: z.string().optional(),
        })
      )
      .optional(),
    links: z
      .array(
        z.object({
          label: z.string(),
          url: z.string(),
          description: z.string().optional(),
        })
      )
      .optional(),
    contactIds: z.array(z.string()).optional(),
    playbookIds: z.array(z.string()).optional(),
  })
  .strict();

export async function listHandovers(req, res, next) {
  try {
    const isExecutiveOrAdmin =
      req.user.campusRole === 'CAMPUS_ADMIN' ||
      ['PRESIDENT', 'SECRETARY'].includes(req.userClubRole) ||
      (req.user.campusRole === 'FACULTY_COORDINATOR' &&
        req.club?.facultyCoordinatorId &&
        req.club.facultyCoordinatorId.toString() === req.user._id.toString());

    const handovers = await Handover.find({
      clubId: req.params.clubId,
      campusId: req.campusId,
    })
      .populate('outgoingLeaderId', isExecutiveOrAdmin ? 'fullName email avatarUrl department' : 'fullName avatarUrl')
      .populate('incomingLeaderId', isExecutiveOrAdmin ? 'fullName email avatarUrl department' : 'fullName avatarUrl')
      .populate('fromTermId', 'name isCurrent')
      .populate('toTermId', 'name isCurrent')
      .sort({ createdAt: -1 });

    const sanitizedHandovers = handovers.map((h) => {
      const isParticipant =
        h.outgoingLeaderId?._id?.toString() === req.user._id.toString() ||
        h.incomingLeaderId?._id?.toString() === req.user._id.toString();

      if (isExecutiveOrAdmin || isParticipant) {
        return h;
      }

      // Safe sanitized summary for general club members: no private email/phone/notes
      return {
        _id: h._id,
        clubId: h.clubId,
        fromTermId: h.fromTermId,
        toTermId: h.toTermId,
        outgoingLeaderId: {
          _id: h.outgoingLeaderId?._id,
          fullName: h.outgoingLeaderId?.fullName,
          avatarUrl: h.outgoingLeaderId?.avatarUrl,
        },
        incomingLeaderId: {
          _id: h.incomingLeaderId?._id,
          fullName: h.incomingLeaderId?.fullName,
          avatarUrl: h.incomingLeaderId?.avatarUrl,
        },
        roleHandover: h.roleHandover,
        status: h.status,
        completionPercentage: h.completionPercentage,
        acknowledgedAt: h.acknowledgedAt,
        completedAt: h.completedAt,
        createdAt: h.createdAt,
      };
    });

    return res.json({
      success: true,
      data: { handovers: sanitizedHandovers },
    });
  } catch (err) {
    next(err);
  }
}

export async function createHandover(req, res, next) {
  try {
    const data = initiateHandoverSchema.parse(req.body);

    // Validate academic term IDs format
    if (!mongoose.Types.ObjectId.isValid(data.fromTermId) || !mongoose.Types.ObjectId.isValid(data.toTermId)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_ACADEMIC_TERM',
          message: 'Academic term IDs must be valid identifiers.',
        },
      });
    }

    // Validate both academic terms belong to the requesting user's campus
    const [fromTerm, toTerm] = await Promise.all([
      AcademicTerm.findOne({ _id: data.fromTermId, campusId: req.campusId }),
      AcademicTerm.findOne({ _id: data.toTermId, campusId: req.campusId }),
    ]);

    if (!fromTerm || !toTerm) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'ACADEMIC_TERM_NOT_FOUND',
          message: 'One or both academic terms were not found for this campus.',
        },
      });
    }

    const roleConfig = HANDOVER_ROLE_MAP[data.roleHandover];
    if (!roleConfig) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_ROLE_HANDOVER',
          message: `Unsupported handover role: ${data.roleHandover}`,
        },
      });
    }

    const isCampusAdmin = req.user.campusRole === 'CAMPUS_ADMIN';

    let outgoingUser;

    if (isCampusAdmin) {
      // Campus administrators must explicitly nominate an outgoing officer
      if (!data.outgoingLeaderEmail) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'OUTGOING_LEADER_REQUIRED',
            message: 'Campus administrators must explicitly nominate an outgoing officer by email.',
          },
        });
      }

      outgoingUser = await User.findOne({
        campusId: req.campusId,
        email: data.outgoingLeaderEmail.toLowerCase(),
      });

      if (!outgoingUser) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'USER_NOT_FOUND',
            message: 'Nominated outgoing leader email not found on this campus.',
          },
        });
      }
    } else {
      // Non-admin club officers cannot nominate another user
      if (data.outgoingLeaderEmail && data.outgoingLeaderEmail.toLowerCase() !== req.user.email.toLowerCase()) {
        return res.status(403).json({
          success: false,
          error: {
            code: 'FORBIDDEN_NOMINATION',
            message: 'Only campus administrators can nominate another user as outgoing officer.',
          },
        });
      }
      outgoingUser = req.user;
    }

    // Verify outgoing officer is an active member in fromTerm with required role
    const outgoingMembership = await Membership.findOne({
      campusId: req.campusId,
      clubId: req.params.clubId,
      userId: outgoingUser._id,
      academicTermId: fromTerm._id,
      status: 'ACTIVE',
    });

    if (!outgoingMembership) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'OUTGOING_MEMBERSHIP_INVALID',
          message: 'Outgoing officer does not hold an active membership for the specified from-term.',
        },
      });
    }

    if (outgoingMembership.clubRole !== roleConfig.requiredOutgoingRole) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'OUTGOING_OFFICER_ROLE_MISMATCH',
          message: `Outgoing officer must hold the ${roleConfig.requiredOutgoingRole} role in the specified from-term.`,
        },
      });
    }

    // Verify incoming user exists in campus
    const incomingUser = await User.findOne({
      campusId: req.campusId,
      email: data.incomingLeaderEmail.toLowerCase(),
    });

    if (!incomingUser) {
      return res.status(404).json({
        success: false,
        error: { code: 'USER_NOT_FOUND', message: 'Incoming leader email not found on this campus.' },
      });
    }

    if (outgoingUser._id.toString() === incomingUser._id.toString()) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_HANDOVER_TARGET',
          message: 'Outgoing and incoming officers cannot be the same user.',
        },
      });
    }

    // Verify incoming officer is an active member of this organization in toTerm
    const incomingMembership = await Membership.findOne({
      campusId: req.campusId,
      clubId: req.params.clubId,
      userId: incomingUser._id,
      academicTermId: toTerm._id,
      status: 'ACTIVE',
    });

    if (!incomingMembership) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INCOMING_MEMBERSHIP_INVALID',
          message: 'Designated incoming officer must hold an active membership for the target academic term.',
        },
      });
    }

    const handover = await Handover.create({
      campusId: req.campusId,
      clubId: req.params.clubId,
      fromTermId: fromTerm._id,
      toTermId: toTerm._id,
      outgoingLeaderId: outgoingUser._id,
      incomingLeaderId: incomingUser._id,
      roleHandover: data.roleHandover,
      status: 'DRAFT',
      completionPercentage: 0,
      sections: {
        roleResponsibilities: { content: '', completed: false },
        outstandingTasks: { content: '', taskList: [], completed: false },
        pendingCommitments: { content: '', commitments: [], completed: false },
        futureEventSchedules: { content: '', schedules: [], completed: false },
        importantDocuments: { content: '', links: [], completed: false },
        contactsAndPartners: { content: '', contactIds: [], completed: false },
        reusablePlaybooks: { content: '', playbookIds: [], completed: false },
        recommendationsAndAdvice: { content: '', completed: false },
      },
    });

    await Notification.create({
      campusId: req.campusId,
      userId: incomingUser._id,
      title: 'Leadership Handover Initiated',
      message: `${req.user.fullName} initiated the ${data.roleHandover} handover package for you.`,
      type: 'HANDOVER',
      link: `/clubs/${req.params.clubId}/handover`,
    });

    await AuditLog.create({
      campusId: req.campusId,
      clubId: req.params.clubId,
      actorId: req.user._id,
      action: 'HANDOVER_INITIATED',
      targetType: 'Handover',
      targetId: handover._id,
      metadata: {
        roleHandover: data.roleHandover,
        outgoingLeaderId: outgoingUser._id,
        incomingLeaderId: incomingUser._id,
        fromTermId: fromTerm._id,
        toTermId: toTerm._id,
        initiatedByCampusAdmin: isCampusAdmin,
      },
    });

    return res.status(201).json({
      success: true,
      data: { handover },
    });
  } catch (err) {
    next(err);
  }
}

export async function getHandover(req, res, next) {
  try {
    const handover = await Handover.findOne({
      _id: req.params.id,
      clubId: req.params.clubId,
      campusId: req.campusId,
    })
      .populate('outgoingLeaderId', 'fullName email avatarUrl department phone')
      .populate('incomingLeaderId', 'fullName email avatarUrl department phone')
      .populate('fromTermId', 'name isCurrent startDate endDate')
      .populate('toTermId', 'name isCurrent startDate endDate')
      .populate('sections.contactsAndPartners.contactIds')
      .populate('sections.reusablePlaybooks.playbookIds');

    if (!handover) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Handover package not found.' },
      });
    }

    const isOutgoingLeader = handover.outgoingLeaderId?._id?.toString() === req.user._id.toString();
    const isIncomingLeader = handover.incomingLeaderId?._id?.toString() === req.user._id.toString();
    const isPresident = req.userClubRole === 'PRESIDENT';
    const isCampusAdmin = req.user.campusRole === 'CAMPUS_ADMIN';
    const isAssignedFaculty =
      req.user.campusRole === 'FACULTY_COORDINATOR' &&
      req.club?.facultyCoordinatorId &&
      req.club.facultyCoordinatorId.toString() === req.user._id.toString();

    // General members or non-participating core members cannot access private handover details
    if (!isOutgoingLeader && !isIncomingLeader && !isPresident && !isCampusAdmin && !isAssignedFaculty) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN_HANDOVER_ACCESS',
          message: 'Access denied: Handover transition details are private to designated participants, club leadership, and advisors.',
        },
      });
    }

    if (isAssignedFaculty) {
      // Assigned faculty coordinator receives advisory overview: sanitize private review notes and private contact phones/emails
      const facultyData = handover.toObject();
      delete facultyData.reviewNotes;
      if (facultyData.outgoingLeaderId) delete facultyData.outgoingLeaderId.phone;
      if (facultyData.incomingLeaderId) delete facultyData.incomingLeaderId.phone;

      if (facultyData.sections?.contactsAndPartners?.contactIds) {
        facultyData.sections.contactsAndPartners.contactIds = facultyData.sections.contactsAndPartners.contactIds.map((c) => ({
          _id: c._id,
          organization: c.organization,
          roleCategory: c.roleCategory,
          servicesOffered: c.servicesOffered,
        }));
      }

      return res.json({
        success: true,
        data: { handover: facultyData },
      });
    }

    return res.json({
      success: true,
      data: { handover },
    });
  } catch (err) {
    next(err);
  }
}

export async function updateHandoverSection(req, res, next) {
  try {
    const data = updateSectionSchema.parse(req.body);

    const handover = await Handover.findOne({
      _id: req.params.id,
      clubId: req.params.clubId,
      campusId: req.campusId,
    });

    if (!handover) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Handover package not found.' },
      });
    }

    // Handover immutability: once completed, cannot edit sections
    if (handover.status === 'COMPLETED') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'HANDOVER_LOCKED',
          message: 'Cannot modify a handover package that has already been completed.',
        },
      });
    }

    // RBAC: Only authorized outgoing officer or current President can edit sections
    const isOutgoingLeader = handover.outgoingLeaderId.toString() === req.user._id.toString();
    const isPresident = req.userClubRole === 'PRESIDENT';
    const isCampusAdmin = req.user.campusRole === 'CAMPUS_ADMIN';

    if (!isOutgoingLeader && !isPresident && !isCampusAdmin) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN_SECTION_EDIT',
          message: 'Only the outgoing officer or club president can edit handover sections.',
        },
      });
    }

    const section = handover.sections[data.sectionName] || {};

    if (data.content !== undefined) section.content = data.content;
    if (data.completed !== undefined) section.completed = data.completed;
    if (data.taskList !== undefined) section.taskList = data.taskList;
    if (data.commitments !== undefined) section.commitments = data.commitments;
    if (data.schedules !== undefined) section.schedules = data.schedules;
    if (data.links !== undefined) section.links = data.links;
    if (data.contactIds !== undefined) section.contactIds = data.contactIds;
    if (data.playbookIds !== undefined) section.playbookIds = data.playbookIds;

    handover.sections[data.sectionName] = section;

    handover.calculateCompletion();
    if (handover.completionPercentage > 0 && handover.status === 'DRAFT') {
      handover.status = 'IN_REVIEW';
    }

    await handover.save();

    await AuditLog.create({
      campusId: req.campusId,
      clubId: req.params.clubId,
      actorId: req.user._id,
      action: 'HANDOVER_SECTION_UPDATED',
      targetType: 'Handover',
      targetId: handover._id,
      metadata: { sectionName: data.sectionName, completed: data.completed, completionPercentage: handover.completionPercentage },
    });

    return res.json({
      success: true,
      data: { handover },
      message: `Section "${data.sectionName}" updated successfully.`,
    });
  } catch (err) {
    next(err);
  }
}

export async function acknowledgeHandover(req, res, next) {
  try {
    const { reviewNotes } = req.body;

    const handover = await Handover.findOne({
      _id: req.params.id,
      clubId: req.params.clubId,
      campusId: req.campusId,
    });

    if (!handover) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Handover not found.' },
      });
    }

    // Handover immutability & duplicate acknowledgment guards
    if (handover.status === 'COMPLETED') {
      return res.status(400).json({
        success: false,
        error: { code: 'HANDOVER_ALREADY_COMPLETED', message: 'Handover is already completed and closed.' },
      });
    }

    if (handover.status === 'ACKNOWLEDGED') {
      return res.status(400).json({
        success: false,
        error: { code: 'HANDOVER_ALREADY_ACKNOWLEDGED', message: 'Handover has already been formally acknowledged.' },
      });
    }

    // RBAC: STRICTLY ONLY the designated incoming leader can acknowledge!
    if (handover.incomingLeaderId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN_NOT_INCOMING_LEADER',
          message: 'Only the designated incoming officer is authorized to acknowledge this handover package.',
        },
      });
    }

    handover.status = 'ACKNOWLEDGED';
    handover.acknowledgedAt = new Date();
    if (reviewNotes) handover.reviewNotes = reviewNotes;
    await handover.save();

    await Notification.create({
      campusId: req.campusId,
      userId: handover.outgoingLeaderId,
      title: 'Handover Package Formally Acknowledged',
      message: `The incoming leader has reviewed and signed off on the transition package.`,
      type: 'HANDOVER',
      link: `/clubs/${handover.clubId}/handover`,
    });

    await AuditLog.create({
      campusId: req.campusId,
      clubId: req.params.clubId,
      actorId: req.user._id,
      action: 'HANDOVER_ACKNOWLEDGED',
      targetType: 'Handover',
      targetId: handover._id,
    });

    return res.json({
      success: true,
      data: { handover },
      message: 'Handover formally acknowledged by incoming officer.',
    });
  } catch (err) {
    next(err);
  }
}

export async function completeHandover(req, res, next) {
  try {
    const handover = await Handover.findOne({
      _id: req.params.id,
      clubId: req.params.clubId,
      campusId: req.campusId,
    });

    if (!handover) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Handover not found.' },
      });
    }

    // Duplicate completion guard (Idempotency)
    if (handover.status === 'COMPLETED') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'HANDOVER_ALREADY_COMPLETED',
          message: 'This handover has already been completed. Role transition was executed previously.',
        },
      });
    }

    // Require incoming officer acknowledgment
    if (handover.status !== 'ACKNOWLEDGED') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'HANDOVER_NOT_ACKNOWLEDGED',
          message: 'The handover package must be acknowledged by the incoming officer before role transfer.',
        },
      });
    }

    // Require all 8 sections completed (100% completion)
    handover.calculateCompletion();
    if (handover.completionPercentage < 100) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'HANDOVER_INCOMPLETE',
          message: `All 8 handover sections must be marked complete (currently ${handover.completionPercentage}%).`,
        },
      });
    }

    const roleConfig = HANDOVER_ROLE_MAP[handover.roleHandover];
    if (!roleConfig) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_ROLE_HANDOVER',
          message: `Unsupported handover role: ${handover.roleHandover}`,
        },
      });
    }

    // Authorization: Only outgoing leader, current president, or campus admin can finalize transfer
    const isOutgoingLeader = handover.outgoingLeaderId.toString() === req.user._id.toString();
    const isCampusAdmin = req.user.campusRole === 'CAMPUS_ADMIN';
    const isPresident = req.userClubRole === 'PRESIDENT';

    if (!isOutgoingLeader && !isCampusAdmin && !isPresident) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN_HANDOVER_COMPLETE',
          message: 'Only the outgoing officer, club president, or campus administrator can execute the final role transfer.',
        },
      });
    }

    // Execute genuine ACID multi-document MongoDB transaction with replica-set support
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Concurrency guard: atomically lock and transition handover status only if currently ACKNOWLEDGED
      const updatedHandover = await Handover.findOneAndUpdate(
        {
          _id: handover._id,
          clubId: req.params.clubId,
          campusId: req.campusId,
          status: 'ACKNOWLEDGED',
        },
        {
          $set: {
            status: 'COMPLETED',
            completedAt: new Date(),
          },
        },
        {
          new: true,
          session,
        }
      );

      if (!updatedHandover) {
        // Document was already updated concurrently or status transitioned
        await session.abortTransaction();
        await session.endSession();
        return res.status(400).json({
          success: false,
          error: {
            code: 'HANDOVER_ALREADY_COMPLETED',
            message: 'This handover has already been completed. Role transition was executed previously.',
          },
        });
      }

      // 1. Locate and verify exact outgoing leader membership record inside transaction using fromTermId
      const outgoingMembership = await Membership.findOne({
        campusId: req.campusId,
        clubId: handover.clubId,
        userId: handover.outgoingLeaderId,
        academicTermId: handover.fromTermId,
        status: 'ACTIVE',
      }).session(session);

      if (!outgoingMembership) {
        await session.abortTransaction();
        await session.endSession();
        return res.status(400).json({
          success: false,
          error: {
            code: 'OUTGOING_MEMBERSHIP_INVALID',
            message: 'Outgoing leader membership record is missing or not active for the handover term.',
          },
        });
      }

      // 2. Locate and verify exact incoming leader membership record inside transaction using toTermId
      const incomingMembership = await Membership.findOne({
        campusId: req.campusId,
        clubId: handover.clubId,
        userId: handover.incomingLeaderId,
        academicTermId: handover.toTermId,
      }).session(session);

      if (!incomingMembership) {
        await session.abortTransaction();
        await session.endSession();
        return res.status(400).json({
          success: false,
          error: {
            code: 'INCOMING_MEMBERSHIP_NOT_FOUND',
            message: 'Incoming leader membership record not found for the target term.',
          },
        });
      }

      // Require the incoming member to remain active
      if (incomingMembership.status !== 'ACTIVE') {
        await session.abortTransaction();
        await session.endSession();
        return res.status(400).json({
          success: false,
          error: {
            code: 'INCOMING_MEMBER_INACTIVE',
            message: 'Incoming leader is no longer an active member of this organization.',
          },
        });
      }

      // 3. Verify the outgoing membership update matched exactly one record
      const outgoingUpdate = await Membership.updateOne(
        {
          _id: outgoingMembership._id,
          campusId: req.campusId,
          clubId: handover.clubId,
          userId: handover.outgoingLeaderId,
          academicTermId: handover.fromTermId,
          status: 'ACTIVE',
        },
        {
          $set: {
            clubRole: roleConfig.outgoingRole,
            title: roleConfig.outgoingTitle,
          },
        },
        { session }
      );

      if (outgoingUpdate.matchedCount !== 1) {
        await session.abortTransaction();
        await session.endSession();
        return res.status(400).json({
          success: false,
          error: {
            code: 'OUTGOING_MEMBERSHIP_UPDATE_FAILED',
            message: 'Failed to update outgoing leader membership record consistently.',
          },
        });
      }

      // 4. Update incoming leader without upsert, verifying update matched exactly one record
      const incomingUpdate = await Membership.updateOne(
        {
          _id: incomingMembership._id,
          campusId: req.campusId,
          clubId: handover.clubId,
          userId: handover.incomingLeaderId,
          academicTermId: handover.toTermId,
          status: 'ACTIVE',
        },
        {
          $set: {
            clubRole: roleConfig.incomingRole,
            title: roleConfig.incomingTitle,
          },
        },
        { session }
      );

      if (incomingUpdate.matchedCount !== 1) {
        await session.abortTransaction();
        await session.endSession();
        return res.status(400).json({
          success: false,
          error: {
            code: 'INCOMING_MEMBERSHIP_UPDATE_FAILED',
            message: 'Failed to update incoming leader membership record consistently.',
          },
        });
      }

      // Record audit log within transaction
      await AuditLog.create(
        [
          {
            campusId: req.campusId,
            clubId: req.params.clubId,
            actorId: req.user._id,
            action: 'HANDOVER_COMPLETED_ROLES_TRANSFERRED',
            targetType: 'Handover',
            targetId: handover._id,
            metadata: {
              outgoingLeaderId: handover.outgoingLeaderId,
              incomingLeaderId: handover.incomingLeaderId,
              roleHandover: handover.roleHandover,
              incomingRole: roleConfig.incomingRole,
              incomingTitle: roleConfig.incomingTitle,
              outgoingRole: roleConfig.outgoingRole,
              outgoingTitle: roleConfig.outgoingTitle,
              fromTermId: handover.fromTermId,
              toTermId: handover.toTermId,
            },
          },
        ],
        { session }
      );

      await session.commitTransaction();
      await session.endSession();

      return res.json({
        success: true,
        data: { handover: updatedHandover },
        message: 'Handover completed! Executive roles have successfully transferred.',
      });
    } catch (transactionErr) {
      await session.abortTransaction();
      await session.endSession();

      // Check for concurrent write conflict from a competing completion request
      const isConflict =
        transactionErr.code === 112 ||
        transactionErr.hasErrorLabel?.('TransientTransactionError') ||
        (transactionErr.message && transactionErr.message.includes('Write conflict'));

      if (isConflict) {
        await new Promise((resolve) => setTimeout(resolve, 60));
        const currentHandover = await Handover.findById(handover._id);
        if (currentHandover && currentHandover.status === 'COMPLETED') {
          return res.status(400).json({
            success: false,
            error: {
              code: 'HANDOVER_ALREADY_COMPLETED',
              message: 'This handover has already been completed. Role transition was executed previously.',
            },
          });
        }
      }

      throw transactionErr;
    }
  } catch (err) {
    next(err);
  }
}
