-- Create weekly budget table
create table if not exists weekly_budget (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade,
  month text not null,
  week integer not null,
  year integer not null,
  category text not null,
  description text not null,
  amount decimal not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  
  constraint weekly_budget_week_check check (week >= 1 and week <= 4)
);

-- Create RLS policies
alter table weekly_budget enable row level security;

create policy "Users can view their own weekly budget entries"
  on weekly_budget for select
  using (auth.uid() = user_id);

create policy "Users can insert their own weekly budget entries"
  on weekly_budget for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own weekly budget entries"
  on weekly_budget for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete their own weekly budget entries"
  on weekly_budget for delete
  using (auth.uid() = user_id);

-- Create indexes
create index weekly_budget_user_id_idx on weekly_budget(user_id);
create index weekly_budget_month_year_idx on weekly_budget(month, year);
