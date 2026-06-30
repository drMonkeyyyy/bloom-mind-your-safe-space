import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { EmptyState } from "@/components/app/EmptyState";

export const Route = createFileRoute("/_authenticated/app/gratitude")({
  component: Page,
});

function Page() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [g, setG] = useState({ gratitude1: "", gratitude2: "", gratitude3: "", best_moment: "", lesson: "" });
  const [saving, setSaving] = useState(false);
  const [heart, setHeart] = useState(false);

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
    setTimeout(() => setHeart(false), 1000);
    qc.invalidateQueries({ queryKey: ["gratitude", user.id] });
  };

  const monthCount = list?.filter((e) => {
    const d = new Date(e.created_at);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-display text-3xl font-semibold">Gratitude Journal</h1>
          <p className="mt-1 text-sm text-muted-foreground">Tiga hal kecil yang kamu syukuri hari ini.</p>
        </div>
        {monthCount > 0 && (
          <span className="shrink-0 rounded-full bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-600">
            🙏 {monthCount}× bulan ini
          </span>
        )}
      </div>

      {/* ── WRITE FORM ──────────────────────────────────────────── */}
      <section className="rounded-3xl bg-card p-6 ring-1 ring-border space-y-4">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-2xl bg-rose-50 text-xl">🙏</div>
          <p className="font-semibold text-foreground">Aku bersyukur untuk…</p>
        </div>

        {([
          { key: "gratitude1" as const, num: 1 },
          { key: "gratitude2" as const, num: 2 },
          { key: "gratitude3" as const, num: 3 },
        ]).map(({ key, num }) => (
          <div key={key} className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-bold text-primary/40 select-none">
              {num}.
            </span>
            <input
              value={g[key]}
              onChange={(e) => setG({ ...g, [key]: e.target.value })}
              placeholder={`Hal ${num} yang aku syukuri…`}
              className="w-full rounded-2xl border border-border bg-background py-3 pl-10 pr-4 text-sm"
            />
          </div>
        ))}

        <div className="border-t border-border pt-4 space-y-3">
          <div>
            <label className="mb-1.5 flex items-center gap-1.5 text-sm font-semibold" htmlFor="best-moment">
              ⭐ Momen terbaik hari ini
            </label>
            <input
              id="best-moment"
              value={g.best_moment}
              onChange={(e) => setG({ ...g, best_moment: e.target.value })}
              placeholder="Hal terbaik yang terjadi hari ini…"
              className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm"
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
              className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm"
            />
          </div>
        </div>

        <button
          onClick={save}
          disabled={saving}
          className={`w-full rounded-full py-3.5 text-sm font-semibold shadow-peach transition-all duration-300 disabled:opacity-60 ${
            heart ? "bg-rose-400 text-white animate-heart-pulse" : "bg-accent text-accent-foreground hover:-translate-y-0.5"
          }`}
        >
          {heart ? "Tersimpan 🙏" : saving ? "Menyimpan…" : "Simpan Gratitude"}
        </button>
      </section>

      {/* ── HISTORY ─────────────────────────────────────────────── */}
      {list?.length === 0 ? (
        <EmptyState
          emoji="🙏"
          title="Mulai bersyukur hari ini"
          description="Menulis gratitude setiap hari terbukti meningkatkan kebahagiaan dan mengurangi stres."
        />
      ) : (
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground/60">Riwayat</p>
          {list?.map((e) => (
            <div key={e.id} className="rounded-3xl bg-card p-5 ring-1 ring-border">
              <p className="text-xs font-medium text-muted-foreground">
                {new Date(e.created_at).toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long" })}
              </p>
              <ul className="mt-3 space-y-1.5">
                {[e.gratitude1, e.gratitude2, e.gratitude3].filter(Boolean).map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <span className="mt-0.5 text-primary">✓</span>
                    <span className="text-foreground">{item}</span>
                  </li>
                ))}
              </ul>
              {(e.best_moment || e.lesson) && (
                <div className="mt-3 space-y-1.5 border-t border-border pt-3">
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
    </div>
  );
}
