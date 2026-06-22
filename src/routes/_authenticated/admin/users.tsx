import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useServerFn } from "@tanstack/react-start";
import { promoteToAdmin, suspendUser, setUserPlan } from "@/lib/admin.functions";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/users")({
  component: Page,
});

function Page() {
  const qc = useQueryClient();
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<"all"|"free"|"premium">("all");
  const promote = useServerFn(promoteToAdmin);
  const suspend = useServerFn(suspendUser);
  const setPlan = useServerFn(setUserPlan);

  const { data: users } = useQuery({
    queryKey: ["admin-users", q, filter],
    queryFn: async () => {
      let qb = supabase.from("profiles").select("*").order("created_at", { ascending: false }).limit(200);
      if (filter !== "all") qb = qb.eq("plan", filter);
      if (q) qb = qb.or(`email.ilike.%${q}%,name.ilike.%${q}%`);
      return (await qb).data ?? [];
    },
  });

  const [promoteEmail, setPromoteEmail] = useState("");
  const doPromote = async () => {
    try { await promote({ data: { email: promoteEmail } }); toast.success("Dipromosikan ke admin."); setPromoteEmail(""); qc.invalidateQueries({ queryKey:["admin-users"] }); }
    catch (e) { toast.error(e instanceof Error?e.message:"Gagal"); }
  };

  return (
    <div className="space-y-5">
      <h1 className="font-display text-3xl font-semibold">User Management</h1>

      <section className="rounded-3xl bg-card p-4 ring-1 ring-border flex flex-col sm:flex-row gap-2">
        <input value={promoteEmail} onChange={(e)=>setPromoteEmail(e.target.value)} placeholder="Email user untuk dijadikan admin"
          className="flex-1 rounded-2xl border border-border bg-background px-3 py-2 text-sm" />
        <button onClick={doPromote} className="rounded-full bg-foreground px-4 py-2 text-sm text-cream">Promote ke admin</button>
      </section>

      <div className="flex flex-wrap gap-2">
        <input value={q} onChange={(e)=>setQ(e.target.value)} placeholder="Cari nama/email"
          className="flex-1 rounded-2xl border border-border bg-card px-3 py-2 text-sm" />
        <select value={filter} onChange={(e)=>setFilter(e.target.value as "all"|"free"|"premium")} className="rounded-2xl border border-border bg-card px-3 py-2 text-sm">
          <option value="all">Semua</option><option value="free">Free</option><option value="premium">Premium</option>
        </select>
      </div>

      <div className="space-y-2">
        {users?.map((u)=>(
          <div key={u.id} className="rounded-2xl bg-card p-4 ring-1 ring-border">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{u.name ?? "(tanpa nama)"} {u.suspended && <span className="ml-2 text-xs text-destructive">SUSPENDED</span>}</p>
                <p className="truncate text-xs text-muted-foreground">{u.email}</p>
              </div>
              <span className={`rounded-full px-3 py-1 text-xs capitalize ${u.plan==="premium"?"bg-accent-soft":"bg-cream-deep"}`}>{u.plan}</span>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <button onClick={async()=>{ await setPlan({ data: { userId: u.id, plan: u.plan==="premium"?"free":"premium", days: 30 } }); toast.success("Plan diperbarui"); qc.invalidateQueries({ queryKey:["admin-users"]}); }}
                className="rounded-full border border-border px-3 py-1 text-xs">{u.plan==="premium"?"Set Free":"Set Premium 30 hari"}</button>
              <button onClick={async()=>{ await suspend({ data: { userId: u.id, suspended: !u.suspended } }); qc.invalidateQueries({ queryKey:["admin-users"]}); }}
                className="rounded-full border border-border px-3 py-1 text-xs">{u.suspended?"Aktifkan":"Suspend"}</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
