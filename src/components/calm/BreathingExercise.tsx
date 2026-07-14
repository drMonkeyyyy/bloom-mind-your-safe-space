import { useState, useEffect, useRef } from "react";

/* Breathing patterns */
const PATTERNS = [
  {
    id: "4-7-8",
    label: "4-7-8 (Anti-cemas)",
    desc: "Teknik paling efektif untuk menenangkan sistem saraf",
    phases: [
      { label: "Tarik Napas", sub: "Hirup perlahan lewat hidung", duration: 4, scale: 1.18, color: "oklch(0.71 0.045 160)", glow: "oklch(0.71 0.045 160 / 0.35)", trackColor: "#6E8C7150" },
      { label: "Tahan", sub: "Tahan dengan tenang", duration: 7, scale: 1.18, color: "oklch(0.65 0.06 230)", glow: "oklch(0.65 0.06 230 / 0.30)", trackColor: "#6093C550" },
      { label: "Buang Napas", sub: "Hembuskan perlahan lewat mulut", duration: 8, scale: 0.85, color: "oklch(0.77 0.085 40)", glow: "oklch(0.77 0.085 40 / 0.30)", trackColor: "#C5936050" },
    ],
    cycles: 4,
    emoji: "🌙",
    badge: "Paling Populer",
    badgeColor: "oklch(0.65 0.06 230)",
  },
  {
    id: "4-4-6",
    label: "4-4-6 (Harian)",
    desc: "Ritme seimbang untuk relaksasi sehari-hari",
    phases: [
      { label: "Tarik Napas", sub: "Hirup perlahan lewat hidung", duration: 4, scale: 1.18, color: "oklch(0.71 0.045 160)", glow: "oklch(0.71 0.045 160 / 0.35)", trackColor: "#6E8C7150" },
      { label: "Tahan", sub: "Tahan dengan tenang", duration: 4, scale: 1.18, color: "oklch(0.65 0.06 230)", glow: "oklch(0.65 0.06 230 / 0.30)", trackColor: "#6093C550" },
      { label: "Buang Napas", sub: "Hembuskan perlahan lewat mulut", duration: 6, scale: 0.88, color: "oklch(0.77 0.085 40)", glow: "oklch(0.77 0.085 40 / 0.30)", trackColor: "#C5936050" },
    ],
    cycles: 4,
    emoji: "🌿",
    badge: "Pemula",
    badgeColor: "oklch(0.65 0.10 150)",
  },
  {
    id: "box",
    label: "Box (Fokus)",
    desc: "4 sisi yang sama — grounding untuk fokus dan kontrol",
    phases: [
      { label: "Tarik Napas", sub: "Hirup perlahan lewat hidung", duration: 4, scale: 1.18, color: "oklch(0.71 0.045 160)", glow: "oklch(0.71 0.045 160 / 0.35)", trackColor: "#6E8C7150" },
      { label: "Tahan Atas", sub: "Paru-paru penuh, tahan", duration: 4, scale: 1.18, color: "oklch(0.65 0.06 230)", glow: "oklch(0.65 0.06 230 / 0.30)", trackColor: "#6093C550" },
      { label: "Buang Napas", sub: "Hembuskan perlahan lewat mulut", duration: 4, scale: 0.88, color: "oklch(0.77 0.085 40)", glow: "oklch(0.77 0.085 40 / 0.30)", trackColor: "#C5936050" },
      { label: "Tahan Bawah", sub: "Paru-paru kosong, tahan", duration: 4, scale: 0.88, color: "oklch(0.68 0.10 310)", glow: "oklch(0.68 0.10 310 / 0.25)", trackColor: "#9C6EC550" },
    ],
    cycles: 4,
    emoji: "⬜",
    badge: "Untuk Fokus",
    badgeColor: "oklch(0.68 0.10 310)",
  },
];

const CIRCLE_R = 88;
const CIRCUMFERENCE = 2 * Math.PI * CIRCLE_R;

const FINISH_MESSAGES = [
  "Napasmu sudah lebih teratur. Sistem sarafmu mulai tenang. 🌿",
  "Luar biasa. Setiap napas membawa ketenangan yang nyata. ✨",
  "Kamu berhasil. Rasakan bedanya — sebelum dan sesudah. 💙",
  "Napas adalah jangkar. Kamu selalu bisa kembali ke sini. 🦋",
];

