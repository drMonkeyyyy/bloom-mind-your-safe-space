import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useServerFn } from "@tanstack/react-start";
import { promoteToAdmin, demoteFromAdmin, suspendUser, setUserPlan } from "@/lib/admin.functions";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/admin/users")({
  component: Page,
});

function Page() {
  const { user: currentUser } = useAuth();
  const qc = useQueryClient();
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<"all" | "free" | "premium">("all");
  const promote = useServerFn(promoteToAdmin);
  const demote = useServerFn(demoteFromAdmin);
  const suspend = useServerFn(suspendUser);
  const setPlan = useServerFn(setUserPlan);

  const { data: users } = useQuery({
    queryKey: ["admin-users", q, filter],
    queryFn: async () => {
      let qb = supabase.from("profiles").select("*").order("created_at", { ascending: false }).limit(200);
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
          const res = await supabase.from("user_message_stats" as any).select("*");
          return res;
        } catch {
          return { data: [] };
        }
      };

      const fetchAdmins = async () => {
        try {
          const res = await supabase.from("user_roles").select("user_id").eq("role", "admin");
          return res;
        } catch {
          return { data: [] };
        }
      };

      const fetchMoodStats = async () => {
        try {
          const thirtyDaysAgo = getLocalDateString(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000));
          const res = await supabase.from("mood_checkins")
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
          const res = await supabase.from("journals")
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
          const res = await supabase.from("gratitude_entries")
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
          const res = await supabase.from("emotional_eating_logs")
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
    },
  });

  const [promoteEmail, setPromoteEmail] = useState("");
  const doPromote = async () => {
    try {
      await promote({ data: { email: promoteEmail } });
      toast.success("✅ Berhasil dipromosikan ke admin.");
      setPromoteEmail("");
      qc.invalidateQueries({ queryKey: ["admin-users"] });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Gagal");
    }
  };

  const doDemote = async (userId: string, name: string) => {
    if (!confirm(`Yakin ingin mencabut peran admin dari "${name}"? Mereka akan kembali menjadi member biasa.`)) return;
    try {
      await demote({ data: { userId } });
      toast.success(`✅ Peran admin "${name}" berhasil dicabut.`);
      qc.invalidateQueries({ queryKey: ["admin-users"] });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Gagal mencabut admin");
    }
  };

  return (
    <div className="space-y-5">
      <h1 className="font-display text-3xl font-semibold">User Management</h1>

      {/* Promote to admin section */}
      <section className="rounded-3xl bg-card p-4 ring-1 ring-border space-y-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Promosikan ke Admin</p>
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            value={promoteEmail}
            onChange={(e) => setPromoteEmail(e.target.value)}
            placeholder="Email user untuk dijadikan admin"
            className="flex-1 rounded-2xl border border-border bg-background px-3 py-2 text-sm"
          />
          <button
            onClick={doPromote}
            className="rounded-full bg-foreground px-4 py-2 text-sm font-semibold text-cream hover:opacity-80 transition-opacity"
          >
            Promote ke admin
          </button>
        </div>
        <p className="text-xs text-muted-foreground">
          ⚠️ Admin memiliki akses penuh ke panel ini. Gunakan dengan hati-hati.
        </p>
      </section>

      {/* Search & Filter */}
      <div className="flex flex-wrap gap-2">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Cari nama/email"
          className="flex-1 rounded-2xl border border-border bg-card px-3 py-2 text-sm"
        />
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as "all" | "free" | "premium")}
          className="rounded-2xl border border-border bg-card px-3 py-2 text-sm"
        >
          <option value="all">Semua</option>
          <option value="free">Free</option>
          <option value="premium">Premium</option>
        </select>
      </div>

      {/* User list */}
      <div className="space-y-2">
        {users?.map((u: any) => (
          <div key={u.id} className="rounded-2xl bg-card p-4 ring-1 ring-border">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="truncate text-sm font-semibold">
                    {u.name ?? "(tanpa nama)"}
                  </p>
                  {u.suspended && (
                    <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-600">SUSPENDED</span>
                  )}
                  {u.is_admin && (
                    <span className="rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-bold text-violet-700">👑 ADMIN</span>
                  )}
                </div>
                <p className="truncate text-xs text-muted-foreground">{u.email}</p>
              </div>
              <div className="flex flex-col items-end gap-1 shrink-0">
                <span className={`rounded-full px-3 py-1 text-xs capitalize font-semibold ${u.plan === "premium" ? "bg-accent-soft text-accent-foreground" : "bg-cream-deep text-muted-foreground"}`}>
                  {u.plan === "premium" 
                    ? (() => {
                        if (!u.premium_end_date || !u.premium_start_date) return "Prem Bulanan ✨";
                        const diffDays = Math.round((new Date(u.premium_end_date).getTime() - new Date(u.premium_start_date).getTime()) / (24 * 60 * 60 * 1000));
                        if (diffDays > 60) return "Prem Tahunan 🏆";
                        if (diffDays <= 10) return "Prem Mingguan ⚡";
                        return "Prem Bulanan ✨";
                      })()
                    : "Free"}
                </span>
                {u.plan === "premium" && u.premium_end_date && (
                  <span className="text-[10px] text-muted-foreground">
                    s/d {new Date(u.premium_end_date).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                  </span>
                )}
              </div>
            </div>

            {/* AI usage details */}
            <div className="mt-2.5 pt-2.5 border-t border-border/40 flex flex-wrap items-center gap-x-6 gap-y-1.5 text-xs text-muted-foreground">
              <span>💬 <strong>{u.total_replies || 0}</strong> chat AI</span>
              <span>🪙 Est. <strong>{(u.total_replies * 1650).toLocaleString("id-ID")}</strong> token</span>
              <span className="text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-md">
                Est. Biaya: Rp {(u.total_replies * 2.57).toLocaleString("id-ID", { maximumFractionDigits: 1 })}
              </span>
            </div>

            {/* Mental Health Trends */}
            <div className="mt-2 pt-2 border-t border-border/20 flex flex-wrap items-center gap-x-6 gap-y-1.5 text-xs">
              <span className="text-muted-foreground">📈 <strong>{u.total_checkins || 0}</strong> check-in (30 hari)</span>
              {u.total_checkins > 0 && (
                <span className="text-stone-700">📊 Rata-rata Mood: <strong>{u.avg_mood_30}/10</strong></span>
              )}
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${u.trend_color}`}>
                {u.trend_text}
              </span>
            </div>

            {/* Feature Activities */}
            <div className="mt-2 pt-2 border-t border-border/20 flex flex-wrap items-center gap-x-6 gap-y-1.5 text-xs text-muted-foreground">
              <span>✍️ <strong>{u.total_journals || 0}</strong> jurnal</span>
              <span>🙏 <strong>{u.total_gratitudes || 0}</strong> syukur</span>
              <span>🍕 <strong>{u.total_eatings || 0}</strong> eating logs</span>
              {u.last_active_at && (
                <span>🕒 Aktif: <strong>{new Date(u.last_active_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</strong></span>
              )}
            </div>

            {/* Top Triggers */}
            <div className="mt-2 pt-2 border-t border-border/20 text-xs flex flex-wrap items-center gap-1.5">
              <span className="text-muted-foreground">🎯 Pemicu Terbesar:</span>
              <span className="font-semibold text-stone-700">{u.top_triggers_text}</span>
            </div>

            {/* Action buttons */}
            <div className="mt-3.5 flex flex-wrap gap-2 pt-2 border-t border-border/10">
              {/* Plan toggle */}
              {u.plan === "premium" ? (
                <>
                  <button
                    onClick={async () => {
                      await setPlan({ data: { userId: u.id, plan: "free", days: 0 } });
                      toast.success("Plan diperbarui ke Free");
                      qc.invalidateQueries({ queryKey: ["admin-users"] });
                      qc.invalidateQueries({ queryKey: ["profile", u.id] });
                    }}
                    className="rounded-full border border-border px-3 py-1 text-xs hover:bg-cream-deep transition-colors"
                  >
                    Set Free
                  </button>
                  <button
                    onClick={async () => {
                      await setPlan({ data: { userId: u.id, plan: "premium", days: 7 } });
                      toast.success("Plan diperbarui ke Premium 7 Hari");
                      qc.invalidateQueries({ queryKey: ["admin-users"] });
                      qc.invalidateQueries({ queryKey: ["profile", u.id] });
                    }}
                    className="rounded-full border border-border px-3 py-1 text-xs hover:bg-cream-deep transition-colors text-emerald-700 bg-emerald-50 border-emerald-200"
                  >
                    Set Prem 7 hari
                  </button>
                  <button
                    onClick={async () => {
                      await setPlan({ data: { userId: u.id, plan: "premium", days: 30 } });
                      toast.success("Plan diperbarui ke Premium 30 Hari");
                      qc.invalidateQueries({ queryKey: ["admin-users"] });
                      qc.invalidateQueries({ queryKey: ["profile", u.id] });
                    }}
                    className="rounded-full border border-border px-3 py-1 text-xs hover:bg-cream-deep transition-colors"
                  >
                    Set Prem 30 hari
                  </button>
                  <button
                    onClick={async () => {
                      await setPlan({ data: { userId: u.id, plan: "premium", days: 365 } });
                      toast.success("Plan diperbarui ke Premium 1 Tahun");
                      qc.invalidateQueries({ queryKey: ["admin-users"] });
                      qc.invalidateQueries({ queryKey: ["profile", u.id] });
                    }}
                    className="rounded-full border border-border px-3 py-1 text-xs hover:bg-cream-deep transition-colors"
                  >
                    Set Premium 1 tahun
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={async () => {
                      await setPlan({ data: { userId: u.id, plan: "premium", days: 7 } });
                      toast.success("Plan diperbarui ke Premium 7 Hari");
                      qc.invalidateQueries({ queryKey: ["admin-users"] });
                      qc.invalidateQueries({ queryKey: ["profile", u.id] });
                    }}
                    className="rounded-full border border-border px-3 py-1 text-xs hover:bg-cream-deep transition-colors text-emerald-700 bg-emerald-50 border-emerald-200"
                  >
                    Set Prem 7 hari
                  </button>
                  <button
                    onClick={async () => {
                      await setPlan({ data: { userId: u.id, plan: "premium", days: 30 } });
                      toast.success("Plan diperbarui ke Premium 30 Hari");
                      qc.invalidateQueries({ queryKey: ["admin-users"] });
                      qc.invalidateQueries({ queryKey: ["profile", u.id] });
                    }}
                    className="rounded-full border border-border px-3 py-1 text-xs hover:bg-cream-deep transition-colors"
                  >
                    Set Premium 30 hari
                  </button>
                  <button
                    onClick={async () => {
                      await setPlan({ data: { userId: u.id, plan: "premium", days: 365 } });
                      toast.success("Plan diperbarui ke Premium 1 Tahun");
                      qc.invalidateQueries({ queryKey: ["admin-users"] });
                      qc.invalidateQueries({ queryKey: ["profile", u.id] });
                    }}
                    className="rounded-full border border-border px-3 py-1 text-xs hover:bg-cream-deep transition-colors"
                  >
                    Set Premium 1 tahun
                  </button>
                </>
              )}

              {/* Suspend / Aktifkan */}
              <button
                onClick={async () => {
                  await suspend({ data: { userId: u.id, suspended: !u.suspended } });
                  qc.invalidateQueries({ queryKey: ["admin-users"] });
                }}
                className="rounded-full border border-border px-3 py-1 text-xs hover:bg-cream-deep transition-colors"
              >
                {u.suspended ? "Aktifkan" : "Suspend"}
              </button>

              {/* Demote admin — only show for admins, and hide for self */}
              {u.is_admin && u.id !== currentUser?.id && (
                <button
                  onClick={() => doDemote(u.id, u.name ?? u.email)}
                  className="rounded-full border border-violet-300 bg-violet-50 px-3 py-1 text-xs text-violet-700 hover:bg-violet-100 transition-colors font-semibold"
                >
                  👑 Copot Admin
                </button>
              )}
              {u.is_admin && u.id === currentUser?.id && (
                <span className="rounded-full border border-violet-200 px-3 py-1 text-xs text-violet-400 cursor-not-allowed" title="Tidak bisa mencopot diri sendiri">
                  👑 Admin (Saya)
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
