import { createFileRoute, Link } from "@tanstack/react-router";
import { useAuth } from "@/hooks/use-auth";
import { useProfile } from "@/hooks/use-profile";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { MOOD_OPTIONS } from "@/lib/companions";
import { MoodBars } from "@/components/app/MoodSparkline";
import { SkeletonCard } from "@/components/app/SkeletonCard";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { toggleAmbientSound, subscribeAudioState } from "@/lib/audio";
import { useProgramState } from "@/hooks/use-program-state";

export const Route = createFileRoute("/_authenticated/app/")({
  component: Dashboard,
});

const HANDCRAFTED_AFFIRMATIONS = [
  "Hari ini adalah lembaran baru. Berjalanlah dengan kecepatanmu sendiri. 🍃",
  "Kamu berharga bukan karena apa yang kamu lakukan, tetapi karena dirimu apa adanya. ✨",
  "Tidak apa-apa untuk merasa lelah. Istirahatlah sejenak dan mulailah lagi esok hari. 🌸",
  "Setiap napas yang kamu ambil adalah bukti kekuatan dan ketahananmu. 🤍",
  "Ketenangan batin dimulai saat kamu memutuskan untuk tidak membiarkan orang lain mengontrol emosimu. 🌿",
  "Kamu telah bertahan menghadapi banyak badai. Kamu lebih kuat dari yang kamu sadari. ⭐",
  "Satu langkah kecil ke depan tetaplah sebuah kemajuan yang patut dirayakan. 🎯",
  "Izinkan dirimu untuk tumbuh secara perlahan. Bunga pun mekar pada waktunya. 🌸",
  "Hari ini, pilihlah untuk bersikap lembut pada diri sendiri. 🕊️",
  "Setiap tantangan adalah kesempatan bagiku untuk belajar dan bertumbuh lebih dewasa. 🌱",
  "Pikiran buruk hanyalah awan yang lewat. Langit diriku akan selalu kembali cerah dan tenang. ☀️",
  "Aku berhak bahagia, damai, dan dicintai apa adanya tanpa syarat. 💖",
  "Kegagalan hari ini bukanlah akhir, melainkan petunjuk arah untuk jalan yang lebih baik. 🧭",
  "Aku menerima perasaanku saat ini, baik yang senang maupun sedih, sebagai bagian dari diriku yang utuh. 🫂",
  "Kemampuanku untuk pulih dan bangkit kembali jauh lebih besar dari masalah apa pun. ⚡",
  "Aku melepaskan apa yang tidak bisa kukontrol dan memfokuskan energi pada apa yang bisa kuusahakan. 🍃",
  "Dunia ini lebih indah dengan kehadiran dirimu di dalamnya. Jangan lupakan itu. 🌟",
  "Tidak perlu terburu-buru membandingkan dirimu dengan orang lain. Perjalanan setiap jiwa itu unik. 🕊️",
  "Setiap hari aku belajar untuk lebih menyayangi dan menerima diriku sendiri apa adanya. 🌸",
  "Suara hatiku yang penuh kasih adalah pemandu terbaikku di saat-saat sulit. 🗣️",
  "Aku pantas mendapatkan ruang untuk bernapas, merasa bebas, dan berekspresi secara jujur. 🎨",
  "Masa laluku tidak mendefinisikan siapa diriku sekarang dan siapa aku di masa depan. 🌅",
  "Hari ini adalah kesempatan untuk mengukir cerita yang indah, bahkan lewat hal-hal kecil sekalipun. ✏️",
  "Aku memaafkan diriku atas kesalahan masa lalu dan mengizinkan diriku untuk melangkah maju. 🕯️",
  "Kekuatan sejati bukanlah tidak pernah jatuh, melainkan kemauan untuk terus bangkit setiap kali terjatuh. 💪",
  "Tubuh dan pikiranku adalah rumahku. Hari ini aku akan memperlakukannya dengan penuh kelembutan. 🏡",
  "Aku dikelilingi oleh kemungkinan-kemungkinan baik yang sedang menanti untuk dijemput. ✨",
  "Setiap langkah kecil yang kuambil hari ini mendekatkanku pada versi diriku yang lebih damai. 👣",
  "Aku berani memilih jalan hidup yang membahagiakan jiwaku, tanpa harus selalu menyenangkan semua orang. 🌻",
  "Ketidaksempurnaan adalah keindahan alami yang membuat diriku unik dan berharga. 🍁",
  "Aku percaya pada proses hidupku. Segala sesuatu akan indah dan tepat pada waktunya. ⏳",
  "Hari ini, aku memilih untuk memusatkan pikiranku pada kedamaian dan rasa syukur atas apa yang kupunya. 🪴"
];

