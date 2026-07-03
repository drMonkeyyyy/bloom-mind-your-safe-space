import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { analyzeEmotionalEating } from "@/lib/chat.functions";
import { toast } from "sonner";

const HUNGER = [
  { key: "lapar_fisik" as const, label: "Lapar Fisik", icon: "🍽️", desc: "Perut kosong, butuh energi" },
  { key: "lapar_emosional" as const, label: "Lapar Emosional", icon: "💔", desc: "Makan karena perasaan" },
  { key: "craving" as const, label: "Craving", icon: "🍫", desc: "Ingin sesuatu yang spesifik" },
  { key: "stress_eating" as const, label: "Stress Eating", icon: "😰", desc: "Makan karena tekanan" },
  { key: "mindless_eating" as const, label: "Mindless Eating", icon: "📱", desc: "Makan tanpa sadar" },
];

export const Route = createFileRoute("/_authenticated/app/eating")({
  component: Page,
});

function Page() {
  const analyze = useServerFn(analyzeEmotionalEating);
  const [hunger, setHunger] = useState<(typeof HUNGER)[number]["key"] | null>(null);
  const [emotion, setEmotion] = useState("");
  const [food, setFood] = useState("");
  const [trigger, setTrigger] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ insight: string; action: string } | null>(null);

  const submit = async () => {
    setLoading(true); setResult(null);
    try {
      const res = await analyze({ data: { hungerType: hunger, emotion, cravingFood: food, trigger } });
      setResult(res);
    } catch (e) { toast.error(e instanceof Error ? e.message : "Gagal"); }
    finally { setLoading(false); }
  };

  return (
    <div className="space-y-6">
      {/* Coral gradient header */}
      <div
        className="relative overflow-hidden rounded-3xl px-6 pt-6 pb-5"
        style={{
          background: "linear-gradient(135deg, oklch(0.977 0.008 85) 0%, oklch(0.96 0.04 25) 40%, oklch(0.97 0.03 40) 100%)",
          backgroundSize: "300% 300%",
          animation: "gradient-shift 13s ease-in-out infinite",
        }}
      >
        <div
          className="absolute -right-6 -top-6 h-36 w-36 rounded-full pointer-events-none"
          style={{ background: "oklch(0.77 0.085 40 / 0.18)", filter: "blur(35px)", animation: "blob-drift 18s ease-in-out infinite" }}
        />
        <div className="relative">
          <h1 className="font-display text-3xl font-semibold">Emotional Eating</h1>
          <p className="mt-1 text-sm text-muted-foreground italic">
            "Tidak semua rasa lapar berasal dari perut."
          </p>
        </div>
      </div>

      {/* ── HUNGER TYPE ─────────────────────────────────────────── */}
      <section className="rounded-3xl bg-card p-6 ring-1 ring-border/60 shadow-card space-y-5">
        <div>
          <p className="text-sm font-semibold text-foreground mb-3">Apa yang sebenarnya kamu rasakan sekarang?</p>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {HUNGER.map((h) => {
              const sel = hunger === h.key;
              return (
                <button
                  key={h.key}
                  onClick={() => setHunger(h.key)}
                  aria-pressed={sel}
                  className={`flex items-center gap-3 rounded-2xl border-2 p-4 text-left transition-all duration-250 ${
                    sel
                      ? "border-accent/40 bg-accent-soft/50 shadow-soft scale-[1.01]"
                      : "border-transparent bg-cream-deep hover:border-accent/20 hover:bg-accent-soft/20 hover:scale-[1.01]"
                  }`}
                >
                  <span
                    className="shrink-0 text-2xl transition-transform duration-250"
                    style={{ display: "inline-block", transform: sel ? "scale(1.15)" : "scale(1)" }}
                  >
                    {h.icon}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-foreground">{h.label}</p>
                    <p className="mt-0.5 text-[11px] text-muted-foreground">{h.desc}</p>
                  </div>
                  {sel && (
                    <span className="ml-auto shrink-0 text-accent">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="h-4 w-4" aria-hidden="true">
                        <path d="m5 12 4 4 10-10" />
                      </svg>
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <label className="mb-1.5 block text-sm font-semibold" htmlFor="emotion-input">
              💭 Emosi yang sedang kamu rasakan
            </label>
            <textarea
              id="emotion-input"
              value={emotion}
              onChange={(e) => setEmotion(e.target.value)}
              placeholder="Ceritakan perasaanmu sekarang… (contoh: cemas, bosan, marah, sedih)"
              rows={2}
              className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm resize-none placeholder:text-muted-foreground/60 transition-all duration-200"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold" htmlFor="food-input">
              🍽️ Makanan yang ingin kamu makan
            </label>
            <input
              id="food-input"
              value={food}
              onChange={(e) => setFood(e.target.value)}
              placeholder="Makanan apa yang sedang kamu inginkan?"
              className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm transition-all duration-200"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold" htmlFor="trigger-input">
              ⚡ Apa yang memicunya?
            </label>
            <input
              id="trigger-input"
              value={trigger}
              onChange={(e) => setTrigger(e.target.value)}
              placeholder="Kejadian atau situasi yang memicu keinginan ini…"
              className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm transition-all duration-200"
            />
          </div>
        </div>

        <button
          onClick={submit}
          disabled={loading || !hunger}
          className="w-full rounded-full bg-accent py-3.5 text-sm font-semibold text-accent-foreground shadow-peach transition-all duration-300 btn-spring disabled:opacity-60"
        >
          {loading ? (
            <span className="inline-flex items-center gap-2">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Menganalisis…
            </span>
          ) : "Minta Insight AI 🌿"}
        </button>
      </section>

      {/* ── AI RESULT ───────────────────────────────────────────── */}
      {result && (
        <section
          className="rounded-3xl p-6 space-y-4 animate-slide-up"
          style={{
            background: "linear-gradient(135deg, oklch(0.96 0.025 155) 0%, oklch(0.97 0.015 165) 100%)",
          }}
        >
          <div className="flex items-center gap-2">
            <div className="grid h-8 w-8 place-items-center rounded-xl bg-primary text-primary-foreground shadow-soft">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" className="h-4 w-4" aria-hidden="true">
                <path d="M12 3v3m0 12v3m9-9h-3M6 12H3m14.5-6.5-2 2m-9 9-2 2m13 0-2-2m-9-9-2-2" />
              </svg>
            </div>
            <p className="text-xs font-bold uppercase tracking-wider text-primary">Insight JN-CALM</p>
          </div>
          <p className="text-sm leading-relaxed text-foreground italic">{result.insight}</p>
          <div className="rounded-2xl bg-card/80 backdrop-blur-sm p-4 ring-1 ring-border/60">
            <p className="text-xs font-bold text-primary mb-1.5">💡 Coba lakukan ini:</p>
            <p className="text-sm text-foreground leading-relaxed">{result.action}</p>
          </div>
        </section>
      )}

      {/* Disclaimer */}
      <p className="rounded-2xl bg-cream-deep/50 px-4 py-3 text-xs text-center text-muted-foreground">
        JN-CALM bukan pengganti ahli gizi atau psikolog. Untuk bantuan lebih lanjut, hubungi profesional kesehatan.
      </p>
    </div>
  );
}
