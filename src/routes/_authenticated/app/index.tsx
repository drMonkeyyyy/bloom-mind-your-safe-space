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

  // Daily Quest setup
  const QUESTS = [
    "Minum segelas air putih hangat secara perlahan dan rasakan kesegarannya. 💧",
    "Tersenyumlah pada dirimu sendiri di cermin selama 5 detik dan ucapkan hal positif. 🪞",
    "Lakukan peregangan leher dan bahu selama 1 menit untuk meredakan ketegangan. 🧘",
    "Tarik napas dalam-dalam sebanyak 3 kali sebelum memulai aktivitas berikutnya. 🌬️",
    "Kirim pesan singkat berisi ucapan terima kasih atau apresiasi kepada satu orang terdekat. ✉️",
    "Istirahatkan matamu dari layar HP/laptop selama 5 menit dan pandanglah tanaman atau luar jendela. 🌳",
    "Dengarkan satu lagu favoritmu dengan fokus penuh tanpa mendistraksi diri dengan hal lain. 🎵",
    "Rapikan satu sudut kecil di meja kerja atau kamarmu agar terasa lebih lega. 🧹",
    "Nikmati buah, camilan, atau minuman favorit secara perlahan tanpa memegang ponsel. 🍎"
  ];

  const [currentQuest, setCurrentQuest] = useState("Memuat tantangan hari ini...");
  const [questStorageKey, setQuestStorageKey] = useState<string | null>(null);
  const [questCompleted, setQuestCompleted] = useState(false);
  const [questCelebrated, setQuestCelebrated] = useState(false);

  // Initialize quest details and status from localStorage on client-mount to prevent SSR/hydration timezone drift
  useEffect(() => {
    if (typeof window !== "undefined" && user?.id) {
      const d = new Date();
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;
      
      const storageKey = `bloom_quest_completed_${user.id}_${dateStr}`;
      setQuestStorageKey(storageKey);
      
      const completed = localStorage.getItem(storageKey) === "true";
      setQuestCompleted(completed);
      
      const dayOfMonth = d.getDate();
      setCurrentQuest(QUESTS[dayOfMonth % QUESTS.length]);
    }
  }, [user?.id]);

  const handleCompleteQuest = () => {
    if (!questStorageKey) return;
    setQuestCompleted(true);
    localStorage.setItem(questStorageKey, "true");
    setQuestCelebrated(true);
    toast.success("Hebat! Kamu telah melakukan satu kebaikan kecil untuk dirimu hari ini. 🌸");
    setTimeout(() => setQuestCelebrated(false), 2000);
  };

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
          <p className="text-xs sm:text-sm font-medium text-muted-foreground tracking-wide">
            {greetEmoji} {greet}
          </p>
          {pLoading ? (
            <div className="mt-2 skeleton h-9 w-3/4 rounded-xl" />
          ) : (
            <h1 className="mt-1.5 font-display text-xl sm:text-3xl font-semibold leading-tight text-foreground">
              Halo, <span className="text-primary">{profile?.name ?? "teman"}</span>.{" "}
              <span className="text-foreground/80">Gimana perasaanmu hari ini?</span>
            </h1>
          )}
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

      {/* ── QUICK MOOD ────────────────────────────────────────────── */}
      <section className="rounded-3xl bg-card p-4 sm:p-5 ring-1 ring-border/60 shadow-card">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-semibold">Cek mood cepat</p>
          <Link to="/app/mood" className="text-xs font-medium text-primary hover:text-primary/80 transition-colors">
            Semua →
          </Link>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
          {MOOD_OPTIONS.slice(0, 6).map((m) => (
            <Link
              key={m.key}
              to="/app/mood"
              search={{ pre: m.key }}
              className="group flex shrink-0 flex-col items-center gap-1.5 rounded-2xl bg-cream-deep px-3.5 py-3 text-center transition-all duration-250 hover:bg-primary-soft hover:scale-105 hover:shadow-soft active:scale-95"
            >
              <span
                className="text-2xl leading-none transition-transform duration-250 group-hover:scale-125 group-hover:-translate-y-1"
                style={{ display: "inline-block" }}
              >
                {m.emoji}
              </span>
              <span className="text-[11px] font-medium text-muted-foreground">{m.label}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* ── QUICK ACTIONS ─────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-2.5 sm:gap-4">
        <Link
          to="/app/chat"
          className="group relative overflow-hidden rounded-3xl p-4 sm:p-6 text-primary-foreground transition-all duration-300 hover:-translate-y-1.5 hover:shadow-float active:scale-98"
          style={{ background: "var(--gradient-sage)" }}
        >
          {/* Bokeh blobs */}
          <div className="absolute -right-6 -top-6 h-20 w-20 rounded-full bg-white/12 transition-transform duration-500 group-hover:scale-125" />
          <div className="absolute right-4 bottom-4 h-12 w-12 rounded-full bg-white/6" />
          <div className="relative">
            <div className="grid h-9 w-9 sm:h-11 sm:w-11 place-items-center rounded-xl sm:rounded-2xl bg-white/20 backdrop-blur-sm transition-transform duration-250 group-hover:scale-110">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-4.5 w-4.5" aria-hidden="true">
                <path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 0 1-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h3 className="mt-2.5 font-display text-[13px] sm:text-lg font-semibold leading-tight">Curhat AI</h3>
            <p className="mt-0.5 text-[9.5px] sm:text-sm opacity-85 leading-tight">Mulai obrolan baru.</p>
          </div>
        </Link>

        <Link
          to="/app/calm"
          className="group relative overflow-hidden rounded-3xl p-4 sm:p-6 text-accent-foreground transition-all duration-300 hover:-translate-y-1.5 hover:shadow-float active:scale-98"
          style={{ background: "var(--gradient-warm)" }}
        >
          <div className="absolute -right-6 -top-6 h-20 w-20 rounded-full bg-white/12 transition-transform duration-500 group-hover:scale-125" />
          <div className="absolute right-4 bottom-4 h-12 w-12 rounded-full bg-white/6" />
          <div className="relative">
            <div className="grid h-9 w-9 sm:h-11 sm:w-11 place-items-center rounded-xl sm:rounded-2xl bg-white/20 backdrop-blur-sm transition-transform duration-250 group-hover:scale-110">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-4.5 w-4.5" aria-hidden="true">
                <circle cx="12" cy="12" r="10" /><path d="M12 8v4M12 16h.01" />
              </svg>
            </div>
            <h3 className="mt-2.5 font-display text-[13px] sm:text-lg font-semibold leading-tight">Butuh Tenang</h3>
            <p className="mt-0.5 text-[9.5px] sm:text-sm opacity-85 leading-tight">Mode tenangkan diri.</p>
          </div>
        </Link>
      </div>

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

      {/* ── DAILY SELF-CARE QUEST ───────────────────────────────── */}
      <div 
        className={`relative overflow-hidden rounded-3xl p-5 sm:p-6 ring-1 transition-all duration-500 ${
          questCompleted 
            ? "border-primary/20 bg-primary-soft/20 shadow-sm" 
            : "border-border/60 bg-card shadow-card card-hover"
        }`}
      >
        {/* Confetti leaves/blossoms on complete */}
        {questCelebrated && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
            {["🌸", "✨", "🌸", "💚", "🌱", "✨"].map((p, i) => (
              <span
                key={i}
                className="absolute text-lg"
                style={{
                  left: `${10 + i * 16}%`,
                  top: "50%",
                  animation: `confetti-burst 0.9s ease-out ${i * 60}ms both`,
                }}
              >
                {p}
              </span>
            ))}
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl text-2xl transition-all duration-300 ${
              questCompleted ? "bg-primary text-primary-foreground scale-105 shadow-sm" : "bg-primary-soft/60"
            }`}>
              {questCompleted ? "🌸" : "🎯"}
            </div>
            <div>
              <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-primary">Misi Kebaikan Kecil</p>
              <h3 className={`mt-0.5 font-display text-base sm:text-lg font-semibold transition-all duration-300 ${
                questCompleted ? "text-muted-foreground line-through" : "text-foreground"
              }`}>
                {questCompleted ? "Misi hari ini selesai!" : "Tantangan Hari Ini"}
              </h3>
              <p className={`mt-1 text-xs sm:text-sm leading-relaxed transition-all duration-300 ${
                questCompleted ? "text-muted-foreground/80 italic" : "text-foreground/80"
              }`}>
                {questCompleted 
                  ? "Terima kasih sudah meluangkan waktu sejenak untuk merawat dirimu sendiri. Sampai jumpa besok! ✨" 
                  : currentQuest
                }
              </p>
            </div>
          </div>

          {!questCompleted && (
            <button
              onClick={handleCompleteQuest}
              className="w-full sm:w-auto shrink-0 rounded-full bg-primary px-5 py-2.5 text-xs font-bold text-primary-foreground shadow-soft hover:-translate-y-0.5 active:scale-95 transition-all duration-250 btn-spring"
            >
              Selesaikan Misi 🌸
            </button>
          )}
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

    </div>
  );
}