const PREFIXES = [
  "Hari ini, aku memilih untuk",
  "Aku mengizinkan diriku untuk",
  "Dengan penuh keyakinan, aku percaya aku bisa",
  "Di setiap embusan napas, aku melepaskan beban dan",
  "Aku berhak untuk",
  "Mulai saat ini, aku berjanji untuk lebih",
  "Aku layak mendapatkan ruang untuk",
  "Dengan segenap jiwaku, aku memutuskan untuk",
  "Saat badai pikiran datang, aku memilih untuk tetap",
  "Hari demi hari, aku belajar untuk",
  "Aku bangga pada diriku karena mampu",
  "Dalam keheningan hatiku, aku selalu bisa",
  "Aku percaya bahwa aku memiliki kekuatan untuk",
  "Aku bersyukur atas kesempatanku untuk",
  "Di dalam safe space ini, aku bebas untuk"
];

const CORES = [
  "bertumbuh dengan kecepatan dan jalanku sendiri",
  "menerima ketidaksempurnaan sebagai bagian dari keindahan",
  "melepaskan segala kekhawatiran tentang masa depan",
  "menghargai setiap usaha kecil yang telah kulakukan",
  "menjadi pelindung dan rumah yang aman bagi jiwaku",
  "memaafkan kesalahan masa lalu dan berdamai dengan diri",
  "merasakan kehangatan cinta tanpa syarat dari dalam hati",
  "berdiri tegak menghadapi segala rintangan hidup",
  "menyayangi dan merawat diriku dengan penuh kelembutan",
  "membiarkan luka-luka lama sembuh secara perlahan",
  "memilih kedamaian batin di atas kebisingan dunia luar",
  "menemukan kebahagiaan dalam kesederhanaan hari ini",
  "melangkah maju dengan penuh keberanian dan harapan",
  "menjadi versi diriku yang paling jujur dan otentik",
  "menyadari bahwa kehadiranku di dunia ini sangat berharga"
];

const SUFFIXES = [
  "karena aku sangat berharga. 🍃",
  "dan itu sudah sangat cukup bagi jiwaku. ✨",
  "hari demi hari dengan penuh rasa syukur. 🌸",
  "tanpa syarat dan tanpa keraguan. 🤍",
  "di bawah langit yang teduh ini. 🌿",
  "demi ketenangan jiwaku yang damai. ⭐",
  "pada waktu yang tepat dan indah. 🕊️",
  "dan terus berjalan ke depan dengan senyuman. 🪴",
  "di dunia yang luas dan penuh warna ini. 🌻",
  "sebagai bukti kekuatan batinku. 🌈"
];

// Helper to pre-populate 1000 distinct combinations
const generateAffirmationsList = (): string[] => {
  const list = [...HANDCRAFTED_AFFIRMATIONS];
  const seen = new Set(list);
  
  let attempts = 0;
  while (list.length < 1000 && attempts < 10000) {
    attempts++;
    const prefix = PREFIXES[Math.floor(Math.random() * PREFIXES.length)];
    const core = CORES[Math.floor(Math.random() * CORES.length)];
    const suffix = SUFFIXES[Math.floor(Math.random() * SUFFIXES.length)];
    const sentence = `${prefix} ${core} ${suffix}`;
    
    if (!seen.has(sentence)) {
      seen.add(sentence);
      list.push(sentence);
    }
  }
  return list;
};

const AFFIRMATIONS = generateAffirmationsList();

/* ── Animated count-up hook ────────────────────────────────────── */
function useCountUp(target: number, duration = 800) {
  const [count, setCount] = useState(0);
  const frame = useRef<number>(0);
  useEffect(() => {
    if (target === 0) { setCount(0); return; }
    const start = performance.now();
    const step = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * target));
      if (progress < 1) frame.current = requestAnimationFrame(step);
    };
    frame.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame.current);
  }, [target, duration]);
  return count;
}

function StreakFlame({ count }: { count: number }) {
  if (count === 0) return null;
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-amber-100 to-orange-100 px-3 py-1.5 text-xs font-bold text-amber-700 shadow-sm"
      style={{ animation: "streak-pulse 2.4s ease-in-out infinite" }}
    >
      🔥 {count} hari beruntun
    </span>
  );
}

