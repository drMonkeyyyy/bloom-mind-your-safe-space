import { useState, useEffect, useRef } from "react";

const PHASES = [
  { label: "Tarik Napas", duration: 4, color: "oklch(0.71 0.045 160)" },
  { label: "Tahan", duration: 7, color: "oklch(0.65 0.06 230)" },
  { label: "Buang Napas", duration: 8, color: "oklch(0.77 0.085 40)" },
];

export function BreathingExercise() {
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
