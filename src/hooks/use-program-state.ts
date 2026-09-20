import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/use-auth";

export type ProgramDuration = "30hari" | "90hari" | "365hari";

export interface DailyMission {
  id: string;
  title: string;
  desc: string;
  badge: string;
  toolPath: string;
  toolLabel: string;
  searchParams?: Record<string, string>;
  completed: boolean;
}

export interface ProgramState {
  selectedProgram: ProgramDuration | null;
  startDate: string | null;
  currentDay: number;
  totalDays: number;
  hasCompletedCalmCheck: boolean;
  dailyMissions: DailyMission[];
  completedCount: number;
  isAllCompleted: boolean;
  selectProgram: (program: ProgramDuration) => void;
  toggleMission: (missionId: string) => void;
  resetProgram: () => void;
}

const MISSIONS_MASTER: Omit<DailyMission, "completed">[] = [
  {
    id: "mission_mood",
    title: "Mood & Cuaca Emosi",
    desc: "Catat kondisi emosi dan tingkat energimu saat ini untuk melatih kesadaran diri.",
    badge: "🌤️ EMOSI",
    toolPath: "/app/mood",
    toolLabel: "Check-in Mood",
  },
  {
    id: "mission_journal",
    title: "Refleksi Jurnal CBT",
    desc: "Urai 1 pikiran otomatis negatif atau catat 3 hal kecil yang kamu syukuri hari ini.",
    badge: "📓 JURNAL",
    toolPath: "/app/journal",
    toolLabel: "Buka Jurnal",
  },
  {
    id: "mission_chat",
    title: "Sesi Curhat Pendamping AI",
    desc: "Bagi beban pikiranmu tanpa rasa takut dihakimi bersama pendamping emosional.",
    badge: "💬 SAFE CHAT",
    toolPath: "/app/chat",
    toolLabel: "Mulai Chat",
  },
  {
    id: "mission_eating",
    title: "Check-in Emotional Eating",
    desc: "Kenali apakah kamu makan karena lapar fisik atau mencari rasa nyaman emosi.",
    badge: "🍎 MINDFUL",
    toolPath: "/app/eating",
    toolLabel: "Cek Lapar Emosi",
  },
  {
    id: "mission_calm",
    title: "Somatic Reset & Pernapasan",
    desc: "Lakukan latihan pernapasan 4-7-8 atau grounding 2 menit untuk menenangkan saraf Vagus.",
    badge: "🫁 CALM",
    toolPath: "/app/calm",
    toolLabel: "Mulai Reset",
    searchParams: { tool: "breath" },
  },
];

export function useProgramState(): ProgramState {
  const { user } = useAuth();
  const userId = user?.id || "guest";

  const PROGRAM_STORAGE_KEY = `bloom_active_program_${userId}`;
  const DATE_STORAGE_KEY = `bloom_program_start_date_${userId}`;

  const [selectedProgram, setSelectedProgram] = useState<ProgramDuration | null>(null);
  const [startDate, setStartDate] = useState<string | null>(null);
  const [hasCompletedCalmCheck, setHasCompletedCalmCheck] = useState<boolean>(false);
  const [completedMissionIds, setCompletedMissionIds] = useState<string[]>([]);

  // Format today's date string YYYY-MM-DD
  const todayStr = new Date().toISOString().slice(0, 10);
  const DAILY_STORAGE_KEY = `bloom_missions_completed_${userId}_${todayStr}`;
  const CALM_CHECK_KEY = `jn_calm_check_history_${userId}`;

  // Load saved state on mount or user change
  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const savedProgram = localStorage.getItem(PROGRAM_STORAGE_KEY) as ProgramDuration | null;
      const savedDate = localStorage.getItem(DATE_STORAGE_KEY);
      const savedCompleted = localStorage.getItem(DAILY_STORAGE_KEY);
      const savedCalmHistory = localStorage.getItem(CALM_CHECK_KEY);

      if (savedProgram) {
        setSelectedProgram(savedProgram);
      }
      if (savedDate) {
        setStartDate(savedDate);
      }
      if (savedCompleted) {
        setCompletedMissionIds(JSON.parse(savedCompleted));
      } else {
        setCompletedMissionIds([]);
      }

      if (savedCalmHistory) {
        const parsed = JSON.parse(savedCalmHistory);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setHasCompletedCalmCheck(true);
        }
      }
    } catch (e) {
      console.error("Gagal memuat state program:", e);
    }
  }, [userId, PROGRAM_STORAGE_KEY, DATE_STORAGE_KEY, DAILY_STORAGE_KEY, CALM_CHECK_KEY]);

  // Calculate current day number
  let currentDay = 1;
  let totalDays = 90;

  if (selectedProgram === "30hari") totalDays = 30;
  else if (selectedProgram === "90hari") totalDays = 90;
  else if (selectedProgram === "365hari") totalDays = 365;

  if (startDate) {
    const start = new Date(startDate);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - start.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
    currentDay = Math.min(diffDays, totalDays);
  }

  const selectProgram = useCallback((program: ProgramDuration) => {
    const nowIso = new Date().toISOString();
    setSelectedProgram(program);
    setStartDate(nowIso);
    try {
      localStorage.setItem(PROGRAM_STORAGE_KEY, program);
      localStorage.setItem(DATE_STORAGE_KEY, nowIso);
    } catch (e) {
      console.error("Gagal menyimpan program:", e);
    }
  }, [PROGRAM_STORAGE_KEY, DATE_STORAGE_KEY]);

  const toggleMission = useCallback((missionId: string) => {
    setCompletedMissionIds((prev) => {
      const next = prev.includes(missionId)
        ? prev.filter((id) => id !== missionId)
        : [...prev, missionId];
      try {
        localStorage.setItem(DAILY_STORAGE_KEY, JSON.stringify(next));
      } catch (e) {
        console.error("Gagal menyimpan misi:", e);
      }
      return next;
    });
  }, [DAILY_STORAGE_KEY]);

  const resetProgram = useCallback(() => {
    setSelectedProgram(null);
    setStartDate(null);
    setCompletedMissionIds([]);
    try {
      localStorage.removeItem(PROGRAM_STORAGE_KEY);
      localStorage.removeItem(DATE_STORAGE_KEY);
    } catch (e) {
      console.error("Gagal mereset program:", e);
    }
  }, [PROGRAM_STORAGE_KEY, DATE_STORAGE_KEY]);

  const dailyMissions: DailyMission[] = MISSIONS_MASTER.map((m) => ({
    ...m,
    completed: completedMissionIds.includes(m.id),
  }));

  const completedCount = dailyMissions.filter((m) => m.completed).length;
  const isAllCompleted = completedCount === dailyMissions.length;

  return {
    selectedProgram,
    startDate,
    currentDay,
    totalDays,
    hasCompletedCalmCheck,
    dailyMissions,
    completedCount,
    isAllCompleted,
    selectProgram,
    toggleMission,
    resetProgram,
  };
}
