const features = [
  {
    title: "Teman Curhat AI 24/7",
    desc: "Curhat interaktif kapan saja dengan asisten AI yang hangat tanpa dihakimi.",
    icon: (
      <path d="M7 8h10M7 12h6m-9 8 4-4h10a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v14Z" />
    ),
    tone: "primary",
  },
  {
    title: "Mood & Stress Tracker",
    desc: "Pantau emosi, tingkat energi, dan indikator stres Anda secara real-time.",
    icon: <path d="M4 18V8m5 10V4m5 14v-7m5 7v-3" />,
    tone: "accent",
  },
  {
    title: "AI Journal & Gratitude",
    desc: "Tulis rasa syukur harian, biar AI merangkum dan merefleksikan harimu.",
    icon: <path d="M5 4h11l3 3v13a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1Zm3 7h8m-8 4h6" />,
    tone: "primary",
  },
  {
    title: "Emergency Calm Mode",
    desc: "Latihan somatik, pernapasan, dan grounding darurat saat cemas menyerang.",
    icon: <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />,
    tone: "accent",
  },
  {
    title: "Detektor Eating Emosional",
    desc: "Kenali apakah lapar Anda fisik atau dorongan emosi (Emotional Eating).",
    icon: <path d="M3 12h18M12 3v9M12 12A9 9 0 0 1 3 21h18a9 9 0 0 1-9-9Z" />,
    tone: "primary",
  },
  {
    title: "Daily & Weekly AI Insight",
    desc: "Evaluasi kesehatan mental harian dan mingguan personal dari Gemini.",
    icon: <path d="M12 3v3m0 12v3m9-9h-3M6 12H3m14.5-6.5-2 2m-9 9-2 2m13 0-2-2m-9-9-2-2" />,
    tone: "accent",
  },
];

export function Features() {
  return (
    <section id="fitur" className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div data-reveal className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-primary">
            Fitur JN-CALM
          </p>
          <h2 className="mt-3 font-display text-4xl font-semibold leading-tight text-foreground sm:text-5xl">
            JN-CALM Membantu Kamu{" "}
            <span className="italic text-primary">Bertumbuh</span> Setiap Hari
          </h2>
        </div>

        <div className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => (
            <div
              key={f.title}
              data-reveal
              style={{ transitionDelay: `${i * 70}ms` }}
              className="group relative overflow-hidden rounded-3xl bg-card p-8 ring-1 ring-border transition-all duration-500 hover:-translate-y-1.5 hover:shadow-float hover:ring-primary-soft"
            >
              <div
                className={`absolute -right-12 -top-12 h-32 w-32 rounded-full opacity-0 transition-opacity duration-500 group-hover:opacity-100 ${
                  f.tone === "primary" ? "bg-primary-soft" : "bg-accent-soft"
                }`}
              />
              <span
                className={`relative grid h-14 w-14 place-items-center rounded-2xl ${
                  f.tone === "primary"
                    ? "bg-primary-soft text-primary"
                    : "bg-accent-soft text-accent"
                }`}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
                  {f.icon}
                </svg>
              </span>
              <h3 className="relative mt-6 font-display text-2xl font-semibold text-foreground">
                {f.title}
              </h3>
              <p className="relative mt-2 text-[15px] leading-relaxed text-muted-foreground">
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
