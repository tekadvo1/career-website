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

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'is_public') THEN
        ALTER TABLE users ADD COLUMN is_public BOOLEAN DEFAULT FALSE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'bio') THEN
        ALTER TABLE users ADD COLUMN bio TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'phone') THEN
        ALTER TABLE users ADD COLUMN phone VARCHAR(30);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'location') THEN
        ALTER TABLE users ADD COLUMN location VARCHAR(100) DEFAULT 'Global';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'country_code') THEN
        ALTER TABLE users ADD COLUMN country_code VARCHAR(10) DEFAULT '+1';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'avatar') THEN
        ALTER TABLE users ADD COLUMN avatar TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'custom_skills') THEN
        ALTER TABLE users ADD COLUMN custom_skills JSONB DEFAULT '[]';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'ai_credits') THEN
        ALTER TABLE users ADD COLUMN ai_credits INTEGER DEFAULT 5;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'preferences') THEN
        ALTER TABLE users ADD COLUMN preferences JSONB DEFAULT '{}';
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

-- Portfolios table (for managing user portfolios and drafts)
CREATE TABLE IF NOT EXISTS portfolios (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  is_private BOOLEAN DEFAULT true,
  is_published BOOLEAN DEFAULT false,
  about TEXT,
  experiences JSONB DEFAULT '[]',
  skills JSONB DEFAULT '[]',
  linkedin VARCHAR(255),
  website VARCHAR(255),
  theme VARCHAR(50) DEFAULT 'minimalist',
  draft_revision INTEGER DEFAULT 1,
  published_data JSONB,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
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
  schedule_data JSONB DEFAULT '{}',
  chat_data JSONB DEFAULT '{}',
  setup_data JSONB DEFAULT '{}',
  blueprint_data JSONB DEFAULT '{}',
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

-- User Saved Resources Table
CREATE TABLE IF NOT EXISTS user_saved_resources (
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  resource_id INTEGER REFERENCES resources(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY(user_id, resource_id)
);
CREATE TABLE IF NOT EXISTS learning_notes (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) DEFAULT 'Untitled Note',
    body TEXT DEFAULT '',
    tags JSONB,
    related_type VARCHAR(50),
    related_id VARCHAR(255),
    related_title VARCHAR(255),
    revision INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Index for fast user queries
CREATE INDEX IF NOT EXISTS idx_learning_notes_user_id ON learning_notes(user_id);
-- Composite index for finding notes linked to specific entities (like a specific lesson or project)
CREATE INDEX IF NOT EXISTS idx_learning_notes_related ON learning_notes(user_id, related_type, related_id);
CREATE TABLE IF NOT EXISTS practice_sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(255) NOT NULL,
    topic VARCHAR(255) NOT NULL,
    status VARCHAR(50) DEFAULT 'active',
    score INTEGER DEFAULT 0,
    total_questions INTEGER DEFAULT 0,
    revision INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS practice_questions (
    id SERIAL PRIMARY KEY,
    session_id INTEGER REFERENCES practice_sessions(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    options JSONB NOT NULL,
    answer_index INTEGER NOT NULL,
    explanation TEXT,
    order_index INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS practice_answers (
    id SERIAL PRIMARY KEY,
    session_id INTEGER REFERENCES practice_sessions(id) ON DELETE CASCADE,
    question_id INTEGER REFERENCES practice_questions(id) ON DELETE CASCADE,
    selected_option INTEGER NOT NULL,
    is_correct BOOLEAN NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(session_id, question_id)
);

CREATE INDEX IF NOT EXISTS idx_practice_sessions_user_id ON practice_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_practice_answers_session_id ON practice_answers(session_id);

-- Migration: Add workspace_id to tracks (Task 2)
-- We add workspace_id to role_analyses and roadmap_progress to strictly link AI generation 
-- and learning progress to a specific authoritative Workspace identity, rather than just role matching.
-- Legacy records will keep workspace_id = NULL so we do not guess associations.

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'role_analyses' AND column_name = 'workspace_id') THEN
        ALTER TABLE role_analyses ADD COLUMN workspace_id INTEGER REFERENCES workspaces(id) ON DELETE CASCADE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'roadmap_progress' AND column_name = 'workspace_id') THEN
        ALTER TABLE roadmap_progress ADD COLUMN workspace_id INTEGER REFERENCES workspaces(id) ON DELETE CASCADE;
    END IF;
    
    -- Drop the old unique constraint on roadmap_progress (user_id, role, topic_name) 
    -- since multiple workspaces for the same user can now have the same role but distinct progress
    ALTER TABLE roadmap_progress DROP CONSTRAINT IF EXISTS roadmap_progress_user_id_role_topic_name_key;
    
    -- Add a unique constraint that incorporates workspace_id, treating NULL distinct
    ALTER TABLE roadmap_progress ADD CONSTRAINT unique_user_workspace_topic UNIQUE NULLS NOT DISTINCT (user_id, workspace_id, role, topic_name);

END $$;
