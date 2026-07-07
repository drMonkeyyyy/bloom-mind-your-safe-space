import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useServerFn } from "@tanstack/react-start";
import { promoteToAdmin, demoteFromAdmin, suspendUser, setUserPlan } from "@/lib/admin.functions";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/users")({
  component: Page,
});

function Page() {
  const { user: currentUser } = useAuth();
  const qc = useQueryClient();
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<"all" | "free" | "premium">("all");
  const promote = useServerFn(promoteToAdmin);
  const demote = useServerFn(demoteFromAdmin);
  const suspend = useServerFn(suspendUser);
  const setPlan = useServerFn(setUserPlan);

  const { data: users } = useQuery({
    queryKey: ["admin-users", q, filter],
    queryFn: async () => {
      let qb = supabase.from("profiles").select("*").order("created_at", { ascending: false }).limit(200);
      if (filter !== "all") qb = qb.eq("plan", filter);
      if (q) qb = qb.or(`email.ilike.%${q}%,name.ilike.%${q}%`);

      const fetchStats = async () => {
        try {
          const res = await supabase.from("user_message_stats" as any).select("*");
          return res;
        } catch {
          return { data: [] };
        }
      };

      const fetchAdmins = async () => {
        try {
          const res = await supabase.from("user_roles").select("user_id").eq("role", "admin");
          return res;
        } catch {
          return { data: [] };
        }
      };

      const [profilesRes, statsRes, adminsRes] = await Promise.all([qb, fetchStats(), fetchAdmins()]);

      const profiles = profilesRes.data ?? [];
      const statsMap = new Map((statsRes.data ?? []).map((s: any) => [s.user_id, s.total_replies]));
      const adminSet = new Set((adminsRes.data ?? []).map((a: any) => a.user_id));

      return profiles.map((p: any) => ({
        ...p,
        total_replies: statsMap.get(p.id) ?? 0,
        is_admin: adminSet.has(p.id),
      }));
    },
  });

  const [promoteEmail, setPromoteEmail] = useState("");
  const doPromote = async () => {
    try {
      await promote({ data: { email: promoteEmail } });
      toast.success("✅ Berhasil dipromosikan ke admin.");
      setPromoteEmail("");
      qc.invalidateQueries({ queryKey: ["admin-users"] });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Gagal");
    }
  };

  const doDemote = async (userId: string, name: string) => {
    if (!confirm(`Yakin ingin mencabut peran admin dari "${name}"? Mereka akan kembali menjadi member biasa.`)) return;
    try {
      await demote({ data: { userId } });
      toast.success(`✅ Peran admin "${name}" berhasil dicabut.`);
      qc.invalidateQueries({ queryKey: ["admin-users"] });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Gagal mencabut admin");
    }
  };

  return (
    <div className="space-y-5">
      <h1 className="font-display text-3xl font-semibold">User Management</h1>

      {/* Promote to admin section */}
      <section className="rounded-3xl bg-card p-4 ring-1 ring-border space-y-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Promosikan ke Admin</p>
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            value={promoteEmail}
            onChange={(e) => setPromoteEmail(e.target.value)}
            placeholder="Email user untuk dijadikan admin"
            className="flex-1 rounded-2xl border border-border bg-background px-3 py-2 text-sm"
          />
          <button
            onClick={doPromote}
            className="rounded-full bg-foreground px-4 py-2 text-sm font-semibold text-cream hover:opacity-80 transition-opacity"
          >
            Promote ke admin
          </button>
        </div>
        <p className="text-xs text-muted-foreground">
          ⚠️ Admin memiliki akses penuh ke panel ini. Gunakan dengan hati-hati.
        </p>
      </section>

      {/* Search & Filter */}
      <div className="flex flex-wrap gap-2">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Cari nama/email"
          className="flex-1 rounded-2xl border border-border bg-card px-3 py-2 text-sm"
        />
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as "all" | "free" | "premium")}
          className="rounded-2xl border border-border bg-card px-3 py-2 text-sm"
        >
          <option value="all">Semua</option>
          <option value="free">Free</option>
          <option value="premium">Premium</option>
        </select>
      </div>

      {/* User list */}
      <div className="space-y-2">
        {users?.map((u: any) => (
          <div key={u.id} className="rounded-2xl bg-card p-4 ring-1 ring-border">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="truncate text-sm font-semibold">
                    {u.name ?? "(tanpa nama)"}
                  </p>
                  {u.suspended && (
                    <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-600">SUSPENDED</span>
                  )}
                  {u.is_admin && (
                    <span className="rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-bold text-violet-700">👑 ADMIN</span>
                  )}
                </div>
                <p className="truncate text-xs text-muted-foreground">{u.email}</p>
              </div>
              <span className={`rounded-full px-3 py-1 text-xs capitalize font-semibold ${u.plan === "premium" ? "bg-accent-soft text-accent-foreground" : "bg-cream-deep text-muted-foreground"}`}>
                {u.plan === "premium" ? "Prem Lim" : "Free"}
              </span>
            </div>

            {/* AI usage details */}
            <div className="mt-2.5 pt-2.5 border-t border-border/40 flex flex-wrap items-center gap-x-6 gap-y-1.5 text-xs text-muted-foreground">
              <span>💬 <strong>{u.total_replies || 0}</strong> chat AI</span>
              <span>🪙 Est. <strong>{(u.total_replies * 1650).toLocaleString("id-ID")}</strong> token</span>
              <span className="text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-md">
                Est. Biaya: Rp {(u.total_replies * 2.57).toLocaleString("id-ID", { maximumFractionDigits: 1 })}
              </span>
            </div>

            {/* Action buttons */}
            <div className="mt-3.5 flex flex-wrap gap-2 pt-2 border-t border-border/10">
              {/* Plan toggle */}
              <button
                onClick={async () => {
                  await setPlan({ data: { userId: u.id, plan: u.plan === "premium" ? "free" : "premium", days: 30 } });
                  toast.success("Plan diperbarui");
                  qc.invalidateQueries({ queryKey: ["admin-users"] });
                  qc.invalidateQueries({ queryKey: ["profile", u.id] });
                }}
                className="rounded-full border border-border px-3 py-1 text-xs hover:bg-cream-deep transition-colors"
              >
                {u.plan === "premium" ? "Set Free" : "Set Premium 30 hari"}
              </button>

              {/* Suspend / Aktifkan */}
              <button
                onClick={async () => {
                  await suspend({ data: { userId: u.id, suspended: !u.suspended } });
                  qc.invalidateQueries({ queryKey: ["admin-users"] });
                }}
                className="rounded-full border border-border px-3 py-1 text-xs hover:bg-cream-deep transition-colors"
              >
                {u.suspended ? "Aktifkan" : "Suspend"}
              </button>

              {/* Demote admin — only show for admins, and hide for self */}
              {u.is_admin && u.id !== currentUser?.id && (
                <button
                  onClick={() => doDemote(u.id, u.name ?? u.email)}
                  className="rounded-full border border-violet-300 bg-violet-50 px-3 py-1 text-xs text-violet-700 hover:bg-violet-100 transition-colors font-semibold"
                >
                  👑 Copot Admin
                </button>
              )}
              {u.is_admin && u.id === currentUser?.id && (
                <span className="rounded-full border border-violet-200 px-3 py-1 text-xs text-violet-400 cursor-not-allowed" title="Tidak bisa mencopot diri sendiri">
                  👑 Admin (Saya)
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
