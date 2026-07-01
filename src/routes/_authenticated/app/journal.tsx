import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { BottomSheet, ModalDialog } from "@/components/app/BottomSheet";
import { EmptyState } from "@/components/app/EmptyState";

interface TimeCapsule {
  id: string;
  createdAt: string;
  unlockDate: string;
  message: string;
}

export const Route = createFileRoute("/_authenticated/app/journal")({
  component: JournalPage,
});

const FIELDS = [
  { key: "summary" as const, label: "Ringkasan hari ini", placeholder: "Apa yang terjadi hari ini?", rows: 4, icon: "📝" },
  { key: "main_emotion" as const, label: "Emosi utama", placeholder: "Apa yang kamu rasakan?", rows: 2, icon: "💭" },
  { key: "main_trigger" as const, label: "Pemicu utama", placeholder: "Apa yang memicunya?", rows: 2, icon: "⚡" },
  { key: "lesson" as const, label: "Pelajaran hari ini", placeholder: "Apa yang bisa kamu pelajari?", rows: 2, icon: "💡" },
  { key: "gratitude" as const, label: "Syukur hari ini", placeholder: "Hal kecil yang kamu syukuri…", rows: 2, icon: "🙏" },
  { key: "tomorrow_focus" as const, label: "Fokus besok", placeholder: "Satu hal yang ingin kamu lakukan besok", rows: 2, icon: "🎯" },
];

type FormKey = typeof FIELDS[number]["key"];

function groupByMonth(items: any[]) {
  const groups: Record<string, any[]> = {};
  for (const item of items) {
    const key = new Date(item.created_at).toLocaleDateString("id-ID", { month: "long", year: "numeric" });
    if (!groups[key]) groups[key] = [];
    groups[key].push(item);
  }
  return groups;
}

