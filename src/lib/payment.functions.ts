import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";
import { createMayarPaymentLink } from "./mayar.server";

function makeOrderNumber() {
  const d = new Date();
  const ymd = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
  const rand = Math.floor(Math.random() * 90000) + 10000;
  return `JN-${ymd}-${rand}`;
}

const CreatePaymentInput = z.object({
  redirectUrl: z.string().url(),
  packageType: z.enum(["bulanan", "3bulan", "tahunan"]).default("bulanan"),
  referralCode: z.string().optional(),
});

export const createPayment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => CreatePaymentInput.parse(d))
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const userId = context.userId;

    // 1. Fetch user's profile and check if they exist
    const { data: profile, error: profileErr } = await supabaseAdmin
      .from("profiles")
      .select("name, email, phone")
      .eq("id", userId)
      .maybeSingle();

    if (profileErr || !profile) {
      throw new Error("Profile tidak ditemukan");
    }

    const email = profile.email || context.claims.email || "";
    if (!email) {
      throw new Error("Email user tidak valid");
    }

    // 2. Fetch app settings to get premium price for monthly & referral commission rate
    const { data: settings } = await supabaseAdmin
      .from("app_settings")
      .select("premium_price, referral_commission_percent")
      .eq("id", 1)
      .maybeSingle();
      
    let amount = settings?.premium_price ?? 49000;
    let packageName = "Program Reset Ketenangan (1 Bulan)";

    if (data.packageType === "tahunan") {
      amount = 490000; // Rp490.000 for Annual
      packageName = "Program Pendampingan Utuh (1 Tahun)";
    } else if (data.packageType === "3bulan") {
      amount = 119000; // Rp119.000 for 3 Months (Save 20%)
      packageName = "Program Pemulihan Utuh (90 Hari)";
    }

    // 2b. Check and validate referral code & apply 5% discount for buyer
    let referrerId: string | null = null;
    let validReferralCode: string | null = null;
    let commissionAmount = 0;

    if (data.referralCode && data.referralCode.trim()) {
      const cleanCode = data.referralCode.trim().toUpperCase();
      const { data: referrer } = await supabaseAdmin
        .from("profiles")
        .select("id")
        .eq("referral_code", cleanCode)
        .maybeSingle();

      if (referrer && referrer.id !== userId) {
        referrerId = referrer.id;
        validReferralCode = cleanCode;
        // Apply 5% discount for buyer
        const discountPercent = settings?.referral_discount_percent ?? 5;
        const discountAmount = Math.round((amount * discountPercent) / 100);
        amount = Math.max(1000, amount - discountAmount);
        
        const commissionPercent = settings?.referral_commission_percent ?? 15;
        commissionAmount = Math.round((amount * commissionPercent) / 100);
      }
    }

    // 3. Cancel any existing pending orders for this package to avoid duplicate payment links and force a fresh invoice
    await supabaseAdmin
      .from("orders")
      .update({ payment_status: "ditolak", admin_note: "Dibatalkan karena meminta link baru" })
      .eq("user_id", userId)
      .eq("payment_status", "menunggu_pembayaran")
      .eq("package_name", packageName);

    // 4. Create a new order in "menunggu_pembayaran" status
    const orderNumber = makeOrderNumber();
    const { data: newOrder, error: orderErr } = await supabaseAdmin
      .from("orders")
      .insert({
        order_number: orderNumber,
        user_id: userId,
        amount: amount,
        package_name: packageName,
        payment_method: "mayar",
        payment_status: "menunggu_pembayaran",
        referrer_id: referrerId,
        referral_code: validReferralCode,
        commission_amount: commissionAmount,
        commission_status: referrerId ? "pending" : "none",
      })
      .select("*")
      .single();

    if (orderErr || !newOrder) {
      throw new Error(`Gagal membuat pesanan: ${orderErr?.message}`);
    }

    try {
      // 5. Create payment request on Mayar
      const description = `Upgrade JN-CALM ${packageName} - ${orderNumber}`;
      const paymentData = await createMayarPaymentLink({
        name: profile.name || email.split("@")[0],
        email: email,
        amount: amount,
        phone: profile.phone,
        redirectUrl: data.redirectUrl,
        description: description,
        orderNumber: orderNumber,
        orderId: newOrder.id,
      });

      // 6. Update order with payment link and transaction details
      await supabaseAdmin
        .from("orders")
        .update({
          payment_link: paymentData.link,
          payment_link_id: paymentData.id,
          transaction_id: paymentData.transactionId || paymentData.transaction_id,
        })
        .eq("id", newOrder.id);

      return { paymentLink: paymentData.link };
    } catch (apiErr) {
      // Clean up the created order if Mayar API request fails
      await supabaseAdmin.from("orders").delete().eq("id", newOrder.id);
      throw apiErr;
    }
  });
