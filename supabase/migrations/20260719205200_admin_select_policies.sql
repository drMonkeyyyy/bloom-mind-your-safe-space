-- Allow admins to read all journals
CREATE POLICY "admins read all journals" ON public.journals
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Allow admins to read all mood checkins
CREATE POLICY "admins read all mood checkins" ON public.mood_checkins
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Allow admins to read all gratitudes
CREATE POLICY "admins read all gratitudes" ON public.gratitude_entries
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Allow admins to read all eating logs
CREATE POLICY "admins read all eating logs" ON public.emotional_eating_logs
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Allow admins to read all habit logs
CREATE POLICY "admins read all habit logs" ON public.habit_logs
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Allow admins to read all chats
CREATE POLICY "admins read all chats" ON public.chats
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Allow admins to read all messages
CREATE POLICY "admins read all messages" ON public.messages
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
