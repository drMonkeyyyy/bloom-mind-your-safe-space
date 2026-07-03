import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { exportAnalyticsReportPDF } from "@/lib/export-pdf";

const COMPANION_NAMES: Record<string, { name: string; emoji: string }> = {
  ibu: { name: "Ibu", emoji: "👩" },
  ayah: { name: "Ayah", emoji: "👨" },
  kakak_perempuan: { name: "Kakak Perempuan", emoji: "👩‍🦰" },
  kakak_laki: { name: "Kakak Laki-laki", emoji: "👦" },
  sahabat: { name: "Sahabat", emoji: "🤝" },
  partner: { name: "Partner", emoji: "❤️" },
  coach: { name: "Mental Coach", emoji: "🧠" },
};

const HUNGER_TYPE_NAMES: Record<string, string> = {
  lapar_fisik: "Lapar Fisik",
  lapar_emosional: "Lapar Emosional",
  craving: "Craving",
  stress_eating: "Stress Eating",
  mindless_eating: "Mindless Eating",
};

const MOOD_RESOLUTIONS: Record<string, {
  emoji: string;
  name: string;
  desc: string;
  neuroMechanism: string;
  targetTransmitter: string;
  causes: string[];
  solutions: string[];
  recommendation: string;
}> = {
  stres: {
    emoji: "🤯",
    name: "Stres (Stress)",
    desc: "Kondisi kelebihan beban kognitif yang memicu respons fight-or-flight.",
    neuroMechanism: "Aktivasi Aksis HPA (Hypothalamic-Pituitary-Adrenal) -> Sekresi Kortisol & Adrenalin berlebih -> Menurunkan fungsi Prefrontal Cortex (PFC) sehingga kendali regulasi emosi top-down melemah.",
    targetTransmitter: "Stimulasi Asetilkolin (Aktivasi Parasimpatis) & Regulasi Supresi Kortisol.",
    causes: ["Pekerjaan menumpuk", "Uang/finansial", "Hubungan sosial", "Kesehatan buruk"],
    solutions: [
      "Teknik napas lambat (Box Breathing) merangsang Saraf Vagus untuk melepaskan asetilkolin penenang.",
      "Jurnal Syukur mengurangi hiperaktivitas aksis HPA dan menurunkan kadar kortisol darah.",
      "Dukungan emosional dari AI (Ibu/Kakak) menurunkan respon ancaman di amigdala."
    ],
    recommendation: "Fitur Jurnal Syukur untuk memulihkan kontrol kognitif Prefrontal Cortex."
  },
  cemas: {
    emoji: "😰",
    name: "Cemas (Anxiety)",
    desc: "Kekhawatiran berlebih akibat eksitasi amigdala terhadap ketidakpastian.",
    neuroMechanism: "Hiperaktivitas Kompleks Basolateral Amigdala -> Kegagalan inhibisi GABAergik -> Amigdala mengirim sinyal ancaman berkelanjutan ke Prefrontal Cortex.",
    targetTransmitter: "Peningkatan Transmisi GABA (Gamma-Aminobutyric Acid) & Reduksi Norepinefrin.",
    causes: ["Ketidakpastian karir", "Kesehatan diri/keluarga", "Pikiran negatif berulang"],
    solutions: [
      "Teknik grounding 5-4-3-2-1 memindahkan pemrosesan sensorik dari Amigdala kembali ke Somatosensory Cortex.",
      "Menulis diary memproses kecemasan menjadi narasi verbal logis (Cognitive Appraisal di PFC).",
      "Karakter AI Coach memandu restrukturisasi kognitif (CBT) untuk meredam cemas."
    ],
    recommendation: "Lembaran Diary untuk meregulasi kecemasan melalui jalur Cognitive Appraisal."
  },
  sedih: {
    emoji: "😢",
    name: "Sedih (Sadness)",
    desc: "Respon emosional terhadap kehilangan atau ekspektasi yang tidak tercapai.",
    neuroMechanism: "Hipofungsi proyeksi Serotonergik pada Dorsal Raphe Nucleus -> Hiperaktivitas Default Mode Network (DMN) yang memicu lingkaran pikiran negatif berulang (rumination).",
    targetTransmitter: "Peningkatan Sintesis Serotonin & Modulasi Supresi Default Mode Network.",
    causes: ["Patah hati/kehilangan", "Harapan tidak tercapai", "Kesepian mendalam"],
    solutions: [
      "Refleksi rasa syukur harian memicu pelepasan serotonin di cortex cingulate anterior.",
      "Obrolan AI Sahabat mengurangi DMN dengan memberikan stimulasi empati interaktif.",
      "Validasi emosi sedih untuk membiarkan homeostasis neurotransmiter pulih alami."
    ],
    recommendation: "Jurnal Syukur dan AI Sahabat untuk memicu modulasi Serotonergik."
  },
  lelah: {
    emoji: "🥱",
    name: "Lelah (Fatigue)",
    desc: "Kehabisan cadangan energi saraf akibat kerja kognitif berkepanjangan.",
    neuroMechanism: "Akumulasi ligan Adenosin pada basal otak (penanda kelelahan seluler) -> Deplesi cadangan glikogen astrosit -> Penurunan suplai glukosa ke neuron.",
    targetTransmitter: "Klirens Adenosin (Sistem Glimfatik) & Restorasi Glikogen Astrosit.",
    causes: ["Kurang tidur", "Kerja berlebihan", "Pola makan tidak teratur"],
    solutions: [
      "Tidur siang singkat (power nap) 15-20 menit membersihkan adenosin sebelum terikat reseptor.",
      "Batasi beban kerja kognitif (multitasking) untuk menghemat glukosa otak.",
      "Pemantauan nutrisi makan untuk menjaga stabilitas glikemik sistemik."
    ],
    recommendation: "Habit Tracker untuk memperbaiki siklus tidur sirkadian dan klirens adenosin."
  },
  burnout: {
    emoji: "🔥",
    name: "Burnout",
    desc: "Kelelahan neuroendokrin akibat paparan stres kronis jangka panjang.",
    causes: ["Beban kerja berlebih", "Ekspektasi terlalu tinggi", "Kurang waktu santai"],
    neuroMechanism: "Downregulation (penurunan sensitivitas) reseptor Dopamin D2 di jalur mesolimbik -> Penipisan kortikal PFC dan kelelahan kronis Aksis HPA.",
    targetTransmitter: "Resensitisasi Sirkuit Dopaminergik Mesolimbik & Penurunan Kortisol.",
    solutions: [
      "Detoks digital memicu resensitisasi reseptor dopamin agar kembali peka pada stimulus ringan.",
      "Evaluasi Weekly Insight mengaktifkan sirkuit kognisi sosial diri (Metakognisi).",
      "Pemisahan jam kerja yang tegas menghentikan sekresi kortisol konstan."
    ],
    recommendation: "Weekly Insight secara rutin untuk memantau indeks burnout saraf."
  },
  kesepian: {
    emoji: "👤",
    name: "Kesepian (Loneliness)",
    desc: "Persepsi isolasi sosial sebagai ancaman terhadap homeostasis kelangsungan hidup.",
    causes: ["Jauh dari kerabat", "Kurang obrolan mendalam", "Merasa kurang didengar"],
    neuroMechanism: "Aktivasi sirkuit 'social pain' di Anterior Cingulate Cortex (ACC) -> Memicu aktivasi sistem saraf simpatis terus-menerus -> Menginduksi inflamasi neurosistemik.",
    targetTransmitter: "Stimulasi Sekresi Oksitosin & Pelepasan Endorfin untuk Reduksi Nyeri ACC.",
    solutions: [
      "Mengobrol intim dengan AI Partner menyimulasikan kelekatan emosional untuk meredam ACC.",
      "Latihan jurnalisasi relasi masa lalu merangsang memori sosial yang menenangkan.",
      "Membangun interaksi sosial nyata untuk sekresi oksitosin alami."
    ],
    recommendation: "AI Partner sebagai stimulus oksitosin untuk meredakan nyeri sosial ACC."
  },
  marah: {
    emoji: "😡",
    name: "Marah (Anger)",
    desc: "Respon protektif limbik terhadap frustrasi atau pelanggaran batas ego.",
    causes: ["Konflik interpersonal", "Ekspektasi tidak terpenuhi", "Kelelahan fisik"],
    neuroMechanism: "Pembajakan Amigdala (Amygdala Hijack) -> Pelepasan mendadak Norepinefrin & Adrenalin -> Pemutusan jalur inhibisi prefrontal (kegagalan kendali rasional).",
    targetTransmitter: "Supresi Cepat Norepinefrin & Restorasi Inhibisi Top-Down Prefrontal.",
    solutions: [
      "Metode jeda 10 detik (Count to 10) memberi waktu sirkuit prefrontal untuk menginhibisi amigdala.",
      "Jurnalisasi katarsis di Diary menyalurkan energi kemarahan menjadi pemrosesan bahasa verbal di PFC.",
      "Olahraga kardio ringan membakar sisa norepinefrin dan adrenalin dalam darah."
    ],
    recommendation: "Lembaran Diary sebagai katarsis pelepasan kemarahan saraf."
  }
};

