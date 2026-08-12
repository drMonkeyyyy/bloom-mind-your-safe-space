/**
 * DASS-21 (Depression Anxiety Stress Scale - 21 items) Core Domain Engine
 * Validated Indonesian Version for JN-CALM Mental Health Screening
 * 
 * Medical & Psychological Standards:
 * - Deterministic scoring: raw subscale sum * 2
 * - Cutoff categories: Normal, Ringan, Sedang, Berat, Sangat berat
 * - Non-diagnostic supportive language
 * - Validated C-SSRS style suicide risk safety check
 */

export interface DASS21Item {
  id: number; // 1 to 21
  text: string;
  domain: "depression" | "anxiety" | "stress";
}

export type DASS21Category = "Normal" | "Ringan" | "Sedang" | "Berat" | "Sangat berat";

export interface SubscaleResult {
  score: number; // 0 - 42
  rawSum: number; // 0 - 21
  category: DASS21Category;
  explanation: string;
  color: string;
  bgLight: string;
  badgeBg: string;
}

export interface DASS21Scores {
  depression: SubscaleResult;
  anxiety: SubscaleResult;
  stress: SubscaleResult;
  dominantDomain: "depression" | "anxiety" | "stress" | "mixed";
}

export interface RecommendationItem {
  id: string;
  title: string;
  description: string;
  path: string;
  iconName: string;
  badgeText: string;
  colorClass: string;
}

// Exact validated Indonesian translation of DASS-21 items
export const DASS21_ITEMS: DASS21Item[] = [
  { id: 1, domain: "stress", text: "Saya merasa sulit untuk menjadi tenang." },
  { id: 2, domain: "anxiety", text: "Saya menyadari mulut saya terasa kering." },
  { id: 3, domain: "depression", text: "Saya sepertinya tidak dapat merasakan perasaan positif sama sekali." },
  { id: 4, domain: "anxiety", text: "Saya mengalami kesulitan bernapas (misalnya: bernapas terlalu cepat, terengah-engah tanpa adanya aktivitas fisik)." },
  { id: 5, domain: "depression", text: "Saya merasa kesulitan untuk inisiatif melakukan sesuatu." },
  { id: 6, domain: "stress", text: "Saya cenderung bereaksi berlebihan terhadap situasi." },
  { id: 7, domain: "anxiety", text: "Saya merasa gemetar (misalnya: pada tangan)." },
  { id: 8, domain: "stress", text: "Saya merasa menggunakan banyak energi gelisah." },
  { id: 9, domain: "anxiety", text: "Saya merasa cemas tentang situasi di mana saya mungkin panik dan mempermalukan diri sendiri." },
  { id: 10, domain: "depression", text: "Saya merasa tidak ada hal yang dapat diharap-harapkan lagi." },
  { id: 11, domain: "stress", text: "Saya merasa mudah gelisah." },
  { id: 12, domain: "stress", text: "Saya merasa sulit untuk bersantai." },
  { id: 13, domain: "depression", text: "Saya merasa sedih dan tertekan." },
  { id: 14, domain: "stress", text: "Saya merasa tidak sabar dengan apa pun yang menghalangi saya melanjutkan apa yang sedang saya lakukan." },
  { id: 15, domain: "anxiety", text: "Saya merasa hampir panik." },
  { id: 16, domain: "depression", text: "Saya tidak mampu merasa antusias tentang apa pun." },
  { id: 17, domain: "depression", text: "Saya merasa bahwa saya tidak berharga sebagai seorang manusia." },
  { id: 18, domain: "stress", text: "Saya merasa bahwa saya agak tersinggung / sensitif." },
  { id: 19, domain: "anxiety", text: "Saya menyadari kerja jantung saya tanpa adanya aktivitas fisik (misalnya: merasa peningkatan denyut jantung atau jantung berhenti berdetak)." },
  { id: 20, domain: "anxiety", text: "Saya merasa takut tanpa alasan yang jelas." },
  { id: 21, domain: "depression", text: "Saya merasa hidup tidak berarti." }
];

