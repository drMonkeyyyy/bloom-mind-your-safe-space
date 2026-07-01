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

/* ── MindPlant SVG Plant Renderer ───────────────────────────────── */
function MindPlant({ score }: { score: number }) {
  let stage = 1;
  let label = "Tunas Baru (Sprout)";
  let desc = "Tanaman jiwamu baru saja bertunas. Teruskan langkah kecilmu merawat diri! 🌱";
  
  if (score > 200) {
    stage = 5;
    label = "Bunga Emas Abadi (Golden Bloom)";
    desc = "Luar biasa! Tanaman jiwamu mekar penuh dengan cahaya emas kebahagiaan. 🌟";
  } else if (score > 120) {
    stage = 4;
    label = "Bunga Mekar (Blooming)";
    desc = "Bunga mekar dengan indah! Jiwamu memancarkan kehangatan dan ketenangan. 🌼";
  } else if (score > 60) {
    stage = 3;
    label = "Kuncup Bunga (Bud)";
    desc = "Kuncup bunga telah tumbuh! Keindahan mulai tampak dari konsistensimu. 🌸";
  } else if (score > 20) {
    stage = 2;
    label = "Daun Rimbun (Leafy)";
    desc = "Tanaman jiwamu mulai berdaun rimbun seiring kepedulianmu pada diri sendiri. 🌿";
  }

  return (
    <div className="rounded-3xl bg-card p-6 ring-1 ring-border/60 shadow-card flex flex-col items-center text-center space-y-4 animate-scale-in">
      <div className="relative w-44 h-48 flex items-center justify-center">
        {stage >= 4 && (
          <div className="absolute inset-0 pointer-events-none">
            <span className="absolute text-yellow-400 text-lg animate-sparkle top-4 left-1/4">✨</span>
            <span className="absolute text-yellow-300 text-sm animate-float top-8 right-1/4">🌟</span>
            <span className="absolute text-yellow-400 text-xs animate-sparkle bottom-1/2 left-8">✨</span>
          </div>
        )}
        
        <svg viewBox="0 0 100 120" className="w-full h-full drop-shadow-md">
          {/* Pot */}
          <path d="M35 90 L65 90 L70 115 L30 115 Z" fill="oklch(0.70 0.08 40)" />
          <ellipse cx="50" cy="90" rx="16" ry="4" fill="oklch(0.60 0.08 40)" />
          <ellipse cx="50" cy="115" rx="20" ry="3" fill="oklch(0.27 0.02 80 / 0.1)" />

          {/* Stem & Leaves */}
          {stage >= 1 && (
            <>
              <path 
                d={
                  stage === 1 ? "M50 90 Q50 75 48 65" :
                  stage === 2 ? "M50 90 Q50 65 46 50" :
                  "M50 90 Q50 55 45 35"
                } 
                fill="none" 
                stroke="oklch(0.71 0.045 160)" 
                strokeWidth="3.5" 
                strokeLinecap="round" 
              />
              <path d="M48 65 Q38 60 40 54 Q47 56 48 65" fill="oklch(0.71 0.045 160)" />
              <path d="M48 65 Q58 62 56 56 Q50 58 48 65" fill="oklch(0.80 0.05 165)" />
            </>
          )}

          {stage >= 2 && (
            <>
              <path d="M49 76 Q35 70 34 62 Q45 66 49 76" fill="oklch(0.68 0.05 155)" />
              <path d="M50 72 Q64 68 62 60 Q52 64 50 72" fill="oklch(0.71 0.045 160)" />
            </>
          )}

          {stage >= 3 && (
            <>
              <path d="M47 55 Q33 50 32 42 Q42 46 47 55" fill="oklch(0.68 0.05 155)" />
              <path d="M46 48 Q58 42 56 34 Q48 38 46 48" fill="oklch(0.71 0.045 160)" />
              
              {stage === 3 && (
                <g className="animate-breathe" style={{ transformOrigin: "45px 35px" }}>
                  <path d="M45 35 Q40 25 45 20 Q50 25 45 35" fill="oklch(0.77 0.085 40)" />
                  <path d="M45 35 Q45 26 43 22 Q41 28 45 35" fill="oklch(0.93 0.04 40)" />
                </g>
              )}
            </>
          )}

          {stage >= 4 && (
            <g className="animate-breathe" style={{ transformOrigin: "45px 35px" }}>
              <circle cx="45" cy="35" r="3" fill="oklch(0.71 0.045 160)" />
              <circle cx="45" cy="20" r="10" fill={stage === 5 ? "oklch(0.82 0.14 75)" : "oklch(0.77 0.085 40)"} opacity="0.9" />
              <circle cx="33" cy="30" r="10" fill={stage === 5 ? "oklch(0.85 0.12 70)" : "oklch(0.77 0.085 40)"} opacity="0.9" />
              <circle cx="57" cy="30" r="10" fill={stage === 5 ? "oklch(0.85 0.12 70)" : "oklch(0.77 0.085 40)"} opacity="0.9" />
              <circle cx="37" cy="45" r="10" fill={stage === 5 ? "oklch(0.82 0.14 75)" : "oklch(0.77 0.085 40)"} opacity="0.9" />
              <circle cx="53" cy="45" r="10" fill={stage === 5 ? "oklch(0.82 0.14 75)" : "oklch(0.77 0.085 40)"} opacity="0.9" />
              
              <circle cx="45" cy="34" r="8" fill={stage === 5 ? "oklch(0.92 0.08 80)" : "oklch(0.93 0.04 40)"} />
              <circle cx="45" cy="34" r="3" fill="white" opacity="0.5" />
            </g>
          )}
        </svg>
      </div>

      <div className="space-y-1">
        <p className="text-[10px] font-bold uppercase tracking-wider text-primary">Level Tanaman Jiwa</p>
        <h3 className="font-display text-xl font-bold text-foreground">{label}</h3>
        <p className="text-sm text-muted-foreground leading-relaxed max-w-sm">
          {desc}
        </p>
        <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-primary-soft/60 px-3 py-1 text-xs font-semibold text-primary">
          Skor Jiwa: {score} Pts
        </div>
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

  const { data: journalsCount } = useQuery({
    queryKey: ["journals-count", user?.id],
    enabled: !!user && isPremium,
    queryFn: async () => {
      const { count } = await supabase.from("journals").select("*", { count: "exact", head: true }).eq("user_id", user!.id);
      return count ?? 0;
    },
  });

  const { data: gratitudeCount } = useQuery({
    queryKey: ["gratitude-count", user?.id],
    enabled: !!user && isPremium,
    queryFn: async () => {
      const { count } = await supabase.from("gratitude_entries").select("*", { count: "exact", head: true }).eq("user_id", user!.id);
      return count ?? 0;
    },
  });

  const growthScore = (moods?.length || 0) * 8 + (journalsCount || 0) * 12 + (gratitudeCount || 0) * 12;

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

      {/* ── MINDPLANT ────────────────────────────────────────────── */}
      <MindPlant score={growthScore} />

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
