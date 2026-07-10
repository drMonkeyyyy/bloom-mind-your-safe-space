import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw redirect({ to: "/auth" });
    if (!data.user.email_confirmed_at) {
      throw redirect({ to: "/auth", search: { mode: "verify" } });
    }

    // Update last_active_at in profiles (throttled to once every 24 hours)
    if (typeof window !== "undefined") {
      const key = `last_active_update_${data.user.id}`;
      const now = Date.now();
      const lastUpdate = localStorage.getItem(key);
      if (!lastUpdate || now - parseInt(lastUpdate, 10) > 24 * 60 * 60 * 1000) {
        (async () => {
          try {
            const { error: updateError } = await supabase
              .from("profiles")
              .update({ last_active_at: new Date().toISOString() })
              .eq("id", data.user.id);
            if (updateError) throw updateError;
            localStorage.setItem(key, now.toString());
          } catch (err) {
            console.error("Failed to update last_active_at:", err);
          }
        })();
      }
    }

    return { user: data.user };
  },
  component: () => <Outlet />,
});
