-- Migration: Add workspace_id to tracks (Task 2)
-- We add workspace_id to role_analyses and roadmap_progress to strictly link AI generation 
-- and learning progress to a specific authoritative Workspace identity, rather than just role matching.
-- Legacy records will keep workspace_id = NULL so we do not guess associations.

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'role_analyses' AND column_name = 'workspace_id') THEN
        ALTER TABLE role_analyses ADD COLUMN workspace_id INTEGER REFERENCES workspaces(id) ON DELETE CASCADE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'roadmap_progress' AND column_name = 'workspace_id') THEN
        ALTER TABLE roadmap_progress ADD COLUMN workspace_id INTEGER REFERENCES workspaces(id) ON DELETE CASCADE;
    END IF;
    
    -- Drop the old unique constraint on roadmap_progress (user_id, role, topic_name) 
    -- since multiple workspaces for the same user can now have the same role but distinct progress
    ALTER TABLE roadmap_progress DROP CONSTRAINT IF EXISTS roadmap_progress_user_id_role_topic_name_key;
    
    -- Add a unique constraint that incorporates workspace_id, treating NULL distinct
    ALTER TABLE roadmap_progress ADD CONSTRAINT unique_user_workspace_topic UNIQUE NULLS NOT DISTINCT (user_id, workspace_id, role, topic_name);

END $$;
