import { createFileRoute, useSearch } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { MOOD_OPTIONS, TRIGGER_OPTIONS } from "@/lib/companions";
import { toast } from "sonner";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { MoodSparkline } from "@/components/app/MoodSparkline";
import { EmptyState } from "@/components/app/EmptyState";

const search = z.object({ pre: z.string().optional() });

export const Route = createFileRoute("/_authenticated/app/mood")({
  validateSearch: search,
  component: MoodPage,
});

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
          className="rounded-full px-2.5 py-0.5 text-xs font-bold text-white"
          style={{ background: color }}
        >
          {value}/10
        </span>
      </div>
      <div className="relative">
        <div
          className="absolute inset-y-0 left-0 rounded-l-full transition-all duration-300"
          style={{ width: `${value * 10}%`, background: `${color}30` }}
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

  const { data: list } = useQuery({
    queryKey: ["mood-list", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.from("mood_checkins").select("*").eq("user_id", user!.id).order("created_at", { ascending: false }).limit(14);
      return data ?? [];
    },
  });

  const toggleT = (t: string) => setTriggers((p) => p.includes(t) ? p.filter(x => x !== t) : [...p, t]);

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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-semibold">Bagaimana perasaanmu?</h1>
        <p className="mt-1 text-sm text-muted-foreground">Pilih yang paling mendekati kondisimu sekarang</p>
      </div>

      {/* ── CHECK-IN CARD ──────────────────────────────────────── */}
      <section className="rounded-3xl bg-card p-6 ring-1 ring-border space-y-6">
        {/* Mood grid */}
        <div>
          <p className="mb-3 text-sm font-semibold text-foreground">Pilih mood</p>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
            {MOOD_OPTIONS.map((m) => {
              const selected = mood === m.key;
              return (
                <button
                  key={m.key}
                  onClick={() => setMood(m.key)}
                  className={`flex flex-col items-center gap-1.5 rounded-2xl border-2 px-2 py-3 text-center transition-all duration-200 ${
                    selected
                      ? "border-primary bg-primary-soft shadow-soft scale-105"
                      : "border-transparent bg-cream-deep hover:bg-primary-soft/50 hover:scale-102"
                  }`}
                  aria-pressed={selected}
                  aria-label={m.label}
                >
                  <span className="text-2xl leading-none">{m.emoji}</span>
                  <span className={`text-[11px] font-medium ${selected ? "text-foreground" : "text-muted-foreground"}`}>
                    {m.label}
                  </span>
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
                  className={`rounded-full border px-3.5 py-1.5 text-xs font-medium transition-all duration-150 ${
                    active
                      ? "border-primary bg-primary-soft text-foreground"
                      : "border-border bg-background text-muted-foreground hover:border-primary-soft"
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
            className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm resize-none placeholder:text-muted-foreground/60"
          />
        </div>

        {/* Save button */}
        <button
          onClick={save}
          disabled={saving}
          className={`relative w-full overflow-hidden rounded-full py-3.5 text-sm font-semibold transition-all duration-300 disabled:opacity-60 ${
            saved
              ? "bg-primary text-primary-foreground"
              : "bg-accent text-accent-foreground shadow-peach hover:-translate-y-0.5"
          }`}
        >
          {saved ? (
            <span className="animate-bounce-check inline-flex items-center gap-2">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden="true">
                <path d="m5 12 4 4 10-10" />
              </svg>
              Mood tersimpan!
            </span>
          ) : saving ? (
            "Menyimpan…"
          ) : (
            "Simpan mood hari ini"
          )}
        </button>
      </section>

      {/* ── HISTORY ─────────────────────────────────────────────── */}
      <section>
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
          {list?.map((m) => {
            const emoji = MOOD_OPTIONS.find(x => x.key === m.mood)?.emoji ?? "🌿";
            return (
              <div
                key={m.id}
                className="flex items-center gap-4 rounded-2xl bg-card p-4 ring-1 ring-border transition-all duration-150 hover:shadow-card"
              >
                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-cream-deep text-2xl">
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
                </div>
                {/* Mini bars */}
                <div className="hidden shrink-0 items-end gap-0.5 sm:flex" style={{ height: 28 }}>
                  {[m.mood_score, m.energy_score, 10 - m.stress_score].map((v, i) => (
                    <div
                      key={i}
                      className="w-2 rounded-t-sm"
                      style={{
                        height: `${Math.max(15, v * 10)}%`,
                        background: i === 0 ? "var(--color-primary)" : i === 1 ? "oklch(0.70 0.08 200)" : "oklch(0.77 0.085 40)",
                        opacity: 0.7,
                      }}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
