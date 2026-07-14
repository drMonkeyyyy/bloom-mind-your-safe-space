import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/hooks/use-auth";
import { useProfile } from "@/hooks/use-profile";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { getWeeklyInsight, getDailyInsight } from "@/lib/chat.functions";
import { PaywallCard } from "@/components/app/PaywallCard";
import { useState, useEffect } from "react";
import { MoodSparkline } from "@/components/app/MoodSparkline";
import { SkeletonCard } from "@/components/app/SkeletonCard";
import { BottomSheet, ModalDialog } from "@/components/app/BottomSheet";
import { exportWeeklyInsightPDF } from "@/lib/export-pdf";

const TRIGGER_EMOJIS: Record<string, string> = {
  "Pekerjaan": "💼",
  "Hubungan": "❤️",
  "Keluarga": "🏡",
  "Keuangan": "💰",
  "Makanan": "🍔",
  "Kesehatan": "🩺",
  "Masa depan": "🔮",
  "Lainnya": "🌿"
};

function parseInlineMarkdown(text: string) {
  if (!text) return [];
  const parts = text.split(/(\*\*.*?\*\*|\*.*?\*)/g);
  return parts.map((part, idx) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={idx} className="font-bold text-stone-900">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith("*") && part.endsWith("*")) {
      return (
        <em key={idx} className="italic font-medium text-stone-850">
          {part.slice(1, -1)}
        </em>
      );
    }
    return part;
  });
}

function parseMarkdown(text: string, isSmall = false) {
  if (!text) return null;
  const lines = text.split("\n");
  const textSize = isSmall ? "text-xs" : "text-sm";
  const h4Size = isSmall ? "text-xs" : "text-sm";
  const h3Size = isSmall ? "text-sm" : "text-base";
  const h2Size = isSmall ? "text-base" : "text-lg";
  
  return lines.map((line, idx) => {
    const trimmed = line.trim();
    if (trimmed === "---" || trimmed === "***") {
      return <hr key={idx} className="my-3 border-t border-purple-200/50" />;
    }

    let isH4 = false;
    let isH3 = false;
    let isH2 = false;
    let isBullet = false;
    let content = line;

    if (line.startsWith("### ")) {
      isH4 = true;
      content = line.slice(4);
    } else if (line.startsWith("## ")) {
      isH3 = true;
      content = line.slice(3);
    } else if (line.startsWith("# ")) {
      isH2 = true;
      content = line.slice(2);
    } else if (line.startsWith("* ") || line.startsWith("- ")) {
      isBullet = true;
      content = line.slice(2);
    }

    const formatted = parseInlineMarkdown(content);

    if (isH4) {
      return (
        <h4 key={idx} className={`font-display ${h4Size} font-bold text-purple-900 mt-3 mb-1`}>
          {formatted}
        </h4>
      );
    }
    if (isH3) {
      return (
        <h3 key={idx} className={`font-display ${h3Size} font-bold text-purple-900 mt-4 mb-2`}>
          {formatted}
        </h3>
      );
    }
    if (isH2) {
      return (
        <h2 key={idx} className={`font-display ${h2Size} font-bold text-purple-900 mt-5 mb-2`}>
          {formatted}
        </h2>
      );
    }
    if (isBullet) {
      return (
        <div key={idx} className={`flex items-start gap-2 ${textSize} text-stone-700 leading-relaxed ml-2`}>
          <span className="text-purple-500 mt-1 select-none">•</span>
          <span className="flex-1">{formatted}</span>
        </div>
      );
    }

    return (
      <p key={idx} className={trimmed === "" ? "h-2" : `${textSize} text-stone-700 leading-relaxed`}>
        {formatted}
      </p>
    );
  });
}

export const Route = createFileRoute("/_authenticated/app/growth")({
  component: Page,
});

function StatCard({ 
  label, 
  value, 
  suffix = "/10", 
  icon, 
  accentClass, 
  bgClass, 
  onClick 
}: { 
  label: string; 
  value: string | number; 
  suffix?: string; 
  icon: string; 
  accentClass: string; 
  bgClass: string; 
  onClick?: () => void 
}) {
  return (
    <div 
      onClick={onClick}
      className={`rounded-3xl p-5 border transition-all duration-350 hover:shadow-elevated hover:-translate-y-0.5 cursor-pointer active:scale-97 flex items-center justify-between gap-4 ${bgClass} ${accentClass}`}
    >
      <div className="min-w-0">
        <p className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">{label}</p>
        <div className="mt-2.5 flex items-baseline gap-1">
          <p className="font-display text-3xl font-extrabold text-foreground">{value}</p>
          <p className="text-xs font-medium text-muted-foreground">{suffix}</p>
        </div>
      </div>
      
      <div className="grid h-12 w-12 place-items-center rounded-2xl bg-white shadow-soft text-2xl select-none shrink-0">
        {icon}
      </div>
    </div>
  );
}

/* ── MindPlant Level Mapping & Helpers ───────────────────────────── */
const LEVEL_STAGES = [
  { level: 1, range: "0–150 Pts", emoji: "🌱", name: "Benih Harapan", desc: "Awal dari perjalanan barumu untuk menyayangi diri." },
  { level: 2, range: "151–400 Pts", emoji: "🌱", name: "Tunas Kecil", desc: "Langkah-langkah kecilmu mulai menampakkan pertumbuhan." },
  { level: 3, range: "401–800 Pts", emoji: "🍃", name: "Tunas Harapan", desc: "Konsistensi mulai mengakar dalam keseharianmu." },
  { level: 4, range: "801–1400 Pts", emoji: "🌿", name: "Daun Rimbun", desc: "Jiwa yang kuat tercermin dari kepedulian harianmu." },
  { level: 5, range: "1401–2200 Pts", emoji: "🌳", name: "Cabang Kuat", desc: "Tantangan hidup dihadapi dengan keteguhan hati." },
  { level: 6, range: "2201–3200 Pts", emoji: "🌸", name: "Kuncup Pertama", desc: "Kuncup bunga pertama mulai bersiap untuk mekar." },
  { level: 7, range: "3201–4400 Pts", emoji: "🌹", name: "Bunga Pertama", desc: "Keindahan ketenangan mulai memancarkan pesona jiwamu." },
  { level: 8, range: "4401–5800 Pts", emoji: "🌷", name: "Warna-Warni Jiwa", desc: "Berbagai emosi diakomodasi dengan penuh penerimaan." },
  { level: 9, range: "5801–7200 Pts", emoji: "🌺", name: "Kebun Harmoni", desc: "Taman jiwamu memberikan kedamaian untuk dirimu sendiri." },
  { level: 10, range: "7201–8600 Pts", emoji: "🌳", name: "Pohon Teduh", desc: "Kekuatan mentalmu menjadi tempat bersandar yang kokoh." },
  { level: 11, range: "8601–10000 Pts", emoji: "🌟", name: "Kebun Rimbun", desc: "Kedamaian sejati mengalir dari kebiasaan mindful harianmu." },
  { level: 12, range: "> 10000 Pts", emoji: "👑", name: "Taman Mekar Abadi", desc: "Luar biasa! Dedikasi penuh cinta & ketenangan dalam merawat indahnya jiwamu." }
];

