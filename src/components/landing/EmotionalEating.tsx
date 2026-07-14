const flow = [
  { label: "Emosi", value: "Cemas", emoji: "😰" },
  { label: "Pemicu", value: "Deadline tugas", emoji: "📚" },
  { label: "Pola Makan", value: "Craving manis", emoji: "🍫" },
  { label: "Insight", value: "Coba 5 min napas", emoji: "🌿" },
];

const types = [
  { title: "Stress Eating", desc: "Saat tekanan datang, tubuh cari pelarian." },
  { title: "Bored Eating", desc: "Makan karena kosong, bukan lapar." },
  { title: "Emotional Eating", desc: "Emosi dijawab dengan makanan." },
  { title: "Craving Patterns", desc: "Pola yang berulang tanpa disadari." },
];

export function EmotionalEating() {
  return (
    <section className="relative bg-cream-deep/60 py-14 sm:py-32">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div data-reveal className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-primary">
            Emotional Eating
          </p>
          <h2 className="mt-3 font-display text-2xl sm:text-5xl font-semibold leading-tight text-foreground">
            Pahami Hubungan Antara{" "}
            <span className="italic text-primary">Emosi dan Makan</span>
          </h2>
          <p className="mx-auto mt-4 max-w-xl font-display text-lg sm:text-2xl italic text-foreground/80">
            "Tidak semua rasa lapar berasal dari perut."
          </p>
        </div>

        <div className="mt-10 sm:mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {types.map((t, i) => (
            <div
              key={t.title}
              data-reveal
              style={{ transitionDelay: `${i * 60}ms` }}
              className="rounded-3xl bg-card p-5 sm:p-6 ring-1 ring-border transition-all hover:-translate-y-1 hover:shadow-soft"
            >
              <span className="h-1.5 w-10 rounded-full bg-accent block" />
              <h3 className="mt-4 font-display text-lg sm:text-xl font-semibold text-foreground">
                {t.title}
              </h3>
              <p className="mt-2 text-xs sm:text-sm leading-relaxed text-muted-foreground">{t.desc}</p>
            </div>
          ))}
        </div>

        {/* Flow */}
        <div data-reveal className="mt-10 sm:mt-14 rounded-3xl bg-card p-5 sm:p-10 ring-1 ring-border">
          <p className="text-center text-[10px] sm:text-xs font-medium uppercase tracking-wider text-muted-foreground">
            JN-CALM memetakan pola ini
          </p>
          <div className="mt-6 grid items-center gap-4 lg:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr]">
            {flow.map((f, i) => (
              <div key={f.label} className="contents">
                <div className="flex flex-col items-center gap-2 rounded-2xl bg-cream-deep/70 p-5 text-center">
                  <span className="text-3xl">{f.emoji}</span>
                  <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                    {f.label}
                  </p>
                  <p className="font-display text-lg font-semibold text-foreground">
                    {f.value}
                  </p>
                </div>
                {i < flow.length - 1 && (
                  <span className="mx-auto text-primary lg:rotate-0">
                    <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6 rotate-90 lg:rotate-0">
                      <path d="M5 12h14m-5-5 5 5-5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