type Phase = "intro" | "exercise" | "done";

export function BreathingExercise() {
  const [phase, setPhase] = useState<Phase>("intro");
  const [selectedPattern, setSelectedPattern] = useState(0);
  const [active, setActive] = useState(false);
  const [phaseIdx, setPhaseIdx] = useState(0);
  const [countdown, setCountdown] = useState(0);
  const [cycle, setCycle] = useState(0);
  const [justFinished, setJustFinished] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const finishMsg = FINISH_MESSAGES[Math.floor(Math.random() * FINISH_MESSAGES.length)];

  const pattern = PATTERNS[selectedPattern];
  const phases = pattern.phases;
  const currentPhase = phases[phaseIdx];
  const TOTAL_CYCLES = pattern.cycles;

  const start = () => {
    setActive(true);
    setPhaseIdx(0);
    setCountdown(phases[0].duration);
    setCycle(0);
    setJustFinished(false);
  };

  const stop = () => {
    setActive(false);
    if (timerRef.current) clearInterval(timerRef.current);
    setPhaseIdx(0);
    setCountdown(phases[0].duration);
    setCycle(0);
    setJustFinished(false);
  };

  useEffect(() => {
    if (!active) return;
    timerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          const nextIdx = (phaseIdx + 1) % phases.length;
          if (nextIdx === 0) {
            const nextCycle = cycle + 1;
            if (nextCycle >= TOTAL_CYCLES) {
              setActive(false);
              setCycle(0);
              setJustFinished(true);
              return phases[0].duration;
            }
            setCycle(nextCycle);
          }
          setPhaseIdx(nextIdx);
          return phases[nextIdx].duration;
        }
        return prev - 1;
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, phaseIdx, cycle]);

  const progressRatio = active ? countdown / currentPhase.duration : 1;
  const strokeDashoffset = CIRCUMFERENCE * progressRatio;
  const circleTransform = active ? `scale(${currentPhase.scale})` : "scale(1)";

  /* ── INTRO ─────────────────────────────────────── */
  if (phase === "intro") {
    return (
      <section className="rounded-3xl bg-card p-4 sm:p-6 ring-1 ring-border/60 shadow-card space-y-4 animate-scale-in">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div
            className="grid h-10 w-10 sm:h-12 sm:w-12 shrink-0 place-items-center rounded-2xl text-xl sm:text-2xl"
            style={{ background: "oklch(0.93 0.03 160)" }}
          >
            🌬️
          </div>
          <div>
            <h2 className="font-display text-lg sm:text-xl font-semibold text-foreground">Breathing Exercise</h2>
            <p className="text-[11px] sm:text-xs text-muted-foreground">Latihan napas terpandu dengan ritme visual</p>
          </div>
        </div>

        {/* Education block */}
        <div className="rounded-2xl bg-sky-50 ring-1 ring-sky-200 p-3.5 space-y-1.5 text-xs">
          <p className="font-semibold text-sky-800 text-[13px]">Mengapa Napas Bisa Menenangkan?</p>
          <p className="text-sky-700 leading-relaxed">
            Napas dalam merangsang <strong>saraf vagus</strong> untuk mengaktifkan respons tenang & pulih. Tubuh menerima sinyal bahwa <strong>kamu aman</strong>, menurunkan cemas dan tingkat stres dalam hitungan menit.
          </p>
        </div>

        {/* Pattern selector */}
        <div className="space-y-2">
          <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-muted-foreground/60">Pilih Pola Napas</p>
          {PATTERNS.map((p, i) => (
            <button
              key={p.id}
              onClick={() => setSelectedPattern(i)}
              className={`w-full text-left rounded-2xl p-3 sm:p-4 ring-1 transition-all duration-200 flex items-start gap-3 ${
                selectedPattern === i
                  ? "bg-primary-soft ring-primary/30"
                  : "bg-card ring-border/60 hover:bg-cream-deep"
              }`}
            >
              <span className="text-xl mt-0.5">{p.emoji}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-display text-sm font-semibold text-foreground">{p.label}</span>
                  <span
                    className="rounded-full px-2 py-0.5 text-[10px] font-bold text-white"
                    style={{ background: p.badgeColor }}
                  >
                    {p.badge}
                  </span>
                </div>
                <p className="text-[11px] sm:text-xs text-muted-foreground mt-0.5">{p.desc}</p>
                <div className="flex gap-1.5 mt-2">
                  {p.phases.map((ph, pi) => (
                    <span
                      key={pi}
                      className="text-[10px] font-mono rounded px-1.5 py-0.5"
                      style={{ background: ph.color + "22", color: ph.color }}
                    >
                      {ph.label.split(" ")[0]} {ph.duration}s
                    </span>
                  ))}
                </div>
              </div>
              {selectedPattern === i && (
                <div className="text-primary text-sm mt-0.5">✓</div>
              )}
            </button>
          ))}
        </div>

        {/* Tips */}
        <div className="flex items-start gap-3 rounded-2xl bg-emerald-50 ring-1 ring-emerald-200 p-4">
          <span className="text-xl">💡</span>
          <p className="text-sm text-emerald-800 leading-relaxed">
            <strong>Tips:</strong> Cari posisi duduk atau berbaring yang nyaman. Letakkan satu tangan di dada dan satu di perut
            — rasakan perutmu naik saat menarik napas. Ikuti lingkaran visual di layar.
          </p>
        </div>

        <button
          onClick={() => { setPhase("exercise"); start(); }}
          className="w-full rounded-full bg-primary py-4 text-sm font-semibold text-primary-foreground shadow-soft transition-all duration-300 hover:-translate-y-0.5 hover:shadow-float active:scale-95"
        >
          Mulai Latihan {pattern.emoji}
        </button>
      </section>
    );
  }

  /* ── DONE ──────────────────────────────────────── */
  if (phase === "done" || (phase === "exercise" && justFinished)) {
    return (
      <section className="rounded-3xl bg-card p-6 ring-1 ring-border/60 shadow-card space-y-5 animate-scale-in">
        {/* Celebration */}
        <div className="flex flex-col items-center text-center space-y-3 py-2">
          <div className="relative">
            <span className="text-5xl" style={{ animation: "bounce-in 0.6s cubic-bezier(0.34,1.56,0.64,1) both" }}>🌬️</span>
            <span className="absolute -right-2 -top-2 text-2xl" style={{ animation: "bounce-in 0.7s 0.1s cubic-bezier(0.34,1.56,0.64,1) both" }}>✨</span>
            <span className="absolute -left-3 -bottom-1 text-xl" style={{ animation: "bounce-in 0.8s 0.2s cubic-bezier(0.34,1.56,0.64,1) both" }}>🌿</span>
          </div>
          <h2 className="font-display text-2xl font-semibold text-foreground mt-3">Latihan Selesai! 🎉</h2>
          <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">{finishMsg}</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: "Pola", value: pattern.label.split(" (")[0] },
            { label: "Siklus", value: `${TOTAL_CYCLES}×` },
            { label: "Durasi", value: `${Math.round(phases.reduce((s, p) => s + p.duration, 0) * TOTAL_CYCLES / 60)} menit` },
          ].map(({ label, value }) => (
            <div key={label} className="rounded-2xl bg-primary-soft/40 p-3 text-center">
              <p className="font-display text-lg font-bold text-primary">{value}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        {/* Science note */}
        <div className="flex items-start gap-3 rounded-2xl bg-violet-50 ring-1 ring-violet-200 p-4">
          <span className="text-xl">🧠</span>
          <p className="text-xs text-violet-800 leading-relaxed">
            <strong>Tahukah kamu?</strong> Penelitian menunjukkan bahwa hanya <strong>5 menit</strong> latihan napas terpandu
            secara konsisten dapat menurunkan kadar kortisol (hormon stres) dan meningkatkan variabilitas detak jantung
            — penanda utama kesehatan sistem saraf.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2">
          <button
            onClick={() => { setPhase("exercise"); start(); }}
            className="w-full rounded-full bg-primary py-3.5 text-sm font-semibold text-primary-foreground shadow-soft transition-all duration-300 hover:-translate-y-0.5 active:scale-95"
          >
            Ulangi Latihan 🔄
          </button>
          <button
            onClick={() => setPhase("intro")}
            className="w-full rounded-full border border-border py-3 text-sm font-medium text-foreground transition-colors hover:bg-cream-deep"
          >
            Ganti Pola Napas
          </button>
        </div>
      </section>
    );
  }

  /* ── EXERCISE ───────────────────────────────────── */
  return (
    <section
      className="rounded-3xl overflow-hidden"
      style={{
        background: "linear-gradient(160deg, oklch(0.95 0.025 230) 0%, oklch(0.97 0.02 265) 100%)",
      }}
    >
      <div className="p-6 space-y-4">
        {/* Header with back */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold" style={{ color: "oklch(0.50 0.06 230)" }}>
              {pattern.emoji} {pattern.label}
            </p>
            <p className="text-xs text-muted-foreground">
              {phases.map(p => p.duration).join("-")} detik · {TOTAL_CYCLES} siklus
            </p>
          </div>
          {!active && (
            <button
              onClick={() => { stop(); setPhase("intro"); }}
              className="text-xs text-muted-foreground/60 hover:text-muted-foreground transition-colors px-3 py-1.5 rounded-full hover:bg-white/60"
            >
              ← Kembali
            </button>
          )}
        </div>

        {/* SVG breathing circle */}
        <div className="flex flex-col items-center">
          <div className="relative mx-auto" style={{ width: 240, height: 240 }}>
            <svg
              viewBox="0 0 240 240"
              width={240}
              height={240}
              className="absolute inset-0"
              style={{ transform: "rotate(-90deg)" }}
              aria-hidden="true"
            >
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
                stroke={currentPhase.trackColor}
                strokeWidth="10"
              />

              {/* Progress arc */}
              <circle
                cx="120" cy="120" r={CIRCLE_R}
                fill="none"
                stroke={currentPhase.color}
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray={CIRCUMFERENCE}
                strokeDashoffset={active ? strokeDashoffset : CIRCUMFERENCE}
                filter="url(#breath-glow)"
                style={{
                  transition: active ? "stroke-dashoffset 1s linear, stroke 0.8s ease" : "none",
                }}
              />

              {/* Ambient outer glow */}
              {active && (
                <circle
                  cx="120" cy="120" r="105"
                  fill="none"
                  stroke={currentPhase.glow}
                  strokeWidth="24"
                  style={{
                    filter: "blur(14px)",
                    transition: `stroke ${800}ms ease`,
                  }}
                />
              )}
            </svg>

            {/* Centre circle */}
            <div
              className="absolute inset-0 flex items-center justify-center"
              style={{
                transition: `transform ${currentPhase.duration * 1000}ms cubic-bezier(0.4, 0, 0.2, 1)`,
                transform: circleTransform,
              }}
            >
              <div
                className="absolute shadow-xl transition-all duration-700"
                style={{
                  width: 120, height: 120,
                  left: "calc(50% - 60px)", top: "calc(50% - 60px)",
                  borderRadius: "50%",
                  background: active ? currentPhase.color : "oklch(0.71 0.045 160)",
                  boxShadow: active
                    ? `0 12px 35px -8px ${currentPhase.glow}, inset 0 -6px 16px rgba(0,0,0,0.15), inset 0 4px 12px rgba(255,255,255,0.3)`
                    : "0 8px 24px -8px rgba(0,0,0,0.1), inset 0 -6px 16px rgba(0,0,0,0.05)",
                  border: "1.5px solid rgba(255, 255, 255, 0.45)",
                }}
              />
              <div className="relative z-10 flex flex-col items-center justify-center text-white select-none">
                {active ? (
                  <>
                    <p className="font-display text-4xl font-bold leading-none">{countdown}</p>
                    <p className="text-[10px] font-medium opacity-80 mt-0.5">detik</p>
                  </>
                ) : (
                  <p className="font-display text-lg font-semibold">
                    {phases.map(p => p.duration).join("·")}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Phase label */}
          <div className="mt-5 h-12 flex flex-col items-center justify-center">
            {active && (
              <div key={phaseIdx} className="animate-slide-up text-center">
                <p className="font-display text-xl font-bold text-foreground" style={{ color: currentPhase.color }}>
                  {currentPhase.label}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">{currentPhase.sub}</p>
              </div>
            )}
            {!active && !justFinished && (
              <p className="text-sm text-muted-foreground">Ikuti ritme lingkaran — bernapas perlahan</p>
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
                onClick={justFinished ? () => setPhase("done") : start}
                className="rounded-full bg-primary px-8 py-3 text-sm font-semibold text-primary-foreground shadow-soft transition-all duration-250 hover:-translate-y-0.5 hover:shadow-glow-sage active:scale-95"
              >
                {justFinished ? "Lihat Ringkasan ✨" : "Mulai Latihan"}
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
      </div>
    </section>
  );
}
