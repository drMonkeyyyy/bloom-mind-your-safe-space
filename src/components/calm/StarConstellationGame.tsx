import { useState, useRef, useEffect, useCallback } from "react";

// ─── Data: Constellation Shapes & Affirmations ─────────────────────────────
interface ConstellationDef {
  id: string;
  name: string;
  nameEn: string;
  emoji: string;
  affirmation: string;
  stars: { x: number; y: number }[];
  edges: [number, number][];
}

const CONSTELLATIONS: ConstellationDef[] = [
  {
    id: "orion",
    name: "Sang Pejuang",
    nameEn: "Orion",
    emoji: "🗡️",
    affirmation: "Kamu adalah pejuang sejati. Setiap hari yang kamu lewati adalah kemenangan kecil yang nyata.",
    stars: [
      { x: 0.50, y: 0.12 },
      { x: 0.38, y: 0.28 },
      { x: 0.62, y: 0.28 },
      { x: 0.44, y: 0.50 },
      { x: 0.50, y: 0.50 },
      { x: 0.56, y: 0.50 },
      { x: 0.38, y: 0.72 },
      { x: 0.62, y: 0.72 },
    ],
    edges: [[0,1],[0,2],[1,2],[1,3],[2,5],[3,4],[4,5],[3,6],[5,7]],
  },
  {
    id: "heart",
    name: "Hati Penuh Kasih",
    nameEn: "Cor",
    emoji: "💙",
    affirmation: "Kamu layak dicintai — oleh orang lain, dan yang terpenting, oleh dirimu sendiri.",
    stars: [
      { x: 0.50, y: 0.82 },
      { x: 0.22, y: 0.44 },
      { x: 0.35, y: 0.20 },
      { x: 0.50, y: 0.30 },
      { x: 0.65, y: 0.20 },
      { x: 0.78, y: 0.44 },
    ],
    edges: [[0,1],[1,2],[2,3],[3,4],[4,5],[5,0]],
  },
  {
    id: "crown",
    name: "Mahkota Keberanian",
    nameEn: "Corona",
    emoji: "👑",
    affirmation: "Kamu memiliki keberanian yang jauh lebih besar dari yang kamu sadari. Percayalah pada dirimu.",
    stars: [
      { x: 0.50, y: 0.20 },
      { x: 0.26, y: 0.36 },
      { x: 0.74, y: 0.36 },
      { x: 0.18, y: 0.60 },
      { x: 0.38, y: 0.50 },
      { x: 0.62, y: 0.50 },
      { x: 0.82, y: 0.60 },
    ],
    edges: [[3,1],[1,4],[4,0],[0,5],[5,2],[2,6],[3,6]],
  },
  {
    id: "dipper",
    name: "Gayung Harapan",
    nameEn: "Ursa Minor",
    emoji: "🌊",
    affirmation: "Harapanmu adalah kompas yang selalu memandumu pulang, bahkan di malam paling gelap sekalipun.",
    stars: [
      { x: 0.20, y: 0.25 },
      { x: 0.30, y: 0.32 },
      { x: 0.42, y: 0.38 },
      { x: 0.55, y: 0.32 },
      { x: 0.72, y: 0.28 },
      { x: 0.75, y: 0.55 },
      { x: 0.55, y: 0.58 },
    ],
    edges: [[0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[6,3]],
  },
  {
    id: "butterfly",
    name: "Kupu-kupu Kebebasan",
    nameEn: "Papilio",
    emoji: "🦋",
    affirmation: "Seperti kupu-kupu, kamu sedang dalam proses transformasi yang indah. Percayakan prosesmu.",
    stars: [
      { x: 0.50, y: 0.50 },
      { x: 0.28, y: 0.25 },
      { x: 0.18, y: 0.52 },
      { x: 0.72, y: 0.25 },
      { x: 0.82, y: 0.52 },
      { x: 0.38, y: 0.38 },
      { x: 0.62, y: 0.38 },
      { x: 0.38, y: 0.62 },
      { x: 0.62, y: 0.62 },
    ],
    edges: [[0,5],[0,6],[0,7],[0,8],[5,1],[1,2],[2,7],[6,3],[3,4],[4,8]],
  },
];

// ─── Audio helpers (all Web Audio, no external files) ─────────────────────
let _ambientNodes: { osc?: OscillatorNode; noise?: AudioBufferSourceNode; gain?: GainNode } = {};

function getCtx(): AudioContext | null {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!(window as any).__bloomAudioCtx) {
      (window as any).__bloomAudioCtx = new AudioCtx();
    }
    const ctx: AudioContext = (window as any).__bloomAudioCtx;
    if (ctx.state === "suspended") ctx.resume();
    return ctx;
  } catch { return null; }
}

