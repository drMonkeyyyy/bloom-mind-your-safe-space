import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ProgressRing } from "@/components/app/ProgressRing";
import { EmptyState } from "@/components/app/EmptyState";

const DEFAULTS = [
  { name: "Minum air putih", icon: "💧" },
  { name: "Jalan kaki", icon: "🚶" },
  { name: "Olahraga", icon: "🏃" },
  { name: "Tidur cukup", icon: "😴" },
  { name: "Meditasi", icon: "🧘" },
  { name: "Membaca", icon: "📖" },
  { name: "Journaling", icon: "📓" },
];

export const Route = createFileRoute("/_authenticated/app/habits")({
  component: HabitPage,
});

/* ── Confetti burst component ──────────────────────────────────── */
function ConfettiBurst({ active }: { active: boolean }) {
  if (!active) return null;
  const pieces = ["🌿", "✨", "🌸", "💚", "⭐", "🌱"];
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl" aria-hidden="true">
      {pieces.map((piece, i) => (
        <span
          key={i}
          className="absolute text-base"
          style={{
            left: `${15 + i * 14}%`,
            top: "50%",
            animation: `confetti-burst 0.8s ease-out ${i * 60}ms both`,
          }}
        >
          {piece}
        </span>
      ))}
    </div>
  );
}

/* ── Animated progress bar ─────────────────────────────────────── */
function AnimatedProgressBar({ pct, allDone }: { pct: number; allDone: boolean }) {
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setWidth(pct), 100);
    return () => clearTimeout(t);
  }, [pct]);

  return (
    <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-cream-deep shadow-inner">
      <div
        className="h-2.5 rounded-full transition-all duration-700"
        style={{
          width: `${width}%`,
          background: allDone
            ? "linear-gradient(90deg, var(--color-primary), var(--color-accent))"
            : "var(--color-primary)",
          transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
          boxShadow: allDone ? "0 0 8px var(--color-primary)" : "none",
        }}
      />
    </div>
  );
}

