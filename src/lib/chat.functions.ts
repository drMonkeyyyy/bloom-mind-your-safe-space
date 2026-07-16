import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

const CRISIS_KEYWORDS = [
  "bunuh diri", "bundir", "suicide", "akhiri hidup", "mengakhiri hidup",
  "self harm", "self-harm", "melukai diri", "menyakiti diri",
  "tidak ingin hidup", "ingin mati", "pengen mati",
];

function detectCrisis(text: string) {
  const t = text.toLowerCase();
  return CRISIS_KEYWORDS.some((k) => t.includes(k));
}

function sanitizeUserName(name: string | null | undefined): string | null {
  if (!name) return null;
  const clean = name.trim();
  if (!clean) return null;
  
  const lower = clean.toLowerCase();
  if (
    lower === "jn-calm" || 
    lower === "jn_calm" || 
    lower === "jncalm" || 
    lower === "bloom mind" || 
    lower === "bloommind" ||
    lower === "user" || 
    lower === "admin" ||
    /^[0-9_\W]+$/.test(clean)
  ) {
    return null;
  }
  
  return clean;
}



function handleAiError(e: unknown): never {
  const err = e as any;
  const msg = err instanceof Error ? err.message : String(err);
  const msgLower = msg.toLowerCase();

  const isRateLimit = 
    msgLower.includes("429") || 
    msgLower.includes("too many requests") || 
    msgLower.includes("quota exceeded") || 
    msgLower.includes("resource_exhausted") ||
    err.statusCode === 429 ||
    (err.lastError && err.lastError.statusCode === 429);

  if (isRateLimit) {
    throw new Error("RATE_LIMIT");
  }

  if (msgLower.includes("402") || msgLower.includes("payment required") || err.statusCode === 402) {
    throw new Error("AI_CREDITS");
  }

  throw new Error("Gagal menghubungi AI: " + msg);
}

const CRISIS_REPLY = `Aku dengar kamu, dan aku sangat khawatir dengan apa yang sedang kamu rasakan. Kamu tidak sendirian. 🤍

Tolong, dalam beberapa menit ke depan:
1. Hubungi orang yang kamu percaya — keluarga, teman dekat, atau siapa pun yang bisa menemanimu sekarang.
2. Hubungi layanan darurat: **119 ext. 8** (Kemenkes Sehat Jiwa) atau **112** (darurat umum).
3. Datang ke IGD rumah sakit terdekat.

JN-CALM hadir sebagai media refleksi diri dan bukan merupakan layanan darurat medis. Aku akan tetap di sini, tapi aku butuh kamu untuk menghubungi bantuan profesional sekarang juga. Apa kamu bisa lakukan satu langkah dari atas?`;

const SendInput = z.object({
  chatId: z.string().uuid().nullable(),
  companionKey: z.enum(["ibu","ayah","kakak_perempuan","kakak_laki","sahabat","partner","coach"]).nullable().optional(),
  customCompanionId: z.string().uuid().nullable().optional(),
  content: z.string().min(1).max(4000),
});

