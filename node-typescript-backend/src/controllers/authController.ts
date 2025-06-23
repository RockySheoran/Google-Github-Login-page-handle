import { Request, Response, NextFunction } from 'express';
import passport from 'passport';
import { sendTokenResponse } from '../services/tokenService';


class AuthController {
  // Google authentication
  public googleAuth(req: Request, res: Response, next: NextFunction) {
    passport.authenticate('google', {
      session: false,
      scope: ['profile', 'email'],
    })(req, res, next);
  }

  // Google callback
  public googleCallback(req: Request, res: Response, next: NextFunction) {
    passport.authenticate('google', { session: false }, (err: Error, user: any) => {
      if (err || !user) {
        return res.redirect(`${process.env.FRONTEND_URL}/login?error=authentication_failed`);
      }
      sendTokenResponse(user, res);
    })(req, res, next);
  }

  // GitHub authentication
  public githubAuth(req: Request, res: Response, next: NextFunction) {
    passport.authenticate('github', {
      session: false,
      scope: ['user:email'],
    })(req, res, next);
  }

  // GitHub callback
  public githubCallback(req: Request, res: Response, next: NextFunction) {
    passport.authenticate('github', { session: false }, (err: Error, user: any) => {
      if (err || !user) {
        return res.redirect(`${process.env.FRONTEND_URL}/login?error=authentication_failed`);
      }
      sendTokenResponse(user, res);
    })(req, res, next);
  }

  // Get current user
   public getMe = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<any> => {
    try {
      res.json({
        success: true,
        user: req.user,
      });
    } catch (error) {
      next(error);
    }
  };

  // Logout
 public logout = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<any> => {
    try {
      res.cookie('jwt', 'none', {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true,
      });
      res.status(200).json({
        success: true,
        message: 'User logged out successfully',
      });
    } catch (error) {
      next(error);
    }
  };
}

export default new AuthController();