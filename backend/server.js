require('dotenv').config();

// Catch uncaught errors so the server doesn't die silently
process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION:', err.message, err.stack);
});
process.on('unhandledRejection', (reason) => {
  console.error('UNHANDLED REJECTION:', reason);
});
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const platformState = require('./utils/platformState');


const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const app = express();
const port = process.env.PORT || 5000;

// Security Middleware
// Relax Helmet CSP to allow Vite/React inline scripts to execute and prevent "white screen of death"
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  })
);

// Rate Limiting
app.set('trust proxy', 1); // Trust first proxy (necessary for Railway/Heroku/etc)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 1000, 
  standardHeaders: true, 
  legacyHeaders: false, 
});
app.use(limiter);

// CORS — only allow requests from known domains
const allowedOrigins = [
  'https://www.findstreak.com',
  'https://findstreak.com',
  'http://localhost:5173',
  'http://localhost:3000',
];

// Add dynamic FRONTEND_URL (like the Railway Staging URL) if it exists
if (process.env.FRONTEND_URL && !allowedOrigins.includes(process.env.FRONTEND_URL)) {
  allowedOrigins.push(process.env.FRONTEND_URL);
}

// Support for any Railway auto-generated domain in dev/staging
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin or known origin
    if (!origin || allowedOrigins.includes(origin) || origin.endsWith('.up.railway.app') || origin.endsWith('.railway.app')) {
      callback(null, true);
    } else {
      console.warn(`Blocked CORS request from origin: ${origin}`);
      callback(new Error(`CORS: origin '${origin}' not allowed`));
    }
  },
  credentials: true,
}));

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
const aiRoutes = require('./routes/aiRoutes');
const missionRoutes = require('./routes/missionRoutes');
const achievementRoutes = require('./routes/achievementRoutes');
const realtimeRoutes = require('./routes/realtimeRoutes');
const workspaceRoutes = require('./routes/workspaceRoutes');
const jobMatchRoutes = require('./routes/jobMatchRoutes');
const contactRoutes = require('./routes/contactRoutes');
const projectStructureRoutes = require('./routes/projectStructureRoutes');
const adminRoutes = require('./routes/adminRoutes');
const adminAuthRoutes = require('./routes/adminAuthRoutes');

const { protect } = require('./middleware/authMiddleware');
const { adminProtect } = require('./middleware/adminMiddleware');

// --- Maintenance Mode Middleware ---
app.get('/api/maintenance-status', (req, res) => {
  res.json({ maintenance: platformState.isMaintenanceMode() });
});

app.use('/api', (req, res, next) => {
  if (platformState.isMaintenanceMode() && !req.path.startsWith('/admin-auth') && !req.path.startsWith('/admin')) {
    return res.status(503).json({ error: 'System is currently undergoing maintenance. Please try again shortly.', maintenance: true });
  }
  next();
});

