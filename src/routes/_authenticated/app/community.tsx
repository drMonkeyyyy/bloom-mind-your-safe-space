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
  Heart,
  Sparkles,
  Lock,
  Globe,
  Users,
  ShieldCheck,
  Search,
  Filter,
  Trash2,
  Tag,
  UserCheck,
  TrendingUp,
  HeartHandshake
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
  { id: "Curhat", label: "💬 Curhat", color: "bg-teal-50 text-teal-700 border-teal-200" },
  { id: "SelfCare", label: "🌸 Self-Care", color: "bg-rose-50 text-rose-700 border-rose-200" },
  { id: "ButuhDukungan", label: "🫂 Butuh Peluk", color: "bg-amber-50 text-amber-800 border-amber-200" },
  { id: "Motivasi", label: "✨ Motivasi", color: "bg-emerald-50 text-emerald-800 border-emerald-200" },
  { id: "CeritaKecil", label: "📖 Cerita Hari Ini", color: "bg-sky-50 text-sky-800 border-sky-200" },
];

const AVATAR_OPTIONS = [
  { emoji: "🌸", label: "Sakura" },
  { emoji: "🌷", label: "Tulip" },
  { emoji: "🌿", label: "Daun" },
  { emoji: "🌻", label: "Sunflower" },
  { emoji: "🪷", label: "Lotus" },
  { emoji: "🎈", label: "Balon" },
  { emoji: "🧸", label: "Teddy" },
];

const INITIAL_STARTERS = [
  "Hari ini aku belajar bahwa tidak apa-apa jika belum sepenuhnya sembuh...",
  "Langkah kecil yang berhasil kubuat hari ini adalah...",
  "Tolong bisakah seseorang memberi ucapan hangat atau pelukan?",
  "Pesan apresiasi dari hatiku paling dalam untuk diriku...",
];

// Seed initial demo data showcasing both Public and Anonymous posts
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
    content: "Berat banget mengurai isi kepala sendirian... tapi berada di komunitas ini membuatku sadar kalau ada banyak jiwa yang saling menguatkan.",
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

function formatIndonesianDate(isoString: string): string {
  try {
    const date = new Date(isoString);
    const now = new Date();
    const diffMin = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffMin < 1) return "Baru saja";
    if (diffMin < 60) return `${diffMin} mnt yang lalu`;
    const diffHours = Math.floor(diffMin / 60);
    if (diffHours < 24) return `${diffHours} jam yang lalu`;

    const months = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
    return `${date.getDate()} ${months[date.getMonth()]}`;
  } catch (e) {
    return "Baru saja";
  }
}

