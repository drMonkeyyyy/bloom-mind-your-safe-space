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

const CRISIS_REPLY = `Aku dengar kamu, dan aku sangat khawatir dengan apa yang sedang kamu rasakan. Kamu tidak sendirian. 🤍

Tolong, dalam beberapa menit ke depan:
1. Hubungi orang yang kamu percaya — keluarga, teman dekat, atau siapa pun yang bisa menemanimu sekarang.
2. Hubungi layanan darurat: **119 ext. 8** (Kemenkes Sehat Jiwa) atau **112** (darurat umum).
3. Datang ke IGD rumah sakit terdekat.

Bloom Mind bukan pengganti psikolog atau layanan darurat. Aku akan tetap di sini, tapi aku butuh kamu untuk menghubungi bantuan profesional sekarang juga. Apa kamu bisa lakukan satu langkah dari atas?`;

const SendInput = z.object({
  chatId: z.string().uuid().nullable(),
  companionKey: z.enum(["ibu","ayah","kakak_perempuan","kakak_laki","sahabat","partner","coach"]),
  content: z.string().min(1).max(4000),
});

export const sendChatMessage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => SendInput.parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    // Load profile + companion + settings
    const [{ data: profile }, { data: companion }, { data: settings }] = await Promise.all([
      supabase.from("profiles").select("plan, communication_style, name").eq("id", userId).maybeSingle(),
      supabase.from("companions").select("*").eq("key", data.companionKey).maybeSingle(),
      supabase.from("app_settings").select("free_chat_limit").eq("id", 1).maybeSingle(),
    ]);

    if (!companion) throw new Error("Companion tidak ditemukan");
    const plan = profile?.plan ?? "free";
    const limit = settings?.free_chat_limit ?? 10;

    // Premium gate for premium-only companions
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
        companion_key: data.companionKey,
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

    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) throw new Error("LOVABLE_API_KEY belum dikonfigurasi");

    const { createLovableAi } = await import("./ai-gateway.server");
    const { generateText } = await import("ai");
    const gateway = createLovableAi(apiKey);

    const sysPrompt = `${companion.system_prompt}\n\nGaya komunikasi user: ${profile?.communication_style ?? "supportive"}. Nama user: ${profile?.name ?? "teman"}. Selalu Bahasa Indonesia. Maksimal 4-6 kalimat. Akhiri dengan 1 pertanyaan reflektif singkat (opsional).`;

    let reply = "";
    try {
      const result = await generateText({
        model: gateway("google/gemini-3-flash-preview"),
        system: sysPrompt,
        messages: (history ?? []).map((m) => ({
          role: m.role === "assistant" ? ("assistant" as const) : ("user" as const),
          content: m.content,
        })),
      });
      reply = result.text?.trim() || "Aku di sini menemanimu. Bisa cerita lebih lanjut?";
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      if (msg.includes("429")) throw new Error("RATE_LIMIT");
      if (msg.includes("402")) throw new Error("AI_CREDITS");
      throw new Error("Gagal menghubungi AI: " + msg);
    }

    await supabase.from("messages").insert({
      chat_id: chatId, user_id: userId, role: "assistant", content: reply,
    });
    await supabase.from("chats").update({ updated_at: new Date().toISOString() }).eq("id", chatId);

    // Bump usage for free users
    if (plan === "free") {
      const { data: u } = await supabase
        .from("daily_chat_usage").select("ai_reply_count").eq("user_id", userId).eq("date", today).maybeSingle();
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      await supabaseAdmin.from("daily_chat_usage").upsert({
        user_id: userId, date: today, ai_reply_count: (u?.ai_reply_count ?? 0) + 1,
      });
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
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) throw new Error("LOVABLE_API_KEY belum dikonfigurasi");

    const { createLovableAi } = await import("./ai-gateway.server");
    const { generateText } = await import("ai");
    const gateway = createLovableAi(apiKey);

    const prompt = `User Bloom Mind sedang refleksi emotional eating.
Emosi: ${data.emotion || "-"}
Makanan yang dicraving: ${data.cravingFood || "-"}
Trigger: ${data.trigger || "-"}
Jenis lapar yang user pilih: ${data.hungerType ?? "belum dipilih"}

Tugasmu: berikan respons hangat dan tidak menghakimi dalam Bahasa Indonesia, maksimal 4 kalimat. Tutup dengan 1 saran kecil yang konkret (contoh: jeda 5 menit + napas, minum air, journaling singkat, mindful eating). JANGAN beri diagnosis medis atau resep obat.`;

    let insight = "";
    try {
      const r = await generateText({ model: gateway("google/gemini-3-flash-preview"), prompt });
      insight = r.text?.trim() ?? "";
    } catch {
      insight = "Tarik napas dulu 5 menit. Tanyakan: apa yang sebenarnya kamu butuhkan saat ini? Mungkin bukan makanan, tapi rasa nyaman.";
    }

    const action = "Jeda 5 menit · minum segelas air · tarik napas dalam · tanyakan kebutuhanmu yang sebenarnya.";

    await supabase.from("emotional_eating_logs").insert({
      user_id: userId,
      hunger_type: data.hungerType,
      emotion: data.emotion,
      craving_food: data.cravingFood,
      trigger: data.trigger,
      ai_insight: insight,
      suggested_action: action,
    });

    return { insight, action };
  });

