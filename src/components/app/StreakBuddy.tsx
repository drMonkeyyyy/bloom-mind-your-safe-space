import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function StreakBuddy({ userId }: { userId?: string }) {
  const { data: streak = 0 } = useQuery({
    queryKey: ["habit-streak", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data } = await supabase
        .from("habit_logs")
        .select("date")
        .eq("user_id", userId!)
        .eq("completed", true)
        .order("date", { ascending: false })
        .limit(30);
      if (!data || data.length === 0) return 0;
      
      const getLocalDateString = (dateObj: Date) => {
        const year = dateObj.getFullYear();
        const month = String(dateObj.getMonth() + 1).padStart(2, '0');
        const day = String(dateObj.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      };

      const dates = new Set(data.map((d) => d.date));
      let s = 0;
      const d = new Date();
      const todayStr = getLocalDateString(d);
      
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = getLocalDateString(yesterday);
      
      if (!dates.has(todayStr) && !dates.has(yesterdayStr)) {
        return 0;
      }

      const countDate = dates.has(todayStr) ? d : yesterday;
      while (dates.has(getLocalDateString(countDate))) {
        s++;
        countDate.setDate(countDate.getDate() - 1);
      }
      return s;
    },
  });

  return (
    <div className="mx-3 my-2 p-3 bg-gradient-to-br from-amber-50 to-orange-50/70 rounded-2xl border border-amber-100/80 shadow-[0_4px_12px_rgba(251,191,36,0.06)] flex items-center gap-3.5 overflow-hidden relative group">
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes cute-bounce {
          0%, 100% { transform: translateY(0) scaleY(1); }
          50% { transform: translateY(-7px) scaleY(0.9); }
          80% { transform: translateY(1px) scaleY(1.05); }
        }
        @keyframes shadow-shrink {
          0%, 100% { transform: scale(1); opacity: 0.15; }
          50% { transform: scale(0.65); opacity: 0.05; }
        }
        .animate-cute-bounce {
          animation: cute-bounce 1.3s infinite ease-in-out;
        }
        .animate-shadow-shrink {
          animation: shadow-shrink 1.3s infinite ease-in-out;
        }
      `}} />
      
      {/* Fire Character */}
      <div className="relative shrink-0 select-none w-9 h-9 flex items-center justify-center">
        <div className="absolute bottom-0.5 h-1 bg-amber-950/20 rounded-full blur-[1px] animate-shadow-shrink" style={{ width: "20px" }} />
        <div className="text-3xl animate-cute-bounce relative z-10 cursor-pointer active:scale-125 transition-transform hover:scale-110">
          🔥
        </div>
        {streak > 0 && (
          <>
            <span className="absolute -top-1 -right-1.5 text-[8px] animate-ping" style={{ animationDuration: "1.8s" }}>✨</span>
            <span className="absolute top-2 -left-2 text-[8px] animate-bounce" style={{ animationDuration: "1.5s" }}>⭐</span>
          </>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-[9px] font-bold text-amber-700/90 uppercase tracking-[0.18em] leading-none">
          STREAK AKTIF
        </p>
        <p className="text-[13px] font-extrabold text-amber-950 leading-tight mt-1 truncate">
          {streak} Hari Bermain!
        </p>
        <p className="text-[9.5px] font-semibold text-amber-800/80 leading-normal mt-0.5">
          {streak === 0 
            ? "Mulai habit pertama hari ini! 🌱" 
            : streak < 3 
            ? "Bagus sekali! Lanjutkan ya! ⭐" 
            : streak < 7 
            ? "Wah, kamu hebat sekali! ✨" 
            : "Luar biasa! Terus berkilau! 🚀"}
        </p>
      </div>
    </div>
  );
}
