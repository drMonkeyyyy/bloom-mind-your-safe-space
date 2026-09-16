const testimonials = [
  {
    quote: "Sejak pakai JN-CALM, aku jadi lebih ngerti kenapa aku gampang cemas. Sekarang lebih tenang menghadapi hari. Emergency Calm-nya luar biasa bantu saat panik malam.",
    name: "Naya",
    age: 23,
    role: "Mahasiswi, Bandung",
    initials: "N",
    stars: 5,
    tone: "primary",
    program: "Program 90 Hari",
  },
  {
    quote: "Tempat aman buat curhat tengah malam. Nggak dihakimi, nggak disuruh kuat. Cukup didengar dan dipahami. Lebih membantu dari yang aku bayangkan.",
    name: "Dimas",
    age: 27,
    role: "Karyawan Swasta, Jakarta",
    initials: "D",
    stars: 5,
    tone: "accent",
    program: "Program 30 Hari",
  },
  {
    quote: "Weekly insight-nya bikin aku sadar pola makan emosionalku. Sekarang aku lebih sayang sama diri sendiri dan nggak lagi makan saat cemas.",
    name: "Rara",
    age: 25,
    role: "Freelancer, Yogyakarta",
    initials: "R",
    stars: 5,
    tone: "primary",
    program: "Program 90 Hari",
  },
  {
    quote: "Jurnal CBT-nya beneran membantu aku melihat pola pikir negatif. Awalnya skeptis, tapi setelah 2 minggu, aku bisa tidur lebih nyenyak dan nggak overthinking terus.",
    name: "Bima",
    age: 29,
    role: "Software Engineer, Surabaya",
    initials: "B",
    stars: 5,
    tone: "accent",
    program: "Program 1 Tahun",
  },
  {
    quote: "Komunitas-nya bikin aku sadar bukan cuma aku yang struggle. Setelah bagi cerita anonim dan dapat pelukan virtual, rasanya lega banget. Gratis lagi!",
    name: "Sinta",
    age: 21,
    role: "Mahasiswi, Semarang",
    initials: "S",
    stars: 5,
    tone: "primary",
    program: "Pengguna Gratis → Upgrade 90 Hari",
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
    <section className="relative py-14 sm:py-32">
      <div className="absolute inset-0 bg-cream-deep/40" />
      <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
        <div data-reveal className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">Testimonial Nyata</p>
          <h2 className="mt-3 font-display text-2xl sm:text-5xl font-semibold leading-tight text-foreground">
            Cerita Mereka yang{" "}
            <span className="italic text-primary">Sudah Bertumbuh</span>
          </h2>

          {/* Aggregate rating */}
          <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-card px-4 py-2 sm:px-5 sm:py-2.5 ring-1 ring-border">
            <Stars count={5} />
            <span className="text-xs sm:text-sm font-semibold text-foreground">4.9/5</span>
            <span className="text-[10px] sm:text-xs text-muted-foreground">dari 1.200+ pengguna aktif</span>
          </div>
        </div>

        {/* Scrollable row on mobile, 3-col masonry on desktop */}
        <div className="mt-10 sm:mt-14 columns-1 sm:columns-2 lg:columns-3 gap-5 space-y-5">
          {testimonials.map((t, i) => (
            <figure
              key={t.name}
              data-reveal
              style={{ transitionDelay: `${i * 80}ms` }}
              className="relative break-inside-avoid flex flex-col gap-4 sm:gap-5 rounded-3xl bg-card p-5 sm:p-7 ring-1 ring-border transition-all duration-300 hover:-translate-y-1 hover:shadow-float"
            >
              {/* Verified badge */}
              <div className="flex items-center justify-between">
                <Stars count={t.stars} />
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 text-[9px] font-bold text-emerald-700 dark:text-emerald-400 ring-1 ring-emerald-200 dark:ring-emerald-800">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="h-2.5 w-2.5">
                    <path d="m5 12 4 4 10-10" />
                  </svg>
                  Pengguna Terverifikasi
                </span>
              </div>

              <blockquote className="font-display text-base sm:text-lg italic leading-relaxed text-foreground flex-1">
                "{t.quote}"
              </blockquote>

              {/* Program badge */}
              <div className="rounded-xl bg-primary-soft px-3 py-1.5 text-[10px] font-bold text-primary">
                📋 {t.program}
              </div>

              <figcaption className="flex items-center gap-3 border-t border-border pt-4">
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

        {/* Bottom CTA */}
        <div data-reveal className="mt-10 text-center">
          <a
            href="/auth?mode=register"
            className="inline-flex items-center gap-2 rounded-full bg-primary px-8 py-3.5 text-sm font-semibold text-primary-foreground shadow-soft transition-all duration-300 hover:-translate-y-0.5 hover:shadow-float"
          >
            Bergabung Gratis — Jadilah Bagian Dari Mereka
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="h-4 w-4" aria-hidden="true">
              <path d="M5 12h14m-5-5 5 5-5 5" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
}
