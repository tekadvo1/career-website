-- Users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add verification columns safely
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'is_verified') THEN
        ALTER TABLE users ADD COLUMN is_verified BOOLEAN DEFAULT FALSE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'verification_token') THEN
        ALTER TABLE users ADD COLUMN verification_token VARCHAR(255);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'google_id') THEN
        ALTER TABLE users ADD COLUMN google_id VARCHAR(255) UNIQUE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'reset_password_token') THEN
        ALTER TABLE users ADD COLUMN reset_password_token VARCHAR(255);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'reset_password_expires') THEN
        ALTER TABLE users ADD COLUMN reset_password_expires TIMESTAMP WITH TIME ZONE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'onboarding_completed') THEN
        ALTER TABLE users ADD COLUMN onboarding_completed BOOLEAN DEFAULT FALSE;
    END IF;
END $$;

-- Workspaces table
CREATE TABLE IF NOT EXISTS workspaces (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  role VARCHAR(100) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Projects table (for tracking user projects)
CREATE TABLE IF NOT EXISTS projects (
  id SERIAL PRIMARY KEY,
  workspace_id INTEGER REFERENCES workspaces(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(50) DEFAULT 'planned', -- planned, in-progress, completed
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Role Analyses table (for storing AI-generated career paths)
CREATE TABLE IF NOT EXISTS role_analyses (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  role_title VARCHAR(255) NOT NULL,
  analysis_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS user_courses (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  course_data JSONB NOT NULL,
  progress INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Track user progress on roadmap topics
CREATE TABLE IF NOT EXISTS roadmap_progress (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR(255) NOT NULL, -- The role this progress is for (e.g., "Full Stack Developer")
  topic_name VARCHAR(255) NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, role, topic_name) -- Prevent duplicate entries for the same topic
);

-- Track quiz scores (optional but good for future)
CREATE TABLE IF NOT EXISTS quiz_results (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(255) NOT NULL,
    phase_index INTEGER NOT NULL,
    score INTEGER NOT NULL,
    total_questions INTEGER NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- NEW: User Projects Table for detailed execution tracking
CREATE TABLE IF NOT EXISTS user_projects (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  role VARCHAR(100), -- The role context (e.g. "Software Engineer")
  status VARCHAR(50) DEFAULT 'active', -- active, completed, paused
  project_data JSONB NOT NULL, -- Stores the full project details and curriculum
  progress_data JSONB DEFAULT '{}', -- Stores { completedTasks: [], xp: 0, currentModule: 0, currentTask: 0 }
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- CACHING TABLES FOR SPEED
CREATE TABLE IF NOT EXISTS cached_recommendations (
  id SERIAL PRIMARY KEY,
  role VARCHAR(255) NOT NULL,
  type VARCHAR(50) DEFAULT 'standard', -- 'standard' or 'trending'
  projects_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(role, type)
);

CREATE TABLE IF NOT EXISTS cached_curriculums (
  id SERIAL PRIMARY KEY,
  project_title VARCHAR(255) NOT NULL,
  role VARCHAR(255),
  curriculum_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(project_title, role)
);


-- Resources table for storing curated and AI-generated resources
CREATE TABLE IF NOT EXISTS resources (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  resource_type VARCHAR(50) NOT NULL, -- using 'resource_type' to avoid SQL keyword 'type'
  category VARCHAR(100),
  url TEXT NOT NULL,
  platform VARCHAR(100),
  duration VARCHAR(100),
  level VARCHAR(50), -- Beginner, Intermediate, Advanced
  free BOOLEAN DEFAULT TRUE,
  rating DECIMAL(3, 1),
  topics TEXT[], -- Array of strings
  language VARCHAR(50) DEFAULT 'English',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(url) -- Prevent duplicate resources
);

-- User Achievements Table
-- Tracks which achievements each user has earned
CREATE TABLE IF NOT EXISTS user_achievements (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  achievement_id VARCHAR(100) NOT NULL, -- e.g. 'first_steps', 'week_warrior'
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, achievement_id) -- Each achievement can only be earned once per user
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON user_achievements(user_id);