function JournalPage() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [form, setForm] = useState<Record<FormKey, string>>({ summary: "", main_emotion: "", main_trigger: "", lesson: "", gratitude: "", tomorrow_focus: "" });
  const [editId, setEditId] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [savedAnim, setSavedAnim] = useState(false);

  // Time Capsule setup
  const [capsules, setCapsules] = useState<TimeCapsule[]>([]);
  const [capsuleOpen, setCapsuleOpen] = useState(false);
  const [newCapsuleText, setNewCapsuleText] = useState("");
  const [newCapsuleTarget, setNewCapsuleTarget] = useState("1month");
  const [viewCapsule, setViewCapsule] = useState<TimeCapsule | null>(null);

  useEffect(() => {
    if (!user) return;
    const data = localStorage.getItem(`bloom_time_capsules_${user.id}`);
    if (data) {
      setCapsules(JSON.parse(data));
    }
  }, [user]);

  const saveCapsule = () => {
    if (!user || !newCapsuleText.trim()) return;
    
    let targetDate = new Date();
    if (newCapsuleTarget === "1min") {
      targetDate.setMinutes(targetDate.getMinutes() + 1);
    } else if (newCapsuleTarget === "3mins") {
      targetDate.setMinutes(targetDate.getMinutes() + 3);
    } else if (newCapsuleTarget === "1month") {
      targetDate.setMonth(targetDate.getMonth() + 1);
    } else if (newCapsuleTarget === "3months") {
      targetDate.setMonth(targetDate.getMonth() + 3);
    } else if (newCapsuleTarget === "6months") {
      targetDate.setMonth(targetDate.getMonth() + 6);
    }

    const newCapsule = {
      id: Math.random().toString(36).substring(2, 9),
      createdAt: new Date().toISOString(),
      unlockDate: targetDate.toISOString(),
      message: newCapsuleText,
    };

    const updated = [newCapsule, ...capsules];
    setCapsules(updated);
    localStorage.setItem(`bloom_time_capsules_${user.id}`, JSON.stringify(updated));
    setNewCapsuleText("");
    setCapsuleOpen(false);
    toast.success("Kapsul waktu berhasil dikunci! 🔒");
  };

  const getCapsuleStatus = (unlockDateStr: string) => {
    const diff = new Date(unlockDateStr).getTime() - new Date().getTime();
    if (diff <= 0) return { locked: false, label: "Siap Dibuka!" };
    
    const minutes = Math.ceil(diff / 60000);
    if (minutes < 60) return { locked: true, label: `${minutes} menit lagi` };
    
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return { locked: true, label: `${days} hari lagi` };
  };

  const { data: items } = useQuery({
    queryKey: ["journals", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.from("journals").select("*").eq("user_id", user!.id).order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  const reset = () => { setForm({ summary: "", main_emotion: "", main_trigger: "", lesson: "", gratitude: "", tomorrow_focus: "" }); setEditId(null); };

  const save = async () => {
    if (!user) return;
    const payload = { ...form, user_id: user.id, source: "manual" as "manual" };
    const { error } = editId
      ? await supabase.from("journals").update(payload).eq("id", editId)
      : await supabase.from("journals").insert(payload);
    if (error) { toast.error(error.message); return; }
    setSavedAnim(true);
    toast.success(editId ? "Journal diperbarui." : "Journal tersimpan 📓");
    setSheetOpen(false); reset();
    setTimeout(() => setSavedAnim(false), 1000);
    qc.invalidateQueries({ queryKey: ["journals", user.id] });
    qc.invalidateQueries({ queryKey: ["last-journal", user.id] });
  };

  const remove = async (id: string) => {
    await supabase.from("journals").delete().eq("id", id);
    setDeleteConfirm(null);
    qc.invalidateQueries({ queryKey: ["journals", user!.id] });
    qc.invalidateQueries({ queryKey: ["last-journal", user!.id] });
    toast.success("Journal dihapus.");
  };

  const edit = (j: NonNullable<typeof items>[number]) => {
    setEditId(j.id);
    setForm({ summary: j.summary ?? "", main_emotion: j.main_emotion ?? "", main_trigger: j.main_trigger ?? "", lesson: j.lesson ?? "", gratitude: j.gratitude ?? "", tomorrow_focus: j.tomorrow_focus ?? "" });
    setSheetOpen(true);
  };

  const groups = groupByMonth(items ?? []);

  return (
    <div className="space-y-6">
      {/* Warm amber gradient header */}
      <div
        className="relative overflow-hidden rounded-3xl px-6 pt-6 pb-5"
        style={{
          background: "linear-gradient(140deg, oklch(0.977 0.008 85) 0%, oklch(0.96 0.04 70) 50%, oklch(0.97 0.025 50) 100%)",
          backgroundSize: "300% 300%",
          animation: "gradient-shift 14s ease-in-out infinite",
        }}
      >
        <div
          className="absolute -right-6 -top-6 h-36 w-36 rounded-full pointer-events-none"
          style={{ background: "oklch(0.77 0.085 40 / 0.15)", filter: "blur(35px)", animation: "blob-drift 20s ease-in-out infinite" }}
        />
        <div className="relative flex items-center justify-between">
          <div>
            <h1 className="font-display text-3xl font-semibold">Journal</h1>
            <p className="mt-1 text-sm text-muted-foreground">Refleksikan harimu, satu cerita setiap kali</p>
          </div>
          <button
            onClick={() => { reset(); setSheetOpen(true); }}
            className={`relative overflow-hidden rounded-full px-4 py-2.5 text-sm font-semibold shadow-peach transition-all duration-350 btn-spring ${
              savedAnim ? "bg-primary text-primary-foreground" : "bg-accent text-accent-foreground"
            }`}
            aria-label="Tambah journal baru"
          >
            {savedAnim ? "✓ Tersimpan!" : "+ Tulis"}
          </button>
        </div>
      </div>

      {/* ── TIME CAPSULE WIDGET ─────────────────────────────────── */}
      <div className="rounded-3xl bg-card p-5 ring-1 ring-border/60 shadow-card space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">✉️</span>
            <div>
              <h2 className="font-display text-lg font-semibold text-foreground">Kapsul Waktu Diri Sendiri</h2>
              <p className="text-[11px] text-muted-foreground">Kirim surat penyemangat untuk dirimu di masa depan.</p>
            </div>
          </div>
          <button
            onClick={() => setCapsuleOpen(true)}
            className="rounded-full bg-accent-soft px-3.5 py-1.5 text-xs font-semibold text-foreground transition-all duration-200 hover:shadow-sm hover:scale-102"
          >
            + Kunci Surat 🔒
          </button>
        </div>

        {capsules.length === 0 ? (
          <p className="text-xs text-muted-foreground/80 italic">Belum ada kapsul waktu yang terkunci.</p>
        ) : (
          <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
            {capsules.map((cap) => {
              const status = getCapsuleStatus(cap.unlockDate);
              return (
                <button
                  key={cap.id}
                  onClick={() => {
                    if (status.locked) {
                      toast.info(`Sabar ya, surat ini terkunci dan akan terbuka ${status.label} 🤫`);
                    } else {
                      setViewCapsule(cap);
                    }
                  }}
                  className={`flex shrink-0 items-center gap-2.5 rounded-2xl px-3.5 py-2.5 text-left border transition-all duration-250 hover:scale-102 active:scale-95 ${
                    status.locked
                      ? "border-border/60 bg-cream-deep/40 text-muted-foreground"
                      : "border-primary/30 bg-primary-soft/45 text-foreground animate-glow-pulse shadow-sm"
                  }`}
                >
                  <span className="text-lg">{status.locked ? "🔒" : "✉️"}</span>
                  <div className="text-[11px] leading-tight">
                    <p className="font-semibold">{status.locked ? "Kapsul Terkunci" : "Siap Dibuka!"}</p>
                    <p className="text-[10px] opacity-75">{status.label}</p>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Journal list */}
      {items?.length === 0 ? (
        <EmptyState
          emoji="📓"
          title="Belum ada journal"
          description="Mulai tulis refleksi pertamamu. Sekecil apapun itu berarti."
          action={{ label: "Tulis Journal Pertama", onClick: () => { reset(); setSheetOpen(true); } }}
        />
      ) : (
        <div className="space-y-6">
          {Object.entries(groups).map(([month, entries]) => (
            <div key={month}>
              <div className="mb-3 flex items-center gap-3">
                <div className="h-px flex-1 bg-border/60" />
                <p className="text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground/60">{month}</p>
                <div className="h-px flex-1 bg-border/60" />
              </div>
              <div className="space-y-3">
                {entries.map((j, idx) => {
                  const isExpanded = expanded === j.id;
                  return (
                    <div
                      key={j.id}
                      className="rounded-3xl bg-card p-5 ring-1 ring-border/60 shadow-card transition-all duration-250 hover:shadow-elevated hover:-translate-y-0.5 animate-slide-up"
                      style={{
                        animationDelay: `${idx * 40}ms`,
                        borderLeft: "3px solid oklch(0.77 0.085 40 / 0.35)",
                      }}
                    >
                      {/* Header */}
                      <div className="flex items-start justify-between gap-3">
                        <button
                          className="min-w-0 flex-1 text-left"
                          onClick={() => setExpanded(isExpanded ? null : j.id)}
                          aria-expanded={isExpanded}
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-foreground">
                              {new Date(j.created_at).toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long" })}
                            </span>
                            <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${j.source === "from_chat" ? "bg-primary-soft text-primary" : "bg-cream-deep text-muted-foreground"}`}>
                              {j.source === "from_chat" ? "Dari Chat" : "Manual"}
                            </span>
                          </div>
                          {j.summary && (
                            <p className={`mt-2 text-sm leading-relaxed text-muted-foreground ${isExpanded ? "" : "line-clamp-2"}`}>
                              {j.summary}
                            </p>
                          )}
                        </button>

                        <div className="flex shrink-0 flex-col gap-1">
                          <button
                            onClick={() => edit(j)}
                            className="rounded-full border border-border px-3 py-1 text-[11px] font-medium text-foreground transition-all duration-200 hover:bg-cream-deep hover:scale-105"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(j.id)}
                            className="rounded-full border border-destructive/30 px-3 py-1 text-[11px] font-medium text-destructive transition-all duration-200 hover:bg-destructive/5"
                          >
                            Hapus
                          </button>
                        </div>
                      </div>

                      {/* Tags */}
                      <div className="mt-3 flex flex-wrap gap-2">
                        {j.main_emotion && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-primary-soft px-2.5 py-1 text-[11px] font-medium">
                            💭 {j.main_emotion}
                          </span>
                        )}
                        {j.main_trigger && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-accent-soft px-2.5 py-1 text-[11px] font-medium">
                            ⚡ {j.main_trigger}
                          </span>
                        )}
                      </div>

                      {/* Expanded content */}
                      {isExpanded && (
                        <div className="mt-4 space-y-2.5 border-t border-border/60 pt-4 animate-slide-up">
                          {j.lesson && (
                            <div className="flex gap-2 text-sm">
                              <span className="shrink-0">💡</span>
                              <div><span className="font-medium">Pelajaran: </span><span className="text-muted-foreground">{j.lesson}</span></div>
                            </div>
                          )}
                          {j.gratitude && (
                            <div className="flex gap-2 text-sm">
                              <span className="shrink-0">🙏</span>
                              <div><span className="font-medium">Syukur: </span><span className="text-muted-foreground">{j.gratitude}</span></div>
                            </div>
                          )}
                          {j.tomorrow_focus && (
                            <div className="flex gap-2 text-sm">
                              <span className="shrink-0">🎯</span>
                              <div><span className="font-medium">Besok: </span><span className="text-muted-foreground">{j.tomorrow_focus}</span></div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── WRITE SHEET ─────────────────────────────────────────── */}
      <BottomSheet
        open={sheetOpen}
        onClose={() => { setSheetOpen(false); reset(); }}
        title={editId ? "Edit Journal" : "Tulis Journal Baru"}
      >
        <div className="space-y-4">
          {FIELDS.map(({ key, label, placeholder, rows, icon }) => (
            <div key={key}>
              <label className="mb-1.5 flex items-center gap-1.5 text-sm font-semibold text-foreground" htmlFor={`journal-${key}`}>
                <span>{icon}</span> {label}
              </label>
              <textarea
                id={`journal-${key}`}
                value={form[key]}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                placeholder={placeholder}
                rows={rows}
                className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm resize-none placeholder:text-muted-foreground/60 transition-all duration-200"
              />
            </div>
          ))}
          <div className="flex gap-2 pt-1">
            <button
              onClick={save}
              className="flex-1 rounded-full bg-accent py-3 text-sm font-semibold text-accent-foreground shadow-peach transition-all duration-250 hover:-translate-y-0.5 active:scale-95"
            >
              Simpan Journal
            </button>
            <button
              onClick={() => { setSheetOpen(false); reset(); }}
              className="rounded-full border border-border px-5 py-3 text-sm font-medium text-foreground transition-all duration-200 hover:bg-cream-deep"
            >
              Batal
            </button>
          </div>
        </div>
      </BottomSheet>

      {/* ── DELETE CONFIRM ──────────────────────────────────────── */}
      <ModalDialog
        open={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        title="Hapus Journal?"
      >
        <p className="text-sm text-muted-foreground">Journal ini akan dihapus permanen dan tidak bisa dikembalikan.</p>
        <div className="mt-5 flex gap-2">
          <button
            onClick={() => deleteConfirm && remove(deleteConfirm)}
            className="flex-1 rounded-full bg-destructive py-2.5 text-sm font-semibold text-destructive-foreground transition-all duration-200 hover:opacity-90"
          >
            Ya, Hapus
          </button>
          <button
            onClick={() => setDeleteConfirm(null)}
            className="flex-1 rounded-full border border-border py-2.5 text-sm font-medium hover:bg-cream-deep transition-all duration-200"
          >
            Batal
          </button>
        </div>
      </ModalDialog>

      {/* ── TIME CAPSULE CREATE SHEET ───────────────────────────── */}
      <BottomSheet
        open={capsuleOpen}
        onClose={() => { setCapsuleOpen(false); setNewCapsuleText(""); }}
        title="Kunci Kapsul Waktu Baru 🔒"
      >
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-semibold" htmlFor="capsule-msg">
              Pesan untuk dirimu di masa depan
            </label>
            <textarea
              id="capsule-msg"
              value={newCapsuleText}
              onChange={(e) => setNewCapsuleText(e.target.value)}
              placeholder="Tulis harapan, saran, doa, atau apa pun yang ingin kamu sampaikan kepada dirimu sendiri..."
              rows={5}
              className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm resize-none placeholder:text-muted-foreground/60 transition-all duration-200"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-semibold" htmlFor="capsule-time">
              Kapan kapsul ini boleh dibuka?
            </label>
            <select
              id="capsule-time"
              value={newCapsuleTarget}
              onChange={(e) => setNewCapsuleTarget(e.target.value)}
              className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm transition-all duration-200"
            >
              <option value="1min">1 Menit (Untuk testing)</option>
              <option value="3mins">3 Menit (Untuk testing)</option>
              <option value="1month">1 Bulan Ke Depan</option>
              <option value="3months">3 Bulan Ke Depan</option>
              <option value="6months">6 Bulan Ke Depan</option>
            </select>
          </div>

          <div className="flex gap-2 pt-2">
            <button
              onClick={saveCapsule}
              disabled={!newCapsuleText.trim()}
              className="flex-1 rounded-full bg-accent py-3 text-sm font-semibold text-accent-foreground shadow-peach transition-all duration-250 hover:-translate-y-0.5 disabled:opacity-40"
            >
              Kunci Kapsul 🔒
            </button>
            <button
              onClick={() => { setCapsuleOpen(false); setNewCapsuleText(""); }}
              className="rounded-full border border-border px-5 py-3 text-sm font-medium hover:bg-cream-deep transition-all duration-200"
            >
              Batal
            </button>
          </div>
        </div>
      </BottomSheet>

      {/* ── TIME CAPSULE VIEW DIALOG ───────────────────────────── */}
      <ModalDialog
        open={!!viewCapsule}
        onClose={() => setViewCapsule(null)}
        title="💌 Surat Dari Dirimu di Masa Lalu"
      >
        {viewCapsule && (
          <div className="space-y-4">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">
              Ditulis pada: {new Date(viewCapsule.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}
            </p>
            <div 
              className="rounded-2xl p-5 border border-amber-200/40 shadow-sm leading-relaxed text-foreground/90 font-display italic text-base whitespace-pre-wrap"
              style={{ background: "linear-gradient(135deg, oklch(0.97 0.05 75 / 0.3) 0%, oklch(0.99 0.03 80 / 0.1) 100%)" }}
            >
              "{viewCapsule.message}"
            </div>
            <button
              onClick={() => setViewCapsule(null)}
              className="w-full rounded-full bg-primary py-2.5 text-sm font-semibold text-primary-foreground shadow-soft transition-all duration-200 hover:-translate-y-0.5 active:scale-95"
            >
              Tutup & Simpan Kembali 🤍
            </button>
          </div>
        )}
      </ModalDialog>
    </div>
  );
}
