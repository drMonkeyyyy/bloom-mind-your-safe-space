import { useState } from "react";

const GROUNDING_STEPS = [
  {
    num: 5,
    sense: "Lihat 👀",
    prompt: "Sebutkan 5 hal yang bisa kamu lihat sekarang",
    hint: "Bisa apa saja — meja, tanaman, jendela, warna dinding...",
    icon: "👀",
    color: "oklch(0.65 0.06 230)",
    bg: "bg-sky-50",
    ring: "ring-sky-200",
    badge: "bg-sky-100 text-sky-700",
  },
  {
    num: 4,
    sense: "Sentuh 🤚",
    prompt: "Sebutkan 4 hal yang bisa kamu sentuh atau rasakan",
    hint: "Tekstur baju, permukaan meja, udara di kulit, lantai di bawah kakimu...",
    icon: "🤚",
    color: "oklch(0.65 0.10 150)",
    bg: "bg-emerald-50",
    ring: "ring-emerald-200",
    badge: "bg-emerald-100 text-emerald-700",
  },
  {
    num: 3,
    sense: "Dengar 👂",
    prompt: "Sebutkan 3 suara yang bisa kamu dengar sekarang",
    hint: "Angin, kendaraan, suara AC, langkah kaki, detak jam...",
    icon: "👂",
    color: "oklch(0.65 0.12 280)",
    bg: "bg-violet-50",
    ring: "ring-violet-200",
    badge: "bg-violet-100 text-violet-700",
  },
  {
    num: 2,
    sense: "Cium 👃",
    prompt: "Sebutkan 2 hal yang bisa kamu cium atau bayangkan baunya",
    hint: "Kopi, udara segar, sabun, parfum, makanan di sekitarmu...",
    icon: "👃",
    color: "oklch(0.65 0.12 60)",
    bg: "bg-amber-50",
    ring: "ring-amber-200",
    badge: "bg-amber-100 text-amber-700",
  },
  {
    num: 1,
    sense: "Rasakan 💛",
    prompt: "Sebutkan 1 hal yang kamu syukuri atau rasakan saat ini",
    hint: "Bisa sekecil apapun — napas yang bisa kamu ambil, orang yang kamu cintai...",
    icon: "💛",
    color: "oklch(0.65 0.14 80)",
    bg: "bg-yellow-50",
    ring: "ring-yellow-200",
    badge: "bg-yellow-100 text-yellow-700",
  },
];

const FINISH_MESSAGES = [
  "Luar biasa. Kamu berhasil membawa dirimu kembali ke saat ini. 🌿",
  "Kamu sudah hadir penuh. Itu kekuatan yang nyata. ✨",
  "Setiap langkah kecil itu berarti. Kamu baik-baik saja sekarang. 💙",
  "Pikiranmu mulai tenang. Tubuhmu tahu cara untuk pulih. 🦋",
];

type Phase = "intro" | "exercise" | "done";