function startSpaceAmbient() {
  stopSpaceAmbient();
  const ctx = getCtx();
  if (!ctx) return;
  const now = ctx.currentTime;

  // Master gain for ambient (fade in)
  const masterGain = ctx.createGain();
  masterGain.gain.setValueAtTime(0, now);
  masterGain.gain.linearRampToValueAtTime(0.18, now + 2.5);
  masterGain.connect(ctx.destination);

  // 1. Deep space drone — very low sine oscillator
  const drone = ctx.createOscillator();
  drone.type = "sine";
  drone.frequency.setValueAtTime(55, now);
  drone.frequency.linearRampToValueAtTime(58, now + 8);
  drone.frequency.linearRampToValueAtTime(55, now + 16);
  const droneGain = ctx.createGain();
  droneGain.gain.value = 0.5;
  drone.connect(droneGain);
  droneGain.connect(masterGain);
  drone.start(now);

  // 2. Filtered cosmic noise (pink noise through lowpass)
  const bufSize = 2 * ctx.sampleRate;
  const noiseBuf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
  const data = noiseBuf.getChannelData(0);
  let b0=0,b1=0,b2=0,b3=0,b4=0,b5=0;
  for (let i=0;i<bufSize;i++){
    const w=Math.random()*2-1;
    b0=0.99886*b0+w*0.0555179; b1=0.99332*b1+w*0.0750759;
    b2=0.96900*b2+w*0.1538520; b3=0.86650*b3+w*0.3104856;
    b4=0.55000*b4+w*0.5329522; b5=-0.7616*b5-w*0.0168980;
    data[i]=(b0+b1+b2+b3+b4+b5+w*0.5362)*0.11;
  }
  const noiseSrc = ctx.createBufferSource();
  noiseSrc.buffer = noiseBuf;
  noiseSrc.loop = true;
  const lp = ctx.createBiquadFilter();
  lp.type = "lowpass"; lp.frequency.value = 280;
  const noiseGain = ctx.createGain();
  noiseGain.gain.value = 0.4;
  noiseSrc.connect(lp); lp.connect(noiseGain); noiseGain.connect(masterGain);
  noiseSrc.start(now);

  // 3. Pad chord — two soft high oscillators for shimmer
  const pad1 = ctx.createOscillator();
  pad1.type = "sine"; pad1.frequency.value = 220;
  const pad2 = ctx.createOscillator();
  pad2.type = "sine"; pad2.frequency.value = 329.6;
  const padGain = ctx.createGain(); padGain.gain.value = 0.08;
  pad1.connect(padGain); pad2.connect(padGain); padGain.connect(masterGain);
  pad1.start(now); pad2.start(now);

  _ambientNodes = { osc: drone, noise: noiseSrc, gain: masterGain };
}

function stopSpaceAmbient() {
  const ctx = getCtx();
  if (!ctx) return;
  if (_ambientNodes.gain) {
    const g = _ambientNodes.gain;
    const now = ctx.currentTime;
    g.gain.setTargetAtTime(0, now, 0.8);
    setTimeout(() => {
      try { _ambientNodes.osc?.stop(); } catch {}
      try { _ambientNodes.noise?.stop(); } catch {}
      _ambientNodes = {};
    }, 2500);
  }
}

function playChime(freq = 880, vol = 0.35) {
  const ctx = getCtx();
  if (!ctx) return;
  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "sine";
  osc.frequency.setValueAtTime(freq, now);
  osc.frequency.exponentialRampToValueAtTime(freq * 0.5, now + 0.6);
  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(vol, now + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
  osc.connect(gain); gain.connect(ctx.destination);
  osc.start(now); osc.stop(now + 0.85);
}

function playCompletionFanfare() {
  const ctx = getCtx();
  if (!ctx) return;
  const now = ctx.currentTime;
  const notes = [523.25, 659.25, 783.99, 1046.5]; // C5 E5 G5 C6
  notes.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = freq;
    const t = now + i * 0.18;
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.22, t + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 1.1);
    osc.connect(gain); gain.connect(ctx.destination);
    osc.start(t); osc.stop(t + 1.15);
  });
}

