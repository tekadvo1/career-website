require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');


const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const app = express();
const port = process.env.PORT || 5000;

// Security Middleware
app.use(helmet());

// Rate Limiting
app.set('trust proxy', 1); // Trust first proxy (necessary for Railway/Heroku/etc)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 1000, 
  standardHeaders: true, 
  legacyHeaders: false, 
});
app.use(limiter);

app.use(cors());
app.use(express.json());

// Passport middleware
require('./config/passport'); // Load passport config
const passport = require('passport');
app.use(passport.initialize());

// Database connection
const pool = require('./config/db');

// Initialize database schema
const initDb = async (retries = 10) => {
  while (retries > 0) {
    try {
      const client = await pool.connect();
      const schemaPath = path.join(__dirname, '../database/schema.sql');
      const schema = fs.readFileSync(schemaPath, 'utf8');
      await client.query(schema);
      client.release();
      console.log('Database schema initialized successfully');
      return;
    } catch (err) {
      console.error(`Error initializing database schema (retries left: ${retries - 1}):`, err.message);
      retries -= 1;
      if (retries === 0) {
        console.error('Failed to initialize database schema after multiple attempts.');
      } else {
        await new Promise(res => setTimeout(res, 5000));
      }
    }
  }
};

initDb();

// Routes
const authRoutes = require('./routes/authRoutes');
const resumeRoutes = require('./routes/resumeRoutes');
const roleRoutes = require('./routes/roleRoutes');
const resourceRoutes = require('./routes/resourceRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/resume', resumeRoutes);
app.use('/api/role', roleRoutes);
app.use('/api/resources', resourceRoutes);

// Database schema update for caching (allow NULL user_id)
const updateSchema = async () => {
  try {
    const client = await pool.connect();
    // Check if role_analyses exists, if so, modify user_id to be nullable
    await client.query(`
      DO $$
      BEGIN
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'role_analyses') THEN
          ALTER TABLE role_analyses ALTER COLUMN user_id DROP NOT NULL;
        END IF;
      END $$;
    `);

    // Create user_courses table if it doesn't exist
    await client.query(`
      CREATE TABLE IF NOT EXISTS user_courses (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        course_data JSONB NOT NULL,
        progress INTEGER DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    client.release();
    console.log('Schema updated for role caching');
  } catch (err) {
    console.error('Schema update error:', err.message);
  }
};
updateSchema();

app.get('/api/health', async (req, res) => {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    client.release();
    res.json({ status: 'ok', time: result.rows[0].now });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: 'error', message: 'Database connection failed' });
  }
});

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
  const path = require('path');
  app.use(express.static(path.join(__dirname, '../client/dist')));

  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../client', 'dist', 'index.html'));
  });
}

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
