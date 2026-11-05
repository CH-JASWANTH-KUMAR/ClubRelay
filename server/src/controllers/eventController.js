import { z } from 'zod';
import {
  Event,
  EventTask,
  EventTemplate,
  Approval,
  Notification,
  AuditLog,
  Club,
  AcademicTerm,
  Membership,
} from '../models/index.js';

const createEventSchema = z
  .object({
    title: z.string().min(3),
    description: z.string().optional(),
    eventType: z.enum(['WORKSHOP', 'HACKATHON', 'GUEST_LECTURE', 'MEETUP', 'COMPETITION', 'MIXER', 'OTHER']),
    startDate: z.string(),
    endDate: z.string(),
    venueName: z.string().optional(),
    venueCapacity: z.number().optional(),
    estimatedBudget: z.number().optional(),
    expectedAttendance: z.number().optional(),
    tags: z.array(z.string()).optional(),
    templateId: z.string().optional(),
  })
  .strict();

const updateEventSchema = z
  .object({
    title: z.string().min(3).optional(),
    description: z.string().optional(),
    eventType: z.enum(['WORKSHOP', 'HACKATHON', 'GUEST_LECTURE', 'MEETUP', 'COMPETITION', 'MIXER', 'OTHER']).optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    venueName: z.string().optional(),
    venueCapacity: z.number().optional(),
    estimatedBudget: z.number().optional(),
    expectedAttendance: z.number().optional(),
    tags: z.array(z.string()).optional(),
    status: z.enum(['DRAFT', 'PROPOSED', 'APPROVED', 'PLANNING', 'IN_PROGRESS', 'COMPLETED', 'ARCHIVED']).optional(),
  })
  .strict();

const retrospectiveSchema = z
  .object({
    actualAttendance: z.number().min(0),
    actualBudget: z.number().min(0),
    summary: z.string().min(5),
    whatWentWell: z.string(),
    whatCouldImprove: z.string(),
    keyMetrics: z.string().optional(),
    sponsorSatisfaction: z.string().optional(),
  })
  .strict();

// Helper to determine user's role rank in the event's club
async function getUserClubRole(campusId, clubId, userId) {
  const membership = await Membership.findOne({
    campusId,
    clubId,
    userId,
    status: 'ACTIVE',
  });
  return membership ? membership.clubRole : null;
}

export async function listClubEvents(req, res, next) {
  try {
    const filter = {
      clubId: req.params.clubId,
      campusId: req.campusId,
    };

    if (req.query.status) {
      filter.status = req.query.status;
    }

    const events = await Event.find(filter)
      .populate('leadOrganizerId', 'fullName email avatarUrl')
      .populate('academicTermId', 'name')
      .sort({ startDate: -1 });

    return res.json({
      success: true,
      data: { events },
    });
  } catch (err) {
    next(err);
  }
}

export async function createEvent(req, res, next) {
  try {
    const data = createEventSchema.parse(req.body);

    const club = await Club.findOne({
      _id: req.params.clubId,
      campusId: req.campusId,
    });

    if (!club) {
      return res.status(404).json({
        success: false,
        error: { code: 'CLUB_NOT_FOUND', message: 'Club not found in your campus.' },
      });
    }

    // Get current term
    const currentTerm = await AcademicTerm.findOne({
      campusId: req.campusId,
      isCurrent: true,
    });

    const event = await Event.create({
      campusId: req.campusId,
      clubId: club._id,
      academicTermId: currentTerm ? currentTerm._id : null,
      leadOrganizerId: req.user._id,
      title: data.title,
      description: data.description || '',
      eventType: data.eventType,
      status: 'DRAFT',
      startDate: new Date(data.startDate),
      endDate: new Date(data.endDate),
      venueName: data.venueName || '',
      venueCapacity: data.venueCapacity || 0,
      estimatedBudget: data.estimatedBudget || 0,
      expectedAttendance: data.expectedAttendance || 0,
      tags: data.tags || [],
    });

    // If template was selected, instantiate default tasks automatically!
    if (data.templateId) {
      const template = await EventTemplate.findById(data.templateId);
      if (template && template.defaultTasks?.length > 0) {
        const taskDocs = template.defaultTasks.map((t) => {
          const dueDate = new Date(event.startDate.getTime() - t.leadDaysBefore * 24 * 3600 * 1000);
          return {
            campusId: req.campusId,
            clubId: club._id,
            eventId: event._id,
            title: t.title,
            description: t.description,
            priority: t.priority,
            status: 'TODO',
            dueDate,
          };
        });
        await EventTask.insertMany(taskDocs);
      }
    }

    await AuditLog.create({
      campusId: req.campusId,
      clubId: club._id,
      actorId: req.user._id,
      action: 'EVENT_CREATED',
      targetType: 'Event',
      targetId: event._id,
      metadata: { title: event.title, eventType: event.eventType },
    });

    return res.status(201).json({
      success: true,
      data: { event },
    });
  } catch (err) {
    next(err);
  }
}

