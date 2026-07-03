import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useProfile } from "@/hooks/use-profile";
import { supabase } from "@/integrations/supabase/client";
import { COMPANIONS, COMM_STYLES } from "@/lib/companions";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { ModalDialog } from "@/components/app/BottomSheet";

export const Route = createFileRoute("/_authenticated/app/profile")({
  component: Page,
});

function Page() {
  const { user } = useAuth();
  const { data: profile } = useProfile(user?.id);
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [phone, setPhone] = useState("");
  const [companion, setCompanion] = useState("sahabat");
  const [style, setStyle] = useState("supportive");
  const [saving, setSaving] = useState(false);
  const [signOutConfirm, setSignOutConfirm] = useState(false);

  useEffect(() => {
    if (profile) {
      setName(profile.name ?? "");
      setAge(profile.age?.toString() ?? "");
      setPhone(profile.phone ?? "");
      setCompanion(profile.selected_companion ?? "sahabat");
      setStyle(profile.communication_style ?? "supportive");
    }
  }, [profile]);

  const save = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from("profiles").update({
      name, age: age ? parseInt(age) : null, phone,
      selected_companion: companion as "sahabat",
      communication_style: style as "supportive",
    }).eq("id", user.id);
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Profil tersimpan.");
    qc.invalidateQueries({ queryKey: ["profile", user.id] });
  };

  const signOut = async () => {
    await qc.cancelQueries(); qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  };

  const initials = name ? name.slice(0, 2).toUpperCase() : (profile?.email ?? "BM").slice(0, 2).toUpperCase();
  const isPremium = profile?.plan === "premium";

  return (
    <div className="max-w-xl space-y-6">
      {/* ── PROFILE HEADER ────────────────────────────────────────── */}
      <div className="flex items-center gap-4 rounded-3xl bg-card p-6 ring-1 ring-border">
        <div className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-primary to-accent font-display text-2xl font-bold text-white shadow-soft">
          {initials}
        </div>
        <div className="min-w-0">
          <h1 className="font-display text-xl font-semibold text-foreground">{profile?.name ?? "Pengguna JN-CALM"}</h1>
          <p className="truncate text-sm text-muted-foreground">{profile?.email}</p>
          <span className={`mt-1.5 inline-flex rounded-full px-3 py-0.5 text-xs font-semibold ${isPremium ? "bg-gradient-to-r from-amber-100 to-orange-100 text-amber-700" : "bg-primary-soft text-foreground"}`}>
            {isPremium ? "✨ Premium" : "Free Plan"}
          </span>
        </div>
      </div>

      {/* ── INFO PRIBADI ──────────────────────────────────────────── */}
      <section className="rounded-3xl bg-card p-6 ring-1 ring-border space-y-4">
        <p className="text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground/60">Info Pribadi</p>
        <div className="space-y-3">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-foreground" htmlFor="profile-name">Nama Panggilan</label>
            <input id="profile-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Nama panggilan" className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground" htmlFor="profile-age">Usia</label>
              <input id="profile-age" value={age} onChange={(e) => setAge(e.target.value)} type="number" placeholder="Usia" className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground" htmlFor="profile-phone">WhatsApp</label>
              <input id="profile-phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="08xx…" className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm" />
            </div>
          </div>
        </div>
      </section>

      {/* ── COMPANION PICKER ──────────────────────────────────────── */}
      <section className="rounded-3xl bg-card p-6 ring-1 ring-border space-y-4">
        <p className="text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground/60">Pendamping Default</p>
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
          {COMPANIONS.map((c) => {
            const sel = companion === c.key;
            return (
              <button
                key={c.key}
                onClick={() => setCompanion(c.key)}
                aria-pressed={sel}
                className={`flex flex-col items-center gap-1.5 rounded-2xl border-2 p-3 text-center transition-all duration-200 ${sel ? "border-primary bg-primary-soft" : "border-transparent bg-cream-deep hover:border-primary/30"}`}
              >
                <span className="text-2xl leading-none">{c.emoji}</span>
                <span className="text-[11px] font-medium text-foreground leading-tight">{c.name}</span>
                {c.premium && (
                  <span className="rounded-full bg-amber-100 px-1.5 py-0.5 text-[9px] font-bold text-amber-700">PRO</span>
                )}
              </button>
            );
          })}
        </div>
      </section>

      {/* ── COMM STYLE ────────────────────────────────────────────── */}
      <section className="rounded-3xl bg-card p-6 ring-1 ring-border space-y-4">
        <p className="text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground/60">Gaya Komunikasi</p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {COMM_STYLES.map((s) => {
            const sel = style === s.key;
            return (
              <button
                key={s.key}
                onClick={() => setStyle(s.key)}
                aria-pressed={sel}
                className={`rounded-2xl border-2 py-3 text-sm font-medium transition-all duration-200 ${sel ? "border-primary bg-primary-soft text-foreground" : "border-transparent bg-cream-deep text-muted-foreground hover:border-primary/30"}`}
              >
                {s.label}
              </button>
            );
          })}
        </div>
      </section>

      {/* ── SAVE ──────────────────────────────────────────────────── */}
      <button
        onClick={save}
        disabled={saving}
        className="w-full rounded-full bg-accent py-3.5 text-sm font-semibold text-accent-foreground shadow-peach transition-all hover:-translate-y-0.5 disabled:opacity-60"
      >
        {saving ? "Menyimpan…" : "Simpan Perubahan"}
      </button>

      {/* ── DANGER ZONE ───────────────────────────────────────────── */}
      <div className="rounded-3xl border border-destructive/20 bg-destructive/5 p-5 space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.15em] text-destructive/70">Zona Berbahaya</p>
        <button
          onClick={() => setSignOutConfirm(true)}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border border-destructive/30 py-3 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" className="h-4 w-4" aria-hidden="true">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
          </svg>
          Keluar dari akun
        </button>
      </div>

      {/* Sign out confirm */}
      <ModalDialog open={signOutConfirm} onClose={() => setSignOutConfirm(false)} title="Keluar dari JN-CALM?">
        <p className="text-sm text-muted-foreground">Kamu bisa masuk kembali kapan saja dengan akun yang sama.</p>
        <div className="mt-5 flex gap-2">
          <button onClick={signOut} className="flex-1 rounded-full bg-destructive py-2.5 text-sm font-semibold text-destructive-foreground">
            Ya, Keluar
          </button>
          <button onClick={() => setSignOutConfirm(false)} className="flex-1 rounded-full border border-border py-2.5 text-sm font-medium hover:bg-cream-deep">
            Batal
          </button>
        </div>
      </ModalDialog>
    </div>
  );
}
