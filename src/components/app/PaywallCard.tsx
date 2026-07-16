import { Link } from "@tanstack/react-router";

export function PaywallCard({ title = "Fitur Premium", desc }: { title?: string; desc?: string }) {
  return (
    <div className="rounded-3xl bg-gradient-to-br from-accent/15 to-primary/15 p-6 ring-1 ring-accent/30 text-center">
      <p className="text-2xl">✨</p>
      <h3 className="mt-2 font-display text-xl font-semibold">{title}</h3>
      <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
        {desc ?? "Upgrade ke Premium untuk membuka fitur ini dan tumbuh lebih dalam."}
      </p>
      <Link to="/app/premium" className="mt-4 inline-flex rounded-full bg-accent px-6 py-2.5 text-sm font-semibold text-accent-foreground shadow-peach">
        Upgrade ke Premium · Mulai Rp15.000
      </Link>
    </div>
  );
}
