-- Add avatar_url to profiles table
ALTER TABLE public.profiles ADD COLUMN avatar_url TEXT;

-- Create storage bucket for profiles
INSERT INTO storage.buckets (id, name, public)
VALUES ('profile-avatars', 'profile-avatars', true)
ON CONFLICT (id) DO NOTHING;

-- RLS policies for storage bucket profile-avatars
CREATE POLICY "Allow authenticated uploads to profile-avatars"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'profile-avatars' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Allow public read to profile-avatars"
ON storage.objects FOR SELECT TO authenticated, anon
USING (bucket_id = 'profile-avatars');

CREATE POLICY "Allow authenticated deletes of own profile avatars"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'profile-avatars'
  AND (storage.foldername(name))[1] = auth.uid()::text
);
