import { useState, useEffect } from "react";

export function VentingBox() {
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
            <div className="absolute inset-0">
              <textarea
                value={text}
                onChange={(e) => { if (e.target.value.length <= maxChars) setText(e.target.value); }}
                disabled={isReleasing}
                placeholder="Tulis apa yang sedang mengganjal pikiranmu…"
                className="w-full h-full bg-transparent text-sm border-none outline-none focus:ring-0 resize-none placeholder:text-amber-900/35 text-amber-950/80 leading-[28px] pl-16 pr-5 pt-[6px] pb-2"
                style={{ 
                  fontFamily: "'Georgia', 'Times New Roman', serif", 
                  fontStyle: "italic", 
                  boxShadow: "none",
                  backgroundColor: "transparent",
                  lineHeight: "28px"
                }}
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
