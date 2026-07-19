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
      } else if (order.package_name === "Premium Mingguan") {
        end.setDate(end.getDate() + 7);
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

const DemoteInput = z.object({ userId: z.string().uuid() });

export const demoteFromAdmin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => DemoteInput.parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    // Prevent self-demotion
    if (data.userId === context.userId) throw new Error("Tidak bisa mencopot peran admin diri sendiri");
    const client = await getClient(context);
    await client.from("user_roles").delete().eq("user_id", data.userId).eq("role", "admin");
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

const GetUsersInput = z.object({
  q: z.string().optional(),
  filter: z.enum(["all", "free", "premium"]),
});

export const getAdminUsers = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => GetUsersInput.parse(d))
  .handler(async ({ data: { q, filter }, context }) => {
    await assertAdmin(context);
    const client = await getClient(context);

    let qb = client.from("profiles").select("*").order("created_at", { ascending: false }).limit(200);
    if (filter !== "all") qb = qb.eq("plan", filter);
    if (q) qb = qb.or(`email.ilike.%${q}%,name.ilike.%${q}%`);

    const getLocalDateString = (d: Date) => {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    const fetchStats = async () => {
      try {
        const res = await client.from("user_message_stats").select("*");
        return res;
      } catch {
        return { data: [] };
      }
    };

    const fetchAdmins = async () => {
      try {
        const res = await client.from("user_roles").select("user_id").eq("role", "admin");
        return res;
      } catch {
        return { data: [] };
      }
    };

    const fetchMoodStats = async () => {
      try {
        const thirtyDaysAgo = getLocalDateString(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000));
        const res = await client.from("mood_checkins")
          .select("user_id, mood_score, stress_score, date, triggers")
          .gte("date", thirtyDaysAgo);
        return res;
      } catch {
        return { data: [] };
      }
    };

    const fetchJournals = async () => {
      try {
        const thirtyDaysAgo = getLocalDateString(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000));
        const res = await client.from("journals")
          .select("user_id, id")
          .gte("date", thirtyDaysAgo);
        return res;
      } catch {
        return { data: [] };
      }
    };

    const fetchGratitudes = async () => {
      try {
        const thirtyDaysAgo = getLocalDateString(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000));
        const res = await client.from("gratitude_entries")
          .select("user_id, id")
          .gte("date", thirtyDaysAgo);
        return res;
      } catch {
        return { data: [] };
      }
    };

    const fetchEatings = async () => {
      try {
        const thirtyDaysAgo = getLocalDateString(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000));
        const res = await client.from("emotional_eating_logs")
          .select("user_id, id")
          .gte("date", thirtyDaysAgo);
        return res;
      } catch {
        return { data: [] };
      }
    };

    const [profilesRes, statsRes, adminsRes, moodStatsRes, journalsRes, gratitudesRes, eatingsRes] = await Promise.all([
      qb,
      fetchStats(),
      fetchAdmins(),
      fetchMoodStats(),
      fetchJournals(),
      fetchGratitudes(),
      fetchEatings(),
    ]);

    const profiles = profilesRes.data ?? [];
    const statsMap = new Map((statsRes.data ?? []).map((s: any) => [s.user_id, s.total_replies]));
    const adminSet = new Set((adminsRes.data ?? []).map((a: any) => a.user_id));

    const moodsMap = new Map<string, Array<{ mood_score: number; stress_score: number; date: string; triggers: string[] | null }>>();
    (moodStatsRes.data ?? []).forEach((m: any) => {
      if (!moodsMap.has(m.user_id)) {
        moodsMap.set(m.user_id, []);
      }
      moodsMap.get(m.user_id)!.push(m);
    });

    const journalsMap = new Map<string, number>();
    (journalsRes.data ?? []).forEach((j: any) => {
      journalsMap.set(j.user_id, (journalsMap.get(j.user_id) ?? 0) + 1);
    });

    const gratitudesMap = new Map<string, number>();
    (gratitudesRes.data ?? []).forEach((g: any) => {
      gratitudesMap.set(g.user_id, (gratitudesMap.get(g.user_id) ?? 0) + 1);
    });

    const eatingsMap = new Map<string, number>();
    (eatingsRes.data ?? []).forEach((e: any) => {
      eatingsMap.set(e.user_id, (eatingsMap.get(e.user_id) ?? 0) + 1);
    });

    const sevenDaysAgoStr = getLocalDateString(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000));

    return profiles.map((p: any) => {
      const userMoods = moodsMap.get(p.id) ?? [];
      const totalCheckins = userMoods.length;
      let trendText = "Belum cukup data";
      let trendColor = "text-stone-500 bg-stone-100/60 border border-stone-200/40";
      let avgMood30 = 0;

      if (totalCheckins > 0) {
        const sumMood = userMoods.reduce((sum, item) => sum + item.mood_score, 0);
        avgMood30 = Number((sumMood / totalCheckins).toFixed(1));

        const recentMoods = userMoods.filter((m) => m.date >= sevenDaysAgoStr);
        const olderMoods = userMoods.filter((m) => m.date < sevenDaysAgoStr);

        if (recentMoods.length > 0 && olderMoods.length > 0) {
          const avgRecent = recentMoods.reduce((sum, item) => sum + item.mood_score, 0) / recentMoods.length;
          const avgOlder = olderMoods.reduce((sum, item) => sum + item.mood_score, 0) / olderMoods.length;

          const diff = avgRecent - avgOlder;
          if (diff >= 0.5) {
            trendText = `↗️ Membaik (+${diff.toFixed(1)})`;
            trendColor = "text-emerald-700 bg-emerald-50 border border-emerald-100/60";
          } else if (diff <= -0.5) {
            trendText = `↘️ Menurun (${diff.toFixed(1)})`;
            trendColor = "text-red-700 bg-red-50 border border-red-100/60";
          } else {
            trendText = `➡️ Stabil (${diff >= 0 ? "+" : ""}${diff.toFixed(1)})`;
            trendColor = "text-amber-700 bg-amber-50 border border-amber-100/60";
          }
        } else if (recentMoods.length > 0) {
          trendText = "Baru Check-in (Stabil)";
          trendColor = "text-blue-700 bg-blue-50 border border-blue-100/60";
        }
      }

      const userTriggers: Record<string, number> = {};
      userMoods.forEach((m) => {
        m.triggers?.forEach((t) => {
          userTriggers[t] = (userTriggers[t] ?? 0) + 1;
        });
      });

      const sortedTriggers = Object.entries(userTriggers)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([t, count]) => {
          const pct = totalCheckins ? Math.round((count / totalCheckins) * 100) : 0;
          return `${t} (${count}× dari ${totalCheckins} [${pct}%])`;
        });

      const topTriggersText = sortedTriggers.length > 0 ? sortedTriggers.join(", ") : "Tidak ada";

      return {
        ...p,
        total_replies: statsMap.get(p.id) ?? 0,
        is_admin: adminSet.has(p.id),
        total_checkins: totalCheckins,
        avg_mood_30: avgMood30,
        trend_text: trendText,
        trend_color: trendColor,
        total_journals: journalsMap.get(p.id) ?? 0,
        total_gratitudes: gratitudesMap.get(p.id) ?? 0,
        total_eatings: eatingsMap.get(p.id) ?? 0,
        top_triggers_text: topTriggersText,
      };
    });
  });

