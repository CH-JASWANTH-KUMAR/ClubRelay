import { z } from 'zod';
import { EventTask, Event, Notification } from '../models/index.js';

const createTaskSchema = z.object({
  title: z.string().min(2),
  description: z.string().optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).default('MEDIUM'),
  dueDate: z.string().optional(),
  assigneeId: z.string().optional(),
  prerequisiteTaskIds: z.array(z.string()).optional(),
});

export async function listTasks(req, res, next) {
  try {
    const tasks = await EventTask.find({ eventId: req.params.eventId })
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
        error: { code: 'EVENT_NOT_FOUND', message: 'Event not found.' },
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
    const updates = req.body;
    const task = await EventTask.findOneAndUpdate(
      {
        _id: req.params.taskId,
        campusId: req.campusId,
      },
      updates,
      { new: true }
    ).populate('assigneeId', 'fullName email avatarUrl');

    if (!task) {
      return res.status(404).json({
        success: false,
        error: { code: 'TASK_NOT_FOUND', message: 'Task not found.' },
      });
    }

    return res.json({
      success: true,
      data: { task },
    });
  } catch (err) {
    next(err);
  }
}

export async function deleteTask(req, res, next) {
  try {
    const task = await EventTask.findOneAndDelete({
      _id: req.params.taskId,
      campusId: req.campusId,
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        error: { code: 'TASK_NOT_FOUND', message: 'Task not found.' },
      });
    }

    return res.json({
      success: true,
      message: 'Task deleted successfully.',
    });
  } catch (err) {
    next(err);
  }
}
