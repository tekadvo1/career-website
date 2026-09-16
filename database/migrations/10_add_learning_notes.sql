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
