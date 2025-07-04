import e, { Request, Response, NextFunction } from 'express';
import passport from 'passport';
import { supabase } from '../config/supabaseClient';
import jwt from 'jsonwebtoken';

class AuthController {
  // Google authentication
  public googleAuth(req: Request, res: Response, next: NextFunction) {
    const redirectUrl = req.query.redirect_uri?.toString() || `${process.env.FRONTEND_URL}/api/auth/google/callback`;



    passport.authenticate('google', {

      scope: ['profile', 'email'],
      successRedirect: redirectUrl,


    })(req, res, next);
  }

  // Google callback with JWT token
  public async googleCallback(req: Request, res: Response, next: NextFunction) {
    passport.authenticate('google', {
      session: true,
    }, async (err: Error, user: any, info: any) => {
      try {
        if (err || !user) {
          console.error('Google auth error:', err || info);
          return res.redirect(`${process.env.FRONTEND_URL}/login?error=auth_failed`);
        }

        // Check if user exists in Supabase
        // const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
        // if (listError) throw listError;

        // const existingUser = users?.find(u => u.email === user.email);

        // console.log("existingUser:", existingUser);
        const { data: existingUser } = await supabase.rpc("get_user_by_email", {
          p_email: user.email,
        });
        console.log("existingUser:", existingUser);

        let authUser;
        if (existingUser.id !== null) {
          // User exists - update provider if needed
          const currentProviders = existingUser.raw_app_meta_data?.providers || [];

          // console.log("currentProviders" , currentProviders)

          if (!currentProviders.includes('google')) {
            // Add Google to providers
            const { data: { user: updatedUser }, error: updateError } =
              await supabase.auth.admin.updateUserById(existingUser.id, {
                app_metadata: {
                  ...existingUser.app_metadata,
                  provider: 'google',
                  providers: [...currentProviders, 'google']
                },
                user_metadata: {
                  ...existingUser.user_metadata,
                  name: user.name || user.displayName || existingUser.user_metadata?.name,
                  avatar_url: user.avatar || user.photo || existingUser.user_metadata?.avatar_url
                }
              });

            if (updateError) throw updateError;
            authUser = updatedUser;
          } else {
            authUser = existingUser;
          }
        } else {
          // Create new user
          const { data: { user: createdUser }, error: createError } =
            await supabase.auth.admin.createUser({
              email: user.email,
              user_metadata: {
                name: user.name || user.displayName || user.email?.split('@')[0] || 'User',
                avatar_url: user.avatar || user.photo || null
              },
              app_metadata: {
                provider: 'google',
                providers: ['google']
              },
              email_confirm: true
            });

          if (createError || !createdUser) {
            console.error('Supabase user creation error:', createError);
            throw createError || new Error('User creation failed');
          }
          authUser = createdUser;
        }

        // Generate JWT token
        const token = jwt.sign(
          {
            id: authUser?.id,
            email: authUser?.email,
            name: authUser?.user_metadata?.name || user.name || user.displayName,
            providers: authUser?.app_metadata?.providers || []
          },
          process.env.JWT_SECRET!,
          { expiresIn: '1h' }
        );
        const cookiesData = {
          token: token,
          id: authUser?.id,
          email: authUser?.email,
          name: authUser?.user_metadata?.name || user.name || user.displayName,
          providers: authUser?.app_metadata?.providers || []
        }
        res.cookie('jwt', cookiesData, {
          httpOnly: true,
          secure: true,
          // sameSite: 'Lax'
          sameSite: 'strict', // Changed from strict for OAuth compatibility
          maxAge: 24 * 60 * 60 * 1000, // 1 day
          path: '/',
        });

        // Redirect with token
        const redirectUri = req.query.state?.toString() || `${process.env.FRONTEND_URL}/auth/success`;
        return res.redirect(`${redirectUri}?token=${token}`);

      } catch (error) {
        console.error('Authentication processing error:', error);
        return res.redirect(`${process.env.FRONTEND_URL}/login?error=server_error`);
      }
    })(req, res, next);
  }

