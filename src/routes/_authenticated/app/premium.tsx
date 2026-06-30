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
  const ymd = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
  const rand = Math.floor(Math.random() * 90000) + 10000;
  return `BM-${ymd}-${rand}`;
}

const FEATURES = [
  { icon: "💬", label: "Chat AI tanpa batas" },
  { icon: "🧑‍🤝‍🧑", label: "Semua AI Companion (7 karakter)" },
  { icon: "📊", label: "Weekly AI Insight personal" },
  { icon: "📈", label: "Growth Dashboard lengkap" },
  { icon: "🍎", label: "Emotional Eating Analysis" },
  { icon: "📜", label: "Riwayat penuh tanpa batas" },
];

const STATUS_COLORS: Record<string, string> = {
  menunggu_pembayaran: "bg-amber-50 text-amber-700",
  menunggu_verifikasi: "bg-blue-50 text-blue-700",
  verified: "bg-emerald-50 text-emerald-700",
  rejected: "bg-red-50 text-red-700",
};

function Page() {
  const { user } = useAuth();
  const { data: profile } = useProfile(user?.id);
  const qc = useQueryClient();

  const { data: settings } = useQuery({
    queryKey: ["settings"],
    queryFn: async () => (await supabase.from("app_settings").select("*").eq("id", 1).maybeSingle()).data,
  });
  const { data: orders } = useQuery({
    queryKey: ["my-orders", user?.id],
    enabled: !!user,
    queryFn: async () => (await supabase.from("orders").select("*").eq("user_id", user!.id).order("created_at", { ascending: false })).data ?? [],
  });

  const activeOrder = orders?.find((o) => o.payment_status === "menunggu_pembayaran" || o.payment_status === "menunggu_verifikasi");
  const [creating, setCreating] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

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
    toast.success("Pesanan dibuat. Silakan transfer sesuai instruksi.");
    qc.invalidateQueries({ queryKey: ["my-orders", user.id] });
  };

  const handleFile = async (file: File | null | undefined, orderId: string) => {
    if (!file || !user) return;
    if (file.size > 5 * 1024 * 1024) { toast.error("File terlalu besar. Maksimal 5MB."); return; }
    setUploading(true);
    const reader = new FileReader();
    reader.onload = (e) => setPreviewUrl(e.target?.result as string);
    reader.readAsDataURL(file);
    const path = `${user.id}/${orderId}-${Date.now()}.${file.name.split(".").pop()}`;
    const { error: upErr } = await supabase.storage.from("transfer-proofs").upload(path, file, { upsert: true });
    if (upErr) { setUploading(false); toast.error(upErr.message); return; }
    const { error } = await supabase.from("orders").update({ transfer_proof_url: path, payment_status: "menunggu_verifikasi" }).eq("id", orderId);
    setUploading(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Bukti transfer terkirim. Menunggu verifikasi admin.");
    qc.invalidateQueries({ queryKey: ["my-orders", user.id] });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Disalin ke clipboard");
  };

  // Active premium state
  if (profile?.plan === "premium") {
    return (
      <div className="space-y-6">
        <h1 className="font-display text-3xl font-semibold">✨ Premium Aktif</h1>
        <div
          className="relative overflow-hidden rounded-3xl p-8 text-white"
          style={{ background: "var(--gradient-premium)" }}
        >
          <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10" />
          <div className="absolute -bottom-10 right-20 h-28 w-28 rounded-full bg-white/5" />
          <div className="relative">
            <p className="text-4xl">✨</p>
            <h2 className="mt-3 font-display text-2xl font-semibold">Bloom Mind Premium</h2>
            <p className="mt-1 text-sm opacity-80">Akun premium aktif</p>
            <div className="mt-6 rounded-2xl bg-white/15 px-5 py-4 backdrop-blur-sm">
              <p className="text-xs opacity-75">Berlaku hingga</p>
              <p className="mt-1 font-display text-xl font-semibold">
                {profile.premium_end_date
                  ? new Date(profile.premium_end_date).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })
                  : "Tidak terbatas"}
              </p>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {FEATURES.map((f) => (
            <div key={f.label} className="flex items-center gap-2 rounded-2xl bg-card p-3 ring-1 ring-border text-sm">
              <span>{f.icon}</span> {f.label}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-semibold">Upgrade ke Premium</h1>
        <p className="mt-1 text-sm text-muted-foreground">Buka semua fitur dan dampingan AI penuh.</p>
      </div>

      {/* ── PRICE CARD ────────────────────────────────────────────── */}
      <div className="relative">
        <div className="absolute -inset-0.5 rounded-[2rem] bg-gradient-to-br from-accent via-primary to-accent opacity-50 blur-lg" />
        <section className="relative overflow-hidden rounded-[1.75rem] bg-card p-7 ring-1 ring-border">
          <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-accent-soft opacity-50 blur-2xl" />
          <div className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-primary-soft opacity-60 blur-xl" />

          <div className="relative">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-amber-100 to-orange-100 px-3 py-1 text-xs font-bold text-amber-700">
              ✨ PALING POPULER
            </span>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="font-display text-5xl font-bold text-foreground">
                Rp{(settings?.premium_price ?? 49000).toLocaleString("id-ID")}
              </span>
              <span className="text-base text-muted-foreground">/bulan</span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">Tanpa kontrak · Bisa berhenti kapan saja</p>

            <ul className="mt-5 grid grid-cols-1 gap-2 sm:grid-cols-2">
              {FEATURES.map((f) => (
                <li key={f.label} className="flex items-center gap-2.5 text-sm">
                  <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3" aria-hidden="true">
                      <path d="m5 12 4 4 10-10" />
                    </svg>
                  </span>
                  <span className="text-foreground">{f.label}</span>
                </li>
              ))}
            </ul>

            {!activeOrder && (
              <button
                onClick={createOrder}
                disabled={creating}
                className="mt-6 w-full rounded-full bg-accent py-4 text-sm font-semibold text-accent-foreground shadow-peach transition-all duration-300 hover:-translate-y-0.5 disabled:opacity-60"
              >
                {creating ? "Membuat pesanan…" : "Buat Pesanan Sekarang →"}
              </button>
            )}
            <p className="mt-3 text-center text-xs text-muted-foreground">
              ☕ Kurang dari sekali nongkrong di coffee shop
            </p>
          </div>
        </section>
      </div>

      {/* ── TRANSFER INSTRUCTIONS ─────────────────────────────────── */}
      {activeOrder && (
        <section className="rounded-3xl bg-card p-6 ring-1 ring-border space-y-4">
          <div className="flex items-center justify-between">
            <p className="font-display text-lg font-semibold">Instruksi Transfer</p>
            <span className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${STATUS_COLORS[activeOrder.payment_status] ?? "bg-cream-deep text-muted-foreground"}`}>
              {activeOrder.payment_status.replace(/_/g, " ")}
            </span>
          </div>

          <div className="rounded-2xl bg-cream-deep p-5 space-y-3">
            {[
              { label: "Bank", value: settings?.bank_name },
              { label: "No. Rekening", value: settings?.bank_account_number, copyable: true },
              { label: "Atas Nama", value: settings?.bank_account_holder },
              { label: "Nominal", value: `Rp${activeOrder.amount.toLocaleString("id-ID")}` },
              { label: "Kode Unik / No. Pesanan", value: activeOrder.order_number, copyable: true },
            ].map(({ label, value, copyable }) => (
              <div key={label} className="flex items-center justify-between gap-2">
                <span className="text-xs text-muted-foreground shrink-0">{label}</span>
                <div className="flex items-center gap-2 min-w-0">
                  <span className="truncate text-sm font-semibold text-foreground">{value ?? "—"}</span>
                  {copyable && value && (
                    <button
                      onClick={() => copyToClipboard(String(value))}
                      className="shrink-0 rounded-full bg-primary-soft px-2.5 py-0.5 text-[10px] font-semibold text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
                    >
                      Salin
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          <p className="text-xs text-muted-foreground">
            ⚠️ Sertakan nomor pesanan <strong>{activeOrder.order_number}</strong> di kolom berita transfer.
          </p>

          {activeOrder.payment_status === "menunggu_pembayaran" && (
            <div>
              <p className="mb-3 text-sm font-semibold">Upload bukti transfer</p>

              {/* Drop zone */}
              <label
                htmlFor="proof-upload"
                className={`flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 text-center cursor-pointer transition-all duration-200 ${
                  dragOver ? "border-primary bg-primary-soft/30" : "border-border bg-cream-deep/50 hover:border-primary/50"
                }`}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault(); setDragOver(false);
                  handleFile(e.dataTransfer.files[0], activeOrder.id);
                }}
              >
                {previewUrl ? (
                  <img src={previewUrl} alt="Preview bukti transfer" className="max-h-40 rounded-xl object-contain" />
                ) : uploading ? (
                  <div className="flex flex-col items-center gap-2">
                    <svg className="animate-spin h-8 w-8 text-primary" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    <p className="text-sm text-muted-foreground">Mengupload…</p>
                  </div>
                ) : (
                  <>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="h-10 w-10 text-primary/50 mb-3" aria-hidden="true">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" />
                    </svg>
                    <p className="text-sm font-medium text-foreground">Drag & drop atau klik untuk upload</p>
                    <p className="mt-1 text-xs text-muted-foreground">JPG, PNG, PDF · Maksimal 5MB</p>
                  </>
                )}
                <input
                  id="proof-upload"
                  type="file"
                  accept="image/*,application/pdf"
                  className="sr-only"
                  onChange={(e) => handleFile(e.target.files?.[0], activeOrder.id)}
                  disabled={uploading}
                />
              </label>
            </div>
          )}

          {activeOrder.admin_note && (
            <div className="rounded-2xl bg-destructive/10 px-4 py-3 text-sm text-destructive">
              <strong>Catatan admin:</strong> {activeOrder.admin_note}
            </div>
          )}
        </section>
      )}

      {/* ── ORDER HISTORY ─────────────────────────────────────────── */}
      {orders && orders.length > 0 && (
        <section>
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground/60">Riwayat Pesanan</p>
          <div className="space-y-2">
            {orders.map((o) => (
              <div key={o.id} className="flex items-center gap-3 rounded-2xl bg-card p-4 ring-1 ring-border">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground">{o.order_number}</p>
                  <p className="text-[11px] text-muted-foreground">
                    {new Date(o.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "long" })}
                    {" · "}Rp{o.amount.toLocaleString("id-ID")}
                  </p>
                </div>
                <span className={`rounded-full px-3 py-1 text-[11px] font-semibold capitalize ${STATUS_COLORS[o.payment_status] ?? "bg-cream-deep text-muted-foreground"}`}>
                  {o.payment_status.replace(/_/g, " ")}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
