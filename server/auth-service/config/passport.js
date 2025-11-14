import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/User.js';

// Configure Passport Google OAuth Strategy
export const configureGoogleAuth = () => {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:1002/api/auth/google/callback',
        passReqToCallback: true
      },
      async (req, accessToken, refreshToken, profile, done) => {
        try {
          // Extract email from profile
          const email = profile.emails && profile.emails[0] ? profile.emails[0].value : null;

          if (!email) {
            return done(new Error('No email found in Google profile'), null);
          }

          // Check if user already exists
          let user = await User.findOne({ email });

          if (user) {
            // User exists, update Google ID if not set
            if (!user.googleId) {
              user.googleId = profile.id;
              user.lastLogin = Date.now();
              await user.save();
            }
            return done(null, user);
          }

          // User doesn't exist - we'll return the profile info
          // The frontend will need to complete registration with role selection
          return done(null, {
            isNewUser: true,
            googleId: profile.id,
            email: email,
            firstName: profile.name?.givenName || '',
            lastName: profile.name?.familyName || '',
            picture: profile.photos && profile.photos[0] ? profile.photos[0].value : null
          });

        } catch (error) {
          console.error('Google OAuth error:', error);
          return done(error, null);
        }
      }
    )
  );

  // Serialize user for session
  passport.serializeUser((user, done) => {
    done(null, user);
  });

  // Deserialize user from session
  passport.deserializeUser((user, done) => {
    done(null, user);
  });
};

export default passport;
