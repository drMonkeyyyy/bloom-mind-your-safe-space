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

  const { data: chats, refetch } = useQuery({
    queryKey: ["chats", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.from("chats").select("*").eq("user_id", user!.id).order("updated_at", { ascending: false });
      return data ?? [];
    },
  });

  const handleDeleteChat = async (e: React.MouseEvent, chatId: string) => {
    e.preventDefault();
    e.stopPropagation();
    const confirmDelete = window.confirm("Apakah Anda yakin ingin menghapus percakapan ini secara permanen?");
    if (!confirmDelete) return;

    try {
      const { error } = await supabase.from("chats").delete().eq("id", chatId);
      if (error) throw error;
      refetch();
    } catch (err) {
      console.error("Gagal menghapus chat:", err);
      alert("Gagal menghapus percakapan.");
    }
  };

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
                className="group relative flex items-center gap-3 rounded-2xl border border-border bg-card p-4 hover:bg-cream-deep transition-all">
                <span className="text-2xl">{comp?.emoji}</span>
                <div className="min-w-0 flex-1 pr-10">
                  <p className="truncate text-sm font-semibold">{c.title ?? "Percakapan"}</p>
                  <p className="truncate text-xs text-muted-foreground">{comp?.name} · {new Date(c.updated_at).toLocaleDateString("id-ID")}</p>
                </div>
                <button
                  onClick={(e) => handleDeleteChat(e, c.id)}
                  className="absolute right-4 p-2 text-muted-foreground hover:text-rose-600 rounded-full hover:bg-rose-50 transition-all opacity-70 sm:opacity-0 sm:group-hover:opacity-100"
                  title="Hapus Percakapan"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                  </svg>
                </button>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
