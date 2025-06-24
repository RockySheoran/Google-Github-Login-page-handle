import express from 'express';
import passport from 'passport';
import authController from '../controllers/authController';
import { protect } from '../middlewares/authMiddleware';



const router = express.Router();

// Google OAuth routes
// router.get('/google', authController.googleAuth);
router.get(
  '/google/callback',
  authController.googleCallback
);
router.get('/google', 
    passport.authenticate('google', {scope:['profile', 'email']})
)




// GitHub OAuth routes
router.get('/github', authController.githubAuth);
router.get(
  '/github/callback',
  authController.githubCallback
);

// Get current user
router.get('/me', protect, authController.getMe);

// Logout
router.get('/logout', protect, authController.logout);

export default router;