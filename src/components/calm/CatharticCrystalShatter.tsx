import { useState, useRef, useCallback } from "react";
import { playPopSound } from "@/lib/audio";

// ─── Pre-set negative thought categories ───────────────────────────────────
const PRESET_WORDS = [
  "Overthinking", "Takut Gagal", "Tidak Cukup", "Malu", "Cemas",
  "Lelah", "Terlalu Banyak Pikiran", "Sendiri", "Tidak Bisa", "Stres",
  "Pesimis", "Khawatir", "Tertekan", "Ragu-ragu", "Putus Asa",
  "Tidak Percaya Diri", "Kecewa", "Marah", "Panik", "Galau",
];

const BALLOON_COLORS = [
  { fill: "#ef4444", stroke: "#b91c1c", glow: "rgba(239,68,68,0.7)", text: "#fff" },   // Red
  { fill: "#a855f7", stroke: "#7e22ce", glow: "rgba(168,85,247,0.7)", text: "#fff" },  // Purple
  { fill: "#3b82f6", stroke: "#1d4ed8", glow: "rgba(59,130,246,0.7)", text: "#fff" },  // Blue
  { fill: "#f97316", stroke: "#c2410c", glow: "rgba(249,115,22,0.7)", text: "#fff" },  // Orange
  { fill: "#ec4899", stroke: "#9d174d", glow: "rgba(236,72,153,0.7)", text: "#fff" },  // Pink
  { fill: "#eab308", stroke: "#854d0e", glow: "rgba(234,179,8,0.7)", text: "#1a1a1a" }, // Yellow
];

interface Balloon {
  id: number;
  word: string;
  x: number;          // percentage 5–88
  colorIdx: number;
  size: number;       // 72–105px
  swayDuration: number; // 3–6s
  swayDelay: number;
  riseDuration: number; // 8–14s
  popped: boolean;
  popX: number;
  popY: number;
}

interface PoppedParticle {
  id: number;
  balloonId: number;
  angle: number;
  dist: number;
  color: string;
}

let _bId = 0;

function makeBalloon(word: string): Balloon {
  const colorIdx = Math.floor(Math.random() * BALLOON_COLORS.length);
  return {
    id: _bId++,
    word,
    x: 5 + Math.random() * 83,
    colorIdx,
    size: 80 + Math.random() * 32,
    swayDuration: 3 + Math.random() * 3,
    swayDelay: Math.random() * 2,
    riseDuration: 9 + Math.random() * 6,
    popped: false,
    popX: 0,
    popY: 0,
  };
}