export const RESPONSE_OPTIONS = [
  { value: 0, label: "Tidak pernah", description: "Tidak berlaku untuk saya sama sekali" },
  { value: 1, label: "Kadang-kadang", description: "Berlaku untuk saya sampai batas tertentu/kadang-kadang" },
  { value: 2, label: "Sering", description: "Berlaku untuk saya sampai batas yang cukup nyata/sering" },
  { value: 3, label: "Hampir selalu", description: "Sangat berlaku untuk saya/hampir selalu terjadi" }
];

// Item index mappings (1-based)
export const DASS21_MAPPINGS = {
  depression: [3, 5, 10, 13, 16, 17, 21],
  anxiety: [2, 4, 7, 9, 15, 19, 20],
  stress: [1, 6, 8, 11, 12, 14, 18]
};

// Category cutoff helper functions (deterministic)
export function getDepressionCategory(score: number): DASS21Category {
  if (score <= 9) return "Normal";
  if (score <= 13) return "Ringan";
  if (score <= 20) return "Sedang";
  if (score <= 27) return "Berat";
  return "Sangat berat";
}

export function getAnxietyCategory(score: number): DASS21Category {
  if (score <= 7) return "Normal";
  if (score <= 9) return "Ringan";
  if (score <= 14) return "Sedang";
  if (score <= 19) return "Berat";
  return "Sangat berat";
}

export function getStressCategory(score: number): DASS21Category {
  if (score <= 14) return "Normal";
  if (score <= 18) return "Ringan";
  if (score <= 25) return "Sedang";
  if (score <= 33) return "Berat";
  return "Sangat berat";
}

// Non-diagnostic supportive explanations tailored to each domain & severity
export function getDepressionExplanation(category: DASS21Category): string {
  switch (category) {
    case "Normal":
      return "Jawabanmu menunjukkan tingkat suasana hati yang stabil. Pertahankan ritme positifmu bersama JN-CALM.";
    case "Ringan":
      return "Jawabanmu menunjukkan gejala depresi ringan. Lakukan habit kecil dan gratitude journal di JN-CALM untuk dorongan energi positif.";
    case "Sedang":
      return "Jawabanmu menunjukkan gejala depresi sedang. Luangkan waktu khusus untuk journaling refleksi dan chat bersama AI Companion JN-CALM.";
    case "Berat":
      return "Jawabanmu menunjukkan gejala depresi berat. Mulai pulihkan energimu secara bertahap melalui program mikro-habit harian JN-CALM.";
    case "Sangat berat":
      return "Jawabanmu menunjukkan gejala depresi sangat berat. Fokus pada langkah kecil penenangan diri di JN-CALM dan luangkan waktu untuk istirahat.";
    default:
      return "Jawabanmu memberikan gambaran kondisi suasana hatimu minggu ini bersama JN-CALM.";
  }
}

export function getAnxietyExplanation(category: DASS21Category): string {
  switch (category) {
    case "Normal":
      return "Jawabanmu menunjukkan tingkat kecemasan yang normal dan terkendali minggu ini.";
    case "Ringan":
      return "Jawabanmu menunjukkan gejala kecemasan ringan. Latihan pernapasan terpandu di JN-CALM dapat membantumu tetap rileks.";
    case "Sedang":
      return "Jawabanmu menunjukkan gejala kecemasan sedang. Gunakan fitur Grounding 5-4-3-2-1 JN-CALM saat merasa pikiran mulai terdistraksi.";
    case "Berat":
      return "Jawabanmu menunjukkan gejala kecemasan berat. Fitur Emergency Calm & audio penenang JN-CALM siap membantumu kapan saja.";
    case "Sangat berat":
      return "Jawabanmu menunjukkan gejala kecemasan sangat berat. Rilis gelisah fisikmu segera menggunakan modul relaksasi darurat JN-CALM.";
    default:
      return "Jawabanmu memberikan gambaran respon kecemasan fisik & pikiranmu minggu ini.";
  }
}

