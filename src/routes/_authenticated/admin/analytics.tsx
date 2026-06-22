import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/admin/analytics")({
  component: Page,
});

function Page() {
  const { data } = useQuery({
    queryKey: ["admin-analytics"],
    queryFn: async () => {
      const [moods, journals, habits, eating] = await Promise.all([
        supabase.from("mood_checkins").select("mood, triggers"),
        supabase.from("journals").select("id", { count: "exact", head: true }),
        supabase.from("habit_logs").select("id", { count: "exact", head: true }).eq("completed", true),
        supabase.from("emotional_eating_logs").select("hunger_type, emotion, trigger"),
      ]);
      const moodCount: Record<string,number> = {};
      const triggerCount: Record<string,number> = {};
      moods.data?.forEach((m)=>{
        moodCount[m.mood] = (moodCount[m.mood]??0)+1;
        m.triggers?.forEach((t)=>{ triggerCount[t]=(triggerCount[t]??0)+1; });
      });
      return {
        moodCount, triggerCount,
        journalCount: journals.count ?? 0,
        habitCompletions: habits.count ?? 0,
        eatingCount: eating.data?.length ?? 0,
      };
    },
  });

  const topMood = Object.entries(data?.moodCount ?? {}).sort((a,b)=>b[1]-a[1]);
  const topTrig = Object.entries(data?.triggerCount ?? {}).sort((a,b)=>b[1]-a[1]).slice(0,8);

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl font-semibold">Analytics</h1>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card label="Total Journal" value={data?.journalCount ?? "—"} />
        <Card label="Habit Completions" value={data?.habitCompletions ?? "—"} />
        <Card label="Emotional Eating Logs" value={data?.eatingCount ?? "—"} />
      </div>

      <section className="rounded-3xl bg-card p-5 ring-1 ring-border">
        <p className="text-sm font-medium">Mood paling sering</p>
        <div className="mt-3 space-y-2">
          {topMood.map(([m,c])=>(
            <div key={m} className="flex items-center gap-3">
              <span className="w-28 capitalize text-sm">{m}</span>
              <div className="h-2 flex-1 rounded-full bg-cream-deep"><div className="h-2 rounded-full bg-primary" style={{ width: `${Math.min(100, c*5)}%` }} /></div>
              <span className="w-10 text-right text-xs">{c}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-3xl bg-card p-5 ring-1 ring-border">
        <p className="text-sm font-medium">Trigger paling sering</p>
        <div className="mt-3 space-y-2">
          {topTrig.map(([t,c])=>(
            <div key={t} className="flex items-center gap-3">
              <span className="w-28 text-sm">{t}</span>
              <div className="h-2 flex-1 rounded-full bg-cream-deep"><div className="h-2 rounded-full bg-accent" style={{ width: `${Math.min(100, c*5)}%` }} /></div>
              <span className="w-10 text-right text-xs">{c}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function Card({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-3xl bg-card p-5 ring-1 ring-border">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-2 font-display text-3xl font-semibold">{value}</p>
    </div>
  );
}
