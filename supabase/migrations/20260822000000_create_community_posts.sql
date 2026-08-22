-- Table for Community Posts (Threads/Wall Style with Anonymous & Public options)
CREATE TABLE IF NOT EXISTS public.community_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  author_name TEXT NOT NULL DEFAULT 'Anonim',
  author_avatar TEXT NOT NULL DEFAULT '🌸',
  is_anonymous BOOLEAN NOT NULL DEFAULT true,
  tag TEXT NOT NULL DEFAULT 'Curhat',
  hugs_count INT NOT NULL DEFAULT 0,
  comments_count INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Table for Hugs / Reactions ("Saling Peluk")
CREATE TABLE IF NOT EXISTS public.community_hugs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.community_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT community_hugs_post_user_unique UNIQUE (post_id, user_id)
);

-- Table for Comments / Discussions ("Diskusi")
CREATE TABLE IF NOT EXISTS public.community_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.community_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  author_name TEXT NOT NULL DEFAULT 'Anonim',
  author_avatar TEXT NOT NULL DEFAULT '🌸',
  is_anonymous BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_hugs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_comments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for community_posts
CREATE POLICY "Anyone can read community posts"
  ON public.community_posts FOR SELECT
  TO authenticated, anon USING (true);

CREATE POLICY "Authenticated users can insert community posts"
  ON public.community_posts FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users or admins can delete own community posts"
  ON public.community_posts FOR DELETE
  TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

-- RLS Policies for community_hugs
CREATE POLICY "Anyone can read community hugs"
  ON public.community_hugs FOR SELECT
  TO authenticated, anon USING (true);

CREATE POLICY "Authenticated users can insert community hugs"
  ON public.community_hugs FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own community hugs"
  ON public.community_hugs FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- RLS Policies for community_comments
CREATE POLICY "Anyone can read community comments"
  ON public.community_comments FOR SELECT
  TO authenticated, anon USING (true);

CREATE POLICY "Authenticated users can insert community comments"
  ON public.community_comments FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users or admins can delete own community comments"
  ON public.community_comments FOR DELETE
  TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

-- Grants
GRANT SELECT, INSERT, UPDATE, DELETE ON public.community_posts TO authenticated, anon;
GRANT SELECT, INSERT, DELETE ON public.community_hugs TO authenticated, anon;
GRANT SELECT, INSERT, DELETE ON public.community_comments TO authenticated, anon;

GRANT ALL ON public.community_posts TO service_role;
GRANT ALL ON public.community_hugs TO service_role;
GRANT ALL ON public.community_comments TO service_role;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_community_posts_created_at ON public.community_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_community_hugs_post_id ON public.community_hugs(post_id);
CREATE INDEX IF NOT EXISTS idx_community_comments_post_id ON public.community_comments(post_id, created_at ASC);