// ─── Static star data (pre-generated for perf) ────────────────────────────
const BG_STARS = Array.from({ length: 55 }, (_, i) => ({
  cx: (i * 1.87 + 0.5) % 99.5,
  cy: (i * 3.13 + 1.2) % 97.5,
  r: 0.3 + (i % 5) * 0.22,
  twinkleDur: 2 + (i % 7) * 0.6,
  twinkleDelay: (i * 0.19) % 4,
  baseOpacity: 0.15 + (i % 6) * 0.09,
}));

// ─── Component ─────────────────────────────────────────────────────────────
export function StarConstellationGame() {
  const [constellationIdx, setConstellationIdx] = useState(0);
  const [connectedEdges, setConnectedEdges] = useState<Set<string>>(new Set());
  const [litStars, setLitStars] = useState<Set<number>>(new Set());
  const [selectedStar, setSelectedStar] = useState<number | null>(null);
  const [phase, setPhase] = useState<"playing" | "complete">("playing");
  const [completedCount, setCompletedCount] = useState(0);
  const [showAffirmation, setShowAffirmation] = useState(false);
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null);
  const [shootingStars, setShootingStars] = useState<{ id: number; x: number; y: number; angle: number }[]>([]);
  const svgRef = useRef<SVGSVGElement>(null);
  const shootingStarIdRef = useRef(0);

  const constellation = CONSTELLATIONS[constellationIdx];

  // ── Start/stop space ambient on mount/unmount ─────────────────────────
  useEffect(() => {
    startSpaceAmbient();
    return () => stopSpaceAmbient();
  }, []);

  // ── Shooting star interval ────────────────────────────────────────────
  useEffect(() => {
    const fire = () => {
      const id = shootingStarIdRef.current++;
      const x = 5 + Math.random() * 60; // start left side
      const y = 2 + Math.random() * 35;
      const angle = 25 + Math.random() * 20; // degrees downward
      setShootingStars(prev => [...prev, { id, x, y, angle }]);
      setTimeout(() => {
        setShootingStars(prev => prev.filter(s => s.id !== id));
      }, 1800);
    };
    // First one after 3s, then random 8–18s intervals
    const t1 = setTimeout(fire, 3000);
    const interval = setInterval(fire, 10000 + Math.random() * 8000);
    return () => { clearTimeout(t1); clearInterval(interval); };
  }, []);

  // ── Reset on constellation change ─────────────────────────────────────
  useEffect(() => {
    setConnectedEdges(new Set());
    setLitStars(new Set());
    setSelectedStar(null);
    setPhase("playing");
    setShowAffirmation(false);
    setMousePos(null);
  }, [constellationIdx]);

  // ── Check completion ───────────────────────────────────────────────────
  useEffect(() => {
    const totalEdges = constellation.edges.length;
    if (connectedEdges.size >= totalEdges && totalEdges > 0) {
      setPhase("complete");
      setCompletedCount(n => n + 1);
      playCompletionFanfare();
      setTimeout(() => setShowAffirmation(true), 700);
    }
  }, [connectedEdges, constellation.edges.length]);

  const edgeKey = (a: number, b: number) => `${Math.min(a,b)}-${Math.max(a,b)}`;

  const getSvgPoint = useCallback((e: React.MouseEvent) => {
    const svg = svgRef.current;
    if (!svg) return null;
    const rect = svg.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    };
  }, []);

  const handleStarClick = (starIdx: number) => {
    if (phase === "complete") return;
    playChime(440 + starIdx * 55, 0.3);

    if (selectedStar === null) {
      setSelectedStar(starIdx);
      setLitStars(prev => new Set(prev).add(starIdx));
    } else if (selectedStar === starIdx) {
      setSelectedStar(null);
    } else {
      const key = edgeKey(selectedStar, starIdx);
      const isValid = constellation.edges.some(([a, b]) => edgeKey(a, b) === key);
      if (isValid && !connectedEdges.has(key)) {
        setConnectedEdges(prev => new Set(prev).add(key));
        setLitStars(prev => {
          const s = new Set(prev);
          s.add(starIdx); s.add(selectedStar!);
          return s;
        });
        playChime(660 + starIdx * 38, 0.45);
      }
      setSelectedStar(starIdx);
      setLitStars(prev => new Set(prev).add(starIdx));
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (selectedStar === null || phase === "complete") { setMousePos(null); return; }
    const pt = getSvgPoint(e);
    if (pt) setMousePos(pt);
  };

  const nextConstellation = () => setConstellationIdx(i => (i + 1) % CONSTELLATIONS.length);
  const resetCurrent = () => {
    setConnectedEdges(new Set()); setLitStars(new Set());
    setSelectedStar(null); setPhase("playing");
    setShowAffirmation(false); setMousePos(null);
  };

  const W = 100; const H = 100;
  const progress = Math.round((connectedEdges.size / constellation.edges.length) * 100);

  return (
    <section className="rounded-3xl bg-card ring-1 ring-border/60 shadow-card overflow-hidden">
      {/* ── Header ── */}
      <div className="px-6 pt-6 pb-4 border-b border-border/40 flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 flex items-center justify-center text-xl flex-shrink-0">
            ⭐
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-display text-base font-semibold leading-snug">Sambungkan Bintang</p>
              <span className="inline-flex items-center rounded-full bg-indigo-500/10 px-2.5 py-0.5 text-[10px] font-medium text-indigo-600 dark:text-indigo-300 border border-indigo-500/20">
                🌌 Meditasi Langit
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Sambungkan bintang-bintang untuk membentuk rasi & temukan afirmasi untukmu.
            </p>
          </div>
        </div>
        {completedCount > 0 && (
          <span className="text-[10px] font-medium bg-yellow-500/10 text-yellow-700 dark:text-yellow-300 px-3 py-1 rounded-full border border-yellow-500/20 flex-shrink-0">
            ✨ {completedCount} Rasi Terbentuk
          </span>
        )}
      </div>

      <div className="p-5 space-y-4">
        {/* Constellation tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
          {CONSTELLATIONS.map((c, i) => (
            <button
              key={c.id}
              onClick={() => setConstellationIdx(i)}
              className={`flex-shrink-0 flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold border transition-all duration-200 cursor-pointer ${
                i === constellationIdx
                  ? "bg-indigo-500/20 border-indigo-400/50 text-indigo-200 ring-1 ring-indigo-400/30"
                  : "bg-card border-border/60 text-muted-foreground hover:bg-accent/40"
              }`}
            >
              <span>{c.emoji}</span><span>{c.name}</span>
            </button>
          ))}
        </div>

        {/* Progress */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center">
            <span className="text-[10px] text-muted-foreground font-medium">
              {phase === "complete" ? "✅ Rasi terbentuk sempurna!" : `${connectedEdges.size} / ${constellation.edges.length} sambungan`}
            </span>
            <span className="text-[10px] font-bold text-indigo-400">{progress}%</span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-border/60 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-400 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* ── Night Sky Arena ── */}
        <div
          className="relative rounded-3xl overflow-hidden"
          style={{
            background: "radial-gradient(ellipse at 30% 15%, #1e1b4b 0%, #0d0c2b 35%, #050318 70%, #020108 100%)",
          }}
        >
          {/* Milky Way band overlay */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: "linear-gradient(118deg, transparent 10%, rgba(120,113,255,0.06) 35%, rgba(167,139,250,0.09) 50%, rgba(120,113,255,0.05) 65%, transparent 90%)",
            }}
          />

          {/* Shooting stars */}
          {shootingStars.map(s => (
            <div
              key={s.id}
              className="absolute pointer-events-none"
              style={{
                left: `${s.x}%`,
                top: `${s.y}%`,
                width: "80px",
                height: "2px",
                background: "linear-gradient(90deg, rgba(255,255,255,0.9), transparent)",
                transform: `rotate(${s.angle}deg)`,
                animation: "shooting-star-slide 1.6s ease-out forwards",
                borderRadius: "2px",
                filter: "drop-shadow(0 0 4px rgba(255,255,255,0.8))",
              }}
            />
          ))}

          <svg
            ref={svgRef}
            viewBox={`0 0 ${W} ${H}`}
            className="w-full block"
            style={{ aspectRatio: "1.6/1", touchAction: "none" }}
            onMouseMove={handleMouseMove}
            onMouseLeave={() => setMousePos(null)}
          >
            {/* Twinkling background stars */}
            {BG_STARS.map((s, i) => (
              <circle
                key={i}
                cx={s.cx} cy={s.cy} r={s.r}
                fill="white"
                opacity={s.baseOpacity}
                style={{
                  animation: `star-twinkle-svg ${s.twinkleDur}s ease-in-out ${s.twinkleDelay}s infinite`,
                }}
              />
            ))}

            {/* Nebula soft glows */}
            <ellipse cx="22" cy="28" rx="16" ry="11" fill="rgba(99,102,241,0.07)" />
            <ellipse cx="78" cy="68" rx="13" ry="9"  fill="rgba(139,92,246,0.06)" />
            <ellipse cx="55" cy="15" rx="10" ry="7"  fill="rgba(167,139,250,0.05)" />

            {/* Hint edge guides (unconnected) */}
            {constellation.edges.map(([a, b]) => {
              const key = edgeKey(a, b);
              const sa = constellation.stars[a];
              const sb = constellation.stars[b];
              return (
                <line
                  key={`guide-${key}`}
                  x1={sa.x*W} y1={sa.y*H} x2={sb.x*W} y2={sb.y*H}
                  stroke="rgba(99,102,241,0.10)"
                  strokeWidth={0.4}
                  strokeDasharray="1.5 2"
                />
              );
            })}

            {/* Connected edges with glow */}
            {constellation.edges.map(([a, b]) => {
              const key = edgeKey(a, b);
              if (!connectedEdges.has(key)) return null;
              const sa = constellation.stars[a];
              const sb = constellation.stars[b];
              return (
                <g key={`line-${key}`}>
                  {/* Glow layer */}
                  <line
                    x1={sa.x*W} y1={sa.y*H} x2={sb.x*W} y2={sb.y*H}
                    stroke="rgba(165,180,252,0.25)" strokeWidth={2.5} strokeLinecap="round"
                  />
                  {/* Core line */}
                  <line
                    x1={sa.x*W} y1={sa.y*H} x2={sb.x*W} y2={sb.y*H}
                    stroke="rgba(199,210,254,0.92)" strokeWidth={0.6} strokeLinecap="round"
                  />
                </g>
              );
            })}

            {/* Rubber-band line */}
            {selectedStar !== null && mousePos && phase === "playing" && (
              <line
                x1={constellation.stars[selectedStar].x*W}
                y1={constellation.stars[selectedStar].y*H}
                x2={mousePos.x} y2={mousePos.y}
                stroke="rgba(165,180,252,0.45)"
                strokeWidth={0.5} strokeDasharray="2 2" strokeLinecap="round"
              />
            )}

            {/* Stars */}
            {constellation.stars.map((star, idx) => {
              const isLit = litStars.has(idx);
              const isSelected = selectedStar === idx;
              const cx = star.x * W;
              const cy = star.y * H;
              return (
                <g key={idx} onClick={() => handleStarClick(idx)} style={{ cursor: phase === "complete" ? "default" : "pointer" }}>
                  {/* Pulse ring on selected */}
                  {isSelected && (
                    <circle cx={cx} cy={cy} r={5}
                      fill="none" stroke="rgba(250,204,21,0.5)" strokeWidth={0.5}
                      style={{ animation: "star-pulse 1s ease-in-out infinite" }}
                    />
                  )}
                  {/* Glow halo for lit */}
                  {isLit && !isSelected && (
                    <circle cx={cx} cy={cy} r={3.5}
                      fill="rgba(165,180,252,0.15)" />
                  )}
                  {/* Star body */}
                  <circle
                    cx={cx} cy={cy}
                    r={isSelected ? 2.4 : isLit ? 1.9 : 1.5}
                    fill={isSelected ? "#fbbf24" : isLit ? "#c7d2fe" : "#818cf8"}
                    style={{
                      filter: isSelected
                        ? "drop-shadow(0 0 5px #fbbf24) drop-shadow(0 0 10px rgba(251,191,36,0.5))"
                        : isLit
                        ? "drop-shadow(0 0 4px rgba(199,210,254,0.9))"
                        : "drop-shadow(0 0 2px rgba(129,140,248,0.6))",
                      transition: "r 0.2s, fill 0.2s",
                      animation: isLit && !isSelected ? `star-twinkle-svg ${2 + idx * 0.3}s ease-in-out infinite` : undefined,
                    }}
                  />
                  {/* Index number (unlit) */}
                  {!isLit && phase === "playing" && (
                    <text x={cx} y={cy+3.8} textAnchor="middle" fontSize="3"
                      fill="rgba(165,180,252,0.45)"
                      style={{ pointerEvents:"none", fontFamily:"system-ui" }}>
                      {idx+1}
                    </text>
                  )}
                </g>
              );
            })}

            {/* Completion star sparkles */}
            {phase === "complete" && constellation.stars.map((star, idx) => (
              <text key={`sparkle-${idx}`}
                x={star.x*W} y={star.y*H - 4}
                fontSize="4.5" textAnchor="middle"
                style={{
                  animation: `twinkle-sparkle ${1 + (idx%4)*0.3}s ease-in-out ${idx*0.12}s infinite`,
                  fontFamily: "system-ui",
                }}>
                ✦
              </text>
            ))}
          </svg>

          {/* Instruction hint */}
          {phase === "playing" && connectedEdges.size === 0 && (
            <div className="absolute bottom-3 left-0 right-0 flex justify-center pointer-events-none">
              <span className="text-[10px] text-white/50 bg-black/30 backdrop-blur-sm rounded-full px-3 py-1 animate-pulse">
                Klik bintang pertama, lalu klik bintang lain untuk menyambungkan ⭐
              </span>
            </div>
          )}

          {/* Selected star hint */}
          {selectedStar !== null && phase === "playing" && (
            <div className="absolute top-3 left-0 right-0 flex justify-center pointer-events-none">
              <span className="text-[10px] text-yellow-300/80 bg-black/30 backdrop-blur-sm rounded-full px-3 py-1">
                ⭐ Bintang #{selectedStar+1} dipilih — klik bintang lain untuk menyambungkan
              </span>
            </div>
          )}

          {/* Ambient sound indicator */}
          <div className="absolute bottom-3 right-3 pointer-events-none">
            <span className="text-[9px] text-white/25 animate-pulse">♫ Suara Langit Malam</span>
          </div>
        </div>

        {/* ── Affirmation card ── */}
        {phase === "complete" && (
          <div
            className="rounded-2xl border border-indigo-400/30 bg-indigo-950/40 p-5 space-y-3 transition-all duration-700"
            style={{
              opacity: showAffirmation ? 1 : 0,
              transform: showAffirmation ? "translateY(0)" : "translateY(12px)",
            }}
          >
            <div className="flex items-center gap-2">
              <span className="text-2xl">{constellation.emoji}</span>
              <div>
                <p className="text-[10px] font-mono tracking-widest text-indigo-400 uppercase">
                  Rasi {constellation.nameEn} Terbentuk ✨
                </p>
                <p className="text-sm font-bold text-indigo-100">{constellation.name}</p>
              </div>
            </div>
            <p className="text-xs text-indigo-100/90 leading-relaxed italic">
              "{constellation.affirmation}"
            </p>
            <div className="flex gap-2 pt-1">
              <button onClick={nextConstellation}
                className="flex-1 rounded-xl py-2.5 text-xs font-bold text-white bg-indigo-600/50 hover:bg-indigo-600/70 border border-indigo-400/40 transition-all active:scale-95 cursor-pointer">
                🌌 Rasi Berikutnya
              </button>
              <button onClick={resetCurrent}
                className="rounded-xl px-4 py-2.5 text-xs font-medium text-indigo-300 bg-indigo-950/60 hover:bg-indigo-900/60 border border-indigo-500/30 transition-all active:scale-95 cursor-pointer">
                🔄 Ulangi
              </button>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes star-twinkle-svg {
          0%, 100% { opacity: var(--base, 0.3); r: 0; }
          50% { opacity: 1; }
        }
        @keyframes star-pulse {
          0%, 100% { r: 4; opacity: 0.6; }
          50% { r: 6; opacity: 0.2; }
        }
        @keyframes twinkle-sparkle {
          0%, 100% { opacity: 0.3; font-size: 3.5px; }
          50% { opacity: 1; font-size: 5.5px; }
        }
        @keyframes shooting-star-slide {
          0%   { transform: rotate(var(--angle, 30deg)) translateX(0); opacity: 1; }
          70%  { opacity: 0.8; }
          100% { transform: rotate(var(--angle, 30deg)) translateX(160px); opacity: 0; }
        }
      `}</style>
    </section>
  );
}
