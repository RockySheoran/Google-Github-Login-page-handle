import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as GitHubStrategy } from 'passport-github2';

import { 
  GOOGLE_CLIENT_ID, 
  GOOGLE_CLIENT_SECRET, 
  GITHUB_CLIENT_ID, 
  GITHUB_CLIENT_SECRET ,
  
} from '../utils/constants';
import User from '../models/User'

passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

// Google Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      callbackURL: '/api/auth/google/callback',
      scope: ['profile', 'email'],
    },
    async (accessToken, refreshToken, profile, done) => {
      console.log(accessToken, refreshToken, profile);
      // Check if the profile has an email
      try {
        let user = await User.findOne({ email: profile.emails?.[0].value });

        if (!user) {
          user = await User.create({
            googleId: profile.id,
            email: profile.emails?.[0].value,
            name: profile.displayName,
            avatar: profile.photos?.[0].value,
            provider: 'google',
            isVerified: true,
          });
        } else if (!user.googleId) {
          user.googleId = profile.id;
          user.avatar = profile.photos?.[0].value;
          user.provider = 'google';
          user.isVerified = true;
          await user.save();
        }

        done(null, user);
      } catch (error) {
        done(error as Error, undefined);
      }
    }
  )
);

// GitHub Strategy
passport.use(
  new GitHubStrategy(
    {
      clientID: GITHUB_CLIENT_ID,
      clientSecret: GITHUB_CLIENT_SECRET,
      callbackURL: '/api/auth/github/callback',
      scope: ['user:email'],
    },
    async (accessToken: string, refreshToken: string, profile: any, done: any) => {
      try {
        // GitHub may not always return email, so we need to handle that
        const email = profile.emails?.[0].value || `${profile.username}@users.noreply.github.com`;
        
        let user = await User.findOne({ email });

        if (!user) {
          user = await User.create({
            githubId: profile.id,
            email,
            name: profile.displayName || profile.username,
            avatar: profile.photos?.[0].value,
            provider: 'github',
            isVerified: !!profile.emails?.[0].value, // Mark as verified if email is provided
          });
        } else if (!user.githubId) {
          user.githubId = profile.id;
          user.avatar = profile.photos?.[0].value;
          user.provider = 'github';
          if (profile.emails?.[0].value) user.isVerified = true;
          await user.save();
        }

        done(null, user);
      } catch (error) {
        done(error as Error, undefined);
      }
    }
  )
);