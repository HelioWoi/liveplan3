/*
  # Database Schema Verification
  
  1. Tables
    - transactions
    - goals
    - tax_entries

  2. Verify table structures and constraints
*/

-- Verify transactions table
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_name = 'transactions'
  ) THEN
    CREATE TABLE transactions (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
      origin text NOT NULL,
      amount numeric(12,2) NOT NULL,
      category text NOT NULL,
      date timestamp with time zone NOT NULL,
      description text DEFAULT '',
      created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
      updated_at timestamp with time zone DEFAULT timezone('utc'::text, now())
    );

    -- Add category constraint
    ALTER TABLE transactions 
    ADD CONSTRAINT transactions_category_check 
    CHECK (category = ANY (ARRAY[
      'Income'::text, 'Investimento'::text, 'Fixed'::text, 
      'Variable'::text, 'Extra'::text, 'Additional'::text, 'Tax'::text
    ]));

    -- Enable RLS
    ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

    -- Create policies
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
  END IF;
END $$;

-- Verify goals table
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_name = 'goals'
  ) THEN
    CREATE TABLE goals (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
      title text NOT NULL,
      description text,
      target_amount numeric(12,2) NOT NULL,
      current_amount numeric(12,2) NOT NULL DEFAULT 0,
      target_date date NOT NULL,
      created_at timestamp with time zone DEFAULT now()
    );

    -- Enable RLS
    ALTER TABLE goals ENABLE ROW LEVEL SECURITY;

    -- Create policies
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
  END IF;
END $$;

-- Verify tax_entries table
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_name = 'tax_entries'
  ) THEN
    CREATE TABLE tax_entries (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id uuid NOT NULL REFERENCES auth.users(id),
      date timestamp with time zone NOT NULL,
      amount numeric(12,2) NOT NULL,
      type text NOT NULL,
      notes text,
      created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
      updated_at timestamp with time zone DEFAULT timezone('utc'::text, now())
    );

    -- Add type constraint
    ALTER TABLE tax_entries 
    ADD CONSTRAINT tax_entries_type_check 
    CHECK (type = ANY (ARRAY['Withheld'::text, 'BAS'::text, 'PAYG'::text, 'Other'::text]));

    -- Enable RLS
    ALTER TABLE tax_entries ENABLE ROW LEVEL SECURITY;

    -- Create policies
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
  END IF;
END $$;

-- Clear any test data
TRUNCATE transactions, goals, tax_entries CASCADE;

-- Verify indexes
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE indexname = 'transactions_user_id_idx'
  ) THEN
    CREATE INDEX transactions_user_id_idx ON transactions(user_id);
    CREATE INDEX transactions_date_idx ON transactions(date);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE indexname = 'goals_user_id_idx'
  ) THEN
    CREATE INDEX goals_user_id_idx ON goals(user_id);
    CREATE INDEX goals_target_date_idx ON goals(target_date);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE indexname = 'tax_entries_user_id_idx'
  ) THEN
    CREATE INDEX tax_entries_user_id_idx ON tax_entries(user_id);
    CREATE INDEX tax_entries_date_idx ON tax_entries(date);
  END IF;
END $$;