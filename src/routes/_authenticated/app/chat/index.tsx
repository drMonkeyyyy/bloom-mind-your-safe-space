import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { COMPANIONS, COMM_STYLES } from "@/lib/companions";
import { useProfile } from "@/hooks/use-profile";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { ModalDialog } from "@/components/app/BottomSheet";
import { useServerFn } from "@tanstack/react-start";
import { initStorageBuckets } from "@/lib/chat.functions";

export const Route = createFileRoute("/_authenticated/app/chat/")({
  component: ChatList,
});

function ChatList() {
  const { user } = useAuth();
  const { data: profile } = useProfile(user?.id);
  const navigate = useNavigate();
  const initBuckets = useServerFn(initStorageBuckets);

  // Overrides state for default companions (loaded from localStorage)
  const [defaultCustoms, setDefaultCustoms] = useState<Record<string, { avatar_url?: string | null; emoji?: string }>>({});
  const [editDefaultOpen, setEditDefaultOpen] = useState(false);
  const [editingComp, setEditingComp] = useState<any>(null);
  const [editEmoji, setEditEmoji] = useState("🤝");
  const [editAvatarFile, setEditAvatarFile] = useState<File | null>(null);
  const [editAvatarPreview, setEditAvatarPreview] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);

  const loadDefaultCustoms = () => {
    const customs: Record<string, { avatar_url?: string | null; emoji?: string }> = {};
    COMPANIONS.forEach(c => {
      const avatar = localStorage.getItem(`custom_avatar_default_${c.key}`);
      const emoji = localStorage.getItem(`custom_emoji_default_${c.key}`);
      if (avatar || emoji) {
        customs[c.key] = {
          avatar_url: avatar || null,
          emoji: emoji || undefined
        };
      }
    });
    setDefaultCustoms(customs);
  };

  useEffect(() => {
    loadDefaultCustoms();
  }, []);

  const handleEditDefaultClick = (e: React.MouseEvent, c: any) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (profile?.plan !== "premium") {
      toast.error("Fitur kustomisasi Pendamping bawaan hanya tersedia untuk pengguna Premium! ✨");
      navigate({ to: "/app/premium" });
      return;
    }

    const currentCustom = defaultCustoms[c.key];
    setEditingComp(c);
    setEditEmoji(currentCustom?.emoji || c.emoji);
    setEditAvatarFile(null);
    setEditAvatarPreview(currentCustom?.avatar_url || null);
    setEditDefaultOpen(true);
  };

  const handleFileChangeEdit = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error("Ukuran file maksimal 2MB");
        return;
      }
      setEditAvatarFile(file);
      setEditAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleSaveDefaultCompanion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingComp) return;
    setUpdating(true);
    try {
      let publicUrl = editAvatarPreview;
      if (editAvatarFile) {
        await initBuckets();
        const fileExt = editAvatarFile.name.split(".").pop();
        const fileName = `${user!.id}/default_${editingComp.key}_${Date.now()}.${fileExt}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("companion-avatars")
          .upload(fileName, editAvatarFile);

        if (uploadError) {
          throw new Error("Gagal meng-upload foto: " + uploadError.message);
        }

        const { data: urlData } = supabase.storage
          .from("companion-avatars")
          .getPublicUrl(fileName);
        publicUrl = urlData.publicUrl;
      }

      if (publicUrl) {
        localStorage.setItem(`custom_avatar_default_${editingComp.key}`, publicUrl);
        localStorage.removeItem(`custom_emoji_default_${editingComp.key}`);
      } else {
        localStorage.setItem(`custom_emoji_default_${editingComp.key}`, editEmoji);
        localStorage.removeItem(`custom_avatar_default_${editingComp.key}`);
      }

      toast.success(`Profil ${editingComp.name} berhasil diperbarui! 🌿`);
      setEditDefaultOpen(false);
      loadDefaultCustoms();
    } catch (err: any) {
      toast.error(err.message || "Gagal memperbarui pendamping");
    } finally {
      setUpdating(false);
    }
  };

  const handleResetDefaultCompanion = () => {
    if (!editingComp) return;
    localStorage.removeItem(`custom_avatar_default_${editingComp.key}`);
    localStorage.removeItem(`custom_emoji_default_${editingComp.key}`);
    toast.success(`Profil ${editingComp.name} dikembalikan ke bawaan.`);
    setEditDefaultOpen(false);
    loadDefaultCustoms();
  };

  // Load custom companions list
  const { data: customCompanions, refetch: refetchCustoms } = useQuery({
    queryKey: ["custom-companions", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from("custom_companions")
        .select("*")
        .order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  // Load chats (joined with custom companions if any)
  const { data: chats, refetch } = useQuery({
    queryKey: ["chats", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from("chats")
        .select(`
          *,
          custom_companion:custom_companions(name, emoji, avatar_url)
        `)
        .eq("user_id", user!.id)
        .order("updated_at", { ascending: false });
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

  const handleDeleteCompanion = async (e: React.MouseEvent, companionId: string, avatarUrl: string | null) => {
    e.preventDefault();
    e.stopPropagation();
    const confirmDelete = window.confirm("Apakah Anda yakin ingin menghapus pendamping kustom ini?");
    if (!confirmDelete) return;

    try {
      const { error } = await supabase.from("custom_companions").delete().eq("id", companionId);
      if (error) throw error;

      if (avatarUrl) {
        try {
          const urlObj = new URL(avatarUrl);
          const pathParts = urlObj.pathname.split("/object/public/companion-avatars/");
          if (pathParts.length > 1) {
            const filePath = decodeURIComponent(pathParts[1]);
            await supabase.storage.from("companion-avatars").remove([filePath]);
          }
        } catch (storageErr) {
          console.warn("Gagal menghapus file avatar dari storage:", storageErr);
        }
      }

      toast.success("Pendamping kustom berhasil dihapus! 🗑️");
      refetchCustoms();
      refetch();
    } catch (err: any) {
      console.error("Gagal menghapus companion:", err);
      toast.error(err.message || "Gagal menghapus pendamping.");
    }
  };

  // Form State for custom companion creation
  const [modalOpen, setModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [tone, setTone] = useState("Lembut");
  const [customToneInput, setCustomToneInput] = useState("");
  const [description, setDescription] = useState("");
  const [emoji, setEmoji] = useState("🤗");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error("Ukuran file maksimal 2MB");
        return;
      }
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleCreateClick = () => {
    if (profile?.plan !== "premium") {
      toast.error("Fitur membuat Pendamping Kustom hanya tersedia untuk pengguna Premium! ✨");
      navigate({ to: "/app/premium" });
      return;
    }
    setModalOpen(true);
  };

  const handleSaveCompanion = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalTone = tone === "Custom" ? customToneInput.trim() : tone;
    if (!name.trim() || !finalTone || !description.trim()) {
      toast.error("Semua field wajib diisi");
      return;
    }
    setSaving(true);
    try {
      let publicUrl = null;
      if (avatarFile) {
        await initBuckets();
        const fileExt = avatarFile.name.split(".").pop();
        const fileName = `${user!.id}/${crypto.randomUUID()}.${fileExt}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("companion-avatars")
          .upload(fileName, avatarFile);

        if (uploadError) {
          throw new Error("Gagal meng-upload foto: " + uploadError.message);
        }

        const { data: urlData } = supabase.storage
          .from("companion-avatars")
          .getPublicUrl(fileName);
        publicUrl = urlData.publicUrl;
      }

      const systemPrompt = `Kamu adalah "${name}" — pendamping AI Bloom Mind dengan gaya bicara ${finalTone} dan berperan sebagai ${description}. Selalu balas dalam Bahasa Indonesia yang lembut. Validasi perasaan user lebih dulu, lalu beri satu langkah kecil yang bisa dilakukan. Maksimal 1 pertanyaan lanjutan. Jangan beri diagnosis medis/psikiatri, jangan menyarankan obat. Jika user menunjukkan tanda self-harm/bunuh diri/krisis: aktifkan respons krisis, sarankan menghubungi orang terdekat atau layanan darurat 119, dan tegaskan bantuan profesional. Jangan roleplay seksual. Jangan membangun ketergantungan emosional.`;

      const { data: newComp, error: insertError } = await supabase
        .from("custom_companions")
        .insert({
          user_id: user!.id,
          name,
          tone: finalTone,
          description,
          system_prompt: systemPrompt,
          avatar_url: publicUrl,
          emoji: avatarFile ? null : emoji,
        })
        .select("id")
        .single();

      if (insertError) {
        throw new Error(insertError.message);
      }

      toast.success("Pendamping kustom berhasil dibuat! 🌿");
      setModalOpen(false);
      // Reset form
      setName("");
      setTone("Lembut");
      setCustomToneInput("");
      setDescription("");
      setEmoji("🤗");
      setAvatarFile(null);
      setAvatarPreview(null);
      
      refetchCustoms();

      // Navigate to chat
      navigate({
        to: "/app/chat/$chatId",
        params: { chatId: "new" },
        search: { customCompanionId: newComp.id },
      });
    } catch (err: any) {
      toast.error(err.message || "Gagal membuat pendamping");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-semibold">Pendamping kamu</h1>
        <p className="mt-1 text-sm text-muted-foreground">Pilih siapa yang menemanimu hari ini.</p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {/* Standard Companions */}
        {COMPANIONS.map((c) => {
          const locked = c.premium && profile?.plan !== "premium";
          const custom = defaultCustoms[c.key];
          const displayEmoji = custom?.emoji || c.emoji;
          const displayAvatar = custom?.avatar_url;
          return (
            <div key={c.key} className="relative group">
              <button disabled={locked}
                onClick={() => navigate({ to: "/app/chat/$chatId", params: { chatId: "new" }, search: { companion: c.key } })}
                className={`w-full h-full rounded-3xl border bg-card p-4 text-left transition ${locked ? "opacity-50" : "hover:-translate-y-0.5 border-border"} flex flex-col justify-between min-h-[110px]`}>
                <div>
                  {displayAvatar ? (
                    <img src={displayAvatar} alt={c.name} className="w-10 h-10 rounded-full object-cover shrink-0" />
                  ) : (
                    <div className="text-3xl">{displayEmoji}</div>
                  )}
                  <div className="mt-2 font-semibold text-sm">{c.name}</div>
                </div>
                <div className="text-[10px] text-muted-foreground">{locked ? "🔒 Premium" : c.tone}</div>
              </button>
              {!locked && (
                <button
                  onClick={(e) => handleEditDefaultClick(e, c)}
                  className="absolute right-3 top-3 p-1.5 text-muted-foreground hover:text-primary rounded-full bg-cream-deep hover:bg-primary-soft/30 transition-all opacity-70 sm:opacity-0 sm:group-hover:opacity-100 shadow-sm"
                  title="Ganti Foto/Emoji"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.83 21.75a.75 2.75 0 0 1-.343.203l-3.85 1.15a.75 2.75 0 0 1-.921-.92l1.15-3.85a.75 2.75 0 0 1 .203-.343L16.862 4.487Zm0 0L19.5 7.125" />
                  </svg>
                </button>
              )}
            </div>
          );
        })}

        {/* Custom Companions */}
        {customCompanions?.map((c) => (
          <div key={c.id} className="relative group">
            <button
              onClick={() => navigate({ to: "/app/chat/$chatId", params: { chatId: "new" }, search: { customCompanionId: c.id } })}
              className="w-full rounded-3xl border border-border bg-card p-4 text-left transition hover:-translate-y-0.5 flex flex-col justify-between min-h-[110px]"
            >
              <div>
                {c.avatar_url ? (
                  <img src={c.avatar_url} alt={c.name} className="w-10 h-10 rounded-full object-cover shrink-0" />
                ) : (
                  <div className="text-3xl">{c.emoji || "👤"}</div>
                )}
                <div className="mt-2 font-semibold text-sm">{c.name}</div>
              </div>
              <div className="text-[10px] text-muted-foreground">Kustom · {c.tone}</div>
            </button>
            <button
              onClick={(e) => handleDeleteCompanion(e, c.id, c.avatar_url)}
              className="absolute right-3 top-3 p-1.5 text-muted-foreground hover:text-rose-600 rounded-full bg-cream-deep hover:bg-rose-50 transition-all opacity-70 sm:opacity-0 sm:group-hover:opacity-100 shadow-sm"
              title="Hapus Pendamping"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
              </svg>
            </button>
          </div>
        ))}

        {/* Add Custom Companion Card */}
        <button
          onClick={handleCreateClick}
          className="rounded-3xl border border-dashed border-primary/45 bg-primary-soft/10 p-4 text-left transition hover:-translate-y-0.5 hover:bg-primary-soft/20 flex flex-col justify-center min-h-[110px]"
        >
          <div className="text-2xl text-primary">✨</div>
          <div className="mt-2 font-semibold text-sm text-primary">Buat Pendamping</div>
          <div className="text-[10px] text-primary/70">Kustomisasi Sesukamu</div>
        </button>
      </div>

      <section>
        <h2 className="font-display text-xl font-semibold">Percakapan sebelumnya</h2>
        <div className="mt-3 space-y-2">
          {chats?.length === 0 && <p className="text-sm text-muted-foreground">Belum ada percakapan.</p>}
          {chats?.map((c: any) => {
            const isCustom = !!c.custom_companion_id;
            const compName = isCustom 
              ? c.custom_companion?.name 
              : COMPANIONS.find((x) => x.key === c.companion_key)?.name;
            const compEmoji = isCustom 
              ? (c.custom_companion?.emoji || "👤") 
              : COMPANIONS.find((x) => x.key === c.companion_key)?.emoji;
            const compAvatar = isCustom 
              ? c.custom_companion?.avatar_url 
              : null;

            return (
              <Link key={c.id} to="/app/chat/$chatId" params={{ chatId: c.id }} search={{ companion: undefined }}
                className="group relative flex items-center gap-3 rounded-2xl border border-border bg-card p-4 hover:bg-cream-deep transition-all">
                {compAvatar ? (
                  <img src={compAvatar} alt={compName} className="w-8 h-8 rounded-full object-cover shrink-0" />
                ) : (
                  <span className="text-2xl">{compEmoji}</span>
                )}
                <div className="min-w-0 flex-1 pr-10">
                  <p className="truncate text-sm font-semibold">{c.title ?? "Percakapan"}</p>
                  <p className="truncate text-xs text-muted-foreground">{compName} · {new Date(c.updated_at).toLocaleDateString("id-ID")}</p>
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

      {/* ── CREATE CUSTOM COMPANION DIALOG ─────────────────────────── */}
      <ModalDialog
        open={modalOpen}
        onClose={() => {
          if (!saving) setModalOpen(false);
        }}
        title="✨ Buat Pendamping Kustom"
      >
        <form onSubmit={handleSaveCompanion} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-foreground">Nama Pendamping</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: Bunda Sari, Kak Adi, dll."
              className="w-full rounded-2xl border border-border bg-card px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-foreground">Gaya Bicara / Tone</label>
            <select
              value={tone}
              onChange={(e) => setTone(e.target.value)}
              className="w-full rounded-2xl border border-border bg-card px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {COMM_STYLES.map((style) => (
                <option key={style.key} value={style.label}>
                  {style.label}
                </option>
              ))}
              <option value="Custom">Lainnya (Kustom)</option>
            </select>
            {tone === "Custom" && (
              <input
                type="text"
                required
                value={customToneInput}
                placeholder="Deskripsikan tone (misal: Ceria, Pendiam, Humoris)"
                onChange={(e) => setCustomToneInput(e.target.value)}
                className="mt-2 w-full rounded-2xl border border-border bg-card px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            )}
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-foreground">Peran / Hubungan</label>
            <input
              type="text"
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Contoh: Sosok ibu hangat, teman curhat santai"
              className="w-full rounded-2xl border border-border bg-card px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-foreground">Pilih Avatar (Foto atau Emoji)</label>
            
            <div className="flex items-center gap-4">
              <div className="relative grid h-16 w-16 place-items-center rounded-full bg-cream-deep border border-border text-3xl overflow-hidden">
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Preview" className="h-full w-full object-cover" />
                ) : (
                  <span>{emoji}</span>
                )}
              </div>
              
              <div className="flex-1">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                  id="avatar-file-input"
                />
                <label
                  htmlFor="avatar-file-input"
                  className="inline-block rounded-full bg-primary-soft/80 hover:bg-primary-soft px-4 py-2 text-xs font-semibold text-primary cursor-pointer transition-all active:scale-95 border border-primary/20"
                >
                  Upload Foto 📷
                </label>
                {avatarFile && (
                  <button
                    type="button"
                    onClick={() => {
                      setAvatarFile(null);
                      setAvatarPreview(null);
                    }}
                    className="ml-2 text-xs text-destructive hover:underline"
                  >
                    Hapus
                  </button>
                )}
                <p className="mt-1 text-[10px] text-muted-foreground">Maksimal 2MB. Format JPG, PNG.</p>
              </div>
            </div>

            {!avatarFile && (
              <div className="space-y-1 pt-1">
                <span className="text-[10px] text-muted-foreground font-semibold">Atau pilih emoji:</span>
                <div className="flex flex-wrap gap-1.5">
                  {["🤗", "🌸", "🌿", "🧘", "🌻", "🎨", "🧸", "🦄", "🐾", "💡", "🧠", "❤️"].map((em) => (
                    <button
                      key={em}
                      type="button"
                      onClick={() => setEmoji(em)}
                      className={`h-8 w-8 text-xl rounded-full flex items-center justify-center border transition-all ${
                        emoji === em && !avatarFile ? "border-primary bg-primary-soft/40 scale-110" : "border-border bg-card hover:bg-cream-deep"
                      }`}
                    >
                      {em}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-2 pt-4 border-t border-border/40">
            <button
              type="button"
              disabled={saving}
              onClick={() => setModalOpen(false)}
              className="flex-1 rounded-full border border-stone-200 bg-stone-50 hover:bg-stone-100 py-3 text-xs font-bold text-stone-600 transition-all active:scale-95 disabled:opacity-50"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 rounded-full bg-primary py-3 text-xs font-bold text-white transition-all active:scale-95 shadow-soft disabled:opacity-50 flex items-center justify-center gap-1.5"
            >
              {saving ? "Menyimpan..." : "Simpan & Obrol"}
            </button>
          </div>
        </form>
      </ModalDialog>

      {/* ── EDIT DEFAULT COMPANION DIALOG ──────────────────────────── */}
      {editingComp && (
        <ModalDialog
          open={editDefaultOpen}
          onClose={() => {
            if (!updating) setEditDefaultOpen(false);
          }}
          title={`✏️ Kustomisasi ${editingComp.name}`}
        >
          <form onSubmit={handleSaveDefaultCompanion} className="space-y-4">
            <p className="text-xs text-muted-foreground leading-normal">
              Ubah foto profil atau emoji untuk pendamping bawaan **{editingComp.name}** agar terasa lebih personal sesuai keinginan Anda.
            </p>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-foreground">Pilih Avatar (Foto atau Emoji)</label>
              
              <div className="flex items-center gap-4">
                <div className="relative grid h-16 w-16 place-items-center rounded-full bg-cream-deep border border-border text-3xl overflow-hidden">
                  {editAvatarPreview ? (
                    <img src={editAvatarPreview} alt="Preview" className="h-full w-full object-cover" />
                  ) : (
                    <span>{editEmoji}</span>
                  )}
                </div>
                
                <div className="flex-1">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChangeEdit}
                    className="hidden"
                    id="edit-default-avatar-input"
                  />
                  <label
                    htmlFor="edit-default-avatar-input"
                    className="inline-block rounded-full bg-primary-soft/80 hover:bg-primary-soft px-4 py-2 text-xs font-semibold text-primary cursor-pointer transition-all active:scale-95 border border-primary/20"
                  >
                    Upload Foto Baru 📷
                  </label>
                  {editAvatarPreview && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditAvatarFile(null);
                        setEditAvatarPreview(null);
                      }}
                      className="ml-2 text-xs text-destructive hover:underline"
                    >
                      Hapus
                    </button>
                  )}
                  <p className="mt-1 text-[10px] text-muted-foreground">Maksimal 2MB. Format JPG, PNG.</p>
                </div>
              </div>

              {!editAvatarPreview && (
                <div className="space-y-1 pt-1">
                  <span className="text-[10px] text-muted-foreground font-semibold">Atau pilih emoji:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {["🤝", "👩", "👨", "👩‍🦰", "👨‍🦱", "❤️", "🎯", "🤗", "🌸", "🌿", "🧘", "🌻", "🎨", "🧸", "💡", "🧠"].map((em) => (
                      <button
                        key={em}
                        type="button"
                        onClick={() => setEditEmoji(em)}
                        className={`h-8 w-8 text-xl rounded-full flex items-center justify-center border transition-all ${
                          editEmoji === em && !editAvatarPreview ? "border-primary bg-primary-soft/40 scale-110" : "border-border bg-card hover:bg-cream-deep"
                        }`}
                      >
                        {em}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-2 pt-4 border-t border-border/40">
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={updating}
                  onClick={() => setEditDefaultOpen(false)}
                  className="flex-1 rounded-full border border-stone-200 bg-stone-50 hover:bg-stone-100 py-3 text-xs font-bold text-stone-600 transition-all active:scale-95 disabled:opacity-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="flex-1 rounded-full bg-primary py-3 text-xs font-bold text-white transition-all active:scale-95 shadow-soft disabled:opacity-50 flex items-center justify-center gap-1.5"
                >
                  {updating ? "Menyimpan..." : "Simpan Perubahan"}
                </button>
              </div>
              <button
                type="button"
                disabled={updating}
                onClick={handleResetDefaultCompanion}
                className="w-full rounded-full border border-dashed border-destructive/30 hover:bg-destructive/5 py-2.5 text-xs font-bold text-destructive transition-all"
              >
                Reset ke Profil Bawaan
              </button>
            </div>
          </form>
        </ModalDialog>
      )}
    </div>
  );
}
