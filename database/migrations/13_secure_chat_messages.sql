-- Migration: Secure Chat Messages
-- Creates the chat_messages table and migrates existing JSONB messages

CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id VARCHAR(255) REFERENCES chat_sessions(id) ON DELETE CASCADE,
  role VARCHAR(50) NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  status VARCHAR(50) DEFAULT 'completed',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add context_type if it doesn't exist
ALTER TABLE chat_sessions ADD COLUMN IF NOT EXISTS context_type VARCHAR(50);

-- Update existing rows based on topic_id or project_id presence
UPDATE chat_sessions SET context_type = 'roadmap' WHERE topic_id IS NOT NULL;
UPDATE chat_sessions SET context_type = 'project' WHERE project_id IS NOT NULL;
UPDATE chat_sessions SET context_type = 'general' WHERE topic_id IS NULL AND project_id IS NULL AND context_type IS NULL;

-- Rename legacy messages column
ALTER TABLE chat_sessions RENAME COLUMN messages TO legacy_messages;

-- Ensure legacy_messages is nullable, as new chats won't have it
ALTER TABLE chat_sessions ALTER COLUMN legacy_messages DROP NOT NULL;

DO $$
DECLARE
  sess RECORD;
  msg JSONB;
  idx INTEGER;
  msg_role VARCHAR;
BEGIN
  FOR sess IN SELECT id, legacy_messages FROM chat_sessions WHERE legacy_messages IS NOT NULL AND jsonb_typeof(legacy_messages) = 'array'
  LOOP
    idx := 0;
    FOR msg IN SELECT * FROM jsonb_array_elements(sess.legacy_messages)
    LOOP
      msg_role := msg->>'type';
      -- Default to user if unknown
      IF msg_role NOT IN ('user', 'assistant', 'system') THEN
          msg_role := 'user';
      END IF;

      INSERT INTO chat_messages (session_id, role, content, created_at)
      VALUES (
        sess.id,
        msg_role,
        msg->>'content',
        CURRENT_TIMESTAMP + (idx * interval '1 millisecond')
      );
      idx := idx + 1;
    END LOOP;
  END LOOP;
END $$;
