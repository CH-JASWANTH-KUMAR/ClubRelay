import { z } from 'zod';
import {
  Handover,
  Membership,
  User,
  AcademicTerm,
  AuditLog,
  Notification,
} from '../models/index.js';

const initiateHandoverSchema = z.object({
  incomingLeaderEmail: z.string().email(),
  roleHandover: z.enum(['PRESIDENT', 'SECRETARY', 'CORE_LEAD']),
  fromTermId: z.string(),
  toTermId: z.string(),
});

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
    const { sectionName, content, completed, extraData } = req.body;

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

    if (!handover.sections[sectionName]) {
      handover.sections[sectionName] = {};
    }

    if (content !== undefined) handover.sections[sectionName].content = content;
    if (completed !== undefined) handover.sections[sectionName].completed = completed;
    if (extraData) {
      Object.assign(handover.sections[sectionName], extraData);
    }

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
      metadata: { sectionName, completed, completionPercentage: handover.completionPercentage },
    });

    return res.json({
      success: true,
      data: { handover },
      message: `Section "${sectionName}" updated successfully.`,
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

    handover.status = 'COMPLETED';
    handover.completedAt = new Date();
    await handover.save();

    // Automatically transition the active leadership roles in Membership!
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

    await AuditLog.create({
      campusId: req.campusId,
      clubId: req.params.clubId,
      actorId: req.user._id,
      action: 'HANDOVER_COMPLETED_ROLES_TRANSFERRED',
      targetType: 'Handover',
      targetId: handover._id,
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
