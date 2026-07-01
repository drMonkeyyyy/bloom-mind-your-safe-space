import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/app/calm")({
  component: Page,
});

type Tool = "breath" | "ground" | "selftalk" | "vent" | "reframing" | "somatic" | "panic" | null;

/* ── Breathing Timer ────────────────────────────────────────────── */
const PHASES = [
  { label: "Tarik Napas", duration: 4, color: "oklch(0.71 0.045 160)" },
  { label: "Tahan", duration: 7, color: "oklch(0.65 0.06 230)" },
  { label: "Buang Napas", duration: 8, color: "oklch(0.77 0.085 40)" },
];

function BreathingExercise() {
  const [active, setActive] = useState(false);
  const [phaseIdx, setPhaseIdx] = useState(0);
  const [countdown, setCountdown] = useState(PHASES[0].duration);
  const [cycle, setCycle] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const phase = PHASES[phaseIdx];
  const totalCycles = 4;

  const start = () => {
    setActive(true);
    setPhaseIdx(0);
    setCountdown(PHASES[0].duration);
    setCycle(0);
  };

  const stop = () => {
    setActive(false);
    if (timerRef.current) clearInterval(timerRef.current);
    setPhaseIdx(0);
    setCountdown(PHASES[0].duration);
    setCycle(0);
  };

  useEffect(() => {
    if (!active) return;
    timerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          const nextIdx = (phaseIdx + 1) % PHASES.length;
          if (nextIdx === 0) {
            const nextCycle = cycle + 1;
            if (nextCycle >= totalCycles) {
              setActive(false);
              setCycle(0);
              return PHASES[0].duration;
            }
            setCycle(nextCycle);
          }
          setPhaseIdx(nextIdx);
          return PHASES[nextIdx].duration;
        }
        return prev - 1;
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [active, phaseIdx, cycle]);

  const breatheScale = phaseIdx === 0 ? "scale-110" : phaseIdx === 1 ? "scale-110" : "scale-90";

  return (
    <section
      className="rounded-3xl overflow-hidden"
      style={{
        background: "linear-gradient(160deg, oklch(0.95 0.025 230) 0%, oklch(0.97 0.02 265) 100%)",
      }}
    >
      <div className="p-8 text-center">
        <p className="text-sm font-semibold mb-6" style={{ color: "oklch(0.50 0.06 230)" }}>Teknik Napas 4-7-8</p>

        {/* Outer glow rings */}
        <div className="relative mx-auto w-64 h-64 grid place-items-center">
          {/* Outermost ambient ring */}
          <div
            className={`absolute inset-0 rounded-full transition-all ease-in-out ${breatheScale}`}
            style={{
              background: `${phase.color}10`,
              transitionDuration: `${phase.duration * 1000}ms`,
              boxShadow: active ? `0 0 60px 20px ${phase.color}18` : "none",
            }}
          />
          {/* Middle ring */}
          <div
            className={`absolute inset-6 rounded-full transition-all ease-in-out ${breatheScale}`}
            style={{
              background: `${phase.color}18`,
              transitionDuration: `${phase.duration * 1000}ms`,
            }}
          />
          {/* Inner ring */}
          <div
            className={`absolute inset-14 rounded-full transition-all ease-in-out ${breatheScale}`}
            style={{
              background: `${phase.color}28`,
              transitionDuration: `${phase.duration * 1000}ms`,
            }}
          />
          {/* Core circle */}
          <div
            className="relative grid h-24 w-24 place-items-center rounded-full text-white shadow-xl transition-all duration-500"
            style={{
              background: phase.color,
              boxShadow: `0 8px 32px -8px ${phase.color}80`,
            }}
          >
            {active ? (
              <>
                <p className="font-display text-3xl font-bold leading-none">{countdown}</p>
                <p className="text-[10px] font-medium opacity-90">detik</p>
              </>
            ) : (
              <p className="font-display text-lg font-semibold">4·7·8</p>
            )}
          </div>
        </div>

        {/* Phase label */}
        <div className="mt-6 h-10">
          {active && (
            <div className="animate-slide-up">
              <p className="font-display text-xl font-semibold text-foreground">{phase.label}</p>
              <p className="text-xs text-muted-foreground">{phase.duration} detik</p>
            </div>
          )}
          {!active && (
            <p className="text-sm text-muted-foreground">Tarik napas 4 detik · Tahan 7 · Buang 8</p>
          )}
        </div>

        {/* Cycle dots */}
        {active && (
          <div className="mt-4 flex justify-center gap-2">
            {Array.from({ length: totalCycles }).map((_, i) => (
              <div
                key={i}
                className="h-2 w-7 rounded-full transition-all duration-500"
                style={{
                  background: i < cycle
                    ? "var(--color-primary)"
                    : i === cycle
                    ? "color-mix(in oklab, var(--color-primary) 50%, transparent)"
                    : "var(--color-border)",
                }}
              />
            ))}
          </div>
        )}

        {/* Controls */}
        <div className="mt-6 flex justify-center gap-3">
          {!active ? (
            <button
              onClick={start}
              className="rounded-full bg-primary px-8 py-3 text-sm font-semibold text-primary-foreground shadow-soft transition-all duration-250 hover:-translate-y-0.5 hover:shadow-glow-sage active:scale-95"
            >
              Mulai Latihan
            </button>
          ) : (
            <button
              onClick={stop}
              className="rounded-full border border-border/60 bg-card/80 backdrop-blur-sm px-8 py-3 text-sm font-semibold text-foreground transition-all duration-200 hover:bg-card"
            >
              Stop
            </button>
          )}
        </div>
      </div>
    </section>
  );
}

/* ── Grounding ──────────────────────────────────────────────────── */
const GROUNDING_STEPS = [
  { num: 5, sense: "Lihat", prompt: "Sebutkan 5 hal yang bisa kamu lihat sekarang", icon: "👀" },
  { num: 4, sense: "Sentuh", prompt: "Sebutkan 4 hal yang bisa kamu sentuh atau rasakan", icon: "🤚" },
  { num: 3, sense: "Dengar", prompt: "Sebutkan 3 suara yang bisa kamu dengar sekarang", icon: "👂" },
  { num: 2, sense: "Cium", prompt: "Sebutkan 2 hal yang bisa kamu cium atau bayangkan baunya", icon: "👃" },
  { num: 1, sense: "Rasakan", prompt: "Sebutkan 1 hal yang kamu syukuri atau rasakan saat ini", icon: "💛" },
];

