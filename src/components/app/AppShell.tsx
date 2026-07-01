import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useProfile, useIsAdmin } from "@/hooks/use-profile";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { BottomSheet } from "./BottomSheet";

/* ─── SVG Icon helpers ─────────────────────────────────────────── */
function Icon({ d, className = "h-5 w-5" }: { d: string; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d={d} />
    </svg>
  );
}

/* ─── Nav definitions ─────────────────────────────────────────── */
const primaryNav = [
  { to: "/app", label: "Beranda", icon: "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z", exact: true },
  { to: "/app/chat", label: "Chat AI", icon: "M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 0 1-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" },
  { to: "/app/mood", label: "Mood", icon: "M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" },
  { to: "/app/journal", label: "Journal", icon: "M4 19.5A2.5 2.5 0 0 1 6.5 17H20M4 19.5V5A2.5 2.5 0 0 1 6.5 2.5H20v19H6.5A2.5 2.5 0 0 1 4 19.5z" },
];

const wellnessNav = [
  { to: "/app/gratitude", label: "Syukur", icon: "M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" },
  { to: "/app/habits", label: "Habit Tracker", icon: "M9 11l3 3L22 4M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" },
  { to: "/app/eating", label: "Emotional Eating", icon: "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" },
  { to: "/app/calm", label: "Emergency Calm", icon: "M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10zm0-6v-4m0-4h.01" },
  { to: "/app/growth", label: "Growth Dashboard", icon: "M18 20V10M12 20V4M6 20v-6" },
];

const accountNav = [
  { to: "/app/premium", label: "Premium", icon: "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" },
  { to: "/app/profile", label: "Profil & Pengaturan", icon: "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" },
];

/* Bottom nav — 5 slots with FAB */
const bottomNav = [
  { to: "/app", label: "Beranda", icon: "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z", exact: true },
  { to: "/app/mood", label: "Mood", icon: "M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" },
  { to: "/app/journal", label: "Journal", icon: "M4 19.5A2.5 2.5 0 0 1 6.5 17H20M4 19.5V5A2.5 2.5 0 0 1 6.5 2.5H20v19H6.5A2.5 2.5 0 0 1 4 19.5z" },
  { to: "/app/profile", label: "Profil", icon: "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" },
];

const moreNavItems = [
  { to: "/app/gratitude", label: "Gratitude Journal", icon: "M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z", color: "bg-rose-50 text-rose-500" },
  { to: "/app/habits", label: "Habit Tracker", icon: "M9 11l3 3L22 4M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11", color: "bg-emerald-50 text-emerald-600" },
  { to: "/app/eating", label: "Emotional Eating", icon: "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z", color: "bg-orange-50 text-orange-500" },
  { to: "/app/calm", label: "Emergency Calm", icon: "M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10zm0-6v-4m0-4h.01", color: "bg-sky-50 text-sky-500" },
  { to: "/app/growth", label: "Growth Dashboard", icon: "M18 20V10M12 20V4M6 20v-6", color: "bg-violet-50 text-violet-500" },
  { to: "/app/premium", label: "Premium", icon: "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z", color: "bg-amber-50 text-amber-500" },
];

