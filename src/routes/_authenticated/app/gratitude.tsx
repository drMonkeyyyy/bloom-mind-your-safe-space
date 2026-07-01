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
          description="Menulis gratitude setiap hari terbukti meningkatkan kebahagiaan dan mengurangi stres."
        />
      ) : (
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground/60">Riwayat</p>
          {list?.map((e, idx) => (
            <div
              key={e.id}
              className="rounded-3xl bg-card p-5 ring-1 ring-border/60 shadow-card transition-all duration-250 hover:shadow-elevated hover:-translate-y-0.5 animate-slide-up"
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
    </div>
  );
}
