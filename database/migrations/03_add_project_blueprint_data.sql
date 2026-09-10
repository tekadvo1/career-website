-- Add blueprint_data column to user_projects to persist project architecture and file structure
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_projects' AND column_name = 'blueprint_data') THEN
        ALTER TABLE user_projects ADD COLUMN blueprint_data JSONB DEFAULT '{}';
    END IF;
END $$;
