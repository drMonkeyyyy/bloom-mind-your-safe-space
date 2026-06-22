import { createFileRoute } from "@tanstack/react-router";
import { useAuth } from "@/hooks/use-auth";
import { useProfile } from "@/hooks/use-profile";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { getWeeklyInsight } from "@/lib/chat.functions";
import { PaywallCard } from "@/components/app/PaywallCard";
import { useState } from "react";

export const Route = createFileRoute("/_authenticated/app/growth")({
  component: Page,
});

function Page() {
  const { user } = useAuth();
  const { data: profile } = useProfile(user?.id);
  const isPremium = profile?.plan === "premium";
  const insightFn = useServerFn(getWeeklyInsight);
  const [insight, setInsight] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const since = new Date(Date.now() - 29 * 86400000).toISOString().slice(0, 10);
  const { data: moods } = useQuery({
    queryKey: ["moods-30", user?.id],
    enabled: !!user && isPremium,
    queryFn: async () => {
      const { data } = await supabase.from("mood_checkins").select("date, mood, mood_score, stress_score, energy_score, triggers")
        .eq("user_id", user!.id).gte("date", since).order("date");
      return data ?? [];
    },
  });

  if (!isPremium) {
    return (
      <div className="space-y-6">
        <h1 className="font-display text-3xl font-semibold">Growth Dashboard</h1>
        <PaywallCard desc="Lihat analytics mood, stress, energy, habit consistency, dan insight mingguan AI." />
      </div>
    );
  }

  const avgMood = moods && moods.length ? (moods.reduce((a,b)=>a+b.mood_score,0)/moods.length).toFixed(1) : "—";
  const avgStress = moods && moods.length ? (moods.reduce((a,b)=>a+b.stress_score,0)/moods.length).toFixed(1) : "—";
  const avgEnergy = moods && moods.length ? (moods.reduce((a,b)=>a+b.energy_score,0)/moods.length).toFixed(1) : "—";

  const triggerCount: Record<string, number> = {};
  moods?.forEach((m)=>m.triggers?.forEach((t)=>{ triggerCount[t]=(triggerCount[t]??0)+1; }));
  const topTriggers = Object.entries(triggerCount).sort((a,b)=>b[1]-a[1]).slice(0,5);

  const generate = async () => {
    setLoading(true);
    try { const r = await insightFn({ data: undefined }); setInsight(r.text); }
    catch { setInsight("Gagal memuat insight."); }
    finally { setLoading(false); }
  };

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl font-semibold">Growth Dashboard</h1>

      <div className="grid gap-4 sm:grid-cols-3">
        {[["Mood rata-rata", avgMood], ["Stres rata-rata", avgStress], ["Energi rata-rata", avgEnergy]].map(([l,v])=>(
          <div key={l} className="rounded-3xl bg-card p-5 ring-1 ring-border">
            <p className="text-xs text-muted-foreground">{l}</p>
            <p className="mt-2 font-display text-3xl font-semibold">{v}<span className="text-sm text-muted-foreground">/10</span></p>
          </div>
        ))}
      </div>

      <section className="rounded-3xl bg-card p-6 ring-1 ring-border">
        <p className="text-sm font-medium">Tren mood 30 hari</p>
        <div className="mt-3 flex h-32 items-end gap-1">
          {moods?.map((m,i)=>(<div key={i} className="flex-1 rounded-t bg-primary" style={{ height: `${m.mood_score*10}%`, opacity:0.4+m.mood_score/15 }} title={`${m.date}: ${m.mood_score}`} />))}
        </div>
      </section>

      <section className="rounded-3xl bg-card p-6 ring-1 ring-border">
        <p className="text-sm font-medium">Top trigger</p>
        <div className="mt-3 space-y-2">
          {topTriggers.length === 0 && <p className="text-xs text-muted-foreground">Belum cukup data.</p>}
          {topTriggers.map(([t,c])=>(
            <div key={t} className="flex items-center gap-3">
              <span className="w-32 text-sm">{t}</span>
              <div className="h-2 flex-1 rounded-full bg-cream-deep"><div className="h-2 rounded-full bg-primary" style={{ width: `${Math.min(100, c*15)}%` }} /></div>
              <span className="text-xs w-8 text-right">{c}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-3xl bg-gradient-to-br from-primary-soft to-accent-soft p-6">
        <div className="flex items-center justify-between">
          <p className="font-display text-lg font-semibold">Weekly AI Insight</p>
          <button onClick={generate} disabled={loading} className="rounded-full bg-foreground px-4 py-2 text-xs text-cream">{loading?"Memuat…":"Generate"}</button>
        </div>
        {insight && <p className="mt-3 text-sm leading-relaxed whitespace-pre-wrap">{insight}</p>}
      </section>
    </div>
  );
}
