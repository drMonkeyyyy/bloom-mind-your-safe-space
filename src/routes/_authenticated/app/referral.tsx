import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getReferralDashboard, requestReferralPayout } from "@/lib/referral.functions";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/app/referral")({
  component: ReferralPage,
});

const BANK_OPTIONS = [
  "BCA",
  "Mandiri",
  "BRI",
  "BNI",
  "BSI (Bank Syariah Indonesia)",
  "CIMB Niaga",
  "GoPay",
  "OVO",
  "DANA",
  "ShopeePay",
];

function ReferralPage() {
  const qc = useQueryClient();
  const fetchDashboard = useServerFn(getReferralDashboard);
  const submitPayout = useServerFn(requestReferralPayout);

  const { data, isLoading } = useQuery({
    queryKey: ["referral-dashboard"],
    queryFn: () => fetchDashboard(),
  });

  const [activeTab, setActiveTab] = useState<"history" | "payouts">("history");
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
  const [submittingPayout, setSubmittingPayout] = useState(false);

  // Form state
  const [bankName, setBankName] = useState(BANK_OPTIONS[0]);
  const [accountNumber, setAccountNumber] = useState("");
  const [accountName, setAccountName] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState<number>(50000);

  const origin =
    typeof window !== "undefined" && !window.location.origin.includes("localhost")
      ? window.location.origin
      : "https://www.jncalm.my.id";
  const referralCode = data?.referralCode || "";
  const referralLink = `${origin}/?ref=${referralCode}`;

  const copyToClipboard = (text: string, msg: string = "Disalin ke clipboard") => {
    navigator.clipboard.writeText(text);
    toast.success(msg);
  };

  const shareToWhatsApp = () => {
    const text = encodeURIComponent(
      `Hai! Kalau kamu lagi butuh ruang aman untuk tenang dan pulih dari cemas/overthinking, coba Bloom Mind deh 🌸. Ini linknya: ${referralLink}`
    );
    window.open(`https://wa.me/?text=${text}`, "_blank");
  };

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!data?.stats) return;

    if (withdrawAmount < 50000) {
      toast.error("Minimal penarikan adalah Rp 50.000");
      return;
    }
    if (withdrawAmount > data.stats.availableBalance) {
      toast.error("Nominal melebihi saldo komisi yang tersedia");
      return;
    }

    setSubmittingPayout(true);
    try {
      await submitPayout({
        data: {
          amount: withdrawAmount,
          bankName,
          accountNumber: accountNumber.trim(),
          accountName: accountName.trim(),
        },
      });
      toast.success("Pengajuan penarikan berhasil dikirim! Admin akan memproses transfer.");
      setIsWithdrawOpen(false);
      setAccountNumber("");
      setAccountName("");
      qc.invalidateQueries({ queryKey: ["referral-dashboard"] });
    } catch (err: any) {
      toast.error(err.message || "Gagal mengajukan penarikan");
    } finally {
      setSubmittingPayout(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  const stats = data?.stats ?? {
    totalReferredCount: 0,
    totalCommissionEarned: 0,
    pendingCommission: 0,
    availableBalance: 0,
    totalPaidPayouts: 0,
    pendingPayouts: 0,
  };

  return (
    <div className="space-y-8 pb-12 max-w-4xl mx-auto">
      {/* ── HEADER & HERO CARD ─────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/95 via-primary to-teal-800 p-6 md:p-8 text-primary-foreground shadow-lg">
        <div className="absolute -right-12 -top-12 h-44 w-44 rounded-full bg-white/10 blur-xl pointer-events-none" />
        <div className="absolute -bottom-10 right-20 h-32 w-32 rounded-full bg-accent/20 blur-lg pointer-events-none" />

        <div className="relative z-10 space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold backdrop-blur-md">
            <span>🎁</span> Program Komisi Afiliasi Bloom Mind
          </div>
          <h1 className="font-display text-2xl md:text-3xl font-bold tracking-tight">
            Ajak Teman Pulih, Dapatkan Komisi s/d Rp 73.500 / Teman
          </h1>
          <p className="text-sm md:text-base text-primary-foreground/90 max-w-xl leading-relaxed">
            Dapatkan komisi uang tunai setiap kali teman bergabung ke program pemulihan melalui tautan atau kodemu. Privasi temanmu 100% aman & anonim.
          </p>

          {/* Quick commission breakdown pills */}
          <div className="pt-1 flex flex-wrap gap-2 text-xs">
            <span className="rounded-full bg-white/15 px-3 py-1 font-medium backdrop-blur-xs">
              🌿 Paket 1 Bulan: <strong>Rp 7.350</strong>
            </span>
            <span className="rounded-full bg-amber-400/25 border border-amber-300/40 px-3 py-1 font-medium backdrop-blur-xs text-amber-100">
              🔥 Paket 3 Bulan: <strong>Rp 17.850</strong>
            </span>
            <span className="rounded-full bg-purple-400/25 border border-purple-300/40 px-3 py-1 font-medium backdrop-blur-xs text-purple-100">
              👑 Paket 1 Tahun: <strong>Rp 73.500</strong>
            </span>
          </div>
        </div>

        {/* Referral Link & Code Box */}
        <div className="mt-6 rounded-2xl bg-white/10 backdrop-blur-md p-4 md:p-5 border border-white/20 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <p className="text-xs font-medium text-primary-foreground/80">Kode Referral Unikmu:</p>
              <div className="mt-1 flex items-center gap-2">
                <span className="font-mono text-xl md:text-2xl font-bold tracking-wider text-white">
                  {referralCode || "BM-..."}
                </span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(referralCode, "Kode referral disalin!")}
                  className="rounded-lg bg-white/20 px-2.5 py-1 text-xs font-semibold hover:bg-white/30 transition-colors cursor-pointer"
                >
                  Salin Kode
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={shareToWhatsApp}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-500 px-5 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-emerald-600 transition-all hover:scale-102 cursor-pointer self-start sm:self-auto"
            >
              <span>💬</span> Bagikan ke WhatsApp
            </button>
          </div>

          {/* Visible Full Referral Link Box */}
          <div className="border-t border-white/15 pt-3">
            <p className="text-[11px] font-medium text-primary-foreground/80 mb-1.5">
              Tautan Promosi Pribadimu (Otomatis Membawa Kodemu):
            </p>
            <div className="flex items-center gap-2 bg-black/20 rounded-xl p-1.5 border border-white/15">
              <input
                type="text"
                readOnly
                value={referralLink}
                className="flex-1 bg-transparent px-2 text-xs font-mono text-white/95 focus:outline-none select-all truncate"
              />
              <button
                type="button"
                onClick={() => copyToClipboard(referralLink, "Link referral berhasil disalin!")}
                className="shrink-0 rounded-lg bg-white px-3.5 py-1.5 text-xs font-bold text-primary hover:bg-white/90 transition-colors shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="h-3.5 w-3.5">
                  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                  <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                </svg>
                Salin Link
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── STATS CARDS ─────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Available Balance */}
        <div className="rounded-2xl bg-card p-5 ring-1 ring-border shadow-xs flex flex-col justify-between">
          <div>
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Komisi Siap Ditarik
            </span>
            <p className="mt-2 text-2xl font-bold text-emerald-600">
              Rp {stats.availableBalance.toLocaleString("id-ID")}
            </p>
          </div>
          <button
            onClick={() => setIsWithdrawOpen(true)}
            disabled={stats.availableBalance < 50000}
            className="mt-4 w-full rounded-xl bg-primary py-2 text-xs font-bold text-primary-foreground shadow-xs transition-all hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {stats.availableBalance < 50000 ? "Min. Tarik Rp50.000" : "Tarik Saldo →"}
          </button>
        </div>

        {/* Total Earned */}
        <div className="rounded-2xl bg-card p-5 ring-1 ring-border shadow-xs">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Total Komisi Didapat
          </span>
          <p className="mt-2 text-2xl font-bold text-foreground">
            Rp {stats.totalCommissionEarned.toLocaleString("id-ID")}
          </p>
          <p className="mt-2 text-[11px] text-muted-foreground">
            Semua transaksi paket yang berhasil lunas
          </p>
        </div>

        {/* Friends Referred */}
        <div className="rounded-2xl bg-card p-5 ring-1 ring-border shadow-xs">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Teman Berhasil Upgrade
          </span>
          <p className="mt-2 text-2xl font-bold text-primary">
            {stats.totalReferredCount} <span className="text-sm font-normal text-muted-foreground">orang</span>
          </p>
          <p className="mt-2 text-[11px] text-muted-foreground">
            Telah bergabung menjadi Member Premium
          </p>
        </div>

        {/* Pending Commission */}
        <div className="rounded-2xl bg-card p-5 ring-1 ring-border shadow-xs">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Komisi Tertunda
          </span>
          <p className="mt-2 text-2xl font-bold text-amber-600">
            Rp {stats.pendingCommission.toLocaleString("id-ID")}
          </p>
          <p className="mt-2 text-[11px] text-muted-foreground">
            Menunggu pembayaran invoice pembeli
          </p>
        </div>
      </div>

      {/* ── PRIVACY CALLOUT ─────────────────────────────────────────── */}
      <div className="rounded-2xl bg-teal-50/70 border border-teal-200/80 p-4 flex items-start gap-3">
        <span className="text-xl">🔒</span>
        <div className="text-xs text-teal-900 leading-relaxed">
          <span className="font-semibold text-teal-950">Privasi Temanmu Terjamin 100%:</span> Kamu hanya akan melihat label nama anonim (contoh: <em>Pejuang Tenang #8410</em>). Email, nomor telepon, riwayat percakapan, dan jurnal pribadi mereka tidak akan pernah bisa dilihat oleh siapa pun.
        </div>
      </div>

      {/* ── TABS & TABLE LIST ─────────────────────────────────────────── */}
      <div className="rounded-3xl bg-card p-6 ring-1 ring-border space-y-6">
        <div className="flex items-center gap-2 border-b border-border pb-3">
          <button
            onClick={() => setActiveTab("history")}
            className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-colors ${
              activeTab === "history"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-cream-deep hover:text-foreground"
            }`}
          >
            Riwayat Komisi ({data?.orders.length ?? 0})
          </button>
          <button
            onClick={() => setActiveTab("payouts")}
            className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-colors ${
              activeTab === "payouts"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-cream-deep hover:text-foreground"
            }`}
          >
            Riwayat Penarikan ({data?.payouts.length ?? 0})
          </button>
        </div>

        {activeTab === "history" && (
          <div className="space-y-3">
            {(!data?.orders || data.orders.length === 0) ? (
              <div className="rounded-2xl border border-dashed border-border p-10 text-center">
                <span className="text-3xl">🌱</span>
                <p className="mt-2 text-sm font-semibold text-foreground">Belum ada komisi tercatat</p>
                <p className="mt-1 text-xs text-muted-foreground max-w-sm mx-auto">
                  Bagikan tautan referalmu kepada teman, komunitas, atau media sosial untuk mulai mengumpulkan komisi.
                </p>
              </div>
            ) : (
              data.orders.map((o: any) => (
                <div
                  key={o.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl bg-cream-deep/60 p-4 border border-border"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-foreground">{o.pseudoName}</span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${
                          o.paymentStatus === "disetujui"
                            ? "bg-emerald-100 text-emerald-800"
                            : o.paymentStatus === "ditolak"
                            ? "bg-red-100 text-red-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {o.paymentStatus === "disetujui" ? "Sukses" : o.paymentStatus.replace(/_/g, " ")}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {o.packageName} · {new Date(o.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="text-xs text-muted-foreground">Komisi:</span>
                    <p className="text-sm font-bold text-emerald-600">
                      +Rp {o.commissionAmount.toLocaleString("id-ID")}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === "payouts" && (
          <div className="space-y-3">
            {(!data?.payouts || data.payouts.length === 0) ? (
              <div className="rounded-2xl border border-dashed border-border p-10 text-center">
                <span className="text-3xl">💳</span>
                <p className="mt-2 text-sm font-semibold text-foreground">Belum ada riwayat penarikan</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Saat saldo komisi mencapai Rp 50.000, kamu bisa menarik dana ke rekening bank atau e-wallet.
                </p>
              </div>
            ) : (
              data.payouts.map((p: any) => (
                <div
                  key={p.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl bg-cream-deep/60 p-4 border border-border"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-foreground">
                        {p.bank_name} · {p.account_number} ({p.account_name})
                      </span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${
                          p.status === "selesai"
                            ? "bg-emerald-100 text-emerald-800"
                            : p.status === "ditolak"
                            ? "bg-red-100 text-red-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {p.status === "selesai" ? "Ditransfer" : p.status.replace(/_/g, " ")}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Diajukan {new Date(p.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                      {p.admin_note && ` · Catatan: ${p.admin_note}`}
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="text-xs text-muted-foreground">Nominal:</span>
                    <p className="text-sm font-bold text-foreground">
                      Rp {p.amount.toLocaleString("id-ID")}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* ── MODAL PENARIKAN DANA ─────────────────────────────────────────── */}
      {isWithdrawOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-3xl bg-card p-6 shadow-xl ring-1 ring-border animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h3 className="font-display text-lg font-bold">Tarik Saldo Komisi</h3>
              <button
                onClick={() => setIsWithdrawOpen(false)}
                className="rounded-full p-1 text-muted-foreground hover:bg-cream-deep"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleWithdraw} className="mt-4 space-y-4">
              <div>
                <span className="text-xs text-muted-foreground">Saldo Tersedia:</span>
                <p className="text-lg font-bold text-emerald-600">
                  Rp {stats.availableBalance.toLocaleString("id-ID")}
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Nominal Penarikan (Rp)
                </label>
                <input
                  type="number"
                  min={50000}
                  max={stats.availableBalance}
                  step={10000}
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(Number(e.target.value))}
                  required
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <p className="mt-1 text-[11px] text-muted-foreground">Minimal penarikan Rp 50.000</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Nama Bank / e-Wallet
                </label>
                <select
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  {BANK_OPTIONS.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Nomor Rekening / No. HP e-Wallet
                </label>
                <input
                  type="text"
                  placeholder="Contoh: 1234567890 atau 08123456789"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  required
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1">
                  Nama Pemilik Rekening
                </label>
                <input
                  type="text"
                  placeholder="Sesuai buku tabungan / akun e-wallet"
                  value={accountName}
                  onChange={(e) => setAccountName(e.target.value)}
                  required
                  className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsWithdrawOpen(false)}
                  className="flex-1 rounded-xl border border-border py-2.5 text-xs font-semibold hover:bg-cream-deep transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submittingPayout || withdrawAmount > stats.availableBalance || withdrawAmount < 50000}
                  className="flex-1 rounded-xl bg-primary py-2.5 text-xs font-bold text-primary-foreground hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {submittingPayout ? "Mengirim…" : "Kirim Pengajuan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
