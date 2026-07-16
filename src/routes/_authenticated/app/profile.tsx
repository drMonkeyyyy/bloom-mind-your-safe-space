import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useProfile } from "@/hooks/use-profile";
import { supabase } from "@/integrations/supabase/client";
import { COMPANIONS, COMM_STYLES } from "@/lib/companions";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { ModalDialog } from "@/components/app/BottomSheet";
import { useServerFn } from "@tanstack/react-start";
import { initStorageBuckets } from "@/lib/chat.functions";

export const Route = createFileRoute("/_authenticated/app/profile")({
  component: Page,
});

function Page() {
  const { user } = useAuth();
  const { data: profile } = useProfile(user?.id);
  const qc = useQueryClient();
  const navigate = useNavigate();
  const initBuckets = useServerFn(initStorageBuckets);
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [phone, setPhone] = useState("");
  const [companion, setCompanion] = useState("sahabat");
  const [style, setStyle] = useState("supportive");
  const [saving, setSaving] = useState(false);
  const [signOutConfirm, setSignOutConfirm] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [syncJournalMemory, setSyncJournalMemory] = useState<boolean>(false);

  useEffect(() => {
    if (profile) {
      setName(profile.name ?? "");
      setAge(profile.age?.toString() ?? "");
      setPhone(profile.phone ?? "");
      setCompanion(profile.selected_companion ?? "sahabat");
      setStyle(profile.communication_style ?? "supportive");
      setAvatarUrl(profile.avatar_url ?? null);
      setSyncJournalMemory(profile.sync_journal_memory ?? false);
    }
  }, [profile]);

  const save = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from("profiles").update({
      name, age: age ? parseInt(age) : null, phone,
      selected_companion: companion as "sahabat",
      communication_style: style as "supportive",
      sync_journal_memory: syncJournalMemory,
    }).eq("id", user.id);
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Profil tersimpan.");
    qc.invalidateQueries({ queryKey: ["profile", user.id] });
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Ukuran file maksimal 2MB");
      return;
    }

    setUploadingAvatar(true);
    try {
      await initBuckets();
      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}/${crypto.randomUUID()}.${fileExt}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("profile-avatars")
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("profile-avatars")
        .getPublicUrl(fileName);
      
      const newAvatarUrl = urlData.publicUrl;

      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: newAvatarUrl })
        .eq("id", user.id);

      if (updateError) throw updateError;

      setAvatarUrl(newAvatarUrl);
      toast.success("Foto profil berhasil diperbarui! 📷");
      qc.invalidateQueries({ queryKey: ["profile", user.id] });
    } catch (err: any) {
      toast.error(err.message || "Gagal meng-upload foto profil");
    } finally {
      setUploadingAvatar(false);
    }
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
        <div className="relative group shrink-0">
          <input
            type="file"
            accept="image/*"
            onChange={handleAvatarChange}
            disabled={uploadingAvatar}
            className="hidden"
            id="profile-avatar-input"
          />
          <label
            htmlFor="profile-avatar-input"
            className="relative block h-16 w-16 cursor-pointer overflow-hidden rounded-2xl ring-2 ring-primary/20 transition-all hover:ring-primary shadow-soft"
          >
            {uploadingAvatar ? (
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 text-white text-[10px] font-bold">
                Memproses...
              </div>
            ) : avatarUrl ? (
              <img src={avatarUrl} alt={name} className="h-full w-full object-cover" />
            ) : (
              <div className="grid h-full w-full place-items-center bg-gradient-to-br from-primary to-accent font-display text-2xl font-bold text-white">
                {initials}
              </div>
            )}
            
            <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-5 w-5 text-white">
                <path d="M6.82 21h10.36c1.6 0 2.82-1.22 2.82-2.82V9.18c0-1.6-1.22-2.82-2.82-2.82h-1.3l-.9-1.8A1.9 1.9 0 0 0 13.29 3.5h-2.58c-.7 0-1.3.43-1.6.99l-.9 1.8h-1.3C5.22 6.36 4 7.58 4 9.18v9c0 1.6 1.22 2.82 2.82 2.82Z" />
                <path d="M12 16.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z" />
              </svg>
            </div>
          </label>
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

      {/* ── SINKRONISASI MEMORI JURNAL (PREMIUM ONLY) ───────────────── */}
      <section className="rounded-3xl bg-card p-6 ring-1 ring-border space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground/60">Integrasi AI</p>
            <h3 className="mt-1 font-display text-sm font-semibold text-foreground">Memori Jurnal Harian</h3>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Izinkan Pendamping AI Anda membaca jurnal harian Anda (7 hari terakhir) untuk memberikan saran dan dukungan yang lebih personal.
            </p>
          </div>
          <button
            onClick={() => {
              if (!isPremium) {
                toast.error("Fitur ini khusus untuk anggota Premium. Yuk, upgrade plan kamu! 🌟");
                return;
              }
              setSyncJournalMemory(!syncJournalMemory);
            }}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
              syncJournalMemory ? "bg-primary" : "bg-muted"
            }`}
            role="switch"
            aria-checked={syncJournalMemory}
          >
            <span
              aria-hidden="true"
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                syncJournalMemory ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </button>
        </div>
        {!isPremium && (
          <div className="rounded-2xl bg-amber-50/70 p-3.5 ring-1 ring-amber-100/50 text-xs text-amber-800 flex items-start gap-2">
            <span className="text-sm">✨</span>
            <p>
              Tersedia untuk anggota <strong>Premium</strong>. Aktifkan untuk membuat percakapan dengan Pendamping AI terasa jauh lebih personal dan terhubung.
            </p>
          </div>
        )}
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