export async function getEvent(req, res, next) {
  try {
    const event = await Event.findOne({
      _id: req.params.eventId,
      campusId: req.campusId,
    })
      .populate('leadOrganizerId', 'fullName email avatarUrl department')
      .populate('clubId', 'name code category facultyCoordinatorId')
      .populate('academicTermId', 'name isCurrent');

    if (!event) {
      return res.status(404).json({
        success: false,
        error: { code: 'EVENT_NOT_FOUND', message: 'Event not found in your campus.' },
      });
    }

    const [tasks, approvals] = await Promise.all([
      EventTask.find({ eventId: event._id })
        .populate('assigneeId', 'fullName email avatarUrl')
        .sort({ dueDate: 1 }),
      Approval.find({ eventId: event._id })
        .populate('reviewerId', 'fullName email avatarUrl')
        .sort({ decidedAt: -1 }),
    ]);

    return res.json({
      success: true,
      data: {
        event,
        tasks,
        approvals,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function updateEvent(req, res, next) {
  try {
    const data = updateEventSchema.parse(req.body);

    const event = await Event.findOne({
      _id: req.params.eventId,
      campusId: req.campusId,
    });

    if (!event) {
      return res.status(404).json({
        success: false,
        error: { code: 'EVENT_NOT_FOUND', message: 'Event not found in your campus.' },
      });
    }

    // Role check: Lead Organizer, Club President/Secretary, or Campus Admin
    const userRole = await getUserClubRole(req.campusId, event.clubId, req.user._id);
    const isLeadOrganizer = event.leadOrganizerId?.toString() === req.user._id.toString();
    const isExecutive = userRole === 'PRESIDENT' || userRole === 'SECRETARY';
    const isCampusAdmin = req.user.campusRole === 'CAMPUS_ADMIN';

    if (!isLeadOrganizer && !isExecutive && !isCampusAdmin) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN_EVENT_UPDATE',
          message: 'Only event lead organizers, club executive officers, or campus admins can update event details.',
        },
      });
    }

    // Retrospective and Completed/Archived protections
    if ((event.status === 'COMPLETED' || event.status === 'ARCHIVED') && !data.status) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'EVENT_LOCKED',
          message: `Cannot edit details of an event in '${event.status}' state. Completed events are immutable.`,
        },
      });
    }

    // State Transition System
    if (data.status && data.status !== event.status) {
      const current = event.status;
      const target = data.status;

      let allowed = false;

      if (current === 'APPROVED' && target === 'PLANNING') {
        allowed = true; // Board advances approved event into active planning
      } else if (current === 'PLANNING' && target === 'IN_PROGRESS') {
        allowed = true; // Board starts event execution
      } else if (target === 'ARCHIVED' && (isExecutive || isCampusAdmin) && current !== 'COMPLETED') {
        allowed = true; // Cancellation or administrative archive
      } else if (target === 'COMPLETED') {
        return res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_COMPLETION_FLOW',
            message: 'Events cannot be marked as COMPLETED directly. You must record an Event Retrospective to finalize completion.',
          },
        });
      } else if (target === 'PROPOSED') {
        return res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_SUBMISSION_FLOW',
            message: 'To submit an event for proposal, use the formal proposal submission endpoint (/events/:eventId/submit).',
          },
        });
      } else if (target === 'APPROVED') {
        return res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_APPROVAL_FLOW',
            message: 'Events cannot be self-approved. Approval must be granted by the assigned faculty coordinator.',
          },
        });
      }

      if (!allowed) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_STATE_TRANSITION',
            message: `Illegal transition from '${current}' to '${target}'. Event lifecycle rules: Draft → Proposed → Approved → Planning → In Progress → Completed.`,
          },
        });
      }

      event.status = target;
    }

    // Apply allowed scalar metadata updates
    if (data.title !== undefined) event.title = data.title;
    if (data.description !== undefined) event.description = data.description;
    if (data.eventType !== undefined) event.eventType = data.eventType;
    if (data.startDate !== undefined) event.startDate = new Date(data.startDate);
    if (data.endDate !== undefined) event.endDate = new Date(data.endDate);
    if (data.venueName !== undefined) event.venueName = data.venueName;
    if (data.venueCapacity !== undefined) event.venueCapacity = data.venueCapacity;
    if (data.estimatedBudget !== undefined) event.estimatedBudget = data.estimatedBudget;
    if (data.expectedAttendance !== undefined) event.expectedAttendance = data.expectedAttendance;
    if (data.tags !== undefined) event.tags = data.tags;

    await event.save();

    await AuditLog.create({
      campusId: req.campusId,
      clubId: event.clubId,
      actorId: req.user._id,
      action: 'EVENT_UPDATED',
      targetType: 'Event',
      targetId: event._id,
      metadata: { status: event.status, title: event.title },
    });

    const populated = await Event.findById(event._id)
      .populate('leadOrganizerId', 'fullName email avatarUrl')
      .populate('clubId', 'name code facultyCoordinatorId');

    return res.json({
      success: true,
      data: { event: populated },
    });
  } catch (err) {
    next(err);
  }
}

