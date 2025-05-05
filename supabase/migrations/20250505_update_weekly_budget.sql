-- Drop the monthly_budget table
drop table if exists public.monthly_budget;

-- Update the weekly_budget table structure
alter table public.weekly_budget 
    alter column week type text using 
    case 
        when week = 1 then 'Week 1'
        when week = 2 then 'Week 2'
        when week = 3 then 'Week 3'
        when week = 4 then 'Week 4'
    end;

-- Update the check constraint for the new type
alter table public.weekly_budget 
    drop constraint if exists weekly_budget_week_check,
    add constraint weekly_budget_week_check 
    check (week in ('Week 1', 'Week 2', 'Week 3', 'Week 4'));
