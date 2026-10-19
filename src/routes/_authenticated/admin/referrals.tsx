import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useServerFn } from "@tanstack/react-start";
import { adminProcessPayout } from "@/lib/referral.functions";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/referrals")({
  component: AdminReferralsPage,
});

function AdminReferralsPage() {
  const qc = useQueryClient();
  const processPayout = useServerFn(adminProcessPayout);

  const [activeTab, setActiveTab] = useState<"payouts" | "orders">("payouts");
  const [payoutFilter, setPayoutFilter] = useState<"all" | "menunggu_transfer" | "selesai" | "ditolak">("all");

  // Fetch payouts with user profile details
  const { data: payouts, isLoading: loadingPayouts } = useQuery<any[]>({
    queryKey: ["admin-payouts", payoutFilter],
    queryFn: async () => {
      let q = (supabase.from("referral_payouts") as any)
        .select("*, profiles:user_id(name, email, phone)")
        .order("created_at", { ascending: false });

      if (payoutFilter !== "all") {
        q = q.eq("status", payoutFilter);
      }
      const res = await q;
      return (res.data as any[]) ?? [];
    },
  });

  // Fetch referred orders
  const { data: referredOrders, isLoading: loadingOrders } = useQuery<any[]>({
    queryKey: ["admin-referred-orders"],
    queryFn: async () => {
      const res = await (supabase.from("orders") as any)
        .select("*, buyer:user_id(name, email), referrer:referrer_id(name, email, referral_code)")
        .not("referrer_id", "is", null)
        .order("created_at", { ascending: false })
        .limit(100);
      return (res.data as any[]) ?? [];
    },
  });

  const handleAction = async (payoutId: string, action: "approve" | "reject") => {
    const note =
      action === "reject"
        ? prompt("Alasan penolakan?") || "Data rekening tidak valid"
        : prompt("Catatan transfer (opsional, misal no ref bank):") || undefined;

    if (action === "reject" && !note) return;

    try {
      await processPayout({ data: { payoutId, action, note } });
      toast.success(action === "approve" ? "Penarikan berhasil ditandai selesai" : "Penarikan ditolak");
      qc.invalidateQueries({ queryKey: ["admin-payouts"] });
    } catch (err: any) {
      toast.error(err.message || "Gagal memproses penarikan");
    }
  };

  const pendingPayouts = payouts?.filter((p) => p.status === "menunggu_transfer") ?? [];
  const totalPendingAmount = pendingPayouts.reduce((sum, p) => sum + p.amount, 0);
  const totalCompletedAmount = (payouts?.filter((p) => p.status === "selesai") ?? []).reduce(
    (sum, p) => sum + p.amount,
    0
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-semibold">Program Afiliasi & Referral</h1>
          <p className="text-xs text-muted-foreground mt-1">
            Kelola pencairan komisi pengguna dan pantau performa promosi
          </p>
        </div>
      </div>

      {/* ── STATS SUMMARY ─────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl bg-card p-5 ring-1 ring-border">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Menunggu Transfer
          </span>
          <p className="mt-2 text-2xl font-bold text-amber-600">
            Rp {totalPendingAmount.toLocaleString("id-ID")}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {pendingPayouts.length} pengajuan penarikan
          </p>
        </div>

        <div className="rounded-2xl bg-card p-5 ring-1 ring-border">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Total Komisi Dicairkan
          </span>
          <p className="mt-2 text-2xl font-bold text-emerald-600">
            Rp {totalCompletedAmount.toLocaleString("id-ID")}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">Telah ditransfer ke rekening</p>
        </div>

        <div className="rounded-2xl bg-card p-5 ring-1 ring-border">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Order via Referral
          </span>
          <p className="mt-2 text-2xl font-bold text-primary">
            {referredOrders?.length ?? 0} <span className="text-sm font-normal text-muted-foreground">transaksi</span>
          </p>
          <p className="mt-1 text-xs text-muted-foreground">Dari link promosi pengguna</p>
        </div>
      </div>

      {/* ── TABS ─────────────────────────────────────────── */}
      <div className="flex items-center gap-2 border-b border-border pb-3">
        <button
          onClick={() => setActiveTab("payouts")}
          className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-colors ${
            activeTab === "payouts"
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:bg-cream-deep hover:text-foreground"
          }`}
        >
          Pengajuan Pencairan Saldo ({payouts?.length ?? 0})
        </button>
        <button
          onClick={() => setActiveTab("orders")}
          className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-colors ${
            activeTab === "orders"
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:bg-cream-deep hover:text-foreground"
          }`}
        >
          Riwayat Order Referral ({referredOrders?.length ?? 0})
        </button>
      </div>

      {/* ── PAYOUTS TAB ─────────────────────────────────────────── */}
      {activeTab === "payouts" && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Filter status:</span>
            <select
              value={payoutFilter}
              onChange={(e) => setPayoutFilter(e.target.value as any)}
              className="rounded-xl border border-border bg-card px-3 py-1.5 text-xs focus:outline-none"
            >
              <option value="all">Semua Status</option>
              <option value="menunggu_transfer">Menunggu Transfer</option>
              <option value="selesai">Selesai</option>
              <option value="ditolak">Ditolak</option>
            </select>
          </div>

          {loadingPayouts ? (
            <div className="p-8 text-center text-xs text-muted-foreground">Memuat data penarikan…</div>
          ) : !payouts || payouts.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border p-12 text-center text-xs text-muted-foreground">
              Tidak ada pengajuan pencairan dana.
            </div>
          ) : (
            <div className="space-y-3">
              {payouts.map((p) => {
                const userProfile = (p as any).profiles;
                return (
                  <div
                    key={p.id}
                    className="flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-2xl bg-card p-5 ring-1 ring-border"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-foreground">
                          {p.bank_name} · {p.account_number}
                        </span>
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase ${
                            p.status === "selesai"
                              ? "bg-emerald-100 text-emerald-800"
                              : p.status === "ditolak"
                              ? "bg-red-100 text-red-800"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {p.status === "selesai" ? "Selesai Ditransfer" : p.status.replace(/_/g, " ")}
                        </span>
                      </div>
                      <p className="text-xs text-foreground/90 font-medium">
                        a/n {p.account_name} · Pemilik Akun: {userProfile?.name || "—"} ({userProfile?.email})
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        Diajukan: {new Date(p.created_at).toLocaleString("id-ID")}
                        {p.admin_note && ` · Catatan: ${p.admin_note}`}
                      </p>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <span className="text-[11px] text-muted-foreground">Nominal Transfer:</span>
                        <p className="text-lg font-bold text-foreground">
                          Rp {p.amount.toLocaleString("id-ID")}
                        </p>
                      </div>

                      {p.status === "menunggu_transfer" && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleAction(p.id, "approve")}
                            className="rounded-full bg-emerald-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 transition-colors"
                          >
                            ACC & Transfer
                          </button>
                          <button
                            onClick={() => handleAction(p.id, "reject")}
                            className="rounded-full border border-destructive/40 px-3 py-1.5 text-xs font-semibold text-destructive hover:bg-destructive/10 transition-colors"
                          >
                            Tolak
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── ORDERS TAB ─────────────────────────────────────────── */}
      {activeTab === "orders" && (
        <div className="space-y-3">
          {loadingOrders ? (
            <div className="p-8 text-center text-xs text-muted-foreground">Memuat data order…</div>
          ) : !referredOrders || referredOrders.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border p-12 text-center text-xs text-muted-foreground">
              Belum ada pesanan yang menggunakan kode referral.
            </div>
          ) : (
            referredOrders.map((o) => {
              const buyer = (o as any).buyer;
              const referrer = (o as any).referrer;
              return (
                <div
                  key={o.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl bg-card p-4 ring-1 ring-border"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-foreground">{o.order_number}</span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${
                          o.payment_status === "disetujui"
                            ? "bg-emerald-100 text-emerald-800"
                            : o.payment_status === "ditolak"
                            ? "bg-red-100 text-red-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {o.payment_status.replace(/_/g, " ")}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Paket: <span className="font-medium text-foreground">{o.package_name}</span> (Rp {o.amount.toLocaleString("id-ID")})
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      Pembeli: {buyer?.name || "—"} ({buyer?.email}) · Waktu: {new Date(o.created_at).toLocaleString("id-ID")}
                    </p>
                  </div>

                  <div className="text-left sm:text-right bg-cream-deep/60 sm:bg-transparent p-2.5 sm:p-0 rounded-xl">
                    <span className="text-[11px] text-muted-foreground">
                      Pereferal: <strong>{referrer?.name || "—"}</strong> ({o.referral_code})
                    </span>
                    <p className="text-sm font-bold text-emerald-600">
                      Komisi: Rp {(o.commission_amount || 0).toLocaleString("id-ID")}{" "}
                      <span className="text-[10px] text-muted-foreground font-normal">
                        ({o.commission_status})
                      </span>
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