const JournalFromChatInput = z.object({ chatId: z.string().uuid() });

export const generateJournalFromChat = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => JournalFromChatInput.parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: msgs } = await supabase.from("messages")
      .select("role, content").eq("chat_id", data.chatId).order("created_at").limit(50);
    if (!msgs || msgs.length === 0) throw new Error("Tidak ada percakapan");

    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) throw new Error("LOVABLE_API_KEY belum dikonfigurasi");
    const { createLovableAi } = await import("./ai-gateway.server");
    const { generateText } = await import("ai");
    const gateway = createLovableAi(apiKey);

    const transcript = msgs.map((m) => `${m.role === "user" ? "Aku" : "AI"}: ${m.content}`).join("\n");

    const prompt = `Buat ringkasan journal dari percakapan berikut. Output HANYA JSON valid dengan key:
summary (string, 2-3 kalimat ringkasan hari ini dari sudut pandang user),
main_emotion (string, 1-3 kata),
main_trigger (string, 1-5 kata),
lesson (string, 1 kalimat pelajaran),
gratitude (string, 1 hal yang bisa disyukuri),
tomorrow_focus (string, 1 fokus singkat untuk besok).

Percakapan:
${transcript}

JSON:`;

    const r = await generateText({ model: gateway("google/gemini-3-flash-preview"), prompt });
    let parsed: Record<string, string> = {};
    try {
      const m = r.text.match(/\{[\s\S]*\}/);
      parsed = m ? JSON.parse(m[0]) : {};
    } catch {
      parsed = { summary: r.text.slice(0, 400) };
    }

    const { data: journal } = await supabase.from("journals").insert({
      user_id: userId,
      source: "from_chat",
      summary: parsed.summary ?? null,
      main_emotion: parsed.main_emotion ?? null,
      main_trigger: parsed.main_trigger ?? null,
      lesson: parsed.lesson ?? null,
      gratitude: parsed.gratitude ?? null,
      tomorrow_focus: parsed.tomorrow_focus ?? null,
    }).select("id").single();

    return { journalId: journal?.id };
  });

export const getWeeklyInsight = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const since = new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10);
    const [{ data: moods }, { data: eating }] = await Promise.all([
      supabase.from("mood_checkins").select("mood, mood_score, stress_score, energy_score, triggers, date")
        .eq("user_id", userId).gte("date", since).order("date"),
      supabase.from("emotional_eating_logs").select("hunger_type, emotion, trigger, date")
        .eq("user_id", userId).gte("date", since),
    ]);

    if (!moods || moods.length === 0) {
      return { text: "Belum cukup data minggu ini. Mulai mood check-in harian untuk dapat insight personal." };
    }

    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) return { text: "Data terkumpul, namun layanan insight sedang tidak tersedia." };
    const { createLovableAi } = await import("./ai-gateway.server");
    const { generateText } = await import("ai");
    const gateway = createLovableAi(apiKey);

    const summary = `Mood check-in minggu ini: ${JSON.stringify(moods)}. Emotional eating: ${JSON.stringify(eating ?? [])}.`;
    const r = await generateText({
      model: gateway("google/gemini-3-flash-preview"),
      prompt: `Sebagai pendamping AI Bloom Mind, buat insight mingguan singkat (maks 5 kalimat) dalam Bahasa Indonesia yang hangat dan tidak menghakimi. Sebutkan: mood dominan, trigger paling sering, satu hal positif, dan satu fokus untuk minggu depan. Data: ${summary}`,
    });
    return { text: r.text };
  });
