import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

function generateCode() {
  const chars = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
  let res = "";
  for (let i = 0; i < 6; i++) {
    res += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `BM-${res}`;
}

// 1. Validate referral code (used before checkout)
const ValidateCodeInput = z.object({
  code: z.string().min(3).max(30),
});

export const validateReferralCode = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => ValidateCodeInput.parse(d))
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const userId = context.userId;
    const cleanCode = data.code.trim().toUpperCase();

    // Check if code exists
    const { data: referrer, error } = await supabaseAdmin
      .from("profiles")
      .select("id, name, referral_code")
      .eq("referral_code", cleanCode)
      .maybeSingle();

    if (error || !referrer) {
      return { valid: false, message: "Kode referral tidak ditemukan atau tidak valid" };
    }

    if (referrer.id === userId) {
      return { valid: false, message: "Kamu tidak bisa menggunakan kode referral milikmu sendiri" };
    }

    return {
      valid: true,
      referralCode: referrer.referral_code,
      discountPercent: 5,
      message: "Kode referral berhasil diterapkan! Kamu mendapatkan potongan harga 5%.",
    };
  });

// 2. Get dashboard data for the authenticated user
export const getReferralDashboard = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const userId = context.userId;

    // 1. Ensure user has a referral code
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("id, referral_code, name")
      .eq("id", userId)
      .maybeSingle();

    let myCode = profile?.referral_code;
    if (!myCode) {
      myCode = generateCode();
      await supabaseAdmin.from("profiles").update({ referral_code: myCode }).eq("id", userId);
    }

    // 2. Fetch app settings for commission rate
    const { data: settings } = await supabaseAdmin
      .from("app_settings")
      .select("referral_commission_percent")
      .eq("id", 1)
      .maybeSingle();

    const commissionPercent = settings?.referral_commission_percent ?? 15;

    // 3. Fetch orders where this user is the referrer
    const { data: referredOrders } = await supabaseAdmin
      .from("orders")
      .select("id, order_number, package_name, amount, payment_status, commission_amount, commission_status, created_at, verified_at")
      .eq("referrer_id", userId)
      .order("created_at", { ascending: false });

    // 4. Fetch payout requests
    const { data: payouts } = await supabaseAdmin
      .from("referral_payouts")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    // 5. Calculate statistics
    const ordersList: any[] = referredOrders ?? [];
    const payoutsList: any[] = payouts ?? [];

    const successfulOrders = ordersList.filter((o: any) => o.payment_status === "disetujui");
    const totalReferredCount = successfulOrders.length;

    // Commission that is earned and confirmed
    const totalCommissionEarned = ordersList
      .filter((o: any) => o.payment_status === "disetujui" && (o.commission_status === "approved" || o.commission_status === "paid"))
      .reduce((sum: number, o: any) => sum + (o.commission_amount || 0), 0);

    // Potential commission from pending orders
    const pendingCommission = ordersList
      .filter((o: any) => o.payment_status === "menunggu_pembayaran" || o.payment_status === "menunggu_verifikasi")
      .reduce((sum: number, o: any) => sum + (o.commission_amount || 0), 0);

    // Withdrawn or requested payouts
    const totalPaidPayouts = payoutsList
      .filter((p: any) => p.status === "selesai")
      .reduce((sum: number, p: any) => sum + p.amount, 0);

    const pendingPayouts = payoutsList
      .filter((p: any) => p.status === "menunggu_transfer")
      .reduce((sum: number, p: any) => sum + p.amount, 0);

    const availableBalance = Math.max(0, totalCommissionEarned - (totalPaidPayouts + pendingPayouts));

    // Anonymized order list for privacy protection
    const anonymizedOrders = ordersList.map((o: any) => {
      // Create pseudonymous ID from last 4 digits of order number
      const pseudoId = o.order_number ? o.order_number.slice(-4) : "User";
      return {
        id: o.id,
        pseudoName: `Pejuang Tenang #${pseudoId}`,
        packageName: o.package_name,
        commissionAmount: o.commission_amount,
        commissionStatus: o.commission_status,
        paymentStatus: o.payment_status,
        createdAt: o.created_at,
      };
    });

    return {
      referralCode: myCode,
      commissionPercent,
      stats: {
        totalReferredCount,
        totalCommissionEarned,
        pendingCommission,
        availableBalance,
        totalPaidPayouts,
        pendingPayouts,
      },
      orders: anonymizedOrders,
      payouts: payoutsList,
    };
  });

// 3. Request a commission payout
const RequestPayoutInput = z.object({
  amount: z.number().min(50000, "Minimal penarikan adalah Rp 50.000"),
  bankName: z.string().min(2, "Nama Bank / e-Wallet wajib diisi"),
  accountNumber: z.string().min(5, "Nomor rekening wajib diisi"),
  accountName: z.string().min(3, "Nama pemilik rekening wajib diisi"),
});

export const requestReferralPayout = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => RequestPayoutInput.parse(d))
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const userId = context.userId;

    // Calculate available balance to verify
    const { data: referredOrders } = await supabaseAdmin
      .from("orders")
      .select("commission_amount, payment_status, commission_status")
      .eq("referrer_id", userId);

    const { data: payouts } = await supabaseAdmin
      .from("referral_payouts")
      .select("amount, status")
      .eq("user_id", userId);

    const totalCommissionEarned = ((referredOrders as any[]) ?? [])
      .filter((o: any) => o.payment_status === "disetujui" && (o.commission_status === "approved" || o.commission_status === "paid"))
      .reduce((sum: number, o: any) => sum + (o.commission_amount || 0), 0);

    const totalRequested = ((payouts as any[]) ?? [])
      .filter((p: any) => p.status === "selesai" || p.status === "menunggu_transfer")
      .reduce((sum: number, p: any) => sum + p.amount, 0);

    const availableBalance = Math.max(0, totalCommissionEarned - totalRequested);

    if (data.amount > availableBalance) {
      throw new Error(`Saldo komisi tersedia tidak mencukupi. Saldo kamu: Rp ${availableBalance.toLocaleString("id-ID")}`);
    }

    // Insert payout request
    const { data: newPayout, error } = await supabaseAdmin
      .from("referral_payouts")
      .insert({
        user_id: userId,
        amount: data.amount,
        bank_name: data.bankName,
        account_number: data.accountNumber,
        account_name: data.accountName,
        status: "menunggu_transfer",
      })
      .select("*")
      .single();

    if (error || !newPayout) {
      throw new Error(`Gagal membuat pengajuan penarikan: ${error?.message}`);
    }

    return { success: true, payout: newPayout };
  });

// 4. Admin payout management
const ProcessPayoutInput = z.object({
  payoutId: z.string().uuid(),
  action: z.enum(["approve", "reject"]),
  note: z.string().max(300).optional(),
});

export const adminProcessPayout = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => ProcessPayoutInput.parse(d))
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    
    // Check if user is admin
    const { data: roleData } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", context.userId)
      .eq("role", "admin")
      .maybeSingle();

    if (!roleData) {
      throw new Error("Akses ditolak: Hanya admin yang dapat memproses penarikan");
    }

    const newStatus = data.action === "approve" ? "selesai" : "ditolak";
    const now = new Date().toISOString();

    const { error } = await supabaseAdmin
      .from("referral_payouts")
      .update({
        status: newStatus,
        admin_note: data.note || (data.action === "approve" ? "Dana telah berhasil ditransfer" : "Pengajuan penarikan ditolak"),
        processed_at: now,
      })
      .eq("id", data.payoutId);

    if (error) {
      throw new Error(`Gagal memproses penarikan: ${error.message}`);
    }

    return { success: true };
  });
