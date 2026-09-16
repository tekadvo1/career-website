CREATE TABLE IF NOT EXISTS tech_stack_results (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_analysis_id INTEGER REFERENCES role_analyses(id) ON DELETE CASCADE,
    role_title VARCHAR(255) NOT NULL,
    result_data JSONB NOT NULL,
    input_context JSONB,
    schema_version INTEGER DEFAULT 1,
    revision INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS workflow_results (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_analysis_id INTEGER REFERENCES role_analyses(id) ON DELETE CASCADE,
    role_title VARCHAR(255) NOT NULL,
    workflow_data JSONB NOT NULL,
    is_custom BOOLEAN DEFAULT false,
    schema_version INTEGER DEFAULT 1,
    revision INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