export const sendChatMessage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => SendInput.parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    // Load profile + settings
    const [{ data: profile }, { data: settings }] = await Promise.all([
      supabase.from("profiles").select("plan, communication_style, name, sync_journal_memory").eq("id", userId).maybeSingle(),
      supabase.from("app_settings").select("free_chat_limit").eq("id", 1).maybeSingle(),
    ]);

    const plan = profile?.plan ?? "free";
    const limit = settings?.free_chat_limit ?? 10;

    // Premium gate for custom companions
    if (data.customCompanionId && plan !== "premium") {
      throw new Error("PREMIUM_REQUIRED");
    }

    // Load custom or catalog companion
    let companion: {
      name: string;
      system_prompt: string;
      tone: string;
      is_premium_only?: boolean;
    } | null = null;

    if (data.customCompanionId) {
      const { data: customCompanion, error } = await supabase
        .from("custom_companions")
        .select("*")
        .eq("id", data.customCompanionId)
        .eq("user_id", userId)
        .maybeSingle();
      if (error || !customCompanion) {
        throw new Error("Custom companion tidak ditemukan");
      }
      companion = {
        name: customCompanion.name,
        system_prompt: customCompanion.system_prompt,
        tone: customCompanion.tone,
        is_premium_only: false,
      };
    } else if (data.companionKey) {
      const { data: catalogCompanion } = await supabase
        .from("companions")
        .select("*")
        .eq("key", data.companionKey)
        .maybeSingle();
      if (!catalogCompanion) throw new Error("Companion tidak ditemukan");
      companion = catalogCompanion;
    } else {
      throw new Error("Pilih salah satu companion");
    }

    // Premium gate for premium-only catalog companions
    if (companion.is_premium_only && plan !== "premium") {
      throw new Error("PREMIUM_REQUIRED");
    }

    // Total limit for free plan (lifetime limit)
    if (plan === "free") {
      const { count } = await supabase
        .from("messages")
        .select("id", { count: "exact", head: true })
        .eq("user_id", userId)
        .eq("role", "assistant");
      if ((count ?? 0) >= limit) {
        throw new Error("DAILY_LIMIT");
      }
    }

    // Ensure chat
    let chatId = data.chatId;
    if (!chatId) {
      const { data: chat, error } = await supabase.from("chats").insert({
        user_id: userId,
        companion_key: data.companionKey ?? undefined,
        custom_companion_id: data.customCompanionId ?? null,
        title: data.content.slice(0, 60),
      }).select("id").single();
      if (error || !chat) throw new Error(error?.message ?? "Gagal membuat chat");
      chatId = chat.id;
    }

    // Save user message
    await supabase.from("messages").insert({
      chat_id: chatId, user_id: userId, role: "user", content: data.content,
    });

    // Crisis short-circuit
    if (detectCrisis(data.content)) {
      await supabase.from("messages").insert({
        chat_id: chatId, user_id: userId, role: "assistant", content: CRISIS_REPLY,
      });
      await supabase.from("chats").update({ updated_at: new Date().toISOString() }).eq("id", chatId);
      return { chatId, reply: CRISIS_REPLY, crisis: true };
    }

    // Load recent history (last 20)
    const { data: history } = await supabase
      .from("messages").select("role, content").eq("chat_id", chatId)
      .order("created_at", { ascending: true }).limit(20);

    const { createGeminiClient, getGeminiApiKey } = await import("./ai-client.server");
    const apiKey = getGeminiApiKey();
    if (!apiKey) throw new Error("GEMINI_API_KEY belum dikonfigurasi");
    const { generateText } = await import("ai");
    const gateway = createGeminiClient(apiKey);

    let journalContext = "";
    if (profile?.plan === "premium" && profile?.sync_journal_memory) {
      const since = new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10);
      const { data: journals } = await supabase
        .from("journals")
        .select("main_emotion, main_trigger, summary, lesson, date")
        .eq("user_id", userId)
        .gte("date", since)
        .order("date", { ascending: false });

      if (journals && journals.length > 0) {
        journalContext = `\n\nMemori Jurnal Harian Pengguna (7 hari terakhir):\n${journals.map(j => `- Tanggal ${j.date}: Merasa ${j.main_emotion || "biasa"}. Trigger: ${j.main_trigger || "tidak ada"}. Ringkasan: ${j.summary || ""}. Pelajaran: ${j.lesson || ""}`).join("\n")}\nGunakan memori jurnal di atas dengan sangat halus dan empati tinggi untuk memberikan dukungan yang personal jika relevan dengan percakapan saat ini. JANGAN katakan Anda "membaca jurnal" secara blak-blakan kecuali secara halus dan alami.`;
      }
    }

    const cleanName = sanitizeUserName(profile?.name);
    const namePrompt = cleanName 
      ? cleanName 
      : "[Nama tidak diketahui. Sapa dengan sebutan yang sangat alami sesuai dengan peran hubunganmu dengan user. Misalnya: jika kamu berperan sebagai Ibu/Ayah gunakan 'nak'/'anakku', jika Kakak gunakan 'adik'/'kamu', jika Sahabat/Coach gunakan 'kamu'/'sahabat', jika Partner gunakan 'sayang'/'kamu'. JANGAN gunakan sebutan formal kaku seperti 'Saudara' atau 'User']";
    const sysPrompt = `${companion.system_prompt}\n\nGaya komunikasi user: ${profile?.communication_style ?? "supportive"}. Nama user: ${namePrompt}.${journalContext}\n\nSelalu Bahasa Indonesia. Maksimal 4-6 kalimat. Akhiri dengan 1 pertanyaan reflektif singkat (opsional).`;

    let reply = "";
    try {
      const result = await generateText({
        model: gateway("gemini-2.5-flash"),
        system: sysPrompt,
        messages: (history ?? []).map((m) => ({
          role: m.role === "assistant" ? ("assistant" as const) : ("user" as const),
          content: m.content,
        })),
      });
      if (result.finishReason === "content-filter") {
        reply = "Maaf, aku tidak bisa membahas topik tersebut demi kenyamanan bersama. Mari kita bicarakan hal lain yang bisa membantumu merasa lebih baik. 🌿";
      } else {
        reply = result.text?.trim() || "Aku di sini menemanimu. Bisa cerita lebih lanjut?";
      }
    } catch (e: unknown) {
      handleAiError(e);
    }

    await supabase.from("messages").insert({
      chat_id: chatId, user_id: userId, role: "assistant", content: reply,
    });
    await supabase.from("chats").update({ updated_at: new Date().toISOString() }).eq("id", chatId);

    // Bump usage for free users
    if (plan === "free") {
      try {
        const today = new Date().toISOString().slice(0, 10);
        const { data: u } = await supabase
          .from("daily_chat_usage").select("ai_reply_count").eq("user_id", userId).eq("date", today).maybeSingle();
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        await supabaseAdmin.from("daily_chat_usage").upsert({
          user_id: userId, date: today, ai_reply_count: (u?.ai_reply_count ?? 0) + 1,
        });
      } catch (adminError) {
        console.warn("Gagal mencatat limit harian karena SUPABASE_SERVICE_ROLE_KEY tidak diset:", adminError);
      }
    }

    return { chatId, reply, crisis: false };
  });

