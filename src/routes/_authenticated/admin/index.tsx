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
      const [users, premium, pendingOrders, todayChats, todayMoods, totalRev, dbSizeRes] = await Promise.all([
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("profiles").select("id", { count: "exact", head: true }).eq("plan","premium"),
        supabase.from("orders").select("id", { count: "exact", head: true }).eq("payment_status","menunggu_verifikasi"),
        supabase.from("messages").select("id", { count: "exact", head: true }).eq("role","user").gte("created_at", today),
        supabase.from("mood_checkins").select("id", { count: "exact", head: true }).eq("date", today),
        supabase.from("orders").select("amount").eq("payment_status","disetujui"),
        supabase.rpc("get_database_size").then(res => res).catch(() => ({ data: 0, error: null }))
      ]);
      const revenue = (totalRev.data ?? []).reduce((a,b)=>a+(b.amount??0),0);
      const dbSize = dbSizeRes && 'data' in dbSizeRes ? Number(dbSizeRes.data || 0) : 0;
      
      return {
        users: users.count ?? 0,
        premium: premium.count ?? 0,
        pendingOrders: pendingOrders.count ?? 0,
        todayChats: todayChats.count ?? 0,
        todayMoods: todayMoods.count ?? 0,
        revenue,
        dbSize,
      };
    },
  });

  const dbSizeMB = stats?.dbSize ? stats.dbSize / (1024 * 1024) : 0;
  const dbLimitMB = 500;
  const dbPercent = Math.min((dbSizeMB / dbLimitMB) * 100, 100);
  const isStorageWarning = dbPercent >= 80;
  const isStorageCritical = dbPercent >= 95;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl font-semibold">Dashboard</h1>
        {stats?.dbSize ? (
          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
            isStorageCritical ? "bg-red-100 text-red-700" :
            isStorageWarning ? "bg-amber-100 text-amber-700" :
            "bg-emerald-100 text-emerald-700"
          }`}>
            Database: {dbSizeMB.toFixed(1)} MB / {dbLimitMB} MB ({dbPercent.toFixed(1)}%)
          </span>
        ) : null}
      </div>

      {isStorageWarning && (
        <div className={`rounded-2xl border p-4 flex gap-3 text-sm animate-pulse ${
          isStorageCritical 
            ? "bg-red-50 border-red-100 text-red-950" 
            : "bg-amber-50 border-amber-100 text-amber-950"
        }`}>
          <span className="text-xl select-none">⚠️</span>
          <div>
            <p className="font-bold font-display">
              {isStorageCritical ? "KRITIS: Penyimpanan Database Hampir Penuh!" : "PERINGATAN: Penyimpanan Database Menipis!"}
            </p>
            <p className="mt-0.5 leading-relaxed text-xs">
              Kapasitas database Supabase sudah mencapai {dbPercent.toFixed(1)}%. Jika melebihi 100% (500 MB), database akan dialihkan ke mode read-only (tulis dinonaktifkan). Harap infokan pengguna untuk membersihkan data lama.
            </p>
          </div>
        </div>
      )}

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

        {stats?.dbSize ? (
          <div className="rounded-3xl bg-card p-5 ring-1 ring-border col-span-1 sm:col-span-2 lg:col-span-3">
            <div className="flex justify-between items-center mb-2">
              <div>
                <p className="text-xs font-semibold text-muted-foreground">Penggunaan Penyimpanan Supabase</p>
                <p className="text-2xl font-bold font-display mt-1">
                  {dbSizeMB.toFixed(2)} MB <span className="text-xs font-normal text-muted-foreground">dari {dbLimitMB} MB kapasitas gratis</span>
                </p>
              </div>
              <span className="text-xs font-bold text-muted-foreground">{dbPercent.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-cream-deep/60 rounded-full h-3.5 overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${
                  isStorageCritical ? "bg-red-500" :
                  isStorageWarning ? "bg-amber-500" :
                  "bg-[#6E8C71]"
                }`}
                style={{ width: `${dbPercent}%` }}
              />
            </div>
            <p className="mt-2.5 text-[10px] text-muted-foreground leading-normal">
              *Kapasitas penyimpanan Supabase Free Tier dibatasi maksimal 500 MB. Jika penuh, transaksi database baru akan diblokir oleh Supabase.
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
