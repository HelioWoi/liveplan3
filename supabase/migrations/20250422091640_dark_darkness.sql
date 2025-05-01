-- Disable triggers temporarily to avoid any potential issues
SET session_replication_role = 'replica';

-- Clear transactions table
TRUNCATE TABLE transactions CASCADE;

-- Clear goals table
TRUNCATE TABLE goals CASCADE;

-- Re-enable triggers
SET session_replication_role = 'origin';

-- Verify the tables are empty but still exist
SELECT 
    table_name,
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count,
    CASE 
        WHEN t.table_name = 'transactions' THEN (SELECT COUNT(*) FROM transactions)
        WHEN t.table_name = 'goals' THEN (SELECT COUNT(*) FROM goals)
    END as row_count
FROM (
    SELECT 'transactions' as table_name
    UNION ALL
    SELECT 'goals'
) t
WHERE EXISTS (
    SELECT 1 
    FROM information_schema.tables 
    WHERE table_name = t.table_name
);