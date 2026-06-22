import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const DEFAULTS = [
  { name: "Minum air putih", icon: "💧" },
  { name: "Jalan kaki", icon: "🚶" },
  { name: "Olahraga", icon: "🏃" },
  { name: "Tidur cukup", icon: "😴" },
  { name: "Meditasi", icon: "🧘" },
  { name: "Membaca", icon: "📖" },
  { name: "Journaling", icon: "📓" },
];

export const Route = createFileRoute("/_authenticated/app/habits")({
  component: HabitPage,
});

function HabitPage() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [newName, setNewName] = useState("");
  const today = new Date().toISOString().slice(0, 10);

  const { data: habits } = useQuery({
    queryKey: ["habits", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.from("habits").select("*").eq("user_id", user!.id).eq("is_active", true).order("created_at");
      return data ?? [];
    },
  });
  const { data: logs } = useQuery({
    queryKey: ["habit-logs-today", user?.id, today],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.from("habit_logs").select("*").eq("user_id", user!.id).eq("date", today);
      return data ?? [];
    },
  });

  const add = async (name: string, icon = "✨") => {
    if (!user || !name.trim()) return;
    const { error } = await supabase.from("habits").insert({ user_id: user.id, name, icon });
    if (error) toast.error(error.message); else { setNewName(""); qc.invalidateQueries({ queryKey: ["habits", user.id] }); }
  };
  const toggle = async (habitId: string) => {
    if (!user) return;
    const existing = logs?.find((l)=>l.habit_id===habitId);
    if (existing) {
      await supabase.from("habit_logs").delete().eq("id", existing.id);
    } else {
      await supabase.from("habit_logs").insert({ user_id: user.id, habit_id: habitId, date: today, completed: true });
    }
    qc.invalidateQueries({ queryKey: ["habit-logs-today", user.id, today] });
    qc.invalidateQueries({ queryKey: ["habit-streak", user.id] });
  };
  const remove = async (id: string) => {
    if (!confirm("Hapus habit?")) return;
    await supabase.from("habits").update({ is_active: false }).eq("id", id);
    qc.invalidateQueries({ queryKey: ["habits", user!.id] });
  };

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl font-semibold">Habit Tracker</h1>

      <section className="rounded-3xl bg-card p-6 ring-1 ring-border">
        <p className="text-sm font-medium">Tambah habit</p>
        <div className="mt-3 flex gap-2">
          <input value={newName} onChange={(e)=>setNewName(e.target.value)} placeholder="Habit baru"
            className="flex-1 rounded-2xl border border-border bg-background px-4 py-2.5 text-sm" />
          <button onClick={()=>add(newName)} className="rounded-full bg-foreground px-5 py-2.5 text-sm text-cream">Tambah</button>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {DEFAULTS.map((d)=>(
            <button key={d.name} onClick={()=>add(d.name, d.icon)} className="rounded-full border border-border px-3 py-1.5 text-xs hover:bg-cream-deep">+ {d.icon} {d.name}</button>
          ))}
        </div>
      </section>

      <section>
        <p className="mb-3 text-sm font-medium">Hari ini</p>
        <div className="space-y-2">
          {habits?.length === 0 && <p className="text-sm text-muted-foreground">Belum ada habit.</p>}
          {habits?.map((h)=>{
            const done = !!logs?.find((l)=>l.habit_id===h.id);
            return (
              <div key={h.id} className={`flex items-center gap-3 rounded-2xl border p-4 ${done?"border-primary bg-primary-soft/50":"border-border bg-card"}`}>
                <button onClick={()=>toggle(h.id)} className={`grid h-7 w-7 place-items-center rounded-full border ${done?"bg-primary border-primary text-primary-foreground":"border-border"}`}>{done?"✓":""}</button>
                <span className="text-xl">{h.icon}</span>
                <span className="flex-1 text-sm font-medium">{h.name}</span>
                <button onClick={()=>remove(h.id)} className="text-xs text-muted-foreground">Hapus</button>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
