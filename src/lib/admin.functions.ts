import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

async function assertAdmin(ctx: { supabase: { rpc: (fn: string, args: Record<string, unknown>) => Promise<{ data: boolean | null; error: unknown }> }; userId: string }) {
  const { data, error } = await ctx.supabase.rpc("has_role", { _user_id: ctx.userId, _role: "admin" });
  if (error || !data) throw new Error("Forbidden");
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
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: order } = await supabaseAdmin.from("orders").select("*").eq("id", data.orderId).single();
    if (!order) throw new Error("Order tidak ditemukan");

    if (data.approve) {
      const now = new Date();
      const end = new Date(now); end.setDate(end.getDate() + 30);
      await supabaseAdmin.from("orders").update({
        payment_status: "disetujui",
        verified_at: now.toISOString(),
        admin_note: data.note ?? null,
      }).eq("id", data.orderId);
      await supabaseAdmin.from("profiles").update({
        plan: "premium",
        premium_start_date: now.toISOString(),
        premium_end_date: end.toISOString(),
      }).eq("id", order.user_id);
    } else {
      await supabaseAdmin.from("orders").update({
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
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: profile } = await supabaseAdmin.from("profiles").select("id").eq("email", data.email).maybeSingle();
    if (!profile) throw new Error("User tidak ditemukan");
    await supabaseAdmin.from("user_roles").upsert({ user_id: profile.id, role: "admin" });
    return { ok: true };
  });

const SettingsInput = z.object({
  bank_name: z.string().min(1),
  bank_account_number: z.string().min(1),
  bank_account_holder: z.string().min(1),
  premium_price: z.number().int().positive(),
  free_chat_limit: z.number().int().positive(),
  crisis_disclaimer: z.string().min(1),
});

export const updateSettings = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => SettingsInput.parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await supabaseAdmin.from("app_settings").update(data).eq("id", 1);
    return { ok: true };
  });

const SuspendInput = z.object({ userId: z.string().uuid(), suspended: z.boolean() });
export const suspendUser = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => SuspendInput.parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await supabaseAdmin.from("profiles").update({ suspended: data.suspended }).eq("id", data.userId);
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
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    if (data.plan === "premium") {
      const start = new Date(); const end = new Date(start);
      end.setDate(end.getDate() + data.days);
      await supabaseAdmin.from("profiles").update({
        plan: "premium",
        premium_start_date: start.toISOString(),
        premium_end_date: end.toISOString(),
      }).eq("id", data.userId);
    } else {
      await supabaseAdmin.from("profiles").update({
        plan: "free",
        premium_end_date: new Date().toISOString(),
      }).eq("id", data.userId);
    }
    return { ok: true };
  });