export function getStressExplanation(category: DASS21Category): string {
  switch (category) {
    case "Normal":
      return "Jawabanmu menunjukkan tingkat stres yang berada dalam batas normal dan seimbang.";
    case "Ringan":
      return "Jawabanmu menunjukkan gejala stres ringan. Jurnal pemicu stres JN-CALM dapat membantumu memetakan beban harian.";
    case "Sedang":
      return "Jawabanmu menunjukkan gejala stres sedang. Luangkan 5 menit untuk latihan pernapasan 4-7-8 di JN-CALM sebelum istirahat.";
    case "Berat":
      return "Jawabanmu menunjukkan gejala stres berat. Jalankan Program 7-Hari Kelola Stres JN-CALM untuk membangun resiliensi emosional.";
    case "Sangat berat":
      return "Jawabanmu menunjukkan gejala stres sangat berat. Berikan jeda total pada tubuhmu dan manfaatkan modul rilis ketegangan JN-CALM.";
    default:
      return "Jawabanmu memberikan gambaran respon tingkat stres harianmu minggu ini.";
  }
}

export function getCategoryBadgeStyles(category: DASS21Category) {
  switch (category) {
    case "Normal":
      return {
        color: "text-emerald-700 dark:text-emerald-300",
        bgLight: "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800",
        badgeBg: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-200",
        barBg: "bg-emerald-500"
      };
    case "Ringan":
      return {
        color: "text-sky-700 dark:text-sky-300",
        bgLight: "bg-sky-50 dark:bg-sky-950/40 border-sky-200 dark:border-sky-800",
        badgeBg: "bg-sky-100 text-sky-800 dark:bg-sky-900/60 dark:text-sky-200",
        barBg: "bg-sky-500"
      };
    case "Sedang":
      return {
        color: "text-amber-700 dark:text-amber-300",
        bgLight: "bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800",
        badgeBg: "bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-200",
        barBg: "bg-amber-500"
      };
    case "Berat":
      return {
        color: "text-orange-700 dark:text-orange-300",
        bgLight: "bg-orange-50 dark:bg-orange-950/40 border-orange-200 dark:border-orange-800",
        badgeBg: "bg-orange-100 text-orange-800 dark:bg-orange-900/60 dark:text-orange-200",
        barBg: "bg-orange-500"
      };
    case "Sangat berat":
      return {
        color: "text-rose-700 dark:text-rose-300",
        bgLight: "bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800",
        badgeBg: "bg-rose-100 text-rose-800 dark:bg-rose-900/60 dark:text-rose-200",
        barBg: "bg-rose-500"
      };
    default:
      return {
        color: "text-emerald-700 dark:text-emerald-300",
        bgLight: "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800",
        badgeBg: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-200",
        barBg: "bg-emerald-500"
      };
  }
}

/**
 * Main deterministic scoring engine for DASS-21
 */
