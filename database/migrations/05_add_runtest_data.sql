-- Migration: Add runtest_data JSONB column to user_projects
-- Stores startup instructions, feature checks, and test results
-- Follows existing pattern: setup_data, blueprint_data

ALTER TABLE user_projects ADD COLUMN IF NOT EXISTS runtest_data JSONB DEFAULT '{}';
