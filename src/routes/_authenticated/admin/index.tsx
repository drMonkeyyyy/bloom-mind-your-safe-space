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
      const fetchDbSize = async () => {
        try {
          const res = await supabase.rpc("get_database_size" as any);
          return res;
        } catch {
          return { data: 0, error: null };
        }
      };

      const [
        users,
        premium,
        pendingOrders,
        todayChats,
        todayMoods,
        totalRev,
        dbSizeRes,
        todayAssistantMsgs,
        todayEatingLogs,
        todayChatJournals
      ] = await Promise.all([
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("profiles").select("id", { count: "exact", head: true }).eq("plan","premium"),
        supabase.from("orders").select("id", { count: "exact", head: true }).eq("payment_status","menunggu_verifikasi"),
        supabase.from("messages").select("id", { count: "exact", head: true }).eq("role","user").gte("created_at", today),
        supabase.from("mood_checkins").select("id", { count: "exact", head: true }).eq("date", today),
        supabase.from("orders").select("amount").eq("payment_status","disetujui"),
        fetchDbSize(),
        supabase.from("messages").select("id", { count: "exact", head: true }).eq("role","assistant").gte("created_at", today),
        supabase.from("emotional_eating_logs").select("id", { count: "exact", head: true }).gte("created_at", today),
        supabase.from("journals").select("id", { count: "exact", head: true }).eq("source","chat").gte("created_at", today),
      ]);
      const revenue = (totalRev.data ?? []).reduce((a: number, b: any) => a + (b.amount ?? 0), 0);
      const dbSize = dbSizeRes && 'data' in dbSizeRes ? Number(dbSizeRes.data || 0) : 0;
      const geminiCallsToday = (todayAssistantMsgs.count ?? 0) + (todayEatingLogs.count ?? 0) + (todayChatJournals.count ?? 0);
      
      return {
        users: users.count ?? 0,
        premium: premium.count ?? 0,
        pendingOrders: pendingOrders.count ?? 0,
        todayChats: todayChats.count ?? 0,
        todayMoods: todayMoods.count ?? 0,
        revenue,
        dbSize,
        geminiCallsToday,
      };
    },
  });

  const dbSizeMB = stats?.dbSize ? stats.dbSize / (1024 * 1024) : 0;
  const dbLimitMB = 500;
  const dbPercent = Math.min((dbSizeMB / dbLimitMB) * 100, 100);
  const isStorageWarning = dbPercent >= 80;
  const isStorageCritical = dbPercent >= 95;

  const geminiCallsToday = stats?.geminiCallsToday ?? 0;
  const isPaidTier = import.meta.env.VITE_GEMINI_API_TIER === "paid";
  const geminiLimit = Number(import.meta.env.VITE_GEMINI_LIMIT || (isPaidTier ? 1500 : 20));
  const geminiPercent = Math.min((geminiCallsToday / geminiLimit) * 100, 100);
  const isGeminiWarning = geminiPercent >= 80;
  const isGeminiCritical = geminiPercent >= 95;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="font-display text-3xl font-semibold">Dashboard</h1>
        <div className="flex flex-wrap gap-2">
          {stats?.dbSize ? (
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
              isStorageCritical ? "bg-red-100 text-red-700" :
              isStorageWarning ? "bg-amber-100 text-amber-700" :
              "bg-emerald-100 text-emerald-700"
            }`}>
              Database: {dbSizeMB.toFixed(1)} MB / {dbLimitMB} MB ({dbPercent.toFixed(1)}%)
            </span>
          ) : null}
          {stats ? (
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
              isGeminiCritical ? "bg-red-100 text-red-700 animate-pulse" :
              isGeminiWarning ? "bg-amber-100 text-amber-700 animate-pulse" :
              "bg-indigo-100 text-indigo-700"
            }`}>
              Gemini API: {geminiCallsToday} / {geminiLimit} RPD ({geminiPercent.toFixed(1)}%)
            </span>
          ) : null}
        </div>
      </div>

      <div className="space-y-3">
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

        {isGeminiWarning && (
          <div className={`rounded-2xl border p-4 flex gap-3 text-sm animate-pulse ${
            isGeminiCritical 
              ? "bg-red-50 border-red-100 text-red-950" 
              : "bg-amber-50 border-amber-100 text-amber-950"
          }`}>
            <span className="text-xl select-none">⚠️</span>
            <div>
              <p className="font-bold font-display">
                {isGeminiCritical ? "KRITIS: Kuota Harian Gemini Hampir Habis!" : "PERINGATAN: Kuota Harian Gemini Menipis!"}
              </p>
              <p className="mt-0.5 leading-relaxed text-xs">
                Penggunaan API Gemini hari ini sudah mencapai {geminiPercent.toFixed(1)}%. Jika melebihi 100% ({geminiLimit} permintaan), semua fitur bertenaga AI (chat, refleksi, insight) tidak akan dapat merespons hingga kuota harian di-reset oleh Google (biasanya setiap 24 jam).
              </p>
            </div>
          </div>
        )}
      </div>

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

        {stats ? (
          <div className="rounded-3xl bg-card p-5 ring-1 ring-border col-span-1 sm:col-span-2 lg:col-span-3">
            <div className="flex justify-between items-center mb-2">
              <div>
                <p className="text-xs font-semibold text-muted-foreground">
                  Penggunaan API Gemini {isPaidTier ? "(Paid / Billing Active)" : "(Unpaid Free Tier)"}
                </p>
                <p className="text-2xl font-bold font-display mt-1">
                  {geminiCallsToday.toLocaleString("id-ID")}{" "}
                  <span className="text-xs font-normal text-muted-foreground">
                    dari {geminiLimit.toLocaleString("id-ID")} permintaan per hari
                  </span>
                </p>
              </div>
              <span className="text-xs font-bold text-muted-foreground">{geminiPercent.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-cream-deep/60 rounded-full h-3.5 overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${
                  isGeminiCritical ? "bg-red-500" :
                  isGeminiWarning ? "bg-amber-500" :
                  "bg-gradient-to-r from-blue-400 to-indigo-600"
                }`}
                style={{ width: `${geminiPercent}%` }}
              />
            </div>
            <p className="mt-2.5 text-[10px] text-muted-foreground leading-normal">
              {isPaidTier ? (
                <span>*Kunci API Anda terdeteksi menggunakan <strong>Paid Tier (Billing Aktif)</strong> dengan batas aman {geminiLimit.toLocaleString("id-ID")} permintaan per hari (RPD). Anda tidak perlu khawatir dengan kuota gratis harian.</span>
              ) : (
                <span>*Batas gratis Gemini 2.5 Flash tanpa billing adalah 20 permintaan per hari (RPD). Jika melampaui batas ini, API akan mengembalikan error kuota (RESOURCE_EXHAUSTED). Aktifkan billing di Google AI Studio untuk kapasitas hingga 1.500 RPD gratis atau bayar per token tanpa batas.</span>
              )}
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
