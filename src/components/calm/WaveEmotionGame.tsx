import { useState, useEffect, useRef, useCallback } from "react";
import { playAmbientSound, toggleAmbientSound, setChannelVolume, subscribeAudioState } from "@/lib/audio";

// ── Types ──────────────────────────────────────────────────────────────────
type Phase = "idle" | "inhale" | "hold" | "exhale" | "rest";

interface BreathingPattern {
  name: string;
  inhale: number;
  hold: number;
  exhale: number;
  rest: number;
  description: string;
}

// ── Breathing Patterns ─────────────────────────────────────────────────────
const PATTERNS: BreathingPattern[] = [
  { name: "4-7-8 Penenang", inhale: 4, hold: 7, exhale: 8, rest: 0, description: "Untuk kecemasan & pikiran penuh" },
  { name: "Kotak (4-4-4-4)", inhale: 4, hold: 4, exhale: 4, rest: 4, description: "Untuk fokus & keseimbangan" },
  { name: "Napas Santai", inhale: 5, hold: 0, exhale: 5, rest: 2, description: "Untuk rileksasi ringan sehari-hari" },
];

// ── Affirmations ───────────────────────────────────────────────────────────
const AFFIRMATIONS = [
  "Kamu melakukan dengan sangat baik 🌊",
  "Emosi datang dan pergi seperti ombak",
  "Setiap napas membawa ketenangan",
  "Kamu lebih kuat dari badai manapun",
  "Biarkan ombak membawamu ke tempat tenang",
  "Napas adalah jangkar yang selalu ada",
];