/* ── Floating leaf SVG ─────────────────────────────────────────── */
function FloatingLeaf({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      className={className}
      style={style}
      aria-hidden="true"
    >
      <path
        d="M24 4C14 4 6 14 8 26c2 12 14 18 22 16C22 34 18 22 24 4z"
        fill="oklch(0.71 0.045 160 / 0.25)"
        stroke="oklch(0.71 0.045 160 / 0.5)"
        strokeWidth="1"
      />
      <path
        d="M24 4C34 4 42 14 40 26"
        fill="none"
        stroke="oklch(0.71 0.045 160 / 0.4)"
        strokeWidth="1"
        strokeLinecap="round"
      />
      <path
        d="M24 4 C18 14 16 24 20 36"
        fill="none"
        stroke="oklch(0.71 0.045 160 / 0.3)"
        strokeWidth="0.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

/* ── Stat card with count-up ───────────────────────────────────── */
function StatCard({
  label,
  value,
  unit,
  suffix,
  gradient,
  children,
}: {
  label: string;
  value: number;
  unit?: string;
  suffix?: React.ReactNode;
  gradient?: string;
  children?: React.ReactNode;
}) {
  const animated = useCountUp(value);
  return (
    <div
      className={`rounded-3xl p-4 ring-1 ring-border card-hover ${gradient ?? "bg-card"}`}
    >
      <p className="text-[11px] font-medium text-muted-foreground">{label}</p>
      <p className="mt-1.5 font-display text-2xl font-bold text-foreground">
        {animated}
        {unit && <span className="ml-1 text-xs font-normal text-muted-foreground">{unit}</span>}
      </p>
      {suffix}
      {children}
    </div>
  );
}

// Seed index generator based on the date to make it consistent throughout the day
const getDailyAffirmationIndex = (arrayLength: number): number => {
  if (typeof window === "undefined" || arrayLength === 0) return 0;
  const today = new Date();
  const dateString = `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`;
  
  let hash = 0;
  for (let i = 0; i < dateString.length; i++) {
    hash = dateString.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  return Math.abs(hash) % arrayLength;
};

function Dashboard() {
  const { user } = useAuth();
  const { data: profile, isLoading: pLoading } = useProfile(user?.id);
  const [affIdx, setAffIdx] = useState(() => getDailyAffirmationIndex(AFFIRMATIONS.length));
  const [flip, setFlip] = useState(false);
  const [isCanonPlaying, setIsCanonPlaying] = useState<boolean>(false);
  const programState = useProgramState();

  useEffect(() => {
    const unsubscribe = subscribeAudioState((channels) => {
      setIsCanonPlaying(channels.canon > 0);
    });
    return unsubscribe;
  }, []);

  const copyAffirmation = () => {
    navigator.clipboard.writeText(AFFIRMATIONS[affIdx]);
    toast.success("Afirmasi disalin ke papan klip! 📋");
  };

  const nextAffirmation = () => {
    setFlip(true);
    setTimeout(() => {
      setAffIdx((prev) => (prev + 1) % AFFIRMATIONS.length);
      setFlip(false);
    }, 250);
  };

  // Find next uncompleted mission for quick action button
  const nextUncompletedMission = programState.dailyMissions.find((m) => !m.completed) || programState.dailyMissions[0];

  const since = new Date(Date.now() - 6 * 86400000).toISOString().slice(0, 10);
  const { data: moods, isLoading: moodsLoading } = useQuery({
    queryKey: ["moods-week", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.from("mood_checkins").select("date, mood, mood_score").eq("user_id", user!.id).gte("date", since).order("date");
      return data ?? [];
    },
  });
  const { data: lastJournal, isLoading: journalLoading } = useQuery({
    queryKey: ["last-journal", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.from("journals").select("*").eq("user_id", user!.id).order("created_at", { ascending: false }).limit(1).maybeSingle();
      return data;
    },
  });
  const { data: habitStreak } = useQuery({
    queryKey: ["habit-streak", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.from("habit_logs").select("date").eq("user_id", user!.id).eq("completed", true).order("date", { ascending: false }).limit(30);
      if (!data || data.length === 0) return 0;
      const dates = new Set(data.map((d) => d.date));
      let s = 0; const d = new Date();
      while (dates.has(d.toISOString().slice(0, 10))) { s++; d.setDate(d.getDate() - 1); }
      return s;
    },
  });
  const { data: habitsToday } = useQuery({
    queryKey: ["habits-today-count", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const today = new Date().toISOString().slice(0, 10);
      const [{ data: habits }, { data: logs }] = await Promise.all([
        supabase.from("habits").select("id").eq("user_id", user!.id).eq("is_active", true),
        supabase.from("habit_logs").select("id").eq("user_id", user!.id).eq("date", today).eq("completed", true),
      ]);
      return { total: habits?.length ?? 0, done: logs?.length ?? 0 };
    },
  });

  const hour = new Date().getHours();
  const greetEmoji = hour < 5 ? "🌙" : hour < 11 ? "🌅" : hour < 15 ? "☀️" : hour < 18 ? "🌤️" : "🌿";
  const greet = hour < 11 ? "Selamat pagi" : hour < 15 ? "Selamat siang" : hour < 18 ? "Selamat sore" : "Selamat malam";
  const isPremium = profile?.plan === "premium";

  const moodChartData = (moods ?? []).map((m) => ({ value: m.mood_score, date: m.date }));

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* ── HERO GREETING ─────────────────────────────────────────── */}
      <div
        className="relative overflow-hidden rounded-3xl isolate z-0 min-h-[150px] sm:min-h-[200px]"
        style={{ 
          transform: "translateZ(0)",
          WebkitMaskImage: "-webkit-radial-gradient(white, black)",
          maskImage: "radial-gradient(white, black)"
        }}
      >
        {/* Animated ambient background */}
        <div
          className="absolute inset-0"
          style={{
            background: "linear-gradient(135deg, oklch(0.977 0.008 85) 0%, oklch(0.95 0.025 155) 35%, oklch(0.97 0.015 165) 65%, oklch(0.96 0.02 85) 100%)",
            backgroundSize: "300% 300%",
            animation: "gradient-shift 12s ease-in-out infinite",
          }}
        />

        {/* Blob 1 */}
        <div
          className="absolute -right-10 -top-10 h-52 w-52 rounded-full pointer-events-none"
          style={{
            background: "oklch(0.71 0.045 160 / 0.18)",
            filter: "blur(50px)",
            animation: "blob-drift 18s ease-in-out infinite",
          }}
        />
        {/* Blob 2 */}
        <div
          className="absolute -bottom-8 left-1/3 h-40 w-40 rounded-full pointer-events-none"
          style={{
            background: "oklch(0.77 0.085 40 / 0.14)",
            filter: "blur(40px)",
            animation: "blob-drift-alt 22s ease-in-out infinite",
          }}
        />
        {/* Blob 3 */}
        <div
          className="absolute top-4 left-8 h-28 w-28 rounded-full pointer-events-none"
          style={{
            background: "oklch(0.85 0.04 165 / 0.12)",
            filter: "blur(35px)",
            animation: "blob-drift-slow 26s ease-in-out infinite",
          }}
        />

        {/* Floating leaf decorations */}
        <FloatingLeaf
          className="absolute right-6 top-4 w-16 h-16 pointer-events-none"
          style={{ animation: "leaf-sway 6s ease-in-out infinite" } as React.CSSProperties}
        />
        <FloatingLeaf
          className="absolute right-16 bottom-4 w-10 h-10 pointer-events-none opacity-60"
          style={{ animation: "leaf-sway 8s ease-in-out infinite", animationDelay: "2s" } as React.CSSProperties}
        />

        {/* Glass content card */}
        <div className="relative glass-hero rounded-3xl m-0.5 p-5 sm:p-8">
          <div className="flex justify-between items-start gap-3">
            <div>
              <p className="text-xs sm:text-sm font-medium text-muted-foreground tracking-wide">
                {greetEmoji} {greet}
              </p>
              {pLoading ? (
                <div className="mt-2 skeleton h-9 w-3/4 rounded-xl" />
              ) : (
                <h1 className="mt-1.5 font-display text-xl sm:text-3xl font-semibold leading-tight text-foreground">
                  Halo, <span className="text-primary">{profile?.name ?? "teman"}</span>.{" "}
                  <span className="text-foreground/80">Siap melanjutkan perjalanan hari ini?</span>
                </h1>
              )}
            </div>
            <button
              onClick={(e) => {
                e.preventDefault();
                try {
                  toggleAmbientSound("canon");
                } catch (err) {
                  console.error("Gagal mengaktifkan musik latar:", err);
                }
              }}
              className="flex items-center gap-1.5 rounded-full bg-card/65 hover:bg-card/90 border border-border/40 px-3.5 py-1.5 text-[10px] sm:px-4 sm:py-2 sm:text-xs font-semibold text-foreground backdrop-blur-md transition-all duration-200 shadow-sm active:scale-95 cursor-pointer shrink-0"
              title="Putar musik penenang Canon in D"
            >
              <span className={`text-base ${isCanonPlaying ? "animate-pulse" : ""}`}>🎻</span>
              <span className="hidden sm:inline">Canon in D: {isCanonPlaying ? "Diputar" : "Dijeda"}</span>
              <span className="text-[10px] text-muted-foreground">
                {isCanonPlaying ? "⏸️" : "▶️"}
              </span>
            </button>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            {new Date().toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long" })}
          </p>
          {(habitStreak ?? 0) > 0 && (
            <div className="mt-3">
              <StreakFlame count={habitStreak!} />
            </div>
          )}
        </div>
      </div>

      {/* ── CENTRAL HIGHWAY: PROGRAM PEMULIHAN & MISI HARI INI ─────── */}
      {!programState.hasCompletedCalmCheck && !programState.selectedProgram ? (
        /* State 1: New User / Unassessed -> Calm Check CTA */
        <section className="relative overflow-hidden rounded-3xl border-2 border-primary/40 bg-gradient-to-br from-primary-soft/80 via-cream to-amber-50/70 p-6 shadow-float transition-all">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/15 px-3.5 py-1 text-xs font-bold text-primary">
              <span>🌟 LANGKAH PERTAMA PEMULIHAN</span>
            </div>
            <h2 className="font-display text-2xl font-bold text-foreground sm:text-3xl">
              Mulai dari Calm Check
            </h2>
            <p className="text-xs sm:text-sm text-foreground/80 leading-relaxed max-w-xl">
              Sebelum memulai program pemulihan, mari petakan tingkat kecemasan, depresi, dan stresmu (DASS-21) dalam 2–3 menit agar sistem dapat merekomendasikan alur harian yang tepat.
            </p>
            <div className="pt-2">
              <Link
                to="/app/calm-check"
                className="inline-flex items-center gap-2.5 rounded-2xl bg-primary px-6 py-3.5 text-xs sm:text-sm font-bold text-white shadow-soft transition-all duration-300 hover:bg-primary/90 hover:scale-[1.02] active:scale-95"
              >
                <span>Mulai Calm Check (2-3 Menit)</span>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-4 w-4">
                  <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
            </div>
          </div>
        </section>
      ) : !programState.selectedProgram ? (
        /* State 2: Calm Check completed, but Program not selected yet */
        <section className="relative overflow-hidden rounded-3xl border-2 border-amber-400/50 bg-gradient-to-br from-amber-500/10 via-cream to-accent-soft/40 p-6 shadow-card">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full bg-amber-500/15 px-3.5 py-1 text-xs font-bold text-amber-800 dark:text-amber-300">
              <span>📋 ASESMEN SELESAI</span>
            </div>
            <h2 className="font-display text-xl font-bold text-foreground sm:text-2xl">
              Pilih Program Pemulihanmu
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-xl">
              Kamu telah menyelesaikan Calm Check! Langkah berikutnya adalah memilih durasi Program Pemulihan (30, 90, atau 365 Hari) untuk mengaktifkan Misi Harianmu.
            </p>
            <div className="pt-2">
              <Link
                to="/app/program"
                className="inline-flex items-center gap-2 rounded-2xl bg-amber-600 px-6 py-3.5 text-xs sm:text-sm font-bold text-white shadow-soft hover:bg-amber-700 transition-all active:scale-95"
              >
                <span>Pilih Program Pemulihan →</span>
              </Link>
            </div>
          </div>
        </section>
      ) : (
        /* State 3: Active Program -> MAIN HERO: MISI HARI INI */
        <section className="relative overflow-hidden rounded-3xl border border-primary/30 bg-card p-5 sm:p-7 ring-1 ring-border/80 shadow-card">
          {/* Decorative background glow */}
          <div className="absolute -right-12 -top-12 h-44 w-44 rounded-full bg-primary-soft/40 blur-2xl pointer-events-none" />

          {/* Program Header & Progress Bar */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/15 px-3 py-1 text-xs font-bold text-primary">
                🔥 {programState.selectedProgram === "30hari" ? "RESET 30 HARI" : programState.selectedProgram === "90hari" ? "PEMULIHAN UTUH (90 HARI)" : "TRANSFORMASI 365 HARI"}
              </span>
              <span className="text-xs font-bold text-muted-foreground">
                Hari ke-{programState.currentDay} dari {programState.totalDays}
              </span>
            </div>

            <div className="flex items-center justify-between gap-3 pt-1">
              <div>
                <h2 className="font-display text-xl font-bold text-foreground sm:text-2xl">
                  Misi Hari Ini
                </h2>
                <p className="text-xs text-muted-foreground">
                  Selesaikan 5 langkah terpadu di bawah untuk menjaga kestabilan emosimu.
                </p>
              </div>
              <div className="text-right shrink-0">
                <span className="font-display text-lg font-bold text-primary sm:text-2xl">
                  {programState.completedCount}/5
                </span>
                <p className="text-[10px] text-muted-foreground">Selesai</p>
              </div>
            </div>

            {/* Visual Progress Bar */}
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-gradient-to-r from-primary to-accent transition-all duration-500"
                style={{ width: `${(programState.completedCount / 5) * 100}%` }}
              />
            </div>
          </div>

          {/* Dominant Primary Action Button */}
          <div className="mt-5">
            {programState.isAllCompleted ? (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4 text-center dark:border-emerald-900/40 dark:bg-emerald-950/30">
                <p className="text-xs font-bold text-emerald-800 dark:text-emerald-200">
                  🎉 Luar biasa! Seluruh misi hari ini telah kamu selesaikan. Istirahatlah dengan tenang! 🌸
                </p>
              </div>
            ) : (
              <Link
                to={nextUncompletedMission.toolPath as any}
                search={nextUncompletedMission.searchParams ? (nextUncompletedMission.searchParams as any) : undefined}
                className="group flex w-full items-center justify-between rounded-2xl bg-primary px-5 py-4 text-white shadow-soft transition-all duration-300 hover:bg-primary/90 hover:scale-[1.01] active:scale-98"
              >
                <div className="flex items-center gap-3">
                  <span className="grid h-8 w-8 place-items-center rounded-xl bg-white/20 text-sm font-bold">
                    🚀
                  </span>
                  <div className="text-left">
                    <p className="text-[10px] font-semibold text-white/80 uppercase tracking-wider">Misi Berikutnya</p>
                    <p className="text-xs sm:text-sm font-bold text-white">{nextUncompletedMission.title}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-xs font-bold bg-white/20 px-3.5 py-1.5 rounded-full transition-transform group-hover:translate-x-1">
                  <span>{nextUncompletedMission.toolLabel}</span>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-3.5 w-3.5">
                    <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </Link>
            )}
          </div>

          {/* Interactive Checklist of 5 Daily Missions */}
          <div className="mt-5 space-y-2.5 border-t border-border/60 pt-4">
            <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Daftar Misi Pemulihan Harian
            </p>

            {programState.dailyMissions.map((mission, idx) => (
              <div
                key={mission.id}
                className={`flex items-center justify-between gap-3 rounded-2xl border p-3.5 transition-all ${
                  mission.completed
                    ? "border-emerald-200/80 bg-emerald-50/40 dark:border-emerald-900/30 dark:bg-emerald-950/20"
                    : "border-border/70 bg-surface hover:border-primary/40"
                }`}
              >
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  <button
                    onClick={() => programState.toggleMission(mission.id)}
                    className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-md border transition-all ${
                      mission.completed
                        ? "border-emerald-600 bg-emerald-600 text-white"
                        : "border-muted-foreground/40 hover:border-primary"
                    }`}
                  >
                    {mission.completed && (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="h-3.5 w-3.5">
                        <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </button>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[9px] font-bold text-primary">
                        {mission.badge}
                      </span>
                      <span className={`text-xs font-bold ${mission.completed ? "line-through text-muted-foreground" : "text-foreground"}`}>
                        {mission.title}
                      </span>
                    </div>
                    <p className="mt-0.5 text-[11px] leading-relaxed text-muted-foreground truncate sm:whitespace-normal">
                      {mission.desc}
                    </p>
                  </div>
                </div>

                <Link
                  to={mission.toolPath as any}
                  search={mission.searchParams ? (mission.searchParams as any) : undefined}
                  className="shrink-0 rounded-xl bg-cream-deep px-3 py-1.5 text-[10px] font-bold text-primary hover:bg-primary/10 transition-colors"
                >
                  {mission.toolLabel} →
                </Link>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── ALAT PENDUKUNG (SUPPORTING TOOLKIT) ────────────────────── */}
      <section className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-display text-lg font-bold text-foreground">
              Alat Pendukung Program (Toolkit)
            </h3>
            <p className="text-xs text-muted-foreground">
              Fitur mandiri untuk membantu perjalanan pemulihanmu kapan saja.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3.5">
          <Link
            to="/app/chat"
            className="group flex flex-col justify-between rounded-2xl border border-border/70 bg-card p-4 shadow-xs transition-all hover:scale-[1.02] hover:border-primary/50"
          >
            <div className="space-y-2">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300 text-base">
                💬
              </span>
              <div>
                <h4 className="text-xs font-bold text-foreground group-hover:text-primary transition-colors">Safe Space Chat</h4>
                <p className="text-[10px] text-muted-foreground">Curhat tanpa dinilai</p>
              </div>
            </div>
            <span className="mt-3 text-[10px] font-bold text-primary">Buka Chat →</span>
          </Link>

          <Link
            to="/app/calm"
            className="group flex flex-col justify-between rounded-2xl border border-border/70 bg-card p-4 shadow-xs transition-all hover:scale-[1.02] hover:border-primary/50"
          >
            <div className="space-y-2">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 text-base">
                🫁
              </span>
              <div>
                <h4 className="text-xs font-bold text-foreground group-hover:text-primary transition-colors">Emergency Calm</h4>
                <p className="text-[10px] text-muted-foreground">Latihan pernapasan & panik</p>
              </div>
            </div>
            <span className="mt-3 text-[10px] font-bold text-primary">Mulai Tenang →</span>
          </Link>

          <Link
            to="/app/mood"
            className="group flex flex-col justify-between rounded-2xl border border-border/70 bg-card p-4 shadow-xs transition-all hover:scale-[1.02] hover:border-primary/50"
          >
            <div className="space-y-2">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300 text-base">
                🌤️
              </span>
              <div>
                <h4 className="text-xs font-bold text-foreground group-hover:text-primary transition-colors">Mood & Emosi</h4>
                <p className="text-[10px] text-muted-foreground">Pelacakan tren emosi</p>
              </div>
            </div>
            <span className="mt-3 text-[10px] font-bold text-primary">Catat Mood →</span>
          </Link>

          <Link
            to="/app/journal"
            className="group flex flex-col justify-between rounded-2xl border border-border/70 bg-card p-4 shadow-xs transition-all hover:scale-[1.02] hover:border-primary/50"
          >
            <div className="space-y-2">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-violet-100 text-violet-800 dark:bg-violet-950 dark:text-violet-300 text-base">
                📓
              </span>
              <div>
                <h4 className="text-xs font-bold text-foreground group-hover:text-primary transition-colors">Jurnal CBT</h4>
                <p className="text-[10px] text-muted-foreground">Refleksi & kognitif</p>
              </div>
            </div>
            <span className="mt-3 text-[10px] font-bold text-primary">Tulis Jurnal →</span>
          </Link>

          <Link
            to="/app/eating"
            className="group flex flex-col justify-between rounded-2xl border border-border/70 bg-card p-4 shadow-xs transition-all hover:scale-[1.02] hover:border-primary/50"
          >
            <div className="space-y-2">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 text-base">
                🍎
              </span>
              <div>
                <h4 className="text-xs font-bold text-foreground group-hover:text-primary transition-colors">Emotional Eating</h4>
                <p className="text-[10px] text-muted-foreground">Lapar emosi vs fisik</p>
              </div>
            </div>
            <span className="mt-3 text-[10px] font-bold text-primary">Cek Lapar →</span>
          </Link>

          <Link
            to="/app/growth"
            className="group flex flex-col justify-between rounded-2xl border border-border/70 bg-card p-4 shadow-xs transition-all hover:scale-[1.02] hover:border-primary/50"
          >
            <div className="space-y-2">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 text-base">
                📊
              </span>
              <div>
                <h4 className="text-xs font-bold text-foreground group-hover:text-primary transition-colors">Laporan Growth</h4>
                <p className="text-[10px] text-muted-foreground">Grafik & riwayat klinis</p>
              </div>
            </div>
            <span className="mt-3 text-[10px] font-bold text-primary">Lihat Grafik →</span>
          </Link>
        </div>
      </section>

      {/* ── DAILY AFFIRMATION WIDGET ────────────────────────────── */}
      <div className="relative overflow-hidden rounded-3xl p-4.5 sm:p-6 ring-1 ring-border/60 shadow-card bg-gradient-to-br from-card to-cream-deep/20">
        {/* Soft decorative gold/amber blobs */}
        <div className="absolute -right-6 -bottom-6 h-24 w-24 rounded-full bg-amber-200/10 filter blur-xl pointer-events-none" />
        <div className="absolute left-1/4 -top-8 h-20 w-20 rounded-full bg-primary/10 filter blur-lg pointer-events-none" />
        
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-3.5">
          <div className="flex-1 space-y-1">
            <p className="text-[9px] font-bold uppercase tracking-wider text-amber-700">Afirmasi Hari Ini</p>
            <div 
              className="transition-all duration-300"
              style={{
                opacity: flip ? 0 : 1,
                transform: flip ? "translateY(5px) scale(0.98)" : "translateY(0) scale(1)",
                filter: flip ? "blur(3px)" : "none"
              }}
            >
              <p className="font-display text-sm sm:text-lg font-medium leading-relaxed text-foreground/90 italic">
                "{AFFIRMATIONS[affIdx]}"
              </p>
            </div>
          </div>
          
          <div className="flex gap-2 shrink-0 self-end md:self-center">
            <button
              onClick={copyAffirmation}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-background border border-border/60 text-muted-foreground hover:text-foreground transition-all duration-200 active:scale-90"
              aria-label="Salin afirmasi"
              title="Salin afirmasi"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
              </svg>
            </button>
            <button
              onClick={nextAffirmation}
              className="flex h-8 px-3.5 items-center justify-center gap-1.5 rounded-full bg-accent text-accent-foreground shadow-peach text-xs font-semibold hover:-translate-y-0.5 active:scale-95 transition-all duration-250"
            >
              <span>Ganti</span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`h-3 w-3 ${flip ? "animate-spin" : ""}`}>
                <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* ── STATS STRIP ───────────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3.5">
        {/* Mood stat */}
        <div className="rounded-2xl sm:rounded-3xl bg-card p-3 sm:p-4.5 ring-1 ring-border/60 shadow-card card-hover flex flex-col justify-between min-h-[105px] sm:min-h-0">
          <div>
            <p className="text-[10px] sm:text-xs font-semibold text-muted-foreground leading-tight">Mood minggu ini</p>
            {moodsLoading ? (
              <div className="mt-2 skeleton h-5 sm:h-7 w-12 rounded-lg" />
            ) : (
              <p className="mt-1 font-display text-lg sm:text-2xl font-bold text-foreground leading-none">
                {moods?.length ?? 0}
                <span className="ml-0.5 text-[9px] sm:text-[11px] font-normal text-muted-foreground"> check-in</span>
              </p>
            )}
          </div>
          <div className="mt-2">
            <MoodBars data={moodChartData} height={24} />
          </div>
        </div>

        {/* Habit streak */}
        <div className="rounded-2xl sm:rounded-3xl bg-card p-3 sm:p-4.5 ring-1 ring-border/60 shadow-card card-hover flex flex-col justify-between min-h-[105px] sm:min-h-0">
          <div>
            <p className="text-[10px] sm:text-xs font-semibold text-muted-foreground leading-tight">Habit streak</p>
            <p className="mt-1 font-display text-lg sm:text-2xl font-bold text-foreground leading-none">
              {habitStreak ?? 0}
              <span className="ml-0.5 text-[9px] sm:text-[11px] font-normal text-muted-foreground"> hari</span>
            </p>
            {habitsToday && habitsToday.total > 0 && (
              <p className="mt-1 text-[9px] sm:text-[11px] text-muted-foreground leading-tight">
                {habitsToday.done}/{habitsToday.total} selesai
              </p>
            )}
          </div>
          <Link to="/app/habits" className="mt-1.5 inline-block text-[9px] sm:text-[11px] font-bold text-primary hover:text-primary/80 transition-colors">
            Lihat habit →
          </Link>
        </div>

        {/* Plan */}
        <div className={`rounded-2xl sm:rounded-3xl p-3 sm:p-4.5 ring-1 card-hover flex flex-col justify-between min-h-[105px] sm:min-h-0 ${isPremium ? "bg-gradient-to-br from-amber-50 to-orange-50 ring-amber-200/60" : "bg-card ring-border/60 shadow-card"}`}>
          <div>
            <p className="text-[10px] sm:text-xs font-semibold text-muted-foreground leading-tight">Paket</p>
            <p className={`mt-1 font-display text-sm sm:text-lg font-bold leading-none ${isPremium ? "text-amber-700" : "text-foreground"}`}>
              {isPremium ? "✨ Premium" : "Free"}
            </p>
          </div>
          <div>
            {!isPremium && (
              <Link to="/app/premium" className="mt-1.5 inline-block text-[9px] sm:text-[11px] font-bold text-accent hover:text-accent/80 transition-colors">
                Upgrade →
              </Link>
            )}
            {isPremium && profile?.premium_end_date && (
              <p className="mt-1 text-[9px] sm:text-[11px] text-amber-600/80 font-medium leading-tight">
                Hingga {new Date(profile.premium_end_date).toLocaleDateString("id-ID", { day: "numeric", month: "short" })}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ── LAST JOURNAL ──────────────────────────────────────────── */}
      {journalLoading ? (
        <SkeletonCard lines={2} />
      ) : lastJournal ? (
        <section className="rounded-3xl bg-card p-4.5 sm:p-5 ring-1 ring-border/60 shadow-card card-hover animate-slide-up">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-base">📓</span>
                <p className="text-xs text-muted-foreground">
                  Journal terakhir · {new Date(lastJournal.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "short" })}
                </p>
              </div>
              {lastJournal.summary && (
                <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-foreground">
                  {lastJournal.summary}
                </p>
              )}
              <div className="mt-2.5 flex flex-wrap gap-1.5">
                {lastJournal.main_emotion && (
                  <span className="rounded-full bg-primary-soft px-2.5 py-0.5 text-[11px] font-bold text-primary select-none">
                    {lastJournal.main_emotion}
                  </span>
                )}
                {lastJournal.main_trigger && lastJournal.main_trigger.split(",").map((stick: string, sIdx: number) => {
                  const cleaned = stick.trim();
                  if (!cleaned) return null;
                  return (
                    <span key={sIdx} className="rounded-full bg-accent-soft px-2.5 py-0.5 text-[10px] font-medium text-accent-foreground select-none">
                      {cleaned}
                    </span>
                  );
                })}
              </div>
            </div>
            <Link
              to="/app/journal"
              className="shrink-0 rounded-full bg-cream-deep px-3 py-1.5 text-xs font-medium text-foreground hover:bg-primary-soft transition-all duration-200 hover:scale-105"
            >
              Lihat semua →
            </Link>
          </div>
        </section>
      ) : (
        <section className="relative overflow-hidden rounded-3xl p-8 text-center" style={{ background: "var(--gradient-journal)", backgroundSize: "300% 300%", animation: "gradient-shift 14s ease-in-out infinite" }}>
          {/* Blob decoration */}
          <div className="absolute right-4 top-4 h-20 w-20 rounded-full pointer-events-none" style={{ background: "oklch(0.77 0.085 40 / 0.12)", filter: "blur(20px)" }} />
          <div className="relative">
            <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-2xl bg-white/60 backdrop-blur-sm shadow-card" style={{ animation: "float 9s ease-in-out infinite" }}>
              <span className="text-3xl">📓</span>
            </div>
            <p className="font-display text-lg font-semibold text-foreground">Belum ada journal</p>
            <p className="mt-1.5 text-sm text-muted-foreground">Mulai tulis refleksi harimu. Sekecil apapun itu berarti.</p>
            <Link
              to="/app/journal"
              className="mt-4 inline-block rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground shadow-peach transition-all duration-250 hover:-translate-y-0.5 hover:shadow-glow-peach active:scale-95"
            >
              Mulai Journal →
            </Link>
          </div>
        </section>
      )}

      {/* ── MOBILE-ONLY LAPTOP/DESKTOP PROMPT ────────────────────── */}
      <div className="sm:hidden rounded-3xl bg-amber-50/80 border border-amber-200/60 p-4 shadow-card animate-slide-up flex gap-3 text-amber-950">
        <span className="text-2xl select-none shrink-0">💻</span>
        <div className="text-xs leading-relaxed min-w-0">
          <p className="font-bold text-amber-900 font-display text-sm">Tips Pengalaman Lebih Nyaman 🌿</p>
          <p className="mt-1 text-stone-700">
            Layar HP terasa kurang lega atau sempit? Lebih disarankan buka <a href="https://jncalm.my.id" target="_blank" rel="noopener noreferrer" className="underline font-bold text-amber-900">jncalm.my.id</a> di <strong>Laptop/PC</strong> kamu. Tampilannya jauh lebih luas, lega, dan nyaman untuk curhat, berrefleksi, maupun mengisi asesmen! ✨
          </p>
        </div>
      </div>

    </div>
  );
}
