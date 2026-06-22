import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useProfile } from "@/hooks/use-profile";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/app/premium")({
  component: Page,
});

function makeOrderNumber() {
  const d = new Date();
  const ymd = `${d.getFullYear()}${String(d.getMonth()+1).padStart(2,"0")}${String(d.getDate()).padStart(2,"0")}`;
  const rand = Math.floor(Math.random()*90000)+10000;
  return `BM-${ymd}-${rand}`;
}

function Page() {
  const { user } = useAuth();
  const { data: profile } = useProfile(user?.id);
  const qc = useQueryClient();

  const { data: settings } = useQuery({
    queryKey: ["settings"],
    queryFn: async () => (await supabase.from("app_settings").select("*").eq("id",1).maybeSingle()).data,
  });
  const { data: orders } = useQuery({
    queryKey: ["my-orders", user?.id],
    enabled: !!user,
    queryFn: async () => (await supabase.from("orders").select("*").eq("user_id", user!.id).order("created_at",{ ascending:false })).data ?? [],
  });

  const activeOrder = orders?.find((o)=>o.payment_status==="menunggu_pembayaran" || o.payment_status==="menunggu_verifikasi");
  const [creating, setCreating] = useState(false);
  const [uploading, setUploading] = useState(false);

  const createOrder = async () => {
    if (!user) return;
    setCreating(true);
    const order_number = makeOrderNumber();
    const { error } = await supabase.from("orders").insert({
      order_number, user_id: user.id, amount: settings?.premium_price ?? 49000,
      package_name: "Premium Bulanan", payment_method: "transfer_bank",
    });
    setCreating(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Pesanan dibuat.");
    qc.invalidateQueries({ queryKey: ["my-orders", user.id] });
  };

  const uploadProof = async (orderId: string, file: File) => {
    if (!user) return;
    setUploading(true);
    const path = `${user.id}/${orderId}-${Date.now()}.${file.name.split(".").pop()}`;
    const { error: upErr } = await supabase.storage.from("transfer-proofs").upload(path, file, { upsert: true });
    if (upErr) { setUploading(false); toast.error(upErr.message); return; }
    const { error } = await supabase.from("orders").update({
      transfer_proof_url: path, payment_status: "menunggu_verifikasi",
    }).eq("id", orderId);
    setUploading(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Bukti transfer terkirim. Menunggu verifikasi admin.");
    qc.invalidateQueries({ queryKey: ["my-orders", user.id] });
  };

  if (profile?.plan === "premium") {
    return (
      <div className="space-y-4">
        <h1 className="font-display text-3xl font-semibold">✨ Premium Aktif</h1>
        <div className="rounded-3xl bg-gradient-to-br from-primary to-accent p-6 text-primary-foreground">
          <p className="text-sm opacity-90">Berlaku hingga</p>
          <p className="mt-1 font-display text-2xl">{profile.premium_end_date ? new Date(profile.premium_end_date).toLocaleDateString("id-ID") : "—"}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-semibold">Upgrade ke Premium</h1>
        <p className="mt-1 text-sm text-muted-foreground">Buka semua pendamping, unlimited chat, dan growth dashboard.</p>
      </div>

      <section className="rounded-3xl bg-gradient-to-br from-accent/15 to-primary/15 p-6 ring-1 ring-accent/30">
        <p className="font-display text-2xl font-semibold">Rp{(settings?.premium_price ?? 49000).toLocaleString("id-ID")}<span className="text-sm text-muted-foreground">/bulan</span></p>
        <ul className="mt-4 space-y-2 text-sm">
          {["Unlimited AI chat","Semua karakter companion","AI Journal","Mood, habit & eating analytics","Growth dashboard","Weekly AI insight"].map((f)=>(
            <li key={f}>✓ {f}</li>
          ))}
        </ul>
        {!activeOrder && (
          <button onClick={createOrder} disabled={creating} className="mt-5 w-full rounded-full bg-accent py-3 text-sm font-semibold text-accent-foreground shadow-peach disabled:opacity-60">
            {creating ? "Membuat pesanan…" : "Buat pesanan"}
          </button>
        )}
      </section>

      {activeOrder && (
        <section className="rounded-3xl bg-card p-6 ring-1 ring-border space-y-3">
          <div className="flex items-center justify-between">
            <p className="font-display text-lg font-semibold">Instruksi Transfer</p>
            <span className="rounded-full bg-primary-soft px-3 py-1 text-xs font-semibold capitalize">{activeOrder.payment_status.replace(/_/g," ")}</span>
          </div>
          <div className="rounded-2xl bg-cream-deep p-4 text-sm space-y-1">
            <p>Bank: <strong>{settings?.bank_name}</strong></p>
            <p>No. Rekening: <strong>{settings?.bank_account_number}</strong></p>
            <p>Atas Nama: <strong>{settings?.bank_account_holder}</strong></p>
            <p>Nominal: <strong>Rp{activeOrder.amount.toLocaleString("id-ID")}</strong></p>
            <p>No. Pesanan: <strong>{activeOrder.order_number}</strong> (sertakan di berita transfer)</p>
          </div>
          {activeOrder.payment_status === "menunggu_pembayaran" && (
            <div>
              <label className="text-sm font-medium">Upload bukti transfer</label>
              <input type="file" accept="image/*,application/pdf" onChange={(e)=>{ const f=e.target.files?.[0]; if (f) uploadProof(activeOrder.id, f); }}
                disabled={uploading} className="mt-2 block w-full text-sm" />
            </div>
          )}
          {activeOrder.admin_note && <p className="text-xs text-destructive">Catatan admin: {activeOrder.admin_note}</p>}
        </section>
      )}

      <section>
        <h2 className="font-display text-lg font-semibold">Riwayat Pesanan</h2>
        <div className="mt-3 space-y-2">
          {orders?.map((o)=>(
            <div key={o.id} className="flex items-center justify-between rounded-2xl border border-border bg-card p-4 text-sm">
              <div>
                <p className="font-semibold">{o.order_number}</p>
                <p className="text-xs text-muted-foreground">{new Date(o.created_at).toLocaleString("id-ID")} · Rp{o.amount.toLocaleString("id-ID")}</p>
              </div>
              <span className="rounded-full bg-cream-deep px-3 py-1 text-xs capitalize">{o.payment_status.replace(/_/g," ")}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
