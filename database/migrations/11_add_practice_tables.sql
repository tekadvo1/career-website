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
