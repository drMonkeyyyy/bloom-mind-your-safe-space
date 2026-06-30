import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { BottomSheet, ModalDialog } from "@/components/app/BottomSheet";
import { EmptyState } from "@/components/app/EmptyState";

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
    toast.success(editId ? "Journal diperbarui." : "Journal tersimpan 📓");
    setSheetOpen(false); reset();
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-semibold">Journal</h1>
          <p className="mt-1 text-sm text-muted-foreground">Refleksikan harimu, satu cerita setiap kali</p>
        </div>
        <button
          onClick={() => { reset(); setSheetOpen(true); }}
          className="rounded-full bg-accent px-4 py-2.5 text-sm font-semibold text-accent-foreground shadow-peach transition-all duration-200 hover:-translate-y-0.5"
          aria-label="Tambah journal baru"
        >
          + Tulis
        </button>
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
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground/60">{month}</p>
              <div className="space-y-3">
                {entries.map((j) => {
                  const isExpanded = expanded === j.id;
                  return (
                    <div
                      key={j.id}
                      className="rounded-3xl bg-card p-5 ring-1 ring-border transition-all duration-200 hover:shadow-card"
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
                            className="rounded-full border border-border px-3 py-1 text-[11px] font-medium text-foreground transition-colors hover:bg-cream-deep"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(j.id)}
                            className="rounded-full border border-destructive/30 px-3 py-1 text-[11px] font-medium text-destructive transition-colors hover:bg-destructive/5"
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
                        <div className="mt-4 space-y-2.5 border-t border-border pt-4 animate-slide-up">
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
                className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm resize-none placeholder:text-muted-foreground/60"
              />
            </div>
          ))}
          <div className="flex gap-2 pt-1">
            <button
              onClick={save}
              className="flex-1 rounded-full bg-accent py-3 text-sm font-semibold text-accent-foreground shadow-peach"
            >
              Simpan Journal
            </button>
            <button
              onClick={() => { setSheetOpen(false); reset(); }}
              className="rounded-full border border-border px-5 py-3 text-sm font-medium text-foreground hover:bg-cream-deep"
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
            className="flex-1 rounded-full bg-destructive py-2.5 text-sm font-semibold text-destructive-foreground"
          >
            Ya, Hapus
          </button>
          <button
            onClick={() => setDeleteConfirm(null)}
            className="flex-1 rounded-full border border-border py-2.5 text-sm font-medium hover:bg-cream-deep"
          >
            Batal
          </button>
        </div>
      </ModalDialog>
    </div>
  );
}
