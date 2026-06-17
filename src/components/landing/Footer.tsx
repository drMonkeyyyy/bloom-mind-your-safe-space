import { Logo } from "./Logo";

const menu = [
  { label: "Fitur", href: "#fitur" },
  { label: "Harga", href: "#harga" },
  { label: "Tentang Kami", href: "#" },
  { label: "Kebijakan Privasi", href: "#" },
];

export function Footer() {
  return (
    <footer className="border-t border-border bg-cream-deep/40 py-14">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr]">
          <div>
            <Logo />
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground">
              Pendamping AI untuk hati yang lelah. Bloom Mind hadir agar kamu
              tidak pernah merasa sendirian.
            </p>
            <p className="mt-4 font-display text-base italic text-primary">
              Your Safe Place to Grow.
            </p>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-foreground">
              Menu
            </p>
            <ul className="mt-4 space-y-2.5">
              {menu.map((m) => (
                <li key={m.label}>
                  <a
                    href={m.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {m.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-foreground">
              Hubungi
            </p>
            <p className="mt-4 text-sm text-muted-foreground">halo@bloommind.id</p>
            <div className="mt-4 flex gap-2">
              {["IG", "TT", "X"].map((s) => (
                <span
                  key={s}
                  className="grid h-9 w-9 place-items-center rounded-full bg-card text-xs font-semibold text-foreground ring-1 ring-border"
                >
                  {s}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-border pt-6 sm:flex-row">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Bloom Mind. Dibuat dengan 🤍 di Indonesia.
          </p>
          <p className="text-xs text-muted-foreground">
            Bloom Mind bukan pengganti bantuan profesional kesehatan mental.
          </p>
        </div>
      </div>
    </footer>
  );
}