function CommunityPage() {
  const { user } = useAuth();
  const { data: profile } = useProfile(user?.id);

  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Composer States
  const [newContent, setNewContent] = useState<string>("");
  const [isAnonymous, setIsAnonymous] = useState<boolean>(true); // Mode Anonim vs Mode Publik toggle
  const [selectedTag, setSelectedTag] = useState<string>("Curhat");
  const [selectedAvatar, setSelectedAvatar] = useState<string>("🌸");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Filter & Search
  const [activeTab, setActiveTab] = useState<"semua" | "anonim" | "publik" | "populer" | "saya">("semua");
  const [activeTagFilter, setActiveTagFilter] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Comment Modal state
  const [activePostForComments, setActivePostForComments] = useState<CommunityPost | null>(null);
  const [comments, setComments] = useState<PostComment[]>([]);
  const [commentsLoading, setCommentsLoading] = useState<boolean>(false);
  const [newCommentContent, setNewCommentContent] = useState<string>("");
  const [commentIsAnonymous, setCommentIsAnonymous] = useState<boolean>(true);
  const [isSubmittingComment, setIsSubmittingComment] = useState<boolean>(false);

  // Micro Hug Animation state
  const [animatingHugId, setAnimatingHugId] = useState<string | null>(null);

  // User displayName & Avatar Initials
  const publicDisplayName = profile?.name || user?.email?.split("@")[0] || "Anggota Bloom";
  const publicInitials = publicDisplayName.slice(0, 2).toUpperCase();

  // Load Posts from Supabase or LocalStorage Fallback
  const fetchPosts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("community_posts" as any)
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.warn("Supabase query warning, using local posts:", error.message);
        loadLocalPosts();
      } else if (data && data.length > 0) {
        let userHugs = new Set<string>();
        if (user) {
          const { data: hugsData } = await supabase
            .from("community_hugs" as any)
            .select("post_id")
            .eq("user_id", user.id);
          if (hugsData) {
            hugsData.forEach((h: any) => userHugs.add(h.post_id));
          }
        }
        const formatted: CommunityPost[] = data.map((p: any) => ({
          ...p,
          has_hugged: userHugs.has(p.id),
        }));
        setPosts(formatted);
      } else {
        loadLocalPosts();
      }
    } catch (e) {
      loadLocalPosts();
    } finally {
      setLoading(false);
    }
  };

  const loadLocalPosts = () => {
    try {
      const local = localStorage.getItem("bloom_community_posts_v2");
      if (local) {
        setPosts(JSON.parse(local));
      } else {
        setPosts(DEMO_POSTS);
        localStorage.setItem("bloom_community_posts_v2", JSON.stringify(DEMO_POSTS));
      }
    } catch (e) {
      setPosts(DEMO_POSTS);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [user?.id]);

  // Create Post
  const handleCreatePost = async () => {
    if (!newContent.trim()) {
      toast.error("Tuliskan ceritamu terlebih dahulu sebelum membagikannya.");
      return;
    }

    setIsSubmitting(true);
    const authorName = isAnonymous ? "Anonim" : publicDisplayName;
    const authorAvatar = isAnonymous ? selectedAvatar : publicInitials;

    const newPostObj: CommunityPost = {
      id: crypto.randomUUID(),
      user_id: user?.id || "guest-user",
      content: newContent.trim(),
      author_name: authorName,
      author_avatar: authorAvatar,
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
          id: newPostObj.id,
          user_id: user.id,
          content: newPostObj.content,
          author_name: newPostObj.author_name,
          author_avatar: newPostObj.author_avatar,
          is_anonymous: newPostObj.is_anonymous,
          tag: newPostObj.tag,
          hugs_count: 0,
          comments_count: 0,
        });
      }

      const updated = [newPostObj, ...posts];
      setPosts(updated);
      localStorage.setItem("bloom_community_posts_v2", JSON.stringify(updated));

      setNewContent("");
      toast.success(
        isAnonymous
          ? "Ceritamu berhasil dibagikan secara Anonim! 🔒"
          : `Postingan publik terbit sebagai ${publicDisplayName}! 👤`,
        {
          description: "Terima kasih sudah berbagi ruang positif di Bloom Mind.",
        }
      );
    } catch (e) {
      toast.error("Terjadi kesalahan saat membagikan postingan.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Toggle Hug ("Saling Peluk")
  const handleToggleHug = async (post: CommunityPost) => {
    const isHugged = post.has_hugged;
    const newCount = isHugged ? Math.max(0, post.hugs_count - 1) : post.hugs_count + 1;

    if (!isHugged) {
      setAnimatingHugId(post.id);
      setTimeout(() => setAnimatingHugId(null), 1000);
    }

    const updatedPosts = posts.map((p) =>
      p.id === post.id ? { ...p, hugs_count: newCount, has_hugged: !isHugged } : p
    );
    setPosts(updatedPosts);
    localStorage.setItem("bloom_community_posts_v2", JSON.stringify(updatedPosts));

    if (user) {
      try {
        if (isHugged) {
          await supabase.from("community_hugs" as any).delete().eq("post_id", post.id).eq("user_id", user.id);
        } else {
          await supabase.from("community_hugs" as any).insert({ post_id: post.id, user_id: user.id });
        }
        await supabase.from("community_posts" as any).update({ hugs_count: newCount }).eq("id", post.id);
      } catch (e) {
        console.warn("DB hug toggle error:", e);
      }
    }

    if (!isHugged) {
      toast("Kamu mengirim pelukan hangat 🫂🩵", {
        description: "Dukunganmu membawa kekuatan untuk sesama anggota.",
      });
    }
  };

  // Open Comments
  const handleOpenComments = async (post: CommunityPost) => {
    setActivePostForComments(post);
    setCommentsLoading(true);

    try {
      if (user) {
        const { data, error } = await supabase
          .from("community_comments" as any)
          .select("*")
          .eq("post_id", post.id)
          .order("created_at", { ascending: true });

        if (!error && data) {
          setComments(data as PostComment[]);
          setCommentsLoading(false);
          return;
        }
      }
      const demoList = DEMO_COMMENTS[post.id] || [];
      const savedKey = `bloom_community_comments_v2_${post.id}`;
      const saved = localStorage.getItem(savedKey);
      setComments(saved ? JSON.parse(saved) : demoList);
    } catch (e) {
      setComments(DEMO_COMMENTS[post.id] || []);
    } finally {
      setCommentsLoading(false);
    }
  };

  // Add Comment
  const handleAddComment = async () => {
    if (!newCommentContent.trim() || !activePostForComments) return;

    setIsSubmittingComment(true);
    const authorName = commentIsAnonymous ? "Anonim" : publicDisplayName;
    const authorAvatar = commentIsAnonymous ? selectedAvatar : publicInitials;

    const newCommentObj: PostComment = {
      id: crypto.randomUUID(),
      post_id: activePostForComments.id,
      user_id: user?.id || "guest-user",
      content: newCommentContent.trim(),
      author_name: authorName,
      author_avatar: authorAvatar,
      is_anonymous: commentIsAnonymous,
      created_at: new Date().toISOString(),
    };

    try {
      if (user) {
        await supabase.from("community_comments" as any).insert({
          id: newCommentObj.id,
          post_id: activePostForComments.id,
          user_id: user.id,
          content: newCommentObj.content,
          author_name: newCommentObj.author_name,
          author_avatar: newCommentObj.author_avatar,
          is_anonymous: newCommentObj.is_anonymous,
        });

        const newCommCount = activePostForComments.comments_count + 1;
        await supabase
          .from("community_posts" as any)
          .update({ comments_count: newCommCount })
          .eq("id", activePostForComments.id);
      }

      const updatedComments = [...comments, newCommentObj];
      setComments(updatedComments);
      localStorage.setItem(`bloom_community_comments_v2_${activePostForComments.id}`, JSON.stringify(updatedComments));

      const updatedPosts = posts.map((p) =>
        p.id === activePostForComments.id ? { ...p, comments_count: p.comments_count + 1 } : p
      );
      setPosts(updatedPosts);
      localStorage.setItem("bloom_community_posts_v2", JSON.stringify(updatedPosts));

      setNewCommentContent("");
      toast.success("Komentar berhasil terkirim!");
    } catch (e) {
      toast.error("Gagal mengirim komentar.");
    } finally {
      setIsSubmittingComment(false);
    }
  };

  // Delete Post
  const handleDeletePost = async (postId: string) => {
    if (!confirm("Apakah kamu yakin ingin menghapus postingan ini?")) return;

    try {
      if (user) {
        await supabase.from("community_posts" as any).delete().eq("id", postId);
      }
      const updated = posts.filter((p) => p.id !== postId);
      setPosts(updated);
      localStorage.setItem("bloom_community_posts_v2", JSON.stringify(updated));
      toast.success("Postingan berhasil dihapus.");
    } catch (e) {
      toast.error("Gagal menghapus postingan.");
    }
  };

  // Filtered Posts
  const filteredPosts = useMemo(() => {
    let result = [...posts];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) => p.content.toLowerCase().includes(q) || p.author_name.toLowerCase().includes(q)
      );
    }

    if (activeTagFilter) {
      result = result.filter((p) => p.tag === activeTagFilter);
    }

    if (activeTab === "anonim") {
      result = result.filter((p) => p.is_anonymous);
    } else if (activeTab === "publik") {
      result = result.filter((p) => !p.is_anonymous);
    } else if (activeTab === "populer") {
      result.sort((a, b) => b.hugs_count - a.hugs_count);
    } else if (activeTab === "saya") {
      result = result.filter((p) => p.user_id === user?.id);
    }

    return result;
  }, [posts, activeTab, activeTagFilter, searchQuery, user?.id]);

  const totalHugsAll = useMemo(() => posts.reduce((sum, p) => sum + p.hugs_count, 0), [posts]);

  return (
    <div className="mx-auto max-w-3xl space-y-6 pb-24 pt-2 sm:pt-4 px-3 sm:px-4">
      {/* ─── Ambient Header Greeting Card ─── */}
      <div className="relative overflow-hidden rounded-3xl border border-teal-100 bg-gradient-to-br from-teal-500/10 via-emerald-500/5 to-rose-500/10 p-5 sm:p-7 shadow-xs">
        <div className="relative z-10 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-teal-600/10 px-3 py-1 text-xs font-bold text-teal-800 border border-teal-200/60 backdrop-blur-xs">
              <Users className="h-3.5 w-3.5 text-teal-600" /> Ruang Komunitas Bloom
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-100/60 px-2.5 py-0.5 rounded-full">
              <ShieldCheck className="h-3 w-3" /> Pilihan Anonim & Publik
            </span>
          </div>

          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground font-display">
              Ruang Saling Peluk & Menguatkan
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-2xl">
              Berbagilah cerita tanpa rasa takut dinilai. Kamu bebas memilih untuk membagikannya secara{" "}
              <strong className="text-teal-700 font-semibold">100% Anonim</strong> atau{" "}
              <strong className="text-indigo-700 font-semibold">Dengan Nama Profil</strong>.
            </p>
          </div>

          {/* Quick Stats Widget */}
          <div className="flex items-center gap-4 pt-2 text-xs font-semibold text-muted-foreground">
            <div className="flex items-center gap-1.5 bg-background/80 px-3 py-1.5 rounded-2xl border border-border/50">
              <HeartHandshake className="h-4 w-4 text-teal-600" />
              <span>
                <strong className="text-foreground font-bold">{totalHugsAll}</strong> Pelukan Terbagikan
              </span>
            </div>
            <div className="flex items-center gap-1.5 bg-background/80 px-3 py-1.5 rounded-2xl border border-border/50">
              <Sparkles className="h-4 w-4 text-amber-500" />
              <span>
                <strong className="text-foreground font-bold">{posts.length}</strong> Cerita Menguatkan
              </span>
            </div>
          </div>
        </div>

        {/* Ambient background glow orb */}
        <div className="absolute -right-8 -top-8 h-36 w-36 rounded-full bg-teal-400/10 blur-2xl pointer-events-none" />
      </div>

      {/* ─── Creative Post Composer Card ─── */}
      <div className="rounded-3xl border border-border/80 bg-card p-4 sm:p-6 shadow-sm space-y-4">
        {/* Mode Toggle Bar (Anonim vs Publik) */}
        <div className="flex items-center justify-between gap-2 p-1.5 bg-muted/50 rounded-2xl border border-border/40">
          <span className="text-xs font-semibold text-muted-foreground pl-2 hidden sm:inline">
            Mode Identitas Post:
          </span>

          <div className="flex items-center gap-1.5 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => setIsAnonymous(true)}
              className={`flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                isAnonymous
                  ? "bg-teal-600 text-white shadow-xs"
                  : "text-muted-foreground hover:bg-background/60"
              }`}
            >
              <Lock className="h-3.5 w-3.5" />
              <span>🔒 Mode Anonim</span>
            </button>

            <button
              type="button"
              onClick={() => setIsAnonymous(false)}
              className={`flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                !isAnonymous
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "text-muted-foreground hover:bg-background/60"
              }`}
            >
              <Globe className="h-3.5 w-3.5" />
              <span>👤 Mode Publik</span>
            </button>
          </div>
        </div>

        {/* Identity Preview Badge */}
        <div className="flex items-center justify-between text-xs px-1">
          {isAnonymous ? (
            <div className="flex items-center gap-2 text-teal-700 bg-teal-50 px-3 py-1 rounded-full border border-teal-200/60">
              <span>{selectedAvatar}</span>
              <span className="font-semibold">Bercerita sebagai {selectedAvatar} Anonim</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-indigo-700 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-200/60">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600 text-white text-[10px] font-bold">
                {publicInitials}
              </span>
              <span className="font-semibold">Bercerita sebagai {publicDisplayName} (Profil Terverifikasi)</span>
            </div>
          )}

          <span className="text-muted-foreground/70 text-[11px] hidden sm:inline">
            {newContent.length}/50.000 karakter
          </span>
        </div>

        {/* Textarea */}
        <textarea
          value={newContent}
          onChange={(e) => setNewContent(e.target.value)}
          maxLength={50000}
          placeholder={
            isAnonymous
              ? "Tulis ceritamu di sini (100% rahasia & tanpa nama profil)..."
              : `Bagikan pengalaman atau pikiran positifmu sebagai ${publicDisplayName}...`
          }
          className="w-full min-h-[120px] sm:min-h-[130px] resize-none rounded-2xl border border-border/60 bg-background/60 p-4 text-sm sm:text-base text-foreground placeholder:text-muted-foreground/60 focus:border-teal-500 focus:bg-background focus:outline-none focus:ring-2 focus:ring-teal-500/20 transition-all leading-relaxed"
        />

        {/* Anonymous Avatar Selector (Only if isAnonymous) */}
        {isAnonymous && (
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <span className="text-[11px] font-medium text-muted-foreground shrink-0">Pilih Avatar Anonim:</span>
            {AVATAR_OPTIONS.map((av) => (
              <button
                key={av.emoji}
                type="button"
                onClick={() => setSelectedAvatar(av.emoji)}
                className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-xs transition-all shrink-0 cursor-pointer ${
                  selectedAvatar === av.emoji
                    ? "bg-teal-100 text-teal-800 ring-1 ring-teal-400 font-bold scale-105"
                    : "bg-muted/40 text-muted-foreground hover:bg-muted"
                }`}
              >
                <span>{av.emoji}</span>
              </button>
            ))}
          </div>
        )}

        {/* Tag Category Selector */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-[11px] font-medium text-muted-foreground mr-1 flex items-center gap-1">
            <Tag className="h-3 w-3" /> Tag Kategori:
          </span>
          {TAG_OPTIONS.map((tag) => (
            <button
              key={tag.id}
              type="button"
              onClick={() => setSelectedTag(tag.id)}
              className={`rounded-full px-3 py-1 text-xs font-medium border transition-all cursor-pointer ${
                selectedTag === tag.id
                  ? `${tag.color} ring-1 font-bold shadow-2xs`
                  : "bg-background text-muted-foreground border-border/50 hover:bg-muted/40"
              }`}
            >
              {tag.label}
            </button>
          ))}
        </div>

        {/* Quick Starter Prompts */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-[11px] font-medium text-muted-foreground mr-1 flex items-center gap-1">
            <Sparkles className="h-3 w-3 text-amber-500" /> Inspirasi:
          </span>
          {INITIAL_STARTERS.map((prompt, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setNewContent(prompt)}
              className="rounded-full bg-secondary/60 px-2.5 py-0.5 text-[11px] font-medium text-secondary-foreground hover:bg-teal-50 hover:text-teal-700 transition-all text-left border border-border/40 cursor-pointer"
            >
              {prompt.slice(0, 30)}...
            </button>
          ))}
        </div>

        {/* Submit Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-border/40">
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            {isAnonymous ? (
              <span className="flex items-center gap-1 text-emerald-600 font-medium">
                <Lock className="h-3 w-3" /> Identitas tersembunyi
              </span>
            ) : (
              <span className="flex items-center gap-1 text-indigo-600 font-medium">
                <Globe className="h-3 w-3" /> Terbit sebagai postingan publik
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={handleCreatePost}
            disabled={isSubmitting || !newContent.trim()}
            className={`inline-flex items-center justify-center gap-2 rounded-full font-bold px-6 py-2.5 text-xs sm:text-sm text-white shadow-md transition-all duration-200 cursor-pointer ${
              isAnonymous
                ? "bg-teal-600 hover:bg-teal-700 shadow-teal-600/20"
                : "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/20"
            } disabled:opacity-50 disabled:cursor-not-allowed active:scale-98`}
          >
            {isSubmitting ? (
              <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            <span>{isAnonymous ? "Bagikan Anonim" : "Bagikan Publik"}</span>
          </button>
        </div>
      </div>

      {/* ─── Filtering & Tab Navigation ─── */}
      <div className="space-y-3 pt-2">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none rounded-2xl bg-muted/60 p-1 border border-border/50">
            <button
              type="button"
              onClick={() => setActiveTab("semua")}
              className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all shrink-0 cursor-pointer ${
                activeTab === "semua"
                  ? "bg-background text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Semua
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("anonim")}
              className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all shrink-0 cursor-pointer ${
                activeTab === "anonim"
                  ? "bg-teal-600 text-white shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              🔒 Anonim
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("publik")}
              className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all shrink-0 cursor-pointer ${
                activeTab === "publik"
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              👤 Publik
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("populer")}
              className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all shrink-0 cursor-pointer ${
                activeTab === "populer"
                  ? "bg-background text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              🔥 Paling Menguatkan
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("saya")}
              className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all shrink-0 cursor-pointer ${
                activeTab === "saya"
                  ? "bg-background text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Post Saya
            </button>
          </div>

          {/* Search Input */}
          <div className="relative max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari postingan..."
              className="w-full rounded-2xl border border-border/60 bg-background/80 pl-8 pr-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground/60 focus:border-teal-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Tag Filters */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] font-semibold text-muted-foreground mr-1">Filter Tag:</span>
          <button
            type="button"
            onClick={() => setActiveTagFilter(null)}
            className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold transition-all cursor-pointer ${
              activeTagFilter === null
                ? "bg-foreground text-background font-bold"
                : "bg-muted/50 text-muted-foreground hover:bg-muted"
            }`}
          >
            Semua Tag
          </button>
          {TAG_OPTIONS.map((tag) => (
            <button
              key={tag.id}
              type="button"
              onClick={() => setActiveTagFilter(activeTagFilter === tag.id ? null : tag.id)}
              className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold transition-all cursor-pointer ${
                activeTagFilter === tag.id
                  ? `${tag.color} ring-1 font-bold`
                  : "bg-muted/40 text-muted-foreground hover:bg-muted"
              }`}
            >
              {tag.label}
            </button>
          ))}
        </div>
      </div>

      {/* ─── Community Posts Feed ─── */}
      <div className="space-y-4 pt-1">
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((n) => (
              <div key={n} className="rounded-3xl border border-border/40 p-6 bg-card/50 space-y-3 animate-pulse">
                <div className="h-4 bg-muted rounded-full w-3/4" />
                <div className="h-4 bg-muted rounded-full w-1/2" />
              </div>
            ))}
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-border p-10 text-center space-y-3 bg-card/30">
            <div className="mx-auto h-12 w-12 rounded-full bg-teal-50 grid place-items-center text-teal-600 text-xl">
              🌸
            </div>
            <h3 className="font-semibold text-sm text-foreground">Belum ada cerita di filter ini</h3>
            <p className="text-xs text-muted-foreground max-w-xs mx-auto">
              Cobalah memilih mode filter lain atau jadilah yang pertama membagikan pikiran positifmu!
            </p>
          </div>
        ) : (
          filteredPosts.map((post) => {
            const isOwner = user?.id === post.user_id;
            const tagInfo = TAG_OPTIONS.find((t) => t.id === post.tag) || TAG_OPTIONS[0];

            return (
              <div
                key={post.id}
                className="group relative rounded-3xl border border-border/60 bg-card p-5 sm:p-6 shadow-2xs hover:shadow-md transition-all duration-300 hover:border-teal-200/80"
              >
                {/* Micro Hug particle animation */}
                {animatingHugId === post.id && (
                  <div className="absolute top-4 right-6 pointer-events-none animate-bounce text-2xl z-20">
                    🩵 🫂
                  </div>
                )}

                <div className="space-y-4">
                  {/* Top Bar: Author & Tag */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      {/* Avatar */}
                      {post.is_anonymous ? (
                        <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-teal-50 text-base border border-teal-200/70 shrink-0">
                          {post.author_avatar || "🌸"}
                        </span>
                      ) : (
                        <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white font-bold text-xs shadow-2xs shrink-0">
                          {post.author_avatar || "U"}
                        </span>
                      )}

                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-foreground">{post.author_name}</span>

                          {/* Identity Badge */}
                          {post.is_anonymous ? (
                            <span className="rounded-full bg-teal-50 px-2 py-0.5 text-[10px] font-semibold text-teal-700 border border-teal-200/60 inline-flex items-center gap-0.5">
                              <Lock className="h-2.5 w-2.5" /> Anonim
                            </span>
                          ) : (
                            <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-semibold text-indigo-700 border border-indigo-200/60 inline-flex items-center gap-0.5">
                              <Globe className="h-2.5 w-2.5" /> Publik
                            </span>
                          )}

                          {isOwner && (
                            <span className="rounded-full bg-emerald-100/70 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                              Post Anda
                            </span>
                          )}
                        </div>

                        <span className="text-[11px] text-muted-foreground/80">
                          {formatIndonesianDate(post.created_at)}
                        </span>
                      </div>
                    </div>

                    {/* Tag Badge */}
                    <span className={`rounded-full px-3 py-1 text-[11px] font-semibold border ${tagInfo.color}`}>
                      {tagInfo.label}
                    </span>
                  </div>

                  {/* Post Content */}
                  <p className="text-sm sm:text-base text-foreground/90 leading-relaxed font-normal whitespace-pre-line pt-1">
                    {post.content}
                  </p>

                  {/* Divider */}
                  <div className="h-px w-full bg-border/40" />

                  {/* Bottom Actions */}
                  <div className="flex items-center justify-between gap-3 pt-1">
                    {/* Delete option if owner */}
                    {isOwner ? (
                      <button
                        type="button"
                        onClick={() => handleDeletePost(post.id)}
                        className="inline-flex items-center gap-1 text-xs text-muted-foreground/60 hover:text-red-500 transition-all cursor-pointer"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        <span className="hidden sm:inline">Hapus</span>
                      </button>
                    ) : (
                      <span className="text-[11px] text-muted-foreground/60 italic">Ruang aman bersama</span>
                    )}

                    {/* Right Action Pill Buttons */}
                    <div className="flex items-center gap-2">
                      {/* Diskusi */}
                      <button
                        type="button"
                        onClick={() => handleOpenComments(post)}
                        className="inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-background/80 px-3.5 py-1.5 text-xs font-semibold text-foreground hover:bg-secondary transition-all active:scale-95 cursor-pointer shadow-2xs"
                      >
                        <MessageSquare className="h-3.5 w-3.5 text-muted-foreground" />
                        <span>Diskusi ({post.comments_count || 0})</span>
                      </button>

                      {/* Peluk & Menguatkan */}
                      <button
                        type="button"
                        onClick={() => handleToggleHug(post)}
                        className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-bold transition-all active:scale-95 cursor-pointer shadow-2xs ${
                          post.has_hugged
                            ? "bg-teal-600 text-white border-teal-600 shadow-teal-600/30"
                            : "bg-teal-50 text-teal-700 border-teal-200 hover:bg-teal-100/70"
                        }`}
                      >
                        <span className="text-sm">🩵 🫂</span>
                        <span>Saling Peluk ({post.hugs_count || 0})</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ─── Comments & Discussion Modal ─── */}
      <ModalDialog
        isOpen={!!activePostForComments}
        onClose={() => setActivePostForComments(null)}
        title="💬 Utas Diskusi & Balasan"
      >
        {activePostForComments && (
          <div className="space-y-4 pt-1">
            {/* Target Post Quote */}
            <div className="rounded-2xl bg-muted/40 p-4 border border-border/50 space-y-2">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span className="font-semibold">
                  {activePostForComments.is_anonymous ? "🔒 Anonim" : `👤 ${activePostForComments.author_name}`}
                </span>
                <span>🩵 {activePostForComments.hugs_count} Pelukan</span>
              </div>
              <p className="text-sm text-foreground italic">"{activePostForComments.content}"</p>
            </div>

            {/* Comments List */}
            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Komentar & Balasan ({comments.length})
              </h4>

              {commentsLoading ? (
                <div className="p-4 text-center text-xs text-muted-foreground">Memuat komentar...</div>
              ) : comments.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-border p-6 text-center text-xs text-muted-foreground">
                  Belum ada balasan. Berikan pesan yang menguatkan!
                </div>
              ) : (
                comments.map((c) => (
                  <div key={c.id} className="rounded-2xl bg-card border border-border/60 p-3.5 space-y-1.5 shadow-2xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs">{c.author_avatar || "🌸"}</span>
                        <span className="text-xs font-bold text-foreground">{c.author_name}</span>
                        {c.is_anonymous ? (
                          <span className="text-[9px] bg-teal-50 text-teal-700 px-1.5 py-0.2 rounded-full border border-teal-200">
                            Anonim
                          </span>
                        ) : (
                          <span className="text-[9px] bg-indigo-50 text-indigo-700 px-1.5 py-0.2 rounded-full border border-indigo-200">
                            Publik
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-muted-foreground">
                        {formatIndonesianDate(c.created_at)}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-foreground/90 leading-relaxed pl-5">
                      {c.content}
                    </p>
                  </div>
                ))
              )}
            </div>

            {/* Comment Form */}
            <div className="space-y-3 pt-3 border-t border-border">
              {/* Comment Mode Selector */}
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-muted-foreground">Kirim komentar sebagai:</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setCommentIsAnonymous(true)}
                    className={`px-2.5 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                      commentIsAnonymous
                        ? "bg-teal-600 text-white"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    🔒 Anonim
                  </button>
                  <button
                    type="button"
                    onClick={() => setCommentIsAnonymous(false)}
                    className={`px-2.5 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                      !commentIsAnonymous
                        ? "bg-indigo-600 text-white"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    👤 {publicDisplayName}
                  </button>
                </div>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={newCommentContent}
                  onChange={(e) => setNewCommentContent(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddComment()}
                  placeholder={
                    commentIsAnonymous
                      ? "Tulis balasan anonim yang menguatkan..."
                      : `Tulis balasan sebagai ${publicDisplayName}...`
                  }
                  className="flex-1 rounded-2xl border border-border bg-background px-4 py-2.5 text-xs sm:text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-teal-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleAddComment}
                  disabled={isSubmittingComment || !newCommentContent.trim()}
                  className="rounded-2xl bg-teal-600 text-white px-4 py-2.5 text-xs font-bold hover:bg-teal-700 disabled:opacity-50 transition-all flex items-center justify-center shrink-0 cursor-pointer"
                >
                  {isSubmittingComment ? "..." : "Kirim"}
                </button>
              </div>
            </div>
          </div>
        )}
      </ModalDialog>
    </div>
  );
}
