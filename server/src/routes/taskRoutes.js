import express from 'express';
import { listTasks, createTask, updateTask, deleteTask } from '../controllers/taskController.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.use(requireAuth);

router.get('/events/:eventId/tasks', listTasks);
router.post('/events/:eventId/tasks', createTask);
router.put('/tasks/:taskId', updateTask);
router.delete('/tasks/:taskId', deleteTask);

export default router;
