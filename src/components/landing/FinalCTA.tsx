import { FloatingBlob } from "./decor/FloatingBlob";

export function FinalCTA() {
  return (
    <section className="relative overflow-hidden py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-primary via-primary to-primary/80 px-6 py-20 text-center sm:px-12 sm:py-28">
          <FloatingBlob className="-top-24 -left-24" color="accent" size={380} />
          <FloatingBlob className="-bottom-24 -right-24" color="cream" size={360} slow delay={2} />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.18),_transparent_55%)]" />

          <div data-reveal className="relative mx-auto max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-full bg-cream/15 px-4 py-1.5 text-xs font-medium text-primary-foreground ring-1 ring-cream/25 backdrop-blur">
              🌿 Your Safe Place to Grow
            </span>
            <h2 className="mt-6 font-display text-4xl font-semibold leading-[1.1] text-primary-foreground sm:text-6xl">
              Tidak Semua Masalah Harus{" "}
              <span className="italic">Kamu Hadapi Sendiri.</span>
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-primary-foreground/85">
              Bloom Mind siap menemanimu memahami diri, menghadapi tantangan
              hidup, dan bertumbuh sedikit demi sedikit setiap hari.
            </p>
            <a
              href="#harga"
              className="mt-10 inline-flex items-center gap-2 rounded-full bg-accent px-9 py-4 text-base font-semibold text-accent-foreground shadow-peach transition-all duration-300 hover:-translate-y-0.5 hover:shadow-float"
            >
              Mulai Gratis Hari Ini
              <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
                <path d="M5 12h14m-5-5 5 5-5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
