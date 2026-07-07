import { useState } from "react";

const STEPS = [
  {
    id: "negative",
    title: "Pikiran Negatif 🧠",
    desc: "Apa pikiran buruk atau kekhawatiran yang sedang membebanimu saat ini? Tulis apa adanya — tidak ada penilaian di sini.",
    placeholder: "Contoh: Aku gagal ujian hari ini, aku memang lambat belajar. Teman-temanku pasti menganggap aku tidak mampu...",
    hint: "Jujur pada diri sendiri adalah langkah pertama penyembuhan.",
    color: "oklch(0.65 0.12 0)",
    bg: "bg-rose-50",
    ring: "ring-rose-200",
    badge: "bg-rose-100 text-rose-700",
    icon: "🧠",
  },
  {
    id: "control",
    title: "Lingkaran Kendali ⭕",
    desc: "Pisahkan situasi ini: bagian mana yang berada dalam kendaliku, dan bagian mana yang perlu kuikhlaskan?",
    placeholder: "Contoh: Hasil ujian hari ini sudah terjadi (bukan kendaliku). Yang bisa kukendalikan: cara belajarku ke depan, istirahat yang cukup...",
    hint: "Fokus pada yang bisa kamu ubah melatih sistem saraf untuk tenang.",
    color: "oklch(0.65 0.06 230)",
    bg: "bg-sky-50",
    ring: "ring-sky-200",
    badge: "bg-sky-100 text-sky-700",
    icon: "⭕",
  },
  {
    id: "friend",
    title: "Sudut Pandang Sahabat 🤝",
    desc: "Bayangkan sahabat terkasihmu datang dengan beban yang sama. Apa yang akan kamu katakan padanya dengan penuh kasih?",
    placeholder: "Contoh: Kamu sudah belajar keras. Satu nilai tidak mendefinisikan kepintaranmu. Semua orang pernah gagal — itu bagian dari belajar...",
    hint: "Kamu berhak menerima kebaikan yang sama seperti yang kamu berikan ke orang lain.",
    color: "oklch(0.65 0.10 150)",
    bg: "bg-emerald-50",
    ring: "ring-emerald-200",
    badge: "bg-emerald-100 text-emerald-700",
    icon: "🤝",
  },
  {
    id: "reframe",
    title: "Formulasi Baru ✨",
    desc: "Satukan semua tadi. Tulis ulang pikiran awalmu dengan sudut pandang baru — lebih realistis, lebih ramah, lebih bijak.",
    placeholder: "Contoh: Meskipun ujian ini mengecewakan, aku menghargai usaha kerasku. Hasil ini mengajarkan aku cara belajar yang lebih efektif. Aku akan mencobanya lagi...",
    hint: "Kalimat yang realistis dan penuh kasih lebih kuat dari afirmasi palsu.",
    color: "oklch(0.65 0.12 60)",
    bg: "bg-amber-50",
    ring: "ring-amber-200",
    badge: "bg-amber-100 text-amber-700",
    icon: "✨",
  },
];

type Phase = "intro" | "exercise" | "done";

