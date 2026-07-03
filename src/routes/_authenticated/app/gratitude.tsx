import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { EmptyState } from "@/components/app/EmptyState";
import { BottomSheet, ModalDialog } from "@/components/app/BottomSheet";
import { exportGratitudePDF } from "@/lib/export-pdf";

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

const jarOrbsConfig = [
  { left: "12%", bottom: "10%", size: "w-20 h-20 text-[10px]", anim: "animate-float-a", color: "from-pink-100/90 to-rose-200/90 border-rose-300/40 text-rose-950 shadow-rose-200/40" },
  { left: "53%", bottom: "12%", size: "w-18 h-18 text-[9px]", anim: "animate-float-b", color: "from-amber-100/90 to-yellow-200/90 border-yellow-300/40 text-amber-950 shadow-yellow-200/40" },
  { left: "30%", bottom: "35%", size: "w-22 h-22 text-[10px]", anim: "animate-float-c", color: "from-emerald-100/90 to-teal-200/90 border-teal-300/40 text-emerald-950 shadow-teal-200/40" },
  { left: "60%", bottom: "42%", size: "w-19 h-19 text-[9px]", anim: "animate-float-a", color: "from-sky-100/90 to-cyan-200/90 border-cyan-300/40 text-sky-950 shadow-cyan-200/40" },
  { left: "8%", bottom: "50%", size: "w-18 h-18 text-[9px]", anim: "animate-float-b", color: "from-purple-100/90 to-indigo-200/90 border-indigo-300/40 text-purple-950 shadow-purple-200/40" },
  { left: "42%", bottom: "60%", size: "w-20 h-20 text-[10px]", anim: "animate-float-c", color: "from-orange-100/90 to-amber-200/90 border-amber-300/40 text-amber-950 shadow-orange-200/40" },
];

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

      {/* ── GRID LAYOUT: WRITE FORM & MEMORY JAR ───────────────── */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Left Column: Write Form */}
        <div className="lg:col-span-7 space-y-4">
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
        </div>

        {/* Right Column: Toples Kaca Kenangan */}
        <div className="lg:col-span-5">
          <section className="rounded-3xl bg-gradient-to-b from-indigo-950 via-slate-900 to-indigo-950 p-6 ring-1 ring-white/10 shadow-2xl flex flex-col h-full min-h-[480px] relative overflow-hidden group">
            {/* Magical Aura Background */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-[radial-gradient(circle_at_center,rgba(251,191,36,0.15)_0%,transparent_60%)] pointer-events-none mix-blend-screen" />
            <div className="absolute bottom-0 left-0 w-72 h-72 bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.15)_0%,transparent_60%)] pointer-events-none mix-blend-screen" />
            
            {/* Floating Star Dust */}
            <div className="absolute inset-0 pointer-events-none opacity-40 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.8)_1px,transparent_1px)] [background-size:24px_24px] z-0 animate-pulse" />

            <div className="flex items-center gap-3 mb-8 relative z-20">
              <div className="grid h-10 w-10 place-items-center rounded-2xl bg-white/10 backdrop-blur-md text-amber-300 text-xl shadow-[0_4px_16px_rgba(0,0,0,0.3)] ring-1 ring-white/20">
                ✨
              </div>
              <div>
                <h2 className="font-bold text-base text-white tracking-wide">Toples Kaca Kenangan</h2>
                <p className="text-xs text-indigo-200/80 font-medium">Koleksi momen bercahaya di hari gelapmu.</p>
              </div>
            </div>

            {/* CSS Floating Animations */}
            <style>{`
              @keyframes jar-float-a {
                0%, 100% { transform: translateY(0px) translateX(0px) rotate(0deg); }
                50% { transform: translateY(-12px) translateX(4px) rotate(2deg); }
              }
              @keyframes jar-float-b {
                0%, 100% { transform: translateY(0px) translateX(0px) rotate(0deg); }
                50% { transform: translateY(-8px) translateX(-4px) rotate(-2deg); }
              }
              @keyframes jar-float-c {
                0%, 100% { transform: translateY(0px) translateX(0px) rotate(0deg); }
                50% { transform: translateY(-15px) translateX(2px) rotate(3deg); }
              }
              .animate-float-a { animation: jar-float-a 6s ease-in-out infinite; }
              .animate-float-b { animation: jar-float-b 5.2s ease-in-out infinite; }
              .animate-float-c { animation: jar-float-c 7s ease-in-out infinite; }
            `}</style>

            {/* Realistic Apothecary Jar Visual representation */}
            <div className="flex-1 flex flex-col justify-end pb-2 pt-4 relative z-10 items-center">
              
              {/* Lid / Cork Stopper */}
              <div className="relative z-30 flex flex-col items-center translate-y-3 drop-shadow-[0_4px_10px_rgba(0,0,0,0.5)]">
                {/* Top of cork */}
                <div className="w-20 h-5 bg-gradient-to-r from-amber-900 via-amber-700 to-amber-900 rounded-[50%] shadow-[inset_0_2px_4px_rgba(255,255,255,0.2)] z-20" />
                {/* Body of cork */}
                <div className="w-[72px] h-6 bg-gradient-to-r from-amber-800 via-amber-600 to-amber-800 -mt-2.5 rounded-b-xl border-b-2 border-amber-950/60 z-10 shadow-[inset_0_-4px_6px_rgba(0,0,0,0.4)]" />
              </div>
              
              {/* The Glass Jar Itself */}
              <div className="relative z-20 w-full max-w-[260px] h-[300px] flex flex-col items-center drop-shadow-[0_20px_40px_rgba(0,0,0,0.5)]">
                
                {/* Glass Lip */}
                <div className="w-24 h-5 rounded-full bg-gradient-to-b from-white/40 to-white/10 border-2 border-white/60 shadow-[0_4px_12px_rgba(255,255,255,0.2),inset_0_2px_4px_rgba(255,255,255,0.8)] z-30 backdrop-blur-md" />
                
                {/* Glass Neck */}
                <div className="w-20 h-8 bg-gradient-to-r from-white/20 via-transparent to-white/20 border-x-2 border-white/40 -mt-2.5 z-20 backdrop-blur-sm shadow-[inset_0_0_10px_rgba(255,255,255,0.2)]" />
                
                {/* Glass Body */}
                <div className="w-full flex-1 -mt-2 rounded-[70px_70px_45px_45px] bg-gradient-to-br from-white/10 via-transparent to-indigo-400/10 border-[3px] border-white/40 shadow-[inset_0_0_40px_rgba(255,255,255,0.15),inset_0_-20px_40px_rgba(99,102,241,0.2)] relative overflow-hidden backdrop-blur-md z-10 group-hover:shadow-[inset_0_0_50px_rgba(255,255,255,0.25),inset_0_-30px_60px_rgba(99,102,241,0.3)] transition-shadow duration-700">
                  
                  {/* 3D Glass Highlights (Curve matching the body) */}
                  <div className="absolute top-2 left-3 bottom-10 w-8 rounded-[40px_10px_10px_40px] bg-gradient-to-r from-white/50 to-transparent blur-[2px] opacity-70 pointer-events-none" />
                  <div className="absolute top-10 right-2 bottom-16 w-3 rounded-[10px_40px_40px_10px] bg-gradient-to-l from-white/30 to-transparent blur-[1px] opacity-60 pointer-events-none" />
                  <div className="absolute top-2 left-10 right-10 h-6 rounded-[50%] bg-gradient-to-b from-white/40 to-transparent blur-[3px] opacity-70 pointer-events-none" />
                  
                  {/* Bottom inner glass thickness */}
                  <div className="absolute bottom-0 inset-x-0 h-10 rounded-b-[40px] bg-gradient-to-t from-white/30 to-transparent opacity-80 pointer-events-none" />

                  {/* Magical glowing bottom aura inside jar */}
                  <div className="absolute bottom-0 inset-x-0 h-40 bg-gradient-to-t from-amber-400/30 via-amber-400/5 to-transparent pointer-events-none mix-blend-screen" />

                  {(() => {
                    const memories = (list ?? []).filter(e => e.best_moment);
                    if (memories.length === 0) {
                      return (
                        <div className="absolute inset-0 flex items-center justify-center p-6 text-center z-20">
                          <div className="space-y-3">
                            <span className="text-5xl animate-pulse inline-block drop-shadow-[0_0_15px_rgba(251,191,36,0.8)] select-none">✨</span>
                            <h3 className="text-sm font-bold text-white tracking-widest uppercase">Toples Kosong</h3>
                            <p className="text-[11px] text-indigo-100/80 leading-relaxed max-w-[180px] mx-auto font-medium">
                              Simpan momen terbaikmu hari ini untuk melihatnya bersinar di sini.
                            </p>
                          </div>
                        </div>
                      );
                    }
                    
                    return memories.map((e, idx) => {
                      const config = jarOrbsConfig[idx % jarOrbsConfig.length];
                      const scatterY = idx >= jarOrbsConfig.length ? `${parseFloat(config.bottom) + Math.sin(idx) * 8}%` : config.bottom;
                      const scatterX = idx >= jarOrbsConfig.length ? `${parseFloat(config.left) + Math.cos(idx) * 8}%` : config.left;
                      const displayWord = e.best_moment.split(" ")[0];

                      return (
                        <button
                          key={e.id}
                          onClick={() => setSelectedEntry(e)}
                          className={`absolute flex flex-col items-center justify-center p-2 rounded-full border shadow-[0_0_15px_rgba(255,255,255,0.4),inset_0_0_10px_rgba(255,255,255,0.6)] hover:scale-110 active:scale-95 transition-all cursor-pointer backdrop-blur-md bg-gradient-to-br select-none z-30 ${config.size} ${config.anim} ${config.color}`}
                          style={{
                            left: scatterX,
                            bottom: scatterY,
                            animationDelay: `${idx * 0.3}s`,
                          }}
                          title={e.best_moment}
                        >
                          <span className="font-black tracking-tight line-clamp-2 px-1 text-center font-display leading-[1.1] max-w-[70px] uppercase text-[10px] drop-shadow-sm">
                            {displayWord}
                          </span>
                        </button>
                      );
                    });
                  })()}
                </div>
              </div>

              {/* Wooden Shelf / Stand for the Jar */}
              <div className="w-[120%] h-4 bg-gradient-to-b from-stone-700 via-stone-900 to-black rounded-[50%] mt-2 shadow-[0_20px_40px_rgba(0,0,0,0.8)] z-0 relative">
                <div className="absolute top-0 inset-x-2 h-1 bg-gradient-to-r from-transparent via-white/20 to-transparent rounded-[50%]" />
              </div>
            </div>
          </section>
        </div>
      </div>

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
                  className="flex-1 rounded-full border border-destructive/20 hover:bg-destructive/5 py-3 text-[10px] sm:text-xs font-bold text-destructive transition-all duration-200 active:scale-95"
                >
                  Hapus Catatan 🗑️
                </button>
                <button
                  onClick={() => exportGratitudePDF(selectedEntry)}
                  className="flex-1 rounded-full border border-primary/20 bg-primary-soft/60 hover:bg-primary-soft py-3 text-[10px] sm:text-xs font-bold text-primary transition-all duration-200 active:scale-95"
                >
                  Simpan PDF 📄
                </button>
                <button
                  onClick={() => setSelectedEntry(null)}
                  className="flex-1 rounded-full border border-stone-200 bg-stone-50 hover:bg-stone-100 py-3 text-[10px] sm:text-xs font-bold text-stone-600 transition-all duration-200"
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
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground leading-normal">
            Catatan rasa syukur ini akan terhapus secara permanen dari riwayatmu dan tidak dapat dikembalikan.
          </p>
          <p className="text-[10px] text-amber-700 bg-amber-50 border border-amber-100/60 rounded-xl p-2.5 font-medium leading-relaxed">
            💡 <strong>Tips:</strong> Anda dapat mendownload lembaran ini sebagai PDF terlebih dahulu di detail catatan sebelum menghapusnya secara permanen.
          </p>
        </div>
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

