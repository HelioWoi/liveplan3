/*
  # Initialize Database Schema
  
  1. Tables
    - user_profiles
    - transactions
    - goals
    - tax_entries

  2. Enable RLS and create policies
  3. Create necessary indexes
  4. Set up triggers
*/

-- Create user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  onboarding_completed boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  origin text NOT NULL,
  amount numeric(12,2) NOT NULL,
  category text NOT NULL,
  type text NOT NULL,
  date timestamp with time zone NOT NULL,
  description text DEFAULT '',
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- Create goals table
CREATE TABLE IF NOT EXISTS goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  target_amount numeric(12,2) NOT NULL,
  current_amount numeric(12,2) NOT NULL DEFAULT 0,
  target_date date NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create tax_entries table
CREATE TABLE IF NOT EXISTS tax_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id),
  date timestamp with time zone NOT NULL,
  amount numeric(12,2) NOT NULL,
  type text NOT NULL,
  notes text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- Add constraints safely
DO $$ 
BEGIN 
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'transactions_category_check'
  ) THEN
    ALTER TABLE transactions 
    ADD CONSTRAINT transactions_category_check 
    CHECK (category = ANY (ARRAY[
      'Income'::text, 'Investimento'::text, 'Fixed'::text, 
      'Variable'::text, 'Extra'::text, 'Additional'::text, 'Tax'::text
    ]));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'tax_entries_type_check'
  ) THEN
    ALTER TABLE tax_entries 
    ADD CONSTRAINT tax_entries_type_check 
    CHECK (type = ANY (ARRAY['Withheld'::text, 'BAS'::text, 'PAYG'::text, 'Other'::text]));
  END IF;
END $$;

-- Enable RLS on all tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE tax_entries ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can read own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Enable read access for users to their own transactions" ON transactions;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON transactions;
DROP POLICY IF EXISTS "Enable delete for users to their own transactions" ON transactions;
DROP POLICY IF EXISTS "Users can read own goals" ON goals;
DROP POLICY IF EXISTS "Users can create own goals" ON goals;
DROP POLICY IF EXISTS "Users can update own goals" ON goals;
DROP POLICY IF EXISTS "Users can delete own goals" ON goals;
DROP POLICY IF EXISTS "Enable read access for users to their own tax entries" ON tax_entries;
DROP POLICY IF EXISTS "Enable insert for authenticated users only on tax entries" ON tax_entries;
DROP POLICY IF EXISTS "Enable delete for users to their own tax entries" ON tax_entries;

-- Create policies for user_profiles
CREATE POLICY "Users can read own profile"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create policies for transactions
CREATE POLICY "Enable read access for users to their own transactions"
  ON transactions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Enable insert for authenticated users only"
  ON transactions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Enable delete for users to their own transactions"
  ON transactions FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create policies for goals
CREATE POLICY "Users can read own goals"
  ON goals FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own goals"
  ON goals FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own goals"
  ON goals FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own goals"
  ON goals FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create policies for tax_entries
CREATE POLICY "Enable read access for users to their own tax entries"
  ON tax_entries FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Enable insert for authenticated users only on tax entries"
  ON tax_entries FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Enable delete for users to their own tax entries"
  ON tax_entries FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes
DROP INDEX IF EXISTS user_profiles_user_id_idx;
DROP INDEX IF EXISTS transactions_user_id_idx;
DROP INDEX IF EXISTS transactions_date_idx;
DROP INDEX IF EXISTS goals_user_id_idx;
DROP INDEX IF EXISTS goals_target_date_idx;
DROP INDEX IF EXISTS tax_entries_user_id_idx;
DROP INDEX IF EXISTS tax_entries_date_idx;

CREATE INDEX user_profiles_user_id_idx ON user_profiles(user_id);
CREATE INDEX transactions_user_id_idx ON transactions(user_id);
CREATE INDEX transactions_date_idx ON transactions(date);
CREATE INDEX goals_user_id_idx ON goals(user_id);
CREATE INDEX goals_target_date_idx ON goals(target_date);
CREATE INDEX tax_entries_user_id_idx ON tax_entries(user_id);
CREATE INDEX tax_entries_date_idx ON tax_entries(date);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
DROP TRIGGER IF EXISTS update_transactions_updated_at ON transactions;
DROP TRIGGER IF EXISTS update_tax_entries_updated_at ON tax_entries;

-- Create triggers
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at
  BEFORE UPDATE ON transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tax_entries_updated_at
  BEFORE UPDATE ON tax_entries
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();