const EatingInput = z.object({
  hungerType: z.enum(["lapar_fisik","lapar_emosional","craving","stress_eating","mindless_eating"]).nullable(),
  emotion: z.string().max(200),
  cravingFood: z.string().max(200),
  trigger: z.string().max(200),
});

export const analyzeEmotionalEating = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => EatingInput.parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: profile } = await supabase.from("profiles").select("name").eq("id", userId).maybeSingle();
    const cleanName = sanitizeUserName(profile?.name);
    const userName = cleanName || "[Nama tidak diketahui. Sapa dengan sebutan hangat yang natural seperti 'kamu' atau 'sahabat'. JANGAN gunakan sebutan formal seperti 'Saudara']";

    const { createGeminiClient, getGeminiApiKey } = await import("./ai-client.server");
    const apiKey = getGeminiApiKey();
    if (!apiKey) throw new Error("GEMINI_API_KEY belum dikonfigurasi");
    const { generateText } = await import("ai");
    const gateway = createGeminiClient(apiKey);
    const prompt = `Informasi user saat ini:
- Makanan yang dicraving: ${data.cravingFood || "-"}
- Situasi pemicu (trigger): ${data.trigger || "-"}
- Jenis lapar yang dirasakan: ${data.hungerType ?? "belum dipilih"}

Tugasmu (Berperanlah sebagai Psikolog atau Psikiater klinis profesional yang hangat dan empatik):
1. Buat "insight": Sapa user dengan panggilan hangat menggunakan nama mereka (misalnya: "Halo ${userName}," atau "Hai ${userName},"). JANGAN gunakan sebutan formal yang kaku seperti "Saudara ${userName}" atau "Saudara JN-CALM". Berikan analisis hangat, empatik, berwawasan psikologis mendalam dalam Bahasa Indonesia (sekitar 3-4 kalimat) mengenai akar pemicu emosional mereka dan kaitannya dengan makanan yang mereka inginkan. Jelaskan mengapa emosi tersebut mengarahkan mereka ke makanan spesifik tersebut tanpa memberikan diagnosis medis formal atau resep obat.
2. Buat "action": Berikan 2-3 langkah coping mechanism terapeutik yang diuraikan secara detail dan praktis (bukan sekadar daftar pendek, melainkan penjelasan instruktif langkah-per-langkah yang mendalam). Gunakan bahasa psikologi yang mudah dipahami, membimbing, dan mendukung proses regulasi emosi mereka. Gunakan penomoran dan baris baru (\n) untuk memisahkan setiap langkah agar mudah dibaca. 
    PENTING: Salah satu langkah WAJIB menyarankan mereka untuk masuk ke menu Teman Curhat di aplikasi JN-CALM untuk melakukan curhat/mengobrol dengan Pendamping pilihan mereka guna mendapatkan dukungan emosional langsung.

PENTING: Output HARUS berupa JSON valid dengan format berikut (jangan sertakan teks markdown \`\`\`json atau teks lain di luar JSON):
{
  "insight": "tulis insight di sini...",
  "action": "tulis action langkah 1\\n\\ntulis action langkah 2\\n\\ntulis action langkah 3..."
}`;

    let insight = "";
    let action = `1. Jeda & Bernapas (Latihan 4-4-6):
Tarik napas perlahan lewat hidung dalam 4 hitungan, tahan napas selama 4 hitungan, lalu hembuskan lembut lewat mulut selama 6 hitungan. Ulangi 3-5 kali untuk menenangkan sistem saraf cemasmu.

2. Curhat dengan Pendamping JN-CALM:
Buka menu Teman Curhat di aplikasi dan pilihlah Pendamping favoritmu. Luapkan emosi atau stres yang sedang kamu rasakan saat ini. Berbicara dengan Pendamping dapat meredakan kecemasan dan mengalihkan dorongan makan secara instan.

3. Ekspresikan Emosi (Journaling Singkat):
Tuliskan 1 kalimat jujur tentang apa yang paling kamu cemaskan atau rasakan saat ini di lembar jurnal JN-CALM untuk menyalurkan energi emosionalmu.`;

    try {
      const r = await generateText({
        model: gateway("gemini-2.5-flash"),
        prompt
      });
      
      const m = r.text.match(/\{[\s\S]*\}/);
      if (m) {
        const parsed = JSON.parse(m[0]);
        insight = parsed.insight?.trim() || "";
        action = parsed.action?.trim() || action;
      } else {
        throw new Error("Format JSON tidak ditemukan dalam respon AI");
      }
    } catch (e) {
      console.error("Gagal melakukan generate/parse JSON:", e);
      try {
        const rText = await generateText({ 
          model: gateway("gemini-2.5-flash"), 
          prompt: `Berikan insight psikologis singkat, hangat, empatik (maksimal 3 kalimat) untuk orang yang cemas/stres dan ingin makan ${data.cravingFood || "makanan"} karena dipicu oleh ${data.trigger || "situasi ini"}.` 
        });
        insight = rText.text?.trim() ?? "Tarik napas dulu 5 menit. Tanyakan: apa yang sebenarnya kamu butuhkan saat ini? Mungkin bukan makanan, tapi rasa nyaman.";
      } catch {
        insight = "Tarik napas dulu 5 menit. Tanyakan: apa yang sebenarnya kamu butuhkan saat ini? Mungkin bukan makanan, tapi rasa nyaman.";
      }
    }

    await supabase.from("emotional_eating_logs").insert({
      user_id: userId,
      hunger_type: data.hungerType,
      emotion: data.emotion,
      craving_food: data.cravingFood,
      trigger: data.trigger,
      ai_insight: insight,
      suggested_action: action,
    });

    // Consolidate into today's journal
    const todayStr = new Date().toLocaleDateString("sv-SE", { timeZone: "Asia/Jakarta" });
    const hungerLabels: Record<string, string> = {
      lapar_fisik: "Lapar Fisik",
      lapar_emosional: "Lapar Emosional",
      craving: "Craving",
      stress_eating: "Stress Eating",
      mindless_eating: "Mindless Eating"
    };
    const hungerLabel = data.hungerType ? (hungerLabels[data.hungerType] || data.hungerType) : "Tidak diketahui";
    const eatingSummary = `Pola Makan Emosional (${hungerLabel}):
- Emosi: ${data.emotion || "-"}
- Makanan Diinginkan: ${data.cravingFood || "-"}
- Pemicu: ${data.trigger || "-"}
- Insight AI: ${insight}`;

    const { data: todayJournal } = await supabase
      .from("journals")
      .select("*")
      .eq("user_id", userId)
      .eq("date", todayStr)
      .maybeSingle();

    if (todayJournal) {
      const mergedSummary = todayJournal.summary ? `${todayJournal.summary}\n\n${eatingSummary}` : eatingSummary;
      await supabase
        .from("journals")
        .update({
          summary: mergedSummary,
          main_emotion: todayJournal.main_emotion ? todayJournal.main_emotion : "😰 Cemas"
        })
        .eq("id", todayJournal.id);
    } else {
      await supabase
        .from("journals")
        .insert({
          user_id: userId,
          date: todayStr,
          summary: eatingSummary,
          main_emotion: "😰 Cemas",
          source: "manual"
        });
    }

    return { insight, action };
  });

