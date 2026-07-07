import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface GardenData {
  progress: number;
  history: { name: string; emoji: string; date: string }[];
  completedHabits: string[];
  completedMoods: string[];
  completedJournals: string[];
  lastResetDate: string;
}

const FLOWERS = [
  { name: "Mawar Merah", emoji: "🌹" },
  { name: "Tulip Cantik", emoji: "🌷" },
  { name: "Matahari Ceria", emoji: "🌻" },
  { name: "Lavender Tenang", emoji: "🪻" },
  { name: "Sakura Indah", emoji: "🌸" },
  { name: "Teratai Damai", emoji: "🪷" },
  { name: "Melati Suci", emoji: "🌼" },
];

export function BloomGarden({ userId }: { userId?: string }) {
  // Use local date string instead of UTC to avoid early 7 AM day rollover bugs
  const getLocalDateString = (d: Date = new Date()) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const todayStr = getLocalDateString();

  const [garden, setGarden] = useState<GardenData>(() => {
    const saved = userId ? localStorage.getItem(`bloom_garden_${userId}`) : null;
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return {
      progress: 0,
      history: [],
      completedHabits: [],
      completedMoods: [],
      completedJournals: [],
      lastResetDate: todayStr,
    };
  });

  const [showGallery, setShowGallery] = useState(false);
  const [justBloomed, setJustBloomed] = useState<{ name: string; emoji: string } | null>(null);

  // Queries for reactivity
  const { data: habits = [] } = useQuery({
    queryKey: ["habit-logs-today", userId, todayStr],
    enabled: !!userId,
    queryFn: async () => {
      const { data } = await supabase
        .from("habit_logs")
        .select("id")
        .eq("user_id", userId!)
        .eq("date", todayStr)
        .eq("completed", true);
      return data ?? [];
    },
  });

  const { data: moods = [] } = useQuery({
    queryKey: ["moods-today", userId, todayStr],
    enabled: !!userId,
    queryFn: async () => {
      const { data } = await supabase
        .from("mood_checkins")
        .select("id")
        .eq("user_id", userId!)
        .eq("date", todayStr);
      return data ?? [];
    },
  });

  const { data: journals = [] } = useQuery({
    queryKey: ["journals-today", userId, todayStr],
    enabled: !!userId,
    queryFn: async () => {
      const { data } = await supabase
        .from("journals")
        .select("id")
        .eq("user_id", userId!)
        .eq("date", todayStr);
      return data ?? [];
    },
  });

  // Save to localStorage whenever garden state changes
  const saveGarden = (newData: GardenData) => {
    setGarden(newData);
    if (userId) {
      localStorage.setItem(`bloom_garden_${userId}`, JSON.stringify(newData));
    }
  };

  useEffect(() => {
    if (!userId) return;

    // Reset daily logged activities if date changes
    let current = { ...garden };
    if (current.lastResetDate !== todayStr) {
      current.completedHabits = [];
      current.completedMoods = [];
      current.completedJournals = [];
      current.lastResetDate = todayStr;
    }

    let progressDiff = 0;
    const newCompletedHabits: string[] = [];
    const newCompletedMoods: string[] = [];
    const newCompletedJournals: string[] = [];

    // Process habits
    const habitIds = habits.map((h) => h.id);
    habitIds.forEach((id) => {
      if (!current.completedHabits.includes(id)) {
        progressDiff += 10;
      }
      newCompletedHabits.push(id);
    });
    current.completedHabits.forEach((id) => {
      if (!habitIds.includes(id)) {
        progressDiff -= 10;
      }
    });

    // Process moods
    const moodIds = moods.map((m) => m.id);
    moodIds.forEach((id) => {
      if (!current.completedMoods.includes(id)) {
        progressDiff += 20;
      }
      newCompletedMoods.push(id);
    });
    current.completedMoods.forEach((id) => {
      if (!moodIds.includes(id)) {
        progressDiff -= 20;
      }
    });

    // Process journals
    const journalIds = journals.map((j) => j.id);
    journalIds.forEach((id) => {
      if (!current.completedJournals.includes(id)) {
        progressDiff += 35;
      }
      newCompletedJournals.push(id);
    });
    current.completedJournals.forEach((id) => {
      if (!journalIds.includes(id)) {
        progressDiff -= 35;
      }
    });

    if (progressDiff !== 0) {
      const nextProgress = Math.max(0, Math.min(100, current.progress + progressDiff));
      saveGarden({
        ...current,
        progress: nextProgress,
        completedHabits: newCompletedHabits,
        completedMoods: newCompletedMoods,
        completedJournals: newCompletedJournals,
      });
    } else if (current.lastResetDate !== garden.lastResetDate) {
      saveGarden(current);
    }
  }, [habits, moods, journals, userId]);

  // Determine stage of plant
  const progress = garden.progress;
  let plantStage = "Benih";
  if (progress >= 100) {
    plantStage = "Mekar Sempurna!";
  } else if (progress >= 60) {
    plantStage = "Kuncup Bunga";
  } else if (progress >= 30) {
    plantStage = "Tunas Muda";
  }

  const handleHarvest = () => {
    if (progress < 100) return;
    
    const flower = FLOWERS[Math.floor(Math.random() * FLOWERS.length)];
    const historyItem = {
      name: flower.name,
      emoji: flower.emoji,
      date: new Date().toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }),
    };

    setJustBloomed(flower);
    
    saveGarden({
      ...garden,
      progress: 0,
      history: [historyItem, ...garden.history],
    });

    setTimeout(() => {
      setJustBloomed(null);
    }, 4000);
  };

  /* Render growing plant SVG dynamically based on progress */
  const renderPlantSVG = () => {
    // stem path length is roughly 50px (from y=50 to y=15)
    // progress maps to stem length
    const stemOffset = Math.max(0, 50 - (progress / 100) * 50);

    const showLeaf1 = progress >= 30;
    const showLeaf2 = progress >= 60;
    const isBlooming = progress >= 100;

    return (
      <svg
        viewBox="0 0 60 60"
        width="100%"
        height="100%"
        className="overflow-visible"
      >
        <defs>
          <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="1.5" stdDeviation="1" floodOpacity="0.08" />
          </filter>
        </defs>

        {/* Small Brown Soil / Seed Pot */}
        <path
          d="M 18,48 L 42,48 L 38,55 L 22,55 Z"
          fill="oklch(0.48 0.05 45)"
          className="transition-colors duration-500"
        />
        <rect
          x="16"
          y="45"
          width="28"
          height="3"
          rx="1"
          fill="oklch(0.42 0.05 45)"
        />

        {/* Growing Stem */}
        <path
          d="M 30,45 Q 28,30 30,15"
          fill="none"
          stroke="oklch(0.71 0.045 160)"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeDasharray="50"
          strokeDashoffset={stemOffset}
          style={{ transition: "stroke-dashoffset 1.5s cubic-bezier(0.22, 1, 0.36, 1)" }}
        />

        {/* Left Leaf (appears at >= 30% progress) */}
        <g
          className="transition-all duration-700 origin-[29px_34px]"
          style={{
            transform: showLeaf1 ? "scale(1)" : "scale(0)",
            opacity: showLeaf1 ? 1 : 0,
          }}
        >
          <path
            d="M 29,34 C 18,34 16,24 28,28 C 29,28 29,32 29,34 Z"
            fill="oklch(0.76 0.05 165)"
          />
        </g>

        {/* Right Leaf (appears at >= 60% progress) */}
        <g
          className="transition-all duration-700 origin-[31px_26px]"
          style={{
            transform: showLeaf2 ? "scale(1)" : "scale(0)",
            opacity: showLeaf2 ? 1 : 0,
          }}
        >
          <path
            d="M 31,26 C 42,26 44,18 32,21 C 31,21 31,24 31,26 Z"
            fill="oklch(0.76 0.05 165)"
          />
        </g>

        {/* Bud or Blooming Flower at the top */}
        {progress >= 30 && (
          <g
            className="transition-all duration-1000 origin-[30px_15px] cursor-pointer"
            style={{
              transform: isBlooming ? "scale(1.2)" : progress >= 60 ? "scale(0.85)" : "scale(0.4)",
              opacity: progress >= 60 ? 1 : 0.6,
            }}
            filter="url(#shadow)"
          >
            {/* If blooming fully, draw petals. Otherwise, draw a closed coral bud. */}
            {isBlooming ? (
              <>
                {/* Center Core */}
                <circle cx="30" cy="15" r="4.5" fill="oklch(0.85 0.12 85)" />
                {/* 5 Petals */}
                <circle cx="30" cy="9" r="4" fill="oklch(0.80 0.10 40)" />
                <circle cx="35" cy="12.5" r="4" fill="oklch(0.80 0.10 40)" />
                <circle cx="33" cy="18.5" r="4" fill="oklch(0.80 0.10 40)" />
                <circle cx="27" cy="18.5" r="4" fill="oklch(0.80 0.10 40)" />
                <circle cx="25" cy="12.5" r="4" fill="oklch(0.80 0.10 40)" />
              </>
            ) : (
              // Bud
              <path
                d="M 30,10 C 26,11 26,19 30,19 C 34,19 34,11 30,10 Z"
                fill="oklch(0.80 0.08 40)"
              />
            )}
          </g>
        )}
      </svg>
    );
  };

  return (
    <div className="mx-3 my-2 p-3 bg-gradient-to-br from-emerald-50/80 to-teal-50/50 rounded-2xl border border-emerald-100/60 shadow-[0_4px_12px_rgba(16,185,129,0.04)] flex flex-col gap-3 relative overflow-hidden group">
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes plant-wobble {
          0%, 100% { transform: rotate(0deg) scale(1); }
          50% { transform: rotate(2deg) scale(1.02); }
        }
        .animate-plant-wobble {
          animation: plant-wobble 3s infinite ease-in-out;
        }
        @keyframes bloom-burst {
          0% { transform: scale(0) rotate(0deg); opacity: 0; }
          50% { transform: scale(1.3) rotate(180deg); opacity: 1; }
          100% { transform: scale(1) rotate(360deg); opacity: 1; }
        }
        .animate-bloom-burst {
          animation: bloom-burst 1s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
      `}} />

      <div className="flex items-center justify-between">
        <div>
          <p className="text-[9px] font-bold text-emerald-700/90 uppercase tracking-[0.18em] leading-none">
            BLOOM GARDEN
          </p>
          <p className="text-[12px] font-bold text-emerald-950 leading-tight mt-1">
            Tumbuhkan Bungamu
          </p>
        </div>
        <button
          onClick={() => setShowGallery(true)}
          className="text-[9px] font-bold text-emerald-600/80 hover:text-emerald-700 hover:scale-105 active:scale-95 transition-all flex items-center gap-1 bg-white/60 px-2 py-1 rounded-lg border border-emerald-100/50"
        >
          🖼️ Galeri ({garden.history.length})
        </button>
      </div>

      <div className="flex items-center gap-3">
        {/* Plant SVG Container */}
        <div className="relative shrink-0 w-12 h-12 bg-white/50 rounded-xl border border-emerald-100/40 flex items-center justify-center select-none shadow-inner p-1">
          <div className="w-full h-full animate-plant-wobble">
            {renderPlantSVG()}
          </div>
        </div>

        {/* Growth Progress */}
        <div className="min-w-0 flex-1">
          <div className="flex justify-between items-end mb-1">
            <span className="text-[10px] font-bold text-emerald-800/80">
              {plantStage}
            </span>
            <span className="text-[9px] font-extrabold text-emerald-900">
              {progress}%
            </span>
          </div>
          
          {/* Progress Bar */}
          <div className="h-2 w-full bg-emerald-100/50 rounded-full overflow-hidden border border-emerald-200/20">
            <div
              className="h-full bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Action Button */}
      {progress >= 100 && (
        <button
          onClick={handleHarvest}
          className="w-full py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-500/20 hover:scale-[1.02] active:scale-95 transition-all duration-300 animate-bounce"
          style={{ animationDuration: "2s" }}
        >
          🌺 Petik Bungamu!
        </button>
      )}

      {/* Just Bloomed Overlay Card */}
      {justBloomed && (
        <div className="absolute inset-0 bg-emerald-950/95 flex flex-col items-center justify-center text-center p-3 z-10 animate-fade-in">
          <div className="text-4xl animate-bloom-burst">
            {justBloomed.emoji}
          </div>
          <p className="text-[10px] font-bold text-white mt-1.5">Bunga Mekar!</p>
          <p className="text-[13px] font-extrabold text-emerald-300 leading-tight">
            {justBloomed.name}
          </p>
          <p className="text-[8px] text-emerald-100/70 mt-1 leading-normal">
            Tersimpan di Galeri. Pot kembali ditanam benih 🌱
          </p>
        </div>
      )}

      {/* Gallery Dialog Sheet */}
      {showGallery && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in" onClick={() => setShowGallery(false)}>
          <div
            className="bg-card w-full max-w-xs rounded-[2rem] p-5 border border-border/60 shadow-elevated animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-border">
              <h3 className="font-display text-sm font-bold text-foreground">🌷 Galeri Bloom</h3>
              <button
                onClick={() => setShowGallery(false)}
                className="h-7 w-7 rounded-full bg-muted/60 flex items-center justify-center text-xs hover:bg-muted font-bold"
              >
                ✕
              </button>
            </div>

            <div className="mt-3 max-h-52 overflow-y-auto space-y-2 pr-1 scrollbar-none">
              {garden.history.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground">
                  <p className="text-xl">🌱</p>
                  <p className="text-[10px] font-bold mt-1.5">Kebun masih kosong.</p>
                  <p className="text-[8px] text-muted-foreground/75 mt-0.5">Selesaikan tugas harian untuk menumbuhkan bunga!</p>
                </div>
              ) : (
                garden.history.map((h, i) => (
                  <div key={i} className="flex items-center gap-2.5 p-2 bg-muted/40 rounded-xl border border-border/40">
                    <span className="text-xl">{h.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-bold text-foreground/90 truncate">{h.name}</p>
                      <p className="text-[8px] text-muted-foreground font-semibold">{h.date}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
            
            <p className="text-[8px] text-muted-foreground/80 mt-3 text-center leading-normal">
              Habit (+10%) · Mood (+20%) · Journal (+35%)
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
