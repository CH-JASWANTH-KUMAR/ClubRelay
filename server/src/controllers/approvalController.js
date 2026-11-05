import { z } from 'zod';
import { Approval, Event, Notification, AuditLog } from '../models/index.js';

const reviewSchema = z.object({
  decision: z.enum(['APPROVED', 'MODIFICATIONS_REQUESTED', 'REJECTED']),
  comments: z.string().min(2),
});

export async function listPendingApprovals(req, res, next) {
  try {
    const approvals = await Approval.find({
      campusId: req.campusId,
      decision: 'PENDING',
    })
      .populate({
        path: 'eventId',
        populate: [
          { path: 'clubId', select: 'name code logoUrl' },
          { path: 'leadOrganizerId', select: 'fullName email avatarUrl' },
        ],
      })
      .populate('reviewerId', 'fullName email')
      .sort({ createdAt: -1 });

    return res.json({
      success: true,
      data: { approvals },
    });
  } catch (err) {
    next(err);
  }
}

export async function reviewProposal(req, res, next) {
  try {
    const { decision, comments } = reviewSchema.parse(req.body);

    const event = await Event.findOne({
      _id: req.params.eventId,
      campusId: req.campusId,
    }).populate('clubId');

    if (!event) {
      return res.status(404).json({
        success: false,
        error: { code: 'EVENT_NOT_FOUND', message: 'Event not found.' },
      });
    }

    // Update event status based on decision
    if (decision === 'APPROVED') {
      event.status = 'APPROVED';
    } else if (decision === 'MODIFICATIONS_REQUESTED') {
      event.status = 'DRAFT';
    } else if (decision === 'REJECTED') {
      event.status = 'ARCHIVED';
    }
    await event.save();

    // Create approval record
    const approval = await Approval.create({
      campusId: req.campusId,
      clubId: event.clubId._id,
      eventId: event._id,
      reviewerId: req.user._id,
      decision,
      comments,
      decidedAt: new Date(),
    });

    // Notify lead organizer
    await Notification.create({
      campusId: req.campusId,
      userId: event.leadOrganizerId,
      title: `Event Proposal ${decision === 'APPROVED' ? 'Approved' : decision === 'MODIFICATIONS_REQUESTED' ? 'Requires Modifications' : 'Rejected'}`,
      message: `${req.user.fullName} reviewed "${event.title}": "${comments}"`,
      type: 'APPROVAL',
      link: `/clubs/${event.clubId._id}/events/${event._id}`,
    });

    // Audit log
    await AuditLog.create({
      campusId: req.campusId,
      clubId: event.clubId._id,
      actorId: req.user._id,
      action: `PROPOSAL_${decision}`,
      targetType: 'Event',
      targetId: event._id,
      metadata: { decision, comments },
    });

    return res.json({
      success: true,
      data: { approval, event },
      message: `Proposal has been ${decision.toLowerCase().replace('_', ' ')}.`,
    });
  } catch (err) {
    next(err);
  }
}

export async function listEventApprovals(req, res, next) {
  try {
    const approvals = await Approval.find({
      eventId: req.params.eventId,
      campusId: req.campusId,
    })
      .populate('reviewerId', 'fullName email avatarUrl department')
      .sort({ decidedAt: -1 });

    return res.json({
      success: true,
      data: { approvals },
    });
  } catch (err) {
    next(err);
  }
}
