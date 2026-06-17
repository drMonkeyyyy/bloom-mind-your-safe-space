import { PhoneChatMockup } from "./mockups/PhoneChatMockup";
import { FloatingBlob } from "./decor/FloatingBlob";

const badges = ["Aman & Privat", "Bahasa Indonesia", "Pendamping 24 Jam"];

export function Hero() {
  return (
    <section className="relative overflow-hidden pt-32 pb-20 sm:pt-40 sm:pb-28">
      <div
        className="absolute inset-0 -z-10"
        style={{ background: "var(--gradient-hero)" }}
      />
      <FloatingBlob className="-top-20 -left-20" color="primary" size={420} />
      <FloatingBlob className="top-40 -right-24" color="accent" size={360} delay={2} slow />
      <FloatingBlob className="bottom-0 left-1/3" color="primary" size={260} delay={4} />

      <div className="relative mx-auto grid max-w-7xl items-center gap-14 px-5 sm:px-8 lg:grid-cols-2 lg:gap-10">
        <div data-reveal>
          <span className="inline-flex items-center gap-2 rounded-full bg-card/70 px-4 py-1.5 text-xs font-medium text-primary ring-1 ring-primary-soft backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            Pendamping AI untuk hati yang lelah
          </span>
          <h1 className="mt-6 font-display text-[2.6rem] font-semibold leading-[1.08] tracking-tight text-foreground sm:text-6xl lg:text-[4.2rem]">
            Tempat Aman untuk{" "}
            <span className="relative inline-block">
              <span className="relative z-10 italic text-primary">Curhat</span>
              <span className="absolute inset-x-0 bottom-1 -z-0 h-3 rounded-full bg-accent-soft" />
            </span>
            , Bertumbuh, dan Memahami Diri.
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
            Bloom Mind adalah pendamping AI yang membantu kamu menghadapi
            overthinking, stres, burnout, emotional eating, dan berbagai
            tantangan hidup sehari-hari — tanpa rasa takut dihakimi.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <a
              href="#harga"
              className="group inline-flex items-center gap-2 rounded-full bg-accent px-7 py-3.5 text-sm font-semibold text-accent-foreground shadow-peach transition-all duration-300 hover:-translate-y-0.5 hover:shadow-float"
            >
              Mulai Gratis
              <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 transition-transform group-hover:translate-x-0.5">
                <path d="M5 12h14m-5-5 5 5-5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
            <a
              href="#cara-kerja"
              className="inline-flex items-center gap-2 rounded-full bg-card px-7 py-3.5 text-sm font-semibold text-foreground ring-1 ring-border transition-all duration-300 hover:bg-cream-deep"
            >
              <span className="grid h-5 w-5 place-items-center rounded-full bg-primary-soft text-primary">
                ▶
              </span>
              Lihat Cara Kerja
            </a>
          </div>

          <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-3">
            {badges.map((b) => (
              <li key={b} className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="grid h-5 w-5 place-items-center rounded-full bg-primary text-primary-foreground">
                  <svg viewBox="0 0 24 24" fill="none" className="h-3 w-3">
                    <path d="m5 12 4 4 10-10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                {b}
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
