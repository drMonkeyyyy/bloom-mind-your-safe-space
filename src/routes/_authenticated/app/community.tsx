import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useProfile } from "@/hooks/use-profile";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ModalDialog } from "@/components/app/BottomSheet";
import {
  MessageSquare,
  Send,
  Sparkles,
  Lock,
  Globe,
  Users,
  ShieldCheck,
  Search,
  Trash2,
  Tag,
  HeartHandshake,
  Heart,
  TrendingUp,
  User,
  X,
} from "lucide-react";

export const Route = createFileRoute("/_authenticated/app/community")({
  component: CommunityPage,
});

interface PostComment {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  author_name: string;
  author_avatar: string;
  is_anonymous: boolean;
  created_at: string;
}

interface CommunityPost {
  id: string;
  user_id: string;
  content: string;
  author_name: string;
  author_avatar: string;
  is_anonymous: boolean;
  tag: string;
  hugs_count: number;
  comments_count: number;
  created_at: string;
  has_hugged?: boolean;
}

const TAG_OPTIONS = [
  { id: "Curhat", label: "Curhat", emoji: "💬", pill: "bg-teal-50/80 text-teal-700 border-teal-200/60", active: "bg-teal-600 text-white border-teal-600" },
  { id: "SelfCare", label: "Self-Care", emoji: "🌸", pill: "bg-rose-50/80 text-rose-600 border-rose-200/60", active: "bg-rose-500 text-white border-rose-500" },
  { id: "ButuhDukungan", label: "Butuh Peluk", emoji: "🫂", pill: "bg-amber-50/80 text-amber-700 border-amber-200/60", active: "bg-amber-500 text-white border-amber-500" },
  { id: "Motivasi", label: "Motivasi", emoji: "✨", pill: "bg-emerald-50/80 text-emerald-700 border-emerald-200/60", active: "bg-emerald-600 text-white border-emerald-600" },
  { id: "CeritaKecil", label: "Cerita Hari Ini", emoji: "📖", pill: "bg-sky-50/80 text-sky-700 border-sky-200/60", active: "bg-sky-500 text-white border-sky-500" },
];

const AVATAR_OPTIONS = ["🌸", "🌷", "🌿", "🌻", "🪷", "🎈", "🧸", "☁️", "🦋", "🌙"];

const PROMPTS = [
  "Hari ini aku belajar bahwa tidak apa-apa jika belum sepenuhnya sembuh...",
  "Langkah kecil yang berhasil kubuat hari ini adalah...",
  "Seseorang yang membutuhkan pelukan hangat hari ini, aku di sini bersamamu...",
  "Terima kasih untuk diriku karena sudah bertahan sejauh ini...",
];

const DEMO_POSTS: CommunityPost[] = [
  {
    id: "demo-1",
    user_id: "demo-user-1",
    content: "Padahal aku hanya menyelamatkan diriku agar tidak semakin jatuh dan sakit. Tapi kenapa rasanya sesakit ini...",
    author_name: "Anonim",
    author_avatar: "🌸",
    is_anonymous: true,
    tag: "Curhat",
    hugs_count: 5,
    comments_count: 2,
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    has_hugged: false,
  },
  {
    id: "demo-2",
    user_id: "demo-user-2",
    content: "Akhirnya bisa melepas ekspektasi tinggi ke diri sendiri hari ini. Belajar untuk jalan pelan-pelan tanpa terburu-buru ✨",
    author_name: "Siti Rahmawati",
    author_avatar: "SR",
    is_anonymous: false,
    tag: "SelfCare",
    hugs_count: 8,
    comments_count: 3,
    created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    has_hugged: true,
  },
  {
    id: "demo-3",
    user_id: "demo-user-3",
    content: "Gapapa mungkin belum saatnya. Yang penting kita tidak berhenti mencoba dan berprasangka baik pada proses.",
    author_name: "Budi Santoso",
    author_avatar: "BS",
    is_anonymous: false,
    tag: "Motivasi",
    hugs_count: 12,
    comments_count: 1,
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    has_hugged: false,
  },
  {
    id: "demo-4",
    user_id: "demo-user-4",
    content: "Berat banget mengurai isi kepala sendirian... tapi berada di ruang ini membuatku sadar kalau ada banyak jiwa yang saling menguatkan. Terima kasih semuanya.",
    author_name: "Anonim",
    author_avatar: "🌿",
    is_anonymous: true,
    tag: "ButuhDukungan",
    hugs_count: 15,
    comments_count: 4,
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    has_hugged: false,
  },
];

