import { z } from 'zod';
import { Approval, Event, Club, Notification, AuditLog } from '../models/index.js';
import { verifyFacultyReviewerForClub } from '../middleware/tenant.js';

const reviewSchema = z.object({
  decision: z.enum(['APPROVED', 'MODIFICATIONS_REQUESTED', 'REJECTED']),
  comments: z.string().min(2),
});

export async function listPendingApprovals(req, res, next) {
  try {
    const filter = {
      campusId: req.campusId,
      decision: 'PENDING',
    };

    // RBAC: Campus Admin sees all campus clubs. Faculty Coordinator ONLY sees assigned clubs.
    if (req.user.campusRole === 'FACULTY_COORDINATOR') {
      const assignedClubs = await Club.find({
        campusId: req.campusId,
        facultyCoordinatorId: req.user._id,
      }).select('_id');

      const assignedClubIds = assignedClubs.map((c) => c._id);
      filter.clubId = { $in: assignedClubIds };
    } else if (req.user.campusRole !== 'CAMPUS_ADMIN') {
      return res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'Only campus admins and faculty coordinators can view pending approvals.' },
      });
    }

    const approvals = await Approval.find(filter)
      .populate({
        path: 'eventId',
        populate: [
          { path: 'clubId', select: 'name code logoUrl facultyCoordinatorId' },
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

    // RBAC check: Faculty must be assigned to this specific organization unless Campus Admin
    const authCheck = await verifyFacultyReviewerForClub(req, event.clubId._id);
    if (!authCheck.allowed) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN_REVIEWER',
          message: 'You are not the designated faculty advisor for this organization.',
        },
      });
    }

    // Event state machine: only PROPOSED events can be reviewed
    if (event.status !== 'PROPOSED') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_EVENT_STATE',
          message: `Cannot review an event currently in '${event.status}' state. Only 'PROPOSED' events can be reviewed.`,
        },
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

    // Update existing pending approval or create new decided approval
    let approval = await Approval.findOne({
      eventId: event._id,
      decision: 'PENDING',
    });

    if (approval) {
      approval.reviewerId = req.user._id;
      approval.decision = decision;
      approval.comments = comments;
      approval.decidedAt = new Date();
      await approval.save();
    } else {
      approval = await Approval.create({
        campusId: req.campusId,
        clubId: event.clubId._id,
        eventId: event._id,
        reviewerId: req.user._id,
        decision,
        comments,
        decidedAt: new Date(),
      });
    }

    // Notify lead organizer
    if (event.leadOrganizerId) {
      await Notification.create({
        campusId: req.campusId,
        userId: event.leadOrganizerId,
        title: `Event Proposal ${decision === 'APPROVED' ? 'Approved' : decision === 'MODIFICATIONS_REQUESTED' ? 'Requires Modifications' : 'Rejected'}`,
        message: `${req.user.fullName} reviewed "${event.title}": "${comments}"`,
        type: 'APPROVAL',
        link: `/clubs/${event.clubId._id}/events/${event._id}`,
      });
    }

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
