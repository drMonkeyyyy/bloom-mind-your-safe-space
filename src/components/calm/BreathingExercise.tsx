import { useState, useEffect, useRef } from "react";

/* Inhale 4s → Hold 4s → Exhale 6s per saran user */
const PHASES = [
  {
    label: "Tarik Napas",
    sub: "Hirup perlahan lewat hidung",
    duration: 4,
    scale: 1.18,
    color: "oklch(0.71 0.045 160)",
    glow: "oklch(0.71 0.045 160 / 0.35)",
    trackColor: "#6E8C7150",
  },
  {
    label: "Tahan",
    sub: "Tahan dengan tenang",
    duration: 4,
    scale: 1.18,
    color: "oklch(0.65 0.06 230)",
    glow: "oklch(0.65 0.06 230 / 0.30)",
    trackColor: "#6093C550",
  },
  {
    label: "Buang Napas",
    sub: "Hembuskan perlahan lewat mulut",
    duration: 6,
    scale: 0.88,
    color: "oklch(0.77 0.085 40)",
    glow: "oklch(0.77 0.085 40 / 0.30)",
    trackColor: "#C5936050",
  },
];

const TOTAL_CYCLES = 4;
const CIRCLE_R = 88; // SVG circle radius
const CIRCUMFERENCE = 2 * Math.PI * CIRCLE_R;

export function BreathingExercise() {
  const [active, setActive] = useState(false);
  const [phaseIdx, setPhaseIdx] = useState(0);
  const [countdown, setCountdown] = useState(PHASES[0].duration);
  const [cycle, setCycle] = useState(0);
  const [justFinished, setJustFinished] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const phase = PHASES[phaseIdx];

  const start = () => {
    setActive(true);
    setPhaseIdx(0);
    setCountdown(PHASES[0].duration);
    setCycle(0);
    setJustFinished(false);
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
            if (nextCycle >= TOTAL_CYCLES) {
              setActive(false);
              setCycle(0);
              setJustFinished(true);
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

  /* SVG arc progress: moves from full stroke (empty) → 0 (full) as countdown ticks */
  const progressRatio = countdown / phase.duration;
  const strokeDashoffset = CIRCUMFERENCE * progressRatio;

  /* Circle scale transition based on phase */
  const circleTransform = active
    ? `scale(${phase.scale})`
    : "scale(1)";

  return (
    <section
      className="rounded-3xl overflow-hidden"
      style={{
        background: "linear-gradient(160deg, oklch(0.95 0.025 230) 0%, oklch(0.97 0.02 265) 100%)",
      }}
    >
      <div className="p-8 text-center">
        <p className="text-sm font-semibold mb-2" style={{ color: "oklch(0.50 0.06 230)" }}>
          Napas 4-4-6
        </p>
        <p className="text-xs text-muted-foreground mb-6">
          Tarik 4 detik · Tahan 4 · Buang 6
        </p>

        {/* SVG breathing circle */}
        <div
          className="relative mx-auto"
          style={{ width: 240, height: 240 }}
        >
          <svg
            viewBox="0 0 240 240"
            width={240}
            height={240}
            className="absolute inset-0"
            aria-hidden="true"
          >
            {/* Glow filter */}
            <defs>
              <filter id="breath-glow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="8" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Track ring */}
            <circle
              cx="120" cy="120" r={CIRCLE_R}
              fill="none"
              stroke={phase.trackColor}
              strokeWidth="10"
            />

            {/* Progress arc — animates countdown */}
            <circle
              cx="120" cy="120" r={CIRCLE_R}
              fill="none"
              stroke={phase.color}
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={active ? strokeDashoffset : CIRCUMFERENCE}
              transform="rotate(-90 120 120)"
              filter="url(#breath-glow)"
              style={{
                transition: active ? "stroke-dashoffset 1s linear, stroke 0.8s ease" : "none",
              }}
            />

            {/* Ambient outer glow ring — pulses with phase */}
            {active && (
              <circle
                cx="120" cy="120" r="105"
                fill="none"
                stroke={phase.glow}
                strokeWidth="24"
                style={{
                  filter: `blur(14px)`,
                  transition: `r ${phase.duration * 1000}ms ease-in-out, stroke ${800}ms ease`,
                }}
              />
            )}
          </svg>

          {/* Centre circle — scales with breathing */}
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{ transition: `transform ${phase.duration * 1000}ms cubic-bezier(0.4, 0, 0.2, 1)`, transform: circleTransform }}
          >
            {/* Morphing Zen Liquid background */}
            <div
              className="absolute animate-zen-blob shadow-xl transition-colors duration-700"
              style={{
                width: 120,
                height: 120,
                left: "calc(50% - 60px)",
                top: "calc(50% - 60px)",
                background: active ? phase.color : "oklch(0.71 0.045 160)",
                boxShadow: active ? `0 8px 40px -8px ${phase.glow}` : undefined,
              }}
            />
            
            {/* Stable non-rotating text content */}
            <div className="relative z-10 flex flex-col items-center justify-center text-white select-none">
              {active ? (
                <>
                  <p className="font-display text-4xl font-bold leading-none">
                    {countdown}
                  </p>
                  <p className="text-[10px] font-medium opacity-80 mt-0.5">detik</p>
                </>
              ) : (
                <p className="font-display text-lg font-semibold">4·4·6</p>
              )}
            </div>
          </div>
        </div>

        {/* Phase label — changes automatically */}
        <div className="mt-5 h-12 flex flex-col items-center justify-center">
          {active && (
            <div key={phaseIdx} className="animate-slide-up text-center">
              <p className="font-display text-xl font-bold text-foreground" style={{ color: phase.color }}>
                {phase.label}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">{phase.sub}</p>
            </div>
          )}
          {!active && !justFinished && (
            <p className="text-sm text-muted-foreground">Ikuti ritme lingkaran — tarik, tahan, buang</p>
          )}
          {justFinished && (
            <div className="animate-slide-up text-center">
              <p className="font-display text-base font-bold text-emerald-700">Latihan selesai! 🌿</p>
              <p className="text-xs text-muted-foreground">Bagaimana perasaanmu sekarang?</p>
            </div>
          )}
        </div>

        {/* Cycle progress dots */}
        {active && (
          <div className="mt-4 flex justify-center gap-2">
            {Array.from({ length: TOTAL_CYCLES }).map((_, i) => (
              <div
                key={i}
                className="h-2 w-7 rounded-full transition-all duration-500"
                style={{
                  background:
                    i < cycle
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
              {justFinished ? "Ulangi Latihan" : "Mulai Latihan"}
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
