
-- ============ ENUMS ============
CREATE TYPE public.app_role AS ENUM ('user', 'admin');
CREATE TYPE public.plan_type AS ENUM ('free', 'premium');
CREATE TYPE public.companion_key AS ENUM ('ibu','ayah','kakak_perempuan','kakak_laki','sahabat','partner','coach');
CREATE TYPE public.comm_style AS ENUM ('lembut','rasional','tegas','santai','supportive');
CREATE TYPE public.mood_label AS ENUM ('bahagia','tenang','sedih','cemas','marah','kesepian','burnout','stres','lelah');
CREATE TYPE public.payment_status AS ENUM ('menunggu_pembayaran','menunggu_verifikasi','disetujui','ditolak');
CREATE TYPE public.message_role AS ENUM ('user','assistant','system');
CREATE TYPE public.hunger_type AS ENUM ('lapar_fisik','lapar_emosional','craving','stress_eating','mindless_eating');

-- ============ UPDATED_AT TRIGGER ============
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

-- ============ PROFILES ============
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  email TEXT,
  phone TEXT,
  age INT,
  plan public.plan_type NOT NULL DEFAULT 'free',
  premium_start_date TIMESTAMPTZ,
  premium_end_date TIMESTAMPTZ,
  selected_companion public.companion_key DEFAULT 'sahabat',
  communication_style public.comm_style DEFAULT 'supportive',
  goals TEXT[] DEFAULT '{}',
  onboarding_completed BOOLEAN NOT NULL DEFAULT false,
  suspended BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER trg_profiles_updated BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ USER ROLES ============
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE POLICY "users read own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "admins read all roles" ON public.user_roles FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "users read own profile" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "users update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "users insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "admins read all profiles" ON public.profiles FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admins update all profiles" ON public.profiles FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Auto-create profile + default role on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'full_name', split_part(NEW.email,'@',1)), NEW.email)
  ON CONFLICT (id) DO NOTHING;
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user') ON CONFLICT DO NOTHING;
  RETURN NEW;
END; $$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============ COMPANIONS (catalog) ============
CREATE TABLE public.companions (
  key public.companion_key PRIMARY KEY,
  name TEXT NOT NULL,
  tone TEXT NOT NULL,
  description TEXT NOT NULL,
  system_prompt TEXT NOT NULL,
  emoji TEXT,
  is_premium_only BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.companions TO authenticated, anon;
GRANT ALL ON public.companions TO service_role;
ALTER TABLE public.companions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anyone read companions" ON public.companions FOR SELECT TO authenticated, anon USING (true);

-- ============ CHATS & MESSAGES ============
CREATE TABLE public.chats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  companion_key public.companion_key NOT NULL DEFAULT 'sahabat',
  title TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.chats TO authenticated;
GRANT ALL ON public.chats TO service_role;
ALTER TABLE public.chats ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own chats" ON public.chats FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER trg_chats_updated BEFORE UPDATE ON public.chats FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_id UUID NOT NULL REFERENCES public.chats(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.message_role NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_messages_chat ON public.messages(chat_id, created_at);
GRANT SELECT, INSERT, DELETE ON public.messages TO authenticated;
GRANT ALL ON public.messages TO service_role;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own messages" ON public.messages FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Daily chat usage (free quota)
CREATE TABLE public.daily_chat_usage (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  ai_reply_count INT NOT NULL DEFAULT 0,
  PRIMARY KEY (user_id, date)
);
GRANT SELECT ON public.daily_chat_usage TO authenticated;
GRANT ALL ON public.daily_chat_usage TO service_role;
ALTER TABLE public.daily_chat_usage ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own usage" ON public.daily_chat_usage FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- ============ MOOD CHECKINS ============
CREATE TABLE public.mood_checkins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  mood public.mood_label NOT NULL,
  mood_score INT NOT NULL CHECK (mood_score BETWEEN 1 AND 10),
  stress_score INT NOT NULL CHECK (stress_score BETWEEN 1 AND 10),
  energy_score INT NOT NULL CHECK (energy_score BETWEEN 1 AND 10),
  triggers TEXT[] DEFAULT '{}',
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_mood_user_date ON public.mood_checkins(user_id, date DESC);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.mood_checkins TO authenticated;
GRANT ALL ON public.mood_checkins TO service_role;
ALTER TABLE public.mood_checkins ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own mood" ON public.mood_checkins FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ============ JOURNALS ============
CREATE TABLE public.journals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  source TEXT NOT NULL DEFAULT 'manual',
  summary TEXT,
  main_emotion TEXT,
  main_trigger TEXT,
  lesson TEXT,
  gratitude TEXT,
  tomorrow_focus TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_journals_user_date ON public.journals(user_id, date DESC);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.journals TO authenticated;
GRANT ALL ON public.journals TO service_role;
ALTER TABLE public.journals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own journals" ON public.journals FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER trg_journals_updated BEFORE UPDATE ON public.journals FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ GRATITUDE ============
CREATE TABLE public.gratitude_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  gratitude1 TEXT,
  gratitude2 TEXT,
  gratitude3 TEXT,
  best_moment TEXT,
  lesson TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_gratitude_user_date ON public.gratitude_entries(user_id, date DESC);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.gratitude_entries TO authenticated;
GRANT ALL ON public.gratitude_entries TO service_role;
ALTER TABLE public.gratitude_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own gratitude" ON public.gratitude_entries FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ============ HABITS ============
CREATE TABLE public.habits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  icon TEXT,
  target_frequency TEXT NOT NULL DEFAULT 'daily',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.habits TO authenticated;
GRANT ALL ON public.habits TO service_role;
ALTER TABLE public.habits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own habits" ON public.habits FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.habit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  habit_id UUID NOT NULL REFERENCES public.habits(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  completed BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(habit_id, date)
);
CREATE INDEX idx_habit_logs ON public.habit_logs(user_id, date DESC);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.habit_logs TO authenticated;
GRANT ALL ON public.habit_logs TO service_role;
ALTER TABLE public.habit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own habit logs" ON public.habit_logs FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ============ EMOTIONAL EATING ============
CREATE TABLE public.emotional_eating_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  hunger_type public.hunger_type,
  emotion TEXT,
  craving_food TEXT,
  trigger TEXT,
  ai_insight TEXT,
  suggested_action TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_eating_user_date ON public.emotional_eating_logs(user_id, date DESC);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.emotional_eating_logs TO authenticated;
