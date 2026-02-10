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
        // Check if user already exists
        const email = profile.emails[0].value;
        const googleId = profile.id;
        const username = profile.displayName || email.split('@')[0];
        
        // Find user by email
        const existingUser = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        
        if (existingUser.rows.length > 0) {
          // User exists
          let user = existingUser.rows[0];
          
          // Optionally update google_id here if null
          if (!user.google_id) {
             await pool.query('UPDATE users SET google_id = $1 WHERE id = $2', [googleId, user.id]);
             user.google_id = googleId;
          }
          
          return done(null, user);
        }
        
        // Provide random password if creating account via Google
        const randomPassword = uuidv4(); 
        // Hash it? Usually we don't need password for OAuth users, but db schema might enforce `password_hash` NOT NULL.
        // I will assume db allows null password or check schema.
        // My previous schema says password_hash is NOT NULL. So I need to hash a random password or update schema.
        // Let's hash a random password for now to satisfy constraints.
        const bcrypt = require('bcryptjs');
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(randomPassword, salt);
        
        // Create new user
        // Note: is_verified = true since Google verified their email
        const newUser = await pool.query(
          'INSERT INTO users (username, email, password_hash, google_id, is_verified) VALUES ($1, $2, $3, $4, $5) RETURNING *',
          [username, email, hashedPassword, googleId, true]
        );
        
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