const DEMO_COMMENTS: Record<string, PostComment[]> = {
  "demo-1": [
    {
      id: "comment-1",
      post_id: "demo-1",
      user_id: "demo-user-5",
      content: "Peluk erat dari jauh 🤗 Tindakanmu menyelamatkan diri adalah bentuk keberanian besar. Tetap bertahan ya!",
      author_name: "Arif Kurniawan",
      author_avatar: "AK",
      is_anonymous: false,
      created_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "comment-2",
      post_id: "demo-1",
      user_id: "demo-user-6",
      content: "Aku mengerti persis rasanya... semoga hatimu segera tenang dan hangat kembali.",
      author_name: "Anonim",
      author_avatar: "🌻",
      is_anonymous: true,
      created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    },
  ],
};

function timeAgo(isoString: string): string {
  try {
    const date = new Date(isoString);
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (diff < 60) return "Baru saja";
    if (diff < 3600) return `${Math.floor(diff / 60)} mnt lalu`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} jam lalu`;
    const months = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
    const d = date;
    return `${d.getDate()} ${months[d.getMonth()]}`;
  } catch {
    return "Baru saja";
  }
}

/** Avatar for non-anonymous (initials) or anonymous (emoji) */
function AuthorAvatar({ post, size = "md" }: { post: CommunityPost | PostComment; size?: "sm" | "md" }) {
  const sz = size === "sm" ? "h-8 w-8 text-[11px]" : "h-10 w-10 text-sm";
  if (post.is_anonymous) {
    return (
      <span className={`${sz} flex shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-100 to-emerald-100 border border-teal-200/50 shadow-xs text-base`}>
        {post.author_avatar}
      </span>
    );
  }
  return (
    <span className={`${sz} flex shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 font-bold tracking-tight text-white shadow-xs border border-indigo-300/40`}>
      {post.author_avatar?.slice(0, 2) || "U"}
    </span>
  );
}

function TagBadge({ tagId, compact = false }: { tagId: string; compact?: boolean }) {
  const t = TAG_OPTIONS.find((x) => x.id === tagId) ?? TAG_OPTIONS[0];
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 font-semibold ${compact ? "text-[10px]" : "text-xs"} ${t.pill}`}>
      <span>{t.emoji}</span>
      {!compact && <span>{t.label}</span>}
    </span>
  );
}

function IdentityBadge({ isAnonymous }: { isAnonymous: boolean }) {
  if (isAnonymous) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-teal-50/80 px-2 py-0.5 text-[10px] font-semibold text-teal-700 border border-teal-200/50">
        <Lock className="h-2.5 w-2.5" /> Anonim
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50/80 px-2 py-0.5 text-[10px] font-semibold text-indigo-700 border border-indigo-200/50">
      <Globe className="h-2.5 w-2.5" /> Publik
    </span>
  );
}

