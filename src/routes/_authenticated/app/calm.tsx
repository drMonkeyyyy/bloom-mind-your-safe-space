import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { BreathingExercise } from "@/components/calm/BreathingExercise";
import { GroundingExercise } from "@/components/calm/GroundingExercise";
import { SelfTalkCarousel } from "@/components/calm/SelfTalkCarousel";
import { VentingBox } from "@/components/calm/VentingBox";
import { CognitiveReframing } from "@/components/calm/CognitiveReframing";
import { SomaticExercise } from "@/components/calm/SomaticExercise";
import { AmbientSoundPlayer } from "@/components/calm/AmbientSoundPlayer";
import { PanicAttackTimer } from "@/components/calm/PanicAttackTimer";

export const Route = createFileRoute("/_authenticated/app/calm")({
  component: Page,
});

type Tool = "breath" | "ground" | "selftalk" | "vent" | "reframing" | "somatic" | "panic" | null;

function Page() {
  const [tool, setTool] = useState<Tool>(null);
  const activeToolRef = useRef<HTMLDivElement>(null);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (tool) {
      setFeedbackSubmitted(false);
      // Small timeout to allow the tool component to mount/render
      setTimeout(() => {
        activeToolRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    }
  }, [tool]);

  const submitFeedback = async (isHelpful: boolean) => {
    if (!tool) return;
    setSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Pengguna tidak terautentikasi");

      const { error } = await supabase.from("calm_feedback_logs" as any).insert({
        user_id: user.id,
        exercise_key: tool,
        is_helpful: isHelpful
      });

      if (error) throw error;
      setFeedbackSubmitted(true);
    } catch (e) {
      console.error("Gagal mengirim feedback:", e);
      // Fallback so user UX is not broken
      setFeedbackSubmitted(true);
    } finally {
      setSubmitting(false);
    }
  };

  const tools = [
    { k: "breath" as Tool, icon: "🌬️", title: "Breathing 4-7-8", desc: "Latihan napas terbimbing dengan timer", color: "oklch(0.71 0.045 160)" },
    { k: "ground" as Tool, icon: "🌍", title: "Grounding 5-4-3-2-1", desc: "Kembali ke momen saat ini", color: "oklch(0.65 0.06 230)" },
    { k: "selftalk" as Tool, icon: "🤍", title: "Self-Calming Talk", desc: "Kalimat menenangkan untuk dirimu", color: "oklch(0.70 0.05 310)" },
    { k: "vent" as Tool, icon: "🍃", title: "Kotak Pelepasan", desc: "Tulis dan bakar/hancurkan beban pikiran", color: "oklch(0.77 0.085 40)" },
    { k: "reframing" as Tool, icon: "🪞", title: "Ubah Sudut Pandang", desc: "Tulis ulang pikiran negatif secara ramah", color: "oklch(0.75 0.08 40)" },
    { k: "somatic" as Tool, icon: "🦋", title: "Latihan Somatik", desc: "Tenangkan saraf tubuh secara fisik", color: "oklch(0.71 0.045 160)" },
    { k: "panic" as Tool, icon: "🆘", title: "Panic Attack Timer", desc: "Panduan darurat napas + grounding + afirmasi", color: "oklch(0.55 0.18 20)" },
  ];

  return (
    <div className="space-y-6">
      {/* Serene blue gradient header */}
      <div
        className="relative overflow-hidden rounded-3xl px-6 pt-6 pb-5"
        style={{
          background: "linear-gradient(145deg, oklch(0.977 0.008 85) 0%, oklch(0.95 0.03 230) 45%, oklch(0.96 0.025 270) 100%)",
          backgroundSize: "300% 300%",
          animation: "gradient-shift 16s ease-in-out infinite",
        }}
      >
        <div
          className="absolute -right-8 -top-8 h-40 w-40 rounded-full pointer-events-none"
          style={{ background: "oklch(0.65 0.06 230 / 0.15)", filter: "blur(40px)", animation: "blob-drift 22s ease-in-out infinite" }}
        />
        <div
          className="absolute bottom-0 left-1/4 h-24 w-24 rounded-full pointer-events-none"
          style={{ background: "oklch(0.70 0.05 270 / 0.12)", filter: "blur(28px)", animation: "blob-drift-alt 18s ease-in-out infinite" }}
        />
        <div className="relative">
          <h1 className="font-display text-3xl font-semibold">Emergency Calm Mode</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Tarik napas dalam. Kamu aman di sini. 🌿
          </p>
        </div>
      </div>

      {/* Ambient Sound Player */}
      <AmbientSoundPlayer />

      {/* Tool selector — glass cards */}
      <div className="grid gap-3 sm:grid-cols-2">
        {tools.map((t) => (
          <button
            key={t.k}
            onClick={() => setTool(tool === t.k ? null : t.k)}
            className={`rounded-3xl p-5 text-left ring-1 transition-all duration-250 hover:-translate-y-0.5 card-lift ${
              tool === t.k
                ? "ring-primary/40 shadow-soft bg-card"
                : "bg-card ring-border/60 shadow-card"
            }`}
          >
            <p className="text-2xl">{t.icon}</p>
            <h3 className="mt-2 font-display text-lg font-semibold text-foreground">{t.title}</h3>
            <p className="mt-0.5 text-xs text-muted-foreground">{t.desc}</p>
            {tool === t.k && (
              <div
                className="mt-2 h-0.5 rounded-full"
                style={{ background: t.color, boxShadow: `0 0 8px ${t.color}` }}
              />
            )}
          </button>
        ))}
      </div>

      {/* Active tool wrapper with scroll target */}
      {tool && (
        <div ref={activeToolRef} className="pt-2 scroll-mt-20 space-y-6">
          <div className="bg-card rounded-3xl p-5 ring-1 ring-border/50">
            {tool === "breath" && <BreathingExercise />}
            {tool === "ground" && <GroundingExercise />}
            {tool === "selftalk" && <SelfTalkCarousel />}
            {tool === "vent" && <VentingBox />}
            {tool === "reframing" && <CognitiveReframing />}
            {tool === "somatic" && <SomaticExercise />}
            {tool === "panic" && <PanicAttackTimer />}
          </div>

          {/* Feedback Section */}
          <div className="rounded-3xl bg-card p-6 ring-1 ring-border text-center space-y-3.5 shadow-sm animate-scale-in">
            {!feedbackSubmitted ? (
              <>
                <p className="text-sm font-semibold text-foreground">Apakah latihan ini membantu menenangkan pikiran Anda?</p>
                <div className="flex justify-center gap-3">
                  <button
                    onClick={() => submitFeedback(true)}
                    disabled={submitting}
                    className="rounded-full bg-[#6E8C71] hover:bg-[#5D7B60] text-white px-6 py-2.5 text-xs font-semibold active:scale-98 transition-all disabled:opacity-50"
                  >
                    👍 Ya, Membantu
                  </button>
                  <button
                    onClick={() => submitFeedback(false)}
                    disabled={submitting}
                    className="rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 border px-6 py-2.5 text-xs font-semibold active:scale-98 transition-all disabled:opacity-50"
                  >
                    👎 Belum Membantu
                  </button>
                </div>
              </>
            ) : (
              <div className="text-emerald-700 py-2 space-y-1">
                <p className="text-sm font-bold">Terima kasih atas masukannya! ❤️</p>
                <p className="text-xs text-muted-foreground">Masukan Anda membantu kami mengembangkan intervensi klinis yang lebih efektif.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

