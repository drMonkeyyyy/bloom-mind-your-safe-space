import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/app/journal")({
  component: JournalPage,
});

function JournalPage() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ summary:"", main_emotion:"", main_trigger:"", lesson:"", gratitude:"", tomorrow_focus:"" });
  const [editId, setEditId] = useState<string | null>(null);

  const { data: items } = useQuery({
    queryKey: ["journals", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.from("journals").select("*").eq("user_id", user!.id).order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  const reset = () => { setForm({ summary:"", main_emotion:"", main_trigger:"", lesson:"", gratitude:"", tomorrow_focus:"" }); setEditId(null); };

  const save = async () => {
    if (!user) return;
    const payload = { ...form, user_id: user.id, source: "manual" };
    const { error } = editId
      ? await supabase.from("journals").update(payload).eq("id", editId)
      : await supabase.from("journals").insert(payload);
    if (error) { toast.error(error.message); return; }
    toast.success("Journal tersimpan.");
    setOpen(false); reset();
    qc.invalidateQueries({ queryKey: ["journals", user.id] });
  };

  const remove = async (id: string) => {
    if (!confirm("Hapus journal ini?")) return;
    await supabase.from("journals").delete().eq("id", id);
    qc.invalidateQueries({ queryKey: ["journals", user!.id] });
  };

  const edit = (j: NonNullable<typeof items>[number]) => {
    setEditId(j.id);
    setForm({
      summary: j.summary ?? "", main_emotion: j.main_emotion ?? "", main_trigger: j.main_trigger ?? "",
      lesson: j.lesson ?? "", gratitude: j.gratitude ?? "", tomorrow_focus: j.tomorrow_focus ?? "",
    });
    setOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl font-semibold">Journal</h1>
        <button onClick={()=>{ reset(); setOpen(true); }} className="rounded-full bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground shadow-peach">+ Journal baru</button>
      </div>

      {open && (
        <div className="rounded-3xl bg-card p-6 ring-1 ring-border space-y-3">
          {(["summary","main_emotion","main_trigger","lesson","gratitude","tomorrow_focus"] as const).map((k)=>(
            <div key={k}>
              <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{k.replace(/_/g," ")}</label>
              <textarea value={form[k]} onChange={(e)=>setForm({...form, [k]: e.target.value})} rows={k==="summary"?3:2}
                className="mt-1 w-full rounded-2xl border border-border bg-background px-3 py-2 text-sm" />
            </div>
          ))}
          <div className="flex gap-2">
            <button onClick={save} className="rounded-full bg-foreground px-5 py-2 text-sm text-cream">Simpan</button>
            <button onClick={()=>{ setOpen(false); reset(); }} className="rounded-full border border-border px-5 py-2 text-sm">Batal</button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {items?.length === 0 && <p className="text-sm text-muted-foreground">Belum ada journal.</p>}
        {items?.map((j)=>(
          <div key={j.id} className="rounded-3xl bg-card p-5 ring-1 ring-border">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="text-xs text-muted-foreground">{new Date(j.created_at).toLocaleDateString("id-ID")} · {j.source === "from_chat" ? "Dari Chat" : "Manual"}</p>
                {j.summary && <p className="mt-2 text-sm">{j.summary}</p>}
                <div className="mt-3 flex flex-wrap gap-2 text-[11px]">
                  {j.main_emotion && <span className="rounded-full bg-primary-soft px-2 py-0.5">Emosi: {j.main_emotion}</span>}
                  {j.main_trigger && <span className="rounded-full bg-accent-soft px-2 py-0.5">Trigger: {j.main_trigger}</span>}
                </div>
                {j.lesson && <p className="mt-2 text-xs text-muted-foreground"><strong>Pelajaran:</strong> {j.lesson}</p>}
                {j.gratitude && <p className="text-xs text-muted-foreground"><strong>Syukur:</strong> {j.gratitude}</p>}
                {j.tomorrow_focus && <p className="text-xs text-muted-foreground"><strong>Besok:</strong> {j.tomorrow_focus}</p>}
              </div>
              <div className="flex flex-col gap-1">
                <button onClick={()=>edit(j)} className="rounded-full border border-border px-3 py-1 text-xs">Edit</button>
                <button onClick={()=>remove(j.id)} className="rounded-full border border-destructive/40 px-3 py-1 text-xs text-destructive">Hapus</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
