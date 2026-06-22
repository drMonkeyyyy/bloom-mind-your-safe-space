import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useServerFn } from "@tanstack/react-start";
import { verifyOrder } from "@/lib/admin.functions";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/transactions")({
  component: Page,
});

function Page() {
  const qc = useQueryClient();
  const verify = useServerFn(verifyOrder);
  const [filter, setFilter] = useState<"all"|"menunggu_pembayaran"|"menunggu_verifikasi"|"disetujui"|"ditolak">("menunggu_verifikasi");

  const { data: orders } = useQuery({
    queryKey: ["admin-orders", filter],
    queryFn: async () => {
      let qb = supabase.from("orders").select("*, profiles(name, email)").order("created_at", { ascending: false }).limit(200);
      if (filter !== "all") qb = qb.eq("payment_status", filter);
      return (await qb).data ?? [];
    },
  });

  const action = async (id: string, approve: boolean) => {
    const note = approve ? undefined : prompt("Alasan penolakan?") ?? "Bukti tidak valid";
    try { await verify({ data: { orderId: id, approve, note } }); toast.success(approve?"Disetujui":"Ditolak"); qc.invalidateQueries({ queryKey:["admin-orders"] }); }
    catch (e) { toast.error(e instanceof Error?e.message:"Gagal"); }
  };

  const viewProof = async (path: string) => {
    const { data } = await supabase.storage.from("transfer-proofs").createSignedUrl(path, 300);
    if (data?.signedUrl) window.open(data.signedUrl, "_blank");
  };

  return (
    <div className="space-y-5">
      <h1 className="font-display text-3xl font-semibold">Transaksi</h1>
      <select value={filter} onChange={(e)=>setFilter(e.target.value as typeof filter)} className="rounded-2xl border border-border bg-card px-3 py-2 text-sm">
        <option value="all">Semua</option>
        <option value="menunggu_pembayaran">Menunggu Pembayaran</option>
        <option value="menunggu_verifikasi">Menunggu Verifikasi</option>
        <option value="disetujui">Disetujui</option>
        <option value="ditolak">Ditolak</option>
      </select>

      <div className="space-y-2">
        {orders?.map((o)=>{
          const p = (o as unknown as { profiles?: { name?: string; email?: string } }).profiles;
          return (
            <div key={o.id} className="rounded-2xl bg-card p-4 ring-1 ring-border">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div>
                  <p className="text-sm font-semibold">{o.order_number}</p>
                  <p className="text-xs text-muted-foreground">{p?.name ?? "—"} · {p?.email}</p>
                  <p className="text-xs">Rp{o.amount.toLocaleString("id-ID")} · {new Date(o.created_at).toLocaleString("id-ID")}</p>
                </div>
                <span className="rounded-full bg-cream-deep px-3 py-1 text-xs capitalize">{o.payment_status.replace(/_/g," ")}</span>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {o.transfer_proof_url && <button onClick={()=>viewProof(o.transfer_proof_url!)} className="rounded-full border border-border px-3 py-1 text-xs">Lihat bukti</button>}
                {o.payment_status === "menunggu_verifikasi" && (
                  <>
                    <button onClick={()=>action(o.id, true)} className="rounded-full bg-primary px-3 py-1 text-xs text-primary-foreground">ACC</button>
                    <button onClick={()=>action(o.id, false)} className="rounded-full border border-destructive/40 px-3 py-1 text-xs text-destructive">Tolak</button>
                  </>
                )}
                {o.admin_note && <span className="text-xs text-muted-foreground">Note: {o.admin_note}</span>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