function getLevelInfo(score: number) {
  if (score > 10000) return { ...LEVEL_STAGES[11], stageVisual: 5 };
  if (score > 8600) return { ...LEVEL_STAGES[10], stageVisual: 4 };
  if (score > 7200) return { ...LEVEL_STAGES[9], stageVisual: 4 };
  if (score > 5800) return { ...LEVEL_STAGES[8], stageVisual: 4 };
  if (score > 4400) return { ...LEVEL_STAGES[7], stageVisual: 4 };
  if (score > 3200) return { ...LEVEL_STAGES[6], stageVisual: 4 };
  if (score > 2200) return { ...LEVEL_STAGES[5], stageVisual: 3 };
  if (score > 1400) return { ...LEVEL_STAGES[4], stageVisual: 2 };
  if (score > 800) return { ...LEVEL_STAGES[3], stageVisual: 2 };
  if (score > 400) return { ...LEVEL_STAGES[2], stageVisual: 2 };
  if (score > 150) return { ...LEVEL_STAGES[1], stageVisual: 2 };
  return { ...LEVEL_STAGES[0], stageVisual: 1 };
}

/* ── MindPlant SVG Plant Renderer ───────────────────────────────── */
function MindPlant({ score, isWilted = false, onClick }: { score: number; isWilted?: boolean; onClick?: () => void }) {
  const navigate = useNavigate();
  const lvlInfo = getLevelInfo(score);
  const stage = lvlInfo.stageVisual;
  
  const label = isWilted ? "Tanaman Layu" : lvlInfo.name;
  const desc = isWilted 
    ? "Tanaman jiwamu layu karena merindukan kepedulianmu. Yuk lakukan check-in mood hari ini untuk menyiramnya!" 
    : lvlInfo.desc;

  // Wilted vs Healthy Color mappings (OKLCH palette)
  const stemColor = isWilted ? "oklch(0.52 0.03 55)" : "oklch(0.71 0.045 160)";
  const leafColor1 = isWilted ? "oklch(0.48 0.025 60)" : "oklch(0.68 0.05 155)";
  const leafColor2 = isWilted ? "oklch(0.52 0.03 55)" : "oklch(0.71 0.045 160)";
  const leafColor3 = isWilted ? "oklch(0.58 0.03 65)" : "oklch(0.80 0.05 165)";
  const flowerColor1 = isWilted ? "oklch(0.52 0.02 70)" : (stage === 5 ? "oklch(0.82 0.14 75)" : "oklch(0.77 0.085 40)");
  const flowerColor2 = isWilted ? "oklch(0.58 0.01 75)" : (stage === 5 ? "oklch(0.85 0.12 70)" : "oklch(0.77 0.085 40)");
  const centerColor = isWilted ? "oklch(0.62 0.01 80)" : (stage === 5 ? "oklch(0.92 0.08 80)" : "oklch(0.93 0.04 40)");

  return (
    <div 
      onClick={onClick}
      className="rounded-3xl bg-card p-8 ring-1 ring-border/60 shadow-card flex flex-col items-center text-center space-y-4 animate-scale-in cursor-pointer hover:shadow-elevated hover:-translate-y-0.5 transition-all duration-350 active:scale-98 relative overflow-hidden"
    >
      {/* Wilted Overlay */}
      {isWilted && (
        <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-[1px] flex flex-col items-center justify-center p-6 text-center text-white z-10 transition-all duration-300">
          <span className="text-4xl animate-bounce">🍂</span>
          <h4 className="mt-3 font-display text-lg font-bold">Tanaman Jiwa Layu</h4>
          <p className="text-xs text-stone-200 mt-1 max-w-[210px] leading-relaxed">
            Tanamanmu merindukan dirimu. Yuk isi mood hari ini untuk menyiramnya kembali!
          </p>
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate({ to: "/app/mood" });
            }}
            className="mt-4 px-5 py-2 bg-amber-500 hover:bg-amber-600 active:scale-95 text-xs font-bold text-white rounded-full shadow transition-all duration-200"
          >
            💧 Siram Sekarang
          </button>
        </div>
      )}

      {/* Radial glow greenhouse backdrop */}
      <div className={`absolute inset-0 pointer-events-none transition-all duration-500 ${isWilted ? "bg-transparent" : "bg-[radial-gradient(circle_at_center,_rgba(167,_243,_190,_0.2)_0%,_transparent_75%)]"}`} />

      <div className="relative w-56 h-60 flex items-center justify-center">
        {/* Sparkle animations for higher levels */}
        {!isWilted && stage >= 4 && (
          <div className="absolute inset-0 pointer-events-none">
            <span className="absolute text-yellow-400 text-lg animate-sparkle top-4 left-1/4">✨</span>
            <span className="absolute text-yellow-300 text-sm animate-float top-8 right-1/4">🌟</span>
            <span className="absolute text-yellow-400 text-xs animate-sparkle bottom-1/2 left-8">✨</span>
          </div>
        )}

        {/* Floating leaf particles */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
          <span className="absolute bottom-6 left-12 text-sm opacity-60 animate-float-leaf-1">{isWilted ? "🍂" : "🍃"}</span>
          <span className="absolute bottom-8 right-12 text-xs opacity-60 animate-float-leaf-2">{isWilted ? "🍂" : "🌿"}</span>
          <span className="absolute bottom-4 left-1/2 text-sm opacity-60 animate-float-leaf-3">{isWilted ? "🍂" : "🌱"}</span>
        </div>
        
        <svg viewBox="0 0 100 120" className={`w-full h-full drop-shadow-md select-none ${isWilted ? "" : "animate-plant-sway"}`}>
          {/* Pot */}
          <path d="M35 90 L65 90 L70 115 L30 115 Z" fill="oklch(0.70 0.08 40)" />
          <ellipse cx="50" cy="90" rx="16" ry="4" fill="oklch(0.60 0.08 40)" />
          <ellipse cx="50" cy="115" rx="20" ry="3" fill="oklch(0.27 0.02 80 / 0.1)" />

          {/* Stem & Leaves */}
          {stage >= 1 && (
            <>
              <path 
                d={
                  stage === 1 ? "M50 90 Q50 75 48 65" :
                  stage === 2 ? "M50 90 Q50 65 46 50" :
                  "M50 90 Q50 55 45 35"
                } 
                fill="none" 
                stroke={stemColor} 
                strokeWidth="3.5" 
                strokeLinecap="round" 
              />
              <path d="M48 65 Q38 60 40 54 Q47 56 48 65" fill={stemColor} />
              <path d="M48 65 Q58 62 56 56 Q50 58 48 65" fill={leafColor3} />
            </>
          )}

          {stage >= 2 && (
            <>
              <path d="M49 76 Q35 70 34 62 Q45 66 49 76" fill={leafColor1} />
              <path d="M50 72 Q64 68 62 60 Q52 64 50 72" fill={leafColor2} />
            </>
          )}

          {stage >= 3 && (
            <>
              <path d="M47 55 Q33 50 32 42 Q42 46 47 55" fill={leafColor1} />
              <path d="M46 48 Q58 42 56 34 Q48 38 46 48" fill={leafColor2} />
              
              {stage === 3 && (
                <g className={isWilted ? "" : "animate-breathe"} style={{ transformOrigin: "45px 35px" }}>
                  <path d="M45 35 Q40 25 45 20 Q50 25 45 35" fill={flowerColor1} />
                  <path d="M45 35 Q45 26 43 22 Q41 28 45 35" fill={flowerColor2} />
                </g>
              )}
            </>
          )}

          {stage >= 4 && (
            <g className={isWilted ? "" : "animate-breathe"} style={{ transformOrigin: "45px 35px" }}>
              <circle cx="45" cy="35" r="3" fill={leafColor2} />
              <circle cx="45" cy="20" r="10" fill={flowerColor1} opacity="0.9" />
              <circle cx="33" cy="30" r="10" fill={flowerColor2} opacity="0.9" />
              <circle cx="57" cy="30" r="10" fill={flowerColor2} opacity="0.9" />
              <circle cx="37" cy="45" r="10" fill={flowerColor1} opacity="0.9" />
              <circle cx="53" cy="45" r="10" fill={flowerColor1} opacity="0.9" />
              
              <circle cx="45" cy="34" r="8" fill={centerColor} />
              <circle cx="45" cy="34" r="3" fill="white" opacity="0.5" />
            </g>
          )}
        </svg>
      </div>

      <div className="space-y-1">
        <p className="text-[10px] font-bold uppercase tracking-wider text-primary">Level Tanaman Jiwa</p>
        <h3 className="font-display text-xl font-bold text-foreground">{label}</h3>
        <p className="text-sm text-muted-foreground leading-relaxed max-w-sm">
          {desc}
        </p>
        <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-primary-soft/60 px-3 py-1 text-xs font-semibold text-primary">
          Skor Jiwa: {score} Pts
        </div>
      </div>
    </div>
  );
}