export default function CommunityPage() {
  const { user } = useAuth();
  const { data: profile } = useProfile(user?.id);

  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);

  // Composer
  const [content, setContent] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [selectedTag, setSelectedTag] = useState("Curhat");
  const [selectedAvatar, setSelectedAvatar] = useState("🌸");
  const [submitting, setSubmitting] = useState(false);
  const [composerOpen, setComposerOpen] = useState(false);

  // Filter
  const [tab, setTab] = useState<"semua" | "anonim" | "publik" | "populer" | "saya">("semua");
  const [tagFilter, setTagFilter] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  // Hug animation
  const [animatingId, setAnimatingId] = useState<string | null>(null);

  // Comments
  const [commentPost, setCommentPost] = useState<CommunityPost | null>(null);
  const [comments, setComments] = useState<PostComment[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [commentAnon, setCommentAnon] = useState(true);
  const [submittingComment, setSubmittingComment] = useState(false);

  const displayName = profile?.name || user?.email?.split("@")[0] || "Anggota";
  const initials = displayName.slice(0, 2).toUpperCase();

  // ─── Data Fetching ─────────────────────────────────────────────
  const loadLocal = () => {
    try {
      const raw = localStorage.getItem("bloom_community_v3");
      setPosts(raw ? JSON.parse(raw) : DEMO_POSTS);
      if (!raw) localStorage.setItem("bloom_community_v3", JSON.stringify(DEMO_POSTS));
    } catch {
      setPosts(DEMO_POSTS);
    }
  };

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("community_posts" as any)
        .select("*")
        .order("created_at", { ascending: false });

      if (error || !data?.length) { loadLocal(); return; }

      let userHugs = new Set<string>();
      if (user) {
        const { data: hd } = await supabase.from("community_hugs" as any).select("post_id").eq("user_id", user.id);
        if (hd) hd.forEach((h: any) => userHugs.add(h.post_id));
      }
      setPosts(data.map((p: any) => ({ ...p, has_hugged: userHugs.has(p.id) })));
    } catch { loadLocal(); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchPosts(); }, [user?.id]);

  // ─── Create Post ───────────────────────────────────────────────
  const handlePost = async () => {
    if (!content.trim()) return;
    setSubmitting(true);

    const newPost: CommunityPost = {
      id: crypto.randomUUID(),
      user_id: user?.id || "guest",
      content: content.trim(),
      author_name: isAnonymous ? "Anonim" : displayName,
      author_avatar: isAnonymous ? selectedAvatar : initials,
      is_anonymous: isAnonymous,
      tag: selectedTag,
      hugs_count: 0,
      comments_count: 0,
      created_at: new Date().toISOString(),
      has_hugged: false,
    };

    try {
      if (user) {
        await supabase.from("community_posts" as any).insert({
          id: newPost.id, user_id: user.id, content: newPost.content,
          author_name: newPost.author_name, author_avatar: newPost.author_avatar,
          is_anonymous: newPost.is_anonymous, tag: newPost.tag,
          hugs_count: 0, comments_count: 0,
        });
      }
      const updated = [newPost, ...posts];
      setPosts(updated);
      localStorage.setItem("bloom_community_v3", JSON.stringify(updated));
      setContent("");
      setComposerOpen(false);
      toast.success(isAnonymous ? "Ceritamu terkirim secara anonim 🔒" : `Postingan publik terbit sebagai ${displayName} 👤`);
    } catch { toast.error("Terjadi kesalahan, coba lagi."); }
    finally { setSubmitting(false); }
  };

  // ─── Hug Toggle ────────────────────────────────────────────────
  const handleHug = async (post: CommunityPost) => {
    const hugged = post.has_hugged;
    const count = hugged ? Math.max(0, post.hugs_count - 1) : post.hugs_count + 1;

    if (!hugged) { setAnimatingId(post.id); setTimeout(() => setAnimatingId(null), 900); }

    const updated = posts.map((p) => p.id === post.id ? { ...p, hugs_count: count, has_hugged: !hugged } : p);
    setPosts(updated);
    localStorage.setItem("bloom_community_v3", JSON.stringify(updated));

    if (user) {
      try {
        if (hugged) {
          await supabase.from("community_hugs" as any).delete().eq("post_id", post.id).eq("user_id", user.id);
        } else {
          await supabase.from("community_hugs" as any).insert({ post_id: post.id, user_id: user.id });
        }
        await supabase.from("community_posts" as any).update({ hugs_count: count }).eq("id", post.id);
      } catch { /* silent */ }
    }
    if (!hugged) toast("Pelukan hangat terkirim 🩵", { description: "Kamu baru saja membuat seseorang merasa tidak sendirian." });
  };

  // ─── Comments ──────────────────────────────────────────────────
  const openComments = async (post: CommunityPost) => {
    setCommentPost(post);
    setCommentsLoading(true);
    try {
      if (user) {
        const { data, error } = await supabase.from("community_comments" as any).select("*").eq("post_id", post.id).order("created_at", { ascending: true });
        if (!error && data) { setComments(data as PostComment[]); setCommentsLoading(false); return; }
      }
      const key = `bloom_community_comments_v3_${post.id}`;
      const raw = localStorage.getItem(key);
      setComments(raw ? JSON.parse(raw) : DEMO_COMMENTS[post.id] || []);
    } catch { setComments(DEMO_COMMENTS[post.id] || []); }
    finally { setCommentsLoading(false); }
  };

  const submitComment = async () => {
    if (!newComment.trim() || !commentPost) return;
    setSubmittingComment(true);

    const c: PostComment = {
      id: crypto.randomUUID(),
      post_id: commentPost.id,
      user_id: user?.id || "guest",
      content: newComment.trim(),
      author_name: commentAnon ? "Anonim" : displayName,
      author_avatar: commentAnon ? selectedAvatar : initials,
      is_anonymous: commentAnon,
      created_at: new Date().toISOString(),
    };

    try {
      if (user) {
        await supabase.from("community_comments" as any).insert({ id: c.id, post_id: commentPost.id, user_id: user.id, content: c.content, author_name: c.author_name, author_avatar: c.author_avatar, is_anonymous: c.is_anonymous });
        await supabase.from("community_posts" as any).update({ comments_count: commentPost.comments_count + 1 }).eq("id", commentPost.id);
      }
      const updC = [...comments, c];
      setComments(updC);
      localStorage.setItem(`bloom_community_comments_v3_${commentPost.id}`, JSON.stringify(updC));
      const updP = posts.map((p) => p.id === commentPost.id ? { ...p, comments_count: p.comments_count + 1 } : p);
      setPosts(updP);
      localStorage.setItem("bloom_community_v3", JSON.stringify(updP));
      setNewComment("");
    } catch { toast.error("Gagal mengirim komentar."); }
    finally { setSubmittingComment(false); }
  };

  const deletePost = async (postId: string) => {
    if (!confirm("Hapus postingan ini?")) return;
    if (user) { try { await supabase.from("community_posts" as any).delete().eq("id", postId); } catch { /* silent */ } }
    const updated = posts.filter((p) => p.id !== postId);
    setPosts(updated);
    localStorage.setItem("bloom_community_v3", JSON.stringify(updated));
    toast.success("Postingan dihapus.");
  };

  const deleteComment = async (commentId: string) => {
    if (!confirm("Hapus komentar ini?")) return;
    if (user) {
      try {
        await supabase.from("community_comments" as any).delete().eq("id", commentId);
        // Decrement comment count on post
        if (commentPost) {
          const newCount = Math.max(0, commentPost.comments_count - 1);
          await supabase.from("community_posts" as any).update({ comments_count: newCount }).eq("id", commentPost.id);
          const updP = posts.map((p) => p.id === commentPost.id ? { ...p, comments_count: newCount } : p);
          setPosts(updP);
          localStorage.setItem("bloom_community_v3", JSON.stringify(updP));
        }
      } catch { /* silent */ }
    }
    const updC = comments.filter((c) => c.id !== commentId);
    setComments(updC);
    if (commentPost) {
      localStorage.setItem(`bloom_community_comments_v3_${commentPost.id}`, JSON.stringify(updC));
    }
    toast.success("Komentar dihapus.");
  };

  // ─── Derived Data ──────────────────────────────────────────────
  const filtered = useMemo(() => {
    let r = [...posts];
    if (search.trim()) { const q = search.toLowerCase(); r = r.filter((p) => p.content.toLowerCase().includes(q) || p.author_name.toLowerCase().includes(q)); }
    if (tagFilter) r = r.filter((p) => p.tag === tagFilter);
    if (tab === "anonim") r = r.filter((p) => p.is_anonymous);
    else if (tab === "publik") r = r.filter((p) => !p.is_anonymous);
    else if (tab === "populer") r.sort((a, b) => b.hugs_count - a.hugs_count);
    else if (tab === "saya") r = r.filter((p) => p.user_id === user?.id);
    return r;
  }, [posts, tab, tagFilter, search, user?.id]);

  const totalHugs = useMemo(() => posts.reduce((s, p) => s + p.hugs_count, 0), [posts]);

  const TABS = [
    { id: "semua", label: "Semua" },
    { id: "anonim", label: "🔒 Anonim" },
    { id: "publik", label: "👤 Publik" },
    { id: "populer", label: "🔥 Terpopuler" },
    { id: "saya", label: "Post Saya" },
  ] as const;

  return (
    <div className="mx-auto max-w-2xl space-y-5 pb-28 pt-2 sm:pt-4 px-3 sm:px-0">

      {/* ─── Cinematic Hero — Full width, Bekasigo style ─────── */}
      {/* Negative margin to break out of px-3 sm:px-0 parent padding */}
      <div className="-mx-3 sm:mx-0 relative overflow-hidden sm:rounded-3xl" style={{ minHeight: "420px" }}>
        {/* Background */}
        <img
          src="/community-hero.png"
          alt="Pulau mengambang dengan sakura dan lentera — Ruang Komunitas Bloom Mind"
          className="absolute inset-0 h-full w-full object-cover object-center"
          loading="eager"
          style={{ objectPosition: "50% 40%" }}
        />
        {/* Overlays: bottom-heavy dark, left fade, subtle vignette */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-black/10 to-transparent" />

        {/* ── Top label ── */}
        <div className="absolute left-5 top-5 sm:left-8 sm:top-6 flex items-center gap-2">
          <span className="h-px w-8 bg-amber-400/80" />
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-300/90">
            Bloom Community · Safe Space
          </span>
        </div>

        {/* ── Main content — bottom left (Bekasigo layout) ── */}
        <div
          className="relative z-10 flex flex-col justify-end px-6 pb-6 sm:px-10 sm:pb-8"
          style={{ minHeight: "420px" }}
        >
          {/* Headline */}
          <div className="max-w-lg">
            <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold leading-[1.1] tracking-tight text-white drop-shadow-xl">
              Ruang Saling Peluk
              <br />
              <span
                className="bg-gradient-to-r from-rose-300 to-amber-300 bg-clip-text text-transparent"
              >
                &amp; Menguatkan.
              </span>
            </h1>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-white/70">
              Dari cerita kecil yang tak terucap, hingga kekuatan bersama yang tumbuh — ceritakan dirimu,{" "}
              <span className="text-teal-300 font-semibold">anonim</span> atau{" "}
              <span className="text-indigo-300 font-semibold">publik</span>.
            </p>
          </div>

          {/* Stats bar — brand values, always strong */}
          <div className="mt-6 flex items-end gap-8 border-t border-white/15 pt-4">
            <div>
              <p className="text-2xl font-bold leading-none text-white">
                100<span className="text-amber-400">%</span>
              </p>
              <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.15em] text-white/50">
                Aman & Terjaga
              </p>
            </div>
            <div>
              <p className="text-2xl font-bold leading-none text-white">
                🔒
              </p>
              <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.15em] text-white/50">
                Anonim Penuh
              </p>
            </div>
            <div>
              <p className="text-2xl font-bold leading-none text-white">
                24<span className="text-amber-400">/7</span>
              </p>
              <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.15em] text-white/50">
                Selalu Ada
              </p>
            </div>
          </div>

        </div>
      </div>


      {/* ─── Composer Card ───────────────────────────────────── */}
      <div className="rounded-3xl border border-border/70 bg-card shadow-card overflow-hidden">

        {/* Identity Toggle Row */}
        <div className="flex items-center justify-between gap-3 border-b border-border/40 bg-muted/30 px-5 py-3">
          <span className="text-xs font-semibold text-muted-foreground">Identitas:</span>
          <div className="flex items-center gap-1.5 rounded-2xl bg-background border border-border/60 p-1">
            <button
              type="button"
              onClick={() => setIsAnonymous(true)}
              className={`inline-flex items-center gap-1.5 rounded-xl px-4 py-1.5 text-xs font-bold transition-all duration-200 cursor-pointer ${isAnonymous ? "bg-teal-600 text-white shadow-xs shadow-teal-600/30" : "text-muted-foreground hover:text-foreground"}`}
            >
              <Lock className="h-3 w-3" /> Anonim
            </button>
            <button
              type="button"
              onClick={() => setIsAnonymous(false)}
              className={`inline-flex items-center gap-1.5 rounded-xl px-4 py-1.5 text-xs font-bold transition-all duration-200 cursor-pointer ${!isAnonymous ? "bg-indigo-600 text-white shadow-xs shadow-indigo-600/30" : "text-muted-foreground hover:text-foreground"}`}
            >
              <Globe className="h-3 w-3" /> {displayName}
            </button>
          </div>
        </div>

        <div className="p-5 space-y-4">
          {/* Identity Preview */}
          <div className="flex items-center gap-2.5">
            {isAnonymous ? (
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-teal-50 border border-teal-200/60 text-base">
                {selectedAvatar}
              </span>
            ) : (
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 font-bold text-white text-xs shadow-xs">
                {initials}
              </span>
            )}
            <div className="text-xs text-muted-foreground">
              {isAnonymous ? (
                <span>Posting sebagai <strong className="text-teal-700">🔒 Anonim</strong> — nama & identitasmu tersembunyi</span>
              ) : (
                <span>Posting sebagai <strong className="text-indigo-700">👤 {displayName}</strong></span>
              )}
            </div>
          </div>

          {/* Textarea */}
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            maxLength={50000}
            rows={4}
            placeholder={
              isAnonymous
                ? "Tulis ceritamu di sini — 100% anonim & aman..."
                : `Bagikan cerita atau pikiran positifmu, ${displayName}...`
            }
            className="w-full resize-none rounded-2xl border border-border/60 bg-muted/20 px-4 py-3.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary/60 focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary/15 transition-all leading-relaxed"
          />

          {/* Quick Prompts */}
          <div className="space-y-2">
            <p className="flex items-center gap-1 text-[11px] font-semibold text-muted-foreground/80">
              <Sparkles className="h-3 w-3 text-amber-500" /> Inspirasi kata
            </p>
            <div className="flex flex-wrap gap-1.5">
              {PROMPTS.map((p, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setContent(p)}
                  className="rounded-full border border-border/60 bg-muted/40 px-3 py-1 text-[11px] font-medium text-muted-foreground hover:bg-primary-soft hover:text-primary hover:border-primary/30 transition-all cursor-pointer text-left"
                >
                  {p.slice(0, 38)}…
                </button>
              ))}
            </div>
          </div>

          {/* Anonymous Avatar Selector */}
          {isAnonymous && (
            <div className="space-y-1.5">
              <p className="text-[11px] font-semibold text-muted-foreground/80">Pilih avatar anonim</p>
              <div className="flex items-center gap-1.5 flex-wrap">
                {AVATAR_OPTIONS.map((av) => (
                  <button
                    key={av}
                    type="button"
                    onClick={() => setSelectedAvatar(av)}
                    className={`h-8 w-8 rounded-xl border text-sm transition-all duration-200 cursor-pointer ${selectedAvatar === av ? "border-teal-400 bg-teal-50 scale-110 shadow-xs" : "border-border/50 bg-muted/30 hover:bg-muted"}`}
                  >
                    {av}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Tag Selector */}
          <div className="space-y-1.5">
            <p className="flex items-center gap-1 text-[11px] font-semibold text-muted-foreground/80">
              <Tag className="h-3 w-3" /> Kategori
            </p>
            <div className="flex flex-wrap gap-1.5">
              {TAG_OPTIONS.map((tag) => (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => setSelectedTag(tag.id)}
                  className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold transition-all cursor-pointer ${selectedTag === tag.id ? tag.active : tag.pill}`}
                >
                  <span>{tag.emoji}</span> {tag.label}
                </button>
              ))}
            </div>
          </div>

          {/* Submit Bar */}
          <div className="flex items-center justify-between pt-1 border-t border-border/40">
            <span className="text-[11px] text-muted-foreground/70">
              {content.length > 0 && `${content.length.toLocaleString()} / 50.000`}
            </span>
            <button
              type="button"
              onClick={handlePost}
              disabled={submitting || !content.trim()}
              className={`inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-xs font-bold text-white shadow-md transition-all duration-200 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 ${isAnonymous ? "bg-teal-600 hover:bg-teal-700 shadow-teal-600/25" : "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/25"}`}
            >
              {submitting
                ? <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                : <Send className="h-3.5 w-3.5" />}
              {isAnonymous ? "Bagikan Anonim" : "Bagikan Publik"}
            </button>
          </div>
        </div>
      </div>

      {/* ─── Tabs & Filters ─────────────────────────────────── */}
      <div className="space-y-3">
        {/* Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-0.5 scrollbar-none">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`shrink-0 rounded-full px-4 py-1.5 text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                tab === t.id
                  ? "bg-foreground text-background shadow-xs"
                  : "bg-muted/60 text-muted-foreground border border-border/50 hover:bg-muted"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Tag Filters + Search Row */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
          <div className="flex items-center gap-1.5 flex-wrap flex-1">
            <button
              type="button"
              onClick={() => setTagFilter(null)}
              className={`rounded-full px-3 py-1 text-[11px] font-bold transition-all cursor-pointer ${tagFilter === null ? "bg-foreground text-background" : "bg-muted/60 text-muted-foreground border border-border/50 hover:bg-muted"}`}
            >
              Semua
            </button>
            {TAG_OPTIONS.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTagFilter(tagFilter === t.id ? null : t.id)}
                className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold transition-all cursor-pointer ${tagFilter === t.id ? t.active : t.pill}`}
              >
                {t.emoji} {t.label}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative shrink-0 w-full sm:w-44">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari cerita..."
              className="w-full rounded-full border border-border/60 bg-background pl-7 pr-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground/60 focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/20"
            />
          </div>
        </div>
      </div>

      {/* ─── Posts Feed ──────────────────────────────────────── */}
      <div className="space-y-3">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-3xl border border-border/40 bg-card p-6 space-y-3 animate-pulse">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-2xl bg-muted" />
                <div className="space-y-1.5 flex-1">
                  <div className="h-3 bg-muted rounded-full w-28" />
                  <div className="h-2.5 bg-muted rounded-full w-16" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-3.5 bg-muted rounded-full w-full" />
                <div className="h-3.5 bg-muted rounded-full w-3/4" />
              </div>
            </div>
          ))
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 rounded-3xl border border-dashed border-border bg-card/40 py-16 text-center px-6">
            <span className="text-3xl">🌸</span>
            <h3 className="text-sm font-semibold text-foreground">Belum ada cerita di sini</h3>
            <p className="text-xs text-muted-foreground max-w-xs">Jadilah yang pertama berbagi cerita dan menginspirasi sesama anggota Bloom.</p>
          </div>
        ) : (
          filtered.map((post) => {
            const isOwner = user?.id === post.user_id;
            const isHugged = post.has_hugged;

            return (
              <article
                key={post.id}
                className="group relative rounded-3xl border border-border/60 bg-card p-5 shadow-card transition-all duration-300 hover:border-border hover:shadow-elevated"
              >
                {/* Hug animation bubble */}
                {animatingId === post.id && (
                  <div className="pointer-events-none absolute right-5 top-5 z-20 animate-bounce text-xl">🩵</div>
                )}

                {/* Top Row: Author + Tag */}
                <div className="flex items-start justify-between gap-3 mb-3.5">
                  <div className="flex items-center gap-3">
                    <AuthorAvatar post={post} />
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-xs font-bold text-foreground">{post.author_name}</span>
                        <IdentityBadge isAnonymous={post.is_anonymous} />
                        {isOwner && (
                          <span className="rounded-full bg-emerald-100/80 px-2 py-0.5 text-[10px] font-bold text-emerald-800 border border-emerald-200/60">
                            Milik Saya
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-muted-foreground/70">{timeAgo(post.created_at)}</span>
                    </div>
                  </div>
                  <TagBadge tagId={post.tag} />
                </div>

                {/* Content */}
                <p className="text-sm leading-relaxed text-foreground/90 whitespace-pre-line">
                  {post.content}
                </p>

                {/* Divider */}
                <div className="my-4 h-px bg-border/40" />

                {/* Action Row */}
                <div className="flex items-center justify-between gap-2">
                  {isOwner ? (
                    <button
                      type="button"
                      onClick={() => deletePost(post.id)}
                      className="inline-flex items-center gap-1 text-[11px] text-muted-foreground/50 hover:text-destructive transition-colors cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5" /> Hapus
                    </button>
                  ) : (
                    <span className="text-[11px] italic text-muted-foreground/40">Ruang aman bersama</span>
                  )}

                  <div className="flex items-center gap-2">
                    {/* Comment Button */}
                    <button
                      type="button"
                      onClick={() => openComments(post)}
                      className="inline-flex items-center gap-1.5 rounded-2xl border border-border/70 bg-muted/30 px-3.5 py-1.5 text-xs font-semibold text-foreground/80 hover:bg-muted hover:border-border transition-all cursor-pointer"
                    >
                      <MessageSquare className="h-3.5 w-3.5 text-muted-foreground" />
                      Diskusi {post.comments_count > 0 && <span className="text-muted-foreground">({post.comments_count})</span>}
                    </button>

                    {/* Hug Button */}
                    <button
                      type="button"
                      onClick={() => handleHug(post)}
                      className={`inline-flex items-center gap-1.5 rounded-2xl border px-3.5 py-1.5 text-xs font-bold transition-all duration-200 cursor-pointer active:scale-95 ${
                        isHugged
                          ? "border-teal-500 bg-teal-600 text-white shadow-xs shadow-teal-600/30"
                          : "border-teal-200/70 bg-teal-50/70 text-teal-700 hover:bg-teal-100/80 hover:border-teal-300"
                      }`}
                    >
                      <span className="text-base leading-none">🩵</span>
                      <span>{post.hugs_count > 0 ? post.hugs_count : ""} Saling Peluk</span>
                    </button>
                  </div>
                </div>
              </article>
            );
          })
        )}
      </div>

      {/* ─── Comments Modal ──────────────────────────────────── */}
      <ModalDialog
        open={!!commentPost}
        onClose={() => { setCommentPost(null); setNewComment(""); }}
        title="Diskusi & Balasan"
      >
        {commentPost && (
          <div className="space-y-5">
            {/* Quoted Post */}
            <div className="rounded-2xl border border-border/50 bg-muted/30 p-4 space-y-2.5">
              <div className="flex items-center justify-between text-[11px] text-muted-foreground font-semibold">
                <div className="flex items-center gap-1.5">
                  <IdentityBadge isAnonymous={commentPost.is_anonymous} />
                  <span>{commentPost.author_name}</span>
                </div>
                <span className="flex items-center gap-1 text-teal-600">
                  <span>🩵</span> {commentPost.hugs_count} pelukan
                </span>
              </div>
              <p className="text-sm text-foreground/80 italic leading-relaxed line-clamp-3">
                "{commentPost.content}"
              </p>
            </div>

            {/* Comments List */}
            <div className="space-y-2.5">
              <h4 className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                Balasan · {comments.length}
              </h4>

              {commentsLoading ? (
                <div className="py-6 text-center text-xs text-muted-foreground animate-pulse">Memuat komentar...</div>
              ) : comments.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-border py-8 text-center text-xs text-muted-foreground">
                  Belum ada balasan. Berikan ucapan yang menguatkan!
                </div>
              ) : (
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {comments.map((c) => {
                    const isCommentOwner = user?.id === c.user_id;
                    return (
                      <div key={c.id} className="group/comment flex gap-3 rounded-2xl border border-border/50 bg-card p-3.5 transition-colors hover:border-border">
                        <AuthorAvatar post={c} size="sm" />
                        <div className="flex-1 min-w-0 space-y-1.5">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-xs font-bold text-foreground">{c.author_name}</span>
                            <IdentityBadge isAnonymous={c.is_anonymous} />
                            <span className="text-[10px] text-muted-foreground">{timeAgo(c.created_at)}</span>
                            {isCommentOwner && (
                              <button
                                type="button"
                                onClick={() => deleteComment(c.id)}
                                className="ml-auto opacity-0 group-hover/comment:opacity-100 inline-flex items-center gap-1 text-[10px] text-muted-foreground/50 hover:text-destructive transition-all cursor-pointer"
                                title="Hapus komentar"
                              >
                                <Trash2 className="h-3 w-3" /> Hapus
                              </button>
                            )}
                          </div>
                          <p className="text-xs text-foreground/85 leading-relaxed">{c.content}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Comment Input */}
            <div className="space-y-3 border-t border-border/40 pt-4">
              {/* Anon/Publik toggle for comment */}
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-semibold text-muted-foreground">Balas sebagai:</span>
                <div className="flex items-center gap-1 rounded-2xl border border-border/60 bg-background p-0.5">
                  <button type="button" onClick={() => setCommentAnon(true)} className={`rounded-xl px-3 py-1 text-[11px] font-bold transition-all cursor-pointer ${commentAnon ? "bg-teal-600 text-white" : "text-muted-foreground"}`}>
                    🔒 Anonim
                  </button>
                  <button type="button" onClick={() => setCommentAnon(false)} className={`rounded-xl px-3 py-1 text-[11px] font-bold transition-all cursor-pointer ${!commentAnon ? "bg-indigo-600 text-white" : "text-muted-foreground"}`}>
                    👤 {displayName}
                  </button>
                </div>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && submitComment()}
                  placeholder={commentAnon ? "Tulis balasan anonim yang menguatkan..." : `Tulis sebagai ${displayName}...`}
                  className="flex-1 rounded-2xl border border-border/60 bg-muted/20 px-4 py-2.5 text-xs text-foreground placeholder:text-muted-foreground/50 focus:border-primary/50 focus:bg-background focus:outline-none focus:ring-1 focus:ring-primary/20 transition-all"
                />
                <button
                  type="button"
                  onClick={submitComment}
                  disabled={submittingComment || !newComment.trim()}
                  className="shrink-0 rounded-2xl bg-teal-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-teal-700 disabled:opacity-40 transition-all cursor-pointer flex items-center gap-1.5"
                >
                  {submittingComment ? <span className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" /> : <Send className="h-3.5 w-3.5" />}
                  Kirim
                </button>
              </div>
            </div>
          </div>
        )}
      </ModalDialog>
    </div>
  );
}
