const features = [
  {
    title: "Teman Curhat AI 24/7",
    desc: "Curhat interaktif kapan saja dengan asisten AI yang hangat tanpa dihakimi.",
    stat: "10+ pendamping AI tersedia",
    icon: (
      <path d="M7 8h10M7 12h6m-9 8 4-4h10a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v14Z" />
    ),
    tone: "primary",
  },
  {
    title: "Emergency Calm Mode",
    desc: "10 alat krisis instan: pernapasan, grounding, somatic, reframing & katarsis emosi.",
    stat: "10 teknik terpandu klinis",
    icon: <path d="M4.318 6.318a4.5 4.5 0 0 0 0 6.364L12 20.364l7.682-7.682a4.5 4.5 0 0 0-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 0 0-6.364 0z" />,
    tone: "accent",
  },
  {
    title: "Tes Kesehatan Mental (Calm Check)",
    desc: "Evaluasi klinis DASS-21 mandiri dengan laporan skor terstruktur & grafik progres.",
    stat: "Berbasis DASS-21 tervalidasi",
    icon: (
      <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2m-6 9 2 2 4-4" />
    ),
    tone: "primary",
  },
  {
    title: "Mood & Stress Tracker",
    desc: "Pantau emosi, tingkat energi, dan pemicu stres kamu secara real-time dengan grafik.",
    stat: "Analisis tren 30–365 hari",
    icon: <path d="M4 18V8m5 10V4m5 14v-7m5 7v-3" />,
    tone: "accent",
  },
  {
    title: "CBT Journal & Gratitude",
    desc: "Jurnal refleksi berbasis terapi kognitif (CBT) dan gratitude untuk neuroplastisitas positif.",
    stat: "100+ prompt refleksi AI",
    icon: <path d="M5 4h11l3 3v13a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1Zm3 7h8m-8 4h6" />,
    tone: "primary",
  },
  {
    title: "Detektor Emotional Eating",
    desc: "Bedakan lapar fisik dari lapar emosi & putus siklus makan kompulsif secara sadar.",
    stat: "Analisis pola gut-brain axis",
    icon: <path d="M3 12h18M12 3v9M12 12A9 9 0 0 1 3 21h18a9 9 0 0 1-9-9Z" />,
    tone: "accent",
  },
  {
    title: "Growth Dashboard & PDF",
    desc: "Grafik kemajuan emosi 360° dan ekspor Laporan Klinis PDF bergaya buku harian.",
    stat: "Ekspor PDF eksklusif",
    icon: <path d="M12 3v3m0 12v3m9-9h-3M6 12H3m14.5-6.5-2 2m-9 9-2 2m13 0-2-2m-9-9-2-2" />,
    tone: "primary",
  },
  {
    title: "Komunitas Sahabat Support",
    desc: "Berbagi cerita anonim & beri Pelukan Hangat 🩵 di safe space bersama ribuan anggota.",
    stat: "🆓 GRATIS untuk semua user",
    icon: <path d="M17 20h5v-2a3 3 0 0 0-5.356-1.857M17 20H7m10 0v-2c0-.768-.231-1.48-.634-2.072M7 20H2v-2a3 3 0 0 1 5.356-1.857M7 20v-2c0-.768.231-1.48.634-2.072M15 7a3 3 0 1 1-6 0 3 3 0 0 1 6 0z" />,
    tone: "accent",
    isFree: true,
  },
];

export function Features() {
  return (
    <section id="fitur" className="relative py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div data-reveal className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-primary">
            10+ Fitur Klinis Terpadu
          </p>
          <h2 className="mt-3 font-display text-4xl font-semibold leading-tight text-foreground sm:text-5xl">
            Semua Alat yang Kamu{" "}
            <span className="italic text-primary">Butuhkan</span> untuk Pulih
          </h2>
          <p className="mt-3 text-sm sm:text-base text-muted-foreground max-w-lg mx-auto">
            Dirancang bersama dokter & psikolog, setiap fitur bekerja secara sinergis dalam satu Protokol Pemulihan Holistik.
          </p>
        </div>

        <div className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f, i) => (
            <div
              key={f.title}
              data-reveal
              style={{ transitionDelay: `${i * 60}ms` }}
              className={`group relative overflow-hidden rounded-3xl bg-card p-7 ring-1 transition-all duration-500 hover:-translate-y-1.5 hover:shadow-float ${
                f.isFree
                  ? "ring-emerald-300 dark:ring-emerald-700 hover:ring-emerald-400"
                  : "ring-border hover:ring-primary-soft"
              }`}
            >
              {/* Hover glow bg */}
              <div
                className={`absolute -right-12 -top-12 h-32 w-32 rounded-full opacity-0 transition-opacity duration-500 group-hover:opacity-100 ${
                  f.tone === "primary" ? "bg-primary-soft" : "bg-accent-soft"
                }`}
              />

              {/* Free badge */}
              {f.isFree && (
                <div className="absolute right-3 top-3 rounded-full bg-emerald-500 px-2 py-0.5 text-[9px] font-black text-white shadow-sm">
                  GRATIS
                </div>
              )}

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

              <h3 className="relative mt-5 font-display text-lg font-semibold text-foreground leading-snug">
                {f.title}
              </h3>
              <p className="relative mt-2 text-sm leading-relaxed text-muted-foreground">
                {f.desc}
              </p>

              {/* Micro-stat */}
              <div className={`relative mt-4 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-bold ${
                f.isFree
                  ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400"
                  : f.tone === "primary"
                  ? "bg-primary-soft text-primary"
                  : "bg-accent-soft text-accent"
              }`}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className="h-3 w-3">
                  <path d="m5 12 4 4 10-10" />
                </svg>
                {f.stat}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom reassurance */}
        <p data-reveal className="mt-10 text-center text-xs text-muted-foreground">
          ✨ Semua fitur bekerja sinergis dalam{" "}
          <a href="#harga" className="font-semibold text-primary hover:underline">
            Program Pemulihan Emosi Holistik
          </a>{" "}
          — termasuk Emergency Calm Mode tanpa batas untuk pengguna berbayar.
        </p>
      </div>
    </section>
  );
}