export function calculateDASS21Scores(answers: Record<number, number>): DASS21Scores {
  // Sum subscales
  let depRaw = 0;
  let anxRaw = 0;
  let strRaw = 0;

  DASS21_MAPPINGS.depression.forEach((id) => {
    depRaw += answers[id] ?? 0;
  });
  DASS21_MAPPINGS.anxiety.forEach((id) => {
    anxRaw += answers[id] ?? 0;
  });
  DASS21_MAPPINGS.stress.forEach((id) => {
    strRaw += answers[id] ?? 0;
  });

  const depScore = depRaw * 2;
  const anxScore = anxRaw * 2;
  const strScore = strRaw * 2;

  const depCat = getDepressionCategory(depScore);
  const anxCat = getAnxietyCategory(anxScore);
  const strCat = getStressCategory(strScore);

  const depStyle = getCategoryBadgeStyles(depCat);
  const anxStyle = getCategoryBadgeStyles(anxCat);
  const strStyle = getCategoryBadgeStyles(strCat);

  // Determine dominant domain (highest proportion of severity)
  const severityRank: Record<DASS21Category, number> = {
    "Normal": 0,
    "Ringan": 1,
    "Sedang": 2,
    "Berat": 3,
    "Sangat berat": 4
  };

  const ranks = [
    { domain: "stress" as const, rank: severityRank[strCat], scoreRatio: strScore / 34 },
    { domain: "anxiety" as const, rank: severityRank[anxCat], scoreRatio: anxScore / 20 },
    { domain: "depression" as const, rank: severityRank[depCat], scoreRatio: depScore / 28 }
  ];

  ranks.sort((a, b) => {
    if (b.rank !== a.rank) return b.rank - a.rank;
    return b.scoreRatio - a.scoreRatio;
  });

  let dominantDomain: "depression" | "anxiety" | "stress" | "mixed" = ranks[0].domain;
  if (ranks[0].rank === ranks[1].rank && ranks[0].rank > 0) {
    dominantDomain = "mixed";
  }

  return {
    depression: {
      score: depScore,
      rawSum: depRaw,
      category: depCat,
      explanation: getDepressionExplanation(depCat),
      color: depStyle.color,
      bgLight: depStyle.bgLight,
      badgeBg: depStyle.badgeBg
    },
    anxiety: {
      score: anxScore,
      rawSum: anxRaw,
      category: anxCat,
      explanation: getAnxietyExplanation(anxCat),
      color: anxStyle.color,
      bgLight: anxStyle.bgLight,
      badgeBg: anxStyle.badgeBg
    },
    stress: {
      score: strScore,
      rawSum: strRaw,
      category: strCat,
      explanation: getStressExplanation(strCat),
      color: strStyle.color,
      bgLight: strStyle.bgLight,
      badgeBg: strStyle.badgeBg
    },
    dominantDomain
  };
}

/**
 * Generate max 3 personalized JN-CALM feature recommendations
 */
