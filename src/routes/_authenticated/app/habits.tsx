import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
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
      setTimeout(() => setJustCompleted(null), 600);
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-semibold">Habit Tracker</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {new Date().toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long" })}
          </p>
        </div>
        <button
          onClick={() => setAddOpen(!addOpen)}
          className="rounded-full bg-accent px-4 py-2.5 text-sm font-semibold text-accent-foreground shadow-peach transition-all hover:-translate-y-0.5"
        >
          + Tambah
        </button>
      </div>

      {/* ── PROGRESS HEADER ─────────────────────────────────────── */}
      {total > 0 && (
        <div
          className={`flex items-center gap-5 rounded-3xl p-6 transition-all duration-500 ${
            allDone
              ? "bg-gradient-to-br from-primary/15 to-accent/15 ring-1 ring-primary/30"
              : "bg-card ring-1 ring-border"
          }`}
        >
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

          <div className="flex-1">
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
            <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-cream-deep">
              <div
                className="h-2 rounded-full transition-all duration-700"
                style={{
                  width: `${pct}%`,
                  background: allDone ? "var(--gradient-warm)" : "var(--color-primary)",
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* ── ADD HABIT PANEL ──────────────────────────────────────── */}
      {addOpen && (
        <section className="rounded-3xl bg-card p-5 ring-1 ring-border animate-slide-up space-y-3">
          <p className="text-sm font-semibold">Tambah habit baru</p>
          <div className="flex gap-2">
            <div className="relative w-14">
              <input
                value={newIcon}
                onChange={(e) => setNewIcon(e.target.value)}
                className="w-full rounded-2xl border border-border bg-background py-2.5 text-center text-lg"
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
              className="rounded-full bg-foreground px-4 py-2.5 text-sm font-semibold text-cream"
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
                className="flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1.5 text-xs font-medium transition-colors hover:bg-cream-deep"
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
            {habits?.map((h) => {
              const done = !!logs?.find((l) => l.habit_id === h.id);
              const popping = justCompleted === h.id;
              return (
                <div
                  key={h.id}
                  className={`group flex items-center gap-4 rounded-2xl border-2 p-4 transition-all duration-300 ${
                    done
                      ? "border-primary/30 bg-primary-soft/40"
                      : "border-transparent bg-card hover:border-border"
                  }`}
                >
                  {/* Checkbox */}
                  <button
                    onClick={() => toggle(h.id)}
                    className={`grid h-8 w-8 shrink-0 place-items-center rounded-full border-2 transition-all duration-300 ${
                      done
                        ? "border-primary bg-primary text-primary-foreground scale-105"
                        : "border-border hover:border-primary"
                    } ${popping ? "animate-bounce-check" : ""}`}
                    aria-label={done ? `Tandai ${h.name} sebagai belum selesai` : `Selesaikan ${h.name}`}
                    aria-pressed={done}
                  >
                    {done && (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden="true">
                        <path d="m5 12 4 4 10-10" />
                      </svg>
                    )}
                  </button>

                  {/* Icon + name */}
                  <span className="text-xl leading-none">{h.icon}</span>
                  <span className={`flex-1 text-sm font-medium transition-all duration-300 ${done ? "text-muted-foreground line-through" : "text-foreground"}`}>
                    {h.name}
                  </span>

                  {/* Delete (visible on hover) */}
                  <button
                    onClick={() => remove(h.id)}
                    className="text-muted-foreground/40 opacity-0 transition-all duration-150 hover:text-destructive group-hover:opacity-100"
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
