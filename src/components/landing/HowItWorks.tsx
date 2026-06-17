const steps = [
  {
    n: "01",
    title: "Pilih Pendamping",
    desc: "Pilih sosok AI yang paling membuat kamu nyaman bercerita.",
    emoji: "🤍",
  },
  {
    n: "02",
    title: "Ceritakan Apa yang Kamu Rasakan",
    desc: "Tulis atau cerita lepas. Tanpa filter, tanpa penilaian.",
    emoji: "💬",
  },
  {
    n: "03",
    title: "Dapatkan Insight dan Bertumbuh",
    desc: "Refleksi harian dan insight mingguan menemani perjalananmu.",
    emoji: "🌱",
  },
];

export function HowItWorks() {
  return (
    <section id="cara-kerja" className="relative bg-cream-deep/60 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div data-reveal className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-primary">
            Cara Kerja
          </p>
          <h2 className="mt-3 font-display text-4xl font-semibold leading-tight text-foreground sm:text-5xl">
            Mulai Dalam 3 Langkah Sederhana
          </h2>
        </div>

        <div className="relative mt-20 grid gap-10 lg:grid-cols-3">
          {/* connecting line */}
          <div className="absolute left-1/2 top-10 hidden h-[2px] w-[70%] -translate-x-1/2 lg:block">
            <div className="h-full w-full bg-[length:14px_2px] bg-repeat-x" style={{ backgroundImage: "linear-gradient(90deg, var(--color-primary) 50%, transparent 50%)" }} />
          </div>

          {steps.map((s, i) => (
            <div
              key={s.n}
              data-reveal
              style={{ transitionDelay: `${i * 120}ms` }}
              className="relative flex flex-col items-center text-center"
            >
              <div className="relative grid h-20 w-20 place-items-center rounded-full bg-card text-3xl shadow-soft ring-1 ring-border">
                {s.emoji}
                <span className="absolute -right-2 -top-2 grid h-9 w-9 place-items-center rounded-full bg-accent font-display text-sm font-bold text-accent-foreground shadow-peach">
                  {s.n}
                </span>
              </div>
              <h3 className="mt-6 font-display text-2xl font-semibold text-foreground">
                {s.title}
              </h3>
              <p className="mt-2 max-w-xs text-[15px] leading-relaxed text-muted-foreground">
                {s.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
