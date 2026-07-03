import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { EmptyState } from "@/components/app/EmptyState";
import { BottomSheet, ModalDialog } from "@/components/app/BottomSheet";

export const Route = createFileRoute("/_authenticated/app/gratitude")({
  component: Page,
});

/* ── Gold sparkle burst ────────────────────────────────────────── */
function GoldSparkle({ active }: { active: boolean }) {
  if (!active) return null;
  const sparks = ["✨", "🌟", "💛", "⭐", "🌼", "🙏"];
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-full" aria-hidden="true">
      {sparks.map((s, i) => (
        <span
          key={i}
          className="absolute text-sm"
          style={{
            left: `${10 + i * 15}%`,
            top: "50%",
            animation: `confetti-burst 0.9s ease-out ${i * 70}ms both`,
          }}
        >
          {s}
        </span>
      ))}
    </div>
  );
}

function Page() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [g, setG] = useState({ gratitude1: "", gratitude2: "", gratitude3: "", best_moment: "", lesson: "" });
  const [saving, setSaving] = useState(false);
  const [heart, setHeart] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<any | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const removeEntry = async (id: string) => {
    if (!user) return;
    const { error } = await supabase.from("gratitude_entries").delete().eq("id", id);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Catatan rasa syukur berhasil dihapus 🙏");
      setSelectedEntry(null);
      setDeleteConfirmId(null);
      qc.invalidateQueries({ queryKey: ["gratitude", user.id] });
    }
  };

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
    if (!g.gratitude1 && !g.gratitude2 && !g.gratitude3) {
      toast.error("Isi minimal satu hal yang kamu syukuri.");
      return;
    }
    setSaving(true);
    const { error } = await supabase.from("gratitude_entries").insert({ ...g, user_id: user.id });
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    setHeart(true);
    toast.success("Tersimpan 🙏");
    setG({ gratitude1: "", gratitude2: "", gratitude3: "", best_moment: "", lesson: "" });
    setTimeout(() => setHeart(false), 1200);
    qc.invalidateQueries({ queryKey: ["gratitude", user.id] });
  };

  const monthCount = list?.filter((e) => {
    const d = new Date(e.created_at);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length ?? 0;

  return (
    <div className="space-y-6">
      {/* Gold gradient header */}
      <div
        className="relative overflow-hidden rounded-3xl px-6 pt-6 pb-5"
        style={{
          background: "linear-gradient(135deg, oklch(0.977 0.008 85) 0%, oklch(0.96 0.055 78) 40%, oklch(0.97 0.04 55) 100%)",
          backgroundSize: "300% 300%",
          animation: "gradient-shift 11s ease-in-out infinite",
        }}
      >
        {/* Gold blob */}
        <div
          className="absolute -right-6 -top-6 h-36 w-36 rounded-full pointer-events-none"
          style={{ background: "oklch(0.82 0.14 75 / 0.2)", filter: "blur(35px)", animation: "blob-drift 16s ease-in-out infinite" }}
        />
        <div
          className="absolute bottom-0 left-8 h-24 w-24 rounded-full pointer-events-none"
          style={{ background: "oklch(0.77 0.085 40 / 0.12)", filter: "blur(25px)", animation: "blob-drift-alt 20s ease-in-out infinite" }}
        />
        <div className="relative flex items-start justify-between">
          <div>
            <h1 className="font-display text-3xl font-semibold">Gratitude Journal</h1>
            <p className="mt-1 text-sm text-muted-foreground">Tiga hal kecil yang kamu syukuri hari ini.</p>
          </div>
          {monthCount > 0 && (
            <span className="shrink-0 rounded-full bg-white/60 backdrop-blur-sm px-3 py-1.5 text-xs font-semibold text-amber-700 shadow-sm" style={{ animation: "streak-pulse 2.4s ease-in-out infinite" }}>
              🙏 {monthCount}× bulan ini
            </span>
          )}
        </div>
      </div>

      {/* ── WRITE FORM ──────────────────────────────────────────── */}
      <section className="rounded-3xl bg-card p-6 ring-1 ring-border/60 shadow-card space-y-4">
        <div className="flex items-center gap-3">
          <div
            className="grid h-10 w-10 place-items-center rounded-2xl text-xl shadow-sm"
            style={{ background: "oklch(0.96 0.04 75)" }}
          >
            🙏
          </div>
          <p className="font-semibold text-foreground">Aku bersyukur untuk…</p>
        </div>

        {([
          { key: "gratitude1" as const, num: 1 },
          { key: "gratitude2" as const, num: 2 },
          { key: "gratitude3" as const, num: 3 },
        ]).map(({ key, num }) => (
          <div key={key} className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-bold select-none" style={{ color: "oklch(0.82 0.14 75 / 0.5)" }}>
              {num}.
            </span>
            <input
              value={g[key]}
              onChange={(e) => setG({ ...g, [key]: e.target.value })}
              placeholder={`Hal ${num} yang aku syukuri…`}
              className="w-full rounded-2xl border border-border bg-background py-3 pl-10 pr-4 text-sm transition-all duration-200"
              style={{ "--tw-ring-color": "oklch(0.82 0.14 75 / 0.3)" } as React.CSSProperties}
            />
          </div>
        ))}

        <div className="border-t border-border/60 pt-4 space-y-3">
          <div>
            <label className="mb-1.5 flex items-center gap-1.5 text-sm font-semibold" htmlFor="best-moment">
              ⭐ Momen terbaik hari ini
            </label>
            <input
              id="best-moment"
              value={g.best_moment}
              onChange={(e) => setG({ ...g, best_moment: e.target.value })}
              placeholder="Hal terbaik yang terjadi hari ini…"
              className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm transition-all duration-200"
            />
          </div>
          <div>
            <label className="mb-1.5 flex items-center gap-1.5 text-sm font-semibold" htmlFor="lesson">
              💡 Pelajaran hari ini
            </label>
            <input
              id="lesson"
              value={g.lesson}
              onChange={(e) => setG({ ...g, lesson: e.target.value })}
              placeholder="Apa yang kamu pelajari hari ini?…"
              className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm transition-all duration-200"
            />
          </div>
        </div>

        <div className="relative">
          <GoldSparkle active={heart} />
          <button
            onClick={save}
            disabled={saving}
            className={`relative w-full overflow-hidden rounded-full py-3.5 text-sm font-semibold transition-all duration-350 disabled:opacity-60 btn-spring ${
              heart
                ? "text-white shadow-glow-gold"
                : "bg-accent text-accent-foreground shadow-peach"
            }`}
            style={heart ? { background: "linear-gradient(135deg, oklch(0.82 0.14 75), oklch(0.77 0.085 40))" } : {}}
          >
            {heart ? (
              <span className="animate-heart-pulse inline-flex items-center gap-2">
                🌟 Tersimpan dengan penuh syukur!
              </span>
            ) : saving ? "Menyimpan…" : "Simpan Gratitude"}
          </button>
        </div>
      </section>

      {/* ── HISTORY ─────────────────────────────────────────────── */}
      {list?.length === 0 ? (
        <EmptyState
          emoji="🙏"
          title="Mulai bersyukur hari ini"
          description="Menulin gratitude setiap hari terbukti meningkatkan kebahagiaan dan mengurangi stres."
        />
      ) : (
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground/60">Riwayat</p>
          {list?.map((e, idx) => (
            <div
              key={e.id}
              onClick={() => setSelectedEntry(e)}
              className="rounded-3xl bg-card p-5 ring-1 ring-border/60 shadow-card transition-all duration-250 hover:shadow-elevated hover:-translate-y-0.5 animate-slide-up cursor-pointer hover:bg-primary-soft/30"
              style={{
                animationDelay: `${idx * 40}ms`,
                borderLeft: "3px solid oklch(0.82 0.14 75 / 0.4)",
              }}
            >
              <p className="text-xs font-medium text-muted-foreground">
                {new Date(e.created_at).toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long" })}
              </p>
              <ul className="mt-3 space-y-1.5">
                {[e.gratitude1, e.gratitude2, e.gratitude3].filter(Boolean).map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <span className="mt-0.5 font-bold" style={{ color: "oklch(0.82 0.14 75)" }}>✓</span>
                    <span className="text-foreground">{item}</span>
                  </li>
                ))}
              </ul>
              {(e.best_moment || e.lesson) && (
                <div className="mt-3 space-y-1.5 border-t border-border/60 pt-3">
                  {e.best_moment && (
                    <p className="text-xs text-muted-foreground"><span className="font-medium">⭐ Terbaik:</span> {e.best_moment}</p>
                  )}
                  {e.lesson && (
                    <p className="text-xs text-muted-foreground"><span className="font-medium">💡 Pelajaran:</span> {e.lesson}</p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ── DETAIL GRATITUDE DIALOG ───────────────────────────── */}
      <ModalDialog
        open={!!selectedEntry}
        onClose={() => setSelectedEntry(null)}
        title="🙏 Lembaran Rasa Syukur"
      >
        {selectedEntry && (() => {
          const formattedDate = new Date(selectedEntry.created_at).toLocaleString("id-ID", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
          });

          return (
            <div className="space-y-5">
              {/* Header Info */}
              <div className="flex items-center gap-3 bg-amber-50/70 p-4 rounded-2xl border border-amber-200/40">
                <div className="text-3xl bg-white p-2.5 rounded-2xl shadow-sm leading-none shrink-0">
                  🙏
                </div>
                <div>
                  <h3 className="font-display text-sm font-bold text-amber-900">Aku Bersyukur Untuk Hari Ini</h3>
                  <p className="text-[11px] text-muted-foreground">{formattedDate}</p>
                </div>
              </div>

              {/* Gratitude list */}
              <div>
                <p className="mb-2 text-xs font-bold text-stone-500 uppercase tracking-wider">Tiga hal yang disyukuri</p>
                <ul className="space-y-2 bg-cream-deep/20 p-4 rounded-2xl border border-border/40">
                  {[selectedEntry.gratitude1, selectedEntry.gratitude2, selectedEntry.gratitude3].filter(Boolean).map((item, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm">
                      <span className="mt-0.5 font-bold text-xl leading-none select-none" style={{ color: "oklch(0.82 0.14 75)" }}>✓</span>
                      <span className="text-foreground font-medium">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Best Moment */}
              {selectedEntry.best_moment && (
                <div className="rounded-2xl bg-amber-50 border border-amber-100 p-4 flex gap-3 text-amber-950">
                  <span className="text-2xl select-none">⭐</span>
                  <div className="text-xs leading-relaxed">
                    <p className="font-bold text-amber-900 mb-0.5 uppercase tracking-wider text-[10px]">Momen Terbaik</p>
                    <p className="font-medium text-stone-700">{selectedEntry.best_moment}</p>
                  </div>
                </div>
              )}

              {/* Lesson */}
              {selectedEntry.lesson && (
                <div className="rounded-2xl bg-blue-50 border border-blue-100 p-4 flex gap-3 text-blue-950">
                  <span className="text-2xl select-none">💡</span>
                  <div className="text-xs leading-relaxed">
                    <p className="font-bold text-blue-900 mb-0.5 uppercase tracking-wider text-[10px]">Pelajaran Hari Ini</p>
                    <p className="font-medium text-stone-700">{selectedEntry.lesson}</p>
                  </div>
                </div>
              )}

              {/* Action buttons */}
              <div className="flex gap-3 pt-2 border-t border-border/40">
                <button
                  onClick={() => setDeleteConfirmId(selectedEntry.id)}
                  className="flex-1 rounded-full border border-destructive/20 hover:bg-destructive/5 py-3 text-xs font-bold text-destructive transition-all duration-200 active:scale-95"
                >
                  Hapus Catatan 🗑️
                </button>
                <button
                  onClick={() => setSelectedEntry(null)}
                  className="flex-1 rounded-full border border-stone-200 bg-stone-50 hover:bg-stone-100 py-3 text-xs font-bold text-stone-600 transition-all duration-200"
                >
                  Tutup
                </button>
              </div>
            </div>
          );
        })()}
      </ModalDialog>

      {/* ── DELETE CONFIRMATION DIALOG ─────────────────────────── */}
      <ModalDialog
        open={!!deleteConfirmId}
        onClose={() => setDeleteConfirmId(null)}
        title="Hapus Catatan Gratitude?"
      >
        <p className="text-xs text-muted-foreground leading-normal">
          Catatan rasa syukur ini akan terhapus secara permanen dari riwayatmu dan tidak dapat dikembalikan.
        </p>
        <div className="mt-5 flex gap-2">
          <button
            onClick={() => deleteConfirmId && removeEntry(deleteConfirmId)}
            className="flex-1 rounded-full bg-destructive py-2.5 text-xs font-bold text-white transition-all duration-200 hover:opacity-90"
          >
            Ya, Hapus Permanen
          </button>
          <button
            onClick={() => setDeleteConfirmId(null)}
            className="flex-1 rounded-full border border-border py-2.5 text-xs font-bold hover:bg-cream-deep transition-all duration-200"
          >
            Batal
          </button>
        </div>
      </ModalDialog>
    </div>
  );
}

