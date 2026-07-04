import { PhoneChatMockup } from "./mockups/PhoneChatMockup";
import { FloatingBlob } from "./decor/FloatingBlob";

const badges = [
  { icon: "🔒", label: "Aman & Privat" },
  { icon: "🌐", label: "Bahasa Indonesia" },
  { icon: "⚡", label: "Ruang Curhat 24 Jam" },
  { icon: "🆓", label: "Gratis Dicoba" },
];

export function Hero() {
  return (
    <section className="relative overflow-hidden pt-28 pb-20 sm:pt-36 sm:pb-28">
      <div className="absolute inset-0 -z-10" style={{ background: "var(--gradient-hero)" }} />
      <FloatingBlob className="-top-20 -left-20" color="primary" size={420} />
      <FloatingBlob className="top-40 -right-24" color="accent" size={360} delay={2} slow />
      <FloatingBlob className="bottom-0 left-1/3" color="primary" size={260} delay={4} />

      <div className="relative mx-auto grid max-w-7xl items-center gap-14 px-5 sm:px-8 lg:grid-cols-2 lg:gap-10">
        <div data-reveal>
          {/* Social proof pill */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-card/80 px-4 py-2 ring-1 ring-primary-soft backdrop-blur-sm">
            <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse" />
            <span className="text-xs font-semibold text-primary">Ruang aman untuk hati yang lelah</span>
          </div>

          {/* Headline */}
          <h1 className="font-display text-[2.6rem] font-semibold leading-[1.08] tracking-tight text-foreground sm:text-6xl lg:text-[4.2rem]">
            Tempat Aman untuk{" "}
            <span className="relative inline-block">
              <span className="relative z-10 italic text-primary">Curhat</span>
              <span className="absolute inset-x-0 bottom-1 -z-0 h-3 rounded-full bg-accent-soft" />
            </span>
            , Bertumbuh, dan Memahami Diri.
          </h1>

          <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
            JN-CALM adalah ruang aman interaktif yang membantu kamu menghadapi overthinking, stres, burnout, emotional eating, dan berbagai tantangan hidup — tanpa rasa takut dihakimi.
          </p>

          {/* CTA buttons */}
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <a
              href="/auth?mode=register"
              className="group inline-flex items-center gap-2 rounded-full bg-accent px-7 py-3.5 text-sm font-semibold text-accent-foreground shadow-peach transition-all duration-300 hover:-translate-y-0.5 hover:shadow-float"
            >
              Mulai Gratis Sekarang
              <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true">
                <path d="M5 12h14m-5-5 5 5-5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
            <a
              href="#cara-kerja"
              className="inline-flex items-center gap-2 rounded-full bg-card px-7 py-3.5 text-sm font-semibold text-foreground ring-1 ring-border transition-all duration-300 hover:bg-cream-deep"
            >
              <span className="grid h-5 w-5 place-items-center rounded-full bg-primary-soft text-primary">
                <svg viewBox="0 0 24 24" fill="currentColor" className="h-3 w-3" aria-hidden="true">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </span>
              Lihat Cara Kerja
            </a>
          </div>

          {/* Trust badges */}
          <ul className="mt-8 flex flex-wrap gap-x-5 gap-y-3" aria-label="Keunggulan JN-CALM">
            {badges.map((b) => (
              <li key={b.label} className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="grid h-6 w-6 place-items-center rounded-full bg-primary text-primary-foreground text-xs" aria-hidden="true">
                  {b.icon}
                </span>
                {b.label}
              </li>
            ))}
          </ul>
        </div>

        <div data-reveal className="relative">
          <PhoneChatMockup />
        </div>
      </div>
    </section>
  );
}
