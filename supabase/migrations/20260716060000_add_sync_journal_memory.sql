-- Add sync_journal_memory to profiles table to allow premium users to sync their journaling data to AI Chat context
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS sync_journal_memory BOOLEAN DEFAULT FALSE;
