import { useEffect, useState } from "react";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close menu on resize to desktop
  useEffect(() => {
    const handler = () => { if (window.innerWidth >= 768) setMenuOpen(false); };
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  const links = [
    { href: "#fitur", label: "Fitur" },
    { href: "#cara-kerja", label: "Cara Kerja" },
    { href: "#harga", label: "Harga" },
  ];

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
          scrolled
            ? "bg-cream/90 backdrop-blur-xl shadow-[0_1px_0_0_var(--color-border)]"
            : "bg-transparent"
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8">
          {/* Logo */}
          <a href="/" className="flex items-center gap-2.5" aria-label="Bloom Mind — Beranda">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-primary to-accent shadow-soft">
              <svg viewBox="0 0 24 24" fill="white" className="h-5 w-5" aria-hidden="true">
                <path d="M12 2C8 2 5 5 5 9c0 2.5 1.2 4.7 3 6.1V17a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-1.9c1.8-1.4 3-3.6 3-6.1 0-4-3-7-7-7z" opacity=".9" />
              </svg>
            </div>
            <div className="hidden sm:block">
              <p className="font-display text-lg font-semibold leading-tight text-foreground">Bloom Mind</p>
            </div>
          </a>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-8 md:flex" aria-label="Navigasi utama">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="group relative text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                {l.label}
                <span className="absolute -bottom-0.5 left-0 h-px w-0 bg-primary transition-all duration-300 group-hover:w-full" />
              </a>
            ))}
          </nav>

          {/* Desktop actions */}
          <div className="hidden items-center gap-3 md:flex">
            <a href="/auth?mode=login" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
              Masuk
            </a>
            <a
              href="/auth?mode=register"
              className="inline-flex items-center gap-1.5 rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground shadow-peach transition-all duration-300 hover:-translate-y-0.5 hover:shadow-float"
            >
              Mulai Gratis
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="h-3.5 w-3.5" aria-hidden="true">
                <path d="M5 12h14m-5-5 5 5-5 5" />
              </svg>
            </a>
          </div>

          {/* Mobile hamburger */}
          <button
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-card/80 md:hidden"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label={menuOpen ? "Tutup menu" : "Buka menu"}
            aria-expanded={menuOpen}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" className="h-4 w-4" aria-hidden="true">
              {menuOpen ? <path d="M18 6 6 18M6 6l12 12" /> : <path d="M3 12h18M3 6h18M3 18h18" />}
            </svg>
          </button>
        </div>
      </header>

      {/* Mobile menu */}
      {menuOpen && (
        <div
          className="fixed inset-x-0 top-[65px] z-40 border-b border-border bg-card/95 backdrop-blur-xl md:hidden"
          style={{ animation: "slide-up 0.3s cubic-bezier(0.16, 1, 0.3, 1) both" }}
        >
          <div className="mx-auto max-w-7xl px-5 py-5 space-y-1">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setMenuOpen(false)}
                className="block rounded-2xl px-4 py-3 text-sm font-medium text-foreground hover:bg-cream-deep"
              >
                {l.label}
              </a>
            ))}
            <div className="mt-3 border-t border-border pt-3 flex flex-col gap-2">
              <a href="/auth?mode=login" className="rounded-full border border-border py-3 text-center text-sm font-medium text-foreground">
                Masuk
              </a>
              <a href="/auth?mode=register" className="rounded-full bg-accent py-3 text-center text-sm font-semibold text-accent-foreground shadow-peach">
                Mulai Gratis
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
