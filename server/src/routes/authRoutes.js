import express from 'express';
import {
  login,
  register,
  logout,
  getCurrentUser,
  getProviders,
  googleAuth,
  googleCallback,
  githubAuth,
  githubCallback,
} from '../controllers/authController.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.get('/providers', getProviders);
router.post('/login', login);
router.post('/register', register);
router.post('/logout', logout);
router.get('/me', requireAuth, getCurrentUser);

// OAuth Routes
router.get('/google', googleAuth);
router.get('/google/callback', googleCallback);
router.get('/github', githubAuth);
router.get('/github/callback', githubCallback);

export default router;
