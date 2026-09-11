-- Add deploy_data column to user_projects to support
-- the new Deploy & Showcase workflow.

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_projects' AND column_name = 'deploy_data') THEN
        ALTER TABLE user_projects ADD COLUMN deploy_data JSONB DEFAULT '{}';
    END IF;
END $$;