const COMPANION_ROLES: Record<string, string> = {
  ibu: "Ibu",
  ayah: "Ayah",
  kakak_perempuan: "Kakak Perempuan",
  kakak_laki: "Kakak Laki-laki",
  sahabat: "Sahabat",
  partner: "Partner",
  coach: "Coach",
};

const JournalFromChatInput = z.object({
  chatId: z.string().uuid(),
  localDate: z.string().optional()
});

export const generateJournalFromChat = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => JournalFromChatInput.parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    
    // Fetch chat to get companion details
    const [{ data: msgs }, { data: chat }] = await Promise.all([
      supabase.from("messages").select("role, content").eq("chat_id", data.chatId).order("created_at").limit(50),
      supabase.from("chats").select("companion_key, custom_companion_id").eq("id", data.chatId).maybeSingle(),
    ]);

    if (!msgs || msgs.length === 0) throw new Error("Tidak ada percakapan");

    let companionRole = "Sahabat";
    const companionKey = chat?.companion_key;

    if (chat?.custom_companion_id) {
      const { data: customComp } = await supabase
        .from("custom_companions")
        .select("name")
        .eq("id", chat.custom_companion_id)
        .maybeSingle();
      companionRole = customComp?.name || "Pendamping Kustom";
    } else if (companionKey) {
      companionRole = COMPANION_ROLES[companionKey] || "Sahabat";
    }

    const { createGeminiClient, getGeminiApiKey } = await import("./ai-client.server");
    const apiKey = getGeminiApiKey();
    if (!apiKey) throw new Error("GEMINI_API_KEY belum dikonfigurasi");
    const { generateText } = await import("ai");
    const gateway = createGeminiClient(apiKey);

    const transcript = msgs.map((m) => `${m.role === "user" ? "Aku" : companionRole}: ${m.content}`).join("\n");

    const prompt = `Buat ringkasan journal dari percakapan berikut antara Aku dan ${companionRole} saya. JANGAN gunakan kata "AI", "AI Chat", atau "asisten" dalam ringkasan, melainkan tulis sebagai masukan/saran/percakapan dengan "${companionRole}" Anda. Output HANYA JSON valid dengan key:
summary (string, 2-3 kalimat ringkasan hari ini dari sudut pandang user),
main_emotion (string, 1-3 kata),
main_trigger (string, 1-5 kata),
lesson (string, 1 kalimat pelajaran),
gratitude (string, 1 hal yang bisa disyukuri),
tomorrow_focus (string, 1 fokus singkat untuk besok).

Percakapan:
${transcript}

JSON:`;

    let r;
    try {
      r = await generateText({ model: gateway("gemini-2.5-flash-lite"), prompt });
    } catch (e) {
      handleAiError(e);
    }
    let parsed: Record<string, string> = {};
    try {
      const m = r.text.match(/\{[\s\S]*\}/);
      parsed = m ? JSON.parse(m[0]) : {};
    } catch {
      parsed = { summary: r.text.slice(0, 400) };
    }

    const todayStr = data.localDate || new Date().toLocaleDateString("sv-SE", { timeZone: "Asia/Jakarta" });

    // Check if today's journal already exists
    const { data: existingJournal } = await supabase
      .from("journals")
      .select("*")
      .eq("user_id", userId)
      .eq("date", todayStr)
      .maybeSingle();

    let journalId;

    if (existingJournal) {
      // Merge values
      const mergedSummary = existingJournal.summary
        ? `${existingJournal.summary}\n\nPercakapan dengan ${companionRole}:\n${parsed.summary}`
        : parsed.summary;

      const mergedEmotion = existingJournal.main_emotion
        ? `${existingJournal.main_emotion}, ${parsed.main_emotion}`
        : parsed.main_emotion;

      const existingStickers = existingJournal.main_trigger ? existingJournal.main_trigger.split(", ").filter(Boolean) : [];
      const newStickers = parsed.main_trigger ? parsed.main_trigger.split(", ").filter(Boolean) : [];
      const mergedStickers = Array.from(new Set([...existingStickers, ...newStickers])).join(", ");

      const mergedLesson = existingJournal.lesson
        ? `${existingJournal.lesson}\n${parsed.lesson}`
        : parsed.lesson;

      const mergedGratitude = existingJournal.gratitude
        ? `${existingJournal.gratitude}\n${parsed.gratitude}`
        : parsed.gratitude;

      const mergedFocus = existingJournal.tomorrow_focus
        ? `${existingJournal.tomorrow_focus}\n${parsed.tomorrow_focus}`
        : parsed.tomorrow_focus;

      const { data: updatedJournal, error: updateError } = await supabase
        .from("journals")
        .update({
          summary: mergedSummary,
          main_emotion: mergedEmotion,
          main_trigger: mergedStickers,
          lesson: mergedLesson,
          gratitude: mergedGratitude,
          tomorrow_focus: mergedFocus,
          source: "from_chat",
          companion_key: companionKey ?? undefined,
        })
        .eq("id", existingJournal.id)
        .select("id")
        .single();

      if (updateError) {
        console.error("Gagal mengupdate journal:", updateError);
        throw new Error(`Gagal mengupdate journal: ${updateError.message}`);
      }
      journalId = updatedJournal?.id;
    } else {
      const { data: journal, error: insertError } = await supabase.from("journals").insert({
        user_id: userId,
        date: todayStr,
        source: "from_chat",
        companion_key: companionKey ?? undefined,
        summary: parsed.summary ?? null,
        main_emotion: parsed.main_emotion ?? null,
        main_trigger: parsed.main_trigger ?? null,
        lesson: parsed.lesson ?? null,
        gratitude: parsed.gratitude ?? null,
        tomorrow_focus: parsed.tomorrow_focus ?? null,
      } as any).select("id").single();

      if (insertError) {
        console.error("Gagal menyimpan journal:", insertError);
        throw new Error(`Gagal menyimpan journal: ${insertError.message}`);
      }
      journalId = journal?.id;
    }

    return { journalId };
  });

