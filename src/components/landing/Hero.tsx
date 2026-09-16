import { PhoneChatMockup } from "./mockups/PhoneChatMockup";
import { FloatingBlob } from "./decor/FloatingBlob";
import { useEffect, useRef, useState } from "react";

const badges = [
  { icon: "🩺", label: "Dirancang Dokter & Psikolog" },
  { icon: "🔒", label: "100% Privat & Terenkripsi" },
  { icon: "⚡", label: "Ruang Curhat 24 Jam" },
  { icon: "🆓", label: "Mulai Gratis, Tanpa Kartu Kredit" },
];

// Animated counter hook
function useCounter(target: number, duration = 1800) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const start = Date.now();
          const step = () => {
            const elapsed = Date.now() - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.round(eased * target));
            if (progress < 1) requestAnimationFrame(step);
          };
          requestAnimationFrame(step);
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target, duration]);

  return { count, ref };
}

function SocialProofBar() {
  const { count: users, ref } = useCounter(1247);
  const { count: sessions } = useCounter(4820);
  const { count: relief } = useCounter(91);

  return (
    <div ref={ref} className="mt-8 sm:mt-10 flex flex-wrap items-center gap-x-6 gap-y-3">
      <div className="flex items-center gap-2">
        <div className="flex -space-x-2">
          {["🌸", "🌿", "☁️", "🦋"].map((a, i) => (
            <div
              key={i}
              className="h-8 w-8 rounded-full bg-primary-soft ring-2 ring-card grid place-items-center text-sm"
            >
              {a}
            </div>
          ))}
        </div>
        <div>
          <p className="text-sm font-bold text-foreground">{users.toLocaleString("id-ID")}+</p>
          <p className="text-[10px] text-muted-foreground leading-tight">pengguna aktif</p>
        </div>
      </div>

      <div className="h-8 w-px bg-border hidden sm:block" />

      <div className="text-center sm:text-left">
        <p className="text-sm font-bold text-foreground">{sessions.toLocaleString("id-ID")}+</p>
        <p className="text-[10px] text-muted-foreground leading-tight">sesi curhat bulan ini</p>
      </div>

      <div className="h-8 w-px bg-border hidden sm:block" />

      <div className="text-center sm:text-left">
        <p className="text-sm font-bold text-primary">{relief}%</p>
        <p className="text-[10px] text-muted-foreground leading-tight">rasa lebih lega setelah curhat*</p>
      </div>
    </div>
  );
}

export function Hero() {
  return (
    <section className="relative overflow-hidden pt-20 pb-12 sm:pt-36 sm:pb-28">
      <div className="absolute inset-0 -z-10" style={{ background: "var(--gradient-hero)" }} />
      <FloatingBlob className="-top-20 -left-20" color="primary" size={420} />
      <FloatingBlob className="top-40 -right-24" color="accent" size={360} delay={2} slow />
      <FloatingBlob className="bottom-0 left-1/3" color="primary" size={260} delay={4} />

      <div className="relative mx-auto grid max-w-7xl items-center gap-14 px-5 sm:px-8 lg:grid-cols-2 lg:gap-10">
        <div data-reveal>
          {/* Urgency / social proof pill */}
          <div className="mb-4 sm:mb-6 inline-flex items-center gap-2 rounded-full bg-card/80 px-3.5 py-1.5 sm:px-4 sm:py-2 ring-1 ring-primary-soft backdrop-blur-sm">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] sm:text-xs font-semibold text-foreground">
              <strong className="text-primary">1.200+ orang</strong> sudah menemukan ketenangan mereka
            </span>
          </div>

          {/* Headline — pain-point driven */}
          <h1 className="font-display text-3xl sm:text-6xl lg:text-[4.2rem] font-semibold leading-[1.15] sm:leading-[1.08] tracking-tight text-foreground">
            Berhenti Menanggung{" "}
            <span className="relative inline-block">
              <span className="relative z-10 italic text-primary">Sendirian.</span>
              <span className="absolute inset-x-0 bottom-1 -z-0 h-2 sm:h-3 rounded-full bg-accent-soft" />
            </span>
          </h1>

          <p className="mt-4 sm:mt-5 max-w-xl text-sm sm:text-lg leading-relaxed text-muted-foreground">
            JN-CALM adalah ruang aman interaktif{" "}
            <strong className="text-foreground font-semibold">yang dirancang oleh Dokter & Psikolog</strong> untuk
            membantu kamu menghadapi overthinking, kecemasan, burnout, dan emotional eating — dengan 10+ alat terapi
            berbasis psikologi klinis, kapan saja.
          </p>

          {/* CTA buttons */}
          <div className="mt-6 sm:mt-8 flex flex-wrap items-center gap-3">
            <a
              href="/auth?mode=register"
              className="group inline-flex items-center gap-2 rounded-full bg-accent px-5 py-3 sm:px-7 sm:py-3.5 text-xs sm:text-sm font-semibold text-accent-foreground shadow-peach transition-all duration-300 hover:-translate-y-0.5 hover:shadow-float"
            >
              Mulai Gratis Sekarang
              <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true">
                <path d="M5 12h14m-5-5 5 5-5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
            <a
              href="#harga"
              className="inline-flex items-center gap-2 rounded-full bg-card px-5 py-3 sm:px-7 sm:py-3.5 text-xs sm:text-sm font-semibold text-foreground ring-1 ring-border transition-all duration-300 hover:bg-cream-deep"
            >
              <span className="grid h-5 w-5 place-items-center rounded-full bg-amber-100 text-amber-600">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="h-3 w-3" aria-hidden="true">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="currentColor" />
                </svg>
              </span>
              Lihat Program Pemulihan
            </a>
          </div>

          {/* Animated social proof */}
          <SocialProofBar />

          {/* Trust badges */}
          <ul className="mt-6 flex flex-wrap gap-x-5 gap-y-3" aria-label="Keunggulan JN-CALM">
            {badges.map((b) => (
              <li key={b.label} className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="grid h-6 w-6 place-items-center rounded-full bg-primary text-primary-foreground text-xs" aria-hidden="true">
                  {b.icon}
                </span>
                {b.label}
              </li>
            ))}
          </ul>

          {/* Micro reassurance */}
          <p className="mt-4 text-[11px] text-muted-foreground/70">
            * Berdasarkan survei internal 847 pengguna aktif. Tidak perlu kartu kredit untuk mulai.
          </p>
        </div>

        <div data-reveal className="relative">
          <PhoneChatMockup />
        </div>
      </div>
    </section>
  );
}
