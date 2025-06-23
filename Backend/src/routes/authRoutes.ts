import express from 'express';
import passport from 'passport';
import AuthController from '../controllers/authController';
import { protect } from '../middlewares/authMiddleware';

const router = express.Router();

// Google OAuth routes
router.get('/google', AuthController.googleAuth);
router.get(
  '/google/callback',
  AuthController.googleCallback
);

// GitHub OAuth routes
router.get('/github', AuthController.githubAuth);
router.get(
  '/github/callback',
  AuthController.githubCallback
);

// Get current user
router.get('/me', protect, AuthController.getMe);

// Logout
router.get('/logout', protect, AuthController.logout);

export default router;