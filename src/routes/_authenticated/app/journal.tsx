import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { BottomSheet, ModalDialog } from "@/components/app/BottomSheet";
import { EmptyState } from "@/components/app/EmptyState";
import { useProfile } from "@/hooks/use-profile";
import { exportJournalPDF } from "@/lib/export-pdf";

interface TimeCapsule {
  id: string;
  createdAt: string;
  unlockDate: string;
  message: string;
}

export const Route = createFileRoute("/_authenticated/app/journal")({
  component: JournalPage,
});

const COMPANION_LABELS: Record<string, string> = {
  ibu: "👩‍👦 Ibu",
  ayah: "👨‍👦 Ayah",
  kakak_perempuan: "👩 Kakak",
  kakak_laki: "👨 Kakak",
  sahabat: "🤗 Sahabat",
  partner: "💖 Partner",
  coach: "🧠 Coach",
};

/* ─── Cozy Diary Definitions ───────────────────────────────────── */
const MOOD_OPTIONS = [
  { label: "Bahagia", emoji: "😊", theme: "peach", desc: "Hari yang menyenangkan & ceria!" },
  { label: "Tenang", emoji: "😌", theme: "mint", desc: "Damai, rileks, dan tenteram." },
  { label: "Sedih", emoji: "😢", theme: "ocean", desc: "Perasaan biru, sepi, atau haru." },
  { label: "Cemas", emoji: "😰", theme: "lavender", desc: "Gelisah, khawatir, atau tegang." },
  { label: "Marah", emoji: "😡", theme: "coral", desc: "Kesal, dongkol, atau jengkel." },
  { label: "Lelah", emoji: "😴", theme: "cozy", desc: "Energi habis, capek, butuh istirahat." },
];

const STICKERS = [
  { label: "Santai", emoji: "☕" },
  { label: "Belajar/Kerja", emoji: "🎒" },
  { label: "Olahraga", emoji: "🏃" },
  { label: "Makan Enak", emoji: "🍕" },
  { label: "Belanja", emoji: "🛍️" },
  { label: "Nonton", emoji: "🎬" },
  { label: "Rehat", emoji: "🛌" },
  { label: "Ngobrol", emoji: "💬" },
  { label: "Musik", emoji: "🎵" },
];

const THEME_STYLES: Record<string, { bg: string; border: string; accent: string; tagBg: string; text: string; headerBg: string }> = {
  peach: {
    bg: "linear-gradient(135deg, oklch(0.99 0.012 70) 0%, oklch(0.975 0.025 70) 100%)",
    border: "border-orange-200/50",
    accent: "border-l-[5px] border-l-orange-400/90",
    tagBg: "bg-orange-100/60 text-orange-800 font-bold",
    text: "text-orange-950",
    headerBg: "linear-gradient(135deg, oklch(0.98 0.035 70), oklch(0.95 0.05 60))"
  },
  mint: {
    bg: "linear-gradient(135deg, oklch(0.99 0.008 140) 0%, oklch(0.975 0.015 140) 100%)",
    border: "border-emerald-200/50",
    accent: "border-l-[5px] border-l-emerald-400/90",
    tagBg: "bg-emerald-100/60 text-emerald-800 font-bold",
    text: "text-emerald-950",
    headerBg: "linear-gradient(135deg, oklch(0.97 0.02 140), oklch(0.94 0.035 150))"
  },
  ocean: {
    bg: "linear-gradient(135deg, oklch(0.99 0.008 220) 0%, oklch(0.97 0.018 220) 100%)",
    border: "border-sky-200/50",
    accent: "border-l-[5px] border-l-sky-400/90",
    tagBg: "bg-sky-100/60 text-sky-800 font-bold",
    text: "text-sky-950",
    headerBg: "linear-gradient(135deg, oklch(0.96 0.02 220), oklch(0.93 0.045 230))"
  },
  lavender: {
    bg: "linear-gradient(135deg, oklch(0.99 0.008 280) 0%, oklch(0.97 0.02 280) 100%)",
    border: "border-purple-200/50",
    accent: "border-l-[5px] border-l-purple-400/90",
    tagBg: "bg-purple-100/60 text-purple-800 font-bold",
    text: "text-purple-950",
    headerBg: "linear-gradient(135deg, oklch(0.96 0.02 280), oklch(0.93 0.04 290))"
  },
  coral: {
    bg: "linear-gradient(135deg, oklch(0.99 0.01 15) 0%, oklch(0.97 0.025 15) 100%)",
    border: "border-rose-200/50",
    accent: "border-l-[5px] border-l-rose-400/90",
    tagBg: "bg-rose-100/60 text-rose-800 font-bold",
    text: "text-rose-950",
    headerBg: "linear-gradient(135deg, oklch(0.96 0.04 15), oklch(0.92 0.06 20))"
  },
  cozy: {
    bg: "linear-gradient(135deg, oklch(0.99 0.003 90) 0%, oklch(0.97 0.006 90) 100%)",
    border: "border-slate-200/50",
    accent: "border-l-[5px] border-l-slate-400/90",
    tagBg: "bg-slate-100/70 text-slate-800 font-bold",
    text: "text-slate-950",
    headerBg: "linear-gradient(135deg, oklch(0.95 0.01 100), oklch(0.91 0.02 90))"
  },
  default: {
    bg: "linear-gradient(135deg, oklch(0.997 0.001 90) 0%, oklch(0.985 0.004 90) 100%)",
    border: "border-border/60",
    accent: "border-l-[4px] border-l-primary/45",
    tagBg: "bg-muted text-muted-foreground font-bold",
    text: "text-foreground",
    headerBg: "linear-gradient(140deg, oklch(0.977 0.008 85) 0%, oklch(0.96 0.04 70) 50%, oklch(0.97 0.025 50) 100%)"
  }
};

const getThemeByEmotion = (emotion: string | null) => {
  if (!emotion) return "default";
  const clean = emotion.trim().toLowerCase();
  if (clean.includes("bahagia") || clean.includes("senang")) return "peach";
  if (clean.includes("tenang") || clean.includes("damai")) return "mint";
  if (clean.includes("sedih") || clean.includes("nangis")) return "ocean";
  if (clean.includes("cemas") || clean.includes("takut") || clean.includes("khawatir")) return "lavender";
  if (clean.includes("marah") || clean.includes("kesal")) return "coral";
  if (clean.includes("lelah") || clean.includes("capek") || clean.includes("ngantuk") || clean.includes("burnout")) return "cozy";
  return "default";
};

