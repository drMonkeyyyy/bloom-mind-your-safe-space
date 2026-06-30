import { createFileRoute } from "@tanstack/react-router";
import { useAuth } from "@/hooks/use-auth";
import { useProfile } from "@/hooks/use-profile";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { getWeeklyInsight } from "@/lib/chat.functions";
import { PaywallCard } from "@/components/app/PaywallCard";
import { useState } from "react";
import { MoodSparkline } from "@/components/app/MoodSparkline";
import { SkeletonCard } from "@/components/app/SkeletonCard";

export const Route = createFileRoute("/_authenticated/app/growth")({
  component: Page,
});

function StatCard({ label, value, suffix = "/10", trend }: { label: string; value: string | number; suffix?: string; trend?: "up" | "down" | null }) {
  return (
    <div className="rounded-3xl bg-card p-5 ring-1 ring-border">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <div className="mt-2 flex items-end gap-1.5">
        <p className="font-display text-3xl font-bold text-foreground">{value}</p>
        <p className="mb-0.5 text-sm text-muted-foreground">{suffix}</p>
        {trend && (
          <span className={`mb-0.5 ml-auto text-xs font-semibold ${trend === "up" ? "text-primary" : "text-destructive"}`}>
            {trend === "up" ? "↑" : "↓"}
          </span>
        )}
      </div>
    </div>
  );
}

