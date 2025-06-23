import { Request, Response, NextFunction } from 'express';
import passport from 'passport';
import { sendTokenResponse } from '../services/tokenService';

class AuthController {
  // Google authentication
  public googleAuth(req: Request, res: Response, next: NextFunction) {
    const redirectUrl = req.query.redirect_uri?.toString() || `${process.env.FRONTEND_URL}/auth/success`;
    
    passport.authenticate('google', {
      session: false,
      scope: ['profile', 'email'],
      state: redirectUrl, // Store redirect URL in state
      accessType: 'offline', // Optional: for refresh tokens
      prompt: 'select_account' // Optional: force account selection
    })(req, res, next);
  }

  // Google callback
  public googleCallback(req: Request, res: Response, next: NextFunction) {
    passport.authenticate('google', { 
      session: false,
      failureRedirect: `${process.env.FRONTEND_URL}/login?error=google_auth_failed`
    }, (err: Error, user: any, info: any) => {
      if (err) {
        console.error('Google auth error:', err);
        return res.redirect(`${process.env.FRONTEND_URL}/login?error=auth_error`);
      }
      
      if (!user) {
        console.error('Google auth failed:', info);
        return res.redirect(`${process.env.FRONTEND_URL}/login?error=authentication_failed`);
      }

      // Generate token and set cookie
      const token = sendTokenResponse(user, res);
      
      // Redirect to frontend with token
      const redirectUri = req.query.state?.toString() || `${process.env.FRONTEND_URL}/auth/success`;
      return res.redirect(`${redirectUri}?token=${token}`);
    })(req, res, next);
  }

  // GitHub authentication
  public githubAuth(req: Request, res: Response, next: NextFunction) {
    const redirectUrl = req.query.redirect_uri?.toString() || `${process.env.FRONTEND_URL}/auth/success`;
    
    passport.authenticate('github', {
      session: false,
      scope: ['user:email'],
      state: redirectUrl
    })(req, res, next);
  }

  // GitHub callback
  public githubCallback(req: Request, res: Response, next: NextFunction) {
    passport.authenticate('github', { 
      session: false,
      failureRedirect: `${process.env.FRONTEND_URL}/login?error=github_auth_failed`
    }, (err: Error, user: any, info: any) => {
      if (err) {
        console.error('GitHub auth error:', err);
        return res.redirect(`${process.env.FRONTEND_URL}/login?error=auth_error`);
      }
      
      if (!user) {
        console.error('GitHub auth failed:', info);
        return res.redirect(`${process.env.FRONTEND_URL}/login?error=authentication_failed`);
      }

      // Generate token and set cookie
      const token = sendTokenResponse(user, res);
      
      // Redirect to frontend with token
      const redirectUri = req.query.state?.toString() || `${process.env.FRONTEND_URL}/auth/success`;
      return res.redirect(`${redirectUri}?token=${token}`);
    })(req, res, next);
  }

  // Get current user
  public getMe = async (req: Request, res: Response, next: NextFunction) => {
    try {
      res.status(200).json({
        success: true,
        user: req.user
      });
    } catch (error) {
      next(error);
    }
  };

  // Logout
  public logout = async (req: Request, res: Response, next: NextFunction) => {
    try {
      res.cookie('jwt', 'none', {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
      });
      
      res.status(200).json({
        success: true,
        message: 'User logged out successfully'
      });
    } catch (error) {
      next(error);
    }
  };
}

export default new AuthController();