-- Irreversible migration for init (or use DROP tables manually)
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS resumes CASCADE;
-- Add other tables if they exist in schema
