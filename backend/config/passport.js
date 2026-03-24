const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const pool = require('./db'); // Ensure correct path to db config
const { v4: uuidv4 } = require('uuid');

// Configure Passport with Google Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL || '/api/auth/google/callback',
      passReqToCallback: true,
      proxy: true // Important for Railway/Heroku deployment behind proxy
    },
    async (req, accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails[0].value;
        const googleId = profile.id;
        const username = profile.displayName || email.split('@')[0];

        // Find user by email OR google_id (covers all re-login cases)
        const existingUser = await pool.query(
          'SELECT * FROM users WHERE email = $1 OR google_id = $2',
          [email, googleId]
        );

        if (existingUser.rows.length > 0) {
          // User exists — update google_id if missing
          let user = existingUser.rows[0];
          if (!user.google_id) {
            await pool.query('UPDATE users SET google_id = $1 WHERE id = $2', [googleId, user.id]);
            user.google_id = googleId;
          }
          return done(null, user);
        }

        // New Google user — hash a random password to satisfy NOT NULL constraint
        const bcrypt = require('bcryptjs');
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(uuidv4(), salt);

        // Create new user; is_verified = true since Google has verified their email
        // Explicitly set onboarding_completed = false and return it so googleCallback can use it
        const newUser = await pool.query(
          'INSERT INTO users (username, email, password_hash, google_id, is_verified, onboarding_completed) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, username, email, is_verified, onboarding_completed, google_id',
          [username, email, hashedPassword, googleId, true, false]
        );

        // Notify admin of new Google signup (non-blocking)
        try {
          const { notifyNewUser } = require('../utils/adminNotify');
          notifyNewUser(username, email, 'Google OAuth');
        } catch (_) {}

        return done(null, newUser.rows[0]);

      } catch (err) {
        console.error('Google Auth Error:', err);
        return done(err, null);
      }
    }
  )
);

// We don't really need serialize/deserialize if we are using JWT and stateless session
// But passport might complain.
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    done(null, user.rows[0]);
  } catch (err) {
    done(err, null);
  }
});

module.exports = passport;
