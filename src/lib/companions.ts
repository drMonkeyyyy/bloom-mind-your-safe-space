export type CompanionKey =
  | "ibu" | "ayah" | "kakak_perempuan" | "kakak_laki" | "sahabat" | "partner" | "coach";

export const COMPANIONS: Array<{
  key: CompanionKey;
  name: string;
  emoji: string;
  tone: string;
  description: string;
  premium: boolean;
}> = [
  { key: "sahabat", name: "Sahabat", emoji: "🤝", tone: "ringan, netral, relatable", description: "Sahabat netral yang santai dan relatable.", premium: false },
  { key: "ibu", name: "Ibu", emoji: "👩", tone: "hangat, menenangkan", description: "Sosok ibu yang penuh kasih.", premium: true },
  { key: "ayah", name: "Ayah", emoji: "👨", tone: "bijaksana, rasional", description: "Sosok ayah yang bijak.", premium: true },
  { key: "kakak_perempuan", name: "Kakak Perempuan", emoji: "👩‍🦰", tone: "supportive, pendengar", description: "Kakak yang selalu mendengar.", premium: true },
  { key: "kakak_laki", name: "Kakak Laki-Laki", emoji: "👨‍🦱", tone: "santai, solutif", description: "Kakak yang santai dan solutif.", premium: true },
  { key: "partner", name: "Partner", emoji: "❤️", tone: "hangat dan peduli", description: "Pendamping hangat (bukan pacar virtual).", premium: true },
  { key: "coach", name: "Coach", emoji: "🎯", tone: "tegas, fokus target", description: "Coach untuk accountability.", premium: true },
];

export const COMM_STYLES = [
  { key: "lembut", label: "Lembut" },
  { key: "rasional", label: "Rasional" },
  { key: "tegas", label: "Tegas" },
  { key: "santai", label: "Santai" },
  { key: "supportive", label: "Supportive" },
] as const;

export const GOAL_OPTIONS = [
  "Mengelola stres",
  "Mengurangi overthinking",
  "Emotional eating",
  "Membangun habit sehat",
  "Journaling",
  "Merasa kesepian",
  "Self-growth",
];

export const MOOD_OPTIONS = [
  { key: "bahagia", label: "Bahagia", emoji: "😊" },
  { key: "tenang", label: "Tenang", emoji: "🌿" },
  { key: "sedih", label: "Sedih", emoji: "😢" },
  { key: "cemas", label: "Cemas", emoji: "😰" },
  { key: "marah", label: "Marah", emoji: "😤" },
  { key: "kesepian", label: "Kesepian", emoji: "🥺" },
  { key: "burnout", label: "Burnout", emoji: "🥵" },
  { key: "stres", label: "Stres", emoji: "😩" },
  { key: "lelah", label: "Lelah", emoji: "😴" },
] as const;

export const TRIGGER_OPTIONS = [
  "Pekerjaan", "Hubungan", "Keluarga", "Keuangan", "Makanan", "Kesehatan", "Masa depan", "Lainnya",
];