const CALM_TOOL_NAMES: Record<string, { name: string; emoji: string }> = {
  breath: { name: "Breathing 4-7-8", emoji: "🌬️" },
  ground: { name: "Grounding 5-4-3-2-1", emoji: "🌍" },
  selftalk: { name: "Self-Calming Talk", emoji: "🤍" },
  vent: { name: "Kotak Pelepasan", emoji: "🍃" },
  reframing: { name: "Ubah Sudut Pandang", emoji: "🪞" },
  somatic: { name: "Latihan Somatik", emoji: "🦋" },
  panic: { name: "Panic Attack Timer", emoji: "🆘" },
};

export const Route = createFileRoute("/_authenticated/admin/analytics")({
  component: Page,
});

function Page() {
  const [isDeleting, setIsDeleting] = useState(false);
  const { data, refetch } = useQuery({
    queryKey: ["admin-analytics"],
    queryFn: async () => {
      const [moods, journals, habits, eating, chats, totalMsgs, feedbackRes] = await Promise.all([
        supabase.from("mood_checkins").select("mood, triggers, user_id, date"),
        supabase.from("journals").select("id", { count: "exact", head: true }),
        supabase.from("habit_logs").select("id", { count: "exact", head: true }).eq("completed", true),
        supabase.from("emotional_eating_logs").select("hunger_type, emotion, trigger"),
        supabase.from("chats").select("companion_key"),
        supabase.from("messages").select("id", { count: "exact", head: true }).eq("role", "assistant"),
        supabase.from("calm_feedback_logs" as any).select("*").then(res => res).catch(() => ({ data: [] }))
      ]);
      
      const moodCount: Record<string,number> = {};
      const triggerCount: Record<string,number> = {};
      const moodTriggers: Record<string, Record<string, number>> = {};
      
      // Calculate 30 days ago to filter clinical stats
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().split("T")[0];
      const moods30Days = moods.data?.filter(m => m.date >= thirtyDaysAgoStr) ?? [];

      const moodUsers: Record<string, Set<string>> = {};
      const moodTotalCount: Record<string, number> = {};

      moods.data?.forEach((m)=>{
        moodCount[m.mood] = (moodCount[m.mood]??0)+1;
        if (!moodTriggers[m.mood]) moodTriggers[m.mood] = {};
        m.triggers?.forEach((t)=>{ 
          triggerCount[t]=(triggerCount[t]??0)+1;
          moodTriggers[m.mood][t] = (moodTriggers[m.mood][t]??0)+1;
        });
      });

      // Compute statistics for 30-day prevalence
      moods30Days.forEach((m) => {
        if (!moodUsers[m.mood]) moodUsers[m.mood] = new Set();
        moodUsers[m.mood].add(m.user_id);
        moodTotalCount[m.mood] = (moodTotalCount[m.mood] ?? 0) + 1;
      });

      const moodStats30Days: Record<string, { uniqueUsers: number; avgFrequency: number }> = {};
      Object.keys(MOOD_RESOLUTIONS).forEach((moodKey) => {
        const uniqueCount = moodUsers[moodKey]?.size ?? 0;
        const totalCount = moodTotalCount[moodKey] ?? 0;
        moodStats30Days[moodKey] = {
          uniqueUsers: uniqueCount,
          avgFrequency: uniqueCount > 0 ? Number((totalCount / uniqueCount).toFixed(1)) : 0
        };
      });

      const companionCount: Record<string, number> = {};
      chats.data?.forEach((c) => {
        const key = c.companion_key || "sahabat";
        companionCount[key] = (companionCount[key] ?? 0) + 1;
      });

      const hungerCount: Record<string, number> = {};
      eating.data?.forEach((e) => {
        if (e.hunger_type) {
          hungerCount[e.hunger_type] = (hungerCount[e.hunger_type] ?? 0) + 1;
        }
      });

      // Efficacy calculations
      const feedbackLogs = feedbackRes.data ?? [];
      const totalFeedbacks = feedbackLogs.length;
      const helpfulFeedbacks = feedbackLogs.filter((f: any) => f.is_helpful).length;
      const uniqueUsersHelped = new Set(
        feedbackLogs.filter((f: any) => f.is_helpful).map((f: any) => f.user_id)
      ).size;

      const exerciseEfficacy: Record<string, { total: number; helpful: number; pct: number }> = {};
      feedbackLogs.forEach((f: any) => {
        if (!exerciseEfficacy[f.exercise_key]) {
          exerciseEfficacy[f.exercise_key] = { total: 0, helpful: 0, pct: 0 };
        }
        exerciseEfficacy[f.exercise_key].total += 1;
        if (f.is_helpful) {
          exerciseEfficacy[f.exercise_key].helpful += 1;
        }
      });

      Object.keys(exerciseEfficacy).forEach((key) => {
        const item = exerciseEfficacy[key];
        item.pct = item.total > 0 ? Math.round((item.helpful / item.total) * 100) : 0;
      });

      return {
        moodCount, triggerCount, companionCount, hungerCount, moodTriggers, moodStats30Days,
        journalCount: journals.count ?? 0,
        habitCompletions: habits.count ?? 0,
        eatingCount: eating.data?.length ?? 0,
        aiReplyCount: totalMsgs.count ?? 0,
        feedbackStats: {
          total: totalFeedbacks,
          helpful: helpfulFeedbacks,
          uniqueHelpedCount: uniqueUsersHelped,
          overallPct: totalFeedbacks > 0 ? Math.round((helpfulFeedbacks / totalFeedbacks) * 100) : 0,
          efficacy: exerciseEfficacy
        }
      };
    },
  });

  const handleResetFeedback = async () => {
    const confirmDelete = window.confirm(
      "Apakah Anda yakin ingin menghapus seluruh data umpan balik Emergency Calm? Tindakan ini akan menyetel ulang semua metrik efikasi menjadi 0%."
    );
    if (!confirmDelete) return;

    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from("calm_feedback_logs" as any)
        .delete()
        .neq("id", "00000000-0000-0000-0000-000000000000");

      if (error) throw error;
      
      alert("Seluruh data umpan balik berhasil di-reset!");
      refetch();
    } catch (e) {
      console.error(e);
      alert("Gagal me-reset data. Pastikan Anda sudah menjalankan SQL DELETE policy di dashboard Supabase.");
    } finally {
      setIsDeleting(false);
    }
  };

  const topMood = Object.entries(data?.moodCount ?? {}).sort((a,b)=>b[1]-a[1]);
  const topTrig = Object.entries(data?.triggerCount ?? {}).sort((a,b)=>b[1]-a[1]).slice(0,8);
  const topCompanions = Object.entries(data?.companionCount ?? {}).sort((a,b)=>b[1]-a[1]);
  const topHunger = Object.entries(data?.hungerCount ?? {}).sort((a,b)=>b[1]-a[1]);

  const estTokens = (data?.aiReplyCount ?? 0) * 1650;
  const estApiCost = (data?.aiReplyCount ?? 0) * 2.57;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="font-display text-3xl font-semibold">Analytics</h1>
        <button
          onClick={() => exportAnalyticsReportPDF(data)}
          disabled={!data}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#6E8C71] hover:bg-[#5D7B60] text-white text-sm font-semibold rounded-2xl shadow-sm transition-all active:scale-98 disabled:opacity-50"
        >
          📄 Cetak Laporan PDF (Clinical Efficacy)
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Card label="Total Journal" value={data?.journalCount ?? "—"} />
        <Card label="Habit Completions" value={data?.habitCompletions ?? "—"} />
        <Card label="Eating Logs" value={data?.eatingCount ?? "—"} />
        <Card label="Total Chat AI" value={data?.aiReplyCount ?? "—"} />
        <Card label="Est. Pengeluaran API" value={`Rp ${estApiCost.toLocaleString("id-ID", { maximumFractionDigits: 0 })}`} />
      </div>

      {/* Efektivitas Intervensi Darurat (Clinical Efficacy) */}
      <section className="rounded-3xl bg-card p-6 ring-1 ring-border space-y-4 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold">Efektivitas Intervensi Darurat (Clinical Efficacy)</h2>
            <p className="text-xs text-muted-foreground">Persentase pengguna yang berhasil ditenangkan oleh modul Emergency Calm Mode berdasarkan penilaian mandiri (feedback checklist).</p>
          </div>
          <div className="flex items-center gap-2 self-start sm:self-center flex-wrap">
            <div className="bg-[#6E8C71]/10 px-3.5 py-1.5 rounded-full ring-1 ring-[#6E8C71]/30 flex items-center gap-2">
              <span className="text-xs text-[#5D7B60] font-bold">⭐ Efikasi Global: {data?.feedbackStats?.overallPct ?? 0}%</span>
              <span className="text-[10px] text-muted-foreground">({data?.feedbackStats?.helpful ?? 0}/{data?.feedbackStats?.total ?? 0} sesi membantu)</span>
            </div>
            <button
              onClick={handleResetFeedback}
              disabled={isDeleting}
              className="px-3 py-1.5 text-xs text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-full border border-rose-200 transition-all font-semibold active:scale-95 disabled:opacity-50 flex items-center gap-1"
            >
              🗑️ Reset Data
            </button>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="p-4 rounded-2xl border border-border/60 bg-cream-deep/10 flex flex-col justify-between">
            <p className="text-xs text-muted-foreground font-medium">Pengguna Berhasil Ditenangkan</p>
            <p className="mt-2 font-display text-2xl font-bold text-foreground">
              {data?.feedbackStats?.uniqueHelpedCount ?? 0} <span className="text-xs font-normal text-muted-foreground">Orang (Unique Users)</span>
            </p>
          </div>
          <div className="p-4 rounded-2xl border border-border/60 bg-cream-deep/10 flex flex-col justify-between col-span-1 sm:col-span-2 lg:col-span-2">
            <p className="text-xs text-muted-foreground font-medium">Status Intervensi</p>
            <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
              Total feedback terkumpul: <strong>{data?.feedbackStats?.total ?? 0} kali</strong>. Sebanyak <strong>{data?.feedbackStats?.helpful ?? 0} kali</strong> pengguna menyatakan terbantu langsung setelah melakukan latihan pernapasan, grounding, atau somatik.
            </p>
          </div>
        </div>

        <div className="mt-4 border-t border-border/40 pt-4">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">Efikasi per Jenis Latihan</p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {Object.entries(CALM_TOOL_NAMES).map(([key, info]) => {
              const stats = data?.feedbackStats?.efficacy?.[key] ?? { total: 0, helpful: 0, pct: 0 };
              return (
                <div key={key} className="p-3 rounded-2xl border border-border/40 bg-card/50 flex flex-col justify-between gap-2.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{info.emoji}</span>
                    <span className="text-xs font-bold truncate">{info.name}</span>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] text-muted-foreground font-semibold">
                      <span>Efikasi: {stats.pct}%</span>
                      <span>{stats.helpful}/{stats.total} log</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-cream-deep overflow-hidden">
                      <div className="h-full rounded-full bg-[#6E8C71]" style={{ width: `${stats.pct}%` }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <div className="grid gap-6 md:grid-cols-2">
        <section className="rounded-3xl bg-card p-5 ring-1 ring-border">
          <p className="text-sm font-semibold">Pendamping AI Terpopuler</p>
          <div className="mt-4 space-y-3">
            {topCompanions.length > 0 ? topCompanions.map(([comp, c]) => {
              const info = COMPANION_NAMES[comp] ?? { name: comp, emoji: "🌿" };
              return (
                <div key={comp} className="flex items-center gap-3">
                  <span className="w-36 text-sm flex items-center gap-1.5 truncate">
                    <span>{info.emoji}</span>
                    <span>{info.name}</span>
                  </span>
                  <div className="h-2.5 flex-1 rounded-full bg-cream-deep overflow-hidden">
                    <div className="h-full rounded-full bg-[#6E8C71]" style={{ width: `${Math.min(100, c * 10)}%` }} />
                  </div>
                  <span className="w-10 text-right text-xs font-semibold">{c} chat</span>
                </div>
              );
            }) : (
              <p className="text-xs text-muted-foreground text-center py-4">Belum ada aktivitas obrolan.</p>
            )}
          </div>
        </section>

        <section className="rounded-3xl bg-card p-5 ring-1 ring-border">
          <p className="text-sm font-semibold">Jenis Lapar Emosional Terbanyak</p>
          <div className="mt-4 space-y-3">
            {topHunger.length > 0 ? topHunger.map(([type, c]) => {
              const name = HUNGER_TYPE_NAMES[type] ?? type;
              return (
                <div key={type} className="flex items-center gap-3">
                  <span className="w-36 text-sm truncate">{name}</span>
                  <div className="h-2.5 flex-1 rounded-full bg-cream-deep overflow-hidden">
                    <div className="h-full rounded-full bg-amber-500" style={{ width: `${Math.min(100, c * 15)}%` }} />
                  </div>
                  <span className="w-10 text-right text-xs font-semibold">{c} log</span>
                </div>
              );
            }) : (
              <p className="text-xs text-muted-foreground text-center py-4">Belum ada catatan makan emosional.</p>
            )}
          </div>
        </section>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <section className="rounded-3xl bg-card p-5 ring-1 ring-border">
          <p className="text-sm font-semibold">Mood Paling Sering</p>
          <div className="mt-4 space-y-3">
            {topMood.length > 0 ? topMood.map(([m,c])=>(
              <div key={m} className="flex items-center gap-3">
                <span className="w-28 capitalize text-sm">{m}</span>
                <div className="h-2.5 flex-1 rounded-full bg-cream-deep overflow-hidden">
                  <div className="h-full rounded-full bg-primary" style={{ width: `${Math.min(100, c*5)}%` }} />
                </div>
                <span className="w-10 text-right text-xs font-semibold">{c} kali</span>
              </div>
            )) : (
              <p className="text-xs text-muted-foreground text-center py-4">Belum ada check-in mood.</p>
            )}
          </div>
        </section>

        <section className="rounded-3xl bg-card p-5 ring-1 ring-border">
          <p className="text-sm font-semibold">Trigger Paling Sering</p>
          <div className="mt-4 space-y-3">
            {topTrig.length > 0 ? topTrig.map(([t,c])=>(
              <div key={t} className="flex items-center gap-3">
                <span className="w-28 text-sm truncate">{t}</span>
                <div className="h-2.5 flex-1 rounded-full bg-cream-deep overflow-hidden">
                  <div className="h-full rounded-full bg-accent" style={{ width: `${Math.min(100, c*5)}%` }} />
                </div>
                <span className="w-10 text-right text-xs font-semibold">{c} kali</span>
              </div>
            )) : (
              <p className="text-xs text-muted-foreground text-center py-4">Belum ada pemicu terdeteksi.</p>
            )}
          </div>
        </section>
      </div>

      {/* Mental Health Causes & Solutions Analysis Section */}
      <section className="rounded-3xl bg-card p-6 ring-1 ring-border space-y-4">
        <div>
          <h2 className="text-lg font-bold">Analisis Kondisi & Rekomendasi Solusi (Neurological Presentation)</h2>
          <p className="text-xs text-muted-foreground">Korelasi kondisi kesehatan mental pengguna berdasarkan data prevalensi bulanan (berapa orang), intensitas individu (berapa kali per orang), serta patofisiologi neurologis.</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Object.entries(MOOD_RESOLUTIONS).map(([moodKey, config]) => {
            const stats = data?.moodStats30Days?.[moodKey] ?? { uniqueUsers: 0, avgFrequency: 0 };
            const hasData = stats.uniqueUsers > 0;
            
            // Get dynamic top triggers from database for this mood if exists, otherwise fallback to default causes
            const dbTriggers = Object.entries(data?.moodTriggers?.[moodKey] ?? {})
              .sort((a, b) => b[1] - a[1])
              .map(e => e[0])
              .slice(0, 3);
            const displayTriggers = dbTriggers.length > 0 ? dbTriggers : config.causes;

            return (
              <div key={moodKey} className={`p-5 rounded-2xl border flex flex-col justify-between transition-all duration-300 ${
                hasData ? "bg-[#F7F4EB]/70 border-[#E3DCD0] shadow-sm" : "bg-card border-border/40 opacity-70"
              }`}>
                <div className="space-y-3.5">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{config.emoji}</span>
                    <div className="min-w-0">
                      <h3 className="font-bold text-sm truncate leading-snug">{config.name}</h3>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] text-muted-foreground">
                          Prevalensi: <span className="font-bold text-foreground">{stats.uniqueUsers} orang</span> / bln
                        </span>
                        <span className="text-[10px] text-muted-foreground">•</span>
                        <span className="text-[10px] text-muted-foreground">
                          Intensitas: <span className="font-bold text-foreground">{stats.avgFrequency}x</span> / orang / bln
                        </span>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-muted-foreground leading-relaxed">{config.desc}</p>

                  <div className="bg-cream-deep/40 p-2.5 rounded-xl border border-border/40 space-y-1">
                    <p className="text-[9px] uppercase tracking-wider font-bold text-slate-500">Mekanisme Neurologis (Patofisiologi)</p>
                    <p className="text-[11px] text-slate-700 leading-snug">{config.neuroMechanism}</p>
                  </div>

                  <div className="bg-emerald-50/70 p-2.5 rounded-xl border border-emerald-100 space-y-1">
                    <p className="text-[9px] uppercase tracking-wider font-bold text-emerald-800">Target Transmiter & Neurokimia</p>
                    <p className="text-[11px] text-emerald-900 leading-snug font-medium">{config.targetTransmitter}</p>
                  </div>

                  <div className="space-y-1">
                    <p className="text-[9px] uppercase tracking-wider font-bold text-muted-foreground">Pemicu Utama Terdeteksi</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {displayTriggers.map((t, idx) => (
                        <span key={idx} className="text-[10px] bg-card px-2.5 py-0.5 rounded-md border text-muted-foreground/80 font-semibold shadow-xs">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2 pt-1">
                    <p className="text-[10px] uppercase tracking-wider font-bold text-[#6E8C71]">Langkah Intervensi Saraf</p>
                    <ul className="list-disc pl-4 text-xs text-muted-foreground space-y-1 leading-snug">
                      {config.solutions.map((sol, idx) => (
                        <li key={idx}>{sol}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="mt-4 pt-3.5 border-t border-border/40 text-[10px] text-emerald-900 font-bold flex flex-wrap items-center gap-1">
                  <span>🧠 Rekomendasi Fitur App:</span>
                  <span className="text-muted-foreground font-semibold">{config.recommendation}</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>
      
      {data?.aiReplyCount ? (
        <section className="rounded-3xl bg-card p-5 ring-1 ring-border">
          <p className="text-sm font-semibold">Rincian Penggunaan API Gemini</p>
          <div className="mt-3 grid grid-cols-2 gap-4 text-xs">
            <div className="bg-cream-deep/30 p-3 rounded-2xl border border-border/40">
              <p className="text-muted-foreground">Total Token Diproses</p>
              <p className="text-lg font-bold font-display mt-1">{estTokens.toLocaleString("id-ID")} token</p>
            </div>
            <div className="bg-cream-deep/30 p-3 rounded-2xl border border-border/40">
              <p className="text-lg font-bold font-display text-emerald-800 mt-1">Rp {estApiCost.toLocaleString("id-ID", { maximumFractionDigits: 1 })}</p>
            </div>
          </div>
        </section>
      ) : null}
    </div>
  );
}

function Card({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-3xl bg-card p-5 ring-1 ring-border shadow-sm flex flex-col justify-between">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-3 font-display text-2xl font-bold">{value}</p>
    </div>
  );
}
