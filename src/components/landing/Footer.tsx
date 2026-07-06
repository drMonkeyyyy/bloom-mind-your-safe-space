import { Link } from "@tanstack/react-router";

const menu = [
  { label: "Fitur", href: "#fitur" },
  { label: "Cara Kerja", href: "#cara-kerja" },
  { label: "Harga", href: "#harga" },
];

const legal = [
  { label: "Kebijakan Privasi", to: "/privacy" },
  { label: "Syarat Layanan", to: "/terms" },
  { label: "Hubungi Kami", href: "mailto:noreply@jncalm.my.id" },
];

export function Footer() {
  return (
    <footer className="border-t border-border bg-cream-deep/30 py-16">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr]">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2.5">
              <div className="h-10 w-10 overflow-hidden rounded-xl bg-white shadow-soft flex items-center justify-center border border-border/50">
                <img src="/logo.png" alt="JN-CALM Logo" className="h-full w-full object-cover" />
              </div>
              <div>
                <p className="font-display text-xl font-bold tracking-widest leading-tight text-[#6E8C71]">JN-CALM</p>
                <p className="text-[10px] text-muted-foreground">Your Safe Place to Grow</p>
              </div>
            </div>
            <p className="mt-5 max-w-xs text-sm leading-relaxed text-muted-foreground">
              Pendamping AI untuk hati yang lelah. JN-CALM hadir agar kamu tidak pernah merasa sendirian dalam perjalananmu.
            </p>
            <p className="mt-4 font-display text-base italic text-primary">Your Safe Place to Grow. 🌿</p>
          </div>

          {/* Menu */}
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.15em] text-foreground">Aplikasi</p>
            <ul className="mt-4 space-y-2.5">
              {menu.map((m) => (
                <li key={m.label}>
                  <a href={m.href} className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                    {m.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.15em] text-foreground">Legal</p>
            <ul className="mt-4 space-y-2.5">
              {legal.map((m) => (
                <li key={m.label}>
                  {m.to ? (
                    <Link to={m.to} className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                      {m.label}
                    </Link>
                  ) : (
                    <a href={m.href} className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                      {m.label}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Help line */}
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.15em] text-foreground">Butuh Bantuan?</p>
            <p className="mt-4 text-sm text-stone-700">
              Silakan hubungi kami melalui:
            </p>
            <p className="mt-2 text-xs font-semibold text-muted-foreground">noreply@jncalm.my.id</p>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-border pt-6 text-xs text-muted-foreground sm:flex-row">
          <p>© {new Date().getFullYear()} JN-CALM. Dibuat dengan 🤍 di Indonesia.</p>
          <p className="max-w-sm text-center sm:text-right">
            JN-CALM hadir sebagai media refleksi diri dan bukan merupakan layanan medis profesional kesehatan mental. Jika dalam kondisi krisis/darurat, hubungi profesional kesehatan terdekat.
          </p>
        </div>
      </div>
    </footer>
  );
}
