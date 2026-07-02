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
      lastResetDate: new Date().toISOString().slice(0, 10),
    };
  });

  const [showGallery, setShowGallery] = useState(false);
  const [justBloomed, setJustBloomed] = useState<{ name: string; emoji: string } | null>(null);

  const todayStr = new Date().toISOString().slice(0, 10);

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
      const startOfDay = todayStr + "T00:00:00.000Z";
      const endOfDay = todayStr + "T23:59:59.999Z";
      const { data } = await supabase
        .from("journals")
        .select("id")
        .eq("user_id", userId!)
        .gte("created_at", startOfDay)
        .lte("created_at", endOfDay);
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
  let plantEmoji = "🌱";
  let plantStage = "Benih";
  if (progress >= 100) {
    plantEmoji = "🌺";
    plantStage = "Mekar Sempurna!";
  } else if (progress >= 60) {
    plantEmoji = "🌸";
    plantStage = "Kuncup Bunga";
  } else if (progress >= 30) {
    plantEmoji = "🌿";
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

  return (
    <div className="mx-3 my-2 p-3 bg-gradient-to-br from-emerald-50/80 to-teal-50/50 rounded-2xl border border-emerald-100/60 shadow-[0_4px_12px_rgba(16,185,129,0.04)] flex flex-col gap-3 relative overflow-hidden group">
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes plant-wobble {
          0%, 100% { transform: rotate(0deg) scale(1); }
          50% { transform: rotate(3deg) scale(1.03); }
        }
        .animate-plant-wobble {
          animation: plant-wobble 2.5s infinite ease-in-out;
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
        {/* Plant Visual */}
        <div className="relative shrink-0 w-11 h-11 bg-white/40 rounded-xl border border-emerald-100/40 flex items-center justify-center select-none shadow-inner">
          <div className="text-2xl animate-plant-wobble">
            {plantEmoji}
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
