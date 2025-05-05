-- Create monthly_budget table
CREATE TABLE IF NOT EXISTS public.monthly_budget (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    month VARCHAR(20) NOT NULL,
    year INTEGER NOT NULL,
    category VARCHAR(50) NOT NULL,
    description TEXT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Add constraints
    CONSTRAINT valid_month CHECK (month IN (
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    )),
    CONSTRAINT valid_category CHECK (category IN (
        'Income', 'Investimento', 'Fixed', 'Variable', 'Extra', 'Additional', 'Tax'
    )),
    CONSTRAINT valid_amount CHECK (amount >= 0)
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS monthly_budget_user_id_idx ON public.monthly_budget(user_id);
CREATE INDEX IF NOT EXISTS monthly_budget_month_year_idx ON public.monthly_budget(month, year);

-- Set up RLS (Row Level Security)
ALTER TABLE public.monthly_budget ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to see only their own entries
CREATE POLICY "Users can view their own monthly budget entries"
    ON public.monthly_budget
    FOR SELECT
    USING (auth.uid() = user_id);

-- Create policy to allow users to insert their own entries
CREATE POLICY "Users can insert their own monthly budget entries"
    ON public.monthly_budget
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Create policy to allow users to update their own entries
CREATE POLICY "Users can update their own monthly budget entries"
    ON public.monthly_budget
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Create policy to allow users to delete their own entries
CREATE POLICY "Users can delete their own monthly budget entries"
    ON public.monthly_budget
    FOR DELETE
    USING (auth.uid() = user_id);
