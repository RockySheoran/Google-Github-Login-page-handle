import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as GitHubStrategy } from 'passport-github2';
import { 
  GOOGLE_CLIENT_ID, 
  GOOGLE_CLIENT_SECRET, 
  GITHUB_CLIENT_ID, 
  GITHUB_CLIENT_SECRET,
  NODE_ENV
} from '../utils/constants';
import User from '../models/User';
import { supabase } from './supabaseClient';

// Validate environment variables
if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
  throw new Error('Google OAuth credentials not configured');
}
if (!GITHUB_CLIENT_ID || !GITHUB_CLIENT_SECRET) {
  throw new Error('GitHub OAuth credentials not configured');
}

// Serialization
// Passport serialization and deserialization
passport.serializeUser((user: Express.User, done) => {
  done(null, user);
});

passport.deserializeUser((user: Express.User, done) => {
  done(null, user);
});

// Google Strategy with enhanced configuration
passport.use(new GoogleStrategy({
  clientID: GOOGLE_CLIENT_ID,
  clientSecret: GOOGLE_CLIENT_SECRET,
  callbackURL: NODE_ENV === 'production' 
    ? 'https://yourdomain.com/api/auth/google/callback'
    : 'http://localhost:5000/api/auth/google/callback',
  scope: ['profile', 'email'],
  passReqToCallback: true,
  // proxy: true
}, async (req, accessToken, refreshToken, profile, done) => {

  try {
console.log(accessToken, refreshToken, profile);
    // console.log(profile)
    if (!profile.emails?.[0]?.value) {
      throw new Error('No email provided by Google');
    }

    let user 

    
      user = {
        googleId: profile.id,
        email: profile.emails[0].value,
        name: profile.displayName,
        avatar: profile.photos?.[0]?.value,
        provider: 'google',
        isVerified: true
      }
    
    

    done(null, user);
  } catch (error) {
    console.error('Google authentication error:', error);
    done(error instanceof Error ? error : new Error('Authentication failed'), undefined);
  }
}));

// GitHub Strategy with enhanced configuration
passport.use(new GitHubStrategy({
  clientID: GITHUB_CLIENT_ID,
  clientSecret: GITHUB_CLIENT_SECRET,
  callbackURL: NODE_ENV === 'production'
    ? 'https://yourdomain.com/api/auth/github/callback'
    : 'http://localhost:5000/api/auth/github/callback',
  scope: ['user:email'],
  // proxy: true
}, async (accessToken: string, refreshToken: string, profile: any, done: any) => {
  try {
    // console.log(accessToken, refreshToken, profile);
    const email = profile.emails?.[0]?.value || `${profile.username}@users.noreply.github.com`;
    // console.log("GitHub profile:", profile);
    let user ;

    
      user = {
        githubId: profile.id,
        email,
        name: profile.displayName || profile.username,
        avatar: profile.photos?.[0]?.value,
        provider: 'github',
        isVerified: !!profile.emails?.[0]?.value
      }

    done(null, user);
  } catch (error) {
    console.error('GitHub authentication error:', error);
    done(error instanceof Error ? error : new Error('Authentication failed'), undefined);
  }
}));