export const getWeeklyInsight = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const since = new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10);
    const [
      { data: moods },
      { data: eating },
      { data: chat },
      { data: journals },
      { data: gratitude },
      { data: habits },
      { data: profile }
    ] = await Promise.all([
      supabase.from("mood_checkins").select("mood, mood_score, stress_score, energy_score, triggers, date")
        .eq("user_id", userId).gte("date", since).order("date"),
      supabase.from("emotional_eating_logs").select("hunger_type, emotion, trigger, date")
        .eq("user_id", userId).gte("date", since),
      supabase.from("chats").select("companion_key, custom_companion_id").eq("user_id", userId).order("updated_at", { ascending: false }).limit(1).maybeSingle(),
      supabase.from("journals").select("main_emotion, main_trigger, summary, lesson, date")
        .eq("user_id", userId).gte("date", since),
      supabase.from("gratitude_entries").select("gratitude1, gratitude2, gratitude3, date")
        .eq("user_id", userId).gte("date", since),
      supabase.from("habit_logs").select("completed, date, habits!inner(name, is_active)")
        .eq("user_id", userId).eq("habits.is_active", true).gte("date", since),
      supabase.from("profiles").select("name").eq("id", userId).maybeSingle(),
    ]);

    if (!moods || moods.length === 0) {
      return { text: "Belum cukup data minggu ini. Mulai mood check-in harian untuk dapat insight personal." };
    }

    const cleanName = sanitizeUserName(profile?.name);
    const userName = cleanName || "[Nama tidak diketahui. Sapa dengan sebutan hangat yang netral seperti 'kamu' atau 'teman']";
    const companionKey = chat?.companion_key;
    let companionRole = "Sahabat";

    if (chat?.custom_companion_id) {
      const { data: customComp } = await supabase
        .from("custom_companions")
        .select("name")
        .eq("id", chat.custom_companion_id)
        .maybeSingle();
      companionRole = customComp?.name || "Pendamping Kustom";
    } else if (companionKey) {
      companionRole = COMPANION_ROLES[companionKey] || "Sahabat";
    }

    const { createGeminiClient, getGeminiApiKey } = await import("./ai-client.server");
    const apiKey = getGeminiApiKey();
    if (!apiKey) return { text: "Data terkumpul, namun layanan insight sedang tidak tersedia." };
    const { generateText } = await import("ai");
    const gateway = createGeminiClient(apiKey);

    const habitStats: Record<string, number> = {};
    habits?.forEach((h) => {
      if (h.completed) {
        const name = (h.habits as any)?.name;
        if (name) {
          habitStats[name] = (habitStats[name] ?? 0) + 1;
        }
      }
    });

    const habitDetails = Object.entries(habitStats)
      .map(([name, count]) => `${name} (${count}x)`)
      .join(", ");

    const summary = `
Aktivitas user dalam 7 hari terakhir:
1. Mood harian: ${JSON.stringify(moods || [])}
2. Pola makan emosional (emotional eating): ${JSON.stringify(eating || [])}
3. Jurnal refleksi pribadi: ${JSON.stringify(journals || [])}
4. Catatan syukur (gratitude): ${JSON.stringify(gratitude || [])}
5. Kebiasaan (habits) yang berhasil diselesaikan minggu ini: ${habitDetails || "tidak ada"}
`;

    let r;
    try {
      r = await generateText({
        model: gateway("gemini-2.5-flash"),
        prompt: `Sebagai pendamping ${companionRole} JN-CALM, buat insight mingguan dalam Bahasa Indonesia yang hangat, tulus, dan tidak menghakimi berdasarkan seluruh aktivitas user seminggu terakhir (mood, jurnal, rasa syukur, kebiasaan/habit tracker, dan pola makan emosional).

PENTING: Jangan memanggil atau menyapa user dengan sebutan "${companionRole}" (misalnya "Halo Kakak Perempuan", "Kakak Perempuan, seminggu ini...", dll). "${companionRole}" adalah sebutan/peran milikmu (AI), bukan nama/sebutan untuk user. 
Sapa dan panggillah user menggunakan nama aslinya yaitu "${userName}" (misalnya: "Halo ${userName}", "Hari ini ${userName}...", dll). Jika nama user adalah "Teman" atau tidak diketahui, gunakan panggilan yang netral dan hangat seperti "kamu" atau "teman".

Format output wajib terbagi menjadi 3 bagian yang jelas dipisahkan baris kosong:
1. 🔍 Refleksi Hangat Perjalananmu: Berikan penjelasan hangat (3-4 kalimat) mengenai penyebab emosi/mood dominan serta trigger user minggu ini, dihubungkan dengan pola makan emosional dan pencapaian kebiasaan atau rasa syukur mereka.
2. 🧭 Langkah Damai Hari Esok: Tuliskan 3 langkah solusi konkret, praktis, dan terukur yang bisa dilakukan user minggu depan untuk merespons kondisi emosi dan mendukung kesejahteraan mereka. Gunakan nomor 1, 2, 3 dan emoji yang menarik di awal setiap langkah.
3. ✨ Harapan & Kekuatan Baru: Tuliskan 1-2 kalimat doa, harapan yang tulus, atau pesan penyemangat agar kondisi user membaik, sukses/berhasil dalam usahanya, dan terus bertumbuh dengan baik di minggu depan.

Data aktivitas user minggu ini:
${summary}`,
      });
    } catch (e) {
      handleAiError(e);
    }
    return { text: r.text };
  });

