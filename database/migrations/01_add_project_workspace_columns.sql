-- Add schedule_data and chat_data columns to user_projects to support
-- the new workspace layout without fabricating state.

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_projects' AND column_name = 'schedule_data') THEN
        ALTER TABLE user_projects ADD COLUMN schedule_data JSONB DEFAULT '{}';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_projects' AND column_name = 'chat_data') THEN
        ALTER TABLE user_projects ADD COLUMN chat_data JSONB DEFAULT '{}';
    END IF;
END $$;
