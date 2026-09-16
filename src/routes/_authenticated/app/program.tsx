import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useProfile, useIsAdmin } from "@/hooks/use-profile";
import { useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { setUserPlan } from "@/lib/admin.functions";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/app/program")({
  component: ProgramPage,
});

type ProgramDuration = "30hari" | "90hari" | "365hari";

// ── Dynamic Program Roadmaps & Details ───────────────────────────────────────
const PROGRAM_DETAILS: Record<ProgramDuration, {
  name: string;
  badge: string;
  badgeColor: string;
  targetOutcome: string;
  description: string;
  recommendedFor: string;
  milestones: { step: string; title: string; desc: string; focusModule: string; link: string; search?: Record<string, string> }[];
}> = {
  "30hari": {
    name: "Program Reset 30 Hari",
    badge: "🌿 RESET 30 HARI",
    badgeColor: "bg-teal-500/15 text-teal-700 dark:text-teal-300 ring-teal-500/30",
    targetOutcome: "Mengurai kepanikan mendadak, membentuk baseline ketenangan emosi, dan membangun rutinitas 3 menit harian.",
    description: "Program intensif 30 hari untuk mereset ambang toleransi stres tubuh dan membiasakan latihan regulasi emosi dasar.",
    recommendedFor: "Pengguna yang butuh interupsi krisis cepat & ingin membangun kebiasaan pemulihan harian.",
    milestones: [
      { step: "Minggu 1", title: "Stabilisasi Somatis & Crisis Emergency", desc: "Menguasai 10 alat Emergency Calm Mode saat cemas/panik meluap.", focusModule: "Modul 1: Crisis Intervention", link: "/app/calm", search: { tool: "breath" } },
      { step: "Minggu 2", title: "Asesmen Baseline & Tracking Trigger", desc: "Melihat grafik cuaca emosi dan mengukur skor kecemasan awal (DASS-21).", focusModule: "Modul 2: Skrining Psikologis", link: "/app/calm-check" },
      { step: "Minggu 3", title: "Cognitive Reflection & Gratitude", desc: "Mengurai 3 pikiran otomatis negatif dan menulis jurnal rasa syukur.", focusModule: "Modul 3: Terapi Kognitif", link: "/app/journal" },
      { step: "Minggu 4", title: "Evaluasi Reset & Micro-Habit", desc: "Meningkatkan skor mood dan mempertahankan habit tracker 3 menit.", focusModule: "Modul 4: Habit Building", link: "/app/habits" }
    ]
  },
  "90hari": {
    name: "Program Pemulihan Utuh 90 Hari",
    badge: "🔥 PEMULIHAN UTUH (IDEAL)",
    badgeColor: "bg-amber-500/15 text-amber-700 dark:text-amber-300 ring-amber-500/30",
    targetOutcome: "Neuro-rewiring CBT lengkap, menghentikan emotional eating, dan membangun regulasi emosi yang stabil.",
    description: "Durasi emas 90 hari berbasis riset psikologi perilaku untuk mengurai kebiasaan impuls emosi lama dan membentuk struktur neurokognitif baru.",
    recommendedFor: "Rekomendasi utama psikologis untuk pemulihan emosional yang bertahan lama dan terbukti klinis.",
    milestones: [
      { step: "Bulan 1 (Hari 1-30)", title: "Fase 1: Somatic Crisis Reset & Screening", desc: "Stabilisasi saraf Vagus, bebas serangan panik, dan pemetaan baseline DASS-21.", focusModule: "Modul 1 & 2: Emergency & Screening", link: "/app/calm", search: { tool: "panic" } },
      { step: "Bulan 2 (Hari 31-60)", title: "Fase 2: CBT Rewiring & Emotional Eating Interruption", desc: "Menantang distorsi kognitif ANTs & memisahkan lapar fisik vs emosi.", focusModule: "Modul 3 & 4: CBT & Gut-Brain Axis", link: "/app/eating" },
      { step: "Bulan 3 (Hari 61-90)", title: "Fase 3: Regulasis Diri, Sahabat Support & PDF Report", desc: "Integrasi komunitas aman, evaluasi progress 90 hari, dan cetak Laporan Klinis.", focusModule: "Modul 5: Dukungan Sosial & Dokumentasi", link: "/app/growth" }
    ]
  },
  "365hari": {
    name: "Program Pendampingan 365 Hari",
    badge: "🏆 TRANSFORMASI UTUH 1 TAHUN",
    badgeColor: "bg-violet-500/15 text-violet-700 dark:text-violet-300 ring-violet-500/30",
    targetOutcome: "Ketahanan mental sepanjang tahun, riwayat pemulihan tersimpan penuh, dan kilas balik tahunan.",
    description: "Pendampingan holistik tanpa batas selama 365 hari dengan akses prioritas ke seluruh inovasi pendamping AI.",
    recommendedFor: "Pendampingan kesehatan emosi berkelanjutan sepanjang masa pasang surut kehidupan.",
    milestones: [
      { step: "Kuartal 1", title: "Fondasi Ketenangan & Master Emergency Mode", desc: "Stabilisasi saraf otonom & penguasaan 10 teknik grounding.", focusModule: "Modul 1 & 2: Emergency Calm", link: "/app/calm", search: { tool: "ground" } },
      { step: "Kuartal 2", title: "Cognitive Mastery & Pendamping AI 24/7", desc: "Restrukturisasi pikiran negatif & sesi curhat AI tanpa batas.", focusModule: "Modul 3: CBT & AI Chat", link: "/app/chat" },
      { step: "Kuartal 3", title: "Gut-Brain Balance & Komunitas Safe Space", desc: "Mengurai pemicu emotional eating & aktif di Komunitas Sahabat Support.", focusModule: "Modul 4 & 5: Gut-Brain & Community", link: "/app/community" },
      { step: "Kuartal 4", title: "Transendensi & Kilas Balik Tahunan", desc: "Evaluasi 1 tahun penuh, retrospektif emosional & dokumen PDF perjalanan.", focusModule: "Modul 5: Growth Dashboard & PDF", link: "/app/growth" }
    ]
  }
};

