import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { COMPANIONS } from "@/lib/companions";
import { useProfile } from "@/hooks/use-profile";

export const Route = createFileRoute("/_authenticated/app/chat/")({
  component: ChatList,
});

function ChatList() {
  const { user } = useAuth();
  const { data: profile } = useProfile(user?.id);
  const navigate = useNavigate();

  const { data: chats } = useQuery({
    queryKey: ["chats", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.from("chats").select("*").eq("user_id", user!.id).order("updated_at", { ascending: false });
      return data ?? [];
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-semibold">Pendamping kamu</h1>
        <p className="mt-1 text-sm text-muted-foreground">Pilih siapa yang menemanimu hari ini.</p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {COMPANIONS.map((c) => {
          const locked = c.premium && profile?.plan !== "premium";
          return (
            <button key={c.key} disabled={locked}
              onClick={() => navigate({ to: "/app/chat/$chatId", params: { chatId: "new" }, search: { companion: c.key } })}
              className={`rounded-3xl border bg-card p-4 text-left transition ${locked ? "opacity-50" : "hover:-translate-y-0.5 border-border"}`}>
              <div className="text-3xl">{c.emoji}</div>
              <div className="mt-2 font-semibold text-sm">{c.name}</div>
              <div className="text-[10px] text-muted-foreground">{locked ? "🔒 Premium" : c.tone}</div>
            </button>
          );
        })}
      </div>

      <section>
        <h2 className="font-display text-xl font-semibold">Percakapan sebelumnya</h2>
        <div className="mt-3 space-y-2">
          {chats?.length === 0 && <p className="text-sm text-muted-foreground">Belum ada percakapan.</p>}
          {chats?.map((c) => {
            const comp = COMPANIONS.find((x) => x.key === c.companion_key);
            return (
              <Link key={c.id} to="/app/chat/$chatId" params={{ chatId: c.id }} search={{ companion: undefined }}
                className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4 hover:bg-cream-deep">
                <span className="text-2xl">{comp?.emoji}</span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{c.title ?? "Percakapan"}</p>
                  <p className="truncate text-xs text-muted-foreground">{comp?.name} · {new Date(c.updated_at).toLocaleDateString("id-ID")}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