  // GitHub authentication
  public githubAuth(req: Request, res: Response, next: NextFunction) {
    const redirectUrl = req.query.redirect_uri?.toString() || `${process.env.BACKEND_URL}/api/auth/github/callback`;


    passport.authenticate('github', {
      session: false,
      scope: ['user:email'],
      state: redirectUrl

    })(req, res, next);
  }

  // GitHub callback with JWT token
  public async githubCallback(req: Request, res: Response, next: NextFunction) {
    passport.authenticate('github', {
      session: false
    }, async (err: Error, user: any, info: any) => {
      try {
        console.log("GitHub user:", user);
        if (err || !user) {
          console.error('GitHub auth error:', err || info);
          return res.redirect(`${process.env.FRONTEND_URL}/login?error=auth_failed`);
        }

        // Get primary email
        const primaryEmail = user.email;
        console.log("primaryEmail:", primaryEmail);
        if (!primaryEmail) {
          console.error('No primary email found for GitHub user');
          return res.redirect(`${process.env.FRONTEND_URL}/login?error=no_email`);
        }
        const { data: existingUser } = await supabase.rpc("get_user_by_email", {
          p_email: user.email,
        });
        console.log("existingUser:", existingUser);

        // console.log("existingUser:", existingUser);
        // If user exists, update their information or create a new user
        let authUser;
        if (existingUser.id !== null) {
          // User exists - update provider if needed
          const currentProviders = existingUser.raw_app_meta_data?.providers || [];
          console.log("currentProviders", currentProviders)
          if (!currentProviders.includes('github')) {
            // Add GitHub to providers
            const { data: { user: updatedUser }, error: updateError } =
              await supabase.auth.admin.updateUserById(existingUser.id, {
                app_metadata: {
                  ...existingUser.app_metadata,
                  provider: 'github',
                  providers: [...currentProviders, 'github']
                },
                user_metadata: {
                  ...existingUser.user_metadata,
                  name: user.displayName || user.username || existingUser.user_metadata?.name,
                  avatar_url: user.photos?.[0]?.value || existingUser.user_metadata?.avatar_url
                }
              });

            if (updateError) throw updateError;
            authUser = updatedUser;
          } else {
            authUser = existingUser;
          }
        } else {
          // Create new user
          const { data: { user: createdUser }, error: createError } =
            await supabase.auth.admin.createUser({
              email: primaryEmail,
              user_metadata: {
                name: user.displayName || user.name || primaryEmail.split('@')[0] || 'User',
                avatar_url: user.photos?.[0]?.value || null
              },
              app_metadata: {
                provider: 'github',
                providers: ['github']
              },

              email_confirm: true,

            });

          if (createError || !createdUser) {
            console.error('Supabase user creation error:', createError);
            throw createError || new Error('User creation failed');
          }
          authUser = createdUser;
        }

        // Generate JWT token
        const token = jwt.sign(
          {
            id: authUser?.id,
            email: primaryEmail,
            name: authUser?.user_metadata?.name || user.displayName || user.username,
            providers: authUser?.app_metadata?.providers || []
          },
          process.env.JWT_SECRET!,
          { expiresIn: '1h' }
        );

        // // Store/update additional profile data
        // const { error: profileError } = await supabase
        //   .from('profiles')
        //   .upsert({
        //     id: authUser?.id,
        //     email: primaryEmail,
        //     full_name: user.displayName || user.username,
        //     avatar_url: user.photos?.[0]?.value,
        //     provider: 'github',
        //     last_login_at: new Date().toISOString(),
        //     updated_at: new Date().toISOString()
        //   }, {
        //     onConflict: 'id'
        //   });

        // if (profileError) throw profileError;

        const cookiesData = {
          token: token,
          id: authUser?.id,
          email: authUser?.email,
          name: authUser?.user_metadata?.name || user.name || user.displayName,
          providers: authUser?.app_metadata?.providers || []
        }

        // cookies 
        res.cookie('jwt', cookiesData, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict', // Changed from strict for OAuth compatibility
          maxAge: 24 * 60 * 60 * 1000, // 1 day
          path: '/',
        });


        // Redirect with token
        const redirectUri = req.query.state?.toString() || `${process.env.FRONTEND_URL}/auth/success`;
        return res.redirect(`${redirectUri}?token=${token}`);

      } catch (error) {
        console.error('Authentication processing error:', error);
        return res.redirect(`${process.env.FRONTEND_URL}/login?error=server_error`);
      }
    })(req, res, next);
  }

  // Get current user using JWT
  public getMe = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    try {

      const decoded = req.user as any
      // const token = req.headers.authorization?.split(' ')[1];
      // // console.log(token)
      // if (!token) {
      //   return res.status(401).json({ success: false, message: 'No token provided' });
      // }

      // // Verify JWT token
      // const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string };

      // Get user from Supabase
      const { data: { user }, error } = await supabase.auth.admin.getUserById(decoded?.id);

      if (error || !user) {
        console.error('User not found:', error);
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      // Get additional profile data
      // const { data: profile, error: profileError } = await supabase
      //   .from('profiles')
      //   .select('*')
      //   .eq('id', user.id)
      //   .single();

      //   console.log("profile:", profile);

      // console.log("user:", user);

      // if (profileError) throw profileError;

      return res.status(200).json({
        success: true,
        user: user

      });
    } catch (error) {
      console.error('Authentication error:', error);
      res.status(401).json({ success: false, message: 'Invalid token' });
    }
  };

  // Logout (client should discard the token)
  public logout = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // In a JWT system, logout is handled client-side by discarding the token
      res.status(200).json({
        success: true,
        message: 'Logout successful (client should discard token)'
      });
    } catch (error) {
      next(error);
    }
  };



  public async forgotPassword(req: Request, res: Response): Promise<any> {
    try {
      const { email } = req.body;

      const { data: existingUser } = await supabase.rpc("get_user_by_email", {
        p_email: email,
      });
      console.log("existingUser:", existingUser);


      if (existingUser.id == null) {
        return res.status(404).json({
          success: false,
          message: 'If this email exists, a reset link has been sent'
        });
      }

      // 2. Generate reset token (using Supabase's built-in recovery)
      const { data, error } = await supabase
        .auth
        .resetPasswordForEmail(email);

      if (error) {
        console.error('Supabase password reset error:', error);
        throw error;
      }

      res.status(200).json({
        success: true,
        message: 'Please check your email'
      });

    } catch (error) {
      console.error('Forgot password error:', error);
      res.status(500).json({
        success: false,
        message: 'Error processing password reset request'
      });
    }
  }

  // RESET PASSWORD
  public async resetPassword(req: Request, res: Response): Promise<any> {
    try {
      const { email, newPassword } = req.body;
      const { data: existingUser } = await supabase.rpc("get_user_by_email", {
        p_email: email,
      });
      console.log("existingUser:", existingUser);



      if (existingUser.id == null) {
        return res.status(404).json({
          success: false,
          message: 'If this email exists, a reset link has been sent'
        });
      }


      // 1. Verify the token with Supabase
      console.log(email, newPassword)



      // 2. Update the password
      const { data, error } = await supabase.auth.admin.updateUserById(
        existingUser.id,
        { password: newPassword }
      );
      console.log(data)
      console.log(error)
      if (error) {
        console.error('Password update error');
        res.status(500).json({
          success: false,
          message: 'Error resetting password'
        });

      }


      res.status(200).json({
        success: true,
        message: 'Password updated successfully'
      });

    } catch (error) {
      console.error('Reset password error:', error);
      res.status(500).json({
        success: false,
        message: 'Error resetting password'
      });
    }
  }

}

export default new AuthController();