-- Migration: Add Roadmap context to chat_sessions
-- Up
ALTER TABLE chat_sessions ADD COLUMN IF NOT EXISTS topic_id VARCHAR(255);
ALTER TABLE chat_sessions ADD COLUMN IF NOT EXISTS topic_name VARCHAR(255);

-- Down
-- ALTER TABLE chat_sessions DROP COLUMN topic_id;
-- ALTER TABLE chat_sessions DROP COLUMN topic_name;
