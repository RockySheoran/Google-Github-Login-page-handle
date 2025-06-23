import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as GitHubStrategy } from 'passport-github2';
import User from '../models/User';
import {
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GITHUB_CLIENT_ID,
  GITHUB_CLIENT_SECRET
} from '../utils/constants';

// Verify environment variables are set
if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
  throw new Error('Google OAuth credentials not configured');
}
if (!GITHUB_CLIENT_ID || !GITHUB_CLIENT_SECRET) {
  throw new Error('GitHub OAuth credentials not configured');
}

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
passport.use(new GoogleStrategy({
  clientID: GOOGLE_CLIENT_ID,
  clientSecret: GOOGLE_CLIENT_SECRET,
  callbackURL: '/api/auth/google/callback',
  scope: ['profile', 'email']
}, async (accessToken, refreshToken, profile, done) => {
  // ... your existing Google auth logic
}));

// GitHub Strategy
passport.use(new GitHubStrategy({
  clientID: GITHUB_CLIENT_ID,
  clientSecret: GITHUB_CLIENT_SECRET,
  callbackURL: '/api/auth/github/callback',
  scope: ['user:email']
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