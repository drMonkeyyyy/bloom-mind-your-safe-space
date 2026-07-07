import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

async function assertAdmin(ctx: { userId: string; supabase: any }) {
  const { data } = await ctx.supabase.from("user_roles").select("role").eq("user_id", ctx.userId).eq("role", "admin").maybeSingle();
  if (!data) throw new Error("Forbidden");
}

async function getClient(ctx: { supabase: any }) {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (serviceKey) {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    return supabaseAdmin;
  }
  return ctx.supabase;
}

const ApproveInput = z.object({
  orderId: z.string().uuid(),
  approve: z.boolean(),
  note: z.string().max(500).optional(),
});

export const verifyOrder = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => ApproveInput.parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const client = await getClient(context);
    const { data: order } = await client.from("orders").select("*").eq("id", data.orderId).single();
    if (!order) throw new Error("Order tidak ditemukan");

    if (data.approve) {
      const now = new Date();
      const end = new Date(now);
      if (order.package_name === "Premium Tahunan") {
        end.setDate(end.getDate() + 365);
      } else {
        end.setDate(end.getDate() + 30);
      }
      await client.from("orders").update({
        payment_status: "disetujui",
        verified_at: now.toISOString(),
        admin_note: data.note ?? null,
      }).eq("id", data.orderId);
      await client.from("profiles").update({
        plan: "premium",
        premium_start_date: now.toISOString(),
        premium_end_date: end.toISOString(),
      }).eq("id", order.user_id);
    } else {
      await client.from("orders").update({
        payment_status: "ditolak",
        admin_note: data.note ?? "Bukti transfer tidak valid",
      }).eq("id", data.orderId);
    }
    return { ok: true };
  });

const PromoteInput = z.object({ email: z.string().email() });

export const promoteToAdmin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => PromoteInput.parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const client = await getClient(context);
    const { data: profile } = await client.from("profiles").select("id").eq("email", data.email).maybeSingle();
    if (!profile) throw new Error("User tidak ditemukan");
    await client.from("user_roles").upsert({ user_id: profile.id, role: "admin" });
    return { ok: true };
  });

const SettingsInput = z.object({
  bank_name: z.string().optional(),
  bank_account_number: z.string().optional(),
  bank_account_holder: z.string().optional(),
  premium_price: z.number().int().positive(),
  free_chat_limit: z.number().int().positive(),
  crisis_disclaimer: z.string().min(1),
});

export const updateSettings = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => SettingsInput.parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const client = await getClient(context);
    await client.from("app_settings").update(data).eq("id", 1);
    return { ok: true };
  });

const SuspendInput = z.object({ userId: z.string().uuid(), suspended: z.boolean() });
export const suspendUser = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => SuspendInput.parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const client = await getClient(context);
    await client.from("profiles").update({ suspended: data.suspended }).eq("id", data.userId);
    return { ok: true };
  });

const SetPlanInput = z.object({
  userId: z.string().uuid(),
  plan: z.enum(["free", "premium"]),
  days: z.number().int().min(0).max(365).default(30),
});
export const setUserPlan = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => SetPlanInput.parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const client = await getClient(context);
    if (data.plan === "premium") {
      const start = new Date(); const end = new Date(start);
      end.setDate(end.getDate() + data.days);
      await client.from("profiles").update({
        plan: "premium",
        premium_start_date: start.toISOString(),
        premium_end_date: end.toISOString(),
      }).eq("id", data.userId);
    } else {
      await client.from("profiles").update({
        plan: "free",
        premium_end_date: new Date().toISOString(),
      }).eq("id", data.userId);
    }
    return { ok: true };
  });
