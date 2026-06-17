const features = [
  "Chat AI tanpa batas",
  "Semua AI Companion",
  "Weekly AI Insight",
  "Growth Dashboard",
  "Emotional Eating Analysis",
  "Full History",
];

export function Pricing() {
  return (
    <section id="harga" className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-3xl px-5 sm:px-8">
        <div data-reveal className="text-center">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-primary">
            Harga
          </p>
          <h2 className="mt-3 font-display text-4xl font-semibold leading-tight text-foreground sm:text-5xl">
            Mulai Bertumbuh Hari Ini
          </h2>
        </div>

        <div data-reveal className="relative mt-14">
          <div className="absolute -inset-1 rounded-[2.5rem] bg-gradient-to-br from-accent via-primary to-accent opacity-60 blur-xl" />
          <div className="relative overflow-hidden rounded-[2.5rem] bg-card p-8 ring-1 ring-border sm:p-12">
            <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-accent-soft blur-2xl" />
            <div className="absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-primary-soft blur-2xl" />

            <div className="relative">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className="inline-flex items-center gap-2 rounded-full bg-accent-soft px-3.5 py-1.5 text-xs font-semibold text-accent">
                  ✨ Premium
                </span>
                <span className="text-xs font-medium text-muted-foreground">
                  Tanpa kontrak, bisa berhenti kapan saja
                </span>
              </div>

              <h3 className="mt-6 font-display text-3xl font-semibold text-foreground">
                Bloom Mind Premium
              </h3>

              <div className="mt-4 flex items-baseline gap-2">
                <span className="font-display text-6xl font-bold text-foreground">
                  Rp49.000
                </span>
                <span className="text-base text-muted-foreground">/bulan</span>
              </div>

              <ul className="mt-8 grid gap-3 sm:grid-cols-2">
                {features.map((f) => (
                  <li key={f} className="flex items-center gap-3">
                    <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground">
                      <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5">
                        <path d="m5 12 4 4 10-10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                    <span className="text-[15px] text-foreground">{f}</span>
                  </li>
                ))}
              </ul>

              <a
                href="#"
                className="mt-10 inline-flex w-full items-center justify-center gap-2 rounded-full bg-accent px-8 py-4 text-base font-semibold text-accent-foreground shadow-peach transition-all duration-300 hover:-translate-y-0.5 hover:shadow-float"
              >
                Mulai Sekarang
                <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
                  <path d="M5 12h14m-5-5 5 5-5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </a>

              <p className="mt-4 text-center text-sm text-muted-foreground">
                Kurang dari harga satu kali nongkrong di coffee shop ☕
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