// ── Master Clinical Modules integrating ALL Bloom Mind Features ───────────────
const CLINICAL_MODULES = [
  {
    id: "mod-1",
    phase: "FASE 1: PERTOLONGAN PERTAMA & CRISIS INTERVENTION",
    title: "Stabilisasi Saraf & Somatic Emergency",
    color: "from-emerald-500 to-teal-600",
    bgColor: "bg-emerald-500/10 text-emerald-700 ring-emerald-500/30",
    desc: "Memanfaatkan seluruh 10 fitur Emergency Calm Mode untuk menenangkan sistem saraf otonom (Vagus Nerve) saat panik atau stres berat.",
    tools: [
      { name: "Panic Attack Timer 🚨", path: "/app/calm", search: { tool: "panic" }, desc: "Interupsi panik instan & regulasi detak jantung" },
      { name: "Breathing Exercise 4-7-8 🌬️", path: "/app/calm", search: { tool: "breath" }, desc: "Somatic breathing merangsang saraf parasimpatik" },
      { name: "Grounding 5-4-3-2-1 🌍", path: "/app/calm", search: { tool: "ground" }, desc: "Mengembalikan kesadaran ke panca indra saat cemas" },
      { name: "Self-Talk Carousel 🤍", path: "/app/calm", search: { tool: "selftalk" }, desc: "Validasi emosi & afirmasi diri hangat" },
      { name: "Venting Box (Brain Dump) 📦", path: "/app/calm", search: { tool: "vent" }, desc: "Pelepasan beban pikiran & emosi meluap" },
      { name: "Cognitive Reframing 🪞", path: "/app/calm", search: { tool: "reframing" }, desc: "Menantang & mengubah pola pikir distorsi" },
      { name: "Somatic Exercise 🧘", path: "/app/calm", search: { tool: "somatic" }, desc: "Merilekskan otot & ketegangan fisik tubuh" },
      { name: "Cathartic Crystal Shatter 💎", path: "/app/calm", search: { tool: "crystal" }, desc: "Katarsis emosi marah/frustrasi interaktif" },
      { name: "Star Constellation Game ✨", path: "/app/calm", search: { tool: "stars" }, desc: "Latihan fokus mindful & menenangkan pikiran" },
      { name: "Wave Emotion Game 🌊", path: "/app/calm", search: { tool: "wave" }, desc: "Simulasi ritme gelombang emosi pasang surut" },
    ]
  },
  {
    id: "mod-2",
    phase: "FASE 2: ASESMEN & PEMETAAN EMOSI",
    title: "Skrining Psikologis & Emotional Weather",
    color: "from-blue-500 to-indigo-600",
    bgColor: "bg-blue-500/10 text-blue-700 ring-blue-500/30",
    desc: "Mendeteksi tren kesehatan mental dan memetakan pemicu emosi harian.",
    tools: [
      { name: "Calm Check (DASS-21) 📋", path: "/app/calm-check", desc: "Asesmen tingkat Anxiety, Depression, & Stress" },
      { name: "Mood Weather Tracker 🌤️", path: "/app/mood", desc: "Pencatatan grafik fluktuasi emosi & trigger harian" },
    ]
  },
  {
    id: "mod-3",
    phase: "FASE 3: TERAPI KOGNITIF & REWRITING",
    title: "CBT Journaling & Positive Neuroplasticity",
    color: "from-purple-500 to-pink-600",
    bgColor: "bg-purple-500/10 text-purple-700 ring-purple-500/30",
    desc: "Mengurai pikiran negatif otomatis (ANTs) dan membiasakan fokus positif.",
    tools: [
      { name: "Jurnal Refleksi CBT 📓", path: "/app/journal", desc: "Mengurai korelasi Pikiran -> Emosi -> Perilaku" },
      { name: "Jurnal Rasa Syukur 🌸", path: "/app/gratitude", desc: "Stimulasi serotonin & dopamin sebelum tidur" },
      { name: "JN-CALM AI Companion 💬", path: "/app/chat", desc: "Curhat 24/7 dengan pendamping emosional AI" },
    ]
  },
  {
    id: "mod-4",
    phase: "FASE 4: GUT-BRAIN AXIS & HABIT BUILDING",
    title: "Interupsi Impuls & Micro-Activation",
    color: "from-orange-500 to-amber-600",
    bgColor: "bg-orange-500/10 text-orange-700 ring-orange-500/30",
    desc: "Menghentikan emotional eating dan membangun kebiasaan sehat konsisten.",
    tools: [
      { name: "Emotional Eating Analysis 🍎", path: "/app/eating", desc: "Memisahkan lapar fisik vs lapar emosional" },
      { name: "Habit Tracker Pemulihan 🎯", path: "/app/habits", desc: "Aktivasi kebiasaan mikro 3 menit sehari" },
    ]
  },
  {
    id: "mod-5",
    phase: "FASE 5: DUKUNGAN SOSIAL & DOKUMENTASI KLINIS",
    title: "Komunitas Safe Space & Laporan Kemajuan",
    color: "from-rose-500 to-amber-600",
    bgColor: "bg-rose-500/10 text-rose-700 ring-rose-500/30",
    desc: "Mengurangi rasa terisolasi dan merekap data progres pemulihan.",
    tools: [
      { name: "Komunitas Sahabat Support 🤝", path: "/app/community", desc: "Berbagi cerita anonim & memberi Pelukan 🩵" },
      { name: "Growth Dashboard & PDF Export 📊", path: "/app/growth", desc: "Grafik kemajuan & cetak Laporan Klinis PDF" },
    ]
  }
];

