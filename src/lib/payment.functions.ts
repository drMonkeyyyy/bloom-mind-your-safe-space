import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";
import { createMayarPaymentLink } from "./mayar.server";

function makeOrderNumber() {
  const d = new Date();
  const ymd = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
  const rand = Math.floor(Math.random() * 90000) + 10000;
  return `BM-${ymd}-${rand}`;
}

const CreatePaymentInput = z.object({
  redirectUrl: z.string().url(),
  packageType: z.enum(["mingguan", "bulanan", "tahunan"]).default("bulanan"),
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

    // 2. Fetch app settings to get premium price for monthly, set yearly manually
    const { data: settings } = await supabaseAdmin
      .from("app_settings")
      .select("premium_price")
      .eq("id", 1)
      .maybeSingle();
      
    let amount = settings?.premium_price ?? 49000;
    let packageName = "Premium Bulanan";

    if (data.packageType === "tahunan") {
      amount = 490000; // Rp490.000 for Annual
      packageName = "Premium Tahunan";
    } else if (data.packageType === "mingguan") {
      amount = 15000; // Rp15.000 for Weekly
      packageName = "Premium Mingguan";
    }

    // 3. Check if there is an existing pending order with a valid payment link for the same package
    const { data: existingOrder } = await supabaseAdmin
      .from("orders")
      .select("*")
      .eq("user_id", userId)
      .eq("payment_status", "menunggu_pembayaran")
      .eq("payment_method", "mayar")
      .eq("package_name", packageName)
      .not("payment_link", "is", null)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (existingOrder && existingOrder.payment_link) {
      return { paymentLink: existingOrder.payment_link };
    }

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
