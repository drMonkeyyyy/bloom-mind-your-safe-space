import { createFileRoute, Link } from "@tanstack/react-router";
import { useAuth } from "@/hooks/use-auth";
import { useProfile } from "@/hooks/use-profile";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { getWeeklyInsight } from "@/lib/chat.functions";
import { PaywallCard } from "@/components/app/PaywallCard";
import { useState, useEffect } from "react";
import { MoodSparkline } from "@/components/app/MoodSparkline";
import { SkeletonCard } from "@/components/app/SkeletonCard";
import { BottomSheet, ModalDialog } from "@/components/app/BottomSheet";
import { exportWeeklyInsightPDF } from "@/lib/export-pdf";

const TRIGGER_EMOJIS: Record<string, string> = {
  "Pekerjaan": "💼",
  "Hubungan": "❤️",
  "Keluarga": "🏡",
  "Keuangan": "💰",
  "Makanan": "🍔",
  "Kesehatan": "🩺",
  "Masa depan": "🔮",
  "Lainnya": "🌿"
};

export const Route = createFileRoute("/_authenticated/app/growth")({
  component: Page,
});

function StatCard({ label, value, suffix = "/10", trend, onClick }: { label: string; value: string | number; suffix?: string; trend?: "up" | "down" | null; onClick?: () => void }) {
  return (
    <div 
      onClick={onClick}
      className="rounded-3xl bg-card p-5 ring-1 ring-border transition-all duration-300 hover:shadow-card hover:-translate-y-0.5 cursor-pointer active:scale-98"
    >
      <p className="text-xs font-semibold text-stone-500">{label}</p>
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
function MindPlant({ score, onClick }: { score: number; onClick?: () => void }) {
  let stage = 1;
  let label = "Tunas Baru (Sprout)";
  let desc = "Tanaman jiwamu baru saja bertunas. Teruskan langkah kecilmu merawat diri! 🌱";
  
  if (score > 200) {
    stage = 5;
    label = "Bunga Emas Abadi";
    desc = "Luar biasa! Tanaman jiwamu mekar penuh dengan cahaya emas kebahagiaan. 🌟";
  } else if (score > 120) {
    stage = 4;
    label = "Bunga Mekar";
    desc = "Bunga mekar dengan indah! Jiwamu memancarkan kehangatan dan ketenangan. 🌼";
  } else if (score > 60) {
    stage = 3;
    label = "Kuncup Bunga";
    desc = "Kuncup bunga telah tumbuh! Keindahan mulai tampak dari konsistensimu. 🌸";
  } else if (score > 20) {
    stage = 2;
    label = "Daun Rimbun";
    desc = "Tanaman jiwamu mulai berdaun rimbun seiring kepedulianmu pada diri sendiri. 🌿";
  }

  return (
    <div 
      onClick={onClick}
      className="rounded-3xl bg-card p-6 ring-1 ring-border/60 shadow-card flex flex-col items-center text-center space-y-4 animate-scale-in cursor-pointer hover:shadow-elevated hover:-translate-y-0.5 transition-all duration-300 active:scale-98"
    >
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
  const [plantModalOpen, setPlantModalOpen] = useState(false);
  const [selectedStat, setSelectedStat] = useState<{ title: string; desc: string } | null>(null);
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [insightHistory, setInsightHistory] = useState<Array<{ id: string; date: string; text: string }>>([]);

  useEffect(() => {
    if (!user) return;
    const saved = localStorage.getItem(`bloom_weekly_insight_${user.id}`);
    if (saved) {
      setInsight(saved);
    }
    const savedHistory = localStorage.getItem(`bloom_weekly_insights_history_${user.id}`);
    if (savedHistory) {
      setInsightHistory(JSON.parse(savedHistory));
    }
  }, [user]);

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
    try { 
      const r = await insightFn({ data: undefined }); 
      setInsight(r.text); 
      if (user) {
        localStorage.setItem(`bloom_weekly_insight_${user.id}`, r.text);
        
        // Save to history
        const newEntry = {
          id: Math.random().toString(36).substring(2, 9),
          date: new Date().toISOString(),
          text: r.text,
        };
        // Keep max 50 entries in history to prevent storage exhaustion
        const updatedHistory = [newEntry, ...insightHistory].slice(0, 50);
        setInsightHistory(updatedHistory);
        localStorage.setItem(`bloom_weekly_insights_history_${user.id}`, JSON.stringify(updatedHistory));
      }
    }
    catch { setInsight("Gagal memuat insight. Coba lagi."); }
    finally { setInsightLoading(false); }
  };

  return (
    <div className="space-y-6">
      <div className="relative">
        <h1 className="font-display text-3xl font-semibold">Growth Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">30 hari terakhir · Data personalmu</p>
      </div>

      {/* ── MINDPLANT ────────────────────────────────────────────── */}
      <MindPlant score={growthScore} onClick={() => setPlantModalOpen(true)} />

      {/* ── STATS ─────────────────────────────────────────────────── */}
      {moodsLoading ? (
        <div className="grid gap-4 sm:grid-cols-3">
          {[1, 2, 3].map(i => <SkeletonCard key={i} lines={1} />)}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard 
            label="Mood rata-rata" 
            value={avgMood} 
            onClick={() => setSelectedStat({
              title: "📊 Mood Rata-Rata",
              desc: `Skor mood rata-rata dihitung dari seluruh check-in mood harian Anda selama 30 hari terakhir. Skor berkisar antara 1 (sangat buruk) hingga 10 (sangat bahagia). Rata-rata Anda saat ini adalah ${avgMood}/10.`
            })}
          />
          <StatCard 
            label="Stres rata-rata" 
            value={avgStress} 
            onClick={() => setSelectedStat({
              title: "💆‍♀️ Stres Rata-Rata",
              desc: `Tingkat stres rata-rata dihitung dari seluruh catatan stres harian Anda selama 30 hari terakhir. Skor berkisar antara 1 (sangat tenang/rileks) hingga 10 (sangat tertekan/stres berat). Rata-rata Anda saat ini adalah ${avgStress}/10.`
            })}
          />
          <StatCard 
            label="Energi rata-rata" 
            value={avgEnergy} 
            onClick={() => setSelectedStat({
              title: "⚡ Energi Rata-Rata",
              desc: `Tingkat energi rata-rata dihitung dari seluruh catatan tingkat energi harian Anda selama 30 hari terakhir. Skor berkisar antara 1 (lelah fisik/mental habis) hingga 10 (sangat segar/berenergi tinggi). Rata-rata Anda saat ini adalah ${avgEnergy}/10.`
            })}
          />
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
            {topTriggers.map(([t, c]) => {
              const emoji = TRIGGER_EMOJIS[t] ?? "🌿";
              return (
                <div key={t} className="flex items-center gap-3">
                  <span className="w-32 shrink-0 text-sm font-semibold text-stone-700 flex items-center gap-1.5">
                    <span className="text-base select-none">{emoji}</span>
                    {t}
                  </span>
                  <div className="flex-1 h-2.5 rounded-full bg-cream-deep overflow-hidden">
                    <div
                      className="h-full rounded-full bg-primary transition-all duration-700"
                      style={{ width: `${(c / maxTrigger) * 100}%` }}
                    />
                  </div>
                  <span className="w-8 shrink-0 text-right text-xs font-semibold text-muted-foreground">{c}×</span>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ── WEEKLY AI INSIGHT ────────────────────────────────────── */}
      <section className="rounded-3xl p-6 border border-primary/10 relative overflow-hidden bg-gradient-to-br from-primary-soft/40 to-cream-deep/30 shadow-soft">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-display text-lg font-semibold">Weekly AI Insight</p>
            <p className="mt-0.5 text-xs text-muted-foreground">Analisis personal berdasarkan datamu</p>
          </div>
          <div className="flex items-center gap-2">
            {insightHistory.length > 0 && (
              <button
                onClick={() => setHistoryModalOpen(true)}
                className="rounded-full border border-primary/20 bg-white/80 hover:bg-white px-3.5 py-2 text-xs font-bold text-primary transition-all duration-200 active:scale-95 shadow-sm"
              >
                🕒 Riwayat
              </button>
            )}
            <button
              onClick={generate}
              disabled={insightLoading}
              className="rounded-full bg-foreground px-4 py-2 text-xs font-semibold text-cream transition-all hover:-translate-y-0.5 disabled:opacity-60"
            >
              {insightLoading ? "Memuat…" : "Generate"}
            </button>
          </div>
        </div>

        {insightLoading && (
          <div className="mt-4 space-y-2">
            <div className="skeleton h-3 w-full rounded-full" />
            <div className="skeleton h-3 w-5/6 rounded-full" />
            <div className="skeleton h-3 w-4/5 rounded-full" />
          </div>
        )}

        {insight && !insightLoading && (
          <div className="mt-4 animate-slide-up rounded-2xl bg-white/80 border border-primary/10 p-5 shadow-sm relative overflow-hidden text-sm leading-relaxed text-stone-700 whitespace-pre-wrap select-text selection:bg-primary-soft">
            <div className="absolute left-3 top-0 bottom-0 w-[1px] bg-primary/30" />
            <div className="pl-4">
              {insight}
            </div>
          </div>
        )}

        {!insight && !insightLoading && (
          <p className="mt-4 text-sm text-muted-foreground">
            Klik "Generate" untuk mendapatkan insight personal minggu ini.
          </p>
        )}
      </section>

      {/* ── MINDPLANT LIBRARY DIALOG ───────────────────────────── */}
      <ModalDialog
        open={plantModalOpen}
        onClose={() => setPlantModalOpen(false)}
        title="🌱 Koleksi Tanaman Jiwa"
      >
        <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
          <p className="text-xs text-muted-foreground leading-relaxed">
            Skor Jiwa Anda dihitung berdasarkan keaktifan merawat diri:
            <br />• <strong>Check-in Mood</strong> (+8 Pts per hari)
            <br />• Menulis lembaran <strong>Diary</strong> (+12 Pts)
            <br />• Mengisi jurnal <strong>Syukur</strong> (+12 Pts)
          </p>

          <div className="space-y-2.5">
            {[
              { level: 1, range: "0–20 Pts", emoji: "🌱", name: "Tunas Baru", desc: "Tanaman jiwamu baru saja bertunas. Teruskan langkah kecilmu merawat diri!" },
              { level: 2, range: "21–60 Pts", emoji: "🌿", name: "Daun Rimbun", desc: "Tanaman jiwamu mulai berdaun rimbun seiring kepedulianmu pada diri sendiri." },
              { level: 3, range: "61–120 Pts", emoji: "🌸", name: "Kuncup Bunga", desc: "Kuncup bunga telah tumbuh! Keindahan mulai tampak dari konsistensimu." },
              { level: 4, range: "121–200 Pts", emoji: "🌼", name: "Bunga Mekar", desc: "Bunga mekar dengan indah! Jiwamu memancarkan kehangatan dan ketenangan." },
              { level: 5, range: "> 200 Pts", emoji: "🌟", name: "Bunga Emas Abadi", desc: "Luar biasa! Tanaman jiwamu mekar penuh dengan cahaya emas kebahagiaan." }
            ].map((st) => {
              const currentStage = growthScore > 200 ? 5 : growthScore > 120 ? 4 : growthScore > 60 ? 3 : growthScore > 20 ? 2 : 1;
              const isActive = currentStage === st.level;
              return (
                <div 
                  key={st.level}
                  className={`p-3.5 rounded-2xl border flex items-center gap-3 transition-all duration-200 ${
                    isActive 
                      ? "border-amber-400 bg-amber-50/50 shadow-sm scale-[1.01]" 
                      : "border-border bg-card opacity-70"
                  }`}
                >
                  <div className="text-3xl bg-white p-2 rounded-xl shadow-sm leading-none shrink-0 select-none">
                    {st.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 flex-wrap">
                      <h4 className={`text-xs font-bold ${isActive ? "text-amber-900" : "text-foreground"}`}>{st.name}</h4>
                      <span className="rounded-full bg-primary-soft px-2 py-0.5 text-[9px] font-semibold text-primary">{st.range}</span>
                    </div>
                    <p className="text-[10px] text-muted-foreground leading-relaxed mt-0.5">{st.desc}</p>
                  </div>
                  {isActive && (
                    <span className="shrink-0 text-[10px] font-extrabold text-amber-600 animate-pulse select-none">Aktif</span>
                  )}
                </div>
              );
            })}
          </div>

          <button 
            onClick={() => setPlantModalOpen(false)}
            className="w-full rounded-full bg-primary py-2.5 text-xs font-bold text-white shadow-soft transition-all duration-200 mt-2 hover:-translate-y-0.5 active:scale-95"
          >
            Tutup Library
          </button>
        </div>
      </ModalDialog>

      {/* ── STATS EXPLANATION DIALOG ───────────────────────────── */}
      <ModalDialog
        open={!!selectedStat}
        onClose={() => setSelectedStat(null)}
        title={selectedStat?.title}
      >
        {selectedStat && (
          <div className="space-y-4">
            <p className="text-sm text-stone-700 leading-relaxed font-medium">
              {selectedStat.desc}
            </p>
            <button 
              onClick={() => setSelectedStat(null)}
              className="w-full rounded-full bg-stone-100 py-2.5 text-xs font-bold text-stone-600 hover:bg-stone-200 transition-all duration-200"
            >
              Tutup Penjelasan
            </button>
          </div>
        )}
      </ModalDialog>

      {/* ── INSIGHT HISTORY DIALOG ────────────────────────────── */}
      <ModalDialog
        open={historyModalOpen}
        onClose={() => setHistoryModalOpen(false)}
        title="🕒 Riwayat Analisis Mingguan AI"
      >
        <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
          <p className="text-xs text-muted-foreground leading-normal">
            Berikut adalah catatan analisis mingguan AI Anda dari minggu-minggu sebelumnya untuk melacak progress Anda.
          </p>

          <div className="space-y-3.5">
            {insightHistory.map((item) => {
              const formattedDate = new Date(item.date).toLocaleDateString("id-ID", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric"
              });
              
              return (
                <div key={item.id} className="rounded-2xl border border-border bg-card p-4 relative overflow-hidden text-xs leading-relaxed text-stone-700">
                  <div className="flex items-center justify-between mb-2 pb-2 border-b border-border/40">
                    <span className="font-bold text-stone-500">{formattedDate}</span>
                    <div className="flex items-center gap-2.5">
                      <button
                        onClick={() => exportWeeklyInsightPDF(item.date, item.text)}
                        className="text-primary hover:underline text-[10px] font-bold"
                      >
                        Simpan PDF 📄
                      </button>
                      <button 
                        onClick={() => {
                          const updated = insightHistory.filter(x => x.id !== item.id);
                          setInsightHistory(updated);
                          localStorage.setItem(`bloom_weekly_insights_history_${user!.id}`, JSON.stringify(updated));
                          if (insight === item.text) {
                            setInsight(updated[0]?.text ?? null);
                            if (updated[0]?.text) {
                              localStorage.setItem(`bloom_weekly_insight_${user!.id}`, updated[0].text);
                            } else {
                              localStorage.removeItem(`bloom_weekly_insight_${user!.id}`);
                            }
                          }
                        }}
                        className="text-stone-400 hover:text-red-500 text-[10px] font-bold"
                        title="Hapus analisis ini"
                      >
                        Hapus
                      </button>
                    </div>
                  </div>
                  <p className="whitespace-pre-wrap select-text selection:bg-primary-soft">{item.text}</p>
                </div>
              );
            })}
          </div>

          <button 
            onClick={() => setHistoryModalOpen(false)}
            className="w-full rounded-full bg-stone-100 py-2.5 text-xs font-bold text-stone-600 hover:bg-stone-200 transition-all duration-200"
          >
            Tutup Riwayat
          </button>
        </div>
      </ModalDialog>
    </div>
  );
}


