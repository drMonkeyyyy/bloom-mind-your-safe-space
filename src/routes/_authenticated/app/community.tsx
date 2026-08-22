import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ModalDialog } from "@/components/app/BottomSheet";
import {
  MessageSquare,
  Send,
  Heart,
  Sparkles,
  Lock,
  Users,
  Smile,
  ShieldCheck,
  Search,
  Filter,
  CheckCircle2,
  Share2,
  Trash2
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
  created_at: string;
}

interface CommunityPost {
  id: string;
  user_id: string;
  content: string;
  author_name: string;
  author_avatar: string;
  hugs_count: number;
  comments_count: number;
  created_at: string;
  has_hugged?: boolean;
}

const AVATAR_OPTIONS = [
  { emoji: "🌸", label: "Bunga Sakur" },
  { emoji: "🌷", label: "Tulip Merah" },
  { emoji: "🌿", label: "Daun Sejuk" },
  { emoji: "🌻", label: "Bunga Matahari" },
  { emoji: "🪷", label: "Lotus Anggun" },
  { emoji: "🎈", label: "Balon Harapan" },
  { emoji: "🧸", label: "Boneka Hangat" },
];

const INITIAL_STARTERS = [
  "Hari ini aku belajar bahwa tidak apa-apa jika belum sepenuhnya sembuh...",
  "Padahal aku sudah berusaha yang terbaik, tapi kenapa...",
  "Tolong bisakah seseorang memberi ucapan semangat hari ini?",
  "Terima kasih untuk diriku karena sudah bertahan sejauh ini...",
];

// Fallback demo posts matching exact screenshot reference
const DEMO_POSTS: CommunityPost[] = [
  {
    id: "demo-1",
    user_id: "demo-user-1",
    content: "Padahal aku hanya menyelamatkan diriku agar tidak semakin jatuh dan sakit. Tapi kenapa rasanya sesakit ini",
    author_name: "Anonim",
    author_avatar: "🌸",
    hugs_count: 3,
    comments_count: 0,
    created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    has_hugged: false,
  },
  {
    id: "demo-2",
    user_id: "demo-user-2",
    content: "Gapapa mungkin belum saatnya",
    author_name: "Anonim",
    author_avatar: "🌸",
    hugs_count: 2,
    comments_count: 1,
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    has_hugged: true,
  },
  {
    id: "demo-3",
    user_id: "demo-user-3",
    content: "berat bgt hari ini, rasanya lelah banget mengurus pikiran sendiri tanpa ada tempat bercerita.",
    author_name: "Anonim",
    author_avatar: "🌸",
    hugs_count: 5,
    comments_count: 2,
    created_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    has_hugged: false,
  },
];