function groupByMonth(items: any[]) {
  const groups: Record<string, any[]> = {};
  for (const item of items) {
    const key = new Date(item.created_at).toLocaleDateString("id-ID", { month: "long", year: "numeric" });
    if (!groups[key]) groups[key] = [];
    groups[key].push(item);
  }
  return groups;
}

function CozyDiaryBook({ size = "md" }: { size?: "sm" | "md" }) {
  const isSm = size === "sm";
  return (
    <div className={`relative flex items-center justify-center ${isSm ? "w-20 h-20 shrink-0" : "w-28 h-28 mb-5"}`}>
      {/* Self-contained styling for particle floats with size-specific keyframes to prevent collision */}
      <style>{`
        @keyframes float-diary-md-1 {
          0% { transform: translate(0, 10px) rotate(0deg) scale(0.6); opacity: 0; }
          15% { opacity: 0.8; }
          85% { opacity: 0.8; }
          100% { transform: translate(-20px, -55px) rotate(-15deg) scale(1.1); opacity: 0; }
        }
        @keyframes float-diary-md-2 {
          0% { transform: translate(0, 10px) rotate(0deg) scale(0.5); opacity: 0; }
          20% { opacity: 0.8; }
          80% { opacity: 0.8; }
          100% { transform: translate(20px, -65px) rotate(20deg) scale(1); opacity: 0; }
        }
        @keyframes float-diary-md-3 {
          0% { transform: translate(0, 10px) rotate(0deg) scale(0.6); opacity: 0; }
          10% { opacity: 0.9; }
          90% { opacity: 0.9; }
          100% { transform: translate(-8px, -45px) rotate(10deg) scale(1.1); opacity: 0; }
        }
        
        @keyframes float-diary-sm-1 {
          0% { transform: translate(0, 4px) rotate(0deg) scale(0.5); opacity: 0; }
          15% { opacity: 0.85; }
          80% { opacity: 0.85; }
          100% { transform: translate(-10px, -24px) rotate(-10deg) scale(0.9); opacity: 0; }
        }
        @keyframes float-diary-sm-2 {
          0% { transform: translate(0, 4px) rotate(0deg) scale(0.4); opacity: 0; }
          20% { opacity: 0.85; }
          75% { opacity: 0.85; }
          100% { transform: translate(10px, -28px) rotate(15deg) scale(0.8); opacity: 0; }
        }
        @keyframes float-diary-sm-3 {
          0% { transform: translate(0, 4px) rotate(0deg) scale(0.5); opacity: 0; }
          10% { opacity: 0.9; }
          70% { opacity: 0.9; }
          100% { transform: translate(-4px, -20px) rotate(5deg) scale(0.9); opacity: 0; }
        }

        @keyframes book-sway-gentle {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-3px) rotate(1.5deg); }
        }
        
        .anim-diary-md-p1 { animation: float-diary-md-1 6s ease-in-out infinite; }
        .anim-diary-md-p2 { animation: float-diary-md-2 8s ease-in-out infinite; animation-delay: 2s; }
        .anim-diary-md-p3 { animation: float-diary-md-3 7s ease-in-out infinite; animation-delay: 3.8s; }
        .anim-diary-md-p4 { animation: float-diary-md-1 9s ease-in-out infinite; animation-delay: 1s; }
        .anim-diary-md-p5 { animation: float-diary-md-2 7.5s ease-in-out infinite; animation-delay: 4.8s; }

        .anim-diary-sm-p1 { animation: float-diary-sm-1 5s ease-in-out infinite; }
        .anim-diary-sm-p2 { animation: float-diary-sm-2 6.5s ease-in-out infinite; animation-delay: 1.5s; }
        .anim-diary-sm-p3 { animation: float-diary-sm-3 5.5s ease-in-out infinite; animation-delay: 2.8s; }
        .anim-diary-sm-p4 { animation: float-diary-sm-1 7.5s ease-in-out infinite; animation-delay: 0.8s; }
        .anim-diary-sm-p5 { animation: float-diary-sm-2 6s ease-in-out infinite; animation-delay: 3.5s; }

        .anim-book-sway {
          animation: book-sway-gentle 4.5s ease-in-out infinite;
          display: inline-block;
          transform-origin: center center;
        }
      `}</style>

      {/* Floating particles from book */}
      <div className="absolute inset-0 pointer-events-none overflow-visible select-none z-0">
        <span className={`absolute ${isSm ? "bottom-10 left-6 text-[10px] anim-diary-sm-p1" : "bottom-12 left-8 text-xs anim-diary-md-p1"} opacity-0`}>✨</span>
        <span className={`absolute ${isSm ? "bottom-11 right-6 text-[11px] anim-diary-sm-p2" : "bottom-14 right-8 text-sm anim-diary-md-p2"} opacity-0`}>🍃</span>
        <span className={`absolute ${isSm ? "bottom-9 left-8 text-[11px] anim-diary-sm-p3" : "bottom-10 left-12 text-sm anim-diary-md-p3"} opacity-0`}>✍️</span>
        <span className={`absolute ${isSm ? "bottom-10 right-8 text-[10px] anim-diary-sm-p4" : "bottom-12 right-12 text-xs anim-diary-md-p4"} opacity-0`}>🌸</span>
        <span className={`absolute ${isSm ? "bottom-8 left-1/2 text-[10px] anim-diary-sm-p5" : "bottom-8 left-1/2 text-xs anim-diary-md-p5"} opacity-0`}>✨</span>
      </div>

      {/* Book cover / glow effect background */}
      <div className={`absolute bg-[radial-gradient(circle_at_center,_rgba(251,191,36,0.25)_0%,_transparent_75%)] pointer-events-none z-0 ${isSm ? "w-16 h-16" : "w-20 h-20"}`} />

      {/* Open diary SVG */}
      <svg viewBox="0 0 120 100" className={`${isSm ? "w-18 h-18" : "w-24 h-24"} drop-shadow-md select-none relative z-10 transition-transform duration-500 hover:scale-110 anim-book-sway`}>
        {/* Book Cover Background (3D thickness shadow) */}
        <path d="M 8 23 C 25 15, 56 25, 60 27 C 64 25, 95 15, 112 23 L 112 88 C 95 80, 64 90, 60 88 C 56 90, 25 80, 8 88 Z" fill="oklch(0.35 0.045 40)" />
        {/* Main Cover */}
        <path d="M 10 20 C 25 12, 56 22, 60 24 C 64 22, 95 12, 110 20 L 110 85 C 95 77, 64 87, 60 85 C 56 87, 25 77, 10 85 Z" fill="oklch(0.48 0.07 45)" />
        
        {/* Left Page Pages Thickness */}
        <path d="M 14 18 C 28 12, 55 20, 58 22 L 58 81 C 55 79, 28 71, 14 77 Z" fill="oklch(0.92 0.015 80)" />
        {/* Left Main Page */}
        <path d="M 16 16 C 29 10, 56 18, 58 20 L 58 79 C 56 77, 29 69, 16 75 Z" fill="oklch(0.98 0.01 95)" />
        
        {/* Right Page Pages Thickness */}
        <path d="M 106 18 C 92 12, 65 20, 62 22 L 62 81 C 65 79, 92 71, 106 77 Z" fill="oklch(0.92 0.015 80)" />
        {/* Right Main Page */}
        <path d="M 104 16 C 91 10, 64 18, 62 20 L 62 79 C 64 77, 91 69, 104 75 Z" fill="oklch(0.98 0.01 95)" />
        
        {/* Ribbon Bookmark (Gold) */}
        <path d="M 59 21 L 62 21 L 62 90 L 59 90 Z" fill="oklch(0.78 0.13 70)" />
        <path d="M 59 90 L 60.5 87 L 62 90 Z" fill="oklch(0.68 0.13 70)" />

        {/* Lined Journal Lines */}
        {/* Left Page Lines */}
        <line x1="22" y1="30" x2="52" y2="34" stroke="oklch(0.85 0.015 90)" strokeWidth="0.8" />
        <line x1="22" y1="38" x2="52" y2="42" stroke="oklch(0.85 0.015 90)" strokeWidth="0.8" />
        <line x1="22" y1="46" x2="52" y2="50" stroke="oklch(0.85 0.015 90)" strokeWidth="0.8" />
        <line x1="22" y1="54" x2="52" y2="58" stroke="oklch(0.85 0.015 90)" strokeWidth="0.8" />
        <line x1="22" y1="62" x2="52" y2="66" stroke="oklch(0.85 0.015 90)" strokeWidth="0.8" />

        {/* Right Page Lines */}
        <line x1="68" y1="34" x2="98" y2="30" stroke="oklch(0.85 0.015 90)" strokeWidth="0.8" />
        <line x1="68" y1="42" x2="98" y2="38" stroke="oklch(0.85 0.015 90)" strokeWidth="0.8" />
        <line x1="68" y1="50" x2="98" y2="46" stroke="oklch(0.85 0.015 90)" strokeWidth="0.8" />
        <line x1="68" y1="58" x2="98" y2="54" stroke="oklch(0.85 0.015 90)" strokeWidth="0.8" />
        <line x1="68" y1="66" x2="98" y2="62" stroke="oklch(0.85 0.015 90)" strokeWidth="0.8" />

        {/* Botanical Vine Detail on Right Page */}
        <path d="M 98 62 Q 95 68 90 70" fill="none" stroke="oklch(0.71 0.045 160)" strokeWidth="1.2" strokeLinecap="round" />
        <path d="M 95 68 Q 93 69 92 68 Z" fill="oklch(0.71 0.045 160)" />
        <path d="M 92 70 Q 90 71 89 70 Z" fill="oklch(0.80 0.05 165)" />
      </svg>
    </div>
  );
}


