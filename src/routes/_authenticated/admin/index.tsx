import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/admin/")({
  component: AdminDashboard,
});

function AdminDashboard() {
  const today = new Date().toISOString().slice(0, 10);

  const { data: stats } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const [users, premium, pendingOrders, todayChats, todayMoods, totalRev] = await Promise.all([
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("profiles").select("id", { count: "exact", head: true }).eq("plan","premium"),
        supabase.from("orders").select("id", { count: "exact", head: true }).eq("payment_status","menunggu_verifikasi"),
        supabase.from("messages").select("id", { count: "exact", head: true }).eq("role","user").gte("created_at", today),
        supabase.from("mood_checkins").select("id", { count: "exact", head: true }).eq("date", today),
        supabase.from("orders").select("amount").eq("payment_status","disetujui"),
      ]);
      const revenue = (totalRev.data ?? []).reduce((a,b)=>a+(b.amount??0),0);
      return {
        users: users.count ?? 0,
        premium: premium.count ?? 0,
        pendingOrders: pendingOrders.count ?? 0,
        todayChats: todayChats.count ?? 0,
        todayMoods: todayMoods.count ?? 0,
        revenue,
      };
    },
  });

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl font-semibold">Dashboard</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[
          ["Total User", stats?.users ?? "—"],
          ["Premium", stats?.premium ?? "—"],
          ["Free", (stats ? stats.users - stats.premium : "—")],
          ["Menunggu Verifikasi", stats?.pendingOrders ?? "—"],
          ["Chat Hari Ini", stats?.todayChats ?? "—"],
          ["Mood Check-in Hari Ini", stats?.todayMoods ?? "—"],
          ["Total Pendapatan", `Rp${(stats?.revenue ?? 0).toLocaleString("id-ID")}`],
        ].map(([l,v])=>(
          <div key={String(l)} className="rounded-3xl bg-card p-5 ring-1 ring-border">
            <p className="text-xs text-muted-foreground">{l}</p>
            <p className="mt-2 font-display text-3xl font-semibold">{v}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
