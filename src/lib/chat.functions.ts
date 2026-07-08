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
      supabase.from("profiles").select("plan, communication_style, name").eq("id", userId).maybeSingle(),
      supabase.from("app_settings").select("free_chat_limit").eq("id", 1).maybeSingle(),
    ]);

    const plan = profile?.plan ?? "free";
    const limit = plan === "free" ? 3 : (settings?.free_chat_limit ?? 10);

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

    // Daily limit for free
    const today = new Date().toISOString().slice(0, 10);
    if (plan === "free") {
      const { data: usage } = await supabase
        .from("daily_chat_usage").select("ai_reply_count").eq("user_id", userId).eq("date", today).maybeSingle();
      if ((usage?.ai_reply_count ?? 0) >= limit) {
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

    const sysPrompt = `${companion.system_prompt}\n\nGaya komunikasi user: ${profile?.communication_style ?? "supportive"}. Nama user: ${profile?.name ?? "teman"}. Selalu Bahasa Indonesia. Maksimal 4-6 kalimat. Akhiri dengan 1 pertanyaan reflektif singkat (opsional).`;

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
    const { createGeminiClient, getGeminiApiKey } = await import("./ai-client.server");
    const apiKey = getGeminiApiKey();
    if (!apiKey) throw new Error("GEMINI_API_KEY belum dikonfigurasi");
    const { generateText } = await import("ai");
    const gateway = createGeminiClient(apiKey);

    const prompt = `User JN-CALM sedang melakukan refleksi emotional eating.
Detail Input:
- Emosi yang dirasakan: ${data.emotion || "-"}
- Makanan yang dicraving: ${data.cravingFood || "-"}
- Situasi pemicu (trigger): ${data.trigger || "-"}
- Jenis lapar yang dirasakan: ${data.hungerType ?? "belum dipilih"}

Tugasmu:
1. Berikan "insight": Analisis hangat, empatik, tidak menghakimi, dan mendalam dalam Bahasa Indonesia (maksimal 4 kalimat) mengenai pemicu emosional mereka dan kaitannya dengan makanan yang mereka inginkan. JANGAN memberikan diagnosis medis atau resep obat.
2. Berikan "action": Rekomendasi 2-3 langkah coping mechanism konkret jangka pendek (misalnya: jalan kaki 2 menit, minum air hangat, journaling emosi, mendengarkan musik penenang, latihan napas 4-4-6). Formatnya HARUS berupa petunjuk praktis singkat yang dipisahkan dengan tanda "·" (contoh: Tarik napas dalam · Jalan kaki 2 menit · Tulis emosimu).`;

    let insight = "";
    let action = "Jeda 5 menit · Minum air hangat · Tarik napas dalam · Tulis emosimu di jurnal";

    try {
      const { generateObject } = await import("ai");
      const r = await generateObject({
        model: gateway("gemini-2.5-flash-lite"),
        schema: z.object({
          insight: z.string().describe("Insight hangat, empatik, tidak menghakimi dalam Bahasa Indonesia (maksimal 4 kalimat)."),
          action: z.string().describe("Coping mechanism konkret jangka pendek dipisahkan dengan tanda '·' (misal: Jeda 5 menit · Minum air hangat · Tarik napas dalam).")
        }),
        prompt
      });
      insight = r.object.insight?.trim() || "";
      action = r.object.action?.trim() || action;
    } catch {
      try {
        const { generateText } = await import("ai");
        const rText = await generateText({ model: gateway("gemini-2.5-flash-lite"), prompt });
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
      { data: habits }
    ] = await Promise.all([
      supabase.from("mood_checkins").select("mood, mood_score, stress_score, energy_score, triggers, date")
        .eq("user_id", userId).gte("date", since).order("date"),
      supabase.from("emotional_eating_logs").select("hunger_type, emotion, trigger, date")
        .eq("user_id", userId).gte("date", since),
      supabase.from("chats").select("companion_key").eq("user_id", userId).order("updated_at", { ascending: false }).limit(1).maybeSingle(),
      supabase.from("journals").select("main_emotion, main_trigger, summary, lesson, date")
        .eq("user_id", userId).gte("date", since),
      supabase.from("gratitude_entries").select("gratitude1, gratitude2, gratitude3, date")
        .eq("user_id", userId).gte("date", since),
      supabase.from("habit_logs").select("completed, date, habits!inner(name, is_active)")
        .eq("user_id", userId).eq("habits.is_active", true).gte("date", since),
    ]);

    if (!moods || moods.length === 0) {
      return { text: "Belum cukup data minggu ini. Mulai mood check-in harian untuk dapat insight personal." };
    }

    const companionKey = chat?.companion_key || "sahabat";
    const companionRole = COMPANION_ROLES[companionKey] || "Sahabat";

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

Format output wajib terbagi menjadi 3 bagian yang jelas dipisahkan baris kosong:
1. 💡 Kenapa & Mengapa: Berikan penjelasan hangat (3-4 kalimat) mengenai penyebab emosi/mood dominan serta trigger user minggu ini, dihubungkan dengan pola makan emosional dan pencapaian kebiasaan atau rasa syukur mereka.
2. 📋 Terus Harus Gimana: Tuliskan 3 langkah solusi konkret, praktis, dan terukur yang bisa dilakukan user minggu depan untuk merespons kondisi emosi dan mendukung kesejahteraan mereka. Gunakan nomor 1, 2, 3 dan emoji yang menarik di awal setiap langkah.
3. 🌱 Harapan & Pesan Pertumbuhan: Tuliskan 1-2 kalimat doa, harapan yang tulus, atau pesan penyemangat agar kondisi user membaik, sukses/berhasil dalam usahanya, dan terus bertumbuh dengan baik di minggu depan.

Data aktivitas user minggu ini:
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
