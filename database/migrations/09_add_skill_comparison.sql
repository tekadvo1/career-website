CREATE TABLE IF NOT EXISTS skill_comparisons (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    role_analysis_id INTEGER REFERENCES role_analyses(id) ON DELETE SET NULL,
    job_title VARCHAR(255),
    company_name VARCHAR(255),
    job_description TEXT NOT NULL,
    source_url TEXT,
    requirements JSONB,
    skill_snapshot JSONB,
    comparison_results JSONB,
    learning_connections JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Index for fast user queries
CREATE INDEX IF NOT EXISTS idx_skill_comparisons_user_id ON skill_comparisons(user_id);