function HabitPage() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [newName, setNewName] = useState("");
  const [newIcon, setNewIcon] = useState("✨");
  const [addOpen, setAddOpen] = useState(false);
  const [justCompleted, setJustCompleted] = useState<string | null>(null);
  const today = new Date().toISOString().slice(0, 10);

  const { data: habits } = useQuery({
    queryKey: ["habits", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.from("habits").select("*").eq("user_id", user!.id).eq("is_active", true).order("created_at");
      return data ?? [];
    },
  });
  const { data: logs } = useQuery({
    queryKey: ["habit-logs-today", user?.id, today],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.from("habit_logs").select("*").eq("user_id", user!.id).eq("date", today);
      return data ?? [];
    },
  });

  const add = async (name: string, icon = "✨") => {
    if (!user || !name.trim()) return;
    const { error } = await supabase.from("habits").insert({ user_id: user.id, name, icon });
    if (error) toast.error(error.message);
    else {
      setNewName(""); setAddOpen(false);
      qc.invalidateQueries({ queryKey: ["habits", user.id] });
    }
  };

  const toggle = async (habitId: string) => {
    if (!user) return;
    const existing = logs?.find((l) => l.habit_id === habitId);
    if (existing) {
      await supabase.from("habit_logs").delete().eq("id", existing.id);
    } else {
      await supabase.from("habit_logs").insert({ user_id: user.id, habit_id: habitId, date: today, completed: true });
      setJustCompleted(habitId);
      setTimeout(() => setJustCompleted(null), 900);
    }
    qc.invalidateQueries({ queryKey: ["habit-logs-today", user.id, today] });
    qc.invalidateQueries({ queryKey: ["habit-streak", user.id] });
    qc.invalidateQueries({ queryKey: ["habits-today-count", user.id] });
  };

  const remove = async (id: string) => {
    await supabase.from("habits").update({ is_active: false }).eq("id", id);
    qc.invalidateQueries({ queryKey: ["habits", user!.id] });
  };

  const total = habits?.length ?? 0;
  const done = logs?.length ?? 0;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;
  const allDone = total > 0 && done >= total;

  return (
    <div className="space-y-6">
      {/* Page header with mint gradient */}
      <div
        className="relative overflow-hidden rounded-3xl px-6 pt-6 pb-5"
        style={{
          background: "linear-gradient(135deg, oklch(0.977 0.008 85) 0%, oklch(0.95 0.03 170) 40%, oklch(0.97 0.02 185) 100%)",
          backgroundSize: "300% 300%",
          animation: "gradient-shift 13s ease-in-out infinite",
        }}
      >
        <div
          className="absolute -right-8 -top-8 h-32 w-32 rounded-full pointer-events-none"
          style={{ background: "oklch(0.71 0.045 160 / 0.15)", filter: "blur(30px)", animation: "blob-drift 18s ease-in-out infinite" }}
        />
        <div className="relative flex items-center justify-between">
          <div>
            <h1 className="font-display text-3xl font-semibold">Habit Tracker</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {new Date().toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long" })}
            </p>
          </div>
          <button
            onClick={() => setAddOpen(!addOpen)}
            className="rounded-full bg-accent px-4 py-2.5 text-sm font-semibold text-accent-foreground shadow-peach transition-all duration-250 hover:-translate-y-0.5 hover:shadow-glow-peach active:scale-95"
          >
            + Tambah
          </button>
        </div>
      </div>

      {/* ── PROGRESS HEADER ─────────────────────────────────────── */}
      {total > 0 && (
        <div
          className={`relative flex items-center gap-5 rounded-3xl p-6 transition-all duration-700 overflow-hidden ${
            allDone
              ? "bg-gradient-to-br from-primary/12 to-accent/12 ring-1 ring-primary/25 shadow-soft"
              : "bg-card ring-1 ring-border/60 shadow-card"
          }`}
        >
          {/* All-done celebration blob */}
          {allDone && (
            <div
              className="absolute -right-4 -top-4 h-28 w-28 rounded-full pointer-events-none"
              style={{
                background: "oklch(0.77 0.085 40 / 0.18)",
                filter: "blur(25px)",
                animation: "glow-pulse 3s ease-in-out infinite",
              }}
            />
          )}

          <ProgressRing
            value={pct}
            size={88}
            strokeWidth={8}
            color={allDone ? "var(--color-accent)" : "var(--color-primary)"}
          >
            <div className="text-center">
              <p className="font-display text-lg font-bold text-foreground leading-none">{done}</p>
              <p className="text-[10px] text-muted-foreground">/{total}</p>
            </div>
          </ProgressRing>

          <div className="relative flex-1">
            {allDone ? (
              <>
                <p className="font-display text-lg font-semibold text-foreground">
                  Semua habit selesai! 🎉
                </p>
                <p className="mt-0.5 text-sm text-muted-foreground">Luar biasa, kamu keren banget hari ini!</p>
              </>
            ) : (
              <>
                <p className="font-display text-lg font-semibold text-foreground">
                  {done} dari {total} selesai
                </p>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  {total - done} habit lagi untuk hari ini 💪
                </p>
              </>
            )}
            <AnimatedProgressBar pct={pct} allDone={allDone} />
          </div>
        </div>
      )}

      {/* ── ADD HABIT PANEL ──────────────────────────────────────── */}
      {addOpen && (
        <section className="rounded-3xl bg-card p-5 ring-1 ring-border/60 shadow-card animate-slide-up space-y-3">
          <p className="text-sm font-semibold">Tambah habit baru</p>
          <div className="flex gap-2">
            <div className="relative w-14">
              <input
                value={newIcon}
                onChange={(e) => setNewIcon(e.target.value)}
                className="w-full rounded-2xl border border-border bg-background py-2.5 text-center text-lg transition-all duration-200"
                maxLength={2}
                aria-label="Ikon habit"
              />
            </div>
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && add(newName, newIcon)}
              placeholder="Nama habit…"
              className="flex-1 rounded-2xl border border-border bg-background px-4 py-2.5 text-sm"
            />
            <button
              onClick={() => add(newName, newIcon)}
              className="rounded-full bg-foreground px-4 py-2.5 text-sm font-semibold text-cream transition-all duration-200 hover:-translate-y-0.5 active:scale-95"
            >
              Tambah
            </button>
          </div>

          <p className="text-xs text-muted-foreground">Atau pilih dari template:</p>
          <div className="flex flex-wrap gap-2">
            {DEFAULTS.map((d) => (
              <button
                key={d.name}
                onClick={() => add(d.name, d.icon)}
                className="flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1.5 text-xs font-medium transition-all duration-200 hover:bg-cream-deep hover:scale-105 active:scale-95"
              >
                {d.icon} {d.name}
              </button>
            ))}
          </div>
        </section>
      )}

      {/* ── HABIT LIST ───────────────────────────────────────────── */}
      <section>
        <p className="mb-3 text-sm font-semibold text-muted-foreground uppercase tracking-wider text-[11px]">
          Hari ini · {new Date().toLocaleDateString("id-ID", { day: "numeric", month: "short" })}
        </p>

        {habits?.length === 0 ? (
          <EmptyState
            emoji="✅"
            title="Belum ada habit"
            description="Tambah habit pertamamu dan bangun konsistensi setiap hari."
            action={{ label: "Tambah Habit Pertama", onClick: () => setAddOpen(true) }}
          />
        ) : (
          <div className="space-y-2">
            {habits?.map((h, idx) => {
              const isDone = !!logs?.find((l) => l.habit_id === h.id);
              const popping = justCompleted === h.id;
              return (
                <div
                  key={h.id}
                  className={`group relative flex items-center gap-4 rounded-2xl border-2 p-4 transition-all duration-350 animate-slide-up ${
                    isDone
                      ? "border-primary/25 bg-primary-soft/35 shadow-sm"
                      : "border-transparent bg-card hover:border-border/60 hover:shadow-card"
                  }`}
                  style={{ animationDelay: `${idx * 50}ms` }}
                >
                  {/* Confetti burst on completion */}
                  <ConfettiBurst active={popping} />

                  {/* Checkbox */}
                  <button
                    onClick={() => toggle(h.id)}
                    className={`relative grid h-9 w-9 shrink-0 place-items-center rounded-full border-2 transition-all duration-300 ${
                      isDone
                        ? "border-primary bg-primary text-primary-foreground shadow-soft"
                        : "border-border hover:border-primary hover:bg-primary-soft/30"
                    } ${popping ? "animate-bounce-check" : ""}`}
                    aria-label={isDone ? `Tandai ${h.name} sebagai belum selesai` : `Selesaikan ${h.name}`}
                    aria-pressed={isDone}
                  >
                    {isDone && (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden="true">
                        <path d="m5 12 4 4 10-10" />
                      </svg>
                    )}
                  </button>

                  {/* Icon + name */}
                  <span className="text-xl leading-none transition-transform duration-250 group-hover:scale-110">
                    {h.icon}
                  </span>
                  <span className={`flex-1 text-sm font-medium transition-all duration-300 ${isDone ? "text-muted-foreground line-through" : "text-foreground"}`}>
                    {h.name}
                  </span>

                  {/* Delete (visible on hover) */}
                  <button
                    onClick={() => remove(h.id)}
                    className="text-muted-foreground/40 opacity-0 transition-all duration-200 hover:text-destructive group-hover:opacity-100 hover:scale-110"
                    aria-label={`Hapus habit ${h.name}`}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" className="h-4 w-4" aria-hidden="true">
                      <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" />
                    </svg>
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