// ── Daily Quests Checklist Items ─────────────────────────────────────────────
const TODAY_QUESTS = [
  { id: "q-breath", title: "1. Pernapasan SOS 4-7-8 / Grounding (2 Min)", icon: "🫁", category: "Emergency Calm", link: "/app/calm", search: { tool: "breath" } },
  { id: "q-mood", title: "2. Catat Cuaca Emosi & Pemicu Hari Ini", icon: "🌤️", category: "Mood Tracker", link: "/app/mood" },
  { id: "q-eating", title: "3. Mindful Check: Lapar Fisik atau Emosi?", icon: "🍎", category: "Emotional Eating", link: "/app/eating" },
  { id: "q-gratitude", title: "4. Tulis 3 Hal Kecil yang Disyukuri", icon: "🌸", category: "Gratitude Journal", link: "/app/gratitude" },
  { id: "q-community", title: "5. Kirim 1 Pelukan Hangat di Komunitas", icon: "🩵", category: "Sahabat Support", link: "/app/community" },
];

export function ProgramPage() {
  const { user } = useAuth();
  const { data: profile } = useProfile(user?.id);
  const { data: isAdmin } = useIsAdmin(user?.id);
  const qc = useQueryClient();
  const setPlan = useServerFn(setUserPlan);
  const [selectedDuration, setSelectedDuration] = useState<ProgramDuration>("90hari");
  const [completedQuests, setCompletedQuests] = useState<string[]>([]);

  const handleAdminActivate90Days = async () => {
    if (!user) return;
    try {
      await setPlan({ data: { userId: user.id, plan: "premium", days: 90 } });
      toast.success("✅ Akun kamu berhasil diaktifkan ke Premium 3 Bulan (90 Hari)!");
      qc.invalidateQueries({ queryKey: ["profile", user.id] });
    } catch {
      toast.error("Gagal mengaktifkan plan");
    }
  };

  // Load persistent completed quests for today from LocalStorage
  const getTodayKey = () => {
    const d = new Date();
    return `bloom_program_quests_${d.getFullYear()}_${d.getMonth() + 1}_${d.getDate()}`;
  };

  useEffect(() => {
    try {
      const saved = localStorage.getItem(getTodayKey());
      if (saved) {
        setCompletedQuests(JSON.parse(saved));
      }
    } catch { /* silent */ }
  }, []);

  const toggleQuest = (id: string) => {
    let next: string[];
    if (completedQuests.includes(id)) {
      next = completedQuests.filter(q => q !== id);
      toast("Progres checklist diperbarui");
    } else {
      next = [...completedQuests, id];
      if (next.length === TODAY_QUESTS.length) {
        toast.success("HEBAT! 🎉 Semua tugas harian hari ini selesai dikerjakan!", {
          description: "Kamu baru saja memberi hadiah ketenangan terbaik untuk dirimu hari ini."
        });
      } else {
        toast.success("Tugas harian dicentang! 🌟");
      }
    }
    setCompletedQuests(next);
    try {
      localStorage.setItem(getTodayKey(), JSON.stringify(next));
    } catch { /* silent */ }
  };

  const isDateActive = profile?.premium_end_date ? new Date(profile.premium_end_date) > new Date() : false;
  const isPremium = profile?.plan === "premium" || isDateActive;

  let activePlanTitle = "🌱 Free Starter";
  let autoSelectedDuration: ProgramDuration = "90hari";

  if (isPremium) {
    if (profile?.premium_end_date && profile?.premium_start_date) {
      const diffDays = Math.round(
        (new Date(profile.premium_end_date).getTime() - new Date(profile.premium_start_date).getTime()) /
          (24 * 60 * 60 * 1000)
      );
      if (diffDays > 180) {
        activePlanTitle = "🏆 Program Pendampingan 365 Hari";
        autoSelectedDuration = "365hari";
      } else if (diffDays > 60) {
        activePlanTitle = "🔥 Program Pemulihan Utuh (90 Hari)";
        autoSelectedDuration = "90hari";
      } else {
        activePlanTitle = "🌿 Program Reset 30 Hari";
        autoSelectedDuration = "30hari";
      }
    } else {
      activePlanTitle = "🔥 Program Pemulihan 90 Hari (Aktif)";
      autoSelectedDuration = "90hari";
    }
  }

  useEffect(() => {
    if (isPremium && autoSelectedDuration) {
      setSelectedDuration(autoSelectedDuration);
    }
  }, [isPremium, autoSelectedDuration]);

  const progressPercentage = Math.round((completedQuests.length / TODAY_QUESTS.length) * 100);
  const activeProgram = PROGRAM_DETAILS[selectedDuration];

  return (
    <div className="space-y-8 pb-12">
      {/* ── HEADER SECTION ─────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/20 via-accent/15 to-primary/10 p-6 sm:p-8 ring-1 ring-primary/30">
        <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-primary/20 blur-3xl" />
        <div className="relative">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1 text-xs font-bold text-primary-foreground shadow-xs">
                🧠 INTEGRATED HEALING PROTOCOL
              </span>
              {isAdmin && !isPremium && (
                <button
                  onClick={handleAdminActivate90Days}
                  className="rounded-full bg-amber-500/20 text-amber-800 dark:text-amber-200 border border-amber-500/40 px-3 py-1 text-xs font-bold hover:bg-amber-500/30 transition-colors shadow-xs"
                >
                  ⚡ (Admin) Aktifkan Prem 3 Bulan
                </button>
              )}
            </div>
            <span className="rounded-full bg-card px-3.5 py-1 text-xs font-semibold text-muted-foreground ring-1 ring-border shadow-xs">
              Status Akses:{" "}
              <strong className={isPremium ? "text-emerald-600 dark:text-emerald-400 font-bold" : "text-amber-600 dark:text-amber-400 font-bold"}>
                {isPremium ? `${activePlanTitle} (Aktif ✨)` : "🌱 Free Starter"}
              </strong>
            </span>
          </div>

          <h1 className="mt-4 font-display text-3xl sm:text-4xl font-bold text-foreground">
            Program Pemulihan Emosi Holistik
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            Roadmap klinis terpadu yang memobilisasi <strong>seluruh 10+ fitur Bloom Mind</strong> — termasuk 10 alat Emergency Calm Mode, CBT Journaling, DASS-21 Screening, Gut-Brain Interruption, dan Komunitas Support.
          </p>

          {/* Program Duration Display for Premium vs Switcher for Free */}
          {isPremium ? (
            <div className="mt-6 flex items-center gap-2">
              <span className="rounded-2xl bg-card px-4 py-2.5 text-xs font-bold text-foreground ring-1 ring-border shadow-xs flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Program Aktif Kamu:</span>
                <span className={`rounded-full px-3 py-0.5 text-xs font-black text-white shadow-xs ${
                  selectedDuration === "90hari"
                    ? "bg-amber-500"
                    : selectedDuration === "365hari"
                    ? "bg-violet-600"
                    : "bg-teal-600"
                }`}>
                  {activeProgram.name}
                </span>
              </span>
            </div>
          ) : (
            <div className="mt-6 flex flex-wrap items-center gap-2">
              <button
                onClick={() => setSelectedDuration("30hari")}
                className={`rounded-2xl px-4 py-2.5 text-xs font-bold transition-all ${selectedDuration === "30hari" ? "bg-teal-600 text-white shadow-md ring-2 ring-teal-400" : "bg-card text-foreground hover:bg-muted"}`}
              >
                🌿 Program Reset (30 Hari)
              </button>
              <button
                onClick={() => setSelectedDuration("90hari")}
                className={`rounded-2xl px-4 py-2.5 text-xs font-bold transition-all relative ${selectedDuration === "90hari" ? "bg-amber-500 text-white shadow-md ring-2 ring-amber-400" : "bg-card text-foreground hover:bg-muted"}`}
              >
                🔥 Program Pemulihan Utuh (90 Hari)
                <span className="ml-1.5 rounded-full bg-white/20 px-2 py-0.5 text-[9px] font-black uppercase">Ideal</span>
              </button>
              <button
                onClick={() => setSelectedDuration("365hari")}
                className={`rounded-2xl px-4 py-2.5 text-xs font-bold transition-all ${selectedDuration === "365hari" ? "bg-violet-600 text-white shadow-md ring-2 ring-violet-400" : "bg-card text-foreground hover:bg-muted"}`}
              >
                🏆 Program Pendampingan (365 Hari)
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── DYNAMIC PROGRAM ROADMAP DETAILS (CONNECTS TO SELECTED DURATION) ────── */}
      <div className="rounded-3xl bg-card p-6 ring-1 ring-border shadow-soft space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-4">
          <div>
            <span className={`inline-block rounded-full px-3 py-1 text-[11px] font-extrabold tracking-wider uppercase ring-1 ${activeProgram.badgeColor}`}>
              {activeProgram.badge}
            </span>
            <h2 className="mt-2 font-display text-2xl font-bold text-foreground">
              {activeProgram.name}
            </h2>
            <p className="mt-1 text-xs text-muted-foreground max-w-3xl leading-relaxed">
              {activeProgram.description}
            </p>
          </div>

          <Link
            to={isPremium ? "/app/calm" : "/app/premium"}
            className="rounded-full bg-primary px-5 py-2.5 text-xs font-bold text-primary-foreground shadow-sm hover:opacity-90 transition-opacity"
          >
            {isPremium ? "Mulai Program Hari Ini →" : "Aktifkan Akses Full →"}
          </Link>
        </div>

        <div className="grid gap-3 sm:grid-cols-3 bg-muted/30 p-4 rounded-2xl ring-1 ring-border/50 text-xs">
          <div>
            <span className="text-muted-foreground font-medium">🎯 Target Outcome:</span>
            <p className="font-semibold text-foreground mt-0.5">{activeProgram.targetOutcome}</p>
          </div>
          <div className="sm:col-span-2">
            <span className="text-muted-foreground font-medium">💡 Direkomendasikan Untuk:</span>
            <p className="font-semibold text-foreground mt-0.5">{activeProgram.recommendedFor}</p>
          </div>
        </div>

        {/* Milestone Steps Timeline */}
        <div className="pt-2 space-y-3">
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Tahapan & Milestone Pemulihan</p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {activeProgram.milestones.map((m, idx) => (
              <div key={m.step} className="relative flex flex-col justify-between rounded-2xl bg-background p-4 ring-1 ring-border/80 shadow-xs">
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] font-bold text-primary">
                      {m.step}
                    </span>
                    <span className="text-[10px] text-muted-foreground font-bold">Langkah {idx + 1}</span>
                  </div>
                  <h4 className="mt-2 font-display text-sm font-bold text-foreground">{m.title}</h4>
                  <p className="mt-1 text-[11px] text-muted-foreground leading-snug">{m.desc}</p>
                </div>
                <div className="mt-4 pt-3 border-t border-border/40 flex items-center justify-between">
                  <span className="text-[10px] font-semibold text-primary truncate max-w-[140px]">{m.focusModule}</span>
                  <Link
                    to={m.link}
                    search={m.search as any}
                    className="text-[10px] font-bold text-foreground hover:text-primary flex items-center gap-1"
                  >
                    Buka →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── INTERACTIVE DAILY QUEST CHECKLIST ───────────────────────────── */}
      <div className="rounded-3xl bg-card p-6 ring-1 ring-border shadow-soft space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-bold text-primary">
                📋 CHECKLIST TUGAS HARIAN
              </span>
              <span className="text-xs text-muted-foreground font-medium">Hari Ini</span>
            </div>
            <h2 className="mt-1 font-display text-xl font-bold text-foreground">
              Misi Pemulihan Emosi (3 Menit Sehari)
            </h2>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-xs text-muted-foreground">Kemajuan Checklist</span>
              <p className="font-display text-lg font-bold text-primary">
                {completedQuests.length} / {TODAY_QUESTS.length} Selesai ({progressPercentage}%)
              </p>
            </div>
            <div className="h-10 w-10 rounded-full bg-primary/15 grid place-items-center font-bold text-primary text-xs ring-2 ring-primary/30">
              {progressPercentage}%
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-500 rounded-full"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>

        {/* Checklist Items */}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {TODAY_QUESTS.map((q) => {
            const isDone = completedQuests.includes(q.id);
            return (
              <div
                key={q.id}
                onClick={() => toggleQuest(q.id)}
                className={`group cursor-pointer flex items-center justify-between rounded-2xl p-4 ring-1 transition-all duration-200 ${
                  isDone
                    ? "bg-emerald-500/10 ring-emerald-500/40 shadow-xs"
                    : "bg-card hover:bg-muted/40 ring-border/80 hover:ring-primary/40"
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  {/* Custom Checkbox */}
                  <div
                    className={`h-6 w-6 shrink-0 rounded-lg grid place-items-center text-xs font-black transition-all ${
                      isDone
                        ? "bg-emerald-600 text-white shadow-xs scale-105"
                        : "border-2 border-border group-hover:border-primary text-transparent"
                    }`}
                  >
                    ✓
                  </div>

                  <div className="min-w-0">
                    <p className={`text-xs font-bold truncate transition-colors ${isDone ? "text-emerald-800 dark:text-emerald-300 line-through opacity-85" : "text-foreground group-hover:text-primary"}`}>
                      {q.title}
                    </p>
                    <div className="mt-0.5 flex items-center gap-1.5">
                      <span className="text-xs">{q.icon}</span>
                      <Link
                        to={q.link}
                        search={q.search as any}
                        onClick={(e) => e.stopPropagation()}
                        className="text-[10px] text-primary hover:underline font-bold"
                      >
                        Buka Fitur Langsung →
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── ALL CLINICAL MODULES BREAKDOWN ──────────────────────────── */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-2xl font-bold text-foreground">Integrasi Modul & Fitur Pemulihan</h2>
            <p className="text-xs text-muted-foreground">Setiap fitur aplikasi saling terhubung dalam protokol pemulihan emosionalmu.</p>
          </div>
          <Link to="/app/calm" className="text-xs font-bold text-primary hover:underline">
            Buka Emergency Calm →
          </Link>
        </div>

        <div className="grid gap-6">
          {CLINICAL_MODULES.map((mod) => (
            <div key={mod.id} className="relative overflow-hidden rounded-3xl bg-card p-6 ring-1 ring-border shadow-xs">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/60 pb-3">
                <span className={`rounded-full px-3 py-1 text-[10px] font-bold tracking-wider uppercase ring-1 ${mod.bgColor}`}>
                  {mod.phase}
                </span>
                <span className="text-xs font-semibold text-muted-foreground">{mod.tools.length} Fitur Terhubung</span>
              </div>

              <h3 className="mt-3 font-display text-xl font-bold text-foreground">{mod.title}</h3>
              <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{mod.desc}</p>

              {/* Tools Grid */}
              <div className="mt-5 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
                {mod.tools.map((t) => (
                  <Link
                    key={t.name}
                    to={t.path}
                    search={(t as any).search}
                    className="group flex items-start justify-between rounded-2xl bg-muted/30 p-3.5 ring-1 ring-border/50 transition-all hover:bg-card hover:ring-primary/40 hover:shadow-xs"
                  >
                    <div>
                      <p className="text-xs font-bold text-foreground group-hover:text-primary transition-colors">{t.name}</p>
                      <p className="mt-0.5 text-[10px] text-muted-foreground leading-snug">{t.desc}</p>
                    </div>
                    <span className="text-xs text-muted-foreground group-hover:translate-x-0.5 transition-transform">→</span>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── ACTIVE PLAN BANNER / UPGRADE CTA ──────────────────────────── */}
      {isPremium ? (
        <div className="rounded-3xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-700 p-8 text-white shadow-xl">
          <div className="max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-bold">✨ Program Pemulihan Aktif</span>
              {profile?.premium_end_date && (
                <span className="text-xs opacity-90 font-medium">
                  Berlaku s/d {new Date(profile.premium_end_date).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                </span>
              )}
            </div>
            <h3 className="mt-3 font-display text-2xl font-bold">
              {activePlanTitle} — Akses Penuh Siap Digunakan
            </h3>
            <p className="mt-2 text-xs opacity-90 leading-relaxed">
              Seluruh 10 alat Emergency Calm Mode, Jurnal Refleksi CBT, Skrining DASS-21, Gut-Brain Interrupter, dan Komunitas Support telah terbuka tanpa batas untuk perjalanan pemulihan emosionalmu.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link
                to="/app/calm"
                className="rounded-full bg-white px-6 py-3 text-xs font-black text-teal-800 shadow-md transition-all hover:bg-emerald-50"
              >
                Buka Emergency Calm Mode →
              </Link>
              <Link
                to="/app/growth"
                className="rounded-full bg-white/15 border border-white/30 px-5 py-3 text-xs font-bold text-white hover:bg-white/25 transition-colors"
              >
                Lihat Dashboard Kemajuan →
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-3xl bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 p-8 text-white shadow-xl">
          <div className="max-w-2xl">
            <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-bold">✨ Buka Full Access Program Pemulihan</span>
            <h3 className="mt-3 font-display text-2xl font-bold">Dapatkan Akses Tanpa Batas ke 10+ Fitur & Emergency Calm Mode</h3>
            <p className="mt-2 text-xs opacity-90 leading-relaxed">
              Bergabung dengan Program Pemulihan Utuh (90 Hari) untuk membuka semua alat pernapasan SOS, jurnal CBT tanpa batas, dan analisis pemulihan penuh.
            </p>
            <Link
              to="/app/premium"
              className="mt-5 inline-block rounded-full bg-white px-6 py-3 text-xs font-black text-amber-800 shadow-md transition-all hover:bg-amber-50"
            >
              Lihat Program Pemulihan (Mulai Rp49.000) →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