function JournalPage() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [form, setForm] = useState({
    summary: "",
    main_emotion: "",
    main_trigger: "",
    lesson: "",
    gratitude: "",
    tomorrow_focus: ""
  });
  const [editId, setEditId] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [selectedJournal, setSelectedJournal] = useState<any | null>(null);
  const [savedAnim, setSavedAnim] = useState(false);

  const { data: profile } = useProfile(user?.id);
  const companionLabel = COMPANION_LABELS[profile?.selected_companion || "sahabat"] || "🤗 Sahabat";

  // Time Capsule setup
  const [capsules, setCapsules] = useState<TimeCapsule[]>([]);
  const [capsuleOpen, setCapsuleOpen] = useState(false);
  const [newCapsuleText, setNewCapsuleText] = useState("");
  const [newCapsuleTarget, setNewCapsuleTarget] = useState("1month");
  const [customDate, setCustomDate] = useState("");
  const [viewCapsule, setViewCapsule] = useState<TimeCapsule | null>(null);

  useEffect(() => {
    if (!user) return;
    const data = localStorage.getItem(`bloom_time_capsules_${user.id}`);
    if (data) {
      setCapsules(JSON.parse(data));
    }
  }, [user]);

  const saveCapsule = () => {
    if (!user || !newCapsuleText.trim()) return;
    
    let targetDate = new Date();
    if (newCapsuleTarget === "1min") {
      targetDate.setMinutes(targetDate.getMinutes() + 1);
    } else if (newCapsuleTarget === "3mins") {
      targetDate.setMinutes(targetDate.getMinutes() + 3);
    } else if (newCapsuleTarget === "1month") {
      targetDate.setMonth(targetDate.getMonth() + 1);
    } else if (newCapsuleTarget === "3months") {
      targetDate.setMonth(targetDate.getMonth() + 3);
    } else if (newCapsuleTarget === "6months") {
      targetDate.setMonth(targetDate.getMonth() + 6);
    } else if (newCapsuleTarget === "custom") {
      if (!customDate) {
        toast.error("Silakan pilih tanggal kustom!");
        return;
      }
      targetDate = new Date(customDate);
      targetDate.setHours(23, 59, 59, 999);
      if (targetDate.getTime() <= Date.now()) {
        toast.error("Tanggal kustom harus di masa depan!");
        return;
      }
    }

    const newCapsule = {
      id: Math.random().toString(36).substring(2, 9),
      createdAt: new Date().toISOString(),
      unlockDate: targetDate.toISOString(),
      message: newCapsuleText,
    };

    const updated = [newCapsule, ...capsules];
    setCapsules(updated);
    localStorage.setItem(`bloom_time_capsules_${user.id}`, JSON.stringify(updated));
    setNewCapsuleText("");
    setCustomDate("");
    setCapsuleOpen(false);
    toast.success("Kapsul waktu berhasil dikunci! 🔒");
  };

  const getCapsuleStatus = (unlockDateStr: string) => {
    const diff = new Date(unlockDateStr).getTime() - new Date().getTime();
    if (diff <= 0) return { locked: false, label: "Siap Dibuka!" };
    
    const minutes = Math.ceil(diff / 60000);
    if (minutes < 60) return { locked: true, label: `${minutes} menit lagi` };
    
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return { locked: true, label: `${days} hari lagi` };
  };

  const { data: items } = useQuery({
    queryKey: ["journals", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.from("journals").select("*").eq("user_id", user!.id).order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  const reset = () => {
    setForm({ summary: "", main_emotion: "", main_trigger: "", lesson: "", gratitude: "", tomorrow_focus: "" });
    setEditId(null);
  };

  const isPremium = profile?.plan === "premium";

  const save = async () => {
    if (!user) return;
    if (!form.summary.trim()) {
      toast.error("Harap isi cerita diary Anda hari ini!");
      return;
    }
    if (!form.main_emotion) {
      toast.error("Harap pilih mood perasaan Anda hari ini!");
      return;
    }
    if (!isPremium && !editId && items && items.length >= 2) {
      toast.error("Batas Gratis Tercapai! Paket gratis hanya dapat menulis maksimal 2 entri diary. Upgrade ke Premium untuk menulis sepuasnya.");
      return;
    }

    const payload = { ...form, user_id: user.id, source: "manual" as const };
    const { error } = editId
      ? await supabase.from("journals").update(payload).eq("id", editId)
      : await supabase.from("journals").insert(payload);
    if (error) { toast.error(error.message); return; }
    
    setSavedAnim(true);
    toast.success(editId ? "Diary diperbarui." : "Diary tersimpan 📓");
    setSheetOpen(false);
    reset();
    setTimeout(() => setSavedAnim(false), 1000);
    qc.invalidateQueries({ queryKey: ["journals", user.id] });
    qc.invalidateQueries({ queryKey: ["last-journal", user.id] });
  };

  const remove = async (id: string) => {
    await supabase.from("journals").delete().eq("id", id);
    setDeleteConfirm(null);
    qc.invalidateQueries({ queryKey: ["journals", user!.id] });
    qc.invalidateQueries({ queryKey: ["last-journal", user!.id] });
    toast.success("Diary dihapus.");
  };

  const edit = (j: NonNullable<typeof items>[number]) => {
    setEditId(j.id);
    setForm({
      summary: j.summary ?? "",
      main_emotion: j.main_emotion ?? "",
      main_trigger: j.main_trigger ?? "",
      lesson: j.lesson ?? "",
      gratitude: j.gratitude ?? "",
      tomorrow_focus: j.tomorrow_focus ?? ""
    });
    setSheetOpen(true);
  };

  const toggleSticker = (emoji: string, label: string) => {
    const current = form.main_trigger ? form.main_trigger.split(", ").filter(Boolean) : [];
    const item = `${emoji} ${label}`;
    let next: string[];
    if (current.includes(item)) {
      next = current.filter(x => x !== item);
    } else {
      next = [...current, item];
    }
    setForm({ ...form, main_trigger: next.join(", ") });
  };

  const groups = groupByMonth(items ?? []);

  return (
    <div className="space-y-6">
      {/* ── Custom Notebook Styles ── */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes diary-bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-3px); }
        }
        .animate-diary-bounce {
          animation: diary-bounce 3s infinite ease-in-out;
        }
        .notebook-stitch {
          background-image: radial-gradient(circle, oklch(0.45 0.05 70 / 0.15) 1px, transparent 1px);
          background-size: 8px 8px;
        }
        @keyframes float-capsule {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
        .animate-float-capsule {
          animation: float-capsule 2.5s infinite ease-in-out;
        }
        @keyframes lock-shake {
          0%, 100% { transform: rotate(0deg); }
          20% { transform: rotate(-8deg); }
          40% { transform: rotate(6deg); }
          60% { transform: rotate(-5deg); }
          80% { transform: rotate(4deg); }
        }
        .hover-lock-shake:hover .lock-icon {
          animation: lock-shake 0.4s ease-in-out;
        }
      `}} />

      {/* Diary Canvas Binder Cover Header */}
      <div
        className="relative overflow-hidden rounded-[2rem] px-7 py-7 shadow-elevated border-2 border-amber-950/10"
        style={{
          background: "linear-gradient(135deg, oklch(0.35 0.06 65) 0%, oklch(0.25 0.04 60) 100%)",
        }}
      >
        {/* Binder Stitch Visual */}
        <div className="absolute left-4 top-0 bottom-0 w-3 border-r border-dashed border-white/20" />
        <div className="absolute right-6 -top-6 h-36 w-36 rounded-full pointer-events-none bg-white/5 blur-3xl animate-pulse" />

        <div className="relative pl-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <CozyDiaryBook size="sm" />
            <div>
              <h1 className="font-display text-2xl font-bold text-white tracking-wide">My Personal Diary</h1>
              <p className="mt-1 text-xs text-stone-300 font-medium">Buku harian rahasiamu, aman & menenangkan.</p>
            </div>
          </div>
          <button
            onClick={() => { reset(); setSheetOpen(true); }}
            className={`relative overflow-hidden rounded-full px-5 py-2.5 text-xs font-bold shadow-soft transition-all duration-350 btn-spring ${
              savedAnim ? "bg-emerald-500 text-white" : "bg-cream-deep hover:bg-white text-stone-900 border border-stone-200"
            }`}
            aria-label="Tulis lembar baru"
          >
            {savedAnim ? "✓ Tersimpan!" : "✍️ Tulis Diary"}
          </button>
        </div>
      </div>



      {/* Cozy Reflection Banner (Permanent) */}
      <EmptyState
        icon={<CozyDiaryBook />}
        title={items?.length === 0 ? "Buku Diary Masih Kosong" : "Ruang Refleksi Diri"}
        description={
          items?.length === 0
            ? "Mulailah mengukir cerita hari ini. Setiap momen adalah lembaran berharga."
            : "Tuangkan perasaanmu, keluh kesah, atau momen bahagia hari ini untuk ketenangan jiwamu."
        }
        action={
          items?.length === 0
            ? { label: "Tulis Lembaran Pertama", onClick: () => { reset(); setSheetOpen(true); } }
            : undefined
        }
      />

      {/* ── TIME CAPSULE WIDGET ─────────────────────────────────── */}
      <div className="rounded-3xl bg-card p-5 ring-1 ring-border/60 shadow-card space-y-4 relative overflow-hidden">
        <div className="absolute -right-4 -bottom-4 text-6xl opacity-5 select-none pointer-events-none">💌</div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl shrink-0 select-none">✉️</span>
            <div>
              <h2 className="font-display text-sm font-bold text-foreground">Kapsul Waktu Diri Sendiri</h2>
              <p className="text-[10px] text-muted-foreground">Kunci surat harapan Anda untuk dibuka di masa depan.</p>
            </div>
          </div>
          <button
            onClick={() => setCapsuleOpen(true)}
            className="rounded-full bg-amber-50 hover:bg-amber-100/80 border border-amber-200 text-amber-900 px-3.5 py-1.5 text-xs font-bold transition-all duration-200 hover:shadow-sm active:scale-95"
          >
            🔒 Kirim Surat
          </button>
        </div>

        {capsules.length === 0 ? (
          <p className="text-[10px] text-muted-foreground/80 italic pl-1">Belum ada kapsul waktu yang Anda kunci.</p>
        ) : (
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            {capsules.map((cap) => {
              const status = getCapsuleStatus(cap.unlockDate);
              return (
                <button
                  key={cap.id}
                  onClick={() => {
                    if (status.locked) {
                      toast.info(`Sabar ya, surat rahasia ini baru bisa dibuka ${status.label} 🤫`);
                    } else {
                      setViewCapsule(cap);
                    }
                  }}
                  className={`flex shrink-0 items-center gap-2 rounded-2xl px-3.5 py-2 text-left border transition-all duration-300 shadow-sm ${
                    status.locked
                      ? "border-border/60 bg-cream-deep/35 text-muted-foreground hover-lock-shake hover:scale-[1.02] hover:bg-cream-deep/60 active:scale-95"
                      : "border-amber-300/40 bg-amber-50/70 text-foreground animate-glow-pulse animate-float-capsule hover:scale-105 active:scale-95 cursor-pointer"
                  }`}
                >
                  <span className={`text-base select-none ${status.locked ? "lock-icon" : ""}`}>
                    {status.locked ? "🔒" : "✉️"}
                  </span>
                  <div className="text-[10px] leading-tight select-none">
                    <p className="font-bold">{status.locked ? "Kapsul Terkunci" : "Siap Dibuka!"}</p>
                    <p className="text-[9px] opacity-75">{status.label}</p>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Diary history list */}
      {items && items.length > 0 && (
        <div className="space-y-6">
          {Object.entries(groups).map(([month, entries]) => (
            <div key={month} className="space-y-3">
              <div className="mb-2.5 flex items-center gap-3">
                <div className="h-px flex-1 bg-border/60" />
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground/60">{month}</p>
                <div className="h-px flex-1 bg-border/60" />
              </div>
              <div className="space-y-4">
                {entries.map((j, idx) => {
                  const themeKey = getThemeByEmotion(j.main_emotion);
                  const theme = THEME_STYLES[themeKey] || THEME_STYLES.default;

                  return (
                    <div
                      key={j.id}
                      className={`rounded-[2rem] p-5 border transition-all duration-250 hover:shadow-elevated hover:-translate-y-0.5 animate-slide-up ${theme.border}`}
                      style={{
                        background: theme.bg,
                        animationDelay: `${idx * 40}ms`,
                        ... (themeKey !== "default" ? { borderLeft: `5px solid ${theme.border.includes("orange") ? "oklch(0.75 0.13 70)" : theme.border.includes("emerald") ? "oklch(0.7 0.12 140)" : theme.border.includes("sky") ? "oklch(0.68 0.1 220)" : theme.border.includes("purple") ? "oklch(0.68 0.1 280)" : theme.border.includes("rose") ? "oklch(0.68 0.14 15)" : "oklch(0.6 0.02 90)"}` } : {})
                      }}
                    >
                      {/* Top Header info */}
                      <div className="flex items-start justify-between gap-3">
                        <div
                          className="min-w-0 flex-1 text-left cursor-pointer"
                          onClick={() => setSelectedJournal(j)}
                        >
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`text-xs font-extrabold ${theme.text}`}>
                              {new Date(j.created_at).toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long" })}
                            </span>
                            {j.main_emotion && (
                              <span className={`rounded-full px-2.5 py-0.5 text-[9px] font-bold ${theme.tagBg} shadow-sm border border-black/5`}>
                                {j.main_emotion}
                              </span>
                            )}
                            <span className={`rounded-full px-2 py-0.5 text-[8.5px] font-bold bg-white/80 border border-stone-200/50 text-stone-500`}>
                              {j.source === "from_chat" ? (COMPANION_LABELS[j.companion_key || "sahabat"] || "🤗 Sahabat") : "✍️ Manual"}
                            </span>
                          </div>

                          {/* Preview / Lined summary */}
                          {j.summary && (
                            <div className="mt-3">
                              <p className="text-xs font-semibold leading-relaxed text-stone-600 line-clamp-2 pl-1">
                                {j.summary}
                              </p>
                            </div>
                          )}
                        </div>

                        <div className="flex shrink-0 flex-col gap-1.5 pl-2">
                          <button
                            onClick={() => edit(j)}
                            className="rounded-full border border-stone-300 bg-white/95 px-3 py-1.5 text-[10px] font-bold text-stone-700 shadow-sm transition-all duration-200 hover:bg-stone-50 hover:scale-105 active:scale-95"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(j.id)}
                            className="rounded-full border border-destructive/20 bg-white/95 px-3 py-1.5 text-[10px] font-bold text-destructive shadow-sm transition-all duration-200 hover:bg-destructive/5 active:scale-95"
                          >
                            Hapus
                          </button>
                        </div>
                      </div>

                      {/* Display Stickers / Activities */}
                      {j.main_trigger && (
                        <div className="mt-3.5 flex flex-wrap gap-1.5 pl-1">
                          {j.main_trigger.split(", ").map((stick: string, sIdx: number) => (
                            <span key={sIdx} className="inline-flex items-center gap-1 rounded-xl bg-white/90 border border-stone-200/50 px-2 py-0.5 text-[10px] font-bold text-stone-700 shadow-sm">
                              {stick}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── WRITE DIARY DIALOG SHEET ───────────────────────────── */}
      <BottomSheet
        open={sheetOpen}
        onClose={() => { setSheetOpen(false); reset(); }}
        title={editId ? "📝 Edit Diary" : "✍️ Tulis Lembaran Baru"}
      >
        <div className="space-y-4 max-h-[75vh] overflow-y-auto scrollbar-none pr-1 pb-4">
          
          {/* Step 1: Mood Selector */}
          <div>
            <label className="mb-2 block text-xs font-bold text-stone-700 uppercase tracking-wider">
              1. Bagaimana perasaanmu hari ini? (Pilih Mood)
            </label>
            <div className="grid grid-cols-3 gap-2">
              {MOOD_OPTIONS.map((m) => {
                const isSelected = form.main_emotion.includes(m.label);
                return (
                  <button
                    key={m.label}
                    type="button"
                    onClick={() => setForm({ ...form, main_emotion: `${m.emoji} ${m.label}` })}
                    className={`p-2.5 rounded-2xl text-left border transition-all duration-350 active:scale-95 ${
                      isSelected
                        ? "border-amber-400 bg-amber-50/70 font-extrabold shadow-sm scale-[1.02]"
                        : "border-stone-200 bg-white hover:bg-stone-50 font-semibold"
                    }`}
                  >
                    <span className="text-2xl block select-none mb-1">{m.emoji}</span>
                    <span className="text-xs text-stone-900">{m.label}</span>
                    <span className="text-[8px] text-stone-500 font-medium block leading-tight mt-0.5">{m.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 2: Activity Stickers */}
          <div>
            <label className="mb-2 block text-xs font-bold text-stone-700 uppercase tracking-wider">
              2. Stiker Aktivitas Hari Ini (Bisa pilih lebih dari satu)
            </label>
            <div className="flex flex-wrap gap-2">
              {STICKERS.map((s) => {
                const currentList = form.main_trigger ? form.main_trigger.split(", ").filter(Boolean) : [];
                const itemStr = `${s.emoji} ${s.label}`;
                const isSelected = currentList.includes(itemStr);
                return (
                  <button
                    key={s.label}
                    type="button"
                    onClick={() => toggleSticker(s.emoji, s.label)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all duration-200 active:scale-95 ${
                      isSelected
                        ? "bg-amber-400 text-stone-900 shadow-sm scale-[1.02]"
                        : "bg-stone-100 hover:bg-stone-200/80 text-stone-700 border border-stone-200/40"
                    }`}
                  >
                    <span className="select-none">{s.emoji}</span>
                    <span>{s.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 3: Notebook Writing Area */}
          <div>
            <label className="mb-1.5 block text-xs font-bold text-stone-700 uppercase tracking-wider" htmlFor="diary-summary">
              3. Ceritakan harimu di sini...
            </label>
            <div className="relative rounded-2xl bg-stone-50/50 border border-stone-200 overflow-hidden shadow-inner focus-within:ring-2 focus-within:ring-amber-300">
              <textarea
                id="diary-summary"
                value={form.summary}
                onChange={(e) => setForm({ ...form, summary: e.target.value })}
                placeholder="Tulis apa saja yang ada di kepalamu saat ini... keluh kesah, hal lucu, kekhawatiran, atau kesuksesan kecil..."
                rows={7}
                className="w-full bg-transparent p-4 text-sm focus:outline-none resize-none placeholder:text-stone-400 font-medium leading-relaxed text-stone-700"
              />
            </div>
          </div>

          {/* Step 4: Reflexive Questions */}
          <div className="space-y-3 pt-2 border-t border-stone-200/50">
            <h3 className="text-xs font-bold text-stone-500 uppercase tracking-wider">4. Refleksi Tambahan (Opsional)</h3>
            
            <div>
              <label className="mb-1.5 flex items-center gap-1.5 text-xs font-bold text-stone-700" htmlFor="diary-gratitude">
                <span>🙏</span> Hal yang disyukuri hari ini?
              </label>
              <textarea
                id="diary-gratitude"
                value={form.gratitude}
                onChange={(e) => setForm({ ...form, gratitude: e.target.value })}
                placeholder="Hal kecil yang membuatmu tersenyum..."
                rows={2}
                className="w-full rounded-2xl border border-stone-200 bg-background px-4 py-3 text-xs resize-none placeholder:text-stone-400 focus:ring-1 focus:ring-amber-300 transition-all"
              />
            </div>

            <div>
              <label className="mb-1.5 flex items-center gap-1.5 text-xs font-bold text-stone-700" htmlFor="diary-lesson">
                <span>💡</span> Pelajaran berharga hari ini?
              </label>
              <textarea
                id="diary-lesson"
                value={form.lesson}
                onChange={(e) => setForm({ ...form, lesson: e.target.value })}
                placeholder="Apa pelajaran hidup berharga yang didapat?"
                rows={2}
                className="w-full rounded-2xl border border-stone-200 bg-background px-4 py-3 text-xs resize-none placeholder:text-stone-400 focus:ring-1 focus:ring-amber-300 transition-all"
              />
            </div>

            <div>
              <label className="mb-1.5 flex items-center gap-1.5 text-xs font-bold text-stone-700" htmlFor="diary-tomorrow">
                <span>🎯</span> Satu fokus untuk esok hari?
              </label>
              <textarea
                id="diary-tomorrow"
                value={form.tomorrow_focus}
                onChange={(e) => setForm({ ...form, tomorrow_focus: e.target.value })}
                placeholder="Satu niat baik untuk esok..."
                rows={2}
                className="w-full rounded-2xl border border-stone-200 bg-background px-4 py-3 text-xs resize-none placeholder:text-stone-400 focus:ring-1 focus:ring-amber-300 transition-all"
              />
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-2.5 pt-3">
            <button
              onClick={save}
              className="flex-1 rounded-full bg-amber-400 hover:bg-amber-500 py-3 text-xs font-bold text-stone-900 shadow-md transition-all duration-250 hover:-translate-y-0.5 active:scale-95"
            >
              Simpan Lembaran Diary 📓
            </button>
            <button
              onClick={() => { setSheetOpen(false); reset(); }}
              className="rounded-full border border-stone-200 px-5 py-3 text-xs font-bold text-stone-600 transition-all duration-200 hover:bg-stone-50"
            >
              Batal
            </button>
          </div>

        </div>
      </BottomSheet>

      {/* ── DELETE DIALOG ───────────────────────────────────────── */}
      <ModalDialog
        open={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        title="Hapus Lembaran Diary?"
      >
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground leading-normal">Catatan harian ini akan terhapus selamanya dan tidak dapat dikembalikan kembali ke buku harianmu.</p>
          <p className="text-[10px] text-amber-700 bg-amber-50 border border-amber-100/60 rounded-xl p-2.5 font-medium leading-relaxed">
            💡 <strong>Tips:</strong> Anda dapat mendownload lembaran ini sebagai PDF terlebih dahulu di detail catatan sebelum menghapusnya secara permanen.
          </p>
        </div>
        <div className="mt-5 flex gap-2">
          <button
            onClick={() => deleteConfirm && remove(deleteConfirm)}
            className="flex-1 rounded-full bg-destructive py-2.5 text-xs font-bold text-white transition-all duration-200 hover:opacity-90"
          >
            Ya, Hapus Permanen
          </button>
          <button
            onClick={() => setDeleteConfirm(null)}
            className="flex-1 rounded-full border border-border py-2.5 text-xs font-bold hover:bg-cream-deep transition-all duration-200"
          >
            Batal
          </button>
        </div>
      </ModalDialog>

      {/* ── TIME CAPSULE CREATE SHEET ───────────────────────────── */}
      <BottomSheet
        open={capsuleOpen}
        onClose={() => { setCapsuleOpen(false); setNewCapsuleText(""); }}
        title="Kunci Kapsul Waktu Baru 🔒"
      >
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-bold" htmlFor="capsule-msg">
              Pesan rahasia untuk dirimu di masa depan
            </label>
            <textarea
              id="capsule-msg"
              value={newCapsuleText}
              onChange={(e) => setNewCapsuleText(e.target.value)}
              placeholder="Tulis harapan, doa, atau nasihat untuk dirimu di masa depan... Kapsul ini akan terkunci rapat hingga tanggal buka."
              rows={5}
              className="w-full rounded-2xl border border-stone-200 bg-background px-4 py-3 text-xs resize-none placeholder:text-stone-400 focus:ring-1 focus:ring-amber-300 transition-all"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-bold" htmlFor="capsule-time">
              Kapan kapsul ini boleh dibuka kembali?
            </label>
            <select
              id="capsule-time"
              value={newCapsuleTarget}
              onChange={(e) => setNewCapsuleTarget(e.target.value)}
              className="w-full rounded-2xl border border-stone-200 bg-background px-4 py-3 text-xs focus:ring-1 focus:ring-amber-300 transition-all"
            >
              <option value="1min">1 Menit (Untuk testing)</option>
              <option value="3mins">3 Menit (Untuk testing)</option>
              <option value="1month">1 Bulan Ke Depan</option>
              <option value="3months">3 Bulan Ke Depan</option>
              <option value="6months">6 Bulan Ke Depan</option>
              <option value="custom">Pilih Tanggal Bebas... 📅</option>
            </select>
          </div>

          {newCapsuleTarget === "custom" && (
            <div className="animate-fade-in">
              <label className="mb-1.5 block text-xs font-bold" htmlFor="capsule-custom-date">
                Tentukan Tanggal Buka Kapsul
              </label>
              <input
                id="capsule-custom-date"
                type="date"
                value={customDate}
                min={new Date(Date.now() + 86400000).toISOString().slice(0, 10)}
                onChange={(e) => setCustomDate(e.target.value)}
                className="w-full rounded-2xl border border-stone-200 bg-background px-4 py-3 text-xs focus:ring-1 focus:ring-amber-300 transition-all font-semibold"
              />
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <button
              onClick={saveCapsule}
              disabled={!newCapsuleText.trim()}
              className="flex-1 rounded-full bg-amber-400 py-3 text-xs font-bold text-stone-900 shadow-md transition-all duration-250 hover:-translate-y-0.5 disabled:opacity-40"
            >
              Kunci Kapsul 🔒
            </button>
            <button
              onClick={() => { setCapsuleOpen(false); setNewCapsuleText(""); }}
              className="rounded-full border border-stone-200 px-5 py-3 text-xs font-bold text-stone-600 transition-all duration-200 hover:bg-stone-50"
            >
              Batal
            </button>
          </div>
        </div>
      </BottomSheet>

      {/* ── TIME CAPSULE VIEW DIALOG ───────────────────────────── */}
      <ModalDialog
        open={!!viewCapsule}
        onClose={() => setViewCapsule(null)}
      >
        {viewCapsule && (
          <div className="space-y-4">
            <p className="text-[9px] text-muted-foreground uppercase tracking-wider font-extrabold">
              Ditulis pada: {new Date(viewCapsule.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}
            </p>
            <div 
              className="rounded-2xl p-5 border border-amber-200/40 shadow-sm leading-relaxed text-stone-700 font-display italic text-sm whitespace-pre-wrap relative overflow-hidden"
              style={{ background: "linear-gradient(135deg, oklch(0.98 0.035 70 / 0.4) 0%, oklch(0.99 0.02 80 / 0.1) 100%)" }}
            >
              <div className="absolute left-3 top-0 bottom-0 w-[1px] bg-red-300/40" />
              <div className="pl-4">
                "{viewCapsule.message}"
              </div>
            </div>
            <button
              onClick={() => setViewCapsule(null)}
              className="w-full rounded-full bg-amber-400 py-2.5 text-xs font-bold text-stone-900 shadow-md transition-all duration-200 hover:-translate-y-0.5 active:scale-95"
            >
              Simpan Kembali Ke Lemari Kapsul 🤍
            </button>
          </div>
        )}
      </ModalDialog>

      {/* ── DETAIL DIARY DIALOG ──────────────────────────────── */}
      <ModalDialog
        open={!!selectedJournal}
        onClose={() => setSelectedJournal(null)}
        title="📓 Lembaran Diary"
      >
        {selectedJournal && (() => {
          const themeKey = getThemeByEmotion(selectedJournal.main_emotion);
          const theme = THEME_STYLES[themeKey] || THEME_STYLES.default;
          const formattedDate = new Date(selectedJournal.created_at).toLocaleString("id-ID", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
          });

          return (
            <div className="space-y-5 max-h-[75vh] overflow-y-auto pr-1 pb-2">
              {/* Header Info */}
              <div 
                className={`rounded-2xl p-4 border flex items-center justify-between gap-3 ${theme.border}`}
                style={{ background: theme.bg }}
              >
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-xs font-extrabold ${theme.text}`}>
                      {formattedDate}
                    </span>
                    {selectedJournal.main_emotion && (
                      <span className={`rounded-full px-2.5 py-0.5 text-[9px] font-bold ${theme.tagBg} shadow-sm border border-black/5`}>
                        {selectedJournal.main_emotion}
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-stone-500 mt-1 font-medium">
                    Ditulis lewat: {selectedJournal.source === "from_chat" ? (COMPANION_LABELS[selectedJournal.companion_key || "sahabat"] || "🤗 Sahabat") : "✍️ Manual"}
                  </p>
                </div>
              </div>

              {/* Main summary diary content */}
              <div>
                <p className="mb-2 text-xs font-bold text-stone-500 uppercase tracking-wider">Isi Diary</p>
                <div className="relative rounded-2xl bg-stone-50/50 border border-stone-200/60 p-5 shadow-inner overflow-hidden font-display text-sm leading-relaxed text-stone-800 whitespace-pre-wrap">
                  <div className="absolute left-4 top-0 bottom-0 w-[1px] bg-red-300/40" />
                  <div className="pl-6 select-text selection:bg-amber-100">
                    {selectedJournal.summary}
                  </div>
                </div>
              </div>

              {/* Stickers / Activities */}
              {selectedJournal.main_trigger && (
                <div>
                  <p className="mb-2 text-xs font-bold text-stone-500 uppercase tracking-wider">Aktivitas Hari Ini</p>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedJournal.main_trigger.split(", ").map((stick: string, sIdx: number) => (
                      <span key={sIdx} className="inline-flex items-center gap-1 rounded-xl bg-stone-100 border border-stone-200/50 px-2.5 py-1 text-xs font-bold text-stone-700 shadow-sm">
                        {stick}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Reflections */}
              {(selectedJournal.gratitude || selectedJournal.lesson || selectedJournal.tomorrow_focus) && (
                <div className="space-y-3 pt-3 border-t border-stone-200/40">
                  <p className="text-xs font-bold text-stone-500 uppercase tracking-wider">Refleksi Harian</p>
                  
                  {selectedJournal.gratitude && (
                    <div className="p-3.5 rounded-2xl bg-amber-50/55 border border-amber-100 flex gap-2.5 text-stone-700">
                      <span className="text-xl select-none">🙏</span>
                      <div className="text-xs leading-relaxed">
                        <p className="font-extrabold text-amber-900 leading-none text-[9px] uppercase tracking-wider mb-1">Hal Yang Disyukuri</p>
                        <p className="font-medium">{selectedJournal.gratitude}</p>
                      </div>
                    </div>
                  )}

                  {selectedJournal.lesson && (
                    <div className="p-3.5 rounded-2xl bg-blue-50/55 border border-blue-100 flex gap-2.5 text-stone-700">
                      <span className="text-xl select-none">💡</span>
                      <div className="text-xs leading-relaxed">
                        <p className="font-extrabold text-blue-900 leading-none text-[9px] uppercase tracking-wider mb-1">Pelajaran Berharga</p>
                        <p className="font-medium">{selectedJournal.lesson}</p>
                      </div>
                    </div>
                  )}

                  {selectedJournal.tomorrow_focus && (
                    <div className="p-3.5 rounded-2xl bg-teal-50/60 border border-teal-100 flex gap-2.5 text-stone-700">
                      <span className="text-xl select-none">🎯</span>
                      <div className="text-xs leading-relaxed">
                        <p className="font-extrabold text-teal-900 leading-none text-[9px] uppercase tracking-wider mb-1">Fokus Esok Hari</p>
                        <p className="font-medium">{selectedJournal.tomorrow_focus}</p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-3 border-t border-stone-200/40">
                <button
                  onClick={() => {
                    edit(selectedJournal);
                    setSelectedJournal(null);
                  }}
                  className="flex-1 rounded-full border border-stone-300 bg-white hover:bg-stone-50 py-3 text-[10px] sm:text-xs font-bold text-stone-700 transition-all duration-200 active:scale-95 shadow-sm"
                >
                  Edit 📝
                </button>
                <button
                  onClick={() => {
                    setDeleteConfirm(selectedJournal.id);
                    setSelectedJournal(null);
                  }}
                  className="flex-1 rounded-full border border-destructive/20 hover:bg-destructive/5 py-3 text-[10px] sm:text-xs font-bold text-destructive transition-all duration-200 active:scale-95"
                >
                  Hapus 🗑️
                </button>
                <button
                  onClick={() => exportJournalPDF(selectedJournal)}
                  className="flex-1 rounded-full border border-primary/20 bg-primary-soft/60 hover:bg-primary-soft py-3 text-[10px] sm:text-xs font-bold text-primary transition-all duration-200 active:scale-95"
                >
                  Simpan PDF 📄
                </button>
                <button
                  onClick={() => setSelectedJournal(null)}
                  className="rounded-full border border-stone-200 bg-stone-50 hover:bg-stone-100 px-3.5 py-3 text-[10px] sm:text-xs font-bold text-stone-600 transition-all duration-200"
                >
                  Tutup
                </button>
              </div>
            </div>
          );
        })()}
      </ModalDialog>
    </div>
  );
}

