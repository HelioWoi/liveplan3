-- Add is_recent column to transactions table
ALTER TABLE transactions ADD COLUMN is_recent BOOLEAN DEFAULT false;