function GroundingExercise() {
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

/* ── Self-Talk Carousel ─────────────────────────────────────────── */
const PHRASES = [
  "Aku boleh merasa seperti ini. Perasaan ini tidak akan selamanya.",
  "Aku aman saat ini. Aku punya waktu untuk pelan-pelan.",
  "Aku tidak harus sempurna untuk berharga.",
  "Satu langkah kecil sudah cukup untuk hari ini.",
  "Aku layak mendapat ketenangan dan kebaikan.",
  "Ini momen yang sulit, bukan karakter ku.",
];

function SelfTalkCarousel() {
  const [idx, setIdx] = useState(0);
  return (
    <section className="rounded-3xl bg-card p-6 ring-1 ring-border/60 shadow-card space-y-4">
      <p className="text-sm font-semibold">Kalimat untuk dirimu sendiri</p>
      <div
        className="rounded-2xl p-6 text-center animate-scale-in"
        key={idx}
        style={{ background: "linear-gradient(135deg, oklch(0.95 0.025 230) 0%, oklch(0.96 0.02 270) 100%)" }}
      >
        <p className="text-2xl mb-4">🤍</p>
        <p className="font-display text-lg font-semibold italic leading-relaxed text-foreground">
          "{PHRASES[idx]}"
        </p>
      </div>
      <div className="flex items-center justify-between">
        <button
          onClick={() => setIdx(i => (i - 1 + PHRASES.length) % PHRASES.length)}
          disabled={idx === 0}
          className="rounded-full border border-border px-4 py-2 text-sm transition-all duration-200 hover:bg-cream-deep disabled:opacity-30"
        >
          ← Sebelumnya
        </button>
        <div className="flex gap-1">
          {PHRASES.map((_, i) => (
            <div
              key={i}
              className="h-1.5 rounded-full transition-all duration-300"
              style={{
                width: i === idx ? 16 : 6,
                background: i === idx ? "var(--color-primary)" : "var(--color-border)",
              }}
            />
          ))}
        </div>
        <button
          onClick={() => setIdx(i => (i + 1) % PHRASES.length)}
          disabled={idx === PHRASES.length - 1}
          className="rounded-full border border-border px-4 py-2 text-sm transition-all duration-200 hover:bg-cream-deep disabled:opacity-30"
        >
          Selanjutnya →
        </button>
      </div>
    </section>
  );
}

/* ── Venting / Let It Go Box ────────────────────────────────────── */
function VentingBox() {
  const [text, setText] = useState("");
  const [isReleasing, setIsReleasing] = useState(false);
  const [released, setReleased] = useState(false);
  const [releaseMethod, setReleaseMethod] = useState<"burn" | "shred" | null>(null);
  const [burnProgress, setBurnProgress] = useState(0);
  // Crumple animation: idle -> crumpling -> tossing -> done
  const [crumplePhase, setCrumplePhase] = useState<"idle" | "crumpling" | "tossing">("idle");
  const charCount = text.length;
  const maxChars = 500;

  useEffect(() => {
    if (isReleasing && releaseMethod === "burn") {
      setBurnProgress(0);
      let start: number | null = null;
      const duration = 2600;

      const frame = (timestamp: number) => {
        if (!start) start = timestamp;
        const elapsed = timestamp - start;
        const progress = Math.min((elapsed / duration) * 100, 100);
        setBurnProgress(progress);
        if (progress < 100) requestAnimationFrame(frame);
      };
      const animId = requestAnimationFrame(frame);
      return () => cancelAnimationFrame(animId);
    } else {
      setBurnProgress(0);
    }
  }, [isReleasing, releaseMethod]);

  const handleRelease = (method: "burn" | "shred") => {
    if (!text.trim()) return;
    setReleaseMethod(method);
    setIsReleasing(true);
    if (method === "shred") {
      // Phase 1: crumpling (0 - 900ms)
      setCrumplePhase("crumpling");
      // Phase 2: tossing (900ms - 2000ms)
      setTimeout(() => setCrumplePhase("tossing"), 900);
      // Phase 3: done (2000ms)
      setTimeout(() => {
        setReleased(true);
        setIsReleasing(false);
        setCrumplePhase("idle");
        setText("");
      }, 2000);
    } else {
      setTimeout(() => {
        setReleased(true);
        setIsReleasing(false);
        setText("");
      }, 2600);
    }
  };

  if (released) {
    return (
      <section className="rounded-3xl bg-card p-8 ring-1 ring-border/60 shadow-card text-center space-y-5 animate-scale-in">
        <div className="relative mx-auto w-20 h-20">
          <div className="absolute inset-0 rounded-full bg-primary/10 animate-breath-ring" />
          <div className="absolute inset-0 rounded-full bg-primary/5 animate-breath-ring" style={{ animationDelay: "1s" }} />
          <div className="relative mx-auto grid h-20 w-20 place-items-center rounded-full bg-primary-soft text-4xl animate-float">
            {releaseMethod === "burn" ? "🕊️" : "🗑️"}
          </div>
        </div>
        <div className="space-y-1.5">
          <h3 className="font-display text-xl font-bold text-primary">
            {releaseMethod === "burn" ? "Sudah Dilepaskan" : "Sudah Dibuang"}
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed max-w-xs mx-auto">
            {releaseMethod === "burn"
              ? "Beban itu kini hanya abu yang terbawa angin. Napas dalam, rasakan ringannya."
              : "Beban pikiranmu sudah diremas dan dibuang ke tempat sampah. Waktunya melangkah maju."}
          </p>
        </div>
        <button
          onClick={() => { setReleased(false); setReleaseMethod(null); }}
          className="rounded-full bg-primary/10 border border-primary/20 px-6 py-2.5 text-xs font-semibold text-primary hover:bg-primary/20 transition-all duration-200 active:scale-95"
        >
          Tulis Lagi
        </button>
      </section>
    );
  }

  return (
    <section className="rounded-3xl bg-card ring-1 ring-border/60 shadow-card overflow-hidden">
      {/* Header */}
      <div className="px-6 pt-6 pb-4 border-b border-border/40 flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-accent/20 flex items-center justify-center text-xl flex-shrink-0">
            🌬️
          </div>
          <div>
            <p className="font-display text-base font-semibold leading-snug">Kotak Pelepasan Beban</p>
            <p className="text-xs text-muted-foreground mt-0.5">Tulis, lalu pilih cara melenyapkan kecemasanmu.</p>
          </div>
        </div>
        <span className={`text-[10px] font-mono tabular-nums mt-1 flex-shrink-0 ${
          charCount > maxChars * 0.9 ? "text-destructive" : "text-muted-foreground/50"
        }`}>
          {charCount}/{maxChars}
        </span>
      </div>

      {/* Paper area */}
      <div className="relative overflow-hidden flex items-center justify-center bg-cream-deep/10" style={{ minHeight: 280 }}>
        {/* Background paper texture shown during input, burn, or crumpling */}
        {(!isReleasing || releaseMethod === "burn" || (releaseMethod === "shred" && crumplePhase !== "tossing")) && (
          <div
            className="w-full h-full absolute inset-0"
            style={{
              backgroundColor: "#fdfaf2",
              backgroundImage: [
                "linear-gradient(90deg, transparent 52px, #f4a9a8 53px, #f4a9a8 54px, transparent 55px)",
                "linear-gradient(#e8e0cc 1px, transparent 1px)",
              ].join(", "),
              backgroundSize: "100% 100%, 100% 28px",
              backgroundPosition: "0 0",
              clipPath: isReleasing && releaseMethod === "burn"
                ? `polygon(0% 0%, 100% 0%, 100% ${100 - burnProgress}%, 0% ${100 - burnProgress}%)`
                : "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
              // Crumple: shrink to center becoming a ball
              transform: crumplePhase === "crumpling"
                ? "scale(0.12) rotate(25deg)"
                : "scale(1) rotate(0deg)",
              borderRadius: crumplePhase === "crumpling" ? "50%" : "0",
              filter: crumplePhase === "crumpling" ? "contrast(2.5) brightness(0.8) drop-shadow(0 8px 24px rgba(0,0,0,0.3))" : "none",
              transition: crumplePhase === "crumpling"
                ? "transform 0.9s cubic-bezier(0.25, 0.46, 0.45, 0.94), border-radius 0.9s ease, filter 0.9s ease"
                : "none",
              transformOrigin: "center center",
              zIndex: crumplePhase === "crumpling" ? 20 : 0,
            }}
          >
            {/* Binder holes column */}
            <div className="absolute left-3.5 top-0 bottom-0 flex flex-col justify-around py-5 pointer-events-none">
              {Array.from({ length: 7 }).map((_, i) => (
                <div
                  key={i}
                  className="w-4 h-4 rounded-full shadow-inner"
                  style={{ background: "radial-gradient(circle at 40% 35%, #f0e8d0, #d4c9ab)", border: "1px solid #cbbf9a" }}
                />
              ))}
            </div>

            {/* Textarea on paper */}
            <div className="absolute inset-0 pl-14 pr-5 pt-3 pb-3">
              <textarea
                value={text}
                onChange={(e) => { if (e.target.value.length <= maxChars) setText(e.target.value); }}
                disabled={isReleasing}
                placeholder="Tulis apa yang sedang mengganjal pikiranmu…"
                className="w-full h-full bg-transparent text-sm border-none outline-none focus:ring-0 resize-none placeholder:text-amber-900/25 text-amber-950/80 leading-[28px]"
                style={{ fontFamily: "'Georgia', 'Times New Roman', serif", fontStyle: "italic", boxShadow: "none" }}
              />
            </div>

            {/* Char-edge burn glow at boundary line */}
            {isReleasing && releaseMethod === "burn" && burnProgress < 100 && (
              <>
                {/* Main fire line */}
                <div
                  className="absolute left-0 right-0 pointer-events-none z-10"
                  style={{
                    top: `calc(${100 - burnProgress}% - 1px)`,
                    height: "3px",
                    background: "linear-gradient(90deg, #ff2200, #ff6600, #ffcc00, #ff6600, #ff2200)",
                    boxShadow: "0 -4px 16px 4px #ff4400aa, 0 2px 24px 6px #ff880077",
                    filter: "blur(0.5px)",
                  }}
                />
                {/* Individual flame tongues */}
                <div
                  className="absolute left-0 right-0 flex justify-around items-end pointer-events-none z-10"
                  style={{ top: `calc(${100 - burnProgress}% - 18px)`, height: 18 }}
                >
                  {Array.from({ length: 14 }).map((_, i) => (
                    <div
                      key={i}
                      className="animate-fire-flicker rounded-full"
                      style={{
                        width: `${5 + (i % 3) * 3}px`,
                        height: `${8 + (i % 4) * 4}px`,
                        background: `radial-gradient(ellipse at 50% 100%, ${i % 2 === 0 ? "#ff6600" : "#ffaa00"}, transparent)`,
                        animationDelay: `${i * 0.04}s`,
                        animationDuration: `${0.18 + (i % 3) * 0.07}s`,
                        transformOrigin: "bottom center",
                      }}
                    />
                  ))}
                </div>
                {/* Char edge darkening on burned area below */}
                <div
                  className="absolute left-0 right-0 pointer-events-none"
                  style={{
                    top: `${100 - burnProgress}%`,
                    height: "8px",
                    background: "linear-gradient(to bottom, #2a1000bb, transparent)",
                  }}
                />
              </>
            )}
          </div>
        )}

        {/* Tossed crumpled paper ball + trash can overlay */}
        {isReleasing && releaseMethod === "shred" && crumplePhase === "tossing" && (
          <div className="absolute inset-0 pointer-events-none z-30 overflow-hidden">
            {/* Paper ball flying from center to trash (bottom-right) */}
            <div
              className="absolute rounded-full flex items-center justify-center shadow-xl"
              style={{
                width: 52,
                height: 52,
                backgroundImage: "radial-gradient(circle at 30% 30%, #ffffff, #fdfaf2 35%, #e0d5b8 70%, #c4b48c)",
                border: "1px solid rgba(180,160,100,0.4)",
                boxShadow: "0 6px 20px rgba(0,0,0,0.2), inset 0 1px 3px rgba(255,255,255,0.6)",
                // Starts at horizontal-center, vertical-center, ends at trash position
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                animation: "ball-toss 1.1s cubic-bezier(0.25, 0.8, 0.25, 1) forwards",
              }}
            >
              {/* crumple wrinkle lines */}
              <div className="absolute inset-0 rounded-full overflow-hidden opacity-30">
                <div className="absolute top-2 left-3 w-8 h-0.5 bg-amber-700 rotate-12 rounded" />
                <div className="absolute top-4 left-2 w-6 h-0.5 bg-amber-700 -rotate-6 rounded" />
                <div className="absolute bottom-3 right-2 w-7 h-0.5 bg-amber-700 rotate-20 rounded" />
                <div className="absolute top-6 right-3 w-5 h-0.5 bg-amber-700 -rotate-15 rounded" />
              </div>
            </div>

            {/* Shadow on ground under ball */}
            <div
              className="absolute rounded-full"
              style={{
                width: 36,
                height: 10,
                background: "radial-gradient(ellipse, rgba(0,0,0,0.15), transparent)",
                bottom: 36,
                right: 52,
                animation: "ball-shadow 1.1s cubic-bezier(0.25, 0.8, 0.25, 1) forwards",
              }}
            />

            {/* Trash can - always visible at bottom-right */}
            <div className="absolute bottom-4 right-8 flex flex-col items-center">
              {/* Handle */}
              <div className="w-6 h-2 border-t-2 border-x-2 border-slate-500 rounded-t-full mb-0.5" />
              {/* Lid — bounces when ball arrives */}
              <div
                className="w-16 h-3 bg-gradient-to-b from-slate-300 to-slate-400 rounded-t-md border border-slate-500/50 shadow-sm relative"
                style={{
                  animation: "trash-lid-bounce 0.5s ease-out 0.95s both",
                  transformOrigin: "bottom right",
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/30 to-transparent rounded-t-md" />
              </div>
              {/* Body */}
              <div
                className="w-14 h-16 rounded-b-xl shadow-md relative overflow-hidden"
                style={{
                  background: "linear-gradient(160deg, #94a3b8, #64748b)",
                  border: "1px solid rgba(100,116,139,0.6)",
                }}
              >
                {/* Vertical lines on body */}
                {[0, 1, 2].map(i => (
                  <div key={i} className="absolute top-2 bottom-2 w-px bg-white/10" style={{ left: `${25 + i * 25}%` }} />
                ))}
                {/* Shine */}
                <div className="absolute top-0 left-0 bottom-0 w-2 bg-gradient-to-r from-white/20 to-transparent" />
              </div>
            </div>
          </div>
        )}

        {/* Rising ember particles during burn */}
        {isReleasing && releaseMethod === "burn" && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden z-20">
            {Array.from({ length: 36 }).map((_, i) => {
              const threshold = (i / 36) * 100;
              if (burnProgress < threshold || burnProgress >= threshold + 35) return null;
              const p = (burnProgress - threshold) / 35;
              const sz = 2 + (i % 5);
              const left = 5 + (i * 2.7) % 90;
              const yUp = -p * 180;
              const xSway = Math.sin(p * Math.PI * 3 + i * 0.8) * 28;
              const colors = ["#ff4500", "#ff7700", "#ffcc00", "#ff3300"];
              return (
                <span
                  key={i}
                  className="absolute rounded-full"
                  style={{
                    left: `${left}%`,
                    top: `calc(${100 - threshold}% + ${yUp}px)`,
                    transform: `translateX(${xSway}px) scale(${1 - p * 0.7})`,
                    opacity: (1 - p) * 0.95,
                    width: sz,
                    height: sz,
                    background: colors[i % 4],
                    boxShadow: `0 0 ${sz * 3}px ${colors[i % 4]}`,
                  }}
                />
              );
            })}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="px-6 pb-6 pt-4 grid grid-cols-2 gap-3">
        <button
          id="venting-burn-btn"
          onClick={() => handleRelease("burn")}
          disabled={isReleasing || !text.trim()}
          className="group flex items-center justify-center gap-2 rounded-2xl py-3.5 text-xs font-semibold transition-all duration-250 active:scale-95 disabled:opacity-35 disabled:cursor-not-allowed"
          style={{
            background: "linear-gradient(135deg, #ff6b35, #ff4500)",
            color: "white",
            boxShadow: text.trim() ? "0 4px 16px -4px #ff450055" : "none",
          }}
        >
          <span className="text-base">🔥</span>
          <span>Bakar Kertas</span>
        </button>
        <button
          id="venting-shred-btn"
          onClick={() => handleRelease("shred")}
          disabled={isReleasing || !text.trim()}
          className="group flex items-center justify-center gap-2 rounded-2xl py-3.5 text-xs font-semibold transition-all duration-250 active:scale-95 disabled:opacity-35 disabled:cursor-not-allowed"
          style={{
            background: "linear-gradient(135deg, oklch(0.55 0.13 250), oklch(0.45 0.18 265))",
            color: "white",
            boxShadow: text.trim() ? "0 4px 16px -4px oklch(0.45 0.18 265 / 0.4)" : "none",
          }}
        >
          <span className="text-base">🗑️</span>
          <span>Remas & Buang</span>
        </button>
      </div>
    </section>
  );
}

/* ── Cognitive Reframing Wizard Component ─────────────────────────── */
function CognitiveReframing() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<string[]>(Array(4).fill(""));
  const [completed, setCompleted] = useState(false);

  const steps = [
    {
      title: "Pikiran Negatif 🧠",
      desc: "Apa pikiran buruk atau kekhawatiran yang sedang membebanimu saat ini?",
      placeholder: "Contoh: Aku gagal ujian hari ini, aku memang lambat belajar...",
    },
    {
      title: "Lingkaran Kendali ⭕",
      desc: "Apakah situasi ini berada dalam kendalimu? Bagian mana yang bisa kamu ubah, dan bagian mana yang perlu kamu ikhlaskan?",
      placeholder: "Contoh: Hasil ujian hari ini sudah terjadi dan di luar kendaliku. Yang bisa kukendalikan adalah cara belajarku selanjutnya...",
    },
    {
      title: "Sudut Pandang Sahabat 🤝",
      desc: "Jika sahabat dekatmu menceritakan beban ini kepadamu, kata-kata penuh kasih dan dukungan apa yang akan kamu katakan padanya?",
      placeholder: "Contoh: Kamu sudah belajar keras akhir-akhir ini. Satu nilai tidak mendefinisikan kepintaranmu. Kamu bisa mencobanya lagi...",
    },
    {
      title: "Formulasi Baru ✨",
      desc: "Sekarang, mari satukan kebaikan tersebut. Tulis kembali pikiran negatif tadi menggunakan sudut pandang baru yang lebih ramah dan realistis pada dirimu sendiri.",
      placeholder: "Contoh: Meskipun ujian ini mengecewakan, aku menghargai kerja kerasku. Aku akan belajar dengan strategi baru untuk ujian depan...",
    },
  ];

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(s => s + 1);
    } else {
      setCompleted(true);
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setStep(s => s - 1);
    }
  };

  const handleReset = () => {
    setStep(0);
    setAnswers(Array(4).fill(""));
    setCompleted(false);
  };

  if (completed) {
    return (
      <section className="rounded-3xl bg-card p-6 ring-1 ring-border/60 shadow-card space-y-5 animate-scale-in">
        <div className="text-center space-y-2">
          <span className="text-4xl animate-float inline-block">🪞</span>
          <h3 className="font-display text-xl font-semibold text-primary">Sudut Pandang Baru Terbentuk</h3>
          <p className="text-xs text-muted-foreground">Ini adalah cerminan pikiranmu yang lebih ramah dan bijak.</p>
        </div>

        <div className="space-y-4 pt-2">
          <div className="rounded-2xl bg-destructive/5 p-4 border border-destructive/10">
            <p className="text-[10px] font-bold text-destructive uppercase tracking-wider">Pikiran Awal</p>
            <p className="mt-1 text-sm text-foreground italic">"{answers[0]}"</p>
          </div>

          <div className="rounded-2xl bg-primary-soft/60 p-4 border border-primary/10">
            <p className="text-[10px] font-bold text-primary uppercase tracking-wider">Sudut Pandang Baru</p>
            <p className="mt-1 text-sm font-medium text-foreground">
              "{answers[3] || answers[2] || "Aku memilih untuk lebih berbelas kasih pada diriku sendiri."}"
            </p>
          </div>
        </div>

        <div className="flex justify-center pt-2">
          <button
            onClick={handleReset}
            className="rounded-full bg-primary px-8 py-2.5 text-xs font-semibold text-primary-foreground shadow-soft transition-all duration-200 active:scale-95"
          >
            Mulai Ulang 🌿
          </button>
        </div>
      </section>
    );
  }

  const current = steps[step];

  return (
    <section className="rounded-3xl bg-card p-6 ring-1 ring-border/60 shadow-card space-y-5">
      <div className="flex gap-1.5">
        {steps.map((_, i) => (
          <div
            key={i}
            className="h-1.5 flex-1 rounded-full transition-all duration-500"
            style={{
              background: i <= step
                ? "linear-gradient(90deg, var(--color-primary), oklch(0.77 0.085 40))"
                : "var(--color-cream-deep)",
            }}
          />
        ))}
      </div>

      <div className="animate-scale-in" key={step}>
        <h3 className="font-display text-lg font-semibold text-foreground">{current.title}</h3>
        <p className="mt-1 text-sm text-muted-foreground">{current.desc}</p>

        <textarea
          value={answers[step]}
          onChange={(e) => {
            const newAns = [...answers];
            newAns[step] = e.target.value;
            setAnswers(newAns);
          }}
          placeholder={current.placeholder}
          rows={4}
          className="mt-4 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm resize-none placeholder:text-muted-foreground/50 transition-all duration-200"
        />
      </div>

      <div className="flex justify-between items-center pt-2">
        <button
          onClick={handleBack}
          disabled={step === 0}
          className="rounded-full border border-border px-5 py-2 text-xs font-medium transition-all duration-200 hover:bg-cream-deep disabled:opacity-30"
        >
          ← Kembali
        </button>

        <button
          onClick={handleNext}
          disabled={!answers[step].trim()}
          className="rounded-full bg-primary px-6 py-2.5 text-xs font-semibold text-primary-foreground shadow-soft transition-all duration-250 hover:-translate-y-0.5 active:scale-95 disabled:opacity-40"
        >
          {step === steps.length - 1 ? "Selesai 🌿" : "Selanjutnya →"}
        </button>
      </div>
    </section>
  );
}

/* ── Somatic Grounding & Tapping Component ────────────────────────── */
type SomaticType = "butterfly" | "chest" | null;

function SomaticExercise() {
  const [selected, setSelected] = useState<SomaticType>(null);

  return (
    <div className="space-y-4">
      {selected === null ? (
        <div className="grid gap-3 sm:grid-cols-2">
          <button
            onClick={() => setSelected("butterfly")}
            className="rounded-3xl bg-card p-5 text-left ring-1 ring-border/60 shadow-card hover:ring-primary/30 transition-all duration-200 hover:-translate-y-0.5 card-lift"
          >
            <p className="text-2xl">🦋</p>
            <h4 className="mt-2 font-display text-base font-semibold text-foreground">Butterfly Hug</h4>
            <p className="mt-1 text-xs text-muted-foreground">Ketukan dada bergantian (bilateral) untuk menenangkan sistem saraf.</p>
          </button>
          <button
            onClick={() => setSelected("chest")}
            className="rounded-3xl bg-card p-5 text-left ring-1 ring-border/60 shadow-card hover:ring-primary/30 transition-all duration-200 hover:-translate-y-0.5 card-lift"
          >
            <p className="text-2xl">🤲</p>
            <h4 className="mt-2 font-display text-base font-semibold text-foreground">Chest Containment</h4>
            <p className="mt-1 text-xs text-muted-foreground">Sentuhan tangan hangat di dada & perut untuk rasa aman fisik.</p>
          </button>
        </div>
      ) : selected === "butterfly" ? (
        <ButterflyHugExercise onBack={() => setSelected(null)} />
      ) : (
        <ChestContainmentExercise onBack={() => setSelected(null)} />
      )}
    </div>
  );
}

function ButterflyHugExercise({ onBack }: { onBack: () => void }) {
  const [active, setActive] = useState(false);
  const [tapSide, setTapSide] = useState<"left" | "right">("left");
  const [tapCount, setTapCount] = useState(0);

  useEffect(() => {
    if (!active) return;
    const interval = setInterval(() => {
      setTapSide(s => s === "left" ? "right" : "left");
      setTapCount(c => c + 1);
    }, 1800);
    return () => clearInterval(interval);
  }, [active]);

  return (
    <section className="rounded-3xl bg-card ring-1 ring-border/60 shadow-card overflow-hidden animate-scale-in">
      {/* Header */}
      <div className="px-6 pt-5 pb-4 border-b border-border/40 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🦋</span>
          <div>
            <h4 className="font-display text-sm font-bold text-foreground">Butterfly Hug</h4>
            <p className="text-[11px] text-muted-foreground">Ketukan bilateral untuk menenangkan saraf</p>
          </div>
        </div>
        <button onClick={onBack} className="text-xs text-muted-foreground/60 hover:text-muted-foreground transition-colors px-3 py-1.5 rounded-full hover:bg-cream-deep">← Kembali</button>
      </div>

      {/* Instruction */}
      <div className="px-6 pt-4">
        <div className="rounded-2xl bg-primary-soft/30 border border-primary/10 px-4 py-3 text-xs text-foreground/70 leading-relaxed">
          Silangkan kedua tanganmu di dada, kaitkan ibu jari seperti sayap kupu-kupu. Ketuk pundak kiri & kanan bergantian perlahan mengikuti ritme di bawah.
        </div>
      </div>

      {/* Visual: two hand circles with bilateral beat */}
      <div className="px-6 pt-5 pb-2">
        <div className="relative rounded-2xl bg-cream-deep/40 py-8 flex items-center justify-center gap-10">
          {/* Left hand */}
          <div className="flex flex-col items-center gap-2">
            <div
              className={`relative w-20 h-20 rounded-full flex items-center justify-center text-3xl transition-all duration-700 ${
                active && tapSide === "left" ? "bg-primary-soft border-2 border-primary" : "bg-white border border-border/40"
              }`}
              style={{
                boxShadow: active && tapSide === "left" ? "0 0 0 8px oklch(0.75 0.09 280 / 0.15), 0 4px 20px oklch(0.75 0.09 280 / 0.3)" : "0 2px 8px rgba(0,0,0,0.06)",
                transform: active && tapSide === "left" ? "scale(1.12) translateY(-2px)" : "scale(1) translateY(0)",
                transition: "all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)",
              }}
            >
              🤚
            </div>
            <span className={`text-[10px] font-semibold tracking-widest uppercase transition-all duration-300 ${
              active && tapSide === "left" ? "text-primary" : "text-muted-foreground/40"
            }`}>Kiri</span>
          </div>

          {/* Center beat indicator */}
          <div className="flex flex-col items-center gap-1.5">
            {active ? (
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" style={{ boxShadow: "0 0 8px oklch(0.75 0.09 280)" }} />
            ) : (
              <div className="w-2 h-2 rounded-full bg-border" />
            )}
            {active && (
              <span className="text-[9px] font-bold text-primary/60 uppercase tracking-[0.15em]">{tapCount} ketuk</span>
            )}
          </div>

          {/* Right hand */}
          <div className="flex flex-col items-center gap-2">
            <div
              className={`relative w-20 h-20 rounded-full flex items-center justify-center text-3xl ${
                active && tapSide === "right" ? "bg-primary-soft border-2 border-primary" : "bg-white border border-border/40"
              }`}
              style={{
                boxShadow: active && tapSide === "right" ? "0 0 0 8px oklch(0.75 0.09 280 / 0.15), 0 4px 20px oklch(0.75 0.09 280 / 0.3)" : "0 2px 8px rgba(0,0,0,0.06)",
                transform: active && tapSide === "right" ? "scale(1.12) translateY(-2px)" : "scale(1) translateY(0)",
                transition: "all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)",
              }}
            >
              ✋
            </div>
            <span className={`text-[10px] font-semibold tracking-widest uppercase transition-all duration-300 ${
              active && tapSide === "right" ? "text-primary" : "text-muted-foreground/40"
            }`}>Kanan</span>
          </div>
        </div>

        {/* Rhythm label */}
        <p className="text-center text-[11px] text-muted-foreground/60 mt-3 italic">
          {active
            ? `Ikuti ritme ketukan — rasakan kedua sisi tubuhmu bergantian.`
            : "Tekan tombol mulai untuk memandu ritme bilateral."}
        </p>
      </div>

      {/* Action */}
      <div className="px-6 pb-6 pt-3">
        <button
          onClick={() => { setActive(a => !a); if (active) setTapCount(0); }}
          className={`w-full rounded-2xl py-3.5 text-xs font-bold tracking-wide transition-all duration-250 active:scale-[0.98] ${
            active
              ? "bg-cream-deep border border-border text-foreground hover:bg-border/40"
              : "text-white"
          }`}
          style={active ? {} : { background: "linear-gradient(135deg, oklch(0.68 0.14 280), oklch(0.55 0.16 295))", boxShadow: "0 4px 16px -4px oklch(0.55 0.16 295 / 0.5)" }}
        >
          {active ? "⏹ Hentikan" : "▶ Mulai Panduan Ritme"}
        </button>
      </div>
    </section>
  );
}

function ChestContainmentExercise({ onBack }: { onBack: () => void }) {
  const [phase, setPhase] = useState<"idle" | "inhale" | "hold" | "exhale">("idle");
  const [cycleCount, setCycleCount] = useState(0);
  const [phaseSeconds, setPhaseSeconds] = useState(0);

  const phaseDurations = { inhale: 5, hold: 2, exhale: 7 };
  const phaseOrder: Array<"inhale" | "hold" | "exhale"> = ["inhale", "hold", "exhale"];
  const phaseLabels = { inhale: "Tarik Napas", hold: "Tahan", exhale: "Hembuskan" };
  const phaseColors = {
    inhale: "oklch(0.72 0.10 200)",
    hold: "oklch(0.72 0.09 160)",
    exhale: "oklch(0.70 0.09 280)",
  };

  useEffect(() => {
    if (phase === "idle") { setPhaseSeconds(0); return; }
    const duration = phaseDurations[phase];
    let elapsed = 0;
    setPhaseSeconds(duration);
    const tick = setInterval(() => {
      elapsed += 1;
      setPhaseSeconds(duration - elapsed);
      if (elapsed >= duration) {
        const nextIdx = (phaseOrder.indexOf(phase) + 1) % 3;
        const next = phaseOrder[nextIdx];
        setPhase(next);
        if (next === "inhale") setCycleCount(c => c + 1);
      }
    }, 1000);
    return () => clearInterval(tick);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  const isActive = phase !== "idle";
  const activeColor = isActive ? phaseColors[phase as keyof typeof phaseColors] : "oklch(0.91 0.02 80)";
  const circleScale = phase === "inhale" ? 1.28 : phase === "hold" ? 1.28 : 1;

  return (
    <section className="rounded-3xl bg-card ring-1 ring-border/60 shadow-card overflow-hidden animate-scale-in">
      {/* Header */}
      <div className="px-6 pt-5 pb-4 border-b border-border/40 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🤲</span>
          <div>
            <h4 className="font-display text-sm font-bold text-foreground">Sentuhan Tenang</h4>
            <p className="text-[11px] text-muted-foreground">Napas somatik dengan panduan visual</p>
          </div>
        </div>
        <button onClick={onBack} className="text-xs text-muted-foreground/60 hover:text-muted-foreground transition-colors px-3 py-1.5 rounded-full hover:bg-cream-deep">← Kembali</button>
      </div>

      {/* Instruction */}
      <div className="px-6 pt-4">
        <div className="rounded-2xl bg-primary-soft/30 border border-primary/10 px-4 py-3 text-xs text-foreground/70 leading-relaxed">
          Letakkan satu tangan di dada dan satu di perut. Ikuti panduan lingkaran bernapas di bawah — tarik napas saat melebar, hembuskan saat mengecil.
        </div>
      </div>

      {/* Breathing orb */}
      <div className="px-6 pt-6 pb-2 flex flex-col items-center gap-4">
        <div className="relative flex items-center justify-center" style={{ width: 160, height: 160 }}>
          {/* Outer ring wave */}
          {isActive && ["", "-1s", "-2s"].map((d, i) => (
            <div
              key={i}
              className="absolute inset-0 rounded-full animate-breath-ring"
              style={{ background: activeColor, opacity: 0.12, animationDelay: d, animationDuration: `${phaseDurations.inhale + phaseDurations.hold + phaseDurations.exhale}s` }}
            />
          ))}
          {/* Main circle */}
          <div
            className="relative rounded-full flex flex-col items-center justify-center transition-all"
            style={{
              width: 130,
              height: 130,
              background: `radial-gradient(circle at 38% 35%, color-mix(in oklab, ${activeColor} 25%, white), ${activeColor})`,
              transform: `scale(${circleScale})`,
              transition: `transform ${phase === "inhale" ? phaseDurations.inhale : phaseDurations.exhale}s ease-in-out, background 0.8s ease`,
              boxShadow: isActive ? `0 0 0 0 transparent, 0 8px 40px -8px ${activeColor}88` : "0 4px 16px rgba(0,0,0,0.08)",
            }}
          >
            <span className="text-3xl select-none">🤲</span>
            {isActive && (
              <>
                <span className="text-[11px] font-bold text-white/90 uppercase tracking-wider mt-1" style={{ textShadow: "0 1px 4px rgba(0,0,0,0.25)" }}>
                  {phaseLabels[phase as keyof typeof phaseLabels]}
                </span>
                <span className="text-[10px] font-mono text-white/70">{phaseSeconds}s</span>
              </>
            )}
          </div>
        </div>

        {isActive && (
          <p className="text-[11px] text-muted-foreground/70 text-center">
            Siklus ke-{cycleCount + 1} · {phaseLabels[phase as keyof typeof phaseLabels]}
          </p>
        )}
        {!isActive && (
          <p className="text-[11px] text-muted-foreground/60 text-center italic">Siap memandu napas somatikmu.</p>
        )}
      </div>

      {/* Action */}
      <div className="px-6 pb-6 pt-3">
        <button
          onClick={() => { setPhase(isActive ? "idle" : "inhale"); if (isActive) setCycleCount(0); }}
          className={`w-full rounded-2xl py-3.5 text-xs font-bold tracking-wide transition-all duration-250 active:scale-[0.98] ${
            isActive ? "bg-cream-deep border border-border text-foreground" : "text-white"
          }`}
          style={isActive ? {} : { background: "linear-gradient(135deg, oklch(0.68 0.12 200), oklch(0.58 0.14 220))", boxShadow: "0 4px 16px -4px oklch(0.58 0.14 220 / 0.45)" }}
        >
          {isActive ? "⏹ Hentikan" : "▶ Mulai Napas Terpandu"}
        </button>
      </div>
    </section>
  );
}

/* ── Soundscape Web Audio Synthesizer ───────────────────────────── */
function createNoiseBuffer(ctx: AudioContext, type: "brown" | "white" | "pink") {
  const bufferSize = 2 * ctx.sampleRate;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  let lastOut = 0.0;
  let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0;
  for (let i = 0; i < bufferSize; i++) {
    const white = Math.random() * 2 - 1;
    if (type === "brown") {
      data[i] = (lastOut + (0.02 * white)) / 1.02;
      lastOut = data[i];
      data[i] *= 3.5;
    } else if (type === "pink") {
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + white * 0.5362) * 0.11;
    } else {
      data[i] = white;
    }
  }
  return buffer;
}

type SoundType = "rain" | "waves" | "forest" | "wind" | "whitenoise";

const SOUNDS: { id: SoundType; emoji: string; label: string; desc: string }[] = [
  { id: "rain",       emoji: "🌧️", label: "Hujan",       desc: "Suara rintik hujan yang menenangkan" },
  { id: "waves",      emoji: "🌊", label: "Ombak",       desc: "Deburan ombak laut berirama" },
  { id: "forest",     emoji: "🌲", label: "Hutan",       desc: "Kicauan burung & gemericik angin" },
  { id: "wind",       emoji: "💨", label: "Angin",       desc: "Hembusan angin sepoi yang sejuk" },
  { id: "whitenoise", emoji: "🌫️", label: "White Noise", desc: "Suara putih untuk fokus & tidur" },
];

// Extends window for global AudioState
declare global {
  interface Window {
    __bloomAudioCtx?: AudioContext;
    __bloomSource?: AudioBufferSourceNode;
    __bloomGain?: GainNode;
    __bloomModInterval?: ReturnType<typeof setInterval>;
    __bloomActiveSound?: SoundType | null;
    __bloomVolume?: number;
  }
}

function AmbientSoundPlayer() {
  const [activeSound, setActiveSound] = useState<SoundType | null>(() => {
    return window.__bloomActiveSound || null;
  });
  const [volume, setVolume] = useState(() => {
    return typeof window.__bloomVolume === "number" ? window.__bloomVolume : 0.5;
  });

  const initCtx = () => {
    if (!window.__bloomAudioCtx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      window.__bloomAudioCtx = new AudioCtx();
    }
    if (window.__bloomAudioCtx.state === "suspended") {
      window.__bloomAudioCtx.resume();
    }
    return window.__bloomAudioCtx;
  };

  const stopAll = () => {
    try { window.__bloomSource?.stop(); } catch (e) {}
    window.__bloomSource = undefined;
    window.__bloomGain = undefined;
    if (window.__bloomModInterval) {
      clearInterval(window.__bloomModInterval);
      window.__bloomModInterval = undefined;
    }
    window.__bloomActiveSound = null;
    setActiveSound(null);
  };

  const playSound = (sound: SoundType) => {
    stopAll();
    const ctx = initCtx();
    const masterGain = ctx.createGain();
    masterGain.connect(ctx.destination);
    window.__bloomGain = masterGain;

    if (sound === "rain") {
      const src = ctx.createBufferSource();
      src.buffer = createNoiseBuffer(ctx, "brown");
      src.loop = true;
      const lp = ctx.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 900;
      src.connect(lp); lp.connect(masterGain);
      masterGain.gain.value = volume * 0.4;
      src.start();
      window.__bloomSource = src;
      let tick = 0;
      window.__bloomModInterval = setInterval(() => {
        const v = 0.35 + 0.1 * Math.sin((2 * Math.PI * tick) / 60);
        masterGain.gain.setTargetAtTime(v * volume, ctx.currentTime, 0.5);
        tick++;
      }, 200);

    } else if (sound === "waves") {
      const src = ctx.createBufferSource();
      src.buffer = createNoiseBuffer(ctx, "brown");
      src.loop = true;
      const lp = ctx.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 450;
      src.connect(lp); lp.connect(masterGain);
      masterGain.gain.value = 0.05;
      src.start();
      window.__bloomSource = src;
      let tick = 0;
      window.__bloomModInterval = setInterval(() => {
        const v = 0.18 + 0.15 * Math.sin((2 * Math.PI * tick) / 80);
        masterGain.gain.setTargetAtTime(v * volume, ctx.currentTime, 0.1);
        tick = (tick + 1) % 80;
      }, 100);

    } else if (sound === "forest") {
      const src = ctx.createBufferSource();
      src.buffer = createNoiseBuffer(ctx, "pink");
      src.loop = true;
      const lp = ctx.createBiquadFilter(); lp.type = "bandpass"; lp.frequency.value = 1800; lp.Q.value = 0.5;
      src.connect(lp); lp.connect(masterGain);
      masterGain.gain.value = volume * 0.15;
      src.start();
      window.__bloomSource = src;
      const makeChirp = (freq: number, delay: number) => {
        setTimeout(() => {
          if (!window.__bloomAudioCtx) return;
          const c = window.__bloomAudioCtx;
          const osc = c.createOscillator();
          const g = c.createGain();
          osc.type = "sine";
          osc.frequency.setValueAtTime(freq, c.currentTime);
          osc.frequency.exponentialRampToValueAtTime(freq * 1.35, c.currentTime + 0.08);
          osc.frequency.exponentialRampToValueAtTime(freq, c.currentTime + 0.2);
          g.gain.setValueAtTime(0, c.currentTime);
          g.gain.linearRampToValueAtTime(volume * 0.06, c.currentTime + 0.02);
          g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.25);
          osc.connect(g); g.connect(c.destination);
          osc.start(); osc.stop(c.currentTime + 0.28);
        }, delay);
      };
      window.__bloomModInterval = setInterval(() => {
        if (Math.random() < 0.35) {
          const freq = 1800 + Math.random() * 1400;
          makeChirp(freq, 0);
          if (Math.random() < 0.5) makeChirp(freq * 1.1, 350);
        }
      }, 1200);

    } else if (sound === "wind") {
      const src = ctx.createBufferSource();
      src.buffer = createNoiseBuffer(ctx, "pink");
      src.loop = true;
      const hp = ctx.createBiquadFilter(); hp.type = "highpass"; hp.frequency.value = 200;
      const lp = ctx.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 2000;
      src.connect(hp); hp.connect(lp); lp.connect(masterGain);
      masterGain.gain.value = volume * 0.2;
      src.start();
      window.__bloomSource = src;
      let tick = 0;
      window.__bloomModInterval = setInterval(() => {
        const v = 0.12 + 0.12 * (0.5 + 0.5 * Math.sin((2 * Math.PI * tick) / 200));
        masterGain.gain.setTargetAtTime(v * volume, ctx.currentTime, 1.5);
        tick++;
      }, 100);

    } else if (sound === "whitenoise") {
      const src = ctx.createBufferSource();
      src.buffer = createNoiseBuffer(ctx, "white");
      src.loop = true;
      const lp = ctx.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 6000;
      src.connect(lp); lp.connect(masterGain);
      masterGain.gain.value = volume * 0.12;
      src.start();
      window.__bloomSource = src;
    }

    window.__bloomActiveSound = sound;
    setActiveSound(sound);
  };

  const toggleSound = (sound: SoundType) => {
    try {
      if (activeSound === sound) { stopAll(); return; }
      playSound(sound);
    } catch (err) {
      console.error("Audio failed", err);
      toast.error("Gagal memulai audio");
    }
  };

  useEffect(() => {
    window.__bloomVolume = volume;
    if (window.__bloomGain && window.__bloomAudioCtx) {
      const baseGains: Record<SoundType, number> = { rain: 0.4, waves: 0.18, forest: 0.15, wind: 0.2, whitenoise: 0.12 };
      if (activeSound) {
        window.__bloomGain.gain.setTargetAtTime(volume * baseGains[activeSound], window.__bloomAudioCtx.currentTime, 0.1);
      }
    }
  }, [volume, activeSound]);

  // Keep alive: no cleanup unmount stopAll()!

  const activeInfo = SOUNDS.find(s => s.id === activeSound);

  return (
    <div className="rounded-3xl bg-card ring-1 ring-border/60 shadow-card overflow-hidden animate-scale-in">
      {/* Header row */}
      <div className="px-5 pt-5 pb-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className="grid h-10 w-10 place-items-center rounded-2xl text-xl transition-all duration-300"
            style={{ background: activeSound ? "oklch(0.90 0.04 160)" : "oklch(0.95 0.02 80)" }}
          >
            {activeInfo?.emoji ?? "🎵"}
          </div>
          <div>
            <p className="text-sm font-semibold">Soundscape Penenang</p>
            <p className="text-[11px] text-muted-foreground transition-all duration-300">
              {activeInfo ? activeInfo.desc : "Pilih suara latar untuk membantumu rileks"}
            </p>
          </div>
        </div>

        {/* Volume slider */}
        {activeSound && (
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs text-muted-foreground">🔈</span>
            <input
              type="range" min="0" max="1" step="0.05" value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="w-20 h-1 cursor-pointer accent-primary"
              aria-label="Volume soundscape"
            />
            <span className="text-xs text-muted-foreground">🔊</span>
          </div>
        )}
      </div>

      {/* Sound buttons row */}
      <div className="px-5 pb-5 flex items-center gap-2 overflow-x-auto scrollbar-none">
        {SOUNDS.map(s => (
          <button
            key={s.id}
            onClick={() => toggleSound(s.id)}
            className={`flex-shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-semibold transition-all duration-200 active:scale-95 ${
              activeSound === s.id
                ? "bg-primary text-primary-foreground shadow-soft"
                : "border border-border/60 bg-background hover:bg-cream-deep text-foreground"
            }`}
          >
            <span>{s.emoji}</span>
            <span>{s.label}</span>
          </button>
        ))}

        {activeSound && (
          <button
            onClick={stopAll}
            className="flex-shrink-0 h-8 w-8 rounded-full border border-destructive/30 flex items-center justify-center text-xs text-destructive hover:bg-destructive/5 active:scale-95 transition-all"
            title="Matikan"
          >
            ⏹
          </button>
        )}
      </div>
    </div>
  );
}

/* ── Panic Attack Timer ─────────────────────────────────────────── */
const PANIC_STAGES = [
  {
    id: "breath",
    title: "Bernapas Bersamaku",
    emoji: "🌬️",
    color: "oklch(0.65 0.09 220)",
    bgColor: "oklch(0.94 0.02 220)",
    durationSec: 60,
    instruction: "Tarik napas 4 hitungan · Tahan 4 · Hembuskan 6",
    message: "Kamu aman. Ini hanya perasaan, bukan bahaya nyata. Cukup fokus pada napas kita bersama.",
  },
  {
    id: "ground",
    title: "Grounding Cepat",
    emoji: "🌍",
    color: "oklch(0.62 0.10 155)",
    bgColor: "oklch(0.93 0.02 155)",
    durationSec: 60,
    instruction: "Sebutkan dalam hatimu: 5 yang kamu lihat · 4 yang kamu sentuh · 3 yang kamu dengar",
    message: "Kamu ada di sini, di momen ini. Bukan di masa depan yang ditakutkan. Di sini. Sekarang.",
  },
  {
    id: "affirm",
    title: "Afirmasi Penguatan",
    emoji: "💛",
    color: "oklch(0.68 0.12 70)",
    bgColor: "oklch(0.96 0.03 70)",
    durationSec: 60,
    instruction: "Ulangi perlahan dalam hatimu",
    message: "\"Aku sudah melewati ini sebelumnya, dan aku bisa melewatinya lagi. Perasaan ini akan berlalu. Aku kuat.\"",
  },
];

function PanicAttackTimer() {
  const [stage, setStage] = useState<number | null>(null); // null = not started
  const [elapsed, setElapsed] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [done, setDone] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  // For breathing animation
  const [breathPhase, setBreathPhase] = useState<"in" | "hold" | "out">("in");
  const [breathCount, setBreathCount] = useState(0);
  const breathRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const currentStage = stage !== null ? PANIC_STAGES[stage] : null;
  const stageDuration = currentStage?.durationSec ?? 60;
  const progress = Math.min(elapsed / stageDuration, 1);

  const startPanic = () => {
    setStage(0);
    setElapsed(0);
    setDone(false);
    setIsRunning(true);
  };

  const advanceStage = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (breathRef.current) clearInterval(breathRef.current);
    const next = (stage ?? 0) + 1;
    if (next >= PANIC_STAGES.length) {
      setDone(true);
      setIsRunning(false);
      setStage(null);
    } else {
      setStage(next);
      setElapsed(0);
      setIsRunning(true);
    }
  };

  // Main countdown
  useEffect(() => {
    if (!isRunning) return;
    timerRef.current = setInterval(() => {
      setElapsed(prev => {
        if (prev + 1 >= stageDuration) {
          clearInterval(timerRef.current!);
          // Auto-advance after short pause
          setTimeout(advanceStage, 800);
          return stageDuration;
        }
        return prev + 1;
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRunning, stage, stageDuration]);

  // Breathing animation: 4 in, 4 hold, 6 out = 14s cycle
  useEffect(() => {
    if (!isRunning || stage !== 0) return;
    let t = 0;
    breathRef.current = setInterval(() => {
      t++;
      const pos = t % 14;
      if (pos < 4)        setBreathPhase("in");
      else if (pos < 8)  setBreathPhase("hold");
      else               setBreathPhase("out");
      if (pos === 0) setBreathCount(c => c + 1);
    }, 1000);
    return () => { if (breathRef.current) clearInterval(breathRef.current); };
  }, [isRunning, stage]);

  const remaining = stageDuration - elapsed;

  // Completion screen
  if (done) {
    return (
      <section className="rounded-3xl bg-card ring-1 ring-border/60 shadow-card p-8 text-center space-y-5 animate-scale-in">
        <div className="relative mx-auto w-24 h-24">
          {[0, 1].map(i => (
            <div key={i} className="absolute inset-0 rounded-full animate-breath-ring"
              style={{ background: "oklch(0.65 0.10 155)", opacity: 0.12, animationDelay: `${i}s` }} />
          ))}
          <div className="relative grid h-24 w-24 place-items-center rounded-full bg-emerald-50 text-5xl animate-float">🌿</div>
        </div>
        <div className="space-y-2">
          <h3 className="font-display text-2xl font-bold text-emerald-700">Kamu Berhasil 🎉</h3>
          <p className="text-sm text-muted-foreground leading-relaxed max-w-xs mx-auto">
            Kamu sudah melewati 3 menit yang luar biasa bersama kami. Napas, bumi, dan kasih — semua sudah ada bersamamu.
          </p>
        </div>
        <button onClick={() => { setDone(false); setElapsed(0); }}
          className="rounded-full bg-emerald-600 text-white px-8 py-3 text-xs font-bold transition-all active:scale-95 hover:bg-emerald-700">
          Kembali ke Awal
        </button>
      </section>
    );
  }

  // Start screen
  if (stage === null && !done) {
    return (
      <section className="rounded-3xl overflow-hidden ring-1 shadow-card"
        style={{ background: "linear-gradient(150deg, oklch(0.96 0.02 10), oklch(0.94 0.03 30))", borderColor: "oklch(0.85 0.05 20)" }}>
        <div className="px-6 pt-6 pb-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl"
              style={{ background: "oklch(0.90 0.06 15)" }}>🆘</div>
            <div>
              <p className="font-display text-base font-bold text-foreground">Panic Attack Timer</p>
              <p className="text-xs text-muted-foreground mt-0.5">Panduan darurat 3 menit — napas, grounding, afirmasi</p>
            </div>
          </div>

          <div className="rounded-2xl p-4 mb-4 space-y-2" style={{ background: "rgba(255,255,255,0.7)" }}>
            {PANIC_STAGES.map((s, i) => (
              <div key={s.id} className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
                  style={{ background: s.color }}>{i + 1}</div>
                <div>
                  <p className="text-xs font-semibold text-foreground">{s.emoji} {s.title}</p>
                  <p className="text-[10px] text-muted-foreground">{s.durationSec} detik</p>
                </div>
              </div>
            ))}
          </div>

          <button onClick={startPanic}
            className="w-full rounded-2xl py-4 text-sm font-bold text-white transition-all active:scale-[0.98]"
            style={{ background: "linear-gradient(135deg, oklch(0.55 0.18 20), oklch(0.50 0.20 10))",
              boxShadow: "0 4px 20px -4px oklch(0.50 0.20 10 / 0.5)" }}>
            🆘 Mulai Panduan Sekarang
          </button>
        </div>
      </section>
    );
  }

  // Active stage
  return (
    <section className="rounded-3xl ring-1 ring-border/60 shadow-card overflow-hidden animate-scale-in"
      style={{ background: currentStage?.bgColor }}>
      {/* Stage progress dots */}
      <div className="px-6 pt-5 flex items-center justify-between">
        <div className="flex gap-2">
          {PANIC_STAGES.map((s, i) => (
            <div key={i} className="rounded-full transition-all duration-500"
              style={{
                width: i === stage ? 24 : 10,
                height: 10,
                background: i <= (stage ?? 0) ? s.color : "oklch(0.85 0.02 0)",
              }}
            />
          ))}
        </div>
        <span className="text-xs font-mono font-bold" style={{ color: currentStage?.color }}>
          Langkah {(stage ?? 0) + 1} / {PANIC_STAGES.length}
        </span>
      </div>

      {/* Stage info */}
      <div className="px-6 pt-3 pb-2">
        <p className="text-xl font-bold text-foreground">{currentStage?.emoji} {currentStage?.title}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{currentStage?.instruction}</p>
      </div>

      {/* Visual: breathing orb (stage 0) or countdown ring */}
      <div className="px-6 py-4 flex justify-center">
        {stage === 0 ? (
          // Breathing orb
          <div className="relative flex items-center justify-center" style={{ width: 160, height: 160 }}>
            <div className="absolute inset-0 rounded-full transition-all"
              style={{
                background: currentStage?.color,
                opacity: 0.12,
                transform: breathPhase === "in" || breathPhase === "hold" ? "scale(1.3)" : "scale(1)",
                transition: breathPhase === "in" ? "transform 4s ease-in" : breathPhase === "out" ? "transform 6s ease-out" : "none",
              }}
            />
            <div className="relative rounded-full flex flex-col items-center justify-center transition-all"
              style={{
                width: 120, height: 120,
                background: `radial-gradient(circle at 38% 35%, white, ${currentStage?.color})`,
                transform: breathPhase === "in" || breathPhase === "hold" ? "scale(1.15)" : "scale(0.9)",
                transition: breathPhase === "in" ? "transform 4s ease-in" : breathPhase === "out" ? "transform 6s ease-out" : "none",
                boxShadow: `0 8px 32px -8px ${currentStage?.color}88`,
              }}
            >
              <span className="text-[11px] font-bold text-white uppercase tracking-widest" style={{ textShadow: "0 1px 3px rgba(0,0,0,0.2)" }}>
                {breathPhase === "in" ? "Tarik" : breathPhase === "hold" ? "Tahan" : "Hembuskan"}
              </span>
            </div>
          </div>
        ) : (
          // Countdown ring
          <div className="relative flex items-center justify-center" style={{ width: 140, height: 140 }}>
            <svg width="140" height="140" style={{ transform: "rotate(-90deg)" }}>
              <circle cx="70" cy="70" r="60" fill="none" stroke={`${currentStage?.color}25`} strokeWidth="8" />
              <circle cx="70" cy="70" r="60" fill="none" stroke={currentStage?.color} strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 60}`}
                strokeDashoffset={`${2 * Math.PI * 60 * (1 - progress)}`}
                style={{ transition: "stroke-dashoffset 1s linear" }}
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="font-mono text-3xl font-bold" style={{ color: currentStage?.color }}>{remaining}</span>
              <span className="text-[10px] text-muted-foreground">detik</span>
            </div>
          </div>
        )}
      </div>

      {/* Message */}
      <div className="mx-6 mb-4 rounded-2xl px-4 py-3 text-center" style={{ background: "rgba(255,255,255,0.65)" }}>
        <p className="text-xs text-foreground/75 leading-relaxed italic">{currentStage?.message}</p>
      </div>

      {/* Skip button */}
      <div className="px-6 pb-6">
        <button onClick={advanceStage}
          className="w-full rounded-2xl py-3 text-xs font-bold text-white transition-all active:scale-[0.98]"
          style={{ background: currentStage?.color }}>
          {stage === PANIC_STAGES.length - 1 ? "✅ Selesai" : "Lanjut ke Langkah Berikutnya →"}
        </button>
      </div>
    </section>
  );
}

/* ── Main Page ──────────────────────────────────────────────────── */
function Page() {
  const [tool, setTool] = useState<Tool>(null);

  const tools = [
    { k: "breath" as Tool, icon: "🌬️", title: "Breathing 4-7-8", desc: "Latihan napas terbimbing dengan timer", color: "oklch(0.71 0.045 160)" },
    { k: "ground" as Tool, icon: "🌍", title: "Grounding 5-4-3-2-1", desc: "Kembali ke momen saat ini", color: "oklch(0.65 0.06 230)" },
    { k: "selftalk" as Tool, icon: "🤍", title: "Self-Calming Talk", desc: "Kalimat menenangkan untuk dirimu", color: "oklch(0.70 0.05 310)" },
    { k: "vent" as Tool, icon: "🍃", title: "Kotak Pelepasan", desc: "Tulis dan bakar/hancurkan beban pikiran", color: "oklch(0.77 0.085 40)" },
    { k: "reframing" as Tool, icon: "🪞", title: "Ubah Sudut Pandang", desc: "Tulis ulang pikiran negatif secara ramah", color: "oklch(0.75 0.08 40)" },
    { k: "somatic" as Tool, icon: "🦋", title: "Latihan Somatik", desc: "Tenangkan saraf tubuh secara fisik", color: "oklch(0.71 0.045 160)" },
    { k: "panic" as Tool, icon: "🆘", title: "Panic Attack Timer", desc: "Panduan darurat napas + grounding + afirmasi", color: "oklch(0.55 0.18 20)" },
  ];

  return (
    <div className="space-y-6">
      {/* Serene blue gradient header */}
      <div
        className="relative overflow-hidden rounded-3xl px-6 pt-6 pb-5"
        style={{
          background: "linear-gradient(145deg, oklch(0.977 0.008 85) 0%, oklch(0.95 0.03 230) 45%, oklch(0.96 0.025 270) 100%)",
          backgroundSize: "300% 300%",
          animation: "gradient-shift 16s ease-in-out infinite",
        }}
      >
        <div
          className="absolute -right-8 -top-8 h-40 w-40 rounded-full pointer-events-none"
          style={{ background: "oklch(0.65 0.06 230 / 0.15)", filter: "blur(40px)", animation: "blob-drift 22s ease-in-out infinite" }}
        />
        <div
          className="absolute bottom-0 left-1/4 h-24 w-24 rounded-full pointer-events-none"
          style={{ background: "oklch(0.70 0.05 270 / 0.12)", filter: "blur(28px)", animation: "blob-drift-alt 18s ease-in-out infinite" }}
        />
        <div className="relative">
          <h1 className="font-display text-3xl font-semibold">Emergency Calm Mode</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Tarik napas dalam. Kamu aman di sini. 🌿
          </p>
        </div>
      </div>

      {/* Ambient Sound Player */}
      <AmbientSoundPlayer />

      {/* Tool selector — glass cards */}
      <div className="grid gap-3 sm:grid-cols-2">
        {tools.map((t) => (
          <button
            key={t.k}
            onClick={() => setTool(tool === t.k ? null : t.k)}
            className={`rounded-3xl p-5 text-left ring-1 transition-all duration-250 hover:-translate-y-0.5 card-lift ${
              tool === t.k
                ? "ring-primary/40 shadow-soft bg-card"
                : "bg-card ring-border/60 shadow-card"
            }`}
          >
            <p className="text-2xl">{t.icon}</p>
            <h3 className="mt-2 font-display text-lg font-semibold text-foreground">{t.title}</h3>
            <p className="mt-0.5 text-xs text-muted-foreground">{t.desc}</p>
            {tool === t.k && (
              <div
                className="mt-2 h-0.5 rounded-full"
                style={{ background: t.color, boxShadow: `0 0 8px ${t.color}` }}
              />
            )}
          </button>
        ))}
      </div>

      {/* Active tool */}
      {tool === "breath" && <BreathingExercise />}
      {tool === "ground" && <GroundingExercise />}
      {tool === "selftalk" && <SelfTalkCarousel />}
      {tool === "vent" && <VentingBox />}
      {tool === "reframing" && <CognitiveReframing />}
      {tool === "somatic" && <SomaticExercise />}
      {tool === "panic" && <PanicAttackTimer />}
    </div>
  );
}
