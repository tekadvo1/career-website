-- Migration to add project_id and task_id to task_guides
-- This ensures task guides can be scoped to specific user projects rather than being globally shared

-- 1. Add new columns
ALTER TABLE task_guides ADD COLUMN IF NOT EXISTS project_id INTEGER REFERENCES user_projects(id) ON DELETE CASCADE;
ALTER TABLE task_guides ADD COLUMN IF NOT EXISTS task_id VARCHAR(255);

-- 2. Drop the old composite unique constraint
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'task_guides_project_title_task_text_key'
  ) THEN
    ALTER TABLE task_guides DROP CONSTRAINT task_guides_project_title_task_text_key;
  END IF;
END $$;

-- 3. Add the new composite unique constraint
-- Note: project_title and task_text are still NOT NULL, so legacy global guides just have project_id=NULL and task_id=NULL
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'uq_project_task'
  ) THEN
    ALTER TABLE task_guides ADD CONSTRAINT uq_project_task UNIQUE (project_id, task_id);
  END IF;
END $$;