// --- Public routes (no auth required) ---
app.use('/api/auth', authRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/admin-auth', adminAuthRoutes);   // Public admin login — no user JWT needed

// --- Protected routes (JWT required) ---
app.use('/api/ai',          protect, aiRoutes);
app.use('/api/resume',      protect, resumeRoutes);
app.use('/api/role',        protect, roleRoutes);
app.use('/api/missions',    protect, missionRoutes);
app.use('/api/achievements',protect, achievementRoutes);
app.use('/api/realtime',    protect, realtimeRoutes);
app.use('/api/workspaces',  protect, workspaceRoutes);
app.use('/api/job-match',   protect, jobMatchRoutes);
app.use('/api/project-structure', protect, projectStructureRoutes);
app.use('/api/admin',       adminProtect, adminRoutes);  // Uses admin JWT, NOT user JWT

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

        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'current_streak') THEN
          ALTER TABLE users ADD COLUMN current_streak INTEGER DEFAULT 0;
          ALTER TABLE users ADD COLUMN longest_streak INTEGER DEFAULT 0;
          ALTER TABLE users ADD COLUMN last_active_date DATE;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'current_workspace_id') THEN
          ALTER TABLE users ADD COLUMN current_workspace_id INTEGER REFERENCES workspaces(id) ON DELETE SET NULL;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'ai_credits') THEN
          ALTER TABLE users ADD COLUMN ai_credits INTEGER DEFAULT 20;
          ALTER TABLE users ADD COLUMN last_credit_reset TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'github_username') THEN
          ALTER TABLE users ADD COLUMN github_username VARCHAR(255);
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

    // Create task_guides table for caching generated guides
    await client.query(`
      CREATE TABLE IF NOT EXISTS task_guides (
        id SERIAL PRIMARY KEY,
        project_title VARCHAR(255) NOT NULL,
        task_text TEXT NOT NULL,
        guide_data JSONB NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(project_title, task_text)
      );
    `);

    // Create chat_sessions table to sync AI learning assistant chats across mobile and laptop
    await client.query(`
      CREATE TABLE IF NOT EXISTS chat_sessions (
        id VARCHAR(255) PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        messages JSONB NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create interview_guides table
    await client.query(`
      CREATE TABLE IF NOT EXISTS interview_guides (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        role VARCHAR(255) NOT NULL,
        guide_data JSONB NOT NULL,
        question_help JSONB DEFAULT '{}'::jsonb,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, role)
      );
    `);
    
    // Auto-migrate role column into chat_sessions
    await client.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'chat_sessions' AND column_name = 'role') THEN
          ALTER TABLE chat_sessions ADD COLUMN role VARCHAR(255) DEFAULT 'Software Engineer';
        END IF;
      END $$;
    `);

    // Add is_public flag to users - controls public profile visibility
    await client.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'is_public') THEN
          ALTER TABLE users ADD COLUMN is_public BOOLEAN DEFAULT FALSE;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'ai_credits') THEN
          ALTER TABLE users ADD COLUMN ai_credits INTEGER DEFAULT 20;
          ALTER TABLE users ADD COLUMN last_credit_reset TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
        END IF;
      END $$;
    `);

    // Create platform_settings table for maintenance mode
    await client.query(`
      CREATE TABLE IF NOT EXISTS platform_settings (
        id SERIAL PRIMARY KEY,
        maintenance_mode BOOLEAN DEFAULT FALSE,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Initialize platform settings if empty, and sync memory state
    const settingsRes = await client.query('SELECT maintenance_mode FROM platform_settings ORDER BY id LIMIT 1');
    if (settingsRes.rows.length === 0) {
      await client.query('INSERT INTO platform_settings (maintenance_mode) VALUES (FALSE)');
    } else {
      platformState.setMaintenanceMode(settingsRes.rows[0].maintenance_mode);
    }
    console.log(`Platform Status: Maintenance Mode is ${platformState.isMaintenanceMode() ? 'ON' : 'OFF'}`);

    // Create project_structures table for caching AI-generated structures per role
    await client.query(`
      CREATE TABLE IF NOT EXISTS project_structures (
        id SERIAL PRIMARY KEY,
        role VARCHAR(255) NOT NULL UNIQUE,
        structure_data JSONB NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create project_structures_custom for user-specific custom descriptions
    await client.query(`
      CREATE TABLE IF NOT EXISTS project_structures_custom (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        role VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        structure_data JSONB NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create feedback table for storing in-app user feedback/bug reports
    await client.query(`
      CREATE TABLE IF NOT EXISTS feedback (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        name VARCHAR(255),
        email VARCHAR(255),
        message TEXT NOT NULL,
        page_path VARCHAR(500),
        type VARCHAR(50) DEFAULT 'feedback',
        status VARCHAR(50) DEFAULT 'open',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Add is_admin column to users if not exists
    await client.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'is_admin') THEN
          ALTER TABLE users ADD COLUMN is_admin BOOLEAN DEFAULT FALSE;
        END IF;
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'bonus_xp') THEN
          ALTER TABLE users ADD COLUMN bonus_xp INTEGER DEFAULT 0;
        END IF;
      END $$;
    `);

    // Create job_match_analyses table
    await client.query(`
      CREATE TABLE IF NOT EXISTS job_match_analyses (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE UNIQUE,
        file_name VARCHAR(255),
        analysis_data JSONB NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create user target roles table (Job Search Portal)
    await client.query(`
      CREATE TABLE IF NOT EXISTS user_target_roles (
        user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
        roles JSONB NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Set admin flag for primary admin email
    await client.query(`
      UPDATE users SET is_admin = TRUE WHERE email = 'supportfindstreak@tekadvo.com'
    `).catch(() => {});

    client.release();
    console.log('Schema updated for role caching');
  } catch (err) {
    console.error('Schema update error:', err.message);
  }
};
updateSchema();

// Simple health check - always returns 200 when server is running
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});

// Deep health check with DB - use this for monitoring, not deployment healthcheck
app.get('/api/health/db', async (req, res) => {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    client.release();
    res.json({ status: 'ok', time: result.rows[0].now });
  } catch (err) {
    console.error('DB health check failed:', err.message);
    res.status(500).json({ status: 'error', message: 'Database connection failed' });
  }
});

// Serve static assets — always serve in any environment when dist exists
const distPath = path.join(__dirname, '../client/dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));

  // SPA fallback — send index.html for ALL non-API routes so React Router works
  app.get('*', (req, res) => {
    if (req.path.startsWith('/api/')) {
      return res.status(404).json({ error: 'API route not found' });
    }
    res.sendFile(path.join(distPath, 'index.html'));
  });
  console.log('Serving React app from:', distPath);
} else {
  // Dev mode — no built frontend
  app.get('/', (req, res) => res.json({ status: 'API running', env: process.env.NODE_ENV }));
  console.log('No dist folder found — API-only mode');
}


// Initialize Cron Jobs
require('./cron/streakEmails');

app.listen(port, '0.0.0.0', () => {
  console.log(`Server running on port ${port}`);
  console.log(`NODE_ENV: ${process.env.NODE_ENV}`);
  console.log(`DATABASE_URL set: ${!!process.env.DATABASE_URL}`);
});
