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
} from '../models/index.js';

const createEventSchema = z.object({
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
});

const retrospectiveSchema = z.object({
  actualAttendance: z.number(),
  actualBudget: z.number(),
  summary: z.string().min(5),
  whatWentWell: z.string(),
  whatCouldImprove: z.string(),
  keyMetrics: z.string().optional(),
  sponsorSatisfaction: z.string().optional(),
});

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
        error: { code: 'CLUB_NOT_FOUND', message: 'Club not found.' },
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
        error: { code: 'EVENT_NOT_FOUND', message: 'Event not found.' },
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
    const updates = req.body;
    const event = await Event.findOneAndUpdate(
      {
        _id: req.params.eventId,
        campusId: req.campusId,
      },
      updates,
      { new: true }
    ).populate('leadOrganizerId', 'fullName email avatarUrl');

    if (!event) {
      return res.status(404).json({
        success: false,
        error: { code: 'EVENT_NOT_FOUND', message: 'Event not found.' },
      });
    }

    return res.json({
      success: true,
      data: { event },
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
        error: { code: 'EVENT_NOT_FOUND', message: 'Event not found.' },
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
      reviewerId: facultyId || req.user._id,
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
        error: { code: 'EVENT_NOT_FOUND', message: 'Event not found.' },
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
      completedAt: new Date(),
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
