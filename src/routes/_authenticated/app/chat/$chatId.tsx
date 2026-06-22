import { createFileRoute, useNavigate, useParams, useSearch, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { z } from "zod";
import { useAuth } from "@/hooks/use-auth";
import { useProfile } from "@/hooks/use-profile";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { sendChatMessage, generateJournalFromChat } from "@/lib/chat.functions";
import { COMPANIONS, type CompanionKey } from "@/lib/companions";
import { toast } from "sonner";
import { PaywallCard } from "@/components/app/PaywallCard";

const search = z.object({
  companion: z.enum(["ibu","ayah","kakak_perempuan","kakak_laki","sahabat","partner","coach"]).optional(),
});

export const Route = createFileRoute("/_authenticated/app/chat/$chatId")({
  validateSearch: search,
  component: ChatRoom,
});

function ChatRoom() {
  const { chatId } = useParams({ from: "/_authenticated/app/chat/$chatId" });
  const { companion: companionParam } = useSearch({ from: "/_authenticated/app/chat/$chatId" });
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: profile } = useProfile(user?.id);
  const qc = useQueryClient();
  const send = useServerFn(sendChatMessage);
  const journalize = useServerFn(generateJournalFromChat);

  const isNew = chatId === "new";
  const [activeCompanion, setActiveCompanion] = useState<CompanionKey>(
    companionParam ?? profile?.selected_companion ?? "sahabat"
  );

  useEffect(() => { if (!companionParam && profile?.selected_companion) setActiveCompanion(profile.selected_companion); }, [profile, companionParam]);

  const { data: chat } = useQuery({
    queryKey: ["chat", chatId],
    enabled: !isNew && !!user,
    queryFn: async () => {
      const { data } = await supabase.from("chats").select("*").eq("id", chatId).maybeSingle();
      return data;
    },
  });

  useEffect(() => { if (chat?.companion_key) setActiveCompanion(chat.companion_key); }, [chat]);

  const { data: messages, refetch } = useQuery({
    queryKey: ["messages", chatId],
    enabled: !isNew && !!user,
    queryFn: async () => {
      const { data } = await supabase.from("messages").select("*").eq("chat_id", chatId).order("created_at");
      return data ?? [];
    },
  });

  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [panicMode, setPanicMode] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => { scrollRef.current?.scrollTo({ top: 999999, behavior: "smooth" }); }, [messages, sending]);

  const comp = COMPANIONS.find((c) => c.key === activeCompanion);

  const submit = async (e?: React.FormEvent, override?: string) => {
    e?.preventDefault();
    const text = override ?? input.trim();
    if (!text || sending) return;
    setInput(""); setSending(true);
    try {
      const res = await send({ data: { chatId: isNew ? null : chatId, companionKey: activeCompanion, content: text } });
      if (isNew && res.chatId) {
        await navigate({ to: "/app/chat/$chatId", params: { chatId: res.chatId }, search: { companion: undefined } });
        qc.invalidateQueries({ queryKey: ["messages", res.chatId] });
        qc.invalidateQueries({ queryKey: ["chats", user?.id] });
      } else {
        refetch();
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes("DAILY_LIMIT")) toast.error("Limit chat harian gratis tercapai. Upgrade ke Premium untuk unlimited.");
      else if (msg.includes("PREMIUM_REQUIRED")) toast.error("Pendamping ini khusus Premium.");
      else if (msg.includes("RATE_LIMIT")) toast.error("Permintaan terlalu cepat, coba lagi sebentar.");
      else if (msg.includes("AI_CREDITS")) toast.error("Kredit AI habis. Hubungi admin.");
      else toast.error(msg);
    } finally { setSending(false); }
  };

  const makeJournal = async () => {
    if (isNew) return;
    try {
      const res = await journalize({ data: { chatId } });
      toast.success("Journal dibuat dari percakapan.");
      if (res.journalId) navigate({ to: "/app/journal" });
    } catch (e) { toast.error(e instanceof Error ? e.message : "Gagal"); }
  };

  const showLimitWarning = profile?.plan === "free";

  return (
    <div className="flex h-[calc(100vh-10rem)] flex-col lg:h-[calc(100vh-6rem)]">
      <div className="flex items-center justify-between gap-3 border-b border-border pb-3">
        <Link to="/app/chat" className="text-xs text-muted-foreground">← Semua chat</Link>
        <div className="flex items-center gap-2">
          <span className="text-2xl">{comp?.emoji}</span>
          <div>
            <p className="text-sm font-semibold">{comp?.name}</p>
            <p className="text-[10px] text-muted-foreground">{comp?.tone}</p>
          </div>
        </div>
        {!isNew && (
          <button onClick={makeJournal} className="rounded-full border border-border px-3 py-1.5 text-xs hover:bg-cream-deep">
            📓 Jadikan Journal
          </button>
        )}
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto py-4 space-y-3">
        {isNew && (
          <div className="rounded-2xl bg-primary-soft/50 p-4 text-sm text-foreground">
            Halo 🌿 Aku <strong>{comp?.name}</strong>. Apa pun yang kamu rasakan sekarang, aku siap mendengarkan. Mulai dari mana saja.
          </div>
        )}
        {messages?.map((m) => (
          <div key={m.id} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${m.role === "user" ? "bg-foreground text-cream" : "bg-card ring-1 ring-border"}`}>
              {m.content}
            </div>
          </div>
        ))}
        {sending && (
          <div className="flex justify-start">
            <div className="rounded-2xl bg-card px-4 py-2.5 text-sm ring-1 ring-border">
              <span className="inline-flex gap-1"><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" /><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary [animation-delay:0.2s]" /><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary [animation-delay:0.4s]" /></span>
            </div>
          </div>
        )}
        {panicMode && <PaywallCard title="Limit harian gratis tercapai" desc="Kamu sudah menggunakan jatah balasan AI hari ini. Upgrade untuk lanjut tanpa batas." />}
      </div>

      <div className="border-t border-border pt-3">
        <div className="mb-2 flex gap-2">
          <button onClick={()=>submit(undefined, "Aku sedang cemas/panik. Tolong bantu aku menenangkan diri.")} className="rounded-full border border-accent/40 bg-accent-soft px-3 py-1.5 text-xs">🚨 Aku panik/cemas</button>
          {showLimitWarning && <span className="ml-auto text-[10px] text-muted-foreground self-center">Free: 10 balasan/hari</span>}
        </div>
        <form onSubmit={submit} className="flex gap-2">
          <textarea value={input} onChange={(e)=>setInput(e.target.value)} rows={2} placeholder="Tulis perasaanmu…"
            onKeyDown={(e)=>{ if (e.key==="Enter" && !e.shiftKey) { e.preventDefault(); submit(); } }}
            className="flex-1 resize-none rounded-2xl border border-border bg-card px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
          <button disabled={sending || !input.trim()} className="self-end rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground shadow-peach disabled:opacity-50">Kirim</button>
        </form>
      </div>
    </div>
  );
}