export function GroundingExercise() {
  const [phase, setPhase] = useState<Phase>("intro");
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState(Array(5).fill(""));
  const finishMsg = FINISH_MESSAGES[Math.floor(Math.random() * FINISH_MESSAGES.length)];

  const current = GROUNDING_STEPS[step];
  const isLast = step === GROUNDING_STEPS.length - 1;

  /* ── INTRO ─────────────────────────────────────── */
  if (phase === "intro") {
    return (
      <section className="rounded-3xl bg-card p-6 ring-1 ring-border/60 shadow-card space-y-5 animate-scale-in">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl text-2xl"
            style={{ background: "oklch(0.93 0.03 230)" }}>
            🌍
          </div>
          <div>
            <h2 className="font-display text-xl font-semibold text-foreground">Grounding 5-4-3-2-1</h2>
            <p className="text-xs text-muted-foreground">Kembali ke momen saat ini</p>
          </div>
        </div>

        {/* Education block */}
        <div className="rounded-2xl bg-sky-50 ring-1 ring-sky-200 p-4 space-y-3">
          <p className="text-sm font-semibold text-sky-800">Apa itu Grounding?</p>
          <p className="text-sm text-sky-700 leading-relaxed">
            Grounding adalah teknik berbasis bukti (<em>evidence-based</em>) yang digunakan dalam terapi CBT & DBT
            untuk menghentikan pikiran yang berputar, panic attack, atau rasa overwhelmed — dengan cara
            <strong> membawa perhatianmu kembali ke tubuh dan lingkungan sekitar.</strong>
          </p>
          <p className="text-sm text-sky-700 leading-relaxed">
            Teknik 5-4-3-2-1 bekerja dengan mengaktifkan <strong>5 indera</strong> secara berurutan.
            Saat pikiranmu fokus ke hal konkret di sekitar, sistem saraf mulai tenang secara alami.
          </p>
        </div>

        {/* When to use */}
        <div className="grid grid-cols-2 gap-2">
          {[
            { icon: "😰", text: "Saat panik tiba-tiba" },
            { icon: "🌀", text: "Pikiran berputar tak henti" },
            { icon: "😶‍🌫️", text: "Merasa tidak nyata (dissociation)" },
            { icon: "😤", text: "Marah atau frustasi berlebihan" },
          ].map((item) => (
            <div key={item.text} className="flex items-center gap-2 rounded-xl bg-cream-deep p-2.5 text-xs text-foreground">
              <span className="text-base">{item.icon}</span>
              {item.text}
            </div>
          ))}
        </div>

        {/* How it works */}
        <div className="flex items-start gap-3 rounded-2xl bg-emerald-50 ring-1 ring-emerald-200 p-4">
          <span className="text-xl">💡</span>
          <p className="text-sm text-emerald-800 leading-relaxed">
            <strong>Cara pakai:</strong> Untuk setiap langkah, tulis apa yang kamu sadari.
            Tidak perlu sempurna — cukup jujur dan pelan-pelan. Ambil napas di antara setiap langkah.
          </p>
        </div>

        <button
          onClick={() => { setPhase("exercise"); setStep(0); setAnswers(Array(5).fill("")); }}
          className="w-full rounded-full bg-primary py-4 text-sm font-semibold text-primary-foreground shadow-soft transition-all duration-300 hover:-translate-y-0.5 hover:shadow-float active:scale-95"
        >
          Mulai Grounding 🌍
        </button>
      </section>
    );
  }

  /* ── DONE ──────────────────────────────────────── */
  if (phase === "done") {
    return (
      <section className="rounded-3xl bg-card p-6 ring-1 ring-border/60 shadow-card space-y-5 animate-scale-in">
        {/* Celebration */}
        <div className="flex flex-col items-center text-center space-y-3 py-2">
          <div className="relative">
            <span className="text-5xl" style={{ animation: "bounce-in 0.6s cubic-bezier(0.34,1.56,0.64,1) both" }}>🌿</span>
            <span className="absolute -right-2 -top-2 text-2xl" style={{ animation: "bounce-in 0.7s 0.1s cubic-bezier(0.34,1.56,0.64,1) both" }}>✨</span>
            <span className="absolute -left-3 -bottom-1 text-xl" style={{ animation: "bounce-in 0.8s 0.2s cubic-bezier(0.34,1.56,0.64,1) both" }}>💙</span>
          </div>
          <h2 className="font-display text-2xl font-semibold text-foreground mt-3">Kamu berhasil! 🎉</h2>
          <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">{finishMsg}</p>
        </div>

        {/* Summary of answers */}
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/60">Ringkasan jawabanmu</p>
          {GROUNDING_STEPS.map((s, i) => (
            answers[i].trim() ? (
              <div key={i} className={`rounded-2xl p-3.5 ring-1 ${s.bg} ${s.ring} flex items-start gap-3`}>
                <span className="text-lg shrink-0 mt-0.5">{s.icon}</span>
                <div className="min-w-0">
                  <span className={`text-[10px] font-bold uppercase rounded-full px-2 py-0.5 ${s.badge}`}>{s.sense}</span>
                  <p className="mt-1 text-sm text-foreground leading-snug whitespace-pre-wrap">{answers[i]}</p>
                </div>
              </div>
            ) : null
          ))}
        </div>

        {/* Science note */}
        <div className="flex items-start gap-3 rounded-2xl bg-violet-50 ring-1 ring-violet-200 p-4">
          <span className="text-xl">🧠</span>
          <p className="text-xs text-violet-800 leading-relaxed">
            <strong>Tahukah kamu?</strong> Teknik grounding terbukti secara klinis membantu menenangkan amigdala
            (pusat stres di otak) dalam 5–10 menit. Semakin sering berlatih, semakin cepat tubuhmu bisa
            kembali ke kondisi tenang.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2">
          <button
            onClick={() => { setPhase("exercise"); setStep(0); setAnswers(Array(5).fill("")); }}
            className="w-full rounded-full bg-primary py-3.5 text-sm font-semibold text-primary-foreground shadow-soft transition-all duration-300 hover:-translate-y-0.5 active:scale-95"
          >
            Ulangi Grounding 🔄
          </button>
          <button
            onClick={() => setPhase("intro")}
            className="w-full rounded-full border border-border py-3 text-sm font-medium text-foreground transition-colors hover:bg-cream-deep"
          >
            Baca ulang panduan
          </button>
        </div>
      </section>
    );
  }

  /* ── EXERCISE ───────────────────────────────────── */
  return (
    <section className="rounded-3xl bg-card p-6 ring-1 ring-border/60 shadow-card space-y-5">
      {/* Progress dots */}
      <div className="flex gap-1.5">
        {GROUNDING_STEPS.map((s, i) => (
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
      <div className={`rounded-2xl p-5 ring-1 ${current.bg} ${current.ring} animate-scale-in space-y-3`} key={step}>
        <div className="flex items-center gap-3">
          <span className="text-4xl" style={{ animation: "bounce-in 0.5s cubic-bezier(0.34,1.56,0.64,1) both" }}>
            {current.icon}
          </span>
          <div>
            <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${current.badge}`}>
              Langkah {step + 1} / {GROUNDING_STEPS.length}
            </span>
            <p className="mt-1 font-display text-xl font-semibold text-foreground">{current.sense}</p>
          </div>
        </div>
        <p className="text-sm font-medium text-foreground">{current.prompt}</p>
        <p className="text-xs text-muted-foreground italic">💡 {current.hint}</p>
        <textarea
          value={answers[step]}
          onChange={(e) => {
            const next = [...answers];
            next[step] = e.target.value;
            setAnswers(next);
          }}
          placeholder="Tulis di sini… tidak perlu sempurna 🌿"
          rows={4}
          className="w-full rounded-2xl border border-border bg-white/80 px-4 py-3 text-sm resize-none placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all duration-200"
        />
      </div>

      {/* Navigation */}
      <div className="flex gap-2">
        <button
          onClick={() => step > 0 ? setStep(s => s - 1) : setPhase("intro")}
          className="rounded-full border border-border px-5 py-2.5 text-sm font-medium transition-all duration-200 hover:bg-cream-deep"
        >
          ← {step === 0 ? "Panduan" : "Kembali"}
        </button>
        {!isLast ? (
          <button
            onClick={() => setStep(s => s + 1)}
            className="ml-auto rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition-all duration-250 hover:-translate-y-0.5 hover:shadow-soft active:scale-95"
          >
            Selanjutnya →
          </button>
        ) : (
          <button
            onClick={() => setPhase("done")}
            className="ml-auto rounded-full bg-accent px-6 py-2.5 text-sm font-semibold text-accent-foreground shadow-peach transition-all duration-250 hover:-translate-y-0.5 active:scale-95"
          >
            Selesai 🌿
          </button>
        )}
      </div>
    </section>
  );
}
