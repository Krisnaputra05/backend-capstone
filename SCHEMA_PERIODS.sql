-- Create table for storing Admin-defined check-in periods
CREATE TABLE IF NOT EXISTS public.capstone_periods (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    batch_id TEXT NOT NULL,
    title TEXT NOT NULL, -- e.g. "Worksheet 1 (Bi-weekly)", "Mid-term Check-in"
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX idx_capstone_periods_batch ON public.capstone_periods(batch_id);

-- Add RLS Policies (Optional, but recommended)
ALTER TABLE public.capstone_periods ENABLE ROW LEVEL SECURITY;

-- Allow read for authenticated users (Students need to see them to submit)
CREATE POLICY "Enable read access for authenticated users" 
ON public.capstone_periods FOR SELECT 
TO authenticated 
USING (true);

-- Allow insert-update-delete only for Admins (Assuming you have a role check or logic)
-- For simplicity in this script, we'll open it, but in production, restrict to Admin role.
-- Example if you had checking logic:
-- CREATE POLICY "Enable write for admins" ON public.capstone_periods FOR ALL TO authenticated USING (auth.jwt() ->> 'role' = 'admin');
