import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { COMPANIONS, COMM_STYLES, GOAL_OPTIONS, type CompanionKey } from "@/lib/companions";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

export const Route = createFileRoute("/_authenticated/app/onboarding")({
  component: Onboarding,
});

function Onboarding() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [goals, setGoals] = useState<string[]>([]);
  const [companion, setCompanion] = useState<CompanionKey>("sahabat");
  const [style, setStyle] = useState<typeof COMM_STYLES[number]["key"]>("supportive");
  const [saving, setSaving] = useState(false);

  const toggle = (g: string) => setGoals((p) => p.includes(g) ? p.filter((x)=>x!==g) : [...p, g]);

  const finish = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from("profiles").update({
      name: name || null,
      age: age ? parseInt(age) : null,
      goals,
      selected_companion: companion,
      communication_style: style,
      onboarding_completed: true,
    }).eq("id", user.id);
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    qc.invalidateQueries({ queryKey: ["profile", user.id] });
    toast.success("Selamat datang di Bloom Mind 🌿");
    navigate({ to: "/app" });
  };

  return (
    <div className="mx-auto max-w-xl">
      <div className="mb-6 flex gap-1.5">
        {[0,1,2,3].map((i)=>(<div key={i} className={`h-1.5 flex-1 rounded-full ${i<=step?"bg-primary":"bg-border"}`} />))}
      </div>

      {step === 0 && (
        <section>
          <h1 className="font-display text-3xl font-semibold">Halo! Boleh kenalan dulu?</h1>
          <p className="mt-2 text-sm text-muted-foreground">Kami ingin mengenalmu lebih dekat.</p>
          <div className="mt-6 space-y-3">
            <input value={name} onChange={(e)=>setName(e.target.value)} placeholder="Nama panggilan" className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm" />
            <input value={age} onChange={(e)=>setAge(e.target.value)} type="number" placeholder="Usia (opsional)" className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm" />
          </div>
        </section>
      )}

      {step === 1 && (
        <section>
          <h1 className="font-display text-3xl font-semibold">Apa yang ingin kamu fokuskan?</h1>
          <p className="mt-2 text-sm text-muted-foreground">Pilih satu atau beberapa.</p>
          <div className="mt-6 flex flex-wrap gap-2">
            {GOAL_OPTIONS.map((g)=>(
              <button key={g} onClick={()=>toggle(g)}
                className={`rounded-full border px-4 py-2 text-sm ${goals.includes(g)?"border-primary bg-primary-soft font-semibold":"border-border bg-card"}`}>
                {g}
              </button>
            ))}
          </div>
        </section>
      )}

      {step === 2 && (
        <section>
          <h1 className="font-display text-3xl font-semibold">Pilih pendamping default</h1>
          <p className="mt-2 text-sm text-muted-foreground">Kamu bisa berganti kapan saja.</p>
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {COMPANIONS.map((c)=>(
              <button key={c.key} onClick={()=>setCompanion(c.key)}
                className={`rounded-2xl border p-4 text-left ${companion===c.key?"border-primary bg-primary-soft":"border-border bg-card"}`}>
                <div className="text-2xl">{c.emoji}</div>
                <div className="mt-2 font-semibold text-sm">{c.name}</div>
                <div className="text-[10px] text-muted-foreground">{c.premium ? "✨ Premium" : "Gratis"}</div>
              </button>
            ))}
          </div>
        </section>
      )}

      {step === 3 && (
        <section>
          <h1 className="font-display text-3xl font-semibold">Gaya komunikasi favoritmu?</h1>
          <div className="mt-6 grid grid-cols-2 gap-3">
            {COMM_STYLES.map((s)=>(
              <button key={s.key} onClick={()=>setStyle(s.key)}
                className={`rounded-2xl border p-4 ${style===s.key?"border-primary bg-primary-soft font-semibold":"border-border bg-card"}`}>
                {s.label}
              </button>
            ))}
          </div>
        </section>
      )}

      <div className="mt-8 flex gap-3">
        {step > 0 && <button onClick={()=>setStep(s=>s-1)} className="rounded-full border border-border px-5 py-2.5 text-sm">Kembali</button>}
        {step < 3 ? (
          <button onClick={()=>setStep(s=>s+1)} className="ml-auto rounded-full bg-foreground px-6 py-2.5 text-sm font-semibold text-cream">Lanjut</button>
        ) : (
          <button onClick={finish} disabled={saving} className="ml-auto rounded-full bg-accent px-6 py-2.5 text-sm font-semibold text-accent-foreground shadow-peach disabled:opacity-60">
            {saving ? "Menyimpan…" : "Selesai"}
          </button>
        )}
      </div>
    </div>
  );
}
