-- =============================================
-- SQL Update Script for New Features
-- Run this script in your Supabase SQL Editor
-- =============================================

-- 1. Table: Capstone Worksheets (Check-in)
-- Used for storing weekly individual progress reports.
CREATE TABLE IF NOT EXISTS public.capstone_worksheets (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_ref uuid NOT NULL,           -- Mahasiswa yang melapor
  group_ref uuid NOT NULL,          -- ID Tim mahasiswa
  batch_id text,
  activity_description text NOT NULL,
  proof_url text,
  period_start date,
  period_end date,
  status text DEFAULT 'submitted',  -- 'submitted', 'approved', 'rejected', 'late'
  feedback text,                    -- Feedback dari admin/mentor
  submitted_at timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  
  CONSTRAINT capstone_worksheets_pkey PRIMARY KEY (id),
  CONSTRAINT fk_worksheet_user FOREIGN KEY (user_ref) REFERENCES public.users(id),
  CONSTRAINT fk_worksheet_group FOREIGN KEY (group_ref) REFERENCES public.capstone_groups(id)
);

-- 2. Table: 360 Degree Feedback
-- Used for storing peer review assessments between team members.
CREATE TABLE IF NOT EXISTS public.capstone_360_feedback (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  reviewer_user_ref uuid NOT NULL,  -- Yang menilai
  reviewee_user_ref uuid NOT NULL,  -- Yang dinilai
  group_ref uuid NOT NULL,          -- Tim mereka
  batch_id text,
  is_member_active boolean DEFAULT true,
  contribution_level text,          -- 'signifikan', 'sakit_darurat', 'tidak_signifikan', 'tidak_kontribusi'
  reason text,
  created_at timestamp with time zone DEFAULT now(),
  
  CONSTRAINT capstone_360_feedback_pkey PRIMARY KEY (id),
  CONSTRAINT fk_feedback_reviewer FOREIGN KEY (reviewer_user_ref) REFERENCES public.users(id),
  CONSTRAINT fk_feedback_reviewee FOREIGN KEY (reviewee_user_ref) REFERENCES public.users(id),
  CONSTRAINT fk_feedback_group FOREIGN KEY (group_ref) REFERENCES public.capstone_groups(id),
  
  -- Prevent duplicate reviews for the same pair in the same period (optional constraint, handled in logic too)
  CONSTRAINT unique_review_pair UNIQUE (reviewer_user_ref, reviewee_user_ref)
);

-- Permissions (If using Supabase RLS, enable these if needed, otherwise default is protected)
ALTER TABLE public.capstone_worksheets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.capstone_360_feedback ENABLE ROW LEVEL SECURITY;

-- Optional: Add policies if Frontend connects directly (backend bypasses RLS with service key usually)
-- create policy "Enable read access for all users" on "public"."capstone_worksheets" as PERMISSIVE for SELECT to public using (true);