const GetAnalyticsInput = z.object({
  timeRange: z.enum(["7", "30", "90", "all"]),
});

export const getAdminAnalytics = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => GetAnalyticsInput.parse(d))
  .handler(async ({ data: { timeRange }, context }) => {
    await assertAdmin(context);
    const client = await getClient(context);

    let filterDate: string | null = null;
    if (timeRange !== "all") {
      const d = new Date();
      d.setDate(d.getDate() - parseInt(timeRange));
      filterDate = d.toISOString().slice(0, 10);
    }

    const fetchFeedback = async () => {
      try {
        let q = client.from("calm_feedback_logs").select("*");
        if (filterDate) {
          q = q.gte("created_at", filterDate);
        }
        const res = await q;
        return res;
      } catch {
        return { data: [] };
      }
    };

    let moodQuery = client.from("mood_checkins").select("mood, triggers, user_id, date, mood_score, stress_score, energy_score");
    let journalQuery = client.from("journals").select("id", { count: "exact", head: true });
    let habitQuery = client.from("habit_logs").select("id", { count: "exact", head: true }).eq("completed", true);
    let eatingQuery = client.from("emotional_eating_logs").select("hunger_type, emotion, trigger");
    let chatQuery = client.from("chats").select("companion_key");
    let msgQuery = client.from("messages").select("id", { count: "exact", head: true }).eq("role", "assistant");
    let journalizerQuery = client.from("journals").select("id", { count: "exact", head: true }).in("source", ["from_chat", "chat"]);

    if (filterDate) {
      moodQuery = moodQuery.gte("date", filterDate);
      journalQuery = journalQuery.gte("date", filterDate);
      habitQuery = habitQuery.gte("date", filterDate);
      eatingQuery = eatingQuery.gte("date", filterDate);
      chatQuery = chatQuery.gte("created_at", filterDate);
      msgQuery = msgQuery.gte("created_at", filterDate);
      journalizerQuery = journalizerQuery.gte("date", filterDate);
    }

    const [moods, journals, habits, eating, chats, totalMsgs, feedbackRes, chatJournals] = await Promise.all([
      moodQuery,
      journalQuery,
      habitQuery,
      eatingQuery,
      chatQuery,
      msgQuery,
      fetchFeedback(),
      journalizerQuery
    ]);

    const MOOD_RESOLUTIONS: Record<string, any> = {
      bahagia: { name: "Bahagia", color: "bg-emerald-500", text: "text-emerald-500" },
      tenang: { name: "Tenang", color: "bg-teal-500", text: "text-teal-500" },
      sedih: { name: "Sedih", color: "bg-blue-500", text: "text-blue-500" },
      cemas: { name: "Cemas", color: "bg-amber-500", text: "text-amber-500" },
      marah: { name: "Marah", color: "bg-rose-500", text: "text-rose-500" },
      kesepian: { name: "Kesepian", color: "bg-indigo-500", text: "text-indigo-500" },
      burnout: { name: "Burnout", color: "bg-violet-500", text: "text-violet-500" },
      stres: { name: "Stres", color: "bg-orange-500", text: "text-orange-500" },
      lelah: { name: "Lelah", color: "bg-stone-500", text: "text-stone-500" },
    };

    const moodCount: Record<string, number> = {};
    const triggerCount: Record<string, number> = {};
    const moodTriggers: Record<string, Record<string, number>> = {};

    const moodUsers: Record<string, Set<string>> = {};
    const moodTotalCount: Record<string, number> = {};

    (moods.data as any[])?.forEach((m: any) => {
      moodCount[m.mood] = (moodCount[m.mood] ?? 0) + 1;
      if (!moodTriggers[m.mood]) moodTriggers[m.mood] = {};
      m.triggers?.forEach((t: any) => {
        triggerCount[t] = (triggerCount[t] ?? 0) + 1;
        moodTriggers[m.mood][t] = (moodTriggers[m.mood][t] ?? 0) + 1;
      });
    });

    (moods.data as any[])?.forEach((m: any) => {
      if (!moodUsers[m.mood]) moodUsers[m.mood] = new Set();
      moodUsers[m.mood].add(m.user_id);
      moodTotalCount[m.mood] = (moodTotalCount[m.mood] ?? 0) + 1;
    });

    const moodStats30Days: Record<string, { uniqueUsers: number; avgFrequency: number }> = {};
    Object.keys(MOOD_RESOLUTIONS).forEach((moodKey) => {
      const uniqueCount = moodUsers[moodKey]?.size ?? 0;
      const totalCount = moodTotalCount[moodKey] ?? 0;
      moodStats30Days[moodKey] = {
        uniqueUsers: uniqueCount,
        avgFrequency: uniqueCount > 0 ? Number((totalCount / uniqueCount).toFixed(1)) : 0
      };
    });

    const companionCount: Record<string, number> = {};
    (chats.data as any[])?.forEach((c: any) => {
      const key = c.companion_key || "sahabat";
      companionCount[key] = (companionCount[key] ?? 0) + 1;
    });

    const hungerCount: Record<string, number> = {};
    (eating.data as any[])?.forEach((e: any) => {
      if (e.hunger_type) {
        hungerCount[e.hunger_type] = (hungerCount[e.hunger_type] ?? 0) + 1;
      }
    });

    const feedbackLogs = feedbackRes.data ?? [];
    const totalFeedbacks = feedbackLogs.length;
    const helpfulFeedbacks = feedbackLogs.filter((f: any) => f.is_helpful).length;
    const uniqueUsersHelped = new Set(
      feedbackLogs.filter((f: any) => f.is_helpful).map((f: any) => f.user_id)
    ).size;

    const exerciseEfficacy: Record<string, { total: number; helpful: number; pct: number }> = {};
    feedbackLogs.forEach((f: any) => {
      if (!exerciseEfficacy[f.exercise_key]) {
        exerciseEfficacy[f.exercise_key] = { total: 0, helpful: 0, pct: 0 };
      }
      exerciseEfficacy[f.exercise_key].total += 1;
      if (f.is_helpful) {
        exerciseEfficacy[f.exercise_key].helpful += 1;
      }
    });

    Object.keys(exerciseEfficacy).forEach((key) => {
      const item = exerciseEfficacy[key];
      item.pct = item.total > 0 ? Math.round((item.helpful / item.total) * 100) : 0;
    });

    const moodCalmEfficacy: Record<string, Record<string, { total: number; helpful: number }>> = {};
    const userMoodByDate: Record<string, Record<string, string>> = {};

    (moods.data as any[])?.forEach((m: any) => {
      if (m.user_id && m.date && m.mood) {
        if (!userMoodByDate[m.user_id]) {
          userMoodByDate[m.user_id] = {};
        }
        userMoodByDate[m.user_id][m.date] = m.mood;
      }
    });

    feedbackLogs.forEach((f: any) => {
      if (f.user_id && f.created_at && f.exercise_key) {
        const feedbackDateStr = f.created_at.slice(0, 10);
        const userMood = userMoodByDate[f.user_id]?.[feedbackDateStr];

        if (userMood) {
          if (!moodCalmEfficacy[userMood]) {
            moodCalmEfficacy[userMood] = {};
          }
          if (!moodCalmEfficacy[userMood][f.exercise_key]) {
            moodCalmEfficacy[userMood][f.exercise_key] = { total: 0, helpful: 0 };
          }
          const stats = moodCalmEfficacy[userMood][f.exercise_key];
          stats.total += 1;
          if (f.is_helpful) {
            stats.helpful += 1;
          }
        }
      }
    });

    return {
      moodCount, triggerCount, companionCount, hungerCount, moodTriggers, moodStats30Days, moodCalmEfficacy,
      moodsRaw: moods.data ?? [],
      feedbackLogsRaw: feedbackRes.data ?? [],
      journalCount: journals.count ?? 0,
      habitCompletions: habits.count ?? 0,
      eatingCount: eating.data?.length ?? 0,
      aiReplyCount: totalMsgs.count ?? 0,
      chatJournalCount: chatJournals.count ?? 0,
      feedbackStats: {
        total: totalFeedbacks,
        helpful: helpfulFeedbacks,
        uniqueHelpedCount: uniqueUsersHelped,
        overallPct: totalFeedbacks > 0 ? Math.round((helpfulFeedbacks / totalFeedbacks) * 100) : 0,
        efficacy: exerciseEfficacy
      }
    };
  });