export function CatharticCrystalShatter() {
  // ─── State ────────────────────────────────────────────────────────────────
  const [phase, setPhase] = useState<"setup" | "playing" | "cleared">("setup");
  const [customInputs, setCustomInputs] = useState<string[]>([]);
  const [inputText, setInputText] = useState("");
  const [usePresets, setUsePresets] = useState(true);
  const [balloons, setBalloons] = useState<Balloon[]>([]);
  const [poppedParticles, setPoppedParticles] = useState<PoppedParticle[]>([]);
  const [totalPopped, setTotalPopped] = useState(0);
  const [sessionPopped, setSessionPopped] = useState(0);
  const [showNeedle, setShowNeedle] = useState(false);
  const [needlePos, setNeedlePos] = useState({ x: 0, y: 0 });
  const arenaRef = useRef<HTMLDivElement>(null);
  const particleCounterRef = useRef(0);

  // ─── Build words list ─────────────────────────────────────────────────────
  const buildWords = useCallback(() => {
    const words: string[] = [];
    if (customInputs.length > 0) words.push(...customInputs);
    if (usePresets || customInputs.length === 0) {
      const shuffled = [...PRESET_WORDS].sort(() => Math.random() - 0.5);
      words.push(...shuffled.slice(0, Math.max(0, 12 - customInputs.length)));
    }
    return words.sort(() => Math.random() - 0.5);
  }, [customInputs, usePresets]);

  // ─── Start game ───────────────────────────────────────────────────────────
  const startGame = () => {
    const words = buildWords();
    const newBalloons = words.map((w) => makeBalloon(w));
    setBalloons(newBalloons);
    setSessionPopped(0);
    setPoppedParticles([]);
    setPhase("playing");
  };

  // ─── Track mouse for needle cursor ───────────────────────────────────────
  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = arenaRef.current?.getBoundingClientRect();
    if (!rect) return;
    setNeedlePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    setShowNeedle(true);
  };
  const handleMouseLeave = () => setShowNeedle(false);

  // ─── Pop balloon ─────────────────────────────────────────────────────────
  const popBalloon = (balloonEl: HTMLElement, balloon: Balloon) => {
    if (balloon.popped) return;
    const arena = arenaRef.current;
    if (!arena) return;

    // 🎵 Play satisfying POP sound
    playPopSound(0.75);
    const rect = balloon.id >= 0 ? balloonEl.getBoundingClientRect() : arena.getBoundingClientRect();
    const arenaRect = arena.getBoundingClientRect();
    const popX = rect.left - arenaRect.left + rect.width / 2;
    const popY = rect.top - arenaRect.top + rect.height / 2;

    // Burst particles
    const color = BALLOON_COLORS[balloon.colorIdx].fill;
    const particles: PoppedParticle[] = Array.from({ length: 12 }).map((_, i) => ({
      id: particleCounterRef.current++,
      balloonId: balloon.id,
      angle: (i / 12) * 360,
      dist: 30 + Math.random() * 50,
      color,
    }));
    setPoppedParticles((prev) => [...prev, ...particles]);
    setTimeout(() => {
      setPoppedParticles((prev) => prev.filter((p) => p.balloonId !== balloon.id));
    }, 700);

    // Mark popped
    setBalloons((prev) =>
      prev.map((b) => (b.id === balloon.id ? { ...b, popped: true, popX, popY } : b))
    );
    setTotalPopped((n) => n + 1);
    setSessionPopped((n) => {
      const next = n + 1;
      // Check if all popped
      setBalloons((prev2) => {
        const remaining = prev2.filter((b) => !b.popped && b.id !== balloon.id);
        if (remaining.length === 0) {
          setTimeout(() => setPhase("cleared"), 600);
        }
        return prev2;
      });
      return next;
    });
  };

  // ─── Add custom word ──────────────────────────────────────────────────────
  const addWord = () => {
    const trimmed = inputText.trim();
    if (!trimmed || customInputs.includes(trimmed) || customInputs.length >= 8) return;
    setCustomInputs((prev) => [...prev, trimmed]);
    setInputText("");
  };

  // ─── Reset ────────────────────────────────────────────────────────────────
  const resetGame = () => {
    setBalloons([]);
    setPoppedParticles([]);
    setSessionPopped(0);
    setPhase("setup");
  };

  // ─── Remaining count ──────────────────────────────────────────────────────
  const remaining = balloons.filter((b) => !b.popped).length;

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <section className="rounded-3xl bg-card ring-1 ring-border/60 shadow-card overflow-hidden">
      {/* ── Header ── */}
      <div className="px-6 pt-6 pb-4 border-b border-border/40 flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-pink-500/20 flex items-center justify-center text-xl flex-shrink-0 select-none">
            🎈
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-display text-base font-semibold leading-snug">
                Pecahkan Balon Pikiran Negatif
              </p>
              <span className="inline-flex items-center gap-1 rounded-full bg-pink-500/10 px-2.5 py-0.5 text-[10px] font-medium text-pink-700 dark:text-pink-300 border border-pink-500/20">
                📍 Katarsis Pikiran
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Tusuk balon-balon pikiran negatif dengan jarum untuk membebaskan dirimu.
            </p>
          </div>
        </div>
        {totalPopped > 0 && (
          <span className="text-[10px] font-medium bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 px-3 py-1 rounded-full border border-emerald-500/20 flex-shrink-0 whitespace-nowrap">
            📍 {totalPopped} Balon Diledakkan
          </span>
        )}
      </div>

      {/* ── PHASE: SETUP ── */}
      {phase === "setup" && (
        <div className="p-6 space-y-5 animate-scale-in">
          {/* Custom words input */}
          <div className="space-y-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              1. Tulis pikiran negatif yang ingin kamu ledakkan (maks. 8):
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                maxLength={35}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addWord()}
                placeholder="Misal: Takut Gagal, Tidak Cukup Baik..."
                className="flex-1 text-xs rounded-xl border border-border/70 bg-card px-4 py-2.5 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
              <button
                onClick={addWord}
                disabled={!inputText.trim() || customInputs.length >= 8}
                className="rounded-xl bg-primary/10 hover:bg-primary/20 border border-primary/30 px-4 py-2.5 text-xs font-semibold text-primary transition-all active:scale-95 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                + Tambah
              </button>
            </div>

            {/* Custom word chips */}
            {customInputs.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {customInputs.map((w) => (
                  <span
                    key={w}
                    className="flex items-center gap-1.5 rounded-full bg-pink-500/10 border border-pink-400/30 px-3 py-1 text-xs font-medium text-pink-700 dark:text-pink-300"
                  >
                    🎈 {w}
                    <button
                      onClick={() => setCustomInputs((prev) => prev.filter((x) => x !== w))}
                      className="text-pink-400 hover:text-pink-200 cursor-pointer leading-none"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Preset toggle */}
          <div className="flex items-center gap-3 p-4 rounded-2xl bg-accent/30 border border-border/40">
            <button
              onClick={() => setUsePresets(!usePresets)}
              className={`relative w-11 h-6 rounded-full transition-colors duration-200 flex-shrink-0 cursor-pointer border ${
                usePresets ? "bg-primary border-primary/60" : "bg-muted border-border"
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200 ${
                  usePresets ? "translate-x-5" : ""
                }`}
              />
            </button>
            <div>
              <p className="text-xs font-semibold text-foreground">Tambahkan Kata Preset</p>
              <p className="text-[10px] text-muted-foreground">
                Isi dengan contoh kata negatif umum (cemas, lelah, stres, dll.)
              </p>
            </div>
          </div>

          {/* Start button */}
          <button
            onClick={startGame}
            className="w-full rounded-2xl py-3.5 text-sm font-bold text-white bg-gradient-to-br from-pink-500 to-rose-600 hover:from-pink-400 hover:to-rose-500 shadow-lg shadow-pink-500/30 transition-all duration-200 active:scale-95 cursor-pointer"
          >
            🎈 Mulai Ledakkan Balon!
          </button>
        </div>
      )}

      {/* ── PHASE: PLAYING ── */}
      {phase === "playing" && (
        <div className="p-4 space-y-3">
          {/* HUD */}
          <div className="flex items-center justify-between px-2">
            <span className="text-xs font-medium text-muted-foreground">
              🎈 Sisa: <span className="text-foreground font-bold">{remaining}</span> balon
            </span>
            <span className="text-xs font-medium text-muted-foreground">
              💥 Diledakkan: <span className="text-foreground font-bold">{sessionPopped}</span>
            </span>
            <button
              onClick={resetGame}
              className="text-[10px] text-muted-foreground hover:text-foreground cursor-pointer underline underline-offset-2"
            >
              Ulang
            </button>
          </div>

          {/* Arena */}
          <div
            ref={arenaRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className="relative rounded-3xl overflow-hidden select-none"
            style={{
              height: "420px",
              background: "radial-gradient(ellipse at 50% 110%, #1e1b4b 0%, #0f172a 50%, #030712 100%)",
              cursor: "none",
            }}
          >
            {/* Stars background */}
            {Array.from({ length: 28 }).map((_, i) => (
              <div
                key={i}
                className="absolute rounded-full bg-white/40 animate-pulse"
                style={{
                  width: `${1 + (i % 3)}px`,
                  height: `${1 + (i % 3)}px`,
                  left: `${(i * 3.7) % 97}%`,
                  top: `${(i * 5.3 + 10) % 85}%`,
                  animationDuration: `${2 + (i % 4)}s`,
                  animationDelay: `${(i * 0.15) % 3}s`,
                }}
              />
            ))}

            {/* Balloons */}
            {balloons.map((b) => {
              const color = BALLOON_COLORS[b.colorIdx];
              if (b.popped) {
                return (
                  <div
                    key={b.id}
                    className="absolute pointer-events-none"
                    style={{ left: `${b.popX - 20}px`, top: `${b.popY - 20}px` }}
                  >
                    <span className="text-2xl animate-scale-in" style={{ animationDuration: "0.3s" }}>
                      💨
                    </span>
                  </div>
                );
              }
              return (
                <div
                  key={b.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    popBalloon(e.currentTarget as HTMLElement, b);
                  }}
                  className="absolute bottom-0 flex flex-col items-center cursor-none"
                  style={{
                    left: `${b.x}%`,
                    width: `${b.size}px`,
                    marginLeft: `-${b.size / 2}px`,
                    animation: `balloon-float-up ${b.riseDuration}s linear forwards, balloon-sway-game ${b.swayDuration}s ease-in-out ${b.swayDelay}s infinite alternate`,
                    filter: `drop-shadow(0 0 14px ${color.glow})`,
                    zIndex: 10,
                  }}
                >
                  {/* Balloon SVG */}
                  <svg viewBox="0 0 60 80" width={b.size} height={b.size * 1.25} xmlns="http://www.w3.org/2000/svg">
                    {/* Balloon body */}
                    <ellipse cx="30" cy="32" rx="26" ry="30" fill={color.fill} />
                    {/* Shine */}
                    <ellipse cx="22" cy="20" rx="7" ry="10" fill="rgba(255,255,255,0.28)" />
                    {/* Knot */}
                    <polygon points="27,62 30,68 33,62" fill={color.stroke} />
                    {/* String */}
                    <path d="M30,68 Q26,73 30,80" stroke={color.stroke} strokeWidth="1.5" fill="none" strokeLinecap="round" />
                    {/* Text */}
                    <text
                      x="30"
                      y="33"
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fontSize={b.word.length > 10 ? "6" : "7"}
                      fontWeight="bold"
                      fill={color.text}
                      style={{ fontFamily: "system-ui, sans-serif" }}
                    >
                      {b.word.length > 14 ? b.word.slice(0, 13) + "…" : b.word}
                    </text>
                  </svg>
                </div>
              );
            })}

            {/* Pop particles */}
            {poppedParticles.map((p) => (
              <div
                key={p.id}
                className="absolute rounded-full pointer-events-none"
                style={{
                  width: "8px",
                  height: "8px",
                  backgroundColor: p.color,
                  boxShadow: `0 0 8px ${p.color}`,
                  transform: `translate(
                    ${Math.cos((p.angle * Math.PI) / 180) * p.dist}px,
                    ${Math.sin((p.angle * Math.PI) / 180) * p.dist}px
                  )`,
                  left: "50%",
                  top: "50%",
                  transition: "transform 0.6s ease-out, opacity 0.6s ease-out",
                  opacity: 0,
                  animation: `particle-burst 0.6s ease-out forwards`,
                }}
              />
            ))}

            {/* Custom needle cursor */}
            {showNeedle && (
              <div
                className="absolute pointer-events-none z-50"
                style={{
                  left: needlePos.x - 4,
                  top: needlePos.y - 32,
                  transform: "rotate(-35deg)",
                  fontSize: "28px",
                  lineHeight: 1,
                  filter: "drop-shadow(0 2px 6px rgba(0,0,0,0.5))",
                }}
              >
                📍
              </div>
            )}

            {/* Instruction overlay (only at start) */}
            {sessionPopped === 0 && remaining > 0 && (
              <div className="absolute bottom-4 left-0 right-0 flex justify-center pointer-events-none">
                <span className="text-xs text-white/60 bg-black/30 backdrop-blur-sm rounded-full px-4 py-1.5 animate-pulse">
                  Arahkan jarum ke balon & klik untuk meledakkannya! 📍
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── PHASE: CLEARED ── */}
      {phase === "cleared" && (
        <div
          className="relative flex flex-col items-center justify-center text-center p-10 space-y-5 animate-scale-in min-h-[320px]"
          style={{
            background: "radial-gradient(ellipse at 50% 50%, #064e3b 0%, #022c22 60%, #030712 100%)",
          }}
        >
          {/* Confetti stars */}
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className="absolute text-sm pointer-events-none animate-float"
              style={{
                left: `${(i * 5.3) % 95}%`,
                top: `${(i * 7.1 + 5) % 85}%`,
                animationDuration: `${2 + (i % 3)}s`,
                animationDelay: `${(i * 0.12) % 2}s`,
              }}
            >
              {["✨", "🌟", "💫", "⭐"][i % 4]}
            </div>
          ))}

          <div className="relative w-20 h-20">
            <div className="absolute inset-0 rounded-full bg-emerald-400/20 animate-breath-ring" />
            <div className="relative mx-auto grid h-20 w-20 place-items-center rounded-full bg-emerald-500/20 border border-emerald-400/40 text-3xl shadow-[0_0_40px_rgba(16,185,129,0.4)]">
              🕊️
            </div>
          </div>

          <div className="space-y-2 max-w-xs">
            <p className="text-[10px] font-mono tracking-widest text-emerald-400 uppercase">
              ✨ Semua Pikiran Negatif Telah Musnah
            </p>
            <h3 className="font-display text-xl font-bold text-white leading-snug">
              Pikiranmu Kini Bebas & Ringan
            </h3>
            <p className="text-xs text-emerald-100/85 leading-relaxed italic bg-emerald-950/50 p-4 rounded-2xl border border-emerald-500/20">
              "Kamu baru saja melepaskan {sessionPopped} beban pikiran. Hembuskan napas, ruang dalam dirimu kini lapang dan tenang."
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xs">
            <button
              onClick={startGame}
              className="flex-1 rounded-2xl py-2.5 text-xs font-bold text-emerald-100 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-400/40 transition-all duration-200 active:scale-95 cursor-pointer"
            >
              🎈 Main Lagi
            </button>
            <button
              onClick={resetGame}
              className="flex-1 rounded-2xl py-2.5 text-xs font-bold text-white/80 bg-white/10 hover:bg-white/15 border border-white/20 transition-all duration-200 active:scale-95 cursor-pointer"
            >
              ✏️ Ganti Kata
            </button>
          </div>
        </div>
      )}

      {/* Inline keyframes */}
      <style>{`
        @keyframes balloon-float-up {
          0%   { bottom: -140px; opacity: 1; }
          95%  { opacity: 1; }
          100% { bottom: 110%; opacity: 0; }
        }
        @keyframes balloon-sway-game {
          0%   { transform: translateX(-18px) rotate(-5deg); }
          100% { transform: translateX(18px) rotate(5deg); }
        }
        @keyframes particle-burst {
          0%   { transform: translate(0, 0) scale(1); opacity: 1; }
          100% { transform: translate(
                    calc(var(--dx, 40px)),
                    calc(var(--dy, -40px))
                  ) scale(0); opacity: 0; }
        }
      `}</style>
    </section>
  );
}
