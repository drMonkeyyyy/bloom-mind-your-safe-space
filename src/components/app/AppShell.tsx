import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useProfile, useIsAdmin } from "@/hooks/use-profile";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
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
    <div>
      <p className="mb-1.5 px-4 text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground/60">
        {title}
      </p>
      {items.map((n) => {
        const active = (n as any).exact ? path === n.to : path === n.to || path.startsWith(n.to);
        return (
          <Link
            key={n.to}
            to={n.to}
            className={`group flex items-center gap-3 rounded-2xl px-4 py-2.5 text-sm font-medium transition-all duration-150 ${active
                ? "bg-primary-soft text-foreground shadow-[inset_0_1px_0_0_rgba(255,255,255,0.6)]"
                : "text-muted-foreground hover:bg-cream-deep hover:text-foreground"
              }`}
          >
            <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-xl transition-colors ${active ? "bg-primary text-primary-foreground" : "bg-cream-deep group-hover:bg-primary-soft"}`}>
              <Icon d={n.icon} className="h-4 w-4" />
            </span>
            {n.label}
            {active && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-primary" />}
          </Link>
        );
      })}
    </div>
  );
}

function UserAvatar({ name, plan }: { name?: string | null; plan?: string | null }) {
  const initials = name ? name.slice(0, 2).toUpperCase() : "BM";
  return (
    <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gradient-to-br from-primary to-accent font-display text-sm font-bold text-white shadow-soft">
      {initials}
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
            <div className="grid h-7 w-7 place-items-center rounded-lg bg-gradient-to-br from-primary to-accent shadow-soft">
              <svg viewBox="0 0 24 24" fill="white" className="h-4.5 w-4.5" aria-hidden="true">
                <path d="M12 2C8 2 5 5 5 9c0 2.5 1.2 4.7 3 6.1V17a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-1.9c1.8-1.4 3-3.6 3-6.1 0-4-3-7-7-7z" opacity=".9" />
              </svg>
            </div>
            <span className="font-display text-base font-semibold">Bloom Mind</span>
          </div>
          <button
            onClick={signOut}
            className="rounded-full border border-border px-3.5 py-1.5 text-xs font-semibold text-muted-foreground hover:bg-cream-deep hover:text-foreground"
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
      <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col border-r border-border bg-card/70 backdrop-blur-xl lg:flex">
        {/* Logo */}
        <div className="px-5 py-6">
          <Link to="/app" className="flex items-center gap-2.5">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-primary to-accent shadow-soft">
              <svg viewBox="0 0 24 24" fill="white" className="h-5 w-5" aria-hidden="true">
                <path d="M12 2C8 2 5 5 5 9c0 2.5 1.2 4.7 3 6.1V17a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-1.9c1.8-1.4 3-3.6 3-6.1 0-4-3-7-7-7z" opacity=".9" />
                <path d="M9 22h6M10 19h4" stroke="white" strokeWidth="1.5" strokeLinecap="round" fill="none" />
              </svg>
            </div>
            <div>
              <p className="font-display text-lg font-semibold leading-tight">Bloom Mind</p>
              <p className="text-[10px] text-muted-foreground leading-tight">Your Safe Space</p>
            </div>
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto space-y-4 px-3 py-2">
          <NavSection title="Utama" items={primaryNav} path={path} />
          <NavSection title="Wellness" items={wellnessNav} path={path} />
          <NavSection title="Akun" items={accountNav} path={path} />
          {isAdmin && (
            <div>
              <Link
                to="/admin"
                className="flex items-center gap-3 rounded-2xl bg-accent-soft px-4 py-2.5 text-sm font-semibold text-foreground"
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-accent text-accent-foreground">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4" aria-hidden="true">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                </span>
                Admin Panel
              </Link>
            </div>
          )}
        </nav>

        {/* Footer */}
        <div className="border-t border-border p-4">
          <div className="flex items-center gap-3">
            <UserAvatar name={profile?.name} plan={profile?.plan} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">{profile?.name ?? "Pengguna"}</p>
              <p className="truncate text-[11px] text-muted-foreground">{profile?.email}</p>
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between gap-2">
            <span className={`inline-flex rounded-full px-3 py-1 text-[11px] font-semibold ${isPremium ? "bg-gradient-to-r from-amber-100 to-orange-100 text-amber-700" : "bg-primary-soft text-foreground"}`}>
              {isPremium ? "✨ Premium" : "Free Plan"}
            </span>
            <button
              onClick={signOut}
              className="rounded-full border border-border px-3 py-1 text-[11px] text-muted-foreground transition-colors hover:bg-cream-deep hover:text-foreground"
            >
              Keluar
            </button>
          </div>
        </div>
      </aside>

      {/* ── MOBILE TOP HEADER ────────────────────────────── */}
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-border bg-card/85 px-5 py-3 backdrop-blur-xl lg:hidden">
        <Link to="/app" className="flex items-center gap-2">
          <div className="grid h-7 w-7 place-items-center rounded-lg bg-gradient-to-br from-primary to-accent shadow-soft">
            <svg viewBox="0 0 24 24" fill="white" className="h-4 w-4" aria-hidden="true">
              <path d="M12 2C8 2 5 5 5 9c0 2.5 1.2 4.7 3 6.1V17a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-1.9c1.8-1.4 3-3.6 3-6.1 0-4-3-7-7-7z" opacity=".9" />
            </svg>
          </div>
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
          {children}
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
                className={`flex flex-col items-center gap-1 py-3 text-[10px] font-medium transition-colors ${active ? "text-primary" : "text-muted-foreground"}`}
              >
                <span className={`flex h-7 w-7 items-center justify-center rounded-xl transition-all duration-200 ${active ? "bg-primary-soft scale-110" : ""}`}>
                  <Icon d={n.icon} className="h-4.5 w-4.5" />
                </span>
                {n.label}
              </Link>
            );
          })}

          {/* Center FAB — Chat */}
          <div className="flex flex-col items-center pb-1">
            <Link
              to="/app/chat"
              className="group flex h-14 w-14 -translate-y-3 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent shadow-float transition-all duration-300 hover:scale-105 active:scale-95"
              aria-label="Buka Chat AI"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6" aria-hidden="true">
                <path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 0 1-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </Link>
            <span className={`-mt-0.5 text-[10px] font-medium ${path.startsWith("/app/chat") ? "text-primary" : "text-muted-foreground"}`}>Chat</span>
          </div>

          {/* Items 3–4 */}
          {bottomNav.slice(2, 4).map((n) => {
            const active = (n as any).exact ? path === n.to : path === n.to || path.startsWith(n.to);
            return (
              <Link
                key={n.to}
                to={n.to}
                className={`flex flex-col items-center gap-1 py-3 text-[10px] font-medium transition-colors ${active ? "text-primary" : "text-muted-foreground"}`}
              >
                <span className={`flex h-7 w-7 items-center justify-center rounded-xl transition-all duration-200 ${active ? "bg-primary-soft scale-110" : ""}`}>
                  <Icon d={n.icon} className="h-4.5 w-4.5" />
                </span>
                {n.label}
              </Link>
            );
          })}

          {/* More button */}
          <button
            onClick={() => setMoreOpen(true)}
            className={`flex flex-col items-center gap-1 py-3 text-[10px] font-medium transition-colors ${moreOpen ? "text-primary" : "text-muted-foreground"}`}
            aria-label="Lebih banyak menu"
            aria-expanded={moreOpen}
          >
            <span className={`flex h-7 w-7 items-center justify-center rounded-xl transition-all duration-200 ${moreOpen ? "bg-primary-soft scale-110" : ""}`}>
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
              className="flex flex-col items-center gap-2 rounded-2xl bg-cream-deep/60 p-4 text-center text-xs font-medium text-foreground transition-all duration-150 hover:bg-cream-deep active:scale-95"
            >
              <span className={`grid h-12 w-12 place-items-center rounded-2xl ${item.color}`}>
                <Icon d={item.icon} className="h-5 w-5" />
              </span>
              {item.label}
            </Link>
          ))}
        </div>

        <div className="mt-6 border-t border-border pt-5">
          <button
            onClick={signOut}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border border-destructive/30 py-3 text-sm font-medium text-destructive transition-colors hover:bg-destructive/5"
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
