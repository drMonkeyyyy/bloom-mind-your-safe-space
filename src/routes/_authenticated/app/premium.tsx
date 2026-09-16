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

const FEATURES_MONTHLY = [
  { icon: "🎯", label: "Tugas Harian Pemulihan (3-Min Daily Quest)" },
  { icon: "🫁", label: "Emergency Calm Mode & Pernapasan SOS Tanpa Batas" },
  { icon: "💬", label: "Curhat tanpa batas & semua Pendamping AI" },
  { icon: "📋", label: "Tes Kesehatan Mental (Calm Check) & Skor" },
  { icon: "📓", label: "Jurnal Refleksi CBT & Gratitude tanpa batas" },
  { icon: "📈", label: "Growth Dashboard & Grafik Emosi Lengkap" },
  { icon: "🍎", label: "Emotional Eating Analysis & Craving Tracker" },
  { icon: "🤝", label: "Akses Komunitas Aman & Fitur Pelukan 🩵" },
  { icon: "📒", label: "Ekspor PDF Diary Bergaya Buku Harian" },
];

const FEATURES_ANNUAL = [
  { icon: "🎯", label: "Roadmap & Quest Pemulihan Personal 365 Hari" },
  { icon: "🫁", label: "Emergency Calm Mode & Pernapasan SOS Tanpa Batas" },
  { icon: "👑", label: "Semua Fitur Lengkap Program Pemulihan 90 Hari" },
  { icon: "🔒", label: "Riwayat Penuh 1 TAHUN Tersimpan Aman" },
  { icon: "📄", label: "Ekspor PDF Diary & Kilas Balik Tahunan" },
  { icon: "⭐", label: "Akses Pertama Fitur & Pendamping AI Baru" },
  { icon: "⚡", label: "Dukungan & Respons Prioritas Utama" },
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

  const [packageType, setPackageType] = useState<"bulanan" | "3bulan" | "tahunan">("3bulan");
  const activeOrder = orders?.find((o) => (o.payment_status === "menunggu_pembayaran" || o.payment_status === "menunggu_verifikasi") && o.payment_method === "mayar");
  const [creating, setCreating] = useState(false);

  const createOrder = async () => {
    if (!user) return;
    setCreating(true);
    try {
      const redirectUrl = window.location.origin + "/app/premium";
      const result = await startPayment({ data: { redirectUrl, packageType } });
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
    let planLabel = "Bulanan";
    if (profile?.premium_end_date && profile?.premium_start_date) {
      const diffDays = Math.round((new Date(profile.premium_end_date).getTime() - new Date(profile.premium_start_date).getTime()) / (24 * 60 * 60 * 1000));
      if (diffDays > 180) planLabel = "Tahunan (365 Hari)";
      else if (diffDays > 60) planLabel = "3 Bulan (90 Hari)";
      else planLabel = "Bulanan (30 Hari)";
    }
    const activeFeatures = planLabel.includes("Tahunan") ? FEATURES_ANNUAL : FEATURES_MONTHLY;
    return (
      <div className="space-y-6">
        <h1 className="font-display text-3xl font-semibold">✨ Program Pemulihan Aktif</h1>
        <div
          className="relative overflow-hidden rounded-3xl p-8 text-white"
          style={{ background: "var(--gradient-premium)" }}
        >
          <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10" />
          <div className="absolute -bottom-10 right-20 h-28 w-28 rounded-full bg-white/5" />
          <div className="relative">
            <p className="text-4xl">{planLabel.includes("Tahunan") ? "🏆" : planLabel.includes("3 Bulan") ? "🔥" : "✨"}</p>
            <h2 className="mt-3 font-display text-2xl font-semibold">
              JN-CALM Premium — {planLabel}
            </h2>
            <p className="mt-1 text-sm opacity-80">
              {planLabel.includes("Tahunan") ? "Riwayat disimpan 1 tahun penuh · Ekspor PDF Diary" : "Riwayat disimpan aman · Ekspor PDF Diary"}
            </p>
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
          {activeFeatures.map((f) => (
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
        <h1 className="font-display text-3xl font-semibold">Program Pemulihan Emosi</h1>
        <p className="mt-1 text-sm text-muted-foreground">Pilih tahapan pendampingan dan pemulihan mental yang kamu butuhkan.</p>
      </div>

      {/* ── PLAN SELECTOR ────────────────────────────────────────── */}
      <div className="flex justify-center">
        <div className="bg-muted p-1 rounded-[1.5rem] flex items-center ring-1 ring-border/40 max-w-lg w-full">
          <button
            onClick={() => setPackageType("bulanan")}
            className={`flex-1 py-2.5 px-3 rounded-[1.25rem] text-xs font-bold transition-all duration-300 relative ${
              packageType === "bulanan"
                ? "bg-card text-foreground shadow-sm scale-100"
                : "text-muted-foreground hover:text-foreground scale-95"
            }`}
          >
            1 Bulan
            <span className="ml-1 opacity-75">· 49rb</span>
          </button>
          <button
            onClick={() => setPackageType("3bulan")}
            className={`flex-1 py-2.5 px-3 rounded-[1.25rem] text-xs font-bold transition-all duration-300 relative ${
              packageType === "3bulan"
                ? "bg-card text-foreground shadow-sm scale-100"
                : "text-muted-foreground hover:text-foreground scale-95"
            }`}
          >
            3 Bulan
            <span className="absolute -top-2 -right-1 bg-amber-500 text-white text-[7px] font-black px-1.5 py-0.5 rounded-full shadow-sm scale-90 animate-pulse">
              HEALING 90 HARI
            </span>
          </button>
          <button
            onClick={() => setPackageType("tahunan")}
            className={`flex-1 py-2.5 px-3 rounded-[1.25rem] text-xs font-bold transition-all duration-300 relative ${
              packageType === "tahunan"
                ? "bg-card text-foreground shadow-sm scale-100"
                : "text-muted-foreground hover:text-foreground scale-95"
            }`}
          >
            1 Tahun
            <span className="absolute -top-2 -right-1 bg-violet-600 text-white text-[7px] font-black px-1.5 py-0.5 rounded-full shadow-sm scale-90">
              HEMAT 17%
            </span>
          </button>
        </div>
      </div>

      {/* ── PRICE CARD ────────────────────────────────────────────── */}
      <div className="relative">
        <div className="absolute -inset-0.5 rounded-[2rem] bg-gradient-to-br from-accent via-primary to-accent opacity-50 blur-lg" />
        <section className="relative overflow-hidden rounded-[1.75rem] bg-card p-7 ring-1 ring-border">
          <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-accent-soft opacity-50 blur-2xl" />
          <div className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-primary-soft opacity-60 blur-xl" />

          <div className="relative">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-amber-100 to-orange-100 px-3 py-1 text-xs font-bold text-amber-700">
                {packageType === "tahunan"
                  ? "🏆 TRANSFORMASI 365 HARI (HEMAT 17%)"
                  : packageType === "3bulan"
                    ? "🔥 REKOMENDASI HEALING 90 HARI (HEMAT 20%)"
                    : "🌿 RESET KETENANGAN 30 HARI"}
              </span>
              {packageType === "3bulan" && (
                <span className="rounded-full bg-amber-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-amber-800">
                  Coret Rp147.000 → Rp119.000
                </span>
              )}
              {packageType === "tahunan" && (
                <span className="rounded-full bg-violet-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-violet-800">
                  Coret Rp588.000 → Rp490.000
                </span>
              )}
            </div>

            <div className="mt-4 flex items-baseline gap-2">
              <span className="font-display text-4xl sm:text-5xl font-bold text-foreground">
                Rp{packageType === "tahunan"
                  ? "490.000"
                  : packageType === "3bulan"
                    ? "119.000"
                    : (settings?.premium_price ?? 49000).toLocaleString("id-ID")}
              </span>
              <span className="text-base text-muted-foreground">
                /{packageType === "tahunan" ? "tahun" : packageType === "3bulan" ? "3 bulan" : "bulan"}
              </span>
            </div>

            {packageType === "tahunan" ? (
              <p className="mt-1 text-xs text-muted-foreground">
                Investasi penuh ketahanan mental & kedamaian sepanjang tahun (Cuma Rp1.300-an/hari)
              </p>
            ) : packageType === "3bulan" ? (
              <p className="mt-1 text-xs text-muted-foreground">
                Durasi ideal psikologis untuk menyembuhkan pola emosi lama & habit baru (Setara Rp39.600/bln)
              </p>
            ) : (
              <p className="mt-1 text-xs text-muted-foreground">
                Langkah konsisten mengenali emosi & mengurai stres harian (Cuma Rp1.600-an/hari)
              </p>
            )}

            <ul className="mt-5 grid grid-cols-1 gap-2 sm:grid-cols-2">
              {(packageType === "tahunan" ? [
                { icon: "💬", label: "Curhat tanpa batas & semua Pendamping" },
                { icon: "📓", label: "Jurnal & Gratitude tanpa batas" },
                { icon: "📈", label: "Growth Dashboard & Grafik Lengkap" },
                { icon: "📊", label: "Daily & Weekly Insight Personal" },
                { icon: "🍎", label: "Emotional Eating Analysis" },
                { icon: "📖", label: "Riwayat 1 TAHUN PENUH tersimpan" },
                { icon: "📄", label: "Ekspor PDF Diary bergaya buku harian" },
                { icon: "✅", label: "Habit tracker tanpa batas" },
              ] : packageType === "3bulan" ? [
                { icon: "💬", label: "Curhat tanpa batas & semua Pendamping" },
                { icon: "📓", label: "Jurnal & Gratitude tanpa batas" },
                { icon: "📈", label: "Growth Dashboard & Grafik Lengkap 90 Hari" },
                { icon: "📊", label: "Daily & Weekly Insight Personal" },
                { icon: "🍎", label: "Emotional Eating Analysis" },
                { icon: "📖", label: "Riwayat 90 HARI PENUH tersimpan" },
                { icon: "📄", label: "Ekspor PDF Diary bergaya buku harian" },
                { icon: "✅", label: "Habit tracker tanpa batas" },
              ] : [
                { icon: "💬", label: "Curhat tanpa batas & semua Pendamping" },
                { icon: "📓", label: "Jurnal & Gratitude tanpa batas" },
                { icon: "📈", label: "Growth Dashboard & Grafik Lengkap" },
                { icon: "📊", label: "Daily & Weekly Insight Personal" },
                { icon: "🍎", label: "Emotional Eating Analysis" },
                { icon: "📂", label: "Riwayat tersimpan 3 bulan" },
                { icon: "📄", label: "Ekspor PDF Diary bergaya buku harian" },
                { icon: "✅", label: "Habit tracker tanpa batas" },
              ]).map((f) => (
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

            {/* Storage info callout */}
            <div className={`mt-4 flex items-start gap-2 rounded-xl px-3 py-2.5 ring-1 ${packageType === "tahunan" ? "bg-violet-50 ring-violet-200/80" : packageType === "3bulan" ? "bg-amber-50 ring-amber-200/80" : "bg-teal-50 ring-teal-200/60"}`}>
              <span className="text-base leading-none mt-0.5">{packageType === "tahunan" ? "📖" : "📒"}</span>
              <p className={`text-xs leading-snug ${packageType === "tahunan" ? "text-violet-800" : packageType === "3bulan" ? "text-amber-800" : "text-teal-800"}`}>
                {packageType === "tahunan"
                  ? <><span className="font-semibold">Riwayat disimpan 1 tahun penuh.</span> Ekspor kapan saja sebagai <strong>PDF Diary bergaya buku harian</strong> — kenangan indahmu tersimpan rapi & bisa dicetak seumur hidup.</>
                  : packageType === "3bulan"
                    ? <><span className="font-semibold">Riwayat disimpan 90 hari penuh.</span> Pantau transformasi emosimu selama 3 bulan dan ekspor sebagai <strong>PDF Diary bergaya buku harian</strong>.</>
                    : <><span className="font-semibold">Riwayat disimpan aman.</span> Data lebih lama bisa diekspor sebagai <strong>PDF Diary bergaya buku harian</strong> yang cantik & siap cetak.</>}
              </p>
            </div>

            {!activeOrder && (
              <button
                onClick={createOrder}
                disabled={creating}
                className="mt-6 w-full rounded-full bg-accent py-4 text-sm font-bold text-accent-foreground shadow-peach transition-all duration-300 hover:-translate-y-0.5 disabled:opacity-60"
              >
                {creating
                  ? "Membuat pesanan…"
                  : `Daftar ${
                      packageType === "tahunan"
                        ? "Program Pendampingan 1 Tahun"
                        : packageType === "3bulan"
                          ? "Program Pemulihan 90 Hari"
                          : "Program Reset 30 Hari"
                    } →`}
              </button>
            )}
            <p className="mt-3 text-center text-xs text-muted-foreground">
              {packageType === "tahunan" 
                ? "🏆 Cuma Rp1.300-an/hari — Pilihan terbaik & paling hemat!"
                : packageType === "3bulan"
                  ? "🔥 Cuma Rp1.300-an/hari (Setara Rp39.600/bln) — Rekomendasi Pemulihan Ideal!"
                  : "🌿 Cuma Rp1.600-an/hari — Praktis & fleksibel setiap bulan!"}
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
              { label: "Metode Pembayaran", value: "Mayar Payment Gateway" },
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
            <div className="flex gap-2">
              <button
                onClick={() => {
                  if (activeOrder.payment_link) {
                    window.location.href = activeOrder.payment_link;
                  } else {
                    createOrder();
                  }
                }}
                disabled={creating}
                className="flex-grow rounded-full bg-primary py-4 text-sm font-semibold text-primary-foreground shadow-peach transition-all duration-300 hover:-translate-y-0.5 disabled:opacity-60 text-center"
              >
                {creating ? "Memproses…" : activeOrder.payment_link ? "Lanjutkan Pembayaran →" : "Bayar Sekarang via Mayar →"}
              </button>
              <button
                onClick={async () => {
                  if (window.confirm("Apakah kamu yakin ingin membatalkan pembayaran ini untuk membuat yang baru?")) {
                    setCreating(true);
                    try {
                      const { error } = await supabase
                        .from("orders")
                        .update({ payment_status: "ditolak", admin_note: "Dibatalkan oleh pengguna" })
                        .eq("id", activeOrder.id);
                      if (error) throw error;
                      toast.success("Pembayaran berhasil dibatalkan. Silakan pilih paket baru.");
                    } catch (err: any) {
                      toast.error(err.message || "Gagal membatalkan pembayaran");
                    } finally {
                      setCreating(false);
                      qc.invalidateQueries({ queryKey: ["my-orders", user?.id] });
                    }
                  }
                }}
                disabled={creating}
                className="px-5 rounded-full border border-border bg-card text-muted-foreground text-xs font-semibold hover:text-foreground hover:bg-muted transition-all duration-300 disabled:opacity-60"
              >
                Batalkan
              </button>
            </div>
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
