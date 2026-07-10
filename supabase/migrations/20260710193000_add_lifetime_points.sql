-- Add lifetime_points column to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS lifetime_points INTEGER DEFAULT 0;

-- Backfill existing points for users
UPDATE public.profiles p
SET lifetime_points = (
  COALESCE((
    SELECT COUNT(DISTINCT date) * 8
    FROM public.mood_checkins
    WHERE user_id = p.id
  ), 0) +
  COALESCE((
    SELECT COUNT(DISTINCT date) * 12
    FROM public.journals
    WHERE user_id = p.id
  ), 0) +
  COALESCE((
    SELECT COUNT(DISTINCT date) * 12
    FROM public.gratitude_entries
    WHERE user_id = p.id
  ), 0)
);

-- Trigger for mood check-ins points
CREATE OR REPLACE FUNCTION public.handle_mood_checkin_points()
RETURNS TRIGGER AS $$
DECLARE
  day_exists BOOLEAN;
BEGIN
  -- Check if another check-in already exists on the same date for this user
  SELECT EXISTS(
    SELECT 1 
    FROM public.mood_checkins 
    WHERE user_id = NEW.user_id AND date = NEW.date AND id <> NEW.id
  ) INTO day_exists;
  
  -- If this is the first check-in of the day, add 8 points
  IF NOT day_exists THEN
    UPDATE public.profiles 
    SET lifetime_points = COALESCE(lifetime_points, 0) + 8 
    WHERE id = NEW.user_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_mood_checkin_points ON public.mood_checkins;
CREATE TRIGGER trg_mood_checkin_points
AFTER INSERT ON public.mood_checkins
FOR EACH ROW EXECUTE FUNCTION public.handle_mood_checkin_points();


-- Trigger for journals points
CREATE OR REPLACE FUNCTION public.handle_journal_points()
RETURNS TRIGGER AS $$
DECLARE
  day_exists BOOLEAN;
BEGIN
  SELECT EXISTS(
    SELECT 1 
    FROM public.journals 
    WHERE user_id = NEW.user_id AND date = NEW.date AND id <> NEW.id
  ) INTO day_exists;
  
  IF NOT day_exists THEN
    UPDATE public.profiles 
    SET lifetime_points = COALESCE(lifetime_points, 0) + 12 
    WHERE id = NEW.user_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_journal_points ON public.journals;
CREATE TRIGGER trg_journal_points
AFTER INSERT ON public.journals
FOR EACH ROW EXECUTE FUNCTION public.handle_journal_points();


-- Trigger for gratitude entries points
CREATE OR REPLACE FUNCTION public.handle_gratitude_points()
RETURNS TRIGGER AS $$
DECLARE
  day_exists BOOLEAN;
BEGIN
  SELECT EXISTS(
    SELECT 1 
    FROM public.gratitude_entries 
    WHERE user_id = NEW.user_id AND date = NEW.date AND id <> NEW.id
  ) INTO day_exists;
  
  IF NOT day_exists THEN
    UPDATE public.profiles 
    SET lifetime_points = COALESCE(lifetime_points, 0) + 12 
    WHERE id = NEW.user_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_gratitude_points ON public.gratitude_entries;
CREATE TRIGGER trg_gratitude_points
AFTER INSERT ON public.gratitude_entries
FOR EACH ROW EXECUTE FUNCTION public.handle_gratitude_points();
