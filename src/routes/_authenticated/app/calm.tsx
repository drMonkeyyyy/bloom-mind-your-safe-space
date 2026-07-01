import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/app/calm")({
  component: Page,
});

type Tool = "breath" | "ground" | "selftalk" | "vent" | null;

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

  const handleRelease = () => {
    if (!text.trim()) return;
    setIsReleasing(true);
    setTimeout(() => {
      setReleased(true);
      setIsReleasing(false);
      setText("");
    }, 1500);
  };

  if (released) {
    return (
      <section className="rounded-3xl bg-card p-6 ring-1 ring-border/60 shadow-card text-center space-y-4 animate-scale-in">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-primary-soft text-3xl animate-float">
          🌿
        </div>
        <h3 className="font-display text-xl font-semibold text-primary">Beban Pikiran Telah Dilepaskan</h3>
        <p className="text-sm text-muted-foreground leading-relaxed max-w-sm mx-auto">
          Pikiranmu telah dilepaskan dan ditiup angin. Tarik napas dalam-dalam. Semuanya akan baik-baik saja. 🤍
        </p>
        <button
          onClick={() => setReleased(false)}
          className="rounded-full border border-border px-5 py-2 text-xs font-semibold hover:bg-cream-deep transition-all duration-200"
        >
          Tulis Lagi
        </button>
      </section>
    );
  }

  return (
    <section className="rounded-3xl bg-card p-6 ring-1 ring-border/60 shadow-card space-y-4">
      <div className="flex items-center gap-3">
        <span className="text-3xl animate-float">🌬️</span>
        <div>
          <p className="font-display text-lg font-semibold">Kotak Pelepasan Beban</p>
          <p className="text-xs text-muted-foreground">Tuliskan apa pun kecemasanmu, lalu biarkan menguap pergi.</p>
        </div>
      </div>

      <div className="relative">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={isReleasing}
          placeholder="Tulis apa saja yang mengganjal di pikiranmu di sini tanpa takut dihakimi..."
          rows={5}
          className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm resize-none placeholder:text-muted-foreground/60 transition-all duration-200"
          style={{
            transition: "all 1.5s cubic-bezier(0.25, 0.8, 0.25, 1)",
            opacity: isReleasing ? 0 : 1,
            transform: isReleasing ? "scale(0.85) translateY(-20px)" : "scale(1)",
            filter: isReleasing ? "blur(10px)" : "none",
            pointerEvents: isReleasing ? "none" : "auto",
          }}
        />
        {isReleasing && (
          <div className="absolute inset-0 grid place-items-center pointer-events-none animate-pulse">
            <span className="text-sm font-semibold text-primary">Melepaskan beban pikiranmu... 🍃</span>
          </div>
        )}
      </div>

      <button
        onClick={handleRelease}
        disabled={isReleasing || !text.trim()}
        className="w-full rounded-full bg-accent py-3.5 text-sm font-semibold text-accent-foreground shadow-peach transition-all duration-300 btn-spring disabled:opacity-40"
      >
        {isReleasing ? "Menguap..." : "Lepaskan & Biarkan Pergi 🌬️"}
      </button>
    </section>
  );
}

/* ── Soundscape Web Audio Synthesizer ───────────────────────────── */
function createBrownNoiseBuffer(ctx: AudioContext) {
  const bufferSize = 2 * ctx.sampleRate;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  let lastOut = 0.0;
  for (let i = 0; i < bufferSize; i++) {
    const white = Math.random() * 2 - 1;
    data[i] = (lastOut + (0.02 * white)) / 1.02;
    lastOut = data[i];
    data[i] *= 3.5; // Compensate for gain loss
  }
  return buffer;
}

