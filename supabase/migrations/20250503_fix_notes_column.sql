-- Drop and recreate notes column to ensure it exists
ALTER TABLE IF EXISTS transactions DROP COLUMN IF EXISTS notes;
ALTER TABLE transactions ADD COLUMN notes TEXT;
