import { createFileRoute, Link } from "@tanstack/react-router";
import { useAuth } from "@/hooks/use-auth";
import { useProfile } from "@/hooks/use-profile";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { MOOD_OPTIONS } from "@/lib/companions";

export const Route = createFileRoute("/_authenticated/app/")({
  component: Dashboard,
});

function Dashboard() {
  const { user } = useAuth();
  const { data: profile } = useProfile(user?.id);

  const since = new Date(Date.now() - 6 * 86400000).toISOString().slice(0, 10);
  const { data: moods } = useQuery({
    queryKey: ["moods-week", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.from("mood_checkins").select("date, mood, mood_score").eq("user_id", user!.id).gte("date", since).order("date");
      return data ?? [];
    },
  });
  const { data: lastJournal } = useQuery({
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

  const hour = new Date().getHours();
  const greet = hour < 11 ? "Selamat pagi" : hour < 15 ? "Selamat siang" : hour < 18 ? "Selamat sore" : "Selamat malam";

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-muted-foreground">{greet}, 🌿</p>
        <h1 className="mt-1 font-display text-3xl font-semibold sm:text-4xl">
          Halo, {profile?.name ?? "teman"}. Gimana perasaanmu hari ini?
        </h1>
      </div>

      {/* Quick mood */}
      <section className="rounded-3xl bg-card p-6 ring-1 ring-border">
        <p className="text-sm font-medium">Cek mood cepat</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {MOOD_OPTIONS.slice(0, 6).map((m) => (
            <Link key={m.key} to="/app/mood" search={{ pre: m.key }}
              className="rounded-full bg-cream-deep px-3 py-1.5 text-sm hover:bg-primary-soft">
              {m.emoji} {m.label}
            </Link>
          ))}
        </div>
        <Link to="/app/mood" className="mt-4 inline-block text-xs font-medium text-primary">Mood check-in lengkap →</Link>
      </section>

      <div className="grid gap-4 sm:grid-cols-2">
        <Link to="/app/chat" className="rounded-3xl bg-gradient-to-br from-primary to-primary/80 p-6 text-primary-foreground shadow-soft transition hover:-translate-y-0.5">
          <p className="text-2xl">💬</p>
          <h3 className="mt-2 font-display text-xl font-semibold">Mulai curhat sekarang</h3>
          <p className="mt-1 text-sm opacity-90">Pendamping AI menunggumu.</p>
        </Link>
        <Link to="/app/calm" className="rounded-3xl bg-gradient-to-br from-accent to-accent/80 p-6 text-accent-foreground shadow-soft transition hover:-translate-y-0.5">
          <p className="text-2xl">🌬️</p>
          <h3 className="mt-2 font-display text-xl font-semibold">Aku butuh tenang</h3>
          <p className="mt-1 text-sm opacity-90">Emergency calm mode.</p>
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-3xl bg-card p-5 ring-1 ring-border">
          <p className="text-xs text-muted-foreground">Mood minggu ini</p>
          <p className="mt-2 font-display text-3xl font-semibold">{moods?.length ?? 0} <span className="text-sm text-muted-foreground">check-in</span></p>
          <div className="mt-3 flex gap-1">
            {moods?.slice(-7).map((m, i) => (
              <div key={i} className="h-8 flex-1 rounded-md bg-primary/20" style={{ opacity: 0.3 + (m.mood_score / 10) * 0.7 }} />
            ))}
          </div>
        </div>
        <div className="rounded-3xl bg-card p-5 ring-1 ring-border">
          <p className="text-xs text-muted-foreground">Habit streak</p>
          <p className="mt-2 font-display text-3xl font-semibold">{habitStreak ?? 0} <span className="text-sm text-muted-foreground">hari</span></p>
          <Link to="/app/habits" className="mt-2 inline-block text-xs text-primary">Kelola habit →</Link>
        </div>
        <div className="rounded-3xl bg-card p-5 ring-1 ring-border">
          <p className="text-xs text-muted-foreground">Akun</p>
          <p className="mt-2 font-display text-2xl font-semibold capitalize">{profile?.plan === "premium" ? "✨ Premium" : "Free"}</p>
          {profile?.plan !== "premium" && (
            <Link to="/app/premium" className="mt-2 inline-block text-xs font-semibold text-accent">Upgrade →</Link>
          )}
        </div>
      </div>

      {lastJournal && (
        <section className="rounded-3xl bg-card p-6 ring-1 ring-border">
          <p className="text-xs text-muted-foreground">Journal terakhir</p>
          <p className="mt-2 line-clamp-3 text-sm">{lastJournal.summary ?? "(belum ada ringkasan)"}</p>
          <Link to="/app/journal" className="mt-3 inline-block text-xs font-medium text-primary">Lihat semua →</Link>
        </section>
      )}
    </div>
  );
}
