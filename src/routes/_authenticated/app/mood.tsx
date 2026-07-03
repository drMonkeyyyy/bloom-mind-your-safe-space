import { createFileRoute, useSearch, Link } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { MOOD_OPTIONS, TRIGGER_OPTIONS } from "@/lib/companions";
import { toast } from "sonner";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { MoodSparkline } from "@/components/app/MoodSparkline";
import { EmptyState } from "@/components/app/EmptyState";
import { BottomSheet, ModalDialog } from "@/components/app/BottomSheet";
import { exportMoodPDF, exportMoodsReportPDF } from "@/lib/export-pdf";

const search = z.object({ pre: z.string().optional() });

export const Route = createFileRoute("/_authenticated/app/mood")({
  validateSearch: search,
  component: MoodPage,
});

/* ── Mood to ambient gradient mapping ─────────────────────────── */
const MOOD_GRADIENTS: Record<string, string> = {
  bahagia:  "linear-gradient(135deg, oklch(0.977 0.008 85) 0%, oklch(0.96 0.04 75) 40%, oklch(0.97 0.03 50) 100%)",
  tenang:   "linear-gradient(135deg, oklch(0.977 0.008 85) 0%, oklch(0.95 0.03 155) 40%, oklch(0.96 0.02 165) 100%)",
  sedih:    "linear-gradient(135deg, oklch(0.977 0.008 85) 0%, oklch(0.95 0.03 280) 40%, oklch(0.96 0.025 300) 100%)",
  marah:    "linear-gradient(135deg, oklch(0.977 0.008 85) 0%, oklch(0.95 0.04 25) 40%, oklch(0.97 0.03 35) 100%)",
  cemas:    "linear-gradient(135deg, oklch(0.977 0.008 85) 0%, oklch(0.95 0.03 230) 40%, oklch(0.96 0.025 250) 100%)",
  lelah:    "linear-gradient(135deg, oklch(0.977 0.008 85) 0%, oklch(0.95 0.02 260) 40%, oklch(0.96 0.015 280) 100%)",
  bingung:  "linear-gradient(135deg, oklch(0.977 0.008 85) 0%, oklch(0.95 0.025 185) 40%, oklch(0.96 0.02 200) 100%)",
  semangat: "linear-gradient(135deg, oklch(0.977 0.008 85) 0%, oklch(0.96 0.05 70) 40%, oklch(0.97 0.04 60) 100%)",
  syukur:   "linear-gradient(135deg, oklch(0.977 0.008 85) 0%, oklch(0.96 0.04 80) 40%, oklch(0.97 0.03 100) 100%)",
  takut:    "linear-gradient(135deg, oklch(0.977 0.008 85) 0%, oklch(0.95 0.03 240) 40%, oklch(0.96 0.025 260) 100%)",
};

interface SliderProps {
  label: string;
  value: number;
  onChange: (n: number) => void;
  color: string;
}

function MoodSlider({ label, value, onChange, color }: SliderProps) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm font-medium text-foreground">{label}</span>
        <span
          className="rounded-full px-2.5 py-0.5 text-xs font-bold text-white shadow-sm transition-all duration-300"
          style={{ background: color }}
        >
          {value}/10
        </span>
      </div>
      <div className="relative">
        <div
          className="absolute inset-y-0 left-0 rounded-l-full transition-all duration-400"
          style={{ width: `${value * 10}%`, background: `${color}28`, transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)" }}
        />
        <input
          type="range"
          min={1}
          max={10}
          value={value}
          onChange={(e) => onChange(parseInt(e.target.value))}
          className="relative w-full"
          aria-label={`${label}: ${value} dari 10`}
          style={{ accentColor: color }}
        />
      </div>
    </div>
  );
}

