import { z } from 'zod';
import { EventTask, Event, ClubMembership, Notification } from '../models/index.js';
import { resolveClubAccess } from '../services/rbacService.js';

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
    }).populate('clubId');

    if (!event) {
      return res.status(404).json({
        success: false,
        error: { code: 'EVENT_NOT_FOUND', message: 'Event not found in this campus.' },
      });
    }

    const access = await resolveClubAccess(req.user, event.clubId, {
      allowCampusAdmin: true,
      allowAssignedFaculty: true,
    });

    if (!access.allowed || !access.capabilities.has('tasks.view')) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'Access denied: You are not authorized to view tasks for this organization.',
        },
      });
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

    const access = await resolveClubAccess(req.user, event.clubId, { allowCampusAdmin: true });
    const isLeadOrganizer =
      access.isActiveMember && event.leadOrganizerId?.toString() === req.user._id.toString();
    const isCoreOrAbove =
      access.capabilities.has('tasks.manage') ||
      access.capabilities.has('projects.create') ||
      ['CORE_TEAM', 'SECRETARY', 'PRESIDENT'].includes(access.legacyRoleEquivalent);
    const isCampusAdmin = access.isCampusAdmin;

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

    const access = await resolveClubAccess(req.user, task.clubId, { allowCampusAdmin: true });
    const isAssignee =
      access.isActiveMember && task.assigneeId?.toString() === req.user._id.toString();
    const isCoreOrAbove =
      access.capabilities.has('tasks.manage') ||
      access.capabilities.has('projects.edit') ||
      ['CORE_TEAM', 'SECRETARY', 'PRESIDENT'].includes(access.legacyRoleEquivalent);
    const isCampusAdmin = access.isCampusAdmin;

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

    const access = await resolveClubAccess(req.user, task.clubId, { allowCampusAdmin: true });
    const isCoreOrAbove =
      access.capabilities.has('tasks.manage') ||
      access.capabilities.has('projects.edit') ||
      ['CORE_TEAM', 'SECRETARY', 'PRESIDENT'].includes(access.legacyRoleEquivalent);
    const isCampusAdmin = access.isCampusAdmin;

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

export async function getMyWorkTasks(req, res, next) {
  try {
    // Active clubs resolved on auth middleware include both legacy & custom memberships
    const activeMemberships = req.user.memberships || [];
    const activeClubIds = activeMemberships.map((m) => m.clubId?._id || m.clubId).filter(Boolean);

    if (activeClubIds.length === 0) {
      const fallbackCustom = await ClubMembership.find({
        userId: req.user._id,
        status: 'ACTIVE',
      }).select('clubId');
      activeClubIds.push(...fallbackCustom.map((m) => m.clubId));
    }

    if (activeClubIds.length === 0) {
      return res.json({
        success: true,
        data: {
          tasks: [],
          stats: {
            total: 0,
            dueToday: 0,
            upcoming: 0,
            overdue: 0,
            blocked: 0,
            completed: 0,
          },
        },
      });
    }

    // 2. Build task filter strictly scoped to the user and their active clubs on this campus
    const filter = {
      campusId: req.campusId,
      clubId: { $in: activeClubIds },
      assigneeId: req.user._id,
    };

    if (req.query.clubId) {
      if (!activeClubIds.some((id) => id.toString() === req.query.clubId.toString())) {
        return res.status(403).json({
          success: false,
          error: {
            code: 'FORBIDDEN_CLUB_TASKS',
            message: 'Access denied: You are not an active member of this organization.',
          },
        });
      }
      filter.clubId = req.query.clubId;
    }

    if (req.query.status) {
      filter.status = req.query.status;
    }

    if (req.query.priority) {
      filter.priority = req.query.priority;
    }

    const tasks = await EventTask.find(filter)
      .populate('eventId', 'title startDate endDate status clubId')
      .populate('clubId', 'name code avatarUrl')
      .populate('prerequisiteTaskIds', 'title status')
      .sort({ dueDate: 1, priority: -1 });

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    let dueToday = 0;
    let upcoming = 0;
    let overdue = 0;
    let blocked = 0;
    let completed = 0;

    tasks.forEach((t) => {
      if (t.status === 'DONE') {
        completed++;
      } else if (t.status === 'BLOCKED') {
        blocked++;
      } else if (t.dueDate) {
        const due = new Date(t.dueDate);
        if (due < startOfToday) {
          overdue++;
        } else if (due >= startOfToday && due <= endOfToday) {
          dueToday++;
        } else {
          upcoming++;
        }
      } else {
        upcoming++;
      }
    });

    return res.json({
      success: true,
      data: {
        tasks,
        stats: {
          total: tasks.length,
          dueToday,
          upcoming,
          overdue,
          blocked,
          completed,
        },
      },
    });
  } catch (err) {
    next(err);
  }
}