export function getPersonalizedRecommendations(scores: DASS21Scores): RecommendationItem[] {
  const allRecs: Record<string, RecommendationItem> = {
    ai_companion: {
      id: "ai_companion",
      title: "Teman Curhat AI JN-CALM",
      description: "Ruang aman 24/7 untuk mencurahkan isi hati & emosimu tanpa rasa takut dihakimi.",
      path: "/app/chat",
      iconName: "MessageSquare",
      badgeText: "Teman Curhat",
      colorClass: "from-pink-500/10 to-rose-500/20 text-rose-700 dark:text-rose-300"
    },
    emergency_calm: {
      id: "emergency_calm",
      title: "Emergency Calm",
      description: "Pertolongan pertama regulasi emosi cepat dengan audio Canon in D & relaksasi.",
      path: "/app/calm",
      iconName: "Wind",
      badgeText: "Rilis Stres & Cemas",
      colorClass: "from-teal-500/10 to-emerald-500/20 text-emerald-700 dark:text-emerald-300"
    },
    breathing: {
      id: "breathing",
      title: "Latihan Pernapasan 4-7-8",
      description: "Napas ritmis membantumu menurunkan denyut jantung dan gelisah fisik.",
      path: "/app/calm",
      iconName: "Activity",
      badgeText: "Napas Terpandu",
      colorClass: "from-sky-500/10 to-blue-500/20 text-sky-700 dark:text-sky-300"
    },
    grounding: {
      id: "grounding",
      title: "Teknik Grounding 5-4-3-2-1",
      description: "Kembalikan pikiran ke masa kini dan kurangi serangan pemicu kecemasan.",
      path: "/app/calm",
      iconName: "Anchor",
      badgeText: "Atasi Serangan Cemas",
      colorClass: "from-amber-500/10 to-orange-500/20 text-amber-700 dark:text-amber-300"
    },
    stress_journal: {
      id: "stress_journal",
      title: "Journaling Pemicu Stres",
      description: "Uraikan pikiran yang menumpuk untuk menemukan kejernihan batin.",
      path: "/app/journal",
      iconName: "BookOpen",
      badgeText: "Jurnal Refleksi",
      colorClass: "from-purple-500/10 to-pink-500/20 text-purple-700 dark:text-purple-300"
    },
    worry_journal: {
      id: "worry_journal",
      title: "Worry Journal",
      description: "Tuliskan kekhawatiranmu dan pisahkan mana yang berada dalam kendalimu.",
      path: "/app/journal",
      iconName: "Feather",
      badgeText: "Kelola Rasa Cemas",
      colorClass: "from-indigo-500/10 to-blue-500/20 text-indigo-700 dark:text-indigo-300"
    },
    gratitude_journal: {
      id: "gratitude_journal",
      title: "Gratitude Journal",
      description: "Latih otak menemukan keberkahan kecil setiap hari untuk dorongan dopamin alami.",
      path: "/app/gratitude",
      iconName: "Heart",
      badgeText: "Aktivasi Positif",
      colorClass: "from-rose-500/10 to-pink-500/20 text-rose-700 dark:text-rose-300"
    },
    mood_tracker: {
      id: "mood_tracker",
      title: "Pemeriksaan & Tracker Mood",
      description: "Pantau pemicu emosi harianmu bersama companion JN-CALM favoritmu.",
      path: "/app/mood",
      iconName: "Smile",
      badgeText: "Kesadaran Emosi",
      colorClass: "from-emerald-500/10 to-teal-500/20 text-emerald-700 dark:text-emerald-300"
    },
    small_habits: {
      id: "small_habits",
      title: "Aktivasi Mikro-Habit Harian",
      description: "Mulai dari 1 langkah paling ringan setiap hari untuk mengembalikan energi.",
      path: "/app/habits",
      iconName: "CheckCircle2",
      badgeText: "Langkah Kecil",
      colorClass: "from-cyan-500/10 to-blue-500/20 text-cyan-700 dark:text-cyan-300"
    },
    growth_program: {
      id: "growth_program",
      title: "Program Kelola Emosi 7-Hari",
      description: "Panduan bertahap harian untuk membangun resiliensi emosional.",
      path: "/app/growth",
      iconName: "Sparkles",
      badgeText: "Program Terpandu",
      colorClass: "from-violet-500/10 to-fuchsia-500/20 text-violet-700 dark:text-violet-300"
    }
  };

  const selected: RecommendationItem[] = [];

  if (scores.dominantDomain === "stress") {
    selected.push(allRecs.ai_companion, allRecs.emergency_calm, allRecs.stress_journal);
  } else if (scores.dominantDomain === "anxiety") {
    selected.push(allRecs.ai_companion, allRecs.grounding, allRecs.worry_journal);
  } else if (scores.dominantDomain === "depression") {
    selected.push(allRecs.ai_companion, allRecs.small_habits, allRecs.gratitude_journal);
  } else {
    // Mixed domain
    selected.push(allRecs.ai_companion, allRecs.emergency_calm, allRecs.grounding);
  }

  // Ensure max 3
  return selected.slice(0, 3);
}

// C-SSRS style suicide risk safety check question
export const SAFETY_CHECK_QUESTION = {
  id: "safety_risk",
  text: "Dalam 1 bulan terakhir, apakah Anda pernah merasa begitu tertekan hingga berpikiran untuk mengakhiri hidup atau menyakiti diri sendiri?",
  options: [
    { value: 0, label: "Tidak pernah", description: "Saya merasa aman dan tidak pernah memiliki pikiran tersebut." },
    { value: 1, label: "Pernah terlintas sejenak, tanpa niat/rencana", description: "Sempat terlintas saat sangat tertekan, namun tidak ada niat melakukannya." },
    { value: 2, label: "Pernah ada niat atau memikirkan caranya", description: "Ada pikiran serius, niat, atau cara yang sempat terpikirkan." }
  ]
};
