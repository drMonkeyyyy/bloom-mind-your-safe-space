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
    <div className="mt-3 h-3 w-full overflow-hidden rounded-full bg-muted/40 shadow-inner backdrop-blur-sm border border-black/5">
      <div
        className="h-full rounded-full transition-all duration-1000"
        style={{
          width: `${width}%`,
          background: allDone
            ? "linear-gradient(90deg, var(--color-primary), var(--color-accent))"
            : "var(--color-primary)",
          transitionTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)",
          boxShadow: allDone ? "0 0 12px var(--color-primary)" : "none",
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
            {addOpen ? "Tutup" : "+ Tambah"}
          </button>
        </div>
      </div>

      {/* ── PROGRESS HEADER ─────────────────────────────────────── */}
      {total > 0 && (
        <div
          className={`relative flex items-center gap-6 rounded-[2rem] p-7 transition-all duration-700 overflow-hidden backdrop-blur-md border ${
            allDone
              ? "bg-gradient-to-br from-primary/10 via-primary/5 to-accent/10 border-primary/20 shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
              : "bg-card/80 border-border/50 shadow-sm"
          }`}
        >
          {/* All-done celebration blob */}
          {allDone && (
            <div
              className="absolute -right-10 -top-10 h-40 w-40 rounded-full pointer-events-none opacity-20"
              style={{
                background: "radial-gradient(circle, var(--color-accent) 0%, transparent 70%)",
                filter: "blur(20px)",
                animation: "glow-pulse 4s ease-in-out infinite",
              }}
            />
          )}

          <div className="relative shrink-0 drop-shadow-sm">
            <ProgressRing
              value={pct}
              size={96}
              strokeWidth={8}
              color={allDone ? "var(--color-accent)" : "var(--color-primary)"}
            >
              <div className="text-center flex flex-col items-center justify-center mt-1">
                <p className="font-display text-2xl font-bold text-foreground leading-none tracking-tight">{done}</p>
                <p className="text-[11px] font-medium text-muted-foreground mt-0.5">/{total}</p>
              </div>
            </ProgressRing>
          </div>

          <div className="relative flex-1 py-1">
            {allDone ? (
              <>
                <p className="font-display text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  Semua habit selesai! 🎉
                </p>
                <p className="mt-1 text-sm font-medium text-muted-foreground/80">Luar biasa, kamu keren banget hari ini!</p>
              </>
            ) : (
              <>
                <div className="flex justify-between items-end mb-1">
                  <p className="font-display text-lg font-bold text-foreground/90 tracking-tight">
                    {done} dari {total} selesai
                  </p>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    {Math.round(pct)}%
                  </p>
                </div>
                <p className="text-sm text-muted-foreground/80 mb-3">
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
        <section className="rounded-[2rem] bg-card/90 backdrop-blur-xl p-6 border border-border/50 shadow-lg animate-slide-down space-y-5 origin-top">
          <div className="flex items-center justify-between">
            <p className="text-base font-bold text-foreground/90 tracking-tight">Tambah habit baru</p>
          </div>
          <div className="flex gap-3">
            <div className="relative shrink-0">
              <input
                value={newIcon}
                onChange={(e) => setNewIcon(e.target.value)}
                className="h-12 w-14 rounded-2xl border border-border/60 bg-background/50 text-center text-xl shadow-inner transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
                maxLength={2}
                aria-label="Ikon habit"
              />
            </div>
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && add(newName, newIcon)}
              placeholder="Nama kebiasaan baikmu..."
              className="h-12 flex-1 rounded-2xl border border-border/60 bg-background/50 px-4 text-sm font-medium placeholder:text-muted-foreground/50 shadow-inner transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none"
            />
            <button
              onClick={() => add(newName, newIcon)}
              disabled={!newName.trim()}
              className="h-12 rounded-2xl bg-foreground px-6 text-sm font-bold text-background shadow-sm transition-all duration-300 hover:shadow-md hover:scale-105 active:scale-95 disabled:opacity-50 disabled:active:scale-100 disabled:hover:scale-100"
            >
              Simpan
            </button>
          </div>

          <div className="space-y-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Saran Habit</p>
            <div className="flex flex-wrap gap-2.5">
              {DEFAULTS.map((d) => (
                <button
                  key={d.name}
                  onClick={() => add(d.name, d.icon)}
                  className="flex items-center gap-2 rounded-xl border border-border/40 bg-background/40 px-3.5 py-2 text-sm font-medium text-foreground/80 shadow-sm transition-all duration-200 hover:bg-card hover:border-primary/30 hover:text-primary hover:shadow-md active:scale-95"
                >
                  <span className="text-base">{d.icon}</span> {d.name}
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── HABIT LIST ───────────────────────────────────────────── */}
      <section className="pb-8">
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
            Daftar Habit Hari Ini
          </p>
        </div>

        {habits?.length === 0 ? (
          <div className="mt-6">
            <EmptyState
              emoji="🌱"
              title="Mulai Perjalananmu"
              description="Belum ada habit. Tambahkan rutinitas positif pertamamu hari ini."
              action={{ label: "Tambah Habit", onClick: () => setAddOpen(true) }}
            />
          </div>
        ) : (
          <div className="space-y-3">
            {habits?.map((h, idx) => {
              const isDone = !!logs?.find((l) => l.habit_id === h.id);
              const popping = justCompleted === h.id;
              return (
                <div
                  key={h.id}
                  className={`group relative flex items-center gap-5 rounded-[1.25rem] p-4 transition-all duration-500 ease-out animate-slide-up ${
                    isDone
                      ? "bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/20 shadow-sm"
                      : "bg-card border border-border/40 hover:border-border/80 hover:shadow-md hover:-translate-y-0.5"
                  }`}
                  style={{ animationDelay: `${idx * 40}ms` }}
                >
                  {/* Confetti burst on completion */}
                  <ConfettiBurst active={popping} />

                  {/* Checkbox with premium feel */}
                  <button
                    onClick={() => toggle(h.id)}
                    className={`relative grid h-11 w-11 shrink-0 place-items-center rounded-2xl border-2 transition-all duration-400 ${
                      isDone
                        ? "border-primary bg-primary text-primary-foreground shadow-lg shadow-primary/30 scale-100"
                        : "border-border/60 bg-background/50 hover:border-primary/60 hover:bg-primary/5 scale-100 hover:scale-105 active:scale-90"
                    } ${popping ? "animate-bounce-check" : ""}`}
                    aria-label={isDone ? `Tandai ${h.name} sebagai belum selesai` : `Selesaikan ${h.name}`}
                    aria-pressed={isDone}
                  >
                    <svg 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="3" 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      className={`h-5 w-5 transition-all duration-300 ${isDone ? "opacity-100 scale-100" : "opacity-0 scale-50"}`} 
                      aria-hidden="true"
                    >
                      <path d="m5 12 4 4 10-10" />
                    </svg>
                  </button>

                  {/* Icon + name */}
                  <div className="flex flex-1 items-center gap-4 min-w-0">
                    <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-2xl transition-all duration-300 ${isDone ? "bg-white/40 grayscale mix-blend-luminosity" : "bg-muted/50 group-hover:bg-white group-hover:shadow-sm group-hover:scale-110"}`}>
                      {h.icon}
                    </div>
                    <span className={`truncate text-[15px] font-semibold transition-all duration-400 ${isDone ? "text-muted-foreground/60 line-through decoration-muted-foreground/40" : "text-foreground/90"}`}>
                      {h.name}
                    </span>
                  </div>

                  {/* Delete (visible on hover) */}
                  <button
                    onClick={() => remove(h.id)}
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-muted-foreground/40 opacity-0 transition-all duration-200 hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100 active:scale-90"
                    aria-label={`Hapus habit ${h.name}`}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4.5 w-4.5" aria-hidden="true">
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