function MoodPage() {
  const { pre } = useSearch({ from: "/_authenticated/app/mood" });
  const { user } = useAuth();
  const qc = useQueryClient();
  const [mood, setMood] = useState<string>(pre ?? "tenang");
  const [moodScore, setMoodScore] = useState(7);
  const [stress, setStress] = useState(4);
  const [energy, setEnergy] = useState(6);
  const [triggers, setTriggers] = useState<string[]>([]);
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [sparkleId, setSparkleId] = useState<string | null>(null);
  const [selectedCheckIn, setSelectedCheckIn] = useState<any | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [cleanupModalOpen, setCleanupModalOpen] = useState(false);
  const [cleaning, setCleaning] = useState(false);

  const sixMonthsAgo = new Date(Date.now() - 180 * 24 * 60 * 60 * 1000);

  const { data: oldMoodsCount, refetch: refetchOldMoodsCount } = useQuery({
    queryKey: ["old-moods-count", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { count } = await supabase
        .from("mood_checkins")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user!.id)
        .lt("created_at", sixMonthsAgo.toISOString());
      return count ?? 0;
    }
  });

  const clearOldMoods = async (exportFormat: 'pdf' | 'json' | 'none') => {
    if (!user) return;
    setCleaning(true);
    try {
      const threeMonthsCutoff = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
      const { data: oldMoods } = await supabase
        .from("mood_checkins")
        .select("*")
        .eq("user_id", user.id)
        .lt("created_at", threeMonthsCutoff.toISOString())
        .order("created_at", { ascending: true });

      if (oldMoods && oldMoods.length > 0) {
        if (exportFormat === 'pdf') {
          exportMoodsReportPDF(oldMoods);
        } else if (exportFormat === 'json') {
          const exportData = {
            title: "Bloom Mind - Riwayat Mood",
            export_date: new Date().toISOString(),
            data: oldMoods
          };
          const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `moods_history_${new Date().toISOString().slice(0, 10)}.json`;
          a.click();
          URL.revokeObjectURL(url);
        }
      }

      const { error } = await supabase
        .from("mood_checkins")
        .delete()
        .eq("user_id", user.id)
        .lt("created_at", threeMonthsCutoff.toISOString());

      if (error) throw error;
      toast.success("Catatan mood lama berhasil dibersihkan! 🌿");
      setCleanupModalOpen(false);
      qc.invalidateQueries({ queryKey: ["mood-list", user.id] });
      refetchOldMoodsCount();
    } catch (err: any) {
      toast.error(err.message || "Gagal membersihkan catatan mood");
    } finally {
      setCleaning(false);
    }
  };

  const removeCheckIn = async (id: string) => {
    if (!user) return;
    const { error } = await supabase.from("mood_checkins").delete().eq("id", id);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Catatan mood berhasil dihapus 🌿");
      setSelectedCheckIn(null);
      setDeleteConfirmId(null);
      qc.invalidateQueries({ queryKey: ["mood-list", user.id] });
      qc.invalidateQueries({ queryKey: ["moods-week", user.id] });
    }
  };

  const { data: list } = useQuery({
    queryKey: ["mood-list", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.from("mood_checkins").select("*").eq("user_id", user!.id).order("created_at", { ascending: false }).limit(14);
      return data ?? [];
    },
  });

  const toggleT = (t: string) => setTriggers((p) => p.includes(t) ? p.filter(x => x !== t) : [...p, t]);

  const selectMood = (key: string) => {
    setMood(key);
    setSparkleId(key);
    setTimeout(() => setSparkleId(null), 600);
  };

  const save = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from("mood_checkins").insert({
      user_id: user.id,
      mood: mood as "bahagia",
      mood_score: moodScore, stress_score: stress, energy_score: energy,
      triggers, note: note || null,
    });
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    setSaved(true);
    toast.success("Mood tercatat 🌿");
    setNote(""); setTriggers([]);
    setTimeout(() => setSaved(false), 2000);
    qc.invalidateQueries({ queryKey: ["mood-list", user.id] });
    qc.invalidateQueries({ queryKey: ["moods-week", user.id] });
  };

  const chartData = (list ?? []).slice(0, 14).reverse().map((m) => ({ value: m.mood_score, date: m.date }));
  const currentGradient = MOOD_GRADIENTS[mood] ?? MOOD_GRADIENTS["tenang"];

  return (
    <div className="space-y-6">
      {/* Page header with ambient background */}
      <div
        className="relative overflow-hidden rounded-3xl px-6 pt-6 pb-5"
        style={{
          background: currentGradient,
          backgroundSize: "300% 300%",
          animation: "gradient-shift 15s ease-in-out infinite",
          transition: "background 800ms cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      >
        {/* Decorative blob */}
        <div
          className="absolute -right-8 -top-8 h-36 w-36 rounded-full pointer-events-none"
          style={{ background: "oklch(0.71 0.045 160 / 0.15)", filter: "blur(35px)", animation: "blob-drift 18s ease-in-out infinite" }}
        />
        <div className="relative">
          <h1 className="font-display text-3xl font-semibold">Bagaimana perasaanmu?</h1>
          <p className="mt-1 text-sm text-muted-foreground">Pilih yang paling mendekati kondisimu sekarang</p>
        </div>
      </div>

      {/* ── CHECK-IN CARD ──────────────────────────────────────── */}
      <section className="rounded-3xl bg-card p-6 ring-1 ring-border/60 shadow-card space-y-6">
        {/* Mood grid */}
        <div>
          <p className="mb-3 text-sm font-semibold text-foreground">Pilih mood</p>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
            {MOOD_OPTIONS.map((m) => {
              const selected = mood === m.key;
              const sparkling = sparkleId === m.key;
              return (
                <button
                  key={m.key}
                  onClick={() => selectMood(m.key)}
                  className={`relative flex flex-col items-center gap-1.5 rounded-2xl border-2 px-2 py-3 text-center transition-all duration-250 ${
                    selected
                      ? "border-primary bg-primary-soft shadow-soft scale-105"
                      : "border-transparent bg-cream-deep hover:bg-primary-soft/50 hover:scale-102 hover:border-primary/20"
                  }`}
                  aria-pressed={selected}
                  aria-label={m.label}
                >
                  <span
                    className="text-2xl leading-none transition-transform duration-250"
                    style={{
                      display: "inline-block",
                      transform: selected ? "scale(1.15) translateY(-2px)" : "scale(1)",
                    }}
                  >
                    {m.emoji}
                  </span>
                  <span className={`text-[11px] font-medium ${selected ? "text-foreground" : "text-muted-foreground"}`}>
                    {m.label}
                  </span>
                  {/* Sparkle on select */}
                  {sparkling && (
                    <span
                      className="absolute inset-0 rounded-2xl pointer-events-none"
                      style={{
                        background: "radial-gradient(circle, oklch(0.71 0.045 160 / 0.3) 0%, transparent 70%)",
                        animation: "ripple-out 0.6s ease-out both",
                      }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Sliders */}
        <div className="space-y-4">
          <MoodSlider label="Tingkat Mood" value={moodScore} onChange={setMoodScore} color="var(--color-primary)" />
          <MoodSlider label="Tingkat Stres" value={stress} onChange={setStress} color="oklch(0.75 0.08 20)" />
          <MoodSlider label="Tingkat Energi" value={energy} onChange={setEnergy} color="oklch(0.70 0.08 200)" />
        </div>

        {/* Triggers */}
        <div>
          <p className="mb-2.5 text-sm font-semibold">Apa yang mempengaruhi harimu?</p>
          <div className="flex flex-wrap gap-2">
            {TRIGGER_OPTIONS.map((t) => {
              const active = triggers.includes(t);
              return (
                <button
                  key={t}
                  onClick={() => toggleT(t)}
                  aria-pressed={active}
                  className={`rounded-full border px-3.5 py-1.5 text-xs font-medium transition-all duration-200 ${
                    active
                      ? "border-primary bg-primary-soft text-foreground shadow-sm scale-105"
                      : "border-border bg-background text-muted-foreground hover:border-primary/40 hover:bg-primary-soft/30 hover:scale-102"
                  }`}
                >
                  {active && "✓ "}{t}
                </button>
              );
            })}
          </div>
        </div>

        {/* Note */}
        <div>
          <label className="mb-1.5 block text-sm font-semibold" htmlFor="mood-note">
            Catatan (opsional)
          </label>
          <textarea
            id="mood-note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Ceritakan sedikit tentang harimu…"
            rows={3}
            className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm resize-none placeholder:text-muted-foreground/60 transition-all duration-200"
          />
        </div>

        {/* Save button */}
        <button
          onClick={save}
          disabled={saving}
          className={`relative w-full overflow-hidden rounded-full py-3.5 text-sm font-semibold transition-all duration-300 disabled:opacity-60 btn-spring ${
            saved
              ? "bg-primary text-primary-foreground shadow-soft"
              : "bg-accent text-accent-foreground shadow-peach"
          }`}
        >
          {/* Ripple effect on saved */}
          {saved && (
            <span
              className="absolute inset-0 rounded-full pointer-events-none"
              style={{
                background: "radial-gradient(circle, rgba(255,255,255,0.3) 0%, transparent 70%)",
                animation: "ripple-out 0.6s ease-out both",
              }}
            />
          )}
          <span className="relative">
            {saved ? (
              <span className="animate-bounce-check inline-flex items-center gap-2">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden="true">
                  <path d="m5 12 4 4 10-10" />
                </svg>
                Mood tersimpan! 🌿
              </span>
            ) : saving ? (
              "Menyimpan…"
            ) : (
              "Simpan mood hari ini"
            )}
          </span>
        </button>
      </section>

      {/* ── HISTORY ─────────────────────────────────────────────── */}
      <section>
        {oldMoodsCount && oldMoodsCount > 0 ? (
          <div className="flex items-center justify-between gap-3 rounded-2xl bg-amber-50/70 border border-amber-100/50 p-3.5 text-xs text-amber-900 animate-slide-up mb-4">
            <div className="flex items-center gap-2">
              <span className="text-base select-none">⏳</span>
              <p className="leading-relaxed">
                Terdapat catatan mood yang sudah berjalan lebih dari 6 bulan. Bersihkan riwayat lama di atas 3 bulan untuk menghemat ruang?
              </p>
            </div>
            <button
              onClick={() => setCleanupModalOpen(true)}
              className="shrink-0 rounded-full bg-amber-600 hover:bg-amber-700 px-3 py-1.5 font-bold text-white transition-all active:scale-95 shadow-sm"
            >
              Bersihkan 🧹
            </button>
          </div>
        ) : null}

        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-xl font-semibold">Riwayat 14 Hari</h2>
          {chartData.length > 1 && (
            <div className="w-28 h-8">
              <MoodSparkline data={chartData} height={32} showDots={false} />
            </div>
          )}
        </div>

        <div className="space-y-2">
          {list?.length === 0 && (
            <EmptyState
              emoji="🌤️"
              title="Belum ada catatan mood"
              description="Mulai rekam perasaanmu setiap hari untuk melihat polamu."
            />
          )}
          {list?.map((m, idx) => {
            const emoji = MOOD_OPTIONS.find(x => x.key === m.mood)?.emoji ?? "🌿";
            return (
              <div
                key={m.id}
                onClick={() => setSelectedCheckIn(m)}
                className="flex items-center gap-4 rounded-2xl bg-card p-4 ring-1 ring-border/60 transition-all duration-200 hover:shadow-card hover:-translate-y-0.5 card-lift animate-slide-up cursor-pointer hover:bg-primary-soft/30"
                style={{ animationDelay: `${idx * 40}ms` }}
              >
                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-primary-soft/50 text-2xl shadow-sm">
                  {emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold capitalize text-foreground">{m.mood}</p>
                    <span className="rounded-full bg-primary-soft px-2 py-0.5 text-[10px] font-medium">
                      {m.mood_score}/10
                    </span>
                  </div>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">
                    {new Date(m.created_at).toLocaleString("id-ID", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                    {" · "}Stres {m.stress_score} · Energi {m.energy_score}
                  </p>
                  {m.note && (
                    <p className="mt-1 truncate text-xs text-muted-foreground">{m.note}</p>
                  )}
                  {m.triggers && m.triggers.length > 0 && (
                    <div className="mt-1.5 flex flex-wrap gap-1">
                      {m.triggers.map((t: string) => (
                        <span
                          key={t}
                          className="rounded-full bg-cream-deep px-2 py-0.5 text-[9px] font-bold text-stone-500 border border-stone-200/40"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                {/* Mini bars */}
                <div className="hidden shrink-0 items-end gap-0.5 sm:flex" style={{ height: 28 }}>
                  {[m.mood_score, m.energy_score, 10 - m.stress_score].map((v, i) => (
                    <div
                      key={i}
                      className="w-2 rounded-t-sm transition-all duration-500"
                      style={{
                        height: `${Math.max(15, v * 10)}%`,
                        background: i === 0 ? "var(--color-primary)" : i === 1 ? "oklch(0.70 0.08 200)" : "oklch(0.77 0.085 40)",
                        opacity: 0.75,
                      }}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── DETAIL CHECK-IN DIALOG ───────────────────────────── */}
      <ModalDialog
        open={!!selectedCheckIn}
        onClose={() => setSelectedCheckIn(null)}
        title="🌿 Detail Catatan Mood"
      >
        {selectedCheckIn && (() => {
          const checkInEmoji = MOOD_OPTIONS.find(x => x.key === selectedCheckIn.mood)?.emoji ?? "🌿";
          const checkInLabel = MOOD_OPTIONS.find(x => x.key === selectedCheckIn.mood)?.label ?? selectedCheckIn.mood;
          const formattedCheckInDate = new Date(selectedCheckIn.created_at).toLocaleString("id-ID", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
          });

          return (
            <div className="space-y-5">
              {/* Header Info */}
              <div className="flex items-center gap-4 bg-primary-soft/40 p-4 rounded-2xl border border-primary/10">
                <div className="text-4xl bg-white p-3 rounded-2xl shadow-sm leading-none shrink-0">
                  {checkInEmoji}
                </div>
                <div>
                  <h3 className="font-display text-lg font-bold capitalize text-foreground">{checkInLabel}</h3>
                  <p className="text-[11px] text-muted-foreground">{formattedCheckInDate}</p>
                </div>
              </div>

              {/* Metrics */}
              <div className="space-y-3 bg-cream-deep/20 p-4 rounded-2xl border border-border/40">
                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span>Tingkat Mood</span>
                    <span className="text-primary font-bold">{selectedCheckIn.mood_score}/10</span>
                  </div>
                  <div className="h-2 w-full bg-stone-100 rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full" style={{ width: `${selectedCheckIn.mood_score * 10}%` }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span>Tingkat Stres</span>
                    <span className="text-red-500 font-bold">{selectedCheckIn.stress_score}/10</span>
                  </div>
                  <div className="h-2 w-full bg-stone-100 rounded-full overflow-hidden">
                    <div className="h-full bg-red-400 rounded-full" style={{ width: `${selectedCheckIn.stress_score * 10}%` }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span>Tingkat Energi</span>
                    <span className="text-blue-500 font-bold">{selectedCheckIn.energy_score}/10</span>
                  </div>
                  <div className="h-2 w-full bg-stone-100 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-400 rounded-full" style={{ width: `${selectedCheckIn.energy_score * 10}%` }} />
                  </div>
                </div>
              </div>

              {/* Triggers */}
              <div>
                <p className="mb-2 text-xs font-bold text-stone-500 uppercase tracking-wider">Faktor yang mempengaruhi</p>
                {selectedCheckIn.triggers && selectedCheckIn.triggers.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {selectedCheckIn.triggers.map((t: string) => (
                      <span key={t} className="rounded-full bg-primary-soft text-foreground border border-primary/10 px-3 py-1 text-xs font-medium">
                        {t}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground italic">Tidak ada pemicu yang dicatat.</p>
                )}
              </div>

              {/* Note */}
              <div>
                <p className="mb-2 text-xs font-bold text-stone-500 uppercase tracking-wider">Catatan Harian</p>
                {selectedCheckIn.note ? (
                  <div className="rounded-2xl bg-cream-deep/40 p-4 border border-stone-200/40 relative overflow-hidden font-display text-sm italic text-stone-700 whitespace-pre-wrap leading-relaxed">
                    <div className="absolute left-3 top-0 bottom-0 w-[1px] bg-red-300/40" />
                    <div className="pl-4">
                      "{selectedCheckIn.note}"
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground italic">Tidak ada catatan untuk hari ini.</p>
                )}
              </div>

              {/* AI Healing & Insights recommendations */}
              {selectedCheckIn.stress_score >= 7 && (
                <div className="rounded-2xl bg-rose-50 border border-rose-100 p-4 flex gap-3 text-rose-950 shadow-sm animate-pulse-subtle">
                  <span className="text-2xl select-none">💆‍♀️</span>
                  <div className="text-xs leading-relaxed">
                    <p className="font-bold text-rose-900 mb-0.5">Tingkat Stresmu Cukup Tinggi</p>
                    <p>Coba luangkan waktu sejenak untuk menenangkan pikiran. Kamu bisa mencoba bernapas perlahan di halaman <Link to="/app/calm" className="font-bold underline hover:text-rose-800">Emergency Calm</Link> atau bagikan perasaanmu dengan Companion-mu di <Link to="/app/chat" className="font-bold underline hover:text-rose-800">Chat AI</Link>.</p>
                  </div>
                </div>
              )}

              {(selectedCheckIn.mood === "sedih" || selectedCheckIn.mood === "cemas" || selectedCheckIn.mood === "kesepian") && selectedCheckIn.stress_score < 7 && (
                <div className="rounded-2xl bg-amber-50 border border-amber-100 p-4 flex gap-3 text-amber-950 shadow-sm">
                  <span className="text-2xl select-none">🤗</span>
                  <div className="text-xs leading-relaxed">
                    <p className="font-bold text-amber-900 mb-0.5">Kami Ada di Sini untuk Mendengar</p>
                    <p>Ingatlah bahwa kamu tidak sendirian. Jika kamu butuh teman cerita yang aman dan tanpa penghakiman, Companion virtualmu di <Link to="/app/chat" className="font-bold underline hover:text-amber-800">Chat AI</Link> selalu siap mendengarkan.</p>
                  </div>
                </div>
              )}

              {(selectedCheckIn.mood === "bahagia" || selectedCheckIn.mood === "tenang") && selectedCheckIn.mood_score >= 8 && (
                <div className="rounded-2xl bg-emerald-50 border border-emerald-100 p-4 flex gap-3 text-emerald-950 shadow-sm">
                  <span className="text-2xl select-none">✨</span>
                  <div className="text-xs leading-relaxed">
                    <p className="font-bold text-emerald-900 mb-0.5">Pertahankan Energi Positif Ini!</p>
                    <p>Hari yang indah! Catat apa saja yang membuatmu bersyukur hari ini dalam <Link to="/app/gratitude" className="font-bold underline hover:text-emerald-800">Gratitude Journal</Link> untuk menjaga kebahagiaanmu tetap menyala.</p>
                  </div>
                </div>
              )}

              {/* Footer Actions */}
              <div className="flex gap-3 pt-2 border-t border-border/40">
                <button
                  onClick={() => setDeleteConfirmId(selectedCheckIn.id)}
                  className="flex-1 rounded-full border border-destructive/20 hover:bg-destructive/5 py-3 text-[10px] sm:text-xs font-bold text-destructive transition-all duration-200 active:scale-95"
                >
                  Hapus Catatan 🗑️
                </button>
                <button
                  onClick={() => exportMoodPDF(selectedCheckIn)}
                  className="flex-1 rounded-full border border-primary/20 bg-primary-soft/60 hover:bg-primary-soft py-3 text-[10px] sm:text-xs font-bold text-primary transition-all duration-200 active:scale-95"
                >
                  Simpan PDF 📄
                </button>
                <button
                  onClick={() => setSelectedCheckIn(null)}
                  className="flex-1 rounded-full border border-stone-200 bg-stone-50 hover:bg-stone-100 py-3 text-[10px] sm:text-xs font-bold text-stone-600 transition-all duration-200"
                >
                  Tutup
                </button>
              </div>
            </div>
          );
        })()}
      </ModalDialog>

      {/* ── DELETE CONFIRMATION DIALOG ─────────────────────────── */}
      <ModalDialog
        open={!!deleteConfirmId}
        onClose={() => setDeleteConfirmId(null)}
        title="Hapus Catatan Mood?"
      >
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground leading-normal">
            Catatan mood ini akan terhapus secara permanen dari riwayatmu dan tidak dapat dikembalikan.
          </p>
          <p className="text-[10px] text-amber-700 bg-amber-50 border border-amber-100/60 rounded-xl p-2.5 font-medium leading-relaxed">
            💡 <strong>Tips:</strong> Anda dapat mendownload lembaran ini sebagai PDF terlebih dahulu di detail catatan sebelum menghapusnya secara permanen.
          </p>
        </div>
        <div className="mt-5 flex gap-2">
          <button
            onClick={() => deleteConfirmId && removeCheckIn(deleteConfirmId)}
            className="flex-1 rounded-full bg-destructive py-2.5 text-xs font-bold text-white transition-all duration-200 hover:opacity-90"
          >
            Ya, Hapus Permanen
          </button>
          <button
            onClick={() => setDeleteConfirmId(null)}
            className="flex-1 rounded-full border border-border py-2.5 text-xs font-bold hover:bg-cream-deep transition-all duration-200"
          >
            Batal
          </button>
        </div>
      </ModalDialog>

      {/* ── CLEANUP CONFIRMATION DIALOG ─────────────────────────── */}
      <ModalDialog
        open={cleanupModalOpen}
        onClose={() => setCleanupModalOpen(false)}
        title="🧹 Bersihkan Catatan Mood Lama?"
      >
        <div className="space-y-4">
          <p className="text-xs text-muted-foreground leading-normal">
            Catatan mood yang lebih lama dari 3 bulan (90 hari) akan dihapus secara permanen dari database. Catatan 3 bulan terakhir tetap disimpan di aplikasi.
          </p>
          <div className="rounded-2xl bg-amber-50 border border-amber-100 p-3.5 flex gap-3 text-amber-950">
            <span className="text-2xl select-none">💡</span>
            <div className="text-xs leading-relaxed">
              <p className="font-bold text-amber-900 mb-0.5 font-display">Saran Penyimpanan</p>
              <p>Apakah Anda ingin menyimpan seluruh catatan mood yang akan dihapus (di atas 3 bulan) sebagai **PDF** atau mendownload file **JSON** di laptop Anda sebelum dihapus?</p>
            </div>
          </div>
          <div className="mt-5 flex flex-col gap-2 pt-3 border-t border-border/40">
            <button
              disabled={cleaning}
              onClick={() => clearOldMoods('pdf')}
              className="w-full rounded-full bg-primary py-3 text-xs font-bold text-white transition-all duration-200 active:scale-95 shadow-soft flex items-center justify-center gap-1.5"
            >
              📄 Simpan Laporan PDF & Bersihkan
            </button>
            <button
              disabled={cleaning}
              onClick={() => clearOldMoods('json')}
              className="w-full rounded-full border border-primary/20 bg-primary-soft/60 hover:bg-primary-soft py-3 text-xs font-bold text-primary transition-all duration-200 active:scale-95 flex items-center justify-center gap-1.5"
            >
              💻 Download JSON ke Laptop & Bersihkan
            </button>
            <button
              disabled={cleaning}
              onClick={() => clearOldMoods('none')}
              className="w-full rounded-full border border-destructive/20 hover:bg-destructive/5 py-3 text-xs font-bold text-destructive transition-all duration-200 active:scale-95"
            >
              Hapus Langsung Tanpa Menyimpan 🗑️
            </button>
            <button
              disabled={cleaning}
              onClick={() => setCleanupModalOpen(false)}
              className="w-full rounded-full border border-stone-200 bg-stone-50 hover:bg-stone-100 py-3 text-xs font-bold text-stone-600 transition-all duration-200"
            >
              Batal
            </button>
          </div>
        </div>
      </ModalDialog>
    </div>
  );
}

