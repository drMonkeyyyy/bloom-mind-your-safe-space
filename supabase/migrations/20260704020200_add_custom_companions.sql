-- Create custom_companions table
CREATE TABLE public.custom_companions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  tone TEXT NOT NULL,
  description TEXT,
  system_prompt TEXT NOT NULL,
  avatar_url TEXT,
  emoji TEXT DEFAULT '👤',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.custom_companions ENABLE ROW LEVEL SECURITY;

-- Policies for custom_companions
CREATE POLICY "Users can create their own custom companions"
  ON public.custom_companions FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own custom companions"
  ON public.custom_companions FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own custom companions"
  ON public.custom_companions FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own custom companions"
  ON public.custom_companions FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- Update chats table
ALTER TABLE public.chats ALTER COLUMN companion_key DROP NOT NULL;
ALTER TABLE public.chats ADD COLUMN custom_companion_id UUID REFERENCES public.custom_companions(id) ON DELETE SET NULL;

-- Update journals table
ALTER TABLE public.journals ADD COLUMN custom_companion_id UUID REFERENCES public.custom_companions(id) ON DELETE SET NULL;

-- Enable trigger for custom_companions updated_at
CREATE TRIGGER trg_custom_companions_updated BEFORE UPDATE ON public.custom_companions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for avatars
INSERT INTO storage.buckets (id, name, public)
VALUES ('companion-avatars', 'companion-avatars', true)
ON CONFLICT (id) DO NOTHING;

-- RLS policies for storage bucket
CREATE POLICY "Allow authenticated uploads to companion-avatars"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'companion-avatars' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Allow public read to companion-avatars"
ON storage.objects FOR SELECT TO authenticated, anon
USING (bucket_id = 'companion-avatars');

CREATE POLICY "Allow authenticated deletes of own avatars"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'companion-avatars'
  AND (storage.foldername(name))[1] = auth.uid()::text
);
