const testimonials = [
  {
    quote:
      "Sejak pakai Bloom Mind, aku jadi lebih ngerti kenapa aku gampang cemas. Sekarang lebih tenang menghadapi hari.",
    name: "Naya, 23",
    role: "Mahasiswa",
    initials: "N",
    tone: "primary",
  },
  {
    quote:
      "Tempat aman buat curhat tengah malam. Nggak dihakimi, nggak disuruh kuat. Cukup didengar.",
    name: "Dimas, 27",
    role: "Karyawan",
    initials: "D",
    tone: "accent",
  },
  {
    quote:
      "Weekly insight-nya bikin aku sadar pola makan emosionalku. Sekarang aku lebih sayang sama diri sendiri.",
    name: "Rara, 25",
    role: "Freelancer",
    initials: "R",
    tone: "primary",
  },
];

export function Testimonials() {
  return (
    <section className="relative bg-cream-deep/60 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div data-reveal className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-primary">
            Testimoni
          </p>
          <h2 className="mt-3 font-display text-4xl font-semibold leading-tight text-foreground sm:text-5xl">
            Cerita Mereka yang{" "}
            <span className="italic text-primary">Sudah Bertumbuh</span>
          </h2>
        </div>

        <div className="mt-14 grid gap-5 lg:grid-cols-3">
          {testimonials.map((t, i) => (
            <figure
              key={t.name}
              data-reveal
              style={{ transitionDelay: `${i * 90}ms` }}
              className="relative flex flex-col gap-6 rounded-3xl bg-card p-8 ring-1 ring-border transition-all duration-300 hover:-translate-y-1 hover:shadow-float"
            >
              <span className="font-display text-6xl leading-none text-primary/30">
                "
              </span>
              <blockquote className="-mt-8 font-display text-xl italic leading-relaxed text-foreground">
                {t.quote}
              </blockquote>
              <figcaption className="mt-auto flex items-center gap-3 border-t border-border pt-5">
                <span
                  className={`grid h-11 w-11 shrink-0 place-items-center rounded-full font-display text-lg font-semibold ${
                    t.tone === "primary"
                      ? "bg-primary-soft text-primary"
                      : "bg-accent-soft text-accent"
                  }`}
                >
                  {t.initials}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-foreground">{t.name}</p>
                  <p className="truncate text-xs text-muted-foreground">{t.role}</p>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
