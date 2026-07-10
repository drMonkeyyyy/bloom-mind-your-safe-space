-- Add last_active_at to profiles table to track user activity for inactivity policies
ALTER TABLE public.profiles ADD COLUMN last_active_at TIMESTAMPTZ DEFAULT NOW();
