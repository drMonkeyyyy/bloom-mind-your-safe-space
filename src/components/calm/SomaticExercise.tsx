import { useState, useEffect } from "react";

type SomaticType = "butterfly" | "chest" | null;

export function SomaticExercise() {
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
          style={isActive ? {} : { background: "linear-gradient(135deg, oklch(0.58 0.14 200), oklch(0.58 0.14 220))", boxShadow: "0 4px 16px -4px oklch(0.58 0.14 220 / 0.45)" }}
        >
          {isActive ? "⏹ Hentikan" : "▶ Mulai Napas Terpandu"}
        </button>
      </div>
    </section>
  );
}
