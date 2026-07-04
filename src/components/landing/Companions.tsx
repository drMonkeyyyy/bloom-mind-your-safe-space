const companions = [
  { emoji: "👩", label: "Ibu" },
  { emoji: "👨", label: "Ayah" },
  { emoji: "👩‍🦰", label: "Kakak Perempuan" },
  { emoji: "👨‍🦱", label: "Kakak Laki-Laki" },
  { emoji: "🤝", label: "Sahabat" },
  { emoji: "❤️", label: "Partner" },
  { emoji: "🎯", label: "Coach" },
];

export function Companions() {
  return (
    <section className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div data-reveal className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-primary">
            Pilihan Pendamping
          </p>
          <h2 className="mt-3 font-display text-4xl font-semibold leading-tight text-foreground sm:text-5xl">
            Pilih Pendamping yang Paling{" "}
            <span className="italic text-primary">Memahami Kamu</span>
          </h2>
        </div>

        <div className="mt-14 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-7">
          {companions.map((c, i) => (
            <div
              key={c.label}
              data-reveal
              style={{ transitionDelay: `${i * 50}ms` }}
              className="group flex flex-col items-center gap-3 rounded-3xl bg-card p-5 ring-1 ring-border transition-all duration-300 hover:-translate-y-1 hover:shadow-soft hover:ring-primary-soft"
            >
              <span className="grid h-16 w-16 place-items-center rounded-full bg-gradient-to-br from-primary-soft to-accent-soft text-3xl transition-transform group-hover:scale-110">
                {c.emoji}
              </span>
              <span className="text-sm font-medium text-foreground text-center">
                {c.label}
              </span>
            </div>
          ))}
        </div>

        {/* Custom companion */}
        <div data-reveal className="relative mt-16 overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-primary to-primary/80 p-8 sm:p-14 lg:p-16">
          <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-accent/30 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-cream/20 blur-3xl" />

          <div className="relative grid items-center gap-10 lg:grid-cols-2">
            <div>
              <span className="inline-flex rounded-full bg-cream/15 px-4 py-1.5 text-xs font-medium text-primary-foreground ring-1 ring-cream/20 backdrop-blur">
                ✨ Custom Companion
              </span>
              <h3 className="mt-5 font-display text-3xl font-semibold leading-tight text-primary-foreground sm:text-4xl">
                Hadirkan sosok yang paling kamu rindukan.
              </h3>
              <p className="mt-4 max-w-md text-base leading-relaxed text-primary-foreground/85">
                Upload foto siapa pun yang ingin kamu jadikan pendamping visual —
                pasangan, sahabat, orang tua, atau tokoh inspirasimu.
              </p>
              <div className="mt-6 flex flex-wrap gap-2">
                {["Pasangan", "Sahabat", "Orang tua", "Tokoh inspirasi"].map((t) => (
                  <span
                    key={t}
                    className="rounded-full bg-cream/15 px-3.5 py-1.5 text-xs font-medium text-primary-foreground ring-1 ring-cream/20 backdrop-blur"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>

            {/* Mockup */}
            <div className="relative rounded-3xl bg-card p-6 shadow-float">
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Sesuaikan Pendamping
              </p>
              <div className="mt-4 flex items-center gap-4">
                <div className="relative grid h-20 w-20 place-items-center rounded-full bg-gradient-to-br from-primary-soft to-accent-soft text-3xl ring-4 ring-card">
                  👤
                  <span className="absolute -bottom-1 -right-1 grid h-7 w-7 place-items-center rounded-full bg-accent text-accent-foreground shadow-peach">
                    <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5">
                      <path d="M12 5v14m-7-7h14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                    </svg>
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-display text-lg font-semibold text-foreground">
                    Pendamping Baru
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    Upload foto · Beri nama · Pilih nada bicara
                  </p>
                </div>
              </div>
              <div className="mt-5 space-y-2.5">
                {[
                  ["Nama", "Bunda Sari"],
                  ["Nada", "Hangat & lembut"],
                  ["Peran", "Sosok ibu"],
                ].map(([k, v]) => (
                  <div
                    key={k}
                    className="flex items-center justify-between rounded-2xl bg-cream-deep/60 px-4 py-2.5"
                  >
                    <span className="text-xs font-medium text-muted-foreground">{k}</span>
                    <span className="text-sm font-semibold text-foreground">{v}</span>
                  </div>
                ))}
              </div>
              <button className="mt-5 w-full rounded-full bg-foreground py-3 text-sm font-semibold text-cream transition-opacity hover:opacity-90">
                Simpan Pendamping
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