export const getDailyInsight = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const today = new Date().toLocaleDateString("sv-SE", { timeZone: "Asia/Jakarta" });
    
    const [
      { data: moods },
      { data: eating },
      { data: chat },
      { data: journals },
      { data: gratitude },
      { data: habits },
      { data: profile }
    ] = await Promise.all([
      supabase.from("mood_checkins").select("mood, mood_score, stress_score, energy_score, triggers, date")
        .eq("user_id", userId).eq("date", today).order("date"),
      supabase.from("emotional_eating_logs").select("hunger_type, emotion, trigger, date")
        .eq("user_id", userId).eq("date", today),
      supabase.from("chats").select("companion_key, custom_companion_id").eq("user_id", userId).order("updated_at", { ascending: false }).limit(1).maybeSingle(),
      supabase.from("journals").select("main_emotion, main_trigger, summary, lesson, date")
        .eq("user_id", userId).eq("date", today),
      supabase.from("gratitude_entries").select("gratitude1, gratitude2, gratitude3, date")
        .eq("user_id", userId).eq("date", today),
      supabase.from("habit_logs").select("completed, date, habits!inner(name, is_active)")
        .eq("user_id", userId).eq("habits.is_active", true).eq("date", today),
      supabase.from("profiles").select("name").eq("id", userId).maybeSingle(),
    ]);

    if (!moods || moods.length === 0) {
      return { text: "BELUM_ADA_DATA_HARI_INI" };
    }

    const cleanName = sanitizeUserName(profile?.name);
    const userName = cleanName || "[Nama tidak diketahui. Sapa dengan sebutan hangat yang netral seperti 'kamu' atau 'teman']";
    const companionKey = chat?.companion_key;
    let companionRole = "Sahabat";

    if (chat?.custom_companion_id) {
      const { data: customComp } = await supabase
        .from("custom_companions")
        .select("name")
        .eq("id", chat.custom_companion_id)
        .maybeSingle();
      companionRole = customComp?.name || "Pendamping Kustom";
    } else if (companionKey) {
      companionRole = COMPANION_ROLES[companionKey] || "Sahabat";
    }

    const { createGeminiClient, getGeminiApiKey } = await import("./ai-client.server");
    const apiKey = getGeminiApiKey();
    if (!apiKey) return { text: "Data terkumpul, namun layanan insight sedang tidak tersedia." };
    const { generateText } = await import("ai");
    const gateway = createGeminiClient(apiKey);

    const completedHabits = habits?.filter(h => h.completed).map(h => (h.habits as any)?.name).filter(Boolean) || [];
    const habitDetails = completedHabits.join(", ");

    const summary = `
Aktivitas user HARI INI (${today}):
1. Mood harian: ${JSON.stringify(moods || [])}
2. Pola makan emosional (emotional eating): ${JSON.stringify(eating || [])}
3. Jurnal refleksi pribadi: ${JSON.stringify(journals || [])}
4. Catatan syukur (gratitude): ${JSON.stringify(gratitude || [])}
5. Kebiasaan (habits) yang berhasil diselesaikan hari ini: ${habitDetails || "tidak ada"}
`;

    let r;
    try {
      r = await generateText({
        model: gateway("gemini-2.5-flash"),
        prompt: `Sebagai pendamping ${companionRole} JN-CALM, buat insight harian dalam Bahasa Indonesia yang hangat, tulus, dan tidak menghakimi berdasarkan seluruh aktivitas user hari ini (mood, jurnal, rasa syukur, kebiasaan/habit tracker, dan pola makan emosional hari ini).

Sapa dan panggillah user menggunakan nama aslinya yaitu "${userName}" (misalnya: "Halo ${userName}", "Hari ini ${userName}...", dll). Jangan panggil dengan sebutan formal seperti "Saudara" atau "User".

Format output wajib terbagi menjadi 3 bagian yang jelas dipisahkan baris kosong:
1. 🔍 Refleksi Hangat Harimu: Ulasan singkat (2-3 kalimat) mengenai kondisi emosional, tingkat stres/energi, dan trigger yang dominan dirasakan hari ini.
2. 🧭 Langkah Damai Malam Ini: Tuliskan 2 langkah kecil atau afirmasi penenang praktis yang bisa dilakukan malam ini sebelum tidur atau besok pagi untuk menyegarkan pikiran. Gunakan nomor 1, 2 dan emoji yang menarik di awal setiap langkah.
3. ✨ Afirmasi Positif: 1 kalimat pesan penyemangat/afirmasi penutup yang indah untuk melepas lelah hari ini.

Data aktivitas user hari ini:
${summary}`,
      });
    } catch (e) {
      handleAiError(e);
    }
    return { text: r.text };
  });

export const initStorageBuckets = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async () => {
    try {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      const { data: buckets } = await supabaseAdmin.storage.listBuckets();
      
      if (!buckets?.some((b: any) => b.id === 'companion-avatars')) {
        await supabaseAdmin.storage.createBucket('companion-avatars', { public: true });
      }
      
      if (!buckets?.some((b: any) => b.id === 'profile-avatars')) {
        await supabaseAdmin.storage.createBucket('profile-avatars', { public: true });
      }
      
      return { success: true };
    } catch (err: any) {
      console.error("Gagal membuat storage bucket:", err);
      return { success: false, error: err.message };
    }
  });