const DEMO_COMMENTS: Record<string, PostComment[]> = {
  "demo-2": [
    {
      id: "comment-1",
      post_id: "demo-2",
      user_id: "demo-user-4",
      content: "Peluk erat dari jauh 🤗 Semua akan indah pada waktunya, percayalah kamu tidak sendirian.",
      author_name: "Anonim",
      author_avatar: "🌿",
      created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ],
  "demo-3": [
    {
      id: "comment-2",
      post_id: "demo-3",
      user_id: "demo-user-5",
      content: "Napas dulu sejenak ya... istirahatlah jika lelah. Kamu hebat sudah bertahan sejauh ini! ❤️",
      author_name: "Anonim",
      author_avatar: "🌻",
      created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ],
};

function formatIndonesianDate(isoString: string): string {
  try {
    const date = new Date(isoString);
    const months = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
    const day = date.getDate();
    const month = months[date.getMonth()];
    return `${day} ${month}`;
  } catch (e) {
    return "Baru saja";
  }
}

function CommunityPage() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [newContent, setNewContent] = useState<string>("");
  const [selectedAvatar, setSelectedAvatar] = useState<string>("🌸");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<"semua" | "populer" | "saya">("semua");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Comment Modal state
  const [activePostForComments, setActivePostForComments] = useState<CommunityPost | null>(null);
  const [comments, setComments] = useState<PostComment[]>([]);
  const [commentsLoading, setCommentsLoading] = useState<boolean>(false);
  const [newCommentContent, setNewCommentContent] = useState<string>("");
  const [isSubmittingComment, setIsSubmittingComment] = useState<boolean>(false);

  // Hug Animation state tracker for post IDs
  const [animatingHugId, setAnimatingHugId] = useState<string | null>(null);

  // Fetch Posts from Supabase or Fallback LocalStorage/Demo
  const fetchPosts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("community_posts" as any)
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.warn("Supabase community query warning:", error.message);
        loadLocalPosts();
      } else if (data && data.length > 0) {
        // Fetch user's hugs to mark has_hugged
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
      console.error("Error fetching posts:", e);
      loadLocalPosts();
    } finally {
      setLoading(false);
    }
  };

  const loadLocalPosts = () => {
    try {
      const local = localStorage.getItem("bloom_community_posts");
      if (local) {
        setPosts(JSON.parse(local));
      } else {
        setPosts(DEMO_POSTS);
        localStorage.setItem("bloom_community_posts", JSON.stringify(DEMO_POSTS));
      }
    } catch (e) {
      setPosts(DEMO_POSTS);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [user?.id]);

  // Handle Post Creation
  const handleCreatePost = async () => {
    if (!newContent.trim()) {
      toast.error("Tuliskan ceritamu terlebih dahulu sebelum membagikannya.");
      return;
    }

    setIsSubmitting(true);
    const newPostObj: CommunityPost = {
      id: crypto.randomUUID(),
      user_id: user?.id || "guest-user",
      content: newContent.trim(),
      author_name: "Anonim",
      author_avatar: selectedAvatar,
      hugs_count: 0,
      comments_count: 0,
      created_at: new Date().toISOString(),
      has_hugged: false,
    };

    try {
      if (user) {
        const { error } = await supabase.from("community_posts" as any).insert({
          id: newPostObj.id,
          user_id: user.id,
          content: newPostObj.content,
          author_name: newPostObj.author_name,
          author_avatar: newPostObj.author_avatar,
          hugs_count: 0,
          comments_count: 0,
        });

        if (error) {
          console.warn("Failed to insert to Supabase, saving locally:", error);
        }
      }

      // Update state & LocalStorage
      const updated = [newPostObj, ...posts];
      setPosts(updated);
      localStorage.setItem("bloom_community_posts", JSON.stringify(updated));

      setNewContent("");
      toast.success("Ceritamu berhasil dibagikan secara 100% anonim!", {
        description: "Tempat aman ini menyambut curhatanmu dengan hangat.",
        icon: "🌸",
      });
    } catch (e) {
      toast.error("Terjadi kesalahan saat membagikan postingan.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Hug Toggle ("Saling Peluk")
  const handleToggleHug = async (post: CommunityPost) => {
    const isHugged = post.has_hugged;
    const newCount = isHugged ? Math.max(0, post.hugs_count - 1) : post.hugs_count + 1;

    // Trigger Heart Micro-animation
    if (!isHugged) {
      setAnimatingHugId(post.id);
      setTimeout(() => setAnimatingHugId(null), 1000);
    }

    // Optimistic update
    const updatedPosts = posts.map((p) =>
      p.id === post.id ? { ...p, hugs_count: newCount, has_hugged: !isHugged } : p
    );
    setPosts(updatedPosts);
    localStorage.setItem("bloom_community_posts", JSON.stringify(updatedPosts));

    if (user) {
      try {
        if (isHugged) {
          await supabase
            .from("community_hugs" as any)
            .delete()
            .eq("post_id", post.id)
            .eq("user_id", user.id);
        } else {
          await supabase.from("community_hugs" as any).insert({
            post_id: post.id,
            user_id: user.id,
          });
        }
        // Update post hugs count
        await supabase
          .from("community_posts" as any)
          .update({ hugs_count: newCount })
          .eq("id", post.id);
      } catch (e) {
        console.warn("Error toggling hug in DB:", e);
      }
    }

    if (!isHugged) {
      toast("Kamu mengirim pelukan hangat 🫂🩵", {
        description: "Dukunganmu sangat berarti bagi sesama anggota.",
      });
    }
  };

  // Open Comment Modal & Fetch Comments
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
      // Fallback local/demo comments
      const demoList = DEMO_COMMENTS[post.id] || [];
      const localCommentsKey = `bloom_community_comments_${post.id}`;
      const saved = localStorage.getItem(localCommentsKey);
      setComments(saved ? JSON.parse(saved) : demoList);
    } catch (e) {
      setComments(DEMO_COMMENTS[post.id] || []);
    } finally {
      setCommentsLoading(false);
    }
  };

  // Submit Comment
  const handleAddComment = async () => {
    if (!newCommentContent.trim() || !activePostForComments) return;

    setIsSubmittingComment(true);
    const newCommentObj: PostComment = {
      id: crypto.randomUUID(),
      post_id: activePostForComments.id,
      user_id: user?.id || "guest-user",
      content: newCommentContent.trim(),
      author_name: "Anonim",
      author_avatar: selectedAvatar,
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
        });

        // Increment comment count
        const newCommCount = activePostForComments.comments_count + 1;
        await supabase
          .from("community_posts" as any)
          .update({ comments_count: newCommCount })
          .eq("id", activePostForComments.id);
      }

      const updatedComments = [...comments, newCommentObj];
      setComments(updatedComments);
      const localCommentsKey = `bloom_community_comments_${activePostForComments.id}`;
      localStorage.setItem(localCommentsKey, JSON.stringify(updatedComments));

      // Update post state comments_count
      const updatedPosts = posts.map((p) =>
        p.id === activePostForComments.id
          ? { ...p, comments_count: p.comments_count + 1 }
          : p
      );
      setPosts(updatedPosts);
      localStorage.setItem("bloom_community_posts", JSON.stringify(updatedPosts));

      setNewCommentContent("");
      toast.success("Komentar anonim berhasil terkirim!");
    } catch (e) {
      toast.error("Gagal mengirim komentar.");
    } finally {
      setIsSubmittingComment(false);
    }
  };

  // Delete Post (owner only)
  const handleDeletePost = async (postId: string) => {
    if (!confirm("Apakah kamu yakin ingin menghapus postingan ini?")) return;

    try {
      if (user) {
        await supabase.from("community_posts" as any).delete().eq("id", postId);
      }
      const updated = posts.filter((p) => p.id !== postId);
      setPosts(updated);
      localStorage.setItem("bloom_community_posts", JSON.stringify(updated));
      toast.success("Postingan berhasil dihapus.");
    } catch (e) {
      toast.error("Gagal menghapus postingan.");
    }
  };

  // Filtered & Sorted Posts
  const filteredPosts = useMemo(() => {
    let result = [...posts];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((p) => p.content.toLowerCase().includes(q));
    }

    if (activeTab === "populer") {
      result.sort((a, b) => b.hugs_count - a.hugs_count);
    } else if (activeTab === "saya") {
      result = result.filter((p) => p.user_id === user?.id);
    }

    return result;
  }, [posts, activeTab, searchQuery, user?.id]);

  return (
    <div className="mx-auto max-w-3xl space-y-6 pb-20 pt-2 sm:pt-4 px-3 sm:px-4">
      {/* ─── Header Section (Pill + Title + Subtitle) ─── */}
      <div className="space-y-3.5">
        <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50/90 px-3.5 py-1.5 text-xs font-semibold text-teal-800 border border-teal-200/70 shadow-2xs backdrop-blur-sm">
          <Users className="h-4 w-4 text-teal-600 shrink-0" />
          <span>Dinding Dukungan Anonim · Terbuka Untuk Semua Member</span>
        </div>

        <div className="space-y-1.5">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground font-display">
            Saling Peluk & Menguatkan
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground/90 leading-relaxed">
            Semua postingan ditampilkan secara 100% anonim. Tempat aman untuk saling curhat, berkomen, saling menguatkan, dan berkarya bersama.
          </p>
        </div>
      </div>

      {/* ─── Post Composer Card ─── */}
      <div className="rounded-3xl border border-border/70 bg-card p-4 sm:p-6 shadow-sm transition-all hover:border-primary/30">
        <div className="space-y-4">
          <div className="relative">
            <textarea
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              maxLength={50000}
              placeholder="Hari ini aku belajar bahwa tidak apa-apa jika belum sepenuhnya sembuh... Tulis ceritamu di sini."
              className="w-full min-h-[120px] sm:min-h-[140px] resize-none rounded-2xl border border-border/50 bg-background/50 p-4 text-sm sm:text-base text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all leading-relaxed"
            />
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
                className="rounded-full bg-secondary/60 px-3 py-1 text-[11px] font-medium text-secondary-foreground hover:bg-primary-soft hover:text-primary transition-all duration-200 text-left border border-border/40"
              >
                {prompt.slice(0, 32)}...
              </button>
            ))}
          </div>

          {/* Avatar Selector Option */}
          <div className="flex items-center gap-2 pt-1 overflow-x-auto pb-1 scrollbar-none">
            <span className="text-[11px] font-medium text-muted-foreground shrink-0">Ikon Anonim:</span>
            {AVATAR_OPTIONS.map((av) => (
              <button
                key={av.emoji}
                type="button"
                onClick={() => setSelectedAvatar(av.emoji)}
                className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-xs transition-all shrink-0 ${
                  selectedAvatar === av.emoji
                    ? "bg-primary-soft text-primary ring-1 ring-primary/40 font-bold scale-105"
                    : "bg-muted/40 text-muted-foreground hover:bg-muted"
                }`}
              >
                <span>{av.emoji}</span>
              </button>
            ))}
          </div>

          {/* Composer Footer Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-border/40">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Lock className="h-3.5 w-3.5 text-emerald-600" />
              <span>
                <strong className="font-semibold text-foreground">Otomatis Anonim</strong> · {newContent.length.toLocaleString()}/50.000 karakter
              </span>
            </div>

            <button
              type="button"
              onClick={handleCreatePost}
              disabled={isSubmitting || !newContent.trim()}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-teal-600 hover:bg-teal-700 text-white font-semibold px-5 py-2.5 text-xs sm:text-sm shadow-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg active:scale-98 cursor-pointer"
            >
              {isSubmitting ? (
                <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              <span>Bagikan Anonim</span>
            </button>
          </div>
        </div>
      </div>

      {/* ─── Search & Tab Filter Bar ─── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
        {/* Tabs */}
        <div className="flex items-center gap-1.5 rounded-2xl bg-muted/50 p-1 border border-border/50">
          <button
            type="button"
            onClick={() => setActiveTab("semua")}
            className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "semua"
                ? "bg-background text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Semua Postingan
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("populer")}
            className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "populer"
                ? "bg-background text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Paling Banyak Pelukan
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("saya")}
            className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
              activeTab === "saya"
                ? "bg-background text-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Postingan Saya
          </button>
        </div>

        {/* Search */}
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari kata kunci..."
            className="w-full rounded-2xl border border-border/50 bg-background/80 pl-8 pr-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none"
          />
        </div>
      </div>

      {/* ─── Feed Posts List (Threads Style) ─── */}
      <div className="space-y-4 pt-1">
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((n) => (
              <div key={n} className="rounded-3xl border border-border/40 p-6 bg-card/50 space-y-3 animate-pulse">
                <div className="h-4 bg-muted rounded-full w-3/4" />
                <div className="h-4 bg-muted rounded-full w-1/2" />
                <div className="flex justify-between pt-4">
                  <div className="h-3 bg-muted rounded-full w-24" />
                  <div className="flex gap-2">
                    <div className="h-8 bg-muted rounded-full w-20" />
                    <div className="h-8 bg-muted rounded-full w-24" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-border p-10 text-center space-y-3 bg-card/30">
            <div className="mx-auto h-12 w-12 rounded-full bg-primary-soft grid place-items-center text-primary text-xl">
              🌸
            </div>
            <h3 className="font-semibold text-sm text-foreground">Belum ada postingan di kategori ini</h3>
            <p className="text-xs text-muted-foreground max-w-xs mx-auto">
              Jadilah orang pertama yang membagikan curhatan anonim secara aman dan saling menguatkan.
            </p>
          </div>
        ) : (
          filteredPosts.map((post) => {
            const isOwner = user?.id === post.user_id;

            return (
              <div
                key={post.id}
                className="group relative rounded-3xl border border-border/60 bg-card p-5 sm:p-6 shadow-2xs hover:shadow-md transition-all duration-300 hover:border-border"
              >
                {/* Micro Hug floating effect */}
                {animatingHugId === post.id && (
                  <div className="absolute top-4 right-6 pointer-events-none animate-bounce text-2xl z-20">
                    🩵 🫂
                  </div>
                )}

                <div className="space-y-4">
                  {/* Post Content */}
                  <p className="text-sm sm:text-base text-foreground/90 leading-relaxed font-normal whitespace-pre-line">
                    {post.content}
                  </p>

                  {/* Divider */}
                  <div className="h-px w-full bg-border/40" />

                  {/* Post Footer & Action Buttons */}
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    {/* Author & Timestamp */}
                    <div className="flex items-center gap-2">
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-rose-50 text-sm border border-rose-200/50 shrink-0">
                        {post.author_avatar || "🌸"}
                      </span>
                      <span className="text-xs font-semibold text-muted-foreground">
                        {post.author_name} · {formatIndonesianDate(post.created_at)}
                      </span>
                      {isOwner && (
                        <span className="rounded-full bg-teal-100/70 px-2 py-0.5 text-[10px] font-bold text-teal-800">
                          Milik Anda
                        </span>
                      )}
                    </div>

                    {/* Action Buttons: Diskusi & Saling Peluk */}
                    <div className="flex items-center gap-2">
                      {/* Delete button for owner */}
                      {isOwner && (
                        <button
                          type="button"
                          onClick={() => handleDeletePost(post.id)}
                          className="rounded-full p-2 text-muted-foreground/60 hover:text-red-500 hover:bg-red-50 transition-all cursor-pointer"
                          title="Hapus postingan"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}

                      {/* Diskusi Button */}
                      <button
                        type="button"
                        onClick={() => handleOpenComments(post)}
                        className="inline-flex items-center gap-1.5 rounded-full border border-border/80 bg-background/80 px-3.5 py-1.5 text-xs font-medium text-foreground hover:bg-secondary transition-all active:scale-95 cursor-pointer shadow-2xs"
                      >
                        <MessageSquare className="h-3.5 w-3.5 text-muted-foreground" />
                        <span>Diskusi ({post.comments_count || 0})</span>
                      </button>

                      {/* Saling Peluk Button */}
                      <button
                        type="button"
                        onClick={() => handleToggleHug(post)}
                        className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-all active:scale-95 cursor-pointer shadow-2xs ${
                          post.has_hugged
                            ? "bg-teal-50 text-teal-800 border-teal-300 ring-2 ring-teal-500/20"
                            : "bg-teal-50/60 text-teal-700 border-teal-200/80 hover:bg-teal-100/60"
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

      {/* ─── Comments / Discussion Modal ─── */}
      <ModalDialog
        isOpen={!!activePostForComments}
        onClose={() => setActivePostForComments(null)}
        title="💬 Utas Diskusi Anonim"
      >
        {activePostForComments && (
          <div className="space-y-4 pt-2">
            {/* Target Post Quote */}
            <div className="rounded-2xl bg-muted/40 p-4 border border-border/50 space-y-2">
              <p className="text-xs text-muted-foreground/80 font-medium">Postingan Asli:</p>
              <p className="text-sm text-foreground italic">"{activePostForComments.content}"</p>
              <div className="flex items-center gap-2 text-[11px] text-muted-foreground pt-1">
                <span>{activePostForComments.author_avatar} Anonim</span>
                <span>·</span>
                <span>🩵 {activePostForComments.hugs_count} Pelukan</span>
              </div>
            </div>

            {/* Comments List */}
            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Komentar ({comments.length})
              </h4>

              {commentsLoading ? (
                <div className="p-4 text-center text-xs text-muted-foreground">Memuat komentar...</div>
              ) : comments.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-border p-6 text-center text-xs text-muted-foreground">
                  Belum ada komentar. Berikan ucapan hangat atau saran yang menguatkan!
                </div>
              ) : (
                comments.map((c) => (
                  <div key={c.id} className="rounded-2xl bg-card border border-border/60 p-3.5 space-y-1.5 shadow-2xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs">{c.author_avatar || "🌸"}</span>
                        <span className="text-xs font-semibold text-foreground">{c.author_name}</span>
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

            {/* Add Comment Input */}
            <div className="space-y-2 pt-3 border-t border-border">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newCommentContent}
                  onChange={(e) => setNewCommentContent(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddComment()}
                  placeholder="Tulis balasan anonim yang menguatkan..."
                  className="flex-1 rounded-2xl border border-border bg-background px-4 py-2.5 text-xs sm:text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleAddComment}
                  disabled={isSubmittingComment || !newCommentContent.trim()}
                  className="rounded-2xl bg-teal-600 text-white px-4 py-2.5 text-xs font-semibold hover:bg-teal-700 disabled:opacity-50 transition-all flex items-center justify-center shrink-0 cursor-pointer"
                >
                  {isSubmittingComment ? "..." : "Kirim"}
                </button>
              </div>
              <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                <ShieldCheck className="h-3 w-3 text-emerald-600" />
                Semua komentar terkirim 100% anonim dan tetap menjaga ruang yang aman.
              </p>
            </div>
          </div>
        )}
      </ModalDialog>
    </div>
  );
}
