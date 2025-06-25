-- Add is_local column to transactions table
ALTER TABLE transactions ADD COLUMN is_local BOOLEAN DEFAULT false;
