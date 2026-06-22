import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import type { ReactNode } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useProfile, useIsAdmin } from "@/hooks/use-profile";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

const navUser = [
  { to: "/app", label: "Beranda", icon: "🏠" },
  { to: "/app/chat", label: "Chat", icon: "💬" },
  { to: "/app/mood", label: "Mood", icon: "🌤️" },
  { to: "/app/journal", label: "Journal", icon: "📓" },
  { to: "/app/gratitude", label: "Syukur", icon: "🙏" },
  { to: "/app/habits", label: "Habit", icon: "✅" },
  { to: "/app/eating", label: "Makan", icon: "🍎" },
  { to: "/app/calm", label: "Tenang", icon: "🌬️" },
  { to: "/app/growth", label: "Growth", icon: "📈" },
  { to: "/app/premium", label: "Premium", icon: "✨" },
  { to: "/app/profile", label: "Profil", icon: "👤" },
];

const bottomNav = [
  { to: "/app", label: "Beranda", icon: "🏠" },
  { to: "/app/chat", label: "Chat", icon: "💬" },
  { to: "/app/mood", label: "Mood", icon: "🌤️" },
  { to: "/app/journal", label: "Journal", icon: "📓" },
  { to: "/app/profile", label: "Profil", icon: "👤" },
];

export function AppShell({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const { data: profile, isLoading: pLoading } = useProfile(user?.id);
  const { data: isAdmin } = useIsAdmin(user?.id);
  const navigate = useNavigate();
  const path = useRouterState({ select: (s) => s.location.pathname });
  const qc = useQueryClient();

  // Force onboarding
  useEffect(() => {
    if (!loading && !pLoading && profile && !profile.onboarding_completed && path !== "/app/onboarding") {
      navigate({ to: "/app/onboarding" });
    }
  }, [loading, pLoading, profile, path, navigate]);

  const signOut = async () => {
    await qc.cancelQueries(); qc.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Sidebar desktop */}
      <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col border-r border-border bg-card/60 backdrop-blur lg:flex">
        <div className="px-6 py-6">
          <Link to="/app" className="font-display text-2xl font-semibold">Bloom Mind</Link>
          <p className="mt-1 text-xs text-muted-foreground">Your Safe Place To Grow</p>
        </div>
        <nav className="flex-1 space-y-1 px-3">
          {navUser.map((n) => {
            const active = path === n.to || (n.to !== "/app" && path.startsWith(n.to));
            return (
              <Link key={n.to} to={n.to} className={`flex items-center gap-3 rounded-2xl px-4 py-2.5 text-sm transition ${active ? "bg-primary-soft text-foreground font-semibold" : "text-muted-foreground hover:bg-cream-deep"}`}>
                <span>{n.icon}</span>{n.label}
              </Link>
            );
          })}
          {isAdmin && (
            <Link to="/admin" className="mt-3 flex items-center gap-3 rounded-2xl bg-accent-soft px-4 py-2.5 text-sm font-semibold text-foreground">
              🛡️ Admin Panel
            </Link>
          )}
        </nav>
        <div className="border-t border-border p-4">
          <div className="mb-2 text-xs text-muted-foreground">{profile?.email}</div>
          <div className="mb-3 inline-flex rounded-full bg-primary-soft px-3 py-1 text-xs font-semibold text-foreground">
            {profile?.plan === "premium" ? "✨ Premium" : "Free"}
          </div>
          <button onClick={signOut} className="w-full rounded-full border border-border py-2 text-xs text-muted-foreground hover:bg-cream-deep">Keluar</button>
        </div>
      </aside>

      {/* Mobile top */}
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-border bg-card/80 px-5 py-3 backdrop-blur lg:hidden">
        <Link to="/app" className="font-display text-lg font-semibold">Bloom Mind</Link>
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-primary-soft px-2.5 py-0.5 text-[10px] font-semibold">{profile?.plan === "premium" ? "✨ Premium" : "Free"}</span>
          {isAdmin && <Link to="/admin" className="text-xs">🛡️</Link>}
        </div>
      </header>

      <main className="lg:pl-64 pb-24 lg:pb-10">
        <div className="mx-auto max-w-5xl px-5 py-6 sm:py-10">{children}</div>
      </main>

      {/* Mobile bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-20 border-t border-border bg-card/95 backdrop-blur lg:hidden">
        <div className="grid grid-cols-5">
          {bottomNav.map((n) => {
            const active = path === n.to || (n.to !== "/app" && path.startsWith(n.to));
            return (
              <Link key={n.to} to={n.to} className={`flex flex-col items-center gap-1 py-2.5 text-[10px] ${active ? "text-primary font-semibold" : "text-muted-foreground"}`}>
                <span className="text-lg">{n.icon}</span>{n.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
