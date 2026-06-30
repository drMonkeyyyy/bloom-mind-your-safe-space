import { createFileRoute, Link } from "@tanstack/react-router";
import { useAuth } from "@/hooks/use-auth";
import { useProfile } from "@/hooks/use-profile";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { MOOD_OPTIONS } from "@/lib/companions";
import { MoodBars } from "@/components/app/MoodSparkline";
import { SkeletonCard } from "@/components/app/SkeletonCard";

export const Route = createFileRoute("/_authenticated/app/")({
  component: Dashboard,
});

function StreakFlame({ count }: { count: number }) {
  if (count === 0) return null;
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-amber-100 to-orange-100 px-2.5 py-1 text-xs font-bold text-amber-700">
      🔥 {count} hari
    </span>
  );
}

function Dashboard() {
  const { user } = useAuth();
  const { data: profile, isLoading: pLoading } = useProfile(user?.id);

  const since = new Date(Date.now() - 6 * 86400000).toISOString().slice(0, 10);
  const { data: moods, isLoading: moodsLoading } = useQuery({
    queryKey: ["moods-week", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.from("mood_checkins").select("date, mood, mood_score").eq("user_id", user!.id).gte("date", since).order("date");
      return data ?? [];
    },
  });
  const { data: lastJournal, isLoading: journalLoading } = useQuery({
    queryKey: ["last-journal", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.from("journals").select("*").eq("user_id", user!.id).order("created_at", { ascending: false }).limit(1).maybeSingle();
      return data;
    },
  });
  const { data: habitStreak } = useQuery({
    queryKey: ["habit-streak", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.from("habit_logs").select("date").eq("user_id", user!.id).eq("completed", true).order("date", { ascending: false }).limit(30);
      if (!data || data.length === 0) return 0;
      const dates = new Set(data.map((d) => d.date));
      let s = 0; const d = new Date();
      while (dates.has(d.toISOString().slice(0, 10))) { s++; d.setDate(d.getDate() - 1); }
      return s;
    },
  });
  const { data: habitsToday } = useQuery({
    queryKey: ["habits-today-count", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const today = new Date().toISOString().slice(0, 10);
      const [{ data: habits }, { data: logs }] = await Promise.all([
        supabase.from("habits").select("id").eq("user_id", user!.id).eq("is_active", true),
        supabase.from("habit_logs").select("id").eq("user_id", user!.id).eq("date", today).eq("completed", true),
      ]);
      return { total: habits?.length ?? 0, done: logs?.length ?? 0 };
    },
  });

  const hour = new Date().getHours();
  const greetEmoji = hour < 5 ? "🌙" : hour < 11 ? "🌅" : hour < 15 ? "☀️" : hour < 18 ? "🌤️" : "🌿";
  const greet = hour < 11 ? "Selamat pagi" : hour < 15 ? "Selamat siang" : hour < 18 ? "Selamat sore" : "Selamat malam";
  const isPremium = profile?.plan === "premium";

  const moodChartData = (moods ?? []).map((m) => ({ value: m.mood_score, date: m.date }));

  return (
    <div className="space-y-5">
      {/* ── HERO GREETING ─────────────────────────────────────────── */}
      <div
        className="relative overflow-hidden rounded-3xl p-6 sm:p-8"
        style={{ background: "var(--gradient-hero)" }}
      >
        <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-primary/10 blur-2xl" />
        <div className="absolute -bottom-6 left-1/4 h-32 w-32 rounded-full bg-accent/15 blur-xl" />
        <div className="relative">
          <p className="text-sm text-muted-foreground">
            {greetEmoji} {greet}
          </p>
          {pLoading ? (
            <div className="mt-2 skeleton h-8 w-3/4 rounded-xl" />
          ) : (
            <h1 className="mt-1 font-display text-2xl font-semibold leading-tight text-foreground sm:text-3xl">
              Halo, <span className="text-primary">{profile?.name ?? "teman"}</span>. Gimana perasaanmu hari ini?
            </h1>
          )}
          <p className="mt-2 text-xs text-muted-foreground">
            {new Date().toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long" })}
          </p>
          {(habitStreak ?? 0) > 0 && (
            <div className="mt-3">
              <StreakFlame count={habitStreak!} />
            </div>
          )}
        </div>
      </div>

      {/* ── QUICK MOOD ────────────────────────────────────────────── */}
      <section className="rounded-3xl bg-card p-5 ring-1 ring-border">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold">Cek mood cepat</p>
          <Link to="/app/mood" className="text-xs font-medium text-primary">
            Semua →
          </Link>
        </div>
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1 scrollbar-none" style={{ scrollbarWidth: "none" }}>
          {MOOD_OPTIONS.slice(0, 6).map((m) => (
            <Link
              key={m.key}
              to="/app/mood"
              search={{ pre: m.key }}
              className="flex shrink-0 flex-col items-center gap-1.5 rounded-2xl bg-cream-deep px-3.5 py-3 text-center transition-all duration-200 hover:bg-primary-soft hover:scale-105 active:scale-95"
            >
              <span className="text-2xl leading-none">{m.emoji}</span>
              <span className="text-[11px] font-medium text-muted-foreground">{m.label}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* ── QUICK ACTIONS ─────────────────────────────────────────── */}
      <div className="grid gap-3 sm:grid-cols-2">
        <Link
          to="/app/chat"
          className="group relative overflow-hidden rounded-3xl p-6 text-primary-foreground shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-float"
          style={{ background: "var(--gradient-sage)" }}
        >
          <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/10" />
          <div className="absolute right-4 bottom-4 h-16 w-16 rounded-full bg-white/5" />
          <div className="relative">
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-white/20 backdrop-blur-sm">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden="true">
                <path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 0 1-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h3 className="mt-3 font-display text-lg font-semibold">Mulai curhat sekarang</h3>
            <p className="mt-0.5 text-sm opacity-85">Pendamping AI menunggumu.</p>
          </div>
        </Link>

        <Link
          to="/app/calm"
          className="group relative overflow-hidden rounded-3xl p-6 text-accent-foreground shadow-peach transition-all duration-300 hover:-translate-y-1 hover:shadow-float"
          style={{ background: "var(--gradient-warm)" }}
        >
          <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/10" />
          <div className="relative">
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-white/20 backdrop-blur-sm">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden="true">
                <circle cx="12" cy="12" r="10" /><path d="M12 8v4M12 16h.01" />
              </svg>
            </div>
            <h3 className="mt-3 font-display text-lg font-semibold">Aku butuh tenang</h3>
            <p className="mt-0.5 text-sm opacity-85">Emergency calm mode.</p>
          </div>
        </Link>
      </div>

      {/* ── STATS STRIP ───────────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-3">
        {/* Mood stat */}
        <div className="rounded-3xl bg-card p-4 ring-1 ring-border">
          <p className="text-[11px] font-medium text-muted-foreground">Mood minggu ini</p>
          {moodsLoading ? (
            <div className="mt-2 skeleton h-7 w-12 rounded-lg" />
          ) : (
            <p className="mt-1.5 font-display text-2xl font-bold text-foreground">
              {moods?.length ?? 0}
              <span className="ml-1 text-xs font-normal text-muted-foreground">check-in</span>
            </p>
          )}
          <div className="mt-2.5">
            <MoodBars data={moodChartData} height={28} />
          </div>
        </div>

        {/* Habit streak */}
        <div className="rounded-3xl bg-card p-4 ring-1 ring-border">
          <p className="text-[11px] font-medium text-muted-foreground">Habit streak</p>
          <p className="mt-1.5 font-display text-2xl font-bold text-foreground">
            {habitStreak ?? 0}
            <span className="ml-1 text-xs font-normal text-muted-foreground">hari</span>
          </p>
          {habitsToday && habitsToday.total > 0 && (
            <p className="mt-1.5 text-[11px] text-muted-foreground">
              {habitsToday.done}/{habitsToday.total} hari ini
            </p>
          )}
          <Link to="/app/habits" className="mt-1 inline-block text-[11px] font-medium text-primary">
            Lihat habit →
          </Link>
        </div>

        {/* Plan */}
        <div className={`rounded-3xl p-4 ring-1 ${isPremium ? "bg-gradient-to-br from-amber-50 to-orange-50 ring-amber-200" : "bg-card ring-border"}`}>
          <p className="text-[11px] font-medium text-muted-foreground">Paket</p>
          <p className={`mt-1.5 font-display text-lg font-bold ${isPremium ? "text-amber-700" : "text-foreground"}`}>
            {isPremium ? "✨ Premium" : "Free"}
          </p>
          {!isPremium && (
            <Link to="/app/premium" className="mt-1.5 inline-block text-[11px] font-semibold text-accent">
              Upgrade →
            </Link>
          )}
          {isPremium && profile?.premium_end_date && (
            <p className="mt-1 text-[11px] text-amber-600/80">
              Aktif hingga {new Date(profile.premium_end_date).toLocaleDateString("id-ID", { day: "numeric", month: "short" })}
            </p>
          )}
        </div>
      </div>

      {/* ── LAST JOURNAL ──────────────────────────────────────────── */}
      {journalLoading ? (
        <SkeletonCard lines={2} />
      ) : lastJournal ? (
        <section className="rounded-3xl bg-card p-5 ring-1 ring-border animate-slide-up">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-base">📓</span>
                <p className="text-xs text-muted-foreground">
                  Journal terakhir · {new Date(lastJournal.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "short" })}
                </p>
              </div>
              {lastJournal.summary && (
                <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-foreground">
                  {lastJournal.summary}
                </p>
              )}
              <div className="mt-2 flex flex-wrap gap-1.5">
                {lastJournal.main_emotion && (
                  <span className="rounded-full bg-primary-soft px-2.5 py-0.5 text-[11px] font-medium">
                    {lastJournal.main_emotion}
                  </span>
                )}
                {lastJournal.main_trigger && (
                  <span className="rounded-full bg-accent-soft px-2.5 py-0.5 text-[11px] font-medium">
                    {lastJournal.main_trigger}
                  </span>
                )}
              </div>
            </div>
            <Link
              to="/app/journal"
              className="shrink-0 rounded-full bg-cream-deep px-3 py-1.5 text-xs font-medium text-foreground hover:bg-primary-soft transition-colors"
            >
              Lihat semua →
            </Link>
          </div>
        </section>
      ) : (
        <section className="rounded-3xl bg-cream-deep/50 p-5 text-center">
          <p className="text-2xl">📓</p>
          <p className="mt-2 text-sm font-medium text-foreground">Belum ada journal</p>
          <p className="mt-1 text-xs text-muted-foreground">Mulai tulis refleksi harimu</p>
          <Link
            to="/app/journal"
            className="mt-3 inline-block rounded-full bg-accent px-4 py-2 text-xs font-semibold text-accent-foreground shadow-peach"
          >
            Mulai Journal →
          </Link>
        </section>
      )}
    </div>
  );
}
