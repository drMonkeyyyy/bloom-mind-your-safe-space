import { createFileRoute, useSearch } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { MOOD_OPTIONS, TRIGGER_OPTIONS } from "@/lib/companions";
import { toast } from "sonner";
import { useQuery, useQueryClient } from "@tanstack/react-query";

const search = z.object({ pre: z.string().optional() });

export const Route = createFileRoute("/_authenticated/app/mood")({
  validateSearch: search,
  component: MoodPage,
});

function MoodPage() {
  const { pre } = useSearch({ from: "/_authenticated/app/mood" });
  const { user } = useAuth();
  const qc = useQueryClient();
  const [mood, setMood] = useState<string>(pre ?? "tenang");
  const [moodScore, setMoodScore] = useState(7);
  const [stress, setStress] = useState(4);
  const [energy, setEnergy] = useState(6);
  const [triggers, setTriggers] = useState<string[]>([]);
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);

  const { data: list } = useQuery({
    queryKey: ["mood-list", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.from("mood_checkins").select("*").eq("user_id", user!.id).order("created_at", { ascending: false }).limit(14);
      return data ?? [];
    },
  });

  const toggleT = (t: string) => setTriggers((p)=>p.includes(t)?p.filter(x=>x!==t):[...p,t]);

  const save = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from("mood_checkins").insert({
      user_id: user.id,
      mood: mood as "bahagia",
      mood_score: moodScore, stress_score: stress, energy_score: energy,
      triggers, note: note || null,
    });
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Mood tercatat 🌿");
    setNote(""); setTriggers([]);
    qc.invalidateQueries({ queryKey: ["mood-list", user.id] });
    qc.invalidateQueries({ queryKey: ["moods-week", user.id] });
  };

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl font-semibold">Bagaimana perasaanmu?</h1>

      <section className="rounded-3xl bg-card p-6 ring-1 ring-border">
        <p className="text-sm font-medium">Pilih mood</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {MOOD_OPTIONS.map((m)=>(
            <button key={m.key} onClick={()=>setMood(m.key)}
              className={`rounded-full border px-4 py-2 text-sm ${mood===m.key?"border-primary bg-primary-soft font-semibold":"border-border bg-background"}`}>
              {m.emoji} {m.label}
            </button>
          ))}
        </div>

        <div className="mt-6 space-y-4">
          {[["Mood", moodScore, setMoodScore],["Stres", stress, setStress],["Energi", energy, setEnergy]].map(([label, val, set])=>(
            <div key={label as string}>
              <div className="flex justify-between text-xs"><span>{label as string}</span><span className="font-semibold">{val as number}/10</span></div>
              <input type="range" min={1} max={10} value={val as number} onChange={(e)=>(set as (n:number)=>void)(parseInt(e.target.value))} className="w-full" />
            </div>
          ))}
        </div>

        <p className="mt-6 text-sm font-medium">Trigger hari ini</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {TRIGGER_OPTIONS.map((t)=>(
            <button key={t} onClick={()=>toggleT(t)} className={`rounded-full border px-3 py-1.5 text-xs ${triggers.includes(t)?"border-primary bg-primary-soft font-semibold":"border-border"}`}>{t}</button>
          ))}
        </div>

        <textarea value={note} onChange={(e)=>setNote(e.target.value)} placeholder="Catatan singkat (opsional)" rows={3}
          className="mt-4 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm" />

        <button onClick={save} disabled={saving} className="mt-4 w-full rounded-full bg-accent py-3 text-sm font-semibold text-accent-foreground shadow-peach disabled:opacity-60">
          {saving ? "Menyimpan…" : "Simpan mood"}
        </button>
      </section>

      <section>
        <h2 className="font-display text-xl font-semibold">Riwayat 14 hari</h2>
        <div className="mt-3 space-y-2">
          {list?.length === 0 && <p className="text-sm text-muted-foreground">Belum ada catatan.</p>}
          {list?.map((m)=>{
            const emoji = MOOD_OPTIONS.find(x=>x.key===m.mood)?.emoji ?? "🌿";
            return (
              <div key={m.id} className="flex items-center gap-3 rounded-2xl bg-card p-4 ring-1 ring-border">
                <span className="text-2xl">{emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold capitalize">{m.mood}</p>
                  <p className="text-xs text-muted-foreground">{new Date(m.created_at).toLocaleString("id-ID")} · Mood {m.mood_score} · Stres {m.stress_score} · Energi {m.energy_score}</p>
                  {m.note && <p className="mt-1 truncate text-xs">{m.note}</p>}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
