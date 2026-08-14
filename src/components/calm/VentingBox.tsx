import { useState, useEffect } from "react";

export function VentingBox() {
  const [text, setText] = useState("");
  const [isReleasing, setIsReleasing] = useState(false);
  const [released, setReleased] = useState(false);
  const [releaseMethod, setReleaseMethod] = useState<"burn" | "shred" | "float" | "fly" | null>(null);
  const [burnProgress, setBurnProgress] = useState(0);
  // Crumple animation: idle -> crumpling -> tossing -> done
  const [crumplePhase, setCrumplePhase] = useState<"idle" | "crumpling" | "tossing">("idle");
  // Float animation: idle -> dissolving -> sailing -> starlight -> done
  const [floatPhase, setFloatPhase] = useState<"idle" | "dissolving" | "sailing" | "starlight">("idle");
  // Fly animation: idle -> attaching -> ascending -> constellation -> done
  const [flyPhase, setFlyPhase] = useState<"idle" | "attaching" | "ascending" | "constellation">("idle");
  const [currentReadDuration, setCurrentReadDuration] = useState(5500);
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

  const handleRelease = (method: "burn" | "shred" | "float" | "fly") => {
    if (!text.trim()) return;
    setReleaseMethod(method);
    setIsReleasing(true);

    // Calculate reading time based on text length (5000ms minimum to 10000ms max)
    const readTime = Math.max(5000, Math.min(10000, text.trim().length * 45 + 3500));
    setCurrentReadDuration(readTime);

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
    } else if (method === "float") {
      // Phase 1: Ink dissolving & bleeding into water stream (0 to readTime)
      setFloatPhase("dissolving");
      // Phase 2: Paper boat sailing on serene river (readTime to readTime + 4000ms)
      setTimeout(() => setFloatPhase("sailing"), readTime);
      // Phase 3: Boat dissolving into glowing starlight fireflies & closing text (readTime + 4000ms to readTime + 11500ms) [7.5s reading time!]
      setTimeout(() => setFloatPhase("starlight"), readTime + 4000);
      // Phase 4: Done & show completion screen (readTime + 11500ms)
      setTimeout(() => {
        setReleased(true);
        setIsReleasing(false);
        setFloatPhase("idle");
        setText("");
      }, readTime + 11500);
    } else if (method === "fly") {
      // Phase 1: Attaching note to sky lantern (0 to readTime)
      setFlyPhase("attaching");
      // Phase 2: Sky lantern sways and ascends into cosmic sky (readTime to readTime + 4000ms)
      setTimeout(() => setFlyPhase("ascending"), readTime);
      // Phase 3: Lantern turns into constellation star & closing text (readTime + 4000ms to readTime + 11500ms) [7.5s reading time!]
      setTimeout(() => setFlyPhase("constellation"), readTime + 4000);
      // Phase 4: Done (readTime + 11500ms)
      setTimeout(() => {
        setReleased(true);
        setIsReleasing(false);
        setFlyPhase("idle");
        setText("");
      }, readTime + 11500);
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
            {releaseMethod === "burn" ? "🕊️" : releaseMethod === "float" ? "⛵" : releaseMethod === "fly" ? "🎈" : "🗑️"}
          </div>
        </div>
        <div className="space-y-1.5">
          <h3 className="font-display text-xl font-bold text-primary">
            {releaseMethod === "burn"
              ? "Sudah Dilepaskan"
              : releaseMethod === "float"
              ? "Sudah Dihanyutkan"
              : releaseMethod === "fly"
              ? "Sudah Diterbangkan"
              : "Sudah Dibuang"}
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed max-w-xs mx-auto">
            {releaseMethod === "burn"
              ? "Beban itu kini hanya abu yang terbawa angin. Napas dalam, rasakan ringannya."
              : releaseMethod === "float"
              ? "Beban pikiranmu telah dihanyutkan perahu kertas di atas arus air yang tenang. Biarkan ia larut & sirna."
              : releaseMethod === "fly"
              ? "Beban pikiranmu telah terbawa lentera angin ke angkasa bebas. Napas dalam, rasakan kelegaannya."
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
            <div className="flex items-center gap-2">
              <p className="font-display text-base font-semibold leading-snug">Kotak Pelepasan Beban</p>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                🔒 100% Rahasia & Musnah
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">Tulis, lalu pilih cara melenyapkan kecemasanmu.</p>
          </div>
        </div>
        <span className={`text-[10px] font-mono tabular-nums mt-1 flex-shrink-0 ${
          charCount > maxChars * 0.9 ? "text-destructive" : "text-muted-foreground/50"
        }`}>
          {charCount}/{maxChars}
        </span>
      </div>

      {/* Paper / Water area */}
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
                {[0, 1, 2].map(i => (
                  <div key={i} className="absolute top-2 bottom-2 w-px bg-white/10" style={{ left: `${25 + i * 25}%` }} />
                ))}
                <div className="absolute top-0 left-0 bottom-0 w-2 bg-gradient-to-r from-white/20 to-transparent" />
              </div>
            </div>
          </div>
        )}

        {/* Paper Boat Water Stream animation overlay */}
        {isReleasing && releaseMethod === "float" && (
          <div className="absolute inset-0 z-30 flex flex-col items-center justify-center overflow-hidden transition-all duration-700"
            style={{
              background: floatPhase === "starlight"
                ? "linear-gradient(180deg, #030712 0%, #0c1527 50%, #031326 100%)"
                : "linear-gradient(180deg, #071f30 0%, #0d3b59 45%, #08283e 100%)",
            }}
          >
            {/* River Stream Moving Water Background Lines */}
            <div className="absolute inset-0 pointer-events-none opacity-25 animate-river-current"
              style={{
                backgroundImage: "radial-gradient(ellipse at 50% 50%, rgba(34, 211, 238, 0.4) 0%, transparent 60%), repeating-linear-gradient(90deg, transparent, transparent 40px, rgba(165, 243, 252, 0.15) 40px, rgba(165, 243, 252, 0.15) 80px)",
                backgroundSize: "400px 100%",
              }}
            />

            {/* Water Ripple Waves */}
            <div className="absolute inset-0 pointer-events-none opacity-40">
              <div className="absolute top-1/4 left-1/5 w-48 h-48 rounded-full border border-cyan-300/40 animate-water-ring" />
              <div className="absolute top-1/2 right-1/4 w-60 h-60 rounded-full border border-teal-200/30 animate-water-ring" style={{ animationDelay: "0.8s" }} />
              <div className="absolute bottom-1/4 left-1/3 w-72 h-72 rounded-full border border-sky-300/20 animate-water-ring" style={{ animationDelay: "1.5s" }} />
            </div>

            {/* Floating Pink Lotus Petals / Leaves moving down stream */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              <div className="absolute top-12 left-0 text-lg animate-float-leaf" style={{ animationDelay: "0s" }}>🌸</div>
              <div className="absolute top-28 left-0 text-base animate-float-leaf" style={{ animationDelay: "1.8s" }}>🍃</div>
              <div className="absolute top-44 left-0 text-sm animate-float-leaf" style={{ animationDelay: "3.2s" }}>🌸</div>
            </div>

            {/* Water surface reflection sparkles */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              {Array.from({ length: 24 }).map((_, i) => (
                <div
                  key={i}
                  className="absolute rounded-full bg-cyan-200/60 animate-pulse"
                  style={{
                    left: `${(i * 13) % 96}%`,
                    top: `${10 + ((i * 19) % 80)}%`,
                    width: `${3 + (i % 4) * 3}px`,
                    height: `${2 + (i % 3) * 2}px`,
                    filter: "blur(1px)",
                    animationDuration: `${1.2 + (i % 3) * 0.7}s`,
                    animationDelay: `${(i * 0.12) % 1.5}s`,
                  }}
                />
              ))}
            </div>

            {/* Phase 1: Text Ink Dissolving Effect */}
            {floatPhase === "dissolving" && (
              <div className="relative z-10 px-8 text-center space-y-4 animate-scale-in">
                <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-cyan-500/20 border border-cyan-300/30 text-cyan-200 text-xs font-medium backdrop-blur-md">
                  <span>💧</span>
                  <span>Tinta tulisan meluntur ke dalam air…</span>
                </div>
                <div className="max-w-md mx-auto p-5 rounded-2xl bg-white/10 backdrop-blur-md border border-cyan-200/25 shadow-2xl">
                  <p
                    className="font-serif italic text-base text-cyan-100 leading-relaxed animate-ink-bleed"
                    style={{ animationDuration: `${currentReadDuration}ms` }}
                  >
                    "{text}"
                  </p>
                </div>
                <p className="text-[11px] text-cyan-200/70 italic tracking-wider animate-pulse">
                  Tarik napas perlahan, biarkan air menyerap kecemasanmu…
                </p>
              </div>
            )}

            {/* Phase 2: Paper Boat Sailing (2200ms - 5200ms) */}
            {floatPhase === "sailing" && (
              <div className="relative z-20 flex flex-col items-center justify-center w-full h-full">
                <div className="animate-boat-sail-expressive flex flex-col items-center">
                  {/* Origami Paper Boat with glowing lotus candle inside */}
                  <div className="relative w-36 h-28 animate-boat-bob drop-shadow-[0_16px_32px_rgba(0,0,0,0.5)]">
                    <svg viewBox="0 0 100 65" className="w-full h-full overflow-visible">
                      {/* Left Sail */}
                      <polygon points="50,5 16,42 50,42" fill="#fefefc" stroke="#cbd5e1" strokeWidth="0.8" />
                      {/* Right Sail */}
                      <polygon points="50,8 84,42 50,42" fill="#f1f5f9" stroke="#94a3b8" strokeWidth="0.8" />
                      {/* Inner Candle Flame */}
                      <circle cx="50" cy="36" r="4" fill="#fbbf24" className="animate-pulse" />
                      <circle cx="50" cy="36" r="8" fill="#f59e0b" opacity="0.4" className="animate-pulse" />
                      {/* Boat Hull */}
                      <polygon points="6,42 94,42 78,62 22,62" fill="#ffffff" stroke="#475569" strokeWidth="1" />
                      <polygon points="6,42 50,42 50,62 22,62" fill="#e2e8f0" />
                      <line x1="50" y1="42" x2="50" y2="62" stroke="#334155" strokeWidth="0.8" />
                    </svg>

                    {/* Water Wake / Glowing trail */}
                    <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-40 h-5 rounded-full bg-cyan-400/35 blur-md animate-pulse" />
                  </div>
                </div>

                <div className="absolute bottom-6 text-center space-y-1">
                  <p className="text-xs text-cyan-100 font-semibold tracking-wide animate-pulse">
                    Perahu kertas berlayar membawa pergi sisa kecemasanmu… ⛵
                  </p>
                  <p className="text-[10px] text-cyan-300/70">
                    Memasuki kedamaian laut luas yang tak bertepi
                  </p>
                </div>
              </div>
            )}

            {/* Phase 3: Starlight Dissolve into Stars (7.5 seconds reading time) */}
            {floatPhase === "starlight" && (
              <div className="relative z-30 flex flex-col items-center justify-center text-center px-6 animate-scale-in space-y-4">
                {/* Bioluminescent rising particles */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                  {Array.from({ length: 30 }).map((_, i) => (
                    <div
                      key={i}
                      className="absolute rounded-full bg-cyan-200 shadow-[0_0_12px_#38bdf8] animate-starlight-rise"
                      style={{
                        left: `${(i * 11) % 92}%`,
                        bottom: `${10 + (i * 3) % 40}%`,
                        width: `${4 + (i % 4) * 3}px`,
                        height: `${4 + (i % 4) * 3}px`,
                        animationDuration: `${1.8 + (i % 3) * 0.6}s`,
                        animationDelay: `${(i * 0.08) % 1}s`,
                      }}
                    />
                  ))}
                </div>

                <div className="w-16 h-16 rounded-full bg-cyan-400/20 border border-cyan-300/40 flex items-center justify-center text-3xl animate-bounce-check shadow-[0_0_30px_rgba(56,189,248,0.3)]">
                  ✨
                </div>

                <div className="space-y-1.5 max-w-sm">
                  <p className="text-base font-bold text-cyan-100 font-display">
                    Semua Beban Telah Musnah & Menjadi Kedamaian
                  </p>
                  <p className="text-xs text-cyan-200/90 leading-relaxed">
                    Perahu & tulisanmu telah larut menjadi debu bintang di langit malam. Hembuskan napas, kamu aman.
                  </p>
                </div>

                <button
                  onClick={() => { setReleased(true); setIsReleasing(false); setFloatPhase("idle"); setText(""); }}
                  className="mt-2 rounded-full bg-cyan-400/20 hover:bg-cyan-400/30 border border-cyan-200/40 px-5 py-2 text-xs font-semibold text-cyan-100 transition-all active:scale-95 cursor-pointer shadow-sm"
                >
                  Selesai & Melangkah Maju ➔
                </button>
              </div>
            )}
          </div>
        )}

        {/* Sky Lantern / Balloon Release Overlay */}
        {isReleasing && releaseMethod === "fly" && (
          <div
            className="absolute inset-0 z-30 flex flex-col items-center justify-center overflow-hidden transition-all duration-700"
            style={{
              background: flyPhase === "constellation"
                ? "linear-gradient(180deg, #050212 0%, #0d0626 50%, #08031a 100%)"
                : "linear-gradient(180deg, #13072b 0%, #240a45 45%, #160733 100%)",
            }}
          >
            {/* Drifting Clouds in background */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-30">
              <div className="absolute top-10 text-4xl animate-cloud-drift" style={{ animationDuration: "14s", animationDelay: "0s" }}>☁️</div>
              <div className="absolute top-28 text-5xl animate-cloud-drift" style={{ animationDuration: "18s", animationDelay: "3s" }}>☁️</div>
            </div>

            {/* Background Distant Festival Lanterns */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              {Array.from({ length: 12 }).map((_, i) => (
                <div
                  key={i}
                  className="absolute text-sm opacity-60 animate-balloon-rise-expressive"
                  style={{
                    left: `${(i * 19 + 7) % 90}%`,
                    bottom: `${(i * 15) % 60}%`,
                    animationDuration: `${5.5 + (i % 3)}s`,
                    animationDelay: `${(i * 0.3) % 2}s`,
                    filter: "blur(0.8px) drop-shadow(0 0 6px rgba(234,179,8,0.8))",
                  }}
                >
                  🏮
                </div>
              ))}
            </div>

            {/* Glowing Twinkling Stars */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              {Array.from({ length: 28 }).map((_, i) => (
                <div
                  key={i}
                  className="absolute rounded-full bg-purple-200/70 animate-pulse"
                  style={{
                    left: `${(i * 13 + 3) % 96}%`,
                    top: `${8 + ((i * 17) % 82)}%`,
                    width: `${2 + (i % 3) * 2}px`,
                    height: `${2 + (i % 3) * 2}px`,
                    animationDuration: `${1.2 + (i % 4) * 0.5}s`,
                    animationDelay: `${(i * 0.15) % 1.5}s`,
                  }}
                />
              ))}
            </div>

            {/* Phase 1: Attaching Note to Sky Lantern */}
            {flyPhase === "attaching" && (
              <div className="relative z-10 px-8 text-center space-y-4 animate-scale-in">
                <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-purple-500/20 border border-purple-300/30 text-purple-200 text-xs font-medium backdrop-blur-md">
                  <span>🎈</span>
                  <span>Mengikat beban tulisanmu pada lentera angin…</span>
                </div>
                <div className="max-w-md mx-auto p-5 rounded-2xl bg-white/10 backdrop-blur-md border border-purple-200/25 shadow-2xl">
                  <p
                    className="font-serif italic text-base text-purple-100 leading-relaxed animate-ink-bleed"
                    style={{ animationDuration: `${currentReadDuration}ms` }}
                  >
                    "{text}"
                  </p>
                </div>
                <p className="text-[11px] text-purple-200/70 italic tracking-wider animate-pulse">
                  Bersiap melepaskan sisa beban ke angkasa bebas…
                </p>
              </div>
            )}

            {/* Phase 2: Ascending Sky Lantern (2200ms - 5200ms) */}
            {flyPhase === "ascending" && (
              <div className="relative z-20 flex flex-col items-center justify-center w-full h-full">
                <div className="animate-balloon-rise-expressive flex flex-col items-center">
                  {/* Glowing Hot-Air Sky Lantern SVG */}
                  <div className="relative w-36 h-40 animate-balloon-sway animate-lantern-glow">
                    <svg viewBox="0 0 100 120" className="w-full h-full overflow-visible">
                      {/* Lantern Top Dome */}
                      <path
                        d="M 20,50 Q 20,10 50,10 Q 80,10 80,50 Q 80,75 68,85 Q 50,92 32,85 Q 20,75 20,50 Z"
                        fill="url(#lanternGrad)"
                        stroke="#fef08a"
                        strokeWidth="1"
                      />
                      {/* Inner Glowing Heat Core */}
                      <ellipse cx="50" cy="55" rx="20" ry="25" fill="#fde047" opacity="0.6" className="animate-pulse" />
                      <ellipse cx="50" cy="55" rx="10" ry="12" fill="#ffffff" opacity="0.9" />

                      {/* Frame Base Ring */}
                      <ellipse cx="50" cy="85" rx="18" ry="4" fill="#854d0e" />

                      {/* Ropes holding the Scroll */}
                      <line x1="40" y1="87" x2="44" y2="105" stroke="#fef08a" strokeWidth="1" />
                      <line x1="60" y1="87" x2="56" y2="105" stroke="#fef08a" strokeWidth="1" />

                      {/* Rolled Paper Scroll */}
                      <rect x="36" y="105" width="28" height="10" rx="3" fill="#fef3c7" stroke="#d97706" strokeWidth="0.8" />
                      <line x1="50" y1="105" x2="50" y2="115" stroke="#b45309" strokeWidth="1" />

                      {/* Gradients */}
                      <defs>
                        <linearGradient id="lanternGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor="#f59e0b" />
                          <stop offset="50%" stopColor="#d97706" />
                          <stop offset="100%" stopColor="#b45309" />
                        </linearGradient>
                      </defs>
                    </svg>

                    {/* Bottom Heat Glow Aura */}
                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-24 h-6 rounded-full bg-amber-400/40 blur-md animate-pulse" />
                  </div>
                </div>

                <div className="absolute bottom-6 text-center space-y-1">
                  <p className="text-xs text-purple-100 font-semibold tracking-wide animate-pulse">
                    Lentera angin membubung tinggi melepaskan rasa cemasmu… 🌌
                  </p>
                  <p className="text-[10px] text-purple-300/70">
                    Terbang bebas meninggalkan bumi menuju bintang-bintang
                  </p>
                </div>
              </div>
            )}

            {/* Phase 3: Constellation Dissolve (7.5 seconds reading time) */}
            {flyPhase === "constellation" && (
              <div className="relative z-30 flex flex-col items-center justify-center text-center px-6 animate-scale-in space-y-4">
                <div className="w-16 h-16 rounded-full bg-purple-500/20 border border-purple-300/40 flex items-center justify-center text-3xl animate-bounce-check shadow-[0_0_30px_rgba(168,85,247,0.4)]">
                  🌟
                </div>

                <div className="space-y-1.5 max-w-sm">
                  <p className="text-base font-bold text-purple-100 font-display">
                    Bebanmu Telah Terbebas & Menjadi Bintang
                  </p>
                  <p className="text-xs text-purple-200/90 leading-relaxed">
                    Lentera & tulisanmu telah menjadi rasi bintang kecil di langit malam. Napas dalam, kamu aman.
                  </p>
                </div>

                <button
                  onClick={() => { setReleased(true); setIsReleasing(false); setFlyPhase("idle"); setText(""); }}
                  className="mt-2 rounded-full bg-purple-400/20 hover:bg-purple-400/30 border border-purple-200/40 px-5 py-2 text-xs font-semibold text-purple-100 transition-all active:scale-95 cursor-pointer shadow-sm"
                >
                  Selesai & Melangkah Maju ➔
                </button>
              </div>
            )}
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
      <div className="px-6 pb-6 pt-4 grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <button
          id="venting-burn-btn"
          onClick={() => handleRelease("burn")}
          disabled={isReleasing || !text.trim()}
          className="group flex items-center justify-center gap-2 rounded-2xl py-3 text-xs font-semibold transition-all duration-250 active:scale-95 disabled:opacity-35 disabled:cursor-not-allowed"
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
          className="group flex items-center justify-center gap-2 rounded-2xl py-3 text-xs font-semibold transition-all duration-250 active:scale-95 disabled:opacity-35 disabled:cursor-not-allowed"
          style={{
            background: "linear-gradient(135deg, oklch(0.55 0.13 250), oklch(0.45 0.18 265))",
            color: "white",
            boxShadow: text.trim() ? "0 4px 16px -4px oklch(0.45 0.18 265 / 0.4)" : "none",
          }}
        >
          <span className="text-base">🗑️</span>
          <span>Remas & Buang</span>
        </button>
        <button
          id="venting-float-btn"
          onClick={() => handleRelease("float")}
          disabled={isReleasing || !text.trim()}
          className="group flex items-center justify-center gap-2 rounded-2xl py-3 text-xs font-semibold transition-all duration-250 active:scale-95 disabled:opacity-35 disabled:cursor-not-allowed"
          style={{
            background: "linear-gradient(135deg, #0284c7, #0369a1)",
            color: "white",
            boxShadow: text.trim() ? "0 4px 16px -4px #0284c755" : "none",
          }}
        >
          <span className="text-base">🌊</span>
          <span>Hanyutkan Air</span>
        </button>
        <button
          id="venting-fly-btn"
          onClick={() => handleRelease("fly")}
          disabled={isReleasing || !text.trim()}
          className="group flex items-center justify-center gap-2 rounded-2xl py-3 text-xs font-semibold transition-all duration-250 active:scale-95 disabled:opacity-35 disabled:cursor-not-allowed"
          style={{
            background: "linear-gradient(135deg, #a855f7, #7e22ce)",
            color: "white",
            boxShadow: text.trim() ? "0 4px 16px -4px #a855f755" : "none",
          }}
        >
          <span className="text-base">🎈</span>
          <span>Terbangkan Balon</span>
        </button>
      </div>
    </section>
  );
}

