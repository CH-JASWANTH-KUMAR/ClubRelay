import { z } from 'zod';
import {
  Handover,
  Membership,
  User,
  AuditLog,
  Notification,
} from '../models/index.js';

const initiateHandoverSchema = z
  .object({
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
    const handovers = await Handover.find({
      clubId: req.params.clubId,
      campusId: req.campusId,
    })
      .populate('outgoingLeaderId', 'fullName email avatarUrl')
      .populate('incomingLeaderId', 'fullName email avatarUrl')
      .populate('fromTermId', 'name')
      .populate('toTermId', 'name')
      .sort({ createdAt: -1 });

    return res.json({
      success: true,
      data: { handovers },
    });
  } catch (err) {
    next(err);
  }
}

export async function createHandover(req, res, next) {
  try {
    const data = initiateHandoverSchema.parse(req.body);

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

    // Verify incoming officer is an active member of this organization
    const incomingMembership = await Membership.findOne({
      campusId: req.campusId,
      clubId: req.params.clubId,
      userId: incomingUser._id,
      status: 'ACTIVE',
    });

    if (!incomingMembership) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INCOMING_OFFICER_NOT_CLUB_MEMBER',
          message: 'Designated incoming officer must be an active registered member of this organization.',
        },
      });
    }

    // Verify outgoing user has executive role in this club
    const outgoingMembership = await Membership.findOne({
      campusId: req.campusId,
      clubId: req.params.clubId,
      userId: req.user._id,
      status: 'ACTIVE',
    });

    const isPresident = outgoingMembership && outgoingMembership.clubRole === 'PRESIDENT';
    const isSecretary = outgoingMembership && outgoingMembership.clubRole === 'SECRETARY';
    const isCampusAdmin = req.user.campusRole === 'CAMPUS_ADMIN';

    if (!isPresident && !(isSecretary && data.roleHandover === 'SECRETARY') && !isCampusAdmin) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN_HANDOVER_INITIATION',
          message: 'Only active club executives can initiate a formal leadership handover.',
        },
      });
    }

    const handover = await Handover.create({
      campusId: req.campusId,
      clubId: req.params.clubId,
      fromTermId: data.fromTermId,
      toTermId: data.toTermId,
      outgoingLeaderId: req.user._id,
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
      metadata: { roleHandover: data.roleHandover, incomingLeaderId: incomingUser._id },
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
      .populate('fromTermId', 'name')
      .populate('toTermId', 'name')
      .populate('sections.contactsAndPartners.contactIds')
      .populate('sections.reusablePlaybooks.playbookIds');

    if (!handover) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Handover package not found.' },
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

    // Authorization: Only outgoing leader or campus admin can finalize transfer
    const isOutgoingLeader = handover.outgoingLeaderId.toString() === req.user._id.toString();
    const isCampusAdmin = req.user.campusRole === 'CAMPUS_ADMIN';

    if (!isOutgoingLeader && !isCampusAdmin) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN_HANDOVER_COMPLETE',
          message: 'Only the outgoing officer or campus administrator can execute the final role transfer.',
        },
      });
    }

    // Safe Atomic Role Transition with Error Rollback
    const previousOutgoingMembership = await Membership.findOne({
      campusId: req.campusId,
      clubId: handover.clubId,
      userId: handover.outgoingLeaderId,
    });

    const previousIncomingMembership = await Membership.findOne({
      campusId: req.campusId,
      clubId: handover.clubId,
      userId: handover.incomingLeaderId,
    });

    try {
      handover.status = 'COMPLETED';
      handover.completedAt = new Date();
      await handover.save();

      // Transition outgoing leader to advisory role
      await Membership.findOneAndUpdate(
        {
          campusId: req.campusId,
          clubId: handover.clubId,
          userId: handover.outgoingLeaderId,
        },
        {
          clubRole: 'CORE_TEAM',
          title: 'Past President / Senior Advisor',
        }
      );

      // Transition incoming leader to executive role
      await Membership.findOneAndUpdate(
        {
          campusId: req.campusId,
          clubId: handover.clubId,
          userId: handover.incomingLeaderId,
        },
        {
          clubRole: handover.roleHandover === 'PRESIDENT' ? 'PRESIDENT' : 'SECRETARY',
          title: handover.roleHandover === 'PRESIDENT' ? 'Club President' : 'Club Secretary',
          academicTermId: handover.toTermId,
          status: 'ACTIVE',
        },
        { upsert: true }
      );
    } catch (transitionErr) {
      // Rollback on failure
      console.error('[Handover Atomic Failure] Rolling back role changes:', transitionErr);
      if (previousOutgoingMembership) {
        await Membership.findByIdAndUpdate(previousOutgoingMembership._id, {
          clubRole: previousOutgoingMembership.clubRole,
          title: previousOutgoingMembership.title,
        });
      }
      if (previousIncomingMembership) {
        await Membership.findByIdAndUpdate(previousIncomingMembership._id, {
          clubRole: previousIncomingMembership.clubRole,
          title: previousIncomingMembership.title,
        });
      }
      throw transitionErr;
    }

    await AuditLog.create({
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
      },
    });

    return res.json({
      success: true,
      data: { handover },
      message: 'Handover completed! Executive roles have successfully transferred.',
    });
  } catch (err) {
    next(err);
  }
}
