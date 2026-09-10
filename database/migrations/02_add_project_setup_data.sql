-- Add setup_data column to user_projects to persist setup checklist completion
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_projects' AND column_name = 'setup_data') THEN
        ALTER TABLE user_projects ADD COLUMN setup_data JSONB DEFAULT '{}';
    END IF;
END $$;