function ActionRecommendationCard({
  avgMood,
  avgStress,
  avgEnergy
}: {
  avgMood: string | number;
  avgStress: string | number;
  avgEnergy: string | number;
}) {
  const parseNum = (val: string | number) => {
    const n = typeof val === "string" ? parseFloat(val) : val;
    return isNaN(n) ? null : n;
  };

  const scoreMood = parseNum(avgMood);
  const scoreStress = parseNum(avgStress);
  const scoreEnergy = parseNum(avgEnergy);

  let recType: "burnout" | "sadness" | "stable" = "stable";
  
  if (scoreStress !== null && scoreEnergy !== null && (scoreStress >= 7.0 || scoreEnergy <= 3.5)) {
    recType = "burnout";
  } else if (scoreMood !== null && scoreMood <= 4.5) {
    recType = "sadness";
  }

  const configs = {
    burnout: {
      bg: "bg-gradient-to-br from-rose-50/70 via-orange-50/50 to-cream-deep/10 border-rose-200/50",
      accent: "text-rose-700",
      icon: "⚠️",
      iconClass: "animate-warning-wobble",
      title: "Peringatan Dini Burnout",
      desc: `Suhu stresmu saat ini sangat tinggi (${avgStress}/10) dan energimu berada di titik rendah (${avgEnergy}/10). Tubuh dan pikiranmu sedang mengirimkan sinyal kelelahan ekstrem.`,
      btnText: "Tenangkan Diri di Emergency Calm",
      link: "/app/calm"
    },
    sadness: {
      bg: "bg-gradient-to-br from-blue-50/70 via-indigo-50/50 to-cream-deep/20 border-blue-200/50",
      accent: "text-blue-700",
      icon: "😰",
      iconClass: "animate-float-slow",
      title: "Kondisi Hati Sedang Redup",
      desc: `Rata-rata kondisi suasana hatimu sedang berada di angka (${avgMood}/10). Sangat wajar untuk merasa lelah atau sedih. Ingatlah bahwa kamu tidak harus memikulnya sendirian.`,
      btnText: "Curhat dengan Pendamping AI",
      link: "/app/chat"
    },
    stable: {
      bg: "bg-gradient-to-br from-emerald-50/70 via-teal-50/50 to-cream-deep/20 border-emerald-200/50",
      accent: "text-emerald-700",
      icon: "✨",
      iconClass: "animate-breathe",
      title: "Kondisi Jiwamu Sedang Seimbang",
      desc: `Luar biasa! Tren kesehatan mentalmu stabil dengan tingkat stres rendah (${avgStress}/10) dan energi yang baik (${avgEnergy}/10). Mari rawat kebahagiaan ini.`,
      btnText: "Tulis Jurnal Gratitude",
      link: "/app/gratitude"
    }
  };

  const config = configs[recType];

  return (
    <div className={`rounded-3xl p-6 border transition-all duration-350 shadow-soft relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-5 animate-alert-pulse ${config.bg}`}>
      <div className="flex items-start gap-4">
        <div className={`grid h-12 w-12 place-items-center rounded-2xl bg-white shadow-soft text-2xl select-none shrink-0 ${config.iconClass}`}>
          {config.icon}
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-ping inline-block shrink-0" />
            <p className={`text-[10px] font-bold uppercase tracking-wider ${config.accent}`}>Detektor Kesejahteraan Jiwa</p>
          </div>
          <h3 className="font-display text-base font-bold text-stone-900">{config.title}</h3>
          <p className="text-xs text-stone-600 leading-relaxed max-w-2xl">{config.desc}</p>
        </div>
      </div>
      
      <Link
        to={config.link}
        className="w-full md:w-auto shrink-0 text-center rounded-full bg-stone-900 text-white hover:bg-stone-850 hover:scale-103 active:scale-97 px-5 py-3 text-xs font-bold transition-all duration-300 shadow-md hover:shadow-elevated flex items-center justify-center gap-2 group"
      >
        <span>{config.btnText}</span>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-4 w-4 transform transition-transform duration-300 group-hover:translate-x-1 shrink-0">
          <path d="M5 12h14M12 5l7 7-7 7" />
        </svg>
      </Link>
    </div>
  );
}

