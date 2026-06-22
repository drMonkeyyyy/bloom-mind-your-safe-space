import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useProfile } from "@/hooks/use-profile";
import { supabase } from "@/integrations/supabase/client";
import { COMPANIONS, COMM_STYLES } from "@/lib/companions";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

export const Route = createFileRoute("/_authenticated/app/profile")({
  component: Page,
});

function Page() {
  const { user } = useAuth();
  const { data: profile } = useProfile(user?.id);
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [name, setName] = useState(""); const [age, setAge] = useState(""); const [phone, setPhone] = useState("");
  const [companion, setCompanion] = useState("sahabat"); const [style, setStyle] = useState("supportive");

  useEffect(()=>{ if (profile) {
    setName(profile.name ?? ""); setAge(profile.age?.toString() ?? ""); setPhone(profile.phone ?? "");
    setCompanion(profile.selected_companion ?? "sahabat"); setStyle(profile.communication_style ?? "supportive");
  }}, [profile]);

  const save = async () => {
    if (!user) return;
    const { error } = await supabase.from("profiles").update({
      name, age: age ? parseInt(age) : null, phone,
      selected_companion: companion as "sahabat", communication_style: style as "supportive",
    }).eq("id", user.id);
    if (error) { toast.error(error.message); return; }
    toast.success("Profil tersimpan.");
    qc.invalidateQueries({ queryKey: ["profile", user.id] });
  };

  const signOut = async () => {
    await qc.cancelQueries(); qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  };

  return (
    <div className="space-y-6 max-w-xl">
      <h1 className="font-display text-3xl font-semibold">Profil</h1>

      <section className="rounded-3xl bg-card p-6 ring-1 ring-border space-y-3">
        <input value={name} onChange={(e)=>setName(e.target.value)} placeholder="Nama" className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm" />
        <input value={age} onChange={(e)=>setAge(e.target.value)} type="number" placeholder="Usia" className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm" />
        <input value={phone} onChange={(e)=>setPhone(e.target.value)} placeholder="No. WhatsApp" className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm" />
        <div>
          <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Pendamping default</label>
          <select value={companion} onChange={(e)=>setCompanion(e.target.value)} className="mt-1 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm">
            {COMPANIONS.map((c)=>(<option key={c.key} value={c.key}>{c.emoji} {c.name}</option>))}
          </select>
        </div>
        <div>
          <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Gaya komunikasi</label>
          <select value={style} onChange={(e)=>setStyle(e.target.value)} className="mt-1 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm">
            {COMM_STYLES.map((s)=>(<option key={s.key} value={s.key}>{s.label}</option>))}
          </select>
        </div>
        <button onClick={save} className="w-full rounded-full bg-accent py-3 text-sm font-semibold text-accent-foreground shadow-peach">Simpan</button>
      </section>

      <button onClick={signOut} className="w-full rounded-full border border-destructive/40 py-3 text-sm text-destructive">Keluar dari akun</button>
    </div>
  );
}