function NavSection({ title, items, path }: { title: string; items: typeof primaryNav; path: string }) {
  return (
    <div className="space-y-1">
      <p className="mb-2 px-4 text-[9px] font-bold uppercase tracking-[0.2em] text-primary/70">
        {title}
      </p>
      {items.map((n) => {
        const active = (n as any).exact ? path === n.to : path === n.to || path.startsWith(n.to);
        return (
          <Link
            key={n.to}
            to={n.to}
            className={`group flex items-center gap-3.5 rounded-xl px-4 py-2.5 text-xs font-semibold transition-all duration-300 relative ${active
                ? "bg-primary-soft/80 text-primary shadow-[inset_0_1px_0_0_rgba(255,255,255,0.4)]"
                : "text-muted-foreground/80 hover:bg-cream-deep/60 hover:text-foreground/90"
              }`}
          >
            <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl transition-all duration-300 ${active ? "bg-primary text-primary-foreground shadow-md scale-105" : "bg-cream-deep group-hover:bg-primary-soft group-hover:scale-105"}`}>
              <Icon d={n.icon} className="h-4.5 w-4.5" />
            </span>
            <span className="relative z-10 transition-transform duration-300 group-hover:translate-x-0.5">
              {n.label}
            </span>
            {active && <span className="ml-auto h-2 w-2 rounded-full bg-primary shadow-[0_0_8px_var(--color-primary)] animate-pulse" />}
          </Link>
        );
      })}
    </div>
  );
}

function UserAvatar({ name, plan }: { name?: string | null; plan?: string | null }) {
  const initials = name ? name.slice(0, 2).toUpperCase() : "BM";
  return (
    <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gradient-to-br from-primary to-accent font-display text-sm font-bold text-white shadow-soft transition-transform duration-200 hover:scale-105">
      {initials}
    </div>
  );
}

/* ─── Bloom logo SVG ───────────────────────────────────────────── */
function BloomLogo({ size = "md" }: { size?: "sm" | "md" }) {
  const sz = size === "sm" ? { outer: "h-8 w-8", inner: "h-4.5 w-4.5", rounded: "rounded-xl" } : { outer: "h-11 w-11", inner: "h-6 w-6", rounded: "rounded-2xl" };
  return (
    <div className={`grid ${sz.outer} place-items-center ${sz.rounded} bg-gradient-to-tr from-primary/90 via-primary to-accent/90 shadow-md transition-all duration-300 hover:scale-105`}>
      <svg viewBox="0 0 24 24" fill="white" className={sz.inner} aria-hidden="true">
        <path d="M12 2C8 2 5 5 5 9c0 2.5 1.2 4.7 3 6.1V17a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-1.9c1.8-1.4 3-3.6 3-6.1 0-4-3-7-7-7z" opacity=".95" />
        <path d="M9 22h6M10 19h4" stroke="white" strokeWidth="1.8" strokeLinecap="round" fill="none" />
      </svg>
    </div>
  );
}

/* ─── Streak Buddy Component ───────────────────────────────────── */
function StreakBuddy({ userId }: { userId?: string }) {
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
      
      const dates = new Set(data.map((d) => d.date));
      let s = 0;
      const d = new Date();
      const todayStr = d.toISOString().slice(0, 10);
      
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().slice(0, 10);
      
      if (!dates.has(todayStr) && !dates.has(yesterdayStr)) {
        return 0;
      }

      const countDate = dates.has(todayStr) ? d : yesterday;
      while (dates.has(countDate.toISOString().slice(0, 10))) {
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

/* ─── Affirmation Widget Component ──────────────────────────────── */
const AFFIRMATIONS = [
  "Hari ini kamu sudah melakukan yang terbaik! 🌸",
  "Pelan-pelan saja, setiap langkah kecil itu berharga. 🐢",
  "Jangan lupa minum air putih dan tersenyum hari ini! 💧",
  "Kamu itu berharga dan disayangi apa adanya. 💛",
  "Napas dulu yang dalam... semuanya akan baik-baik saja. 🌬️",
  "Bunga butuh waktu untuk mekar, begitu juga kamu. 🌸",
  "Mendung pasti lewat, matahari akan bersinar lagi! ☀️",
  "Tidak apa-apa untuk beristirahat sejenak hari ini. 🛌",
  "Kamu lebih kuat dari apa yang kamu pikirkan! 💪",
  "Hargai dirimu sendiri atas perjuanganmu sejauh ini. 🏆",
  "Hal baik sedang berjalan menuju kepadamu! ✨",
];

function AffirmationWidget() {
  const [quote, setQuote] = useState("");
  useEffect(() => {
    const day = new Date().getDate();
    setQuote(AFFIRMATIONS[day % AFFIRMATIONS.length]);
  }, []);

  return (
    <div className="mx-3 my-2 p-3.5 bg-gradient-to-br from-teal-50/80 to-emerald-50/50 rounded-2xl border border-teal-100/60 shadow-[0_4px_12px_rgba(20,184,166,0.04)] flex items-center gap-3 overflow-hidden relative group">
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes float-cloud {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-4px) rotate(2deg); }
        }
        .animate-float-cloud {
          animation: float-cloud 3s infinite ease-in-out;
        }
      `}} />
      
      {/* Cloud Character */}
      <div className="relative shrink-0 text-3xl animate-float-cloud select-none">
        ☁️
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-[9px] font-bold text-teal-700/90 uppercase tracking-[0.18em] leading-none">
          KATA HARI INI
        </p>
        <p className="text-[11.5px] font-semibold text-teal-950/90 leading-relaxed mt-1.5">
          "{quote}"
        </p>
      </div>
    </div>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const { data: profile, isLoading: pLoading } = useProfile(user?.id);
  const { data: isAdmin } = useIsAdmin(user?.id);
  const navigate = useNavigate();
  const path = useRouterState({ select: (s) => s.location.pathname });
  const qc = useQueryClient();
  const [moreOpen, setMoreOpen] = useState(false);

  // Force onboarding
  useEffect(() => {
    if (!loading && !pLoading && profile && !profile.onboarding_completed && path !== "/app/onboarding") {
      navigate({ to: "/app/onboarding" });
    }
  }, [loading, pLoading, profile, path, navigate]);

  // Close more sheet on route change
  useEffect(() => {
    setMoreOpen(false);
  }, [path]);

  const signOut = async () => {
    await qc.cancelQueries(); qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  };

  const isPremium = profile?.plan === "premium";
  const isOnboarding = path === "/app/onboarding";

  if (isOnboarding) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <header className="sticky top-0 z-20 flex items-center justify-between border-b border-border bg-card/85 px-5 py-4 backdrop-blur-xl">
          <div className="flex items-center gap-2">
            <BloomLogo size="sm" />
            <span className="font-display text-base font-semibold">Bloom Mind</span>
          </div>
          <button
            onClick={signOut}
            className="rounded-full border border-border px-3.5 py-1.5 text-xs font-semibold text-muted-foreground hover:bg-cream-deep hover:text-foreground transition-all duration-200"
          >
            Keluar
          </button>
        </header>
        <main className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
          <div className="rounded-3xl bg-card p-6 sm:p-10 ring-1 ring-border shadow-elevated animate-scale-in">
            {children}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* ── DESKTOP SIDEBAR ──────────────────────────────── */}
      <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col border-r border-border/40 bg-card/60 backdrop-blur-2xl lg:flex shadow-[4px_0_30px_rgba(0,0,0,0.015)]">
        {/* Subtle grain on sidebar */}
        <div className="absolute inset-0 opacity-[0.015] pointer-events-none" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")", backgroundRepeat: "repeat", backgroundSize: "128px" }} />

        {/* Logo */}
        <div className="relative px-5 py-6">
          <Link to="/app" className="flex items-center gap-3">
            <BloomLogo />
            <div>
              <p className="font-display text-xl font-bold leading-tight bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">Bloom Mind</p>
              <p className="text-[10px] text-muted-foreground/80 font-medium tracking-wide leading-tight">Your Safe Space</p>
            </div>
          </Link>
        </div>

        {/* Nav */}
        <nav className="relative flex-1 overflow-y-auto space-y-5 px-3 py-2">
          <NavSection title="Utama" items={primaryNav} path={path} />
          <NavSection title="Wellness" items={wellnessNav} path={path} />
          <NavSection title="Akun" items={accountNav} path={path} />
          {isAdmin && (
            <div className="pt-2">
              <Link
                to="/admin"
                className="flex items-center gap-3.5 rounded-xl bg-accent-soft/50 border border-accent/20 px-4 py-2.5 text-xs font-bold text-accent transition-all duration-300 hover:bg-accent-soft hover:shadow-sm"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-accent text-accent-foreground shadow-sm">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-4.5 w-4.5" aria-hidden="true">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                </span>
                Admin Panel
              </Link>
            </div>
          )}
        </nav>

        {/* Place StreakBuddy */}
        <AffirmationWidget />
        {user?.id && <StreakBuddy userId={user.id} />}

        {/* Footer */}
        <div className="relative border-t border-border/40 p-4 bg-background/25 m-3 rounded-2xl border border-white/20 shadow-sm backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <UserAvatar name={profile?.name} plan={profile?.plan} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-bold text-foreground/90">{profile?.name ?? "Pengguna"}</p>
              <p className="truncate text-[10px] text-muted-foreground/75 font-medium">{profile?.email}</p>
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between gap-2">
            <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold transition-all ${isPremium ? "bg-gradient-to-r from-amber-100 to-orange-100 text-amber-700 border border-amber-200/50 shadow-sm" : "bg-primary-soft text-foreground/80"}`}>
              {isPremium ? "✨ Premium" : "Free Plan"}
            </span>
            <button
              onClick={signOut}
              className="rounded-xl border border-border/60 px-2.5 py-1 text-[10px] font-semibold text-muted-foreground transition-all duration-200 hover:bg-cream-deep hover:text-foreground active:scale-95"
            >
              Keluar
            </button>
          </div>
        </div>
      </aside>

      {/* ── MOBILE TOP HEADER ────────────────────────────── */}
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-border/60 bg-card/85 px-5 py-3 backdrop-blur-xl lg:hidden" style={{ boxShadow: "0 1px 0 0 var(--color-border)" }}>
        <Link to="/app" className="flex items-center gap-2">
          <BloomLogo size="sm" />
          <span className="font-display text-base font-semibold">Bloom Mind</span>
        </Link>
        <div className="flex items-center gap-2">
          {isAdmin && (
            <Link to="/admin" className="text-xs text-muted-foreground" aria-label="Admin Panel">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden="true">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </Link>
          )}
          <Link to="/app/profile">
            <UserAvatar name={profile?.name} plan={profile?.plan} />
          </Link>
        </div>
      </header>

      {/* ── MAIN CONTENT ─────────────────────────────────── */}
      <main className="lg:pl-64 pb-28 lg:pb-12">
        <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-10">
          {/* Page transition wrapper keyed to path */}
          <div key={path} className="page-transition">
            {children}
          </div>
        </div>
      </main>

      {/* ── MOBILE BOTTOM NAV ────────────────────────────── */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-20 lg:hidden"
        style={{ boxShadow: "var(--shadow-nav)" }}
        aria-label="Navigasi utama"
      >
        <div className="glass-strong grid grid-cols-5 items-end pb-safe">
          {/* Items 1–2 */}
          {bottomNav.slice(0, 2).map((n) => {
            const active = (n as any).exact ? path === n.to : path === n.to || path.startsWith(n.to);
            return (
              <Link
                key={n.to}
                to={n.to}
                className={`flex flex-col items-center gap-1 py-3 text-[10px] font-medium transition-all duration-250 ${active ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}
              >
                <span className={`relative flex h-7 w-7 items-center justify-center rounded-xl transition-all duration-250 ${active ? "bg-primary-soft scale-110 shadow-sm" : "hover:bg-cream-deep"}`}>
                  <Icon d={n.icon} className="h-4.5 w-4.5" />
                  {active && (
                    <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 h-1 w-1 rounded-full bg-primary" />
                  )}
                </span>
                {n.label}
              </Link>
            );
          })}

          {/* Center FAB — Chat */}
          <div className="flex flex-col items-center pb-1">
            <div className="relative">
              {/* Pulse ring */}
              <span
                className="absolute inset-0 rounded-full bg-gradient-to-br from-primary to-accent opacity-0 animate-fab-ring"
                aria-hidden="true"
              />
              <span
                className="absolute inset-0 rounded-full bg-gradient-to-br from-primary to-accent opacity-0 animate-fab-ring"
                style={{ animationDelay: "0.8s" }}
                aria-hidden="true"
              />
              <Link
                to="/app/chat"
                className="group flex h-14 w-14 -translate-y-3 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent shadow-float transition-all duration-300 hover:scale-110 hover:shadow-glow-sage active:scale-95"
                aria-label="Buka Chat AI"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6" aria-hidden="true">
                  <path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 0 1-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </Link>
            </div>
            <span className={`-mt-0.5 text-[10px] font-medium ${path.startsWith("/app/chat") ? "text-primary" : "text-muted-foreground"}`}>Chat</span>
          </div>

          {/* Items 3–4 */}
          {bottomNav.slice(2, 4).map((n) => {
            const active = (n as any).exact ? path === n.to : path === n.to || path.startsWith(n.to);
            return (
              <Link
                key={n.to}
                to={n.to}
                className={`flex flex-col items-center gap-1 py-3 text-[10px] font-medium transition-all duration-250 ${active ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}
              >
                <span className={`relative flex h-7 w-7 items-center justify-center rounded-xl transition-all duration-250 ${active ? "bg-primary-soft scale-110 shadow-sm" : "hover:bg-cream-deep"}`}>
                  <Icon d={n.icon} className="h-4.5 w-4.5" />
                  {active && (
                    <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 h-1 w-1 rounded-full bg-primary" />
                  )}
                </span>
                {n.label}
              </Link>
            );
          })}

          {/* More button */}
          <button
            onClick={() => setMoreOpen(true)}
            className={`flex flex-col items-center gap-1 py-3 text-[10px] font-medium transition-all duration-250 ${moreOpen ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}
            aria-label="Lebih banyak menu"
            aria-expanded={moreOpen}
          >
            <span className={`relative flex h-7 w-7 items-center justify-center rounded-xl transition-all duration-250 ${moreOpen ? "bg-primary-soft scale-110 shadow-sm" : "hover:bg-cream-deep"}`}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" className="h-4.5 w-4.5" aria-hidden="true">
                <circle cx="12" cy="5" r="1" /><circle cx="12" cy="12" r="1" /><circle cx="12" cy="19" r="1" />
              </svg>
            </span>
            Lainnya
          </button>
        </div>
      </nav>

      {/* ── MORE SHEET ───────────────────────────────────── */}
      <BottomSheet open={moreOpen} onClose={() => setMoreOpen(false)} title="Menu Lainnya">
        <div className="grid grid-cols-3 gap-3">
          {moreNavItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="group flex flex-col items-center gap-2 rounded-2xl bg-cream-deep/60 p-4 text-center text-xs font-medium text-foreground transition-all duration-200 hover:bg-cream-deep hover:scale-105 hover:shadow-card active:scale-95"
            >
              <span className={`grid h-12 w-12 place-items-center rounded-2xl transition-all duration-200 group-hover:scale-110 ${item.color}`}>
                <Icon d={item.icon} className="h-5 w-5" />
              </span>
              {item.label}
            </Link>
          ))}
        </div>

        <div className="mt-6 border-t border-border pt-5">
          <button
            onClick={signOut}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border border-destructive/30 py-3 text-sm font-medium text-destructive transition-all duration-200 hover:bg-destructive/5 hover:scale-[1.01]"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden="true">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
            </svg>
            Keluar dari akun
          </button>
        </div>
      </BottomSheet>
    </div>
  );
}