function Page() {
  const { user } = useAuth();
  const { data: profile } = useProfile(user?.id);
  const isPremium = profile?.plan === "premium";
  const navigate = useNavigate();
  
  const weeklyInsightFn = useServerFn(getWeeklyInsight);
  const dailyInsightFn = useServerFn(getDailyInsight);
  
  const [insightTab, setInsightTab] = useState<"daily" | "weekly">("daily");
  
  // Weekly Insight states
  const [weeklyInsight, setWeeklyInsight] = useState<string | null>(null);
  const [weeklyInsightLoading, setWeeklyInsightLoading] = useState(false);
  const [weeklyHistory, setWeeklyHistory] = useState<Array<{ id: string; date: string; text: string }>>([]);
  
  // Daily Insight states
  const [dailyInsight, setDailyInsight] = useState<string | null>(null);
  const [dailyInsightLoading, setDailyInsightLoading] = useState(false);
  const [dailyHistory, setDailyHistory] = useState<Array<{ id: string; date: string; text: string }>>([]);

  const [plantModalOpen, setPlantModalOpen] = useState(false);
  const [selectedStat, setSelectedStat] = useState<{ title: string; desc: string } | null>(null);
  const [historyModalOpen, setHistoryModalOpen] = useState(false);

  useEffect(() => {
    if (!user) return;
    
    // Load weekly
    const savedWeekly = localStorage.getItem(`bloom_weekly_insight_${user.id}`);
    if (savedWeekly) setWeeklyInsight(savedWeekly);
    const savedWeeklyHistory = localStorage.getItem(`bloom_weekly_insights_history_${user.id}`);
    if (savedWeeklyHistory) setWeeklyHistory(JSON.parse(savedWeeklyHistory));
    
    // Load daily
    const savedDaily = localStorage.getItem(`bloom_daily_insight_${user.id}`);
    if (savedDaily) setDailyInsight(savedDaily);
    const savedDailyHistory = localStorage.getItem(`bloom_daily_insights_history_${user.id}`);
    if (savedDailyHistory) setDailyHistory(JSON.parse(savedDailyHistory));
  }, [user]);

  const since = new Date(Date.now() - 29 * 86400000).toISOString().slice(0, 10);
  const { data: moods, isLoading: moodsLoading } = useQuery({
    queryKey: ["moods-30", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.from("mood_checkins")
        .select("date, mood, mood_score, stress_score, energy_score, triggers")
        .eq("user_id", user!.id).gte("date", since).order("date");
      return data ?? [];
    },
  });

  const growthScore = profile?.lifetime_points ?? 0;

  const avgMood = moods?.length ? (moods.reduce((a, b) => a + b.mood_score, 0) / moods.length).toFixed(1) : "—";
  const avgStress = moods?.length ? (moods.reduce((a, b) => a + b.stress_score, 0) / moods.length).toFixed(1) : "—";
  const avgEnergy = moods?.length ? (moods.reduce((a, b) => a + b.energy_score, 0) / moods.length).toFixed(1) : "—";

  const triggerCount: Record<string, number> = {};
  moods?.forEach((m) => m.triggers?.forEach((t) => { triggerCount[t] = (triggerCount[t] ?? 0) + 1; }));
  const topTriggers = Object.entries(triggerCount).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const maxTrigger = topTriggers[0]?.[1] ?? 1;

  const moodChartData = (moods ?? []).map((m) => ({ value: m.mood_score, date: m.date }));
  const stressChartData = (moods ?? []).map((m) => ({ value: m.stress_score, date: m.date }));

  const getLocalDateString = (d: Date = new Date()) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const todayStr = getLocalDateString();
  const hasDailyGeneratedToday = dailyHistory.some(
    (item) => getLocalDateString(new Date(item.date)) === todayStr
  );
  const hasWeeklyGeneratedToday = weeklyHistory.some(
    (item) => getLocalDateString(new Date(item.date)) === todayStr
  );

  const weeklyStatus = (() => {
    if (weeklyHistory.length === 0) return { canGenerate: true, daysRemaining: 0 };
    const lastEntry = weeklyHistory[0];
    const lastDate = new Date(lastEntry.date);
    const lastDateStr = getLocalDateString(lastDate);
    
    if (lastDateStr === todayStr) {
      return { canGenerate: true, daysRemaining: 0 };
    }
    
    const diffTime = Date.now() - lastDate.getTime();
    const diffDays = Math.ceil((7 * 24 * 60 * 60 * 1000 - diffTime) / (24 * 60 * 60 * 1000));
    
    if (diffDays <= 0) {
      return { canGenerate: true, daysRemaining: 0 };
    }
    
    return { canGenerate: false, daysRemaining: diffDays };
  })();

  const generateDaily = async () => {
    setDailyInsightLoading(true);
    try {
      const r = await dailyInsightFn({ data: undefined });
      setDailyInsight(r.text);
      if (user) {
        localStorage.setItem(`bloom_daily_insight_${user.id}`, r.text);
        
        const existingIdx = dailyHistory.findIndex(
          (item) => getLocalDateString(new Date(item.date)) === todayStr
        );
        
        let updatedHistory;
        if (existingIdx !== -1) {
          updatedHistory = [...dailyHistory];
          updatedHistory[existingIdx] = {
            ...updatedHistory[existingIdx],
            text: r.text,
            date: new Date().toISOString()
          };
        } else {
          const newEntry = {
            id: Math.random().toString(36).substring(2, 9),
            date: new Date().toISOString(),
            text: r.text,
          };
          updatedHistory = [newEntry, ...dailyHistory];
        }
        updatedHistory = updatedHistory.slice(0, 50);
        setDailyHistory(updatedHistory);
        localStorage.setItem(`bloom_daily_insights_history_${user.id}`, JSON.stringify(updatedHistory));
      }
    } catch {
      setDailyInsight("Gagal memuat insight harian. Coba lagi.");
    } finally {
      setDailyInsightLoading(false);
    }
  };

  const generateWeekly = async () => {
    setWeeklyInsightLoading(true);
    try {
      const r = await weeklyInsightFn({ data: undefined });
      setWeeklyInsight(r.text);
      if (user) {
        localStorage.setItem(`bloom_weekly_insight_${user.id}`, r.text);
        
        const existingIdx = weeklyHistory.findIndex(
          (item) => getLocalDateString(new Date(item.date)) === todayStr
        );
        
        let updatedHistory;
        if (existingIdx !== -1) {
          updatedHistory = [...weeklyHistory];
          updatedHistory[existingIdx] = {
            ...updatedHistory[existingIdx],
            text: r.text,
            date: new Date().toISOString()
          };
        } else {
          const newEntry = {
            id: Math.random().toString(36).substring(2, 9),
            date: new Date().toISOString(),
            text: r.text,
          };
          updatedHistory = [newEntry, ...weeklyHistory];
        }
        updatedHistory = updatedHistory.slice(0, 50);
        setWeeklyHistory(updatedHistory);
        localStorage.setItem(`bloom_weekly_insights_history_${user.id}`, JSON.stringify(updatedHistory));
      }
    } catch {
      setWeeklyInsight("Gagal memuat insight mingguan. Coba lagi.");
    } finally {
      setWeeklyInsightLoading(false);
    }
  };

  // Check if plant is wilted (inactive for more than 14 days)
  const isWilted = (() => {
    if (growthScore === 0) return false; // New user, not wilted
    if (!moods || moods.length === 0) return true; // Has points but no check-ins in last 30 days -> wilted
    
    // Check time difference of last check-in
    const lastCheckin = new Date(moods[moods.length - 1].date);
    const diffTime = Math.abs(Date.now() - lastCheckin.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 14; // Inactive for > 14 days -> wilted
  })();

  return (
    <div className="space-y-6">
      <div className="relative">
        <h1 className="font-display text-3xl font-semibold">Growth Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">30 hari terakhir · Data personalmu</p>
      </div>

      {/* ── MINDPLANT ────────────────────────────────────────────── */}
      <MindPlant score={growthScore} isWilted={isWilted} onClick={() => setPlantModalOpen(true)} />

      {/* ── STATS ─────────────────────────────────────────────────── */}
      {moodsLoading ? (
        <div className="grid gap-4 sm:grid-cols-3">
          {[1, 2, 3].map(i => <SkeletonCard key={i} lines={1} />)}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard 
            label="Mood rata-rata" 
            value={avgMood} 
            icon="📊"
            bgClass="bg-emerald-50/30 hover:bg-emerald-50/50"
            accentClass="border-emerald-200/60 hover:border-emerald-300"
            onClick={() => setSelectedStat({
              title: "📊 Mood Rata-Rata",
              desc: `Skor mood rata-rata dihitung dari seluruh check-in mood harian Anda selama 30 hari terakhir. Skor berkisar antara 1 (sangat buruk) hingga 10 (sangat bahagia). Rata-rata Anda saat ini adalah ${avgMood}/10.`
            })}
          />
          <StatCard 
            label="Stres rata-rata" 
            value={avgStress} 
            icon="💆‍♀️"
            bgClass="bg-rose-50/30 hover:bg-rose-50/50"
            accentClass="border-rose-200/60 hover:border-rose-300"
            onClick={() => setSelectedStat({
              title: "💆‍♀️ Stres Rata-Rata",
              desc: `Tingkat stres rata-rata dihitung dari seluruh catatan stres harian Anda selama 30 hari terakhir. Skor berkisar antara 1 (sangat tenang/rileks) hingga 10 (sangat tertekan/stres berat). Rata-rata Anda saat ini adalah ${avgStress}/10.`
            })}
          />
          <StatCard 
            label="Energi rata-rata" 
            value={avgEnergy} 
            icon="⚡"
            bgClass="bg-amber-50/30 hover:bg-amber-50/50"
            accentClass="border-amber-200/60 hover:border-amber-300"
            onClick={() => setSelectedStat({
              title: "⚡ Energi Rata-Rata",
              desc: `Tingkat energi rata-rata dihitung dari seluruh catatan tingkat energi harian Anda selama 30 hari terakhir. Skor berkisar antara 1 (lelah fisik/mental habis) hingga 10 (sangat segar/berenergi tinggi). Rata-rata Anda saat ini adalah ${avgEnergy}/10.`
            })}
          />
        </div>
      )}

      {/* ── RECOMMENDED ACTION CARD ────────────────────────────── */}
      {!moodsLoading && moods && moods.length > 0 && (
        <ActionRecommendationCard
          avgMood={avgMood}
          avgStress={avgStress}
          avgEnergy={avgEnergy}
        />
      )}

      {/* ── MOOD TREND ───────────────────────────────────────────── */}
      <section className="rounded-3xl bg-card p-6 ring-1 ring-border">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm font-semibold">Tren Mood 30 Hari</p>
          <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-primary inline-block" />Mood</span>
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full inline-block" style={{ background: "oklch(0.75 0.08 20)" }} />Stres</span>
          </div>
        </div>
        {moodsLoading ? (
          <div className="skeleton h-24 rounded-xl" />
        ) : (
          <div className="relative h-24">
            <MoodSparkline data={moodChartData} height={96} />
            <div className="absolute inset-0 opacity-50">
              <MoodSparkline
                data={stressChartData}
                height={96}
                color="oklch(0.75 0.08 20)"
                gradient={false}
              />
            </div>
          </div>
        )}
        {moods && moods.length > 0 && (
          <div className="mt-3 flex justify-between text-[10px] text-muted-foreground">
            <span>{new Date(moods[0].date).toLocaleDateString("id-ID", { day: "numeric", month: "short" })}</span>
            <span>{new Date(moods[moods.length - 1].date).toLocaleDateString("id-ID", { day: "numeric", month: "short" })}</span>
          </div>
        )}
      </section>

      <section className="rounded-3xl bg-card p-6 ring-1 ring-border">
        <div className="mb-4">
          <p className="text-sm font-semibold text-stone-900">Pemicu Utama Mood-mu (Top Triggers)</p>
          <p className="text-[10px] text-muted-foreground mt-0.5 leading-normal">
            Menampilkan seberapa sering pemicu ini muncul dari seluruh catatan suasana hatimu dalam 30 hari terakhir.
          </p>
        </div>
        {topTriggers.length === 0 ? (
          <p className="text-sm text-muted-foreground">Belum cukup data. Lanjutkan check-in mood harian.</p>
        ) : (
          <div className="space-y-3">
            {topTriggers.map(([t, c]) => {
              const emoji = TRIGGER_EMOJIS[t] ?? "🌿";
              return (
                <div key={t} className="flex items-center gap-3">
                  <span className="w-32 shrink-0 text-sm font-semibold text-stone-700 flex items-center gap-1.5">
                    <span className="text-base select-none">{emoji}</span>
                    {t}
                  </span>
                  <div className="flex-1 h-2.5 rounded-full bg-cream-deep overflow-hidden">
                    <div
                      className="h-full rounded-full bg-primary transition-all duration-700"
                      style={{ width: `${(c / maxTrigger) * 100}%` }}
                    />
                  </div>
                  <span className="w-28 shrink-0 text-right text-[11px] font-semibold text-muted-foreground">
                    {c}× dari {moods?.length || 0} ({moods?.length ? Math.round((c / moods.length) * 100) : 0}%)
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ── WEEKLY AI INSIGHT ────────────────────────────────────── */}
      <section className="rounded-3xl p-6 border border-purple-200/50 relative overflow-hidden bg-gradient-to-br from-indigo-50/50 via-purple-50/45 to-pink-50/35 shadow-soft">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <div className="flex items-center gap-2 animate-fade-in">
              <span className="rounded-full bg-purple-100/80 border border-purple-200 px-2.5 py-0.5 text-[9px] font-bold text-purple-700 select-none animate-pulse">
                ✨ Premium Insight
              </span>
            </div>
            <p className="font-display text-lg font-bold text-foreground mt-1">
              {insightTab === "daily" ? "Daily Reflection" : "Weekly Reflection"}
            </p>
            <p className="text-xs text-muted-foreground">
              {insightTab === "daily" 
                ? "Evaluasi & afirmasi personal harianmu hari ini" 
                : "Rangkuman perkembangan diri personal berdasarkan datamu"}
            </p>
          </div>
          
          {isPremium && (
            <div className="flex items-center gap-2">
              {(insightTab === "daily" ? dailyHistory : weeklyHistory).length > 0 && (
                <button
                  onClick={() => setHistoryModalOpen(true)}
                  className="rounded-full border border-purple-200/40 bg-white/90 hover:bg-white px-3.5 py-2 text-xs font-bold text-purple-700 transition-all duration-200 active:scale-95 shadow-sm"
                >
                  🕒 Riwayat
                </button>
              )}
              <button
                onClick={insightTab === "daily" ? generateDaily : generateWeekly}
                disabled={insightTab === "daily" ? dailyInsightLoading : (weeklyInsightLoading || !weeklyStatus.canGenerate)}
                className="rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 px-5 py-2.5 text-xs font-bold text-white transition-all hover:-translate-y-0.5 hover:shadow-md disabled:opacity-60 flex items-center gap-1.5 shrink-0"
              >
                {insightTab === "daily" 
                  ? (dailyInsightLoading ? "Memuat…" : hasDailyGeneratedToday ? "🔄 Regenerate" : "Generate")
                  : (weeklyInsightLoading 
                      ? "Memuat…" 
                      : !weeklyStatus.canGenerate 
                        ? `🔒 ${weeklyStatus.daysRemaining} Hari` 
                        : hasWeeklyGeneratedToday 
                          ? "🔄 Regenerate" 
                          : "Generate")
                }
              </button>
            </div>
          )}
        </div>

        {/* ── INSIGHT TAB SELECTOR ─────────────────────────────────── */}
        <div className="flex bg-purple-100/40 p-0.5 rounded-full border border-purple-200/20 max-w-[210px] mt-4 shadow-inner">
          <button
            onClick={() => setInsightTab("daily")}
            className={`flex-1 py-1.5 px-3 rounded-full text-[10px] font-bold transition-all duration-350 ${
              insightTab === "daily"
                ? "bg-white text-purple-700 shadow-sm"
                : "text-purple-600/70 hover:text-purple-800"
            }`}
          >
            Harian
          </button>
          <button
            onClick={() => setInsightTab("weekly")}
            className={`flex-1 py-1.5 px-3 rounded-full text-[10px] font-bold transition-all duration-350 ${
              insightTab === "weekly"
                ? "bg-white text-purple-700 shadow-sm"
                : "text-purple-600/70 hover:text-purple-800"
            }`}
          >
            Mingguan
          </button>
        </div>

        {!isPremium ? (
          <div className="mt-5 relative rounded-2xl border border-dashed border-purple-200 p-5 bg-white/60 overflow-hidden">
            {/* Blurred placeholder text */}
            <div className="space-y-3 blur-[4px] select-none pointer-events-none opacity-40">
              <div className="h-4 bg-purple-200 rounded w-1/3"></div>
              <div className="h-3 bg-purple-200 rounded w-full"></div>
              <div className="h-3 bg-purple-200 rounded w-5/6"></div>
              <div className="h-3 bg-purple-200 rounded w-4/5"></div>
              <div className="h-4 bg-purple-200 rounded w-1/4 pt-2"></div>
              <div className="h-3 bg-purple-200 rounded w-full"></div>
            </div>
            
            {/* Paywall Overlay */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4 bg-white/30 backdrop-blur-[1px]">
              <div className="rounded-full bg-purple-100 p-3 text-purple-600 mb-2">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-5 w-5">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </div>
              <p className="text-sm font-bold text-purple-950">
                {insightTab === "daily" ? "Buka Laporan Harian AI" : "Buka Laporan Mingguan AI"}
              </p>
              <p className="text-[11px] text-muted-foreground max-w-xs mt-1 mb-3">
                {insightTab === "daily"
                  ? "Dapatkan afirmasi penenang, evaluasi mood, dan rekomendasi langkah damai malam ini untuk tidur yang lebih nyenyak."
                  : "Dapatkan evaluasi emosi mingguan, rekomendasi koping personal, dan deteksi dini stres berdasarkan datamu."}
              </p>
              <Link
                to="/app/premium"
                className="rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 px-5 py-2 text-xs font-bold text-white shadow-soft transition-all duration-200 hover:-translate-y-0.5 active:scale-95"
              >
                Upgrade ke Premium ✨
              </Link>
            </div>
          </div>
        ) : (
          <>
            {/* DAILY INSIGHT LOADING */}
            {insightTab === "daily" && dailyInsightLoading && (
              <div className="mt-4 space-y-2">
                <div className="skeleton h-3 w-full rounded-full" />
                <div className="skeleton h-3 w-5/6 rounded-full" />
                <div className="skeleton h-3 w-4/5 rounded-full" />
              </div>
            )}

            {/* WEEKLY INSIGHT LOADING */}
            {insightTab === "weekly" && weeklyInsightLoading && (
              <div className="mt-4 space-y-2">
                <div className="skeleton h-3 w-full rounded-full" />
                <div className="skeleton h-3 w-5/6 rounded-full" />
                <div className="skeleton h-3 w-4/5 rounded-full" />
              </div>
            )}

            {/* DAILY INSIGHT CONTENT */}
            {insightTab === "daily" && !dailyInsightLoading && (
              <>
                {dailyInsight === "BELUM_ADA_DATA_HARI_INI" ? (
                  <div className="mt-4 text-center p-6 rounded-2xl bg-white/60 border border-amber-200/50 shadow-sm">
                    <span className="text-3xl select-none">📝</span>
                    <p className="text-xs font-bold text-amber-900 mt-2.5">Belum ada evaluasi mood hari ini</p>
                    <p className="text-[10px] text-muted-foreground mt-1 max-w-xs mx-auto leading-relaxed">
                      Silakan lakukan check-in mood harian terlebih dahulu agar sistem dapat menyusun refleksi mentalmu hari ini.
                    </p>
                    <div className="mt-4">
                      <Link 
                        to="/app/mood" 
                        className="inline-block rounded-full bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 text-[10px] font-bold shadow-soft transition-all duration-200 hover:-translate-y-0.5 active:scale-95"
                      >
                        Check-in Mood Sekarang →
                      </Link>
                    </div>
                  </div>
                ) : dailyInsight ? (
                  <div className="mt-4 animate-slide-up rounded-2xl bg-white/80 border border-primary/10 p-5 shadow-sm relative overflow-hidden select-text selection:bg-primary-soft">
                    <div className="absolute left-3 top-0 bottom-0 w-[1px] bg-primary/30" />
                    <div className="pl-4 space-y-2">
                      {parseMarkdown(dailyInsight)}
                    </div>
                  </div>
                ) : (
                  <p className="mt-4 text-sm text-muted-foreground">
                    Klik "Generate" untuk mendapatkan insight personal hari ini.
                  </p>
                )}

                {hasDailyGeneratedToday && dailyInsight && dailyInsight !== "BELUM_ADA_DATA_HARI_INI" && (
                  <div className="mt-4 text-[10px] text-purple-700 bg-purple-50/50 border border-purple-100/60 rounded-2xl p-3 font-semibold flex items-start gap-2 animate-fade-in shadow-inner">
                    <span>💡</span>
                    <p className="leading-normal">
                      Kamu sudah membuat insight hari ini. Mengklik <strong>Regenerate</strong> akan memperbarui laporan hari ini di riwayat kamu.
                    </p>
                  </div>
                )}
              </>
            )}

            {/* WEEKLY INSIGHT CONTENT */}
            {insightTab === "weekly" && !weeklyInsightLoading && (
              <>
                {weeklyInsight ? (
                  <div className="mt-4 animate-slide-up rounded-2xl bg-white/80 border border-primary/10 p-5 shadow-sm relative overflow-hidden select-text selection:bg-primary-soft">
                    <div className="absolute left-3 top-0 bottom-0 w-[1px] bg-primary/30" />
                    <div className="pl-4 space-y-2">
                      {parseMarkdown(weeklyInsight)}
                    </div>
                  </div>
                ) : (
                  <p className="mt-4 text-sm text-muted-foreground">
                    Klik "Generate" untuk mendapatkan insight personal minggu ini.
                  </p>
                )}

                {weeklyInsight && (
                  <>
                    {hasWeeklyGeneratedToday ? (
                      <div className="mt-4 text-[10px] text-purple-700 bg-purple-50/50 border border-purple-100/60 rounded-2xl p-3 font-semibold flex items-start gap-2 animate-fade-in shadow-inner">
                        <span>💡</span>
                        <p className="leading-normal">
                          Kamu sudah membuat insight hari ini. Mengklik <strong>Regenerate</strong> akan memperbarui laporan hari ini di riwayat kamu.
                        </p>
                      </div>
                    ) : !weeklyStatus.canGenerate ? (
                      <div className="mt-4 text-[10px] text-stone-600 bg-stone-50/80 border border-stone-200/50 rounded-2xl p-3 font-semibold flex items-start gap-2 animate-fade-in shadow-inner">
                        <span>🔒</span>
                        <p className="leading-normal">
                          Insight mingguan dikunci. Kamu bisa men-generate insight baru dalam <strong>{weeklyStatus.daysRemaining} hari</strong> lagi untuk melacak perkembangan terbarumu.
                        </p>
                      </div>
                    ) : null}
                  </>
                )}
              </>
            )}
          </>
        )}
      </section>

      {/* ── MINDPLANT LIBRARY DIALOG ───────────────────────────── */}
      <ModalDialog
        open={plantModalOpen}
        onClose={() => setPlantModalOpen(false)}
        title="🌱 Koleksi Tanaman Jiwa"
      >
        <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
          <p className="text-xs text-muted-foreground leading-relaxed">
            Skor Jiwa Anda dihitung berdasarkan keaktifan merawat diri:
            <br />• <strong>Check-in Mood</strong> (+8 Pts per hari)
            <br />• Menulis lembaran <strong>Diary</strong> (+12 Pts)
            <br />• Mengisi jurnal <strong>Syukur</strong> (+12 Pts)
          </p>

          <div className="space-y-2.5">
            {LEVEL_STAGES.map((st) => {
              const lvlInfo = getLevelInfo(growthScore);
              const isActive = lvlInfo.level === st.level;
              return (
                <div 
                  key={st.level}
                  className={`p-3.5 rounded-2xl border flex items-center gap-3 transition-all duration-200 ${
                    isActive 
                      ? "border-amber-400 bg-amber-50/50 shadow-sm scale-[1.01]" 
                      : "border-border bg-card opacity-70"
                  }`}
                >
                  <div className="text-3xl bg-white p-2 rounded-xl shadow-sm leading-none shrink-0 select-none">
                    {st.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 flex-wrap">
                      <h4 className={`text-xs font-bold ${isActive ? "text-amber-900" : "text-foreground"}`}>{st.name}</h4>
                      <span className="rounded-full bg-primary-soft px-2 py-0.5 text-[9px] font-semibold text-primary">{st.range}</span>
                    </div>
                    <p className="text-[10px] text-muted-foreground leading-relaxed mt-0.5">{st.desc}</p>
                  </div>
                  {isActive && (
                    <span className="shrink-0 text-[10px] font-extrabold text-amber-600 animate-pulse select-none">Aktif</span>
                  )}
                </div>
              );
            })}
          </div>

          <button 
            onClick={() => setPlantModalOpen(false)}
            className="w-full rounded-full bg-primary py-2.5 text-xs font-bold text-white shadow-soft transition-all duration-200 mt-2 hover:-translate-y-0.5 active:scale-95"
          >
            Tutup Library
          </button>
        </div>
      </ModalDialog>

      {/* ── STATS EXPLANATION DIALOG ───────────────────────────── */}
      <ModalDialog
        open={!!selectedStat}
        onClose={() => setSelectedStat(null)}
        title={selectedStat?.title}
      >
        {selectedStat && (
          <div className="space-y-4">
            <p className="text-sm text-stone-700 leading-relaxed font-medium">
              {selectedStat.desc}
            </p>
            <button 
              onClick={() => setSelectedStat(null)}
              className="w-full rounded-full bg-stone-100 py-2.5 text-xs font-bold text-stone-600 hover:bg-stone-200 transition-all duration-200"
            >
              Tutup Penjelasan
            </button>
          </div>
        )}
      </ModalDialog>

      {/* ── INSIGHT HISTORY DIALOG ────────────────────────────── */}
      <ModalDialog
        open={historyModalOpen}
        onClose={() => setHistoryModalOpen(false)}
        title={insightTab === "daily" ? "🕒 Riwayat Refleksi Harian" : "🕒 Riwayat Refleksi Mingguan"}
      >
        <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
          <p className="text-xs text-muted-foreground leading-normal">
            {insightTab === "daily" 
              ? "Berikut adalah catatan refleksi harian Anda untuk melacak progress harian Anda."
              : "Berikut adalah catatan refleksi mingguan Anda dari minggu-minggu sebelumnya untuk melacak progress Anda."}
          </p>

          <div className="space-y-3.5">
            {(insightTab === "daily" ? dailyHistory : weeklyHistory).map((item) => {
              const formattedDate = new Date(item.date).toLocaleDateString("id-ID", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric"
              });
              
              return (
                <div key={item.id} className="rounded-2xl border border-border bg-card p-4 relative overflow-hidden text-xs leading-relaxed text-stone-700">
                  <div className="flex items-center justify-between mb-2 pb-2 border-b border-border/40">
                    <span className="font-bold text-stone-500">{formattedDate}</span>
                    <div className="flex items-center gap-2.5">
                       <button
                        onClick={() => exportWeeklyInsightPDF(
                          item.date, 
                          item.text, 
                          insightTab === "daily" ? "Refleksi Harian (Daily Insight)" : "Refleksi Mingguan (Weekly Insight)"
                        )}
                        className="text-primary hover:underline text-[10px] font-bold"
                      >
                        Simpan PDF 📄
                      </button>
                      <button 
                        onClick={() => {
                          if (insightTab === "daily") {
                            const updated = dailyHistory.filter(x => x.id !== item.id);
                            setDailyHistory(updated);
                            localStorage.setItem(`bloom_daily_insights_history_${user!.id}`, JSON.stringify(updated));
                            if (dailyInsight === item.text) {
                              setDailyInsight(updated[0]?.text ?? null);
                              if (updated[0]?.text) {
                                localStorage.setItem(`bloom_daily_insight_${user!.id}`, updated[0].text);
                              } else {
                                localStorage.removeItem(`bloom_daily_insight_${user!.id}`);
                              }
                            }
                          } else {
                            const updated = weeklyHistory.filter(x => x.id !== item.id);
                            setWeeklyHistory(updated);
                            localStorage.setItem(`bloom_weekly_insights_history_${user!.id}`, JSON.stringify(updated));
                            if (weeklyInsight === item.text) {
                              setWeeklyInsight(updated[0]?.text ?? null);
                              if (updated[0]?.text) {
                                localStorage.setItem(`bloom_weekly_insight_${user!.id}`, updated[0].text);
                              } else {
                                localStorage.removeItem(`bloom_weekly_insight_${user!.id}`);
                              }
                            }
                          }
                        }}
                        className="text-stone-400 hover:text-red-500 text-[10px] font-bold"
                        title="Hapus analisis ini"
                      >
                        Hapus
                      </button>
                    </div>
                  </div>
                  <div className="select-text selection:bg-primary-soft space-y-2">
                    {parseMarkdown(item.text, true)}
                  </div>
                </div>
              );
            })}
          </div>

          <button 
            onClick={() => setHistoryModalOpen(false)}
            className="w-full rounded-full bg-stone-100 py-2.5 text-xs font-bold text-stone-600 hover:bg-stone-200 transition-all duration-200"
          >
            Tutup Riwayat
          </button>
        </div>
      </ModalDialog>
    </div>
  );
}


