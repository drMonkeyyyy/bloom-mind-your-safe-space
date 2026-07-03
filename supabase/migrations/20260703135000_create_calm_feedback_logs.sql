-- Create calm_feedback_logs table
CREATE TABLE IF NOT EXISTS public.calm_feedback_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    exercise_key TEXT NOT NULL,
    is_helpful BOOLEAN NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.calm_feedback_logs ENABLE ROW LEVEL SECURITY;

-- Policies for users
CREATE POLICY "Users can insert their own calm feedback" 
ON public.calm_feedback_logs 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read their own calm feedback" 
ON public.calm_feedback_logs 
FOR SELECT 
USING (auth.uid() = user_id);

-- Policy for admins
CREATE POLICY "Admins can read all calm feedback" 
ON public.calm_feedback_logs 
FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM public.user_roles 
        WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin'
    )
);

CREATE POLICY "Admins can delete all calm feedback" 
ON public.calm_feedback_logs 
FOR DELETE 
USING (
    EXISTS (
        SELECT 1 FROM public.user_roles 
        WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin'
    )
);
