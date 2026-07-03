import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { COMPANIONS, COMM_STYLES, GOAL_OPTIONS, type CompanionKey } from "@/lib/companions";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

export const Route = createFileRoute("/_authenticated/app/onboarding")({
  component: Onboarding,
});

const STEPS = ["Kenalan", "Tujuan", "Pendamping", "Gaya"];

const GOAL_EMOJIS: Record<string, string> = {
  "Mengelola stres": "😮‍💨",
  "Mengurangi overthinking": "💭",
  "Emotional eating": "🍎",
  "Membangun habit sehat": "✅",
  "Journaling": "📓",
  "Merasa kesepian": "🫂",
  "Self-growth": "🌱",
};

function Onboarding() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [goals, setGoals] = useState<string[]>([]);
  const [companion, setCompanion] = useState<CompanionKey>("sahabat");
  const [style, setStyle] = useState<typeof COMM_STYLES[number]["key"]>("supportive");
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  const toggle = (g: string) => setGoals((p) => p.includes(g) ? p.filter(x => x !== g) : [...p, g]);

  const finish = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from("profiles").update({
      name: name || null,
      age: age ? parseInt(age) : null,
      goals,
      selected_companion: companion,
      communication_style: style,
      onboarding_completed: true,
    }).eq("id", user.id);
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    setDone(true);
    qc.invalidateQueries({ queryKey: ["profile", user.id] });
    setTimeout(() => navigate({ to: "/app" }), 2000);
  };

  const canNext = step === 0 ? name.trim().length > 0 : step === 1 ? goals.length > 0 : true;

  if (done) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center text-center animate-scale-in">
        <div className="text-6xl mb-4">🌸</div>
        <h1 className="font-display text-3xl font-semibold text-foreground">Selamat datang, {name}!</h1>
        <p className="mt-3 text-muted-foreground">JN-CALM siap menemanimu bertumbuh.</p>
        <div className="mt-6 flex justify-center gap-1">
          {[..."✨🌿💛"].map((e, i) => (
            <span key={i} className="animate-float text-2xl" style={{ animationDelay: `${i * 0.3}s` }}>{e}</span>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl">
      {/* ── STEP INDICATOR ────────────────────────────────────────── */}
      <div className="mb-8">
        <div className="flex items-center gap-0">
          {STEPS.map((s, i) => (
            <div key={s} className="flex flex-1 items-center">
              <div className="flex flex-col items-center">
                <div
                  className={`grid h-8 w-8 place-items-center rounded-full text-xs font-bold transition-all duration-300 ${
                    i < step ? "bg-primary text-primary-foreground" :
                    i === step ? "bg-accent text-accent-foreground scale-110" :
                    "bg-cream-deep text-muted-foreground"
                  }`}
                >
                  {i < step ? (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="h-4 w-4" aria-hidden="true">
                      <path d="m5 12 4 4 10-10" />
                    </svg>
                  ) : i + 1}
                </div>
                <span className={`mt-1 text-[10px] font-medium ${i === step ? "text-foreground" : "text-muted-foreground"}`}>{s}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`mx-2 mb-4 h-0.5 flex-1 rounded-full transition-all duration-500 ${i < step ? "bg-primary" : "bg-border"}`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ── STEP 0: NAME ──────────────────────────────────────────── */}
      {step === 0 && (
        <section className="animate-slide-in-right space-y-6">
          <div className="text-center">
            <div className="text-5xl mb-4">👋</div>
            <h1 className="font-display text-3xl font-semibold">Halo! Boleh kenalan dulu?</h1>
            <p className="mt-2 text-sm text-muted-foreground">Kami ingin mengenalmu lebih dekat untuk memberikan pengalaman terbaik.</p>
          </div>
          <div className="space-y-3">
            <div>
              <label className="mb-1.5 block text-sm font-semibold" htmlFor="ob-name">Nama panggilan *</label>
              <input
                id="ob-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Panggil aku…"
                className="w-full rounded-2xl border border-border bg-background px-4 py-3.5 text-sm"
                autoFocus
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-semibold" htmlFor="ob-age">Usia (opsional)</label>
              <input
                id="ob-age"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                type="number"
                placeholder="Berapa tahun?"
                className="w-full rounded-2xl border border-border bg-background px-4 py-3.5 text-sm"
              />
            </div>
          </div>
        </section>
      )}

      {/* ── STEP 1: GOALS ─────────────────────────────────────────── */}
      {step === 1 && (
        <section className="animate-slide-in-right space-y-5">
          <div className="text-center">
            <div className="text-5xl mb-4">🎯</div>
            <h1 className="font-display text-3xl font-semibold">Apa yang ingin kamu fokuskan?</h1>
            <p className="mt-2 text-sm text-muted-foreground">Pilih satu atau beberapa yang paling relevan.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {GOAL_OPTIONS.map((g) => {
              const sel = goals.includes(g);
              return (
                <button
                  key={g}
                  onClick={() => toggle(g)}
                  aria-pressed={sel}
                  className={`flex items-center gap-2 rounded-full border-2 px-4 py-2.5 text-sm font-medium transition-all duration-200 ${
                    sel ? "border-primary bg-primary-soft text-foreground scale-105" : "border-border bg-card text-muted-foreground hover:border-primary/50"
                  }`}
                >
                  <span>{GOAL_EMOJIS[g] ?? "✨"}</span> {g}
                </button>
              );
            })}
          </div>
        </section>
      )}

      {/* ── STEP 2: COMPANION ─────────────────────────────────────── */}
      {step === 2 && (
        <section className="animate-slide-in-right space-y-5">
          <div className="text-center">
            <div className="text-5xl mb-4">🤝</div>
            <h1 className="font-display text-3xl font-semibold">Pilih pendamping defaultmu</h1>
            <p className="mt-2 text-sm text-muted-foreground">Kamu bisa berganti kapan saja di pengaturan profil.</p>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {COMPANIONS.map((c) => {
              const sel = companion === c.key;
              return (
                <button
                  key={c.key}
                  onClick={() => setCompanion(c.key)}
                  aria-pressed={sel}
                  className={`relative flex flex-col items-center gap-2 rounded-2xl border-2 p-4 text-center transition-all duration-200 ${
                    sel ? "border-primary bg-primary-soft shadow-soft scale-105" : "border-border bg-card hover:border-primary/30"
                  }`}
                >
                  {c.premium && (
                    <span className="absolute -right-1 -top-1 rounded-full bg-amber-400 px-1.5 py-0.5 text-[9px] font-bold text-white">PRO</span>
                  )}
                  <span className="text-3xl leading-none">{c.emoji}</span>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{c.name}</p>
                    <p className="mt-0.5 text-[10px] text-muted-foreground">{c.tone}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </section>
      )}

      {/* ── STEP 3: STYLE ─────────────────────────────────────────── */}
      {step === 3 && (
        <section className="animate-slide-in-right space-y-5">
          <div className="text-center">
            <div className="text-5xl mb-4">💬</div>
            <h1 className="font-display text-3xl font-semibold">Gaya komunikasi favoritmu?</h1>
            <p className="mt-2 text-sm text-muted-foreground">Ini membantu AI berbicara dengan caramu.</p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {COMM_STYLES.map((s) => {
              const sel = style === s.key;
              return (
                <button
                  key={s.key}
                  onClick={() => setStyle(s.key)}
                  aria-pressed={sel}
                  className={`rounded-2xl border-2 py-4 text-sm font-semibold transition-all duration-200 ${
                    sel ? "border-primary bg-primary-soft text-foreground scale-105" : "border-border bg-card text-muted-foreground hover:border-primary/30"
                  }`}
                >
                  {s.label}
                </button>
              );
            })}
          </div>
        </section>
      )}

      {/* ── NAVIGATION ────────────────────────────────────────────── */}
      <div className="mt-8 flex items-center gap-3">
        {step > 0 && (
          <button
            onClick={() => setStep(s => s - 1)}
            className="rounded-full border border-border px-5 py-3 text-sm font-medium hover:bg-cream-deep"
          >
            ← Kembali
          </button>
        )}
        {step < 3 ? (
          <button
            onClick={() => setStep(s => s + 1)}
            disabled={!canNext}
            className="ml-auto rounded-full bg-foreground px-8 py-3 text-sm font-semibold text-cream transition-all hover:-translate-y-0.5 disabled:opacity-40"
          >
            Lanjut →
          </button>
        ) : (
          <button
            onClick={finish}
            disabled={saving}
            className="ml-auto rounded-full bg-accent px-8 py-3 text-sm font-semibold text-accent-foreground shadow-peach transition-all hover:-translate-y-0.5 disabled:opacity-60"
          >
            {saving ? "Menyimpan…" : "Selesai & Mulai 🌿"}
          </button>
        )}
      </div>
    </div>
  );
}
