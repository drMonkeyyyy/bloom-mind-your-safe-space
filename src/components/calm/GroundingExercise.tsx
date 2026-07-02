import { useState } from "react";

const GROUNDING_STEPS = [
  { num: 5, sense: "Lihat", prompt: "Sebutkan 5 hal yang bisa kamu lihat sekarang", icon: "👀" },
  { num: 4, sense: "Sentuh", prompt: "Sebutkan 4 hal yang bisa kamu sentuh atau rasakan", icon: "🤚" },
  { num: 3, sense: "Dengar", prompt: "Sebutkan 3 suara yang bisa kamu dengar sekarang", icon: "👂" },
  { num: 2, sense: "Cium", prompt: "Sebutkan 2 hal yang bisa kamu cium atau bayangkan baunya", icon: "👃" },
  { num: 1, sense: "Rasakan", prompt: "Sebutkan 1 hal yang kamu syukuri atau rasakan saat ini", icon: "💛" },
];

export function GroundingExercise() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState(Array(5).fill(""));
  const current = GROUNDING_STEPS[step];
  const isLast = step === GROUNDING_STEPS.length - 1;

  return (
    <section className="rounded-3xl bg-card p-6 ring-1 ring-border/60 shadow-card space-y-5">
      {/* Progress */}
      <div className="flex gap-1.5">
        {GROUNDING_STEPS.map((_, i) => (
          <div
            key={i}
            className="h-1.5 flex-1 rounded-full transition-all duration-500"
            style={{
              background: i <= step
                ? "linear-gradient(90deg, var(--color-primary), oklch(0.65 0.06 230))"
                : "var(--color-cream-deep)",
            }}
          />
        ))}
      </div>

      <div className="animate-scale-in" key={step}>
        <div className="flex items-center gap-3">
          <span className="text-3xl">{current.icon}</span>
          <div>
            <span className="rounded-full bg-primary-soft px-2.5 py-0.5 text-xs font-bold text-primary">{current.num}</span>
            <p className="mt-1 font-display text-lg font-semibold">{current.sense}</p>
          </div>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">{current.prompt}</p>
        <textarea
          value={answers[step]}
          onChange={(e) => {
            const next = [...answers];
            next[step] = e.target.value;
            setAnswers(next);
          }}
          placeholder="Tulis di sini…"
          rows={3}
          className="mt-3 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm resize-none placeholder:text-muted-foreground/60 transition-all duration-200"
        />
      </div>

      <div className="flex gap-2">
        {step > 0 && (
          <button
            onClick={() => setStep(s => s - 1)}
            className="rounded-full border border-border px-5 py-2.5 text-sm font-medium transition-all duration-200 hover:bg-cream-deep"
          >
            ← Kembali
          </button>
        )}
        {!isLast ? (
          <button
            onClick={() => setStep(s => s + 1)}
            className="ml-auto rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition-all duration-250 hover:-translate-y-0.5 hover:shadow-soft active:scale-95"
          >
            Selanjutnya →
          </button>
        ) : (
          <button
            onClick={() => { setStep(0); setAnswers(Array(5).fill("")); }}
            className="ml-auto rounded-full bg-accent px-6 py-2.5 text-sm font-semibold text-accent-foreground shadow-peach transition-all duration-250 hover:-translate-y-0.5 active:scale-95"
          >
            Selesai & Ulangi 🌿
          </button>
        )}
      </div>
    </section>
  );
}
