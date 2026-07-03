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
import { exportChatPDF } from "@/lib/export-pdf";
import { ModalDialog } from "@/components/app/BottomSheet";

const search = z.object({
  companion: z.string().optional(),
  customCompanionId: z.string().uuid().optional(),
});

export const Route = createFileRoute("/_authenticated/app/chat/$chatId")({
  validateSearch: search,
  component: ChatRoom,
});

function ChatRoom() {
  const { chatId } = useParams({ from: "/_authenticated/app/chat/$chatId" });
  const { companion: companionParam, customCompanionId: customCompanionIdParam } = useSearch({ from: "/_authenticated/app/chat/$chatId" });
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: profile } = useProfile(user?.id);
  const qc = useQueryClient();
  const send = useServerFn(sendChatMessage);
  const journalize = useServerFn(generateJournalFromChat);

  const isNew = chatId === "new";
  const [activeCompanion, setActiveCompanion] = useState<string | null>(
    customCompanionIdParam ? null : (companionParam ?? profile?.selected_companion ?? "sahabat")
  );

  useEffect(() => {
    if (!companionParam && !customCompanionIdParam && profile?.selected_companion) {
      setActiveCompanion(profile.selected_companion);
    }
  }, [profile, companionParam, customCompanionIdParam]);

  const { data: chat } = useQuery({
    queryKey: ["chat", chatId],
    enabled: !isNew && !!user,
    queryFn: async () => {
      const { data } = await supabase.from("chats").select("*").eq("id", chatId).maybeSingle();
      return data;
    },
  });

  const { data: customCompanion } = useQuery({
    queryKey: ["custom-companion", chat?.custom_companion_id || customCompanionIdParam],
    enabled: !!(chat?.custom_companion_id || customCompanionIdParam),
    queryFn: async () => {
      const id = chat?.custom_companion_id || customCompanionIdParam;
      const { data } = await supabase.from("custom_companions").select("*").eq("id", id).maybeSingle();
      return data;
    },
  });

  useEffect(() => {
    if (chat?.companion_key) {
      setActiveCompanion(chat.companion_key);
    } else if (chat?.custom_companion_id) {
      setActiveCompanion(null);
    }
  }, [chat]);

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
  const [generatingJournal, setGeneratingJournal] = useState(false);
  const [panicMode, setPanicMode] = useState(false);
  const [cleanupModalOpen, setCleanupModalOpen] = useState(false);
  const [cleaning, setCleaning] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const sixMonthsAgo = new Date(Date.now() - 180 * 24 * 60 * 60 * 1000);
  const hasOldMessages = messages && messages.length > 0 && messages.some(m => new Date(m.created_at) < sixMonthsAgo);

  const clearOldMessages = async (exportFormat: 'pdf' | 'json' | 'none') => {
    if (!user || isNew) return;
    setCleaning(true);
    try {
      const threeMonthsCutoff = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
      const messagesToExport = messages?.filter(m => new Date(m.created_at) < threeMonthsCutoff) ?? [];

      if (messagesToExport.length > 0) {
        if (exportFormat === 'pdf') {
          exportChatPDF(comp?.name ?? "Pendamping", comp?.emoji ?? "🌿", messagesToExport);
        } else if (exportFormat === 'json') {
          const chatData = {
            companion: comp?.name,
            emoji: comp?.emoji,
            export_date: new Date().toISOString(),
            messages: messagesToExport.map(m => ({ role: m.role, content: m.content, created_at: m.created_at }))
          };
          const blob = new Blob([JSON.stringify(chatData, null, 2)], { type: "application/json" });
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `chat_bloom_mind_${comp?.name || 'companion'}_${new Date().toISOString().slice(0, 10)}.json`;
          a.click();
          URL.revokeObjectURL(url);
        }
      }
      const { error } = await supabase
        .from("messages")
        .delete()
        .eq("chat_id", chatId)
        .lt("created_at", threeMonthsCutoff.toISOString());
        
      if (error) throw error;
      toast.success("Pesan lama (di atas 3 bulan) berhasil dibersihkan! 🌿");
      setCleanupModalOpen(false);
      refetch();
    } catch (err: any) {
      toast.error(err.message || "Gagal menghapus pesan lama");
    } finally {
      setCleaning(false);
    }
  };

  useEffect(() => { scrollRef.current?.scrollTo({ top: 999999, behavior: "smooth" }); }, [messages, sending]);

  const comp = chat?.custom_companion_id || customCompanionIdParam
    ? customCompanion
      ? {
          name: customCompanion.name,
          emoji: customCompanion.emoji || "👤",
          tone: customCompanion.tone,
          avatar_url: customCompanion.avatar_url,
        }
      : null
    : COMPANIONS.find((c) => c.key === activeCompanion);

  const submit = async (e?: React.FormEvent, override?: string) => {
    e?.preventDefault();
    const text = override ?? input.trim();
    if (!text || sending) return;
    setInput(""); setSending(true);
    try {
      const companionKeyInput = chat?.custom_companion_id || customCompanionIdParam ? null : (activeCompanion as any);
      const customCompanionIdInput = chat?.custom_companion_id || customCompanionIdParam || null;
      const res = await send({ data: { chatId: isNew ? null : chatId, companionKey: companionKeyInput, customCompanionId: customCompanionIdInput, content: text } });
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
    if (isNew || generatingJournal) return;
    setGeneratingJournal(true);
    try {
      const res = await journalize({ data: { chatId } });
      toast.success("Journal dibuat dari percakapan.");
      if (user?.id) {
        qc.invalidateQueries({ queryKey: ["journals", user.id] });
        qc.invalidateQueries({ queryKey: ["last-journal", user.id] });
      }
      if (res.journalId) navigate({ to: "/app/journal" });
    } catch (e) { 
      toast.error(e instanceof Error ? e.message : "Gagal"); 
    } finally {
      setGeneratingJournal(false);
    }
  };

  const showLimitWarning = profile?.plan === "free";

  return (
    <div className="flex h-[calc(100vh-10rem)] flex-col lg:h-[calc(100vh-6rem)]">
      <div className="flex items-center justify-between gap-3 border-b border-border pb-3">
        <Link to="/app/chat" className="text-xs text-muted-foreground">← Semua chat</Link>
        <div className="flex items-center gap-2">
          {comp?.avatar_url ? (
            <img src={comp.avatar_url} alt={comp.name} className="w-8 h-8 rounded-full object-cover shrink-0" />
          ) : (
            <span className="text-2xl">{comp?.emoji}</span>
          )}
          <div>
            <p className="text-sm font-semibold">{comp?.name}</p>
            <p className="text-[10px] text-muted-foreground">{comp?.tone}</p>
          </div>
        </div>
        {!isNew && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => exportChatPDF(comp?.name ?? "Pendamping", comp?.emoji ?? "🌿", messages ?? [])}
              className="rounded-full border border-border px-3 py-1.5 text-xs hover:bg-cream-deep flex items-center gap-1.5 transition-all duration-200 active:scale-95 shadow-sm"
            >
              📄 Simpan PDF
            </button>
            <button 
              disabled={generatingJournal} 
              onClick={makeJournal} 
              className="rounded-full border border-border px-3 py-1.5 text-xs hover:bg-cream-deep disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 transition-all duration-200 active:scale-95 shadow-sm"
            >
              {generatingJournal ? (
                <>
                  <span className="h-1.5 w-1.5 animate-ping rounded-full bg-primary" />
                  Memproses Jurnal...
                </>
              ) : (
                "📓 Jadikan Journal"
              )}
            </button>
          </div>
        )}
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto py-4 space-y-3">
        {hasOldMessages && (
          <div className="flex items-center justify-between gap-3 rounded-2xl bg-amber-50/70 border border-amber-100/50 p-3.5 text-xs text-amber-900 animate-slide-up mb-2">
            <div className="flex items-center gap-2">
              <span className="text-base select-none">⏳</span>
              <p className="leading-relaxed">
                Riwayat obrolan sudah berjalan lebih dari 6 bulan. Bersihkan pesan lama di atas 3 bulan untuk menghemat ruang?
              </p>
            </div>
            <button
              onClick={() => setCleanupModalOpen(true)}
              className="shrink-0 rounded-full bg-amber-600 hover:bg-amber-700 px-3 py-1 font-bold text-white transition-all active:scale-95 shadow-sm"
            >
              Bersihkan 🧹
            </button>
          </div>
        )}
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
            maxLength={2000}
            onKeyDown={(e)=>{ if (e.key==="Enter" && !e.shiftKey) { e.preventDefault(); submit(); } }}
            className="flex-1 resize-none rounded-2xl border border-border bg-card px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
          <button disabled={sending || !input.trim()} className="self-end rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground shadow-peach disabled:opacity-50">Kirim</button>
        </form>
      </div>

      {/* ── CLEANUP CONFIRMATION DIALOG ─────────────────────────── */}
      <ModalDialog
        open={cleanupModalOpen}
        onClose={() => setCleanupModalOpen(false)}
        title="🧹 Bersihkan Chat Lama?"
      >
        <div className="space-y-4">
          <p className="text-xs text-muted-foreground leading-normal">
            Pesan obrolan yang lebih lama dari 3 bulan (90 hari) akan dihapus secara permanen untuk mengosongkan ruang penyimpanan database. Catatan 3 bulan terakhir tetap disimpan di aplikasi.
          </p>
          <div className="rounded-2xl bg-amber-50 border border-amber-100 p-3.5 flex gap-3 text-amber-950">
            <span className="text-2xl select-none">💡</span>
            <div className="text-xs leading-relaxed">
              <p className="font-bold text-amber-900 mb-0.5 font-display">Saran Penyimpanan</p>
              <p>Apakah Anda ingin menyimpan seluruh riwayat chat yang akan dihapus (di atas 3 bulan) sebagai **PDF** atau mendownload file **JSON** di laptop Anda terlebih dahulu?</p>
            </div>
          </div>
          <div className="mt-5 flex flex-col gap-2 pt-3 border-t border-border/40">
            <button
              disabled={cleaning}
              onClick={() => clearOldMessages('pdf')}
              className="w-full rounded-full bg-primary py-3 text-xs font-bold text-white transition-all duration-200 active:scale-95 shadow-soft flex items-center justify-center gap-1.5"
            >
              📄 Simpan Laporan PDF & Bersihkan
            </button>
            <button
              disabled={cleaning}
              onClick={() => clearOldMessages('json')}
              className="w-full rounded-full border border-primary/20 bg-primary-soft/60 hover:bg-primary-soft py-3 text-xs font-bold text-primary transition-all duration-200 active:scale-95 flex items-center justify-center gap-1.5"
            >
              💻 Download JSON ke Laptop & Bersihkan
            </button>
            <button
              disabled={cleaning}
              onClick={() => clearOldMessages('none')}
              className="w-full rounded-full border border-destructive/20 hover:bg-destructive/5 py-3 text-xs font-bold text-destructive transition-all duration-200 active:scale-95"
            >
              Hapus Langsung Tanpa Menyimpan 🗑️
            </button>
            <button
              disabled={cleaning}
              onClick={() => setCleanupModalOpen(false)}
              className="w-full rounded-full border border-stone-200 bg-stone-50 hover:bg-stone-100 py-3 text-xs font-bold text-stone-600 transition-all duration-200"
            >
              Batal
            </button>
          </div>
        </div>
      </ModalDialog>
    </div>
  );
}
