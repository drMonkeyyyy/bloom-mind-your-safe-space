import { useState, useEffect, useRef } from "react";

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

export function PanicAttackTimer() {
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
