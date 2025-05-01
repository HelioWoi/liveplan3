/*
  # Clear Database Data

  This migration safely clears all data while preserving table structures.

  1. Actions
    - Temporarily disable triggers
    - Truncate all tables with CASCADE
    - Re-enable triggers
    - Verify tables are empty
*/

-- Disable triggers temporarily to avoid any potential issues
SET session_replication_role = 'replica';

-- Clear transactions table
TRUNCATE TABLE transactions CASCADE;

-- Clear goals table
TRUNCATE TABLE goals CASCADE;

-- Clear tax_entries table
TRUNCATE TABLE tax_entries CASCADE;

-- Re-enable triggers
SET session_replication_role = 'origin';

-- Verify the tables are empty but still exist
WITH table_list AS (
  SELECT 'transactions' as table_name
  UNION ALL
  SELECT 'goals'
  UNION ALL
  SELECT 'tax_entries'
)
SELECT 
    t.table_name,
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count,
    CASE 
        WHEN t.table_name = 'transactions' THEN (SELECT COUNT(*) FROM transactions)
        WHEN t.table_name = 'goals' THEN (SELECT COUNT(*) FROM goals)
        WHEN t.table_name = 'tax_entries' THEN (SELECT COUNT(*) FROM tax_entries)
    END as row_count
FROM table_list t
WHERE EXISTS (
    SELECT 1 
    FROM information_schema.tables 
    WHERE table_name = t.table_name
);