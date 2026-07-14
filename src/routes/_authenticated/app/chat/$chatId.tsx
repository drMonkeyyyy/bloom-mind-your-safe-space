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
      if (!id) return null;
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

  const { data: chatUsage } = useQuery({
    queryKey: ["total-chat-usage", user?.id],
    enabled: !!user && profile?.plan === "free",
    queryFn: async () => {
      const { count } = await supabase
        .from("messages")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user!.id)
        .eq("role", "assistant");
      return count ?? 0;
    },
  });

  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [generatingJournal, setGeneratingJournal] = useState(false);
  const [panicMode, setPanicMode] = useState(false);
  const isLimitReached = profile?.plan === "free" && ((chatUsage ?? 0) >= 10 || panicMode);
  const [cleanupModalOpen, setCleanupModalOpen] = useState(false);
  const [cleaning, setCleaning] = useState(false);
  const [cleanupSnoozed, setCleanupSnoozed] = useState(() => {
    const val = localStorage.getItem(`chat_cleanup_snoozed_${chatId}`);
    if (!val) return false;
    const snoozeTime = parseInt(val, 10);
    const durationVal = localStorage.getItem(`chat_cleanup_snooze_duration_${chatId}`);
    const duration = durationVal ? parseInt(durationVal, 10) : 24 * 60 * 60 * 1000;
    return Date.now() - snoozeTime < duration;
  });

  const snoozeCleanup = () => {
    const warnedTime = warnedAt || Date.now();
    const diff = Date.now() - warnedTime;
    const remainingDays = 30 - Math.floor(diff / (24 * 60 * 60 * 1000));
    
    let snoozeDurationMs = 24 * 60 * 60 * 1000; // default 1 day
    let message = "Peringatan pembersihan ditunda sampai besok ⏰";
    
    if (remainingDays > 7) {
      snoozeDurationMs = 7 * 24 * 60 * 60 * 1000; // 1 week
      message = "Peringatan pembersihan ditunda selama 1 minggu karena sisa waktu masih banyak ⏰";
    }
    
    localStorage.setItem(`chat_cleanup_snoozed_${chatId}`, Date.now().toString());
    localStorage.setItem(`chat_cleanup_snooze_duration_${chatId}`, snoozeDurationMs.toString());
    setCleanupSnoozed(true);
    toast.info(message);
  };

  const [warnedAt, setWarnedAt] = useState<number | null>(() => {
    const val = localStorage.getItem(`chat_cleanup_warned_at_${chatId}`);
    return val ? parseInt(val, 10) : null;
  });

  const scrollRef = useRef<HTMLDivElement>(null);
  
  // Detect if user has a 1-year annual premium subscription
  const isAnnual = !!(profile?.premium_end_date && profile?.premium_start_date && 
    (new Date(profile.premium_end_date).getTime() - new Date(profile.premium_start_date).getTime() > 60 * 24 * 60 * 60 * 1000));
  
  const cutoffDays = isAnnual ? 365 : 90;
  const oldMessagesCutoff = new Date(Date.now() - cutoffDays * 24 * 60 * 60 * 1000);
  const hasOldMessages = messages && messages.length > 0 && messages.some(m => new Date(m.created_at) < oldMessagesCutoff);

  useEffect(() => {
    if (hasOldMessages && !warnedAt) {
      const now = Date.now();
      localStorage.setItem(`chat_cleanup_warned_at_${chatId}`, now.toString());
      setWarnedAt(now);
    }
  }, [hasOldMessages, warnedAt, chatId]);

  useEffect(() => {
    if (hasOldMessages && warnedAt) {
      const diff = Date.now() - warnedAt;
      if (diff >= 30 * 24 * 60 * 60 * 1000) {
        const autoDelete = async () => {
          try {
            const keepDays = isAnnual ? 365 : 30;
            const historyCutoff = new Date(Date.now() - keepDays * 24 * 60 * 60 * 1000);
            await supabase
              .from("messages")
              .delete()
              .eq("chat_id", chatId)
              .lt("created_at", historyCutoff.toISOString());
            localStorage.removeItem(`chat_cleanup_warned_at_${chatId}`);
            localStorage.removeItem(`chat_cleanup_snoozed_${chatId}`);
            localStorage.removeItem(`chat_cleanup_snooze_duration_${chatId}`);
            setWarnedAt(null);
            setCleanupSnoozed(false);
            refetch();
            toast.info(`Riwayat obrolan lama (di atas ${isAnnual ? '1 tahun' : '1 bulan'}) telah dihapus otomatis untuk menghemat ruang 🧹`);
          } catch (e) {
            console.error(e);
          }
        };
        autoDelete();
      }
    }
  }, [hasOldMessages, warnedAt, chatId, isAnnual]);

  const clearOldMessages = async (exportFormat: 'pdf' | 'json' | 'none') => {
    if (!user || isNew) return;
    setCleaning(true);
    try {
      const keepDays = isAnnual ? 365 : 30;
      const historyCutoff = new Date(Date.now() - keepDays * 24 * 60 * 60 * 1000);
      const messagesToExport = messages?.filter(m => new Date(m.created_at) < historyCutoff) ?? [];

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
        .lt("created_at", historyCutoff.toISOString());
        
      if (error) throw error;
      localStorage.removeItem(`chat_cleanup_warned_at_${chatId}`);
      localStorage.removeItem(`chat_cleanup_snoozed_${chatId}`);
      localStorage.removeItem(`chat_cleanup_snooze_duration_${chatId}`);
      setWarnedAt(null);
      setCleanupSnoozed(false);
      toast.success(`Pesan lama (di atas ${isAnnual ? '1 tahun' : '1 bulan'}) berhasil dibersihkan! 🌿`);
      setCleanupModalOpen(false);
      refetch();
    } catch (err: any) {
      toast.error(err.message || "Gagal menghapus pesan lama");
    } finally {
      setCleaning(false);
    }
  };

  useEffect(() => { scrollRef.current?.scrollTo({ top: 999999, behavior: "smooth" }); }, [messages, sending]);

  const rawComp = chat?.custom_companion_id || customCompanionIdParam
    ? customCompanion
      ? {
          name: customCompanion.name,
          emoji: customCompanion.emoji || "👤",
          tone: customCompanion.tone,
          avatar_url: customCompanion.avatar_url,
        }
      : null
    : COMPANIONS.find((c) => c.key === activeCompanion);

  const comp = (() => {
    if (!rawComp) return null;
    if (!chat?.custom_companion_id && !customCompanionIdParam && activeCompanion) {
      const customAvatar = localStorage.getItem(`custom_avatar_default_${activeCompanion}`);
      const customEmoji = localStorage.getItem(`custom_emoji_default_${activeCompanion}`);
      return {
        ...rawComp,
        avatar_url: customAvatar || null,
        emoji: customAvatar ? "" : (customEmoji || rawComp.emoji),
      };
    }
    return rawComp;
  })() as {
    name: string;
    emoji: string;
    tone: string;
    avatar_url?: string | null;
  } | null;

  const submit = async (e?: React.FormEvent, override?: string) => {
    e?.preventDefault();
    const text = override ?? input.trim();
    if (!text || sending || isLimitReached) return;
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
      qc.invalidateQueries({ queryKey: ["total-chat-usage", user?.id] });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes("DAILY_LIMIT")) {
        toast.error("Batas chat gratis Anda sudah habis. Upgrade ke Premium untuk chat tanpa batas.");
        setPanicMode(true);
      }
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
    <div className="flex h-[calc(100dvh-11.5rem)] flex-col lg:h-[calc(100dvh-6rem)]">
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
        {hasOldMessages && !cleanupSnoozed && (
          <div className="flex items-center justify-between gap-3 rounded-2xl bg-amber-50/70 border border-amber-100/50 p-3.5 text-xs text-amber-900 animate-slide-up mb-2">
            <div className="flex items-center gap-2">
              <span className="text-base select-none">⏳</span>
              <p className="leading-relaxed">
                Riwayat obrolan sudah berjalan lebih dari <strong>{isAnnual ? "1 tahun" : "3 bulan"}</strong>. Bersihkan pesan lama untuk menghemat ruang?
                {warnedAt && (() => {
                  const diff = Date.now() - warnedAt;
                  const remainingDays = 30 - Math.floor(diff / (24 * 60 * 60 * 1000));
                  const dayText = remainingDays <= 1 ? "kurang dari 24 jam" : `${remainingDays} hari`;
                  return (
                    <strong className="text-rose-600 block mt-0.5">
                      ⚠️ Data lama akan dihapus otomatis dalam {dayText} lagi jika tidak disimpan!
                    </strong>
                  );
                })()}
              </p>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={() => setCleanupModalOpen(true)}
                className="rounded-full bg-amber-600 hover:bg-amber-700 px-3 py-1 font-bold text-white transition-all active:scale-95 shadow-sm"
              >
                Bersihkan 🧹
              </button>
              <button
                onClick={snoozeCleanup}
                className="rounded-full border border-amber-300/40 hover:bg-amber-100/50 p-1 text-amber-900 transition-all active:scale-95"
                title="Tunda sampai besok"
              >
                ✕
              </button>
            </div>
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
          <div className="flex justify-start items-end gap-2">
            {/* Companion avatar */}
            <div className="shrink-0 mb-0.5">
              {comp?.avatar_url ? (
                <img src={comp.avatar_url} alt={comp.name} className="w-7 h-7 rounded-full object-cover ring-1 ring-border" />
              ) : (
                <div className="w-7 h-7 rounded-full bg-primary-soft/70 flex items-center justify-center text-base ring-1 ring-border/50">
                  {comp?.emoji ?? "🌿"}
                </div>
              )}
            </div>
            {/* Wave typing bubble */}
            <div className="rounded-2xl rounded-bl-sm bg-card px-4 py-3 ring-1 ring-border shadow-card">
              <span className="inline-flex items-center gap-1.5" aria-label="AI sedang mengetik">
                {[0, 150, 300].map((delay) => (
                  <span
                    key={delay}
                    className="h-2 w-2 rounded-full bg-primary/60"
                    style={{
                      animation: `wave-dot 1.1s ease-in-out ${delay}ms infinite`,
                    }}
                  />
                ))}
              </span>
            </div>
          </div>
        )}
        {isLimitReached && (
          <PaywallCard 
            title="Batas Chat Gratis Tercapai" 
            desc="Kamu sudah menggunakan jatah 10 balasan gratis selama masa uji coba. Buka pendamping kustom dan chat tanpa batas dengan berlangganan Premium." 
          />
        )}
      </div>

      <div className="border-t border-border pt-3">
        <div className="mb-2 flex gap-2">
          <button 
            disabled={isLimitReached} 
            onClick={()=>submit(undefined, "Aku sedang cemas/panik. Tolong bantu aku menenangkan diri.")} 
            className="rounded-full border border-red-200/50 bg-red-50/70 hover:bg-red-50 text-red-700 px-3 py-1.5 text-xs font-semibold shadow-sm transition-all duration-200 active:scale-95 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            🚨 Aku panik/cemas
          </button>
          {showLimitWarning && (
            <span className="ml-auto text-[10px] font-semibold text-muted-foreground self-center flex items-center gap-1.5 bg-cream-deep/60 px-3 py-1 rounded-full border border-border/40">
              {isLimitReached ? (
                <>
                  <span className="h-2 w-2 rounded-full bg-red-500 inline-block" />
                  Sisa kuota chat gratis: 0/10
                </>
              ) : (
                <>
                  <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse inline-block" />
                  Sisa kuota chat gratis: {Math.max(0, 10 - (chatUsage ?? 0))}/10
                </>
              )}
            </span>
          )}
        </div>
        <form onSubmit={submit} className="flex gap-2">
          <textarea 
            value={input} 
            onChange={(e)=>setInput(e.target.value)} 
            rows={2} 
            placeholder={isLimitReached ? "🔒 Kuota chat gratis sudah habis. Upgrade ke Premium untuk melanjutkan." : "Tulis perasaanmu…"}
            disabled={sending || isLimitReached}
            maxLength={2000}
            onKeyDown={(e)=>{ if (e.key==="Enter" && !e.shiftKey) { e.preventDefault(); if (!isLimitReached) submit(); } }}
            className="flex-1 resize-none rounded-2xl border border-border bg-card px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-75 disabled:bg-stone-50/40" 
          />
          <button 
            disabled={sending || isLimitReached || !input.trim()} 
            className="self-end rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground shadow-peach disabled:opacity-50 cursor-pointer"
          >
            Kirim
          </button>
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
            Pesan obrolan yang lebih lama dari 1 bulan (30 hari) akan dihapus secara permanen untuk mengosongkan ruang penyimpanan database. Catatan 1 bulan terakhir tetap disimpan di aplikasi.
          </p>
          <div className="rounded-2xl bg-amber-50 border border-amber-100 p-3.5 flex gap-3 text-amber-950">
            <span className="text-2xl select-none">💡</span>
            <div className="text-xs leading-relaxed">
              <p className="font-bold text-amber-900 mb-0.5 font-display">Saran Penyimpanan</p>
              <p>Apakah Anda ingin menyimpan seluruh riwayat chat yang akan dihapus (di atas 1 bulan) sebagai **PDF** atau mendownload file **JSON** di laptop Anda terlebih dahulu?</p>
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
