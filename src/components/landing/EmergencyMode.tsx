const tools = [
  { title: "Breathing Exercise", desc: "Latihan napas 4-7-8.", emoji: "🌬️" },
  { title: "Grounding Exercise", desc: "Kembalikan fokus ke saat ini.", emoji: "🌍" },
  { title: "Self-Calming Guide", desc: "Panduan menenangkan diri.", emoji: "🤍" },
  { title: "Quick Emotional Support", desc: "Curhat instan ke pendamping.", emoji: "💬" },
];

export function EmergencyMode() {
  return (
    <section className="relative overflow-hidden py-24 sm:py-32">
      <div className="absolute inset-0 -z-10" style={{ background: "var(--gradient-hero)" }} />
      <div className="absolute -top-32 left-1/2 -z-10 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-primary-soft blur-3xl opacity-60" />

      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="grid items-center gap-14 lg:grid-cols-2">
          <div data-reveal className="relative grid place-items-center">
            {/* Breathing circles */}
            <div className="relative grid h-80 w-80 place-items-center sm:h-96 sm:w-96">
              <div className="absolute inset-0 rounded-full bg-primary/10 animate-breathe" />
              <div className="absolute inset-8 rounded-full bg-primary/20 animate-breathe" style={{ animationDelay: "0.6s" }} />
              <div className="absolute inset-16 rounded-full bg-primary/30 animate-breathe" style={{ animationDelay: "1.2s" }} />
              <div className="relative grid h-32 w-32 place-items-center rounded-full bg-gradient-to-br from-primary to-accent text-primary-foreground shadow-float">
                <div className="text-center">
                  <p className="text-[10px] font-medium uppercase tracking-wider opacity-80">Tarik napas</p>
                  <p className="mt-1 font-display text-2xl font-semibold">4 · 7 · 8</p>
                </div>
              </div>
            </div>
          </div>

          <div data-reveal>
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-primary">
              Emergency Calm Mode
            </p>
            <h2 className="mt-3 font-display text-4xl font-semibold leading-tight text-foreground sm:text-5xl">
              Saat Hari Terasa{" "}
              <span className="italic text-primary">Terlalu Berat</span>
            </h2>
            <p className="mt-5 max-w-md text-base leading-relaxed text-muted-foreground">
              Satu tap untuk menenangkan diri. Bloom Mind menemani kamu melewati
              momen-momen paling berat dengan latihan singkat yang menentramkan.
            </p>

            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {tools.map((t) => (
                <div
                  key={t.title}
                  className="group flex items-start gap-3 rounded-2xl bg-card p-4 ring-1 ring-border transition-all hover:-translate-y-0.5 hover:shadow-soft hover:ring-primary-soft"
                >
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary-soft text-xl">
                    {t.emoji}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-foreground">{t.title}</p>
                    <p className="text-xs leading-snug text-muted-foreground">{t.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
