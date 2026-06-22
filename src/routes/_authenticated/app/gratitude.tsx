import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/app/gratitude")({
  component: Page,
});

function Page() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [g, setG] = useState({ gratitude1:"", gratitude2:"", gratitude3:"", best_moment:"", lesson:"" });

  const { data: list } = useQuery({
    queryKey: ["gratitude", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.from("gratitude_entries").select("*").eq("user_id", user!.id).order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  const save = async () => {
    if (!user) return;
    const { error } = await supabase.from("gratitude_entries").insert({ ...g, user_id: user.id });
    if (error) { toast.error(error.message); return; }
    toast.success("Tersimpan 🙏");
    setG({ gratitude1:"", gratitude2:"", gratitude3:"", best_moment:"", lesson:"" });
    qc.invalidateQueries({ queryKey: ["gratitude", user.id] });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-semibold">Gratitude Journal</h1>
        <p className="mt-1 text-sm text-muted-foreground">Tiga hal kecil yang kamu syukuri hari ini.</p>
      </div>

      <section className="rounded-3xl bg-card p-6 ring-1 ring-border space-y-3">
        {(["gratitude1","gratitude2","gratitude3"] as const).map((k,i)=>(
          <input key={k} value={g[k]} onChange={(e)=>setG({...g, [k]: e.target.value})} placeholder={`Hal ${i+1} yang aku syukuri…`}
            className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm" />
        ))}
        <input value={g.best_moment} onChange={(e)=>setG({...g, best_moment:e.target.value})} placeholder="Momen terbaik hari ini"
          className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm" />
        <input value={g.lesson} onChange={(e)=>setG({...g, lesson:e.target.value})} placeholder="Pelajaran hari ini"
          className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm" />
        <button onClick={save} className="w-full rounded-full bg-accent py-3 text-sm font-semibold text-accent-foreground shadow-peach">Simpan</button>
      </section>

      <div className="space-y-3">
        {list?.map((e)=>(
          <div key={e.id} className="rounded-3xl bg-card p-5 ring-1 ring-border">
            <p className="text-xs text-muted-foreground">{new Date(e.created_at).toLocaleDateString("id-ID")}</p>
            <ul className="mt-2 list-disc pl-5 text-sm space-y-1">
              {e.gratitude1 && <li>{e.gratitude1}</li>}
              {e.gratitude2 && <li>{e.gratitude2}</li>}
              {e.gratitude3 && <li>{e.gratitude3}</li>}
            </ul>
            {e.best_moment && <p className="mt-2 text-xs"><strong>Terbaik:</strong> {e.best_moment}</p>}
            {e.lesson && <p className="text-xs"><strong>Pelajaran:</strong> {e.lesson}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}