function AmbientSoundPlayer() {
  const [activeSound, setActiveSound] = useState<"rain" | "waves" | null>(null);
  const [volume, setVolume] = useState(0.5);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const rainSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const rainGainRef = useRef<GainNode | null>(null);
  const wavesSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const wavesGainRef = useRef<GainNode | null>(null);
  const waveIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const initContext = () => {
    if (!audioCtxRef.current) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      audioCtxRef.current = new AudioCtx();
    }
    if (audioCtxRef.current.state === "suspended") {
      audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  };

  const stopAll = () => {
    if (rainSourceRef.current) {
      try { rainSourceRef.current.stop(); } catch (e) {}
      rainSourceRef.current = null;
    }
    rainGainRef.current = null;

    if (wavesSourceRef.current) {
      try { wavesSourceRef.current.stop(); } catch (e) {}
      wavesSourceRef.current = null;
    }
    wavesGainRef.current = null;

    if (waveIntervalRef.current) {
      clearInterval(waveIntervalRef.current);
      waveIntervalRef.current = null;
    }

    setActiveSound(null);
  };

  const playRain = (ctx: AudioContext) => {
    stopAll();
    const source = ctx.createBufferSource();
    source.buffer = createBrownNoiseBuffer(ctx);
    source.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(800, ctx.currentTime);

    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(volume * 0.35, ctx.currentTime);

    source.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(ctx.destination);

    source.start();

    rainSourceRef.current = source;
    rainGainRef.current = gainNode;
    setActiveSound("rain");
  };

  const playWaves = (ctx: AudioContext) => {
    stopAll();
    const source = ctx.createBufferSource();
    source.buffer = createBrownNoiseBuffer(ctx);
    source.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(450, ctx.currentTime);

    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(0.05, ctx.currentTime);

    source.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(ctx.destination);

    source.start();

    wavesSourceRef.current = source;
    wavesGainRef.current = gainNode;
    setActiveSound("waves");

    let tick = 0;
    waveIntervalRef.current = setInterval(() => {
      if (!gainNode) return;
      const cycle = 80; // 8 seconds
      const val = 0.18 + 0.15 * Math.sin((2 * Math.PI * tick) / cycle);
      gainNode.gain.setTargetAtTime(val * volume, ctx.currentTime, 0.1);
      tick = (tick + 1) % cycle;
    }, 100);
  };

  const toggleSound = (sound: "rain" | "waves") => {
    try {
      const ctx = initContext();
      if (activeSound === sound) {
        stopAll();
      } else {
        if (sound === "rain") playRain(ctx);
        else playWaves(ctx);
      }
    } catch (err) {
      console.error("Audio failed", err);
      toast.error("Gagal memulai audio");
    }
  };

  useEffect(() => {
    if (rainGainRef.current && audioCtxRef.current) {
      rainGainRef.current.gain.setTargetAtTime(volume * 0.35, audioCtxRef.current.currentTime, 0.1);
    }
    if (wavesGainRef.current && audioCtxRef.current) {
      // Modulator handles waves, this sets master baseline volume
    }
  }, [volume]);

  useEffect(() => {
    return () => {
      stopAll();
    };
  }, []);

  return (
    <div className="rounded-3xl bg-card p-5 ring-1 ring-border/60 shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-scale-in">
      <div className="flex items-center gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-2xl bg-primary-soft text-xl">
          {activeSound === "rain" ? "🌧️" : activeSound === "waves" ? "🌊" : "🎵"}
        </div>
        <div>
          <p className="text-sm font-semibold">Soundscape Penenang</p>
          <p className="text-xs text-muted-foreground">
            {activeSound === "rain"
              ? "Menikmati suara rintik hujan..."
              : activeSound === "waves"
              ? "Menikmati deburan ombak laut..."
              : "Nyalakan suara latar untuk membantumu rileks"}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={() => toggleSound("rain")}
          className={`px-3.5 py-2 rounded-full text-xs font-semibold flex items-center gap-1 transition-all duration-200 ${
            activeSound === "rain"
              ? "bg-primary text-primary-foreground shadow-soft"
              : "border border-border/60 hover:bg-cream-deep text-foreground"
          }`}
        >
          <span>🌧️</span> Rain
        </button>

        <button
          onClick={() => toggleSound("waves")}
          className={`px-3.5 py-2 rounded-full text-xs font-semibold flex items-center gap-1 transition-all duration-200 ${
            activeSound === "waves"
              ? "bg-primary text-primary-foreground shadow-soft"
              : "border border-border/60 hover:bg-cream-deep text-foreground"
          }`}
        >
          <span>🌊</span> Waves
        </button>

        {activeSound && (
          <button
            onClick={stopAll}
            className="h-8 w-8 rounded-full border border-destructive/30 flex items-center justify-center text-xs text-destructive hover:bg-destructive/5 active:scale-95 transition-all"
            title="Matikan Suara"
          >
            ⏹️
          </button>
        )}

        {activeSound && (
          <div className="flex items-center gap-2 pl-2 border-l border-border/60 h-6">
            <span className="text-xs text-muted-foreground">🔈</span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="w-16 h-1 cursor-pointer accent-primary"
              aria-label="Volume soundscape"
            />
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Main Page ──────────────────────────────────────────────────── */
function Page() {
  const [tool, setTool] = useState<Tool>(null);

  const tools = [
    { k: "breath" as Tool, icon: "🌬️", title: "Breathing 4-7-8", desc: "Latihan napas terbimbing dengan timer", color: "oklch(0.71 0.045 160)" },
    { k: "ground" as Tool, icon: "🌍", title: "Grounding 5-4-3-2-1", desc: "Kembali ke momen saat ini", color: "oklch(0.65 0.06 230)" },
    { k: "selftalk" as Tool, icon: "🤍", title: "Self-Calming Talk", desc: "Kalimat menenangkan untuk dirimu", color: "oklch(0.70 0.05 310)" },
    { k: "vent" as Tool, icon: "🍃", title: "Kotak Pelepasan", desc: "Tulis beban pikiran lalu biarkan melarut", color: "oklch(0.77 0.085 40)" },
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
    </div>
  );
}
