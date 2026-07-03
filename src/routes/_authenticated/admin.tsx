import { createFileRoute, Outlet, Link, useRouterState, useNavigate, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/admin")({
  ssr: false,
  beforeLoad: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw redirect({ to: "/auth" });
    const { data } = await supabase.from("user_roles").select("role").eq("user_id", user.id).eq("role","admin").maybeSingle();
    if (!data) throw redirect({ to: "/app" });
    return { user };
  },
  component: AdminLayout,
});

const nav = [
  { to: "/admin", label: "Dashboard", icon: "📊" },
  { to: "/admin/users", label: "User", icon: "👥" },
  { to: "/admin/transactions", label: "Transaksi", icon: "💳" },
  { to: "/admin/analytics", label: "Analytics", icon: "📈" },
  { to: "/admin/settings", label: "Settings", icon: "⚙️" },
];

function AdminLayout() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-background">
      <aside className="fixed inset-y-0 left-0 hidden w-60 flex-col border-r border-border bg-card lg:flex">
        <div className="px-6 py-5">
          <p className="font-display text-lg font-semibold">JN-CALM</p>
          <p className="text-xs text-muted-foreground">Admin Panel</p>
        </div>
        <nav className="flex-1 space-y-1 px-3">
          {nav.map((n)=>(
            <Link key={n.to} to={n.to} className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm ${path===n.to?"bg-primary-soft font-semibold":"text-muted-foreground"}`}>
              <span>{n.icon}</span>{n.label}
            </Link>
          ))}
          <button onClick={()=>navigate({ to:"/app" })} className="mt-3 w-full rounded-xl border border-border px-3 py-2 text-left text-xs">← Kembali ke app</button>
        </nav>
      </aside>
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-card px-5 py-3 lg:hidden">
        <p className="font-display text-base">Admin · JN-CALM</p>
        <Link to="/app" className="text-xs">← App</Link>
      </header>
      <main className="lg:pl-60 pb-20"><div className="mx-auto max-w-5xl px-5 py-6"><Outlet /></div></main>
      <nav className="fixed bottom-0 inset-x-0 z-10 border-t border-border bg-card lg:hidden">
        <div className="grid grid-cols-5">
          {nav.map((n)=>(
            <Link key={n.to} to={n.to} className={`flex flex-col items-center py-2 text-[10px] ${path===n.to?"text-primary font-semibold":"text-muted-foreground"}`}>
              <span className="text-lg">{n.icon}</span>{n.label}
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}