export function CognitiveReframing() {
  const [phase, setPhase] = useState<Phase>("intro");
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<string[]>(Array(STEPS.length).fill(""));

  const handleNext = () => {
    if (step < STEPS.length - 1) {
      setStep(s => s + 1);
    } else {
      setPhase("done");
    }
  };

  const handleBack = () => {
    if (step > 0) setStep(s => s - 1);
    else setPhase("intro");
  };

  const handleReset = () => {
    setStep(0);
    setAnswers(Array(STEPS.length).fill(""));
    setPhase("intro");
  };

  /* ── INTRO ─────────────────────────────────────── */
  if (phase === "intro") {
    return (
      <section className="rounded-3xl bg-card p-6 ring-1 ring-border/60 shadow-card space-y-5 animate-scale-in">
        <div className="flex items-center gap-3">
          <div
            className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl text-2xl"
            style={{ background: "oklch(0.95 0.04 40)" }}
          >
            🪞
          </div>
          <div>
            <h2 className="font-display text-xl font-semibold text-foreground">Ubah Sudut Pandang</h2>
            <p className="text-xs text-muted-foreground">Reframing kognitif berbasis bukti klinis</p>
          </div>
        </div>

        {/* Education */}
        <div className="rounded-2xl bg-amber-50 ring-1 ring-amber-200 p-4 space-y-3">
          <p className="text-sm font-semibold text-amber-800">Apa itu Cognitive Reframing?</p>
          <p className="text-sm text-amber-700 leading-relaxed">
            Reframing kognitif adalah teknik inti dari <strong>Cognitive Behavioral Therapy (CBT)</strong> yang terbukti
            efektif untuk depresi, kecemasan, dan trauma. Teknik ini bekerja dengan cara <strong>mengidentifikasi
            dan menantang pola pikir negatif</strong> (cognitive distortions), lalu menggantinya dengan perspektif
            yang lebih seimbang dan realistis.
          </p>
          <p className="text-sm text-amber-700 leading-relaxed">
            Ini bukan tentang "berpikir positif palsu" — tapi tentang <strong>melihat situasi lebih lengkap</strong>
            dan berbicara pada diri sendiri seperti seorang teman yang bijak.
          </p>
        </div>

        {/* Steps preview */}
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/60">4 Langkah Proses</p>
          {STEPS.map((s, i) => (
            <div key={s.id} className={`flex items-center gap-3 rounded-2xl p-3.5 ring-1 ${s.bg} ${s.ring}`}>
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0" style={{ background: s.color }}>
                {i + 1}
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">{s.title}</p>
                <p className="text-xs text-muted-foreground line-clamp-1">{s.desc.split(".")[0]}</p>
              </div>
            </div>
          ))}
        </div>

        {/* When to use */}
        <div className="grid grid-cols-2 gap-2">
          {[
            { icon: "😔", text: "Pikiran negatif berulang" },
            { icon: "😰", text: "Khawatir berlebihan" },
            { icon: "😤", text: "Menyalahkan diri sendiri" },
            { icon: "🌀", text: "Ruminasi / memutar pikiran" },
          ].map((item) => (
            <div key={item.text} className="flex items-center gap-2 rounded-xl bg-cream-deep p-2.5 text-xs text-foreground">
              <span className="text-base">{item.icon}</span>
              {item.text}
            </div>
          ))}
        </div>

        <button
          onClick={() => setPhase("exercise")}
          className="w-full rounded-full bg-primary py-4 text-sm font-semibold text-primary-foreground shadow-soft transition-all duration-300 hover:-translate-y-0.5 hover:shadow-float active:scale-95"
        >
          Mulai Reframing 🪞
        </button>
      </section>
    );
  }

  /* ── DONE ──────────────────────────────────────── */
  if (phase === "done") {
    return (
      <section className="rounded-3xl bg-card p-6 ring-1 ring-border/60 shadow-card space-y-5 animate-scale-in">
        <div className="text-center space-y-3 py-2">
          <div className="relative inline-block">
            <span className="text-5xl" style={{ animation: "bounce-in 0.6s cubic-bezier(0.34,1.56,0.64,1) both" }}>🪞</span>
            <span className="absolute -right-2 -top-2 text-2xl" style={{ animation: "bounce-in 0.7s 0.1s cubic-bezier(0.34,1.56,0.64,1) both" }}>✨</span>
          </div>
          <h2 className="font-display text-2xl font-semibold text-foreground">Sudut Pandang Baru Terbentuk</h2>
          <p className="text-sm text-muted-foreground max-w-xs mx-auto leading-relaxed">
            Cerminan pikiranmu yang lebih ramah dan bijak sudah ada di sini.
          </p>
        </div>

        {/* Before / After */}
        <div className="space-y-3">
          {answers[0].trim() && (
            <div className="rounded-2xl bg-rose-50 ring-1 ring-rose-200 p-4">
              <p className="text-[10px] font-bold text-rose-500 uppercase tracking-wider mb-2">🧠 Pikiran Awal</p>
              <p className="text-sm text-foreground italic leading-relaxed">"{answers[0]}"</p>
            </div>
          )}

          <div className="flex justify-center">
            <div className="flex flex-col items-center gap-1 py-1">
              <div className="w-0.5 h-4 bg-border rounded-full" />
              <span className="text-lg">⬇️</span>
              <div className="w-0.5 h-4 bg-border rounded-full" />
            </div>
          </div>

          {(answers[3] || answers[2]) && (
            <div className="rounded-2xl bg-emerald-50 ring-1 ring-emerald-200 p-4">
              <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider mb-2">✨ Perspektif Baru</p>
              <p className="text-sm font-medium text-foreground leading-relaxed">"{answers[3] || answers[2]}"</p>
            </div>
          )}
        </div>

        {/* Science note */}
        <div className="flex items-start gap-3 rounded-2xl bg-violet-50 ring-1 ring-violet-200 p-4">
          <span className="text-xl">🧠</span>
          <p className="text-xs text-violet-800 leading-relaxed">
            <strong>Tahukah kamu?</strong> Setiap kali kamu melakukan reframing, otak membentuk <strong>jalur neural baru</strong>.
            Semakin sering berlatih, semakin mudah otak menemukan sudut pandang yang lebih seimbang secara otomatis — ini disebut <em>neuroplasticity</em>.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2">
          <button
            onClick={handleReset}
            className="w-full rounded-full bg-primary py-3.5 text-sm font-semibold text-primary-foreground shadow-soft transition-all duration-300 hover:-translate-y-0.5 active:scale-95"
          >
            Mulai Ulang 🔄
          </button>
          <button
            onClick={() => { setStep(0); setPhase("exercise"); }}
            className="w-full rounded-full border border-border py-3 text-sm font-medium text-foreground transition-colors hover:bg-cream-deep"
          >
            Edit Jawaban
          </button>
        </div>
      </section>
    );
  }

  /* ── EXERCISE ───────────────────────────────────── */
  const current = STEPS[step];

  return (
    <section className="rounded-3xl bg-card p-6 ring-1 ring-border/60 shadow-card space-y-5">
      {/* Progress */}
      <div className="flex gap-1.5">
        {STEPS.map((s, i) => (
          <div
            key={i}
            className="h-1.5 flex-1 rounded-full transition-all duration-500"
            style={{
              background: i <= step
                ? `linear-gradient(90deg, var(--color-primary), ${s.color})`
                : "var(--color-cream-deep)",
            }}
          />
        ))}
      </div>

      {/* Step card */}
      <div
        className={`rounded-2xl p-5 ring-1 ${current.bg} ${current.ring} animate-scale-in space-y-3`}
        key={step}
      >
        <div className="flex items-center gap-3">
          <span className="text-3xl" style={{ animation: "bounce-in 0.5s cubic-bezier(0.34,1.56,0.64,1) both" }}>
            {current.icon}
          </span>
          <div>
            <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${current.badge}`}>
              Langkah {step + 1} / {STEPS.length}
            </span>
            <p className="mt-1 font-display text-lg font-semibold text-foreground">{current.title}</p>
          </div>
        </div>
        <p className="text-sm text-foreground/80 leading-relaxed">{current.desc}</p>
        <p className="text-xs text-muted-foreground italic">💡 {current.hint}</p>
        <textarea
          value={answers[step]}
          onChange={(e) => {
            const next = [...answers];
            next[step] = e.target.value;
            setAnswers(next);
          }}
          placeholder={current.placeholder}
          rows={4}
          className="w-full rounded-2xl border border-border bg-white/80 px-4 py-3 text-sm resize-none placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all duration-200"
        />
      </div>

      {/* Navigation */}
      <div className="flex gap-2">
        <button
          onClick={handleBack}
          className="rounded-full border border-border px-5 py-2.5 text-sm font-medium transition-all duration-200 hover:bg-cream-deep"
        >
          ← {step === 0 ? "Panduan" : "Kembali"}
        </button>
        <button
          onClick={handleNext}
          disabled={!answers[step].trim()}
          className="ml-auto rounded-full px-6 py-2.5 text-sm font-semibold text-white transition-all duration-250 hover:-translate-y-0.5 active:scale-95 disabled:opacity-40"
          style={{ background: current.color }}
        >
          {step === STEPS.length - 1 ? "Selesai ✨" : "Selanjutnya →"}
        </button>
      </div>
    </section>
  );
}