GRANT ALL ON public.emotional_eating_logs TO service_role;
ALTER TABLE public.emotional_eating_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own eating" ON public.emotional_eating_logs FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ============ ORDERS ============
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT NOT NULL UNIQUE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  package_name TEXT NOT NULL DEFAULT 'Premium Bulanan',
  amount INT NOT NULL DEFAULT 49000,
  payment_method TEXT NOT NULL DEFAULT 'transfer_bank',
  payment_status public.payment_status NOT NULL DEFAULT 'menunggu_pembayaran',
  transfer_proof_url TEXT,
  admin_note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  verified_at TIMESTAMPTZ
);
CREATE INDEX idx_orders_user ON public.orders(user_id, created_at DESC);
CREATE INDEX idx_orders_status ON public.orders(payment_status);
GRANT SELECT, INSERT, UPDATE ON public.orders TO authenticated;
GRANT ALL ON public.orders TO service_role;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own orders read" ON public.orders FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "own orders insert" ON public.orders FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own orders update proof" ON public.orders FOR UPDATE TO authenticated USING (auth.uid() = user_id AND payment_status IN ('menunggu_pembayaran','ditolak'));
CREATE POLICY "admins read orders" ON public.orders FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "admins update orders" ON public.orders FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'admin'));

-- ============ APP SETTINGS (single row) ============
CREATE TABLE public.app_settings (
  id INT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  bank_name TEXT NOT NULL DEFAULT 'BCA',
  bank_account_number TEXT NOT NULL DEFAULT '1234567890',
  bank_account_holder TEXT NOT NULL DEFAULT 'PT Bloom Mind Indonesia',
  premium_price INT NOT NULL DEFAULT 49000,
  free_chat_limit INT NOT NULL DEFAULT 10,
  crisis_disclaimer TEXT NOT NULL DEFAULT 'Bloom Mind bukan pengganti psikolog, psikiater, diagnosis medis, atau layanan darurat. Jika kamu dalam krisis, segera hubungi orang terdekat atau layanan darurat 119.',
  maintenance_mode BOOLEAN NOT NULL DEFAULT false,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.app_settings TO authenticated, anon;
GRANT ALL ON public.app_settings TO service_role;
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anyone read settings" ON public.app_settings FOR SELECT TO authenticated, anon USING (true);
CREATE POLICY "admins update settings" ON public.app_settings FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "admins insert settings" ON public.app_settings FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER trg_settings_updated BEFORE UPDATE ON public.app_settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
INSERT INTO public.app_settings (id) VALUES (1);

-- ============ SEED COMPANIONS ============
INSERT INTO public.companions (key, name, tone, description, emoji, is_premium_only, system_prompt) VALUES
('ibu','Ibu','hangat, menenangkan, penuh kasih','Pendamping seperti sosok ibu yang selalu ada untukmu.','👩', true,
'Kamu adalah "Ibu" — pendamping AI Bloom Mind dengan suara hangat seperti seorang ibu yang penuh kasih, menenangkan, dan tidak menghakimi. Selalu balas dalam Bahasa Indonesia yang lembut. Validasi perasaan user lebih dulu, lalu beri satu langkah kecil yang bisa dilakukan. Maksimal 1 pertanyaan lanjutan. Jangan beri diagnosis medis/psikiatri, jangan menyarankan obat. Jika user menunjukkan tanda self-harm/bunuh diri/krisis: aktifkan respons krisis, sarankan menghubungi orang terdekat atau layanan darurat 119, dan tegaskan bantuan profesional. Jangan roleplay seksual. Jangan membangun ketergantungan emosional.'),
('ayah','Ayah','bijaksana, rasional, memberi arahan','Sosok ayah yang bijak dan menenangkan.','👨', true,
'Kamu adalah "Ayah" — pendamping AI Bloom Mind dengan suara bijaksana, rasional, dan memberi arahan yang menenangkan. Bahasa Indonesia. Validasi dulu, beri perspektif singkat, lalu 1 langkah praktis. Maksimal 1 pertanyaan. Tanpa diagnosis medis/resep obat. Aktifkan crisis response bila perlu. Jangan roleplay seksual.'),
('kakak_perempuan','Kakak Perempuan','supportive, pendengar baik','Kakak perempuan yang selalu mendengarkan.','👩‍🦰', true,
'Kamu adalah "Kakak Perempuan" — supportive, pendengar yang sabar, hangat tapi relatable. Bahasa Indonesia. Validasi → empati → 1 langkah kecil. 1 pertanyaan lanjutan maksimal. Tanpa diagnosis. Aktifkan crisis response bila perlu.'),
('kakak_laki','Kakak Laki-Laki','santai, solutif','Kakak laki-laki yang santai dan solutif.','👨‍🦱', true,
'Kamu adalah "Kakak Laki-Laki" — santai, solutif, tidak menggurui. Bahasa Indonesia. Akui perasaan, beri sudut pandang singkat, tawarkan 1 langkah konkret. Maksimal 1 pertanyaan. Tanpa diagnosis/obat. Crisis response bila perlu.'),
('sahabat','Sahabat','ringan, netral, relatable','Sahabat yang netral dan ringan.','🤝', false,
'Kamu adalah "Sahabat" — netral, ringan, relatable, tanpa menghakimi. Bahasa Indonesia santai tapi sopan. Validasi → empati → 1 saran kecil. Maksimal 1 pertanyaan. Tanpa diagnosis/obat. Crisis response bila ada indikasi self-harm.'),
('partner','Partner','hangat dan peduli','Pendamping yang hangat dan perhatian (bukan pacar virtual, bukan seksual).','❤️', true,
'Kamu adalah "Partner" — hangat, peduli, perhatian. PENTING: kamu BUKAN pacar virtual, BUKAN melakukan roleplay seksual/romantis eksplisit, dan tidak membangun ketergantungan emosional. Bahasa Indonesia lembut. Validasi → empati → 1 langkah kecil. 1 pertanyaan max. Tanpa diagnosis/obat. Crisis response bila perlu.'),
('coach','Coach','tegas, fokus target, accountability','Coach yang tegas dan fokus pada pertumbuhan.','🎯', true,
'Kamu adalah "Coach" — tegas tapi suportif, fokus pada accountability dan langkah nyata. Bahasa Indonesia. Akui perasaan singkat, lalu fokus ke 1 langkah aksi spesifik & terukur. Maksimal 1 pertanyaan reflektif. Tanpa diagnosis/obat. Crisis response bila perlu.');
