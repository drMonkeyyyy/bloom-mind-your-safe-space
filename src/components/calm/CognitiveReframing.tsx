import { useState } from "react";

export function CognitiveReframing() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<string[]>(Array(4).fill(""));
  const [completed, setCompleted] = useState(false);

  const steps = [
    {
      title: "Pikiran Negatif 🧠",
      desc: "Apa pikiran buruk atau kekhawatiran yang sedang membebanimu saat ini?",
      placeholder: "Contoh: Aku gagal ujian hari ini, aku memang lambat belajar...",
    },
    {
      title: "Lingkaran Kendali ⭕",
      desc: "Apakah situasi ini berada dalam kendalimu? Bagian mana yang bisa kamu ubah, dan bagian mana yang perlu kamu ikhlaskan?",
      placeholder: "Contoh: Hasil ujian hari ini sudah terjadi dan di luar kendaliku. Yang bisa kukendalikan adalah cara belajarku selanjutnya...",
    },
    {
      title: "Sudut Pandang Sahabat 🤝",
      desc: "Jika sahabat dekatmu menceritakan beban ini kepadamu, kata-kata penuh kasih dan dukungan apa yang akan kamu katakan padanya?",
      placeholder: "Contoh: Kamu sudah belajar keras akhir-akhir ini. Satu nilai tidak mendefinisikan kepintaranmu. Kamu bisa mencobanya lagi...",
    },
    {
      title: "Formulasi Baru ✨",
      desc: "Sekarang, mari satukan kebaikan tersebut. Tulis kembali pikiran negatif tadi menggunakan sudut pandang baru yang lebih ramah dan realistis pada dirimu sendiri.",
      placeholder: "Contoh: Meskipun ujian ini mengecewakan, aku menghargai kerja kerasku. Aku akan belajar dengan strategi baru untuk ujian depan...",
    },
  ];

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(s => s + 1);
    } else {
      setCompleted(true);
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setStep(s => s - 1);
    }
  };

  const handleReset = () => {
    setStep(0);
    setAnswers(Array(4).fill(""));
    setCompleted(false);
  };

  if (completed) {
    return (
      <section className="rounded-3xl bg-card p-6 ring-1 ring-border/60 shadow-card space-y-5 animate-scale-in">
        <div className="text-center space-y-2">
          <span className="text-4xl animate-float inline-block">🪞</span>
          <h3 className="font-display text-xl font-semibold text-primary">Sudut Pandang Baru Terbentuk</h3>
          <p className="text-xs text-muted-foreground">Ini adalah cerminan pikiranmu yang lebih ramah dan bijak.</p>
        </div>

        <div className="space-y-4 pt-2">
          <div className="rounded-2xl bg-destructive/5 p-4 border border-destructive/10">
            <p className="text-[10px] font-bold text-destructive uppercase tracking-wider">Pikiran Awal</p>
            <p className="mt-1 text-sm text-foreground italic">"{answers[0]}"</p>
          </div>

          <div className="rounded-2xl bg-primary-soft/60 p-4 border border-primary/10">
            <p className="text-[10px] font-bold text-primary uppercase tracking-wider">Sudut Pandang Baru</p>
            <p className="mt-1 text-sm font-medium text-foreground">
              "{answers[3] || answers[2] || "Aku memilih untuk lebih berbelas kasih pada diriku sendiri."}"
            </p>
          </div>
        </div>

        <div className="flex justify-center pt-2">
          <button
            onClick={handleReset}
            className="rounded-full bg-primary px-8 py-2.5 text-xs font-semibold text-primary-foreground shadow-soft transition-all duration-200 active:scale-95"
          >
            Mulai Ulang 🌿
          </button>
        </div>
      </section>
    );
  }

  const current = steps[step];

  return (
    <section className="rounded-3xl bg-card p-6 ring-1 ring-border/60 shadow-card space-y-5">
      <div className="flex gap-1.5">
        {steps.map((_, i) => (
          <div
            key={i}
            className="h-1.5 flex-1 rounded-full transition-all duration-500"
            style={{
              background: i <= step
                ? "linear-gradient(90deg, var(--color-primary), oklch(0.77 0.085 40))"
                : "var(--color-cream-deep)",
            }}
          />
        ))}
      </div>

      <div className="animate-scale-in" key={step}>
        <h3 className="font-display text-lg font-semibold text-foreground">{current.title}</h3>
        <p className="mt-1 text-sm text-muted-foreground">{current.desc}</p>

        <textarea
          value={answers[step]}
          onChange={(e) => {
            const newAns = [...answers];
            newAns[step] = e.target.value;
            setAnswers(newAns);
          }}
          placeholder={current.placeholder}
          rows={4}
          className="mt-4 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm resize-none placeholder:text-muted-foreground/50 transition-all duration-200"
        />
      </div>

      <div className="flex justify-between items-center pt-2">
        <button
          onClick={handleBack}
          disabled={step === 0}
          className="rounded-full border border-border px-5 py-2 text-xs font-medium transition-all duration-200 hover:bg-cream-deep disabled:opacity-30"
        >
          ← Kembali
        </button>

        <button
          onClick={handleNext}
          disabled={!answers[step].trim()}
          className="rounded-full bg-primary px-6 py-2.5 text-xs font-semibold text-primary-foreground shadow-soft transition-all duration-250 hover:-translate-y-0.5 active:scale-95 disabled:opacity-40"
        >
          {step === steps.length - 1 ? "Selesai 🌿" : "Selanjutnya →"}
        </button>
      </div>
    </section>
  );
}
