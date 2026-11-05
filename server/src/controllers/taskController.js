import { z } from 'zod';
import { EventTask, Event, Membership, Notification } from '../models/index.js';

const createTaskSchema = z
  .object({
    title: z.string().min(2),
    description: z.string().optional(),
    priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).default('MEDIUM'),
    dueDate: z.string().optional(),
    assigneeId: z.string().optional(),
    prerequisiteTaskIds: z.array(z.string()).optional(),
  })
  .strict();

const updateTaskSchema = z
  .object({
    title: z.string().min(2).optional(),
    description: z.string().optional(),
    priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
    dueDate: z.string().nullable().optional(),
    status: z.enum(['TODO', 'IN_PROGRESS', 'REVIEW', 'BLOCKED', 'DONE']).optional(),
    assigneeId: z.string().nullable().optional(),
    prerequisiteTaskIds: z.array(z.string()).optional(),
  })
  .strict();

export async function listTasks(req, res, next) {
  try {
    const event = await Event.findOne({
      _id: req.params.eventId,
      campusId: req.campusId,
    });

    if (!event) {
      return res.status(404).json({
        success: false,
        error: { code: 'EVENT_NOT_FOUND', message: 'Event not found in this campus.' },
      });
    }

    // Tenant check: user must belong to club or be campus admin
    if (req.user.campusRole !== 'CAMPUS_ADMIN') {
      const membership = await Membership.findOne({
        campusId: req.campusId,
        clubId: event.clubId,
        userId: req.user._id,
        status: 'ACTIVE',
      });
      if (!membership && req.user.campusRole !== 'FACULTY_COORDINATOR') {
        return res.status(403).json({
          success: false,
          error: { code: 'NOT_A_MEMBER', message: 'You are not a member of this club.' },
        });
      }
    }

    const tasks = await EventTask.find({ eventId: event._id })
      .populate('assigneeId', 'fullName email avatarUrl')
      .populate('prerequisiteTaskIds', 'title status')
      .sort({ dueDate: 1, priority: -1 });

    return res.json({
      success: true,
      data: { tasks },
    });
  } catch (err) {
    next(err);
  }
}

export async function createTask(req, res, next) {
  try {
    const data = createTaskSchema.parse(req.body);

    const event = await Event.findOne({
      _id: req.params.eventId,
      campusId: req.campusId,
    });

    if (!event) {
      return res.status(404).json({
        success: false,
        error: { code: 'EVENT_NOT_FOUND', message: 'Event not found in this campus.' },
      });
    }

    // Role check: General members cannot create tasks
    const membership = await Membership.findOne({
      campusId: req.campusId,
      clubId: event.clubId,
      userId: req.user._id,
      status: 'ACTIVE',
    });

    const isLeadOrganizer = event.leadOrganizerId?.toString() === req.user._id.toString();
    const isCoreOrAbove = membership && ['CORE_TEAM', 'SECRETARY', 'PRESIDENT'].includes(membership.clubRole);
    const isCampusAdmin = req.user.campusRole === 'CAMPUS_ADMIN';

    if (!isLeadOrganizer && !isCoreOrAbove && !isCampusAdmin) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'INSUFFICIENT_CLUB_ROLE',
          message: 'General members cannot create event tasks. Requires Core Team privilege or Lead Organizer.',
        },
      });
    }

    const task = await EventTask.create({
      campusId: req.campusId,
      clubId: event.clubId,
      eventId: event._id,
      title: data.title,
      description: data.description || '',
      priority: data.priority,
      dueDate: data.dueDate ? new Date(data.dueDate) : null,
      assigneeId: data.assigneeId || null,
      prerequisiteTaskIds: data.prerequisiteTaskIds || [],
    });

    if (data.assigneeId) {
      await Notification.create({
        campusId: req.campusId,
        userId: data.assigneeId,
        title: 'New Task Assigned',
        message: `You were assigned "${task.title}" for event "${event.title}".`,
        type: 'TASK',
        link: `/clubs/${event.clubId}/events/${event._id}`,
      });
    }

    const populated = await EventTask.findById(task._id).populate('assigneeId', 'fullName email avatarUrl');

    return res.status(201).json({
      success: true,
      data: { task: populated },
    });
  } catch (err) {
    next(err);
  }
}

export async function updateTask(req, res, next) {
  try {
    const data = updateTaskSchema.parse(req.body);

    const task = await EventTask.findOne({
      _id: req.params.taskId,
      campusId: req.campusId,
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        error: { code: 'TASK_NOT_FOUND', message: 'Task not found in this campus.' },
      });
    }

    // Check membership and permissions
    const membership = await Membership.findOne({
      campusId: req.campusId,
      clubId: task.clubId,
      userId: req.user._id,
      status: 'ACTIVE',
    });

    const isAssignee = task.assigneeId?.toString() === req.user._id.toString();
    const isCoreOrAbove = membership && ['CORE_TEAM', 'SECRETARY', 'PRESIDENT'].includes(membership.clubRole);
    const isCampusAdmin = req.user.campusRole === 'CAMPUS_ADMIN';

    if (!isAssignee && !isCoreOrAbove && !isCampusAdmin) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN_TASK_UPDATE',
          message: 'You do not have permission to update this task.',
        },
      });
    }

    // Apply strictly validated updates
    if (data.title !== undefined) task.title = data.title;
    if (data.description !== undefined) task.description = data.description;
    if (data.priority !== undefined) task.priority = data.priority;
    if (data.dueDate !== undefined) task.dueDate = data.dueDate ? new Date(data.dueDate) : null;
    if (data.status !== undefined) task.status = data.status;
    if (data.assigneeId !== undefined) task.assigneeId = data.assigneeId;
    if (data.prerequisiteTaskIds !== undefined) task.prerequisiteTaskIds = data.prerequisiteTaskIds;

    await task.save();

    const populated = await EventTask.findById(task._id)
      .populate('assigneeId', 'fullName email avatarUrl')
      .populate('prerequisiteTaskIds', 'title status');

    return res.json({
      success: true,
      data: { task: populated },
    });
  } catch (err) {
    next(err);
  }
}

export async function deleteTask(req, res, next) {
  try {
    const task = await EventTask.findOne({
      _id: req.params.taskId,
      campusId: req.campusId,
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        error: { code: 'TASK_NOT_FOUND', message: 'Task not found in this campus.' },
      });
    }

    const membership = await Membership.findOne({
      campusId: req.campusId,
      clubId: task.clubId,
      userId: req.user._id,
      status: 'ACTIVE',
    });

    const isCoreOrAbove = membership && ['CORE_TEAM', 'SECRETARY', 'PRESIDENT'].includes(membership.clubRole);
    const isCampusAdmin = req.user.campusRole === 'CAMPUS_ADMIN';

    if (!isCoreOrAbove && !isCampusAdmin) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'INSUFFICIENT_CLUB_ROLE',
          message: 'Only Core Team members or executive officers can delete tasks.',
        },
      });
    }

    await EventTask.findByIdAndDelete(task._id);

    return res.json({
      success: true,
      message: 'Task deleted successfully.',
    });
  } catch (err) {
    next(err);
  }
}