// ── Wave Canvas ────────────────────────────────────────────────────────────
function WaveCanvas({ progress, phase }: { progress: number; phase: Phase }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>(0);
  const timeRef = useRef<number>(0);

  const getWaveColor = useCallback(() => {
    if (phase === "inhale") return { r: 56, g: 189, b: 248 };
    if (phase === "hold") return { r: 99, g: 102, b: 241 };
    if (phase === "exhale") return { r: 52, g: 211, b: 153 };
    return { r: 147, g: 197, b: 253 };
  }, [phase]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const W = canvas.width;
    const H = canvas.height;
    const t = (timeRef.current += 0.018);

    ctx.clearRect(0, 0, W, H);

    // Sky gradient background
    const skyGrad = ctx.createLinearGradient(0, 0, 0, H);
    skyGrad.addColorStop(0, "rgba(186, 230, 253, 0.4)");
    skyGrad.addColorStop(1, "rgba(224, 242, 254, 0.2)");
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, W, H);

    const color = getWaveColor();
    const waveHeightFactor = 0.3 + progress * 0.5;
    const baseY = H * (0.82 - waveHeightFactor * 0.52);

    // Draw 3 layered waves
    for (let layer = 2; layer >= 0; layer--) {
      const alpha = [0.18, 0.32, 0.52][layer];
      const speed = [0.6, 1.0, 1.4][layer];
      const amp = H * [0.038, 0.052, 0.068][layer];
      const yOff = [H * 0.04, H * 0.02, 0][layer];
      const freq = [0.011, 0.015, 0.019][layer];

      ctx.beginPath();
      ctx.moveTo(0, baseY + yOff);
      for (let x = 0; x <= W; x += 2) {
        const y =
          baseY +
          yOff +
          Math.sin(x * freq + t * speed) * amp +
          Math.sin(x * freq * 1.7 - t * speed * 0.6) * amp * 0.5;
        ctx.lineTo(x, y);
      }
      ctx.lineTo(W, H);
      ctx.lineTo(0, H);
      ctx.closePath();

      const grad = ctx.createLinearGradient(0, baseY + yOff - amp, 0, H);
      grad.addColorStop(0, `rgba(${color.r}, ${color.g}, ${color.b}, ${alpha})`);
      grad.addColorStop(1, `rgba(${color.r}, ${color.g}, ${color.b}, ${alpha * 0.25})`);
      ctx.fillStyle = grad;
      ctx.fill();
    }



    // Exhale bubbles rising up
    const boardX = W / 2;
    const boardY = baseY + Math.sin(t * 1.4) * 6;
    if (phase === "exhale" || phase === "rest") {
      for (let i = 0; i < 6; i++) {
        const bx = boardX - 25 + i * 10 + Math.sin(t * 1.2 + i) * 4;
        const rawBy = boardY + 18 + ((t * 30 + i * 30) % 80);
        const by = rawBy > boardY + 18 ? rawBy : boardY + 18;
        const br = 1.5 + Math.sin(t * 1.5 + i) * 1;
        const opacity = 0.6 - (rawBy - (boardY + 18)) / 80 * 0.5;
        ctx.beginPath();
        ctx.arc(bx, by, br, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(255, 255, 255, ${Math.max(0, opacity)})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    }

    // Seagulls (decorative)
    const birds = [[0.15, 0.12], [0.22, 0.09], [0.75, 0.15], [0.82, 0.11]];
    birds.forEach(([bxFrac, byFrac], idx) => {
      const bxPos = W * bxFrac + Math.sin(t * 0.4 + idx) * 6;
      const byPos = H * byFrac;
      const wing = Math.sin(t * 2 + idx) * 4;
      ctx.beginPath();
      ctx.moveTo(bxPos - 6, byPos);
      ctx.quadraticCurveTo(bxPos - 3, byPos - wing, bxPos, byPos);
      ctx.quadraticCurveTo(bxPos + 3, byPos - wing, bxPos + 6, byPos);
      ctx.strokeStyle = "rgba(100, 116, 139, 0.4)";
      ctx.lineWidth = 1.2;
      ctx.stroke();
    });

    animFrameRef.current = requestAnimationFrame(draw);
  }, [phase, progress, getWaveColor]);

  useEffect(() => {
    animFrameRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [draw]);

  return (
    <canvas
      ref={canvasRef}
      width={600}
      height={260}
      className="w-full rounded-2xl"
      style={{ maxHeight: 260 }}
    />
  );
}

// ── Main Component ─────────────────────────────────────────────────────────
export function WaveEmotionGame() {
  const [isRunning, setIsRunning] = useState(false);
  const [phase, setPhase] = useState<Phase>("idle");
  const [progress, setProgress] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [cycle, setCycle] = useState(0);
  const [selectedPattern, setSelectedPattern] = useState(0);
  const [affirmationIdx, setAffirmationIdx] = useState(0);
  const [wavesPlaying, setWavesPlaying] = useState(false);
  const [waveVolume, setWaveVolume] = useState(0.6);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const tickRef = useRef(0);
  const stoppedRef = useRef(false);

  // Subscribe to waves audio state
  useEffect(() => {
    const unsub = subscribeAudioState((channels) => {
      setWavesPlaying(channels.waves > 0);
    });
    return unsub;
  }, []);

  // Cleanup on unmount — stop waves if we started them
  useEffect(() => {
    return () => {
      if (window.__bloomChannels?.["waves"]) {
        toggleAmbientSound("waves");
      }
    };
  }, []);

  // Update channel volume when slider changes
  const handleVolumeChange = (v: number) => {
    setWaveVolume(v);
    setChannelVolume("waves", v);
    if (!wavesPlaying) playAmbientSound("waves");
  };

  const getPhaseLabel = () => {
    if (phase === "inhale") return "Tarik Napas...";
    if (phase === "hold") return "Tahan...";
    if (phase === "exhale") return "Hembuskan...";
    if (phase === "rest") return "Istirahat...";
    return "Siap";
  };

  const getPhaseColor = () => {
    if (phase === "inhale") return "text-sky-500";
    if (phase === "hold") return "text-indigo-500";
    if (phase === "exhale") return "text-emerald-500";
    if (phase === "rest") return "text-blue-400";
    return "text-muted-foreground";
  };

  const runPhaseAsync = useCallback(
    (pat: BreathingPattern, currentPhase: Phase): Promise<void> => {
      return new Promise((resolve) => {
        const durations: Record<Phase, number> = {
          inhale: pat.inhale,
          hold: pat.hold,
          exhale: pat.exhale,
          rest: pat.rest,
          idle: 0,
        };
        const dur = durations[currentPhase];
        if (dur === 0 || stoppedRef.current) {
          resolve();
          return;
        }

        setPhase(currentPhase);
        tickRef.current = 0;
        setTimeLeft(dur);

        if (intervalRef.current) clearInterval(intervalRef.current);
        const tickMs = 50;
        const totalTicks = (dur * 1000) / tickMs;

        intervalRef.current = setInterval(() => {
          if (stoppedRef.current) {
            if (intervalRef.current) clearInterval(intervalRef.current);
            resolve();
            return;
          }
          tickRef.current += 1;
          const p = tickRef.current / totalTicks;
          setProgress(
            currentPhase === "inhale" ? p
            : currentPhase === "exhale" ? 1 - p
            : currentPhase === "hold" ? 1
            : 0
          );
          setTimeLeft(Math.max(0, Math.ceil(dur - (tickRef.current * tickMs) / 1000)));

          if (tickRef.current >= totalTicks) {
            if (intervalRef.current) clearInterval(intervalRef.current);
            resolve();
          }
        }, tickMs);
      });
    },
    []
  );

  const runCycles = useCallback(
    async (pat: BreathingPattern) => {
      let c = 1;
      while (!stoppedRef.current) {
        setCycle(c);
        setAffirmationIdx((i) => (i + 1) % AFFIRMATIONS.length);
        await runPhaseAsync(pat, "inhale");
        if (stoppedRef.current) break;
        await runPhaseAsync(pat, "hold");
        if (stoppedRef.current) break;
        await runPhaseAsync(pat, "exhale");
        if (stoppedRef.current) break;
        await runPhaseAsync(pat, "rest");
        c++;
      }
    },
    [runPhaseAsync]
  );

  const handleStart = () => {
    stoppedRef.current = false;
    setIsRunning(true);
    setProgress(0);
    setCycle(1);
    setAffirmationIdx(0);
    // Start waves sound
    setChannelVolume("waves", waveVolume);
    playAmbientSound("waves");
    runCycles(PATTERNS[selectedPattern]);
  };

  const handleStop = () => {
    stoppedRef.current = true;
    setIsRunning(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
    setPhase("idle");
    setProgress(0);
    // Stop waves sound
    if (window.__bloomChannels?.["waves"]) {
      toggleAmbientSound("waves");
    }
    setTimeLeft(0);
    setCycle(0);
  };

  useEffect(() => {
    return () => {
      stoppedRef.current = true;
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const affirmation = AFFIRMATIONS[affirmationIdx];

  return (
    <div
      className="relative overflow-hidden rounded-3xl p-5 sm:p-6 space-y-5"
      style={{
        background: "linear-gradient(160deg, oklch(0.97 0.02 235) 0%, oklch(0.94 0.04 220) 50%, oklch(0.96 0.03 260) 100%)",
      }}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">🌊</span>
            <h2 className="font-display text-xl font-bold text-foreground">Ombak Emosi</h2>
          </div>
          <p className="mt-0.5 text-xs text-muted-foreground max-w-sm">
            Naiki ombak napasmu. Biarkan papan surfing membawamu ke ketenangan — seperti ombak yang selalu mereda.
          </p>
        </div>
        {isRunning && (
          <div className="shrink-0 text-right">
            <p className="text-[10px] text-muted-foreground font-medium">Siklus ke-</p>
            <p className="text-2xl font-bold text-sky-600">{cycle}</p>
          </div>
        )}
      </div>

      {/* Pattern selector (only when idle) */}
      {!isRunning && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Pilih Pola Napas</p>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            {PATTERNS.map((p, i) => (
              <button
                key={p.name}
                onClick={() => setSelectedPattern(i)}
                className={`rounded-2xl p-3 text-left border transition-all cursor-pointer ${
                  selectedPattern === i
                    ? "border-sky-400 bg-sky-50 shadow-sm"
                    : "border-border/60 bg-card hover:bg-sky-50/50"
                }`}
              >
                <p className="text-xs font-bold text-foreground">{p.name}</p>
                <p className="mt-0.5 text-[10px] text-muted-foreground">{p.description}</p>
                <p className="mt-1.5 text-[10px] font-mono text-sky-600">
                  {p.inhale}s{p.hold > 0 ? ` – ${p.hold}s` : ""} – {p.exhale}s{p.rest > 0 ? ` – ${p.rest}s` : ""}
                </p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Wave Canvas */}
      <div className="relative rounded-2xl overflow-hidden border border-sky-200/60 shadow-inner">
        <WaveCanvas progress={progress} phase={phase} />

        {/* Phase Overlay */}
        {isRunning && (
          <div className="absolute inset-x-0 top-3 flex justify-center pointer-events-none">
            <div className="rounded-full bg-white/70 backdrop-blur-sm px-5 py-2 shadow-sm border border-white/50">
              <p className={`text-sm font-bold text-center ${getPhaseColor()}`}>
                {getPhaseLabel()}
                {timeLeft > 0 && <span className="ml-2 font-mono">{timeLeft}s</span>}
              </p>
            </div>
          </div>
        )}

        {/* Idle overlay */}
        {!isRunning && (
          <div className="absolute inset-0 flex items-center justify-center bg-sky-50/30 backdrop-blur-[1px]">
            <p className="text-sm font-semibold text-sky-700 opacity-80">Tekan mulai untuk naiki ombak 🏄‍♀️</p>
          </div>
        )}
      </div>

      {/* Wave volume control */}
      <div className="flex items-center gap-3 rounded-2xl bg-white/50 border border-sky-200/40 px-4 py-2.5">
        <button
          onClick={() => toggleAmbientSound("waves")}
          className="shrink-0 text-lg cursor-pointer transition-transform hover:scale-110 active:scale-95"
          title={wavesPlaying ? "Matikan suara ombak" : "Nyalakan suara ombak"}
        >
          {wavesPlaying ? "🔊" : "🔇"}
        </button>
        <div className="flex-1">
          <p className="text-[10px] font-semibold text-sky-700">Suara Ombak Laut</p>
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={waveVolume}
            onChange={(e) => handleVolumeChange(Number(e.target.value))}
            className="mt-0.5 w-full h-1.5 accent-sky-500 cursor-pointer"
          />
        </div>
        <span className="shrink-0 text-[10px] font-mono text-muted-foreground w-7 text-right">
          {Math.round(waveVolume * 100)}%
        </span>
      </div>

      {/* Affirmation strip */}
      {isRunning && (
        <div
          key={affirmationIdx}
          className="rounded-2xl bg-white/60 border border-sky-200/50 px-4 py-3 text-center"
          style={{ animation: "fadeIn 0.7s ease" }}
        >
          <p className="text-sm font-semibold text-sky-800">✨ {affirmation}</p>
        </div>
      )}

      {/* Progress bar */}
      {isRunning && (
        <div className="space-y-1">
          <div className="flex justify-between text-[10px] text-muted-foreground font-medium">
            <span>
              {phase === "inhale" ? "Naik bersama ombak 🌊"
                : phase === "exhale" ? "Turun bersama ombak 🌿"
                : phase === "hold" ? "Seimbang di puncak ✨"
                : "Tenang di bawah 💙"}
            </span>
            <span>{Math.round(progress * 100)}%</span>
          </div>
          <div className="h-2 w-full rounded-full bg-sky-100 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-100"
              style={{
                width: `${progress * 100}%`,
                background:
                  phase === "inhale" ? "linear-gradient(90deg, #38bdf8, #0ea5e9)"
                  : phase === "hold" ? "linear-gradient(90deg, #818cf8, #6366f1)"
                  : phase === "exhale" ? "linear-gradient(90deg, #34d399, #10b981)"
                  : "linear-gradient(90deg, #93c5fd, #60a5fa)",
              }}
            />
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="flex items-center justify-center gap-3 pt-1">
        {!isRunning ? (
          <button
            onClick={handleStart}
            className="flex items-center gap-2 rounded-full bg-gradient-to-r from-sky-500 to-blue-600 px-8 py-3 text-sm font-bold text-white shadow-md transition-all hover:-translate-y-0.5 hover:shadow-lg active:scale-95 cursor-pointer"
          >
            <span>🏄‍♀️</span>
            <span>Mulai Naiki Ombak</span>
          </button>
        ) : (
          <button
            onClick={handleStop}
            className="flex items-center gap-2 rounded-full bg-card border border-border px-8 py-3 text-sm font-bold text-muted-foreground shadow-sm transition-all hover:bg-red-50 hover:text-red-600 hover:border-red-200 active:scale-95 cursor-pointer"
          >
            <span>⏹</span>
            <span>Berhenti</span>
          </button>
        )}
      </div>

      {/* Clinical note */}
      <p className="text-center text-[10px] text-muted-foreground/70 italic">
        🧠 Teknik <em>Surf the Urge</em> — DBT (Dialectical Behavior Therapy) · Emosi seperti ombak: selalu mereda
      </p>
    </div>
  );
}
