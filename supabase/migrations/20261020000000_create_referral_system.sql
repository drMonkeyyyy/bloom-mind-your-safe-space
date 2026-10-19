-- ==============================================================================
-- REFERRAL & AFFILIATE SYSTEM MIGRATION
-- ==============================================================================

-- 1. Helper function to generate unique uppercase referral codes (e.g. BM-7K9P2W)
CREATE OR REPLACE FUNCTION public.generate_unique_referral_code()
RETURNS TEXT LANGUAGE plpgsql AS $$
DECLARE
  new_code TEXT;
  characters TEXT := '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  char_len INT := length(characters);
  done BOOLEAN := false;
  i INT;
  random_part TEXT;
BEGIN
  WHILE NOT done LOOP
    random_part := '';
    FOR i IN 1..6 LOOP
      random_part := random_part || substr(characters, floor(random() * char_len + 1)::int, 1);
    END LOOP;
    new_code := 'BM-' || random_part;

    IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE referral_code = new_code) THEN
      done := true;
    END IF;
  END LOOP;
  RETURN new_code;
END;
$$;

-- 2. Add referral_code to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS referral_code TEXT UNIQUE;

-- Backfill existing profiles without referral code
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN SELECT id FROM public.profiles WHERE referral_code IS NULL LOOP
    UPDATE public.profiles
    SET referral_code = public.generate_unique_referral_code()
    WHERE id = r.id;
  END LOOP;
END;
$$;

-- 3. Update handle_new_user() trigger function to auto-assign referral code
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, referral_code)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'full_name', split_part(NEW.email,'@',1)),
    NEW.email,
    public.generate_unique_referral_code()
  )
  ON CONFLICT (id) DO UPDATE
  SET referral_code = COALESCE(public.profiles.referral_code, public.generate_unique_referral_code());

  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user') ON CONFLICT DO NOTHING;
  RETURN NEW;
END; $$;

-- 4. Add referral commission & discount settings to app_settings
ALTER TABLE public.app_settings ADD COLUMN IF NOT EXISTS referral_commission_percent INT NOT NULL DEFAULT 15;
ALTER TABLE public.app_settings ADD COLUMN IF NOT EXISTS referral_discount_percent INT NOT NULL DEFAULT 5;

-- 5. Add referral tracking fields to orders
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS referrer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS referral_code TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS commission_amount INT NOT NULL DEFAULT 0;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS commission_status TEXT NOT NULL DEFAULT 'pending';

CREATE INDEX IF NOT EXISTS idx_orders_referrer ON public.orders(referrer_id);
CREATE INDEX IF NOT EXISTS idx_orders_referral_code ON public.orders(referral_code);

-- 6. Create referral_payouts table for withdrawal requests
CREATE TABLE IF NOT EXISTS public.referral_payouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  amount INT NOT NULL CHECK (amount >= 50000),
  bank_name TEXT NOT NULL,
  account_number TEXT NOT NULL,
  account_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'menunggu_transfer' CHECK (status IN ('menunggu_transfer', 'selesai', 'ditolak')),
  admin_note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  processed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_referral_payouts_user ON public.referral_payouts(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_referral_payouts_status ON public.referral_payouts(status);

GRANT SELECT, INSERT ON public.referral_payouts TO authenticated;
GRANT ALL ON public.referral_payouts TO service_role;

ALTER TABLE public.referral_payouts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users read own payouts" ON public.referral_payouts
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "users insert own payouts" ON public.referral_payouts
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "admins read all payouts" ON public.referral_payouts
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "admins update all payouts" ON public.referral_payouts
  FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
