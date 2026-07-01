import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useProfile } from "@/hooks/use-profile";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { createPayment } from "@/lib/payment.functions";
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
  disetujui: "bg-emerald-50 text-emerald-700",
  rejected: "bg-red-50 text-red-700",
  ditolak: "bg-red-50 text-red-700",
};

function Page() {
  const { user } = useAuth();
  const { data: profile } = useProfile(user?.id);
  const qc = useQueryClient();
  const startPayment = useServerFn(createPayment);

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

  const createOrder = async () => {
    if (!user) return;
    setCreating(true);
    try {
      const redirectUrl = window.location.origin + "/app/premium";
      const result = await startPayment({ data: { redirectUrl } });
      if (result && result.paymentLink) {
        toast.success("Mengarahkan ke halaman pembayaran...");
        window.location.href = result.paymentLink;
      } else {
        throw new Error("Gagal mendapatkan link pembayaran");
      }
    } catch (err: any) {
      toast.error(err.message || "Gagal membuat pembayaran");
    } finally {
      setCreating(false);
      qc.invalidateQueries({ queryKey: ["my-orders", user.id] });
    }
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

      {/* ── PAYMENT DETAILS ─────────────────────────────────────────── */}
      {activeOrder && (
        <section className="rounded-3xl bg-card p-6 ring-1 ring-border space-y-4">
          <div className="flex items-center justify-between">
            <p className="font-display text-lg font-semibold">Status Pembayaran</p>
            <span className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${STATUS_COLORS[activeOrder.payment_status] ?? "bg-cream-deep text-muted-foreground"}`}>
              {activeOrder.payment_status.replace(/_/g, " ")}
            </span>
          </div>

          <div className="rounded-2xl bg-cream-deep p-5 space-y-3">
            {[
              { label: "No. Pesanan", value: activeOrder.order_number, copyable: true },
              { label: "Paket", value: activeOrder.package_name },
              { label: "Nominal", value: `Rp${activeOrder.amount.toLocaleString("id-ID")}` },
              { label: "Metode Pembayaran", value: activeOrder.payment_method === "mayar" ? "Mayar Payment Gateway" : "Transfer Bank" },
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

          {activeOrder.payment_status === "menunggu_pembayaran" && (
            <button
              onClick={() => {
                if (activeOrder.payment_link) {
                  window.location.href = activeOrder.payment_link;
                } else {
                  createOrder();
                }
              }}
              disabled={creating}
              className="w-full rounded-full bg-primary py-4 text-sm font-semibold text-primary-foreground shadow-peach transition-all duration-300 hover:-translate-y-0.5 disabled:opacity-60"
            >
              {creating ? "Memproses…" : activeOrder.payment_link ? "Lanjutkan Pembayaran →" : "Bayar Sekarang via Mayar →"}
            </button>
          )}

          {activeOrder.admin_note && (
            <div className="rounded-2xl bg-destructive/10 px-4 py-3 text-sm text-destructive">
              <strong>Catatan:</strong> {activeOrder.admin_note}
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
