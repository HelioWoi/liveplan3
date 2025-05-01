/*
  # Create weekly budget entries table

  1. New Tables
    - `weekly_budget_entries`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `month` (text)
      - `week` (integer)
      - `year` (integer)
      - `category` (text)
      - `description` (text)
      - `amount` (numeric(12,2))
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on weekly_budget_entries table
    - Add policies for authenticated users to:
      - Read their own entries
      - Create new entries
      - Update their own entries
      - Delete their own entries
*/

CREATE TABLE IF NOT EXISTS weekly_budget_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  month text NOT NULL,
  week integer NOT NULL CHECK (week BETWEEN 1 AND 4),
  year integer NOT NULL,
  category text NOT NULL,
  description text NOT NULL,
  amount numeric(12,2) NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE weekly_budget_entries ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can read own entries"
  ON weekly_budget_entries
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own entries"
  ON weekly_budget_entries
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own entries"
  ON weekly_budget_entries
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own entries"
  ON weekly_budget_entries
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX weekly_budget_entries_user_id_idx ON weekly_budget_entries(user_id);
CREATE INDEX weekly_budget_entries_month_year_idx ON weekly_budget_entries(month, year);