function Page() {
  const { user } = useAuth();
  const { data: profile } = useProfile(user?.id);
  const isPremium = profile?.plan === "premium";
  const insightFn = useServerFn(getWeeklyInsight);
  const [insight, setInsight] = useState<string | null>(null);
  const [insightLoading, setInsightLoading] = useState(false);

  const since = new Date(Date.now() - 29 * 86400000).toISOString().slice(0, 10);
  const { data: moods, isLoading: moodsLoading } = useQuery({
    queryKey: ["moods-30", user?.id],
    enabled: !!user && isPremium,
    queryFn: async () => {
      const { data } = await supabase.from("mood_checkins")
        .select("date, mood, mood_score, stress_score, energy_score, triggers")
        .eq("user_id", user!.id).gte("date", since).order("date");
      return data ?? [];
    },
  });

  if (!isPremium) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-3xl font-semibold">Growth Dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">Pantau perkembangan dirimu dari waktu ke waktu.</p>
        </div>
        <PaywallCard desc="Lihat analytics mood, stress, energy, habit consistency, dan insight mingguan AI." />
      </div>
    );
  }

  const avgMood = moods?.length ? (moods.reduce((a, b) => a + b.mood_score, 0) / moods.length).toFixed(1) : "—";
  const avgStress = moods?.length ? (moods.reduce((a, b) => a + b.stress_score, 0) / moods.length).toFixed(1) : "—";
  const avgEnergy = moods?.length ? (moods.reduce((a, b) => a + b.energy_score, 0) / moods.length).toFixed(1) : "—";

  const triggerCount: Record<string, number> = {};
  moods?.forEach((m) => m.triggers?.forEach((t) => { triggerCount[t] = (triggerCount[t] ?? 0) + 1; }));
  const topTriggers = Object.entries(triggerCount).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const maxTrigger = topTriggers[0]?.[1] ?? 1;

  const moodChartData = (moods ?? []).map((m) => ({ value: m.mood_score, date: m.date }));
  const stressChartData = (moods ?? []).map((m) => ({ value: m.stress_score, date: m.date }));

  const generate = async () => {
    setInsightLoading(true);
    try { const r = await insightFn({ data: undefined }); setInsight(r.text); }
    catch { setInsight("Gagal memuat insight. Coba lagi."); }
    finally { setInsightLoading(false); }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-semibold">Growth Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">30 hari terakhir · Data personalmu</p>
      </div>

      {/* ── STATS ─────────────────────────────────────────────────── */}
      {moodsLoading ? (
        <div className="grid gap-4 sm:grid-cols-3">
          {[1, 2, 3].map(i => <SkeletonCard key={i} lines={1} />)}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard label="Mood rata-rata" value={avgMood} />
          <StatCard label="Stres rata-rata" value={avgStress} />
          <StatCard label="Energi rata-rata" value={avgEnergy} />
        </div>
      )}

      {/* ── MOOD TREND ───────────────────────────────────────────── */}
      <section className="rounded-3xl bg-card p-6 ring-1 ring-border">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm font-semibold">Tren Mood 30 Hari</p>
          <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-primary inline-block" />Mood</span>
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full inline-block" style={{ background: "oklch(0.75 0.08 20)" }} />Stres</span>
          </div>
        </div>
        {moodsLoading ? (
          <div className="skeleton h-24 rounded-xl" />
        ) : (
          <div className="relative h-24">
            <MoodSparkline data={moodChartData} height={96} />
            <div className="absolute inset-0 opacity-50">
              <MoodSparkline
                data={stressChartData}
                height={96}
                color="oklch(0.75 0.08 20)"
                gradient={false}
              />
            </div>
          </div>
        )}
        {moods && moods.length > 0 && (
          <div className="mt-3 flex justify-between text-[10px] text-muted-foreground">
            <span>{new Date(moods[0].date).toLocaleDateString("id-ID", { day: "numeric", month: "short" })}</span>
            <span>{new Date(moods[moods.length - 1].date).toLocaleDateString("id-ID", { day: "numeric", month: "short" })}</span>
          </div>
        )}
      </section>

      {/* ── TOP TRIGGERS ─────────────────────────────────────────── */}
      <section className="rounded-3xl bg-card p-6 ring-1 ring-border">
        <p className="mb-4 text-sm font-semibold">Top Trigger</p>
        {topTriggers.length === 0 ? (
          <p className="text-sm text-muted-foreground">Belum cukup data. Lanjutkan check-in mood harian.</p>
        ) : (
          <div className="space-y-3">
            {topTriggers.map(([t, c]) => (
              <div key={t} className="flex items-center gap-3">
                <span className="w-28 shrink-0 text-sm text-foreground">{t}</span>
                <div className="flex-1 h-2.5 rounded-full bg-cream-deep overflow-hidden">
                  <div
                    className="h-full rounded-full bg-primary transition-all duration-700"
                    style={{ width: `${(c / maxTrigger) * 100}%` }}
                  />
                </div>
                <span className="w-8 shrink-0 text-right text-xs font-semibold text-muted-foreground">{c}×</span>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ── WEEKLY AI INSIGHT ────────────────────────────────────── */}
      <section className="rounded-3xl p-6" style={{ background: "var(--gradient-calm)" }}>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-display text-lg font-semibold">Weekly AI Insight</p>
            <p className="mt-0.5 text-xs text-muted-foreground">Analisis personal berdasarkan datamu</p>
          </div>
          <button
            onClick={generate}
            disabled={insightLoading}
            className="rounded-full bg-foreground px-4 py-2 text-xs font-semibold text-cream transition-all hover:-translate-y-0.5 disabled:opacity-60"
          >
            {insightLoading ? "Memuat…" : "Generate"}
          </button>
        </div>

        {insightLoading && (
          <div className="mt-4 space-y-2">
            <div className="skeleton h-3 w-full rounded-full" />
            <div className="skeleton h-3 w-5/6 rounded-full" />
            <div className="skeleton h-3 w-4/5 rounded-full" />
          </div>
        )}

        {insight && !insightLoading && (
          <div className="mt-4 animate-slide-up rounded-2xl bg-card/80 p-5 ring-1 ring-border">
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">{insight}</p>
          </div>
        )}

        {!insight && !insightLoading && (
          <p className="mt-4 text-sm text-muted-foreground">
            Klik "Generate" untuk mendapatkan insight personal minggu ini.
          </p>
        )}
      </section>
    </div>
  );
}
