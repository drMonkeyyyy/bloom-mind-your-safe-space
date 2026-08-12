-- Table for Calm Check (DASS-21) Mental Health Screening Results
CREATE TABLE IF NOT EXISTS public.calm_check_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  depression_score INT NOT NULL,
  anxiety_score INT NOT NULL,
  stress_score INT NOT NULL,
  depression_category TEXT NOT NULL,
  anxiety_category TEXT NOT NULL,
  stress_category TEXT NOT NULL,
  answers JSONB NOT NULL DEFAULT '{}'::jsonb,
  consent_given BOOLEAN NOT NULL DEFAULT true,
  safety_flag BOOLEAN NOT NULL DEFAULT false,
  recommendations JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS setup
ALTER TABLE public.calm_check_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert own calm check results"
  ON public.calm_check_results FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can select own calm check results"
  ON public.calm_check_results FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own calm check results"
  ON public.calm_check_results FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Admins can select all calm check results"
  ON public.calm_check_results FOR SELECT
  TO authenticated USING (public.has_role(auth.uid(), 'admin'));

GRANT SELECT, INSERT, DELETE ON public.calm_check_results TO authenticated;
GRANT ALL ON public.calm_check_results TO service_role;

-- Index for fast history retrieval by user_id and creation date
CREATE INDEX IF NOT EXISTS idx_calm_check_results_user_created 
  ON public.calm_check_results(user_id, created_at DESC);