export async function submitProposal(req, res, next) {
  try {
    const event = await Event.findOne({
      _id: req.params.eventId,
      campusId: req.campusId,
    }).populate('clubId');

    if (!event) {
      return res.status(404).json({
        success: false,
        error: { code: 'EVENT_NOT_FOUND', message: 'Event not found in your campus.' },
      });
    }

    // Verify user membership in club and role
    const userRole = await getUserClubRole(req.campusId, event.clubId._id, req.user._id);
    const isLeadOrganizer = event.leadOrganizerId?.toString() === req.user._id.toString();
    const canSubmit = isLeadOrganizer || ['PRESIDENT', 'SECRETARY', 'CORE_TEAM'].includes(userRole);

    if (!canSubmit) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN_PROPOSAL_SUBMIT',
          message: 'Only event lead organizers or club core team members can submit proposals.',
        },
      });
    }

    // Only DRAFT events can be proposed
    if (event.status !== 'DRAFT') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_EVENT_STATE',
          message: `Cannot submit proposal: Event is already in '${event.status}' state. Only 'DRAFT' events can be submitted for review.`,
        },
      });
    }

    event.status = 'PROPOSED';
    await event.save();

    // Find faculty coordinator
    const facultyId = event.clubId.facultyCoordinatorId;

    const approval = await Approval.create({
      campusId: req.campusId,
      clubId: event.clubId._id,
      eventId: event._id,
      reviewerId: facultyId || null,
      decision: 'PENDING',
      comments: req.body.submissionNotes || 'Event submitted for formal faculty review.',
      revisionNumber: 1,
    });

    if (facultyId) {
      await Notification.create({
        campusId: req.campusId,
        userId: facultyId,
        title: 'New Event Proposal Submitted',
        message: `${event.clubId.name} submitted "${event.title}" for review.`,
        type: 'APPROVAL',
        link: `/faculty/approvals`,
      });
    }

    await AuditLog.create({
      campusId: req.campusId,
      clubId: event.clubId._id,
      actorId: req.user._id,
      action: 'PROPOSAL_SUBMITTED',
      targetType: 'Event',
      targetId: event._id,
    });

    return res.json({
      success: true,
      data: { event, approval },
      message: 'Proposal successfully submitted to faculty advisor.',
    });
  } catch (err) {
    next(err);
  }
}

export async function saveRetrospective(req, res, next) {
  try {
    const data = retrospectiveSchema.parse(req.body);

    const event = await Event.findOne({
      _id: req.params.eventId,
      campusId: req.campusId,
    });

    if (!event) {
      return res.status(404).json({
        success: false,
        error: { code: 'EVENT_NOT_FOUND', message: 'Event not found in your campus.' },
      });
    }

    // Role check: Lead Organizer, President, Secretary
    const userRole = await getUserClubRole(req.campusId, event.clubId, req.user._id);
    const isLeadOrganizer = event.leadOrganizerId?.toString() === req.user._id.toString();
    const isExecutive = userRole === 'PRESIDENT' || userRole === 'SECRETARY';
    const isCampusAdmin = req.user.campusRole === 'CAMPUS_ADMIN';

    if (!isLeadOrganizer && !isExecutive && !isCampusAdmin) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN_RETROSPECTIVE',
          message: 'Only event lead organizers or club executives can record or update retrospectives.',
        },
      });
    }

    // State machine check: Must be IN_PROGRESS (first time) or COMPLETED (editing retrospective)
    if (event.status !== 'IN_PROGRESS' && event.status !== 'COMPLETED') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_EVENT_STATE',
          message: `Cannot save retrospective for event in '${event.status}' state. Retrospectives can only be recorded when the event is 'IN_PROGRESS' or 'COMPLETED'.`,
        },
      });
    }

    event.actualAttendance = data.actualAttendance;
    event.actualBudget = data.actualBudget;
    event.status = 'COMPLETED';
    event.retrospective = {
      summary: data.summary,
      whatWentWell: data.whatWentWell,
      whatCouldImprove: data.whatCouldImprove,
      keyMetrics: data.keyMetrics || '',
      sponsorSatisfaction: data.sponsorSatisfaction || '',
      completedAt: event.retrospective?.completedAt || new Date(),
    };

    await event.save();

    await AuditLog.create({
      campusId: req.campusId,
      clubId: event.clubId,
      actorId: req.user._id,
      action: 'EVENT_COMPLETED_RETROSPECTIVE',
      targetType: 'Event',
      targetId: event._id,
      metadata: { actualAttendance: event.actualAttendance, actualBudget: event.actualBudget },
    });

    return res.json({
      success: true,
      data: { event },
      message: 'Event retrospective saved successfully. Event marked as completed.',
    });
  } catch (err) {
    next(err);
  }
}

export async function listEventTemplates(req, res, next) {
  try {
    const templates = await EventTemplate.find().sort({ name: 1 });
    return res.json({
      success: true,
      data: { templates },
    });
  } catch (err) {
    next(err);
  }
}
