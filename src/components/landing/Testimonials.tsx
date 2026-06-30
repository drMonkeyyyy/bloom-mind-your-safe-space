const testimonials = [
  {
    quote: "Sejak pakai Bloom Mind, aku jadi lebih ngerti kenapa aku gampang cemas. Sekarang lebih tenang menghadapi hari.",
    name: "Naya",
    age: 23,
    role: "Mahasiswi",
    initials: "N",
    stars: 5,
    tone: "primary",
  },
  {
    quote: "Tempat aman buat curhat tengah malam. Nggak dihakimi, nggak disuruh kuat. Cukup didengar dan dipahami.",
    name: "Dimas",
    age: 27,
    role: "Karyawan",
    initials: "D",
    stars: 5,
    tone: "accent",
  },
  {
    quote: "Weekly insight-nya bikin aku sadar pola makan emosionalku. Sekarang aku lebih sayang sama diri sendiri.",
    name: "Rara",
    age: 25,
    role: "Freelancer",
    initials: "R",
    stars: 5,
    tone: "primary",
  },
];

function Stars({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5" aria-label={`Rating ${count} bintang dari 5`}>
      {Array.from({ length: count }).map((_, i) => (
        <svg key={i} viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4 text-amber-400" aria-hidden="true">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
    </div>
  );
}

export function Testimonials() {
  return (
    <section className="relative py-24 sm:py-32">
      <div className="absolute inset-0 bg-cream-deep/40" />
      <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
        <div data-reveal className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">Testimoni</p>
          <h2 className="mt-3 font-display text-4xl font-semibold leading-tight text-foreground sm:text-5xl">
            Cerita Mereka yang{" "}
            <span className="italic text-primary">Sudah Bertumbuh</span>
          </h2>

          {/* Aggregate rating */}
          <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-card px-5 py-2.5 ring-1 ring-border">
            <Stars count={5} />
            <span className="text-sm font-semibold text-foreground">4.9/5</span>
            <span className="text-xs text-muted-foreground">dari 1.000+ pengguna aktif</span>
          </div>
        </div>

        <div className="mt-14 grid gap-5 lg:grid-cols-3">
          {testimonials.map((t, i) => (
            <figure
              key={t.name}
              data-reveal
              style={{ transitionDelay: `${i * 90}ms` }}
              className="relative flex flex-col gap-5 rounded-3xl bg-card p-7 ring-1 ring-border transition-all duration-300 hover:-translate-y-1 hover:shadow-float"
            >
              <Stars count={t.stars} />
              <blockquote className="font-display text-lg italic leading-relaxed text-foreground flex-1">
                "{t.quote}"
              </blockquote>
              <figcaption className="flex items-center gap-3 border-t border-border pt-5">
                <div
                  className={`grid h-11 w-11 shrink-0 place-items-center rounded-full font-display text-lg font-bold ${
                    t.tone === "primary" ? "bg-primary text-primary-foreground" : "bg-accent text-accent-foreground"
                  }`}
                  aria-hidden="true"
                >
                  {t.initials}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-foreground">{t.name}, {t.age}</p>
                  <p className="text-xs text-muted-foreground">{t.role}</p>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
