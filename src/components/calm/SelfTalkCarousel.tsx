import { useState } from "react";

const CATEGORIES = [
  {
    id: "anchor",
    label: "Jangkar Diri",
    emoji: "⚓",
    color: "oklch(0.65 0.06 230)",
    bg: "bg-sky-50",
    ring: "ring-sky-200",
    badge: "bg-sky-100 text-sky-700",
    phrases: [
      "Aku boleh merasa seperti ini. Perasaan ini tidak akan selamanya.",
      "Aku aman saat ini. Aku punya waktu untuk pelan-pelan.",
      "Satu langkah kecil sudah cukup untuk hari ini.",
      "Ini momen yang sulit, bukan karakter ku.",
      "Aku telah melewati hari-hari yang lebih sulit dari ini.",
    ],
  },
  {
    id: "worth",
    label: "Harga Diri",
    emoji: "💎",
    color: "oklch(0.65 0.12 280)",
    bg: "bg-violet-50",
    ring: "ring-violet-200",
    badge: "bg-violet-100 text-violet-700",
    phrases: [
      "Aku tidak harus sempurna untuk berharga.",
      "Aku layak mendapat ketenangan dan kebaikan.",
      "Nilai diriku tidak ditentukan oleh produktivitasku hari ini.",
      "Aku cukup. Aku selalu cukup.",
      "Keberadaanku sendiri sudah memiliki nilai.",
    ],
  },
  {
    id: "compassion",
    label: "Belas Kasih Diri",
    emoji: "🌸",
    color: "oklch(0.65 0.12 0)",
    bg: "bg-rose-50",
    ring: "ring-rose-200",
    badge: "bg-rose-100 text-rose-700",
    phrases: [
      "Aku akan memperlakukan diriku seperti aku memperlakukan sahabat terbaikku.",
      "Berbuat salah tidak membuatku buruk — itu membuatku manusia.",
      "Aku layak menerima cinta dan kebaikan, termasuk dari diriku sendiri.",
      "Kelemahan bukan kegagalan. Itu bagian dari perjalanan manusia.",
      "Aku memilih untuk bersikap lembut pada diri sendiri hari ini.",
    ],
  },
  {
    id: "resilience",
    label: "Ketangguhan",
    emoji: "🌊",
    color: "oklch(0.65 0.10 150)",
    bg: "bg-emerald-50",
    ring: "ring-emerald-200",
    badge: "bg-emerald-100 text-emerald-700",
    phrases: [
      "Kesulitan ini melatih kekuatanku, bukan menghancurkannya.",
      "Aku tidak harus menyelesaikan segalanya sekarang. Satu hal dalam satu waktu.",
      "Perubahan membutuhkan waktu. Aku beri diriku izin untuk bertumbuh perlahan.",
      "Aku telah pulih sebelumnya, dan aku bisa pulih lagi.",
      "Seperti pohon di badai — aku bisa membengkok tanpa patah.",
    ],
  },
];

const TIPS = [
  "Baca kalimat ini pelan-pelan, seperti kamu berbicara kepada sahabat terkasih.",
  "Ulangi kalimat yang terasa paling relevan beberapa kali.",
  "Letakkan tangan di dada saat membaca — rasakan kehangatan perhatianmu pada diri sendiri.",
  "Jika kalimat terasa tidak nyata, tambahkan: 'Hari ini aku berlatih percaya bahwa...'",
];

type Phase = "intro" | "exercise" | "done";

export function SelfTalkCarousel() {
  const [phase, setPhase] = useState<Phase>("intro");
  const [categoryIdx, setCategoryIdx] = useState(0);
  const [phraseIdx, setPhraseIdx] = useState(0);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [breatheActive, setBreatheActive] = useState(false);

  const category = CATEGORIES[categoryIdx];
  const phrase = category.phrases[phraseIdx];
  const isLast = categoryIdx === CATEGORIES.length - 1 && phraseIdx === category.phrases.length - 1;

  const toggleFavorite = (p: string) => {
    setFavorites(prev => prev.includes(p) ? prev.filter(f => f !== p) : [...prev, p]);
  };

  const handleNext = () => {
    if (phraseIdx < category.phrases.length - 1) {
      setPhraseIdx(i => i + 1);
    } else if (categoryIdx < CATEGORIES.length - 1) {
      setCategoryIdx(i => i + 1);
      setPhraseIdx(0);
    } else {
      setPhase("done");
    }
  };

  const handlePrev = () => {
    if (phraseIdx > 0) {
      setPhraseIdx(i => i - 1);
    } else if (categoryIdx > 0) {
      setCategoryIdx(i => i - 1);
      setPhraseIdx(CATEGORIES[categoryIdx - 1].phrases.length - 1);
    }
  };

  const totalPhrases = CATEGORIES.reduce((s, c) => s + c.phrases.length, 0);
  const completedBefore = CATEGORIES.slice(0, categoryIdx).reduce((s, c) => s + c.phrases.length, 0);
  const currentProgress = completedBefore + phraseIdx + 1;

  /* ── INTRO ─────────────────────────────────────── */
  if (phase === "intro") {
    return (
      <section className="rounded-3xl bg-card p-6 ring-1 ring-border/60 shadow-card space-y-5 animate-scale-in">
        <div className="flex items-center gap-3">
          <div
            className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl text-2xl"
            style={{ background: "oklch(0.95 0.03 310)" }}
          >
            🤍
          </div>
          <div>
            <h2 className="font-display text-xl font-semibold text-foreground">Self-Calming Talk</h2>
            <p className="text-xs text-muted-foreground">Kalimat menenangkan untuk berbicara pada dirimu sendiri</p>
          </div>
        </div>

        {/* Education block */}
        <div className="rounded-2xl bg-rose-50 ring-1 ring-rose-200 p-4 space-y-3">
          <p className="text-sm font-semibold text-rose-800">Apa itu Self-Compassionate Talk?</p>
          <p className="text-sm text-rose-700 leading-relaxed">
            Cara kita berbicara pada diri sendiri memiliki dampak <strong>langsung</strong> pada sistem saraf.
            Penelitian psikologi klinis menunjukkan bahwa <em>self-compassionate self-talk</em> (berbicara pada diri sendiri
            dengan belas kasih) secara terbukti menurunkan kecemasan, ruminasi, dan depresi.
          </p>
          <p className="text-sm text-rose-700 leading-relaxed">
            Berbeda dengan afirmasi positif palsu, kalimat ini <strong>mengakui perasaanmu</strong> sekaligus
            menawarkan dukungan — seperti seorang sahabat yang bijak.
          </p>
        </div>

        {/* Categories preview */}
        <div className="grid grid-cols-2 gap-2">
          {CATEGORIES.map((c) => (
            <div key={c.id} className={`flex items-center gap-2 rounded-xl p-3 ring-1 ${c.bg} ${c.ring}`}>
              <span className="text-lg">{c.emoji}</span>
              <div>
                <p className={`text-xs font-bold ${c.badge.split(" ")[1]}`}>{c.label}</p>
                <p className="text-[10px] text-muted-foreground">{c.phrases.length} kalimat</p>
              </div>
            </div>
          ))}
        </div>

        {/* Tips */}
        <div className="rounded-2xl bg-amber-50 ring-1 ring-amber-200 p-4">
          <p className="text-sm font-semibold text-amber-800 mb-2">💡 Tips Penggunaan</p>
          <ul className="space-y-1.5">
            {TIPS.map((tip, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-amber-700">
                <span className="shrink-0 mt-0.5 font-bold">{i + 1}.</span>
                {tip}
              </li>
            ))}
          </ul>
        </div>

        <button
          onClick={() => setPhase("exercise")}
          className="w-full rounded-full bg-primary py-4 text-sm font-semibold text-primary-foreground shadow-soft transition-all duration-300 hover:-translate-y-0.5 hover:shadow-float active:scale-95"
        >
          Mulai Self-Talk 🤍
        </button>
      </section>
    );
  }

  /* ── DONE ──────────────────────────────────────── */
  if (phase === "done") {
    return (
      <section className="rounded-3xl bg-card p-6 ring-1 ring-border/60 shadow-card space-y-5 animate-scale-in">
        <div className="flex flex-col items-center text-center space-y-3 py-2">
          <div className="relative">
            <span className="text-5xl" style={{ animation: "bounce-in 0.6s cubic-bezier(0.34,1.56,0.64,1) both" }}>🌸</span>
            <span className="absolute -right-2 -top-2 text-2xl" style={{ animation: "bounce-in 0.7s 0.1s cubic-bezier(0.34,1.56,0.64,1) both" }}>✨</span>
            <span className="absolute -left-3 -bottom-1 text-xl" style={{ animation: "bounce-in 0.8s 0.2s cubic-bezier(0.34,1.56,0.64,1) both" }}>🤍</span>
          </div>
          <h2 className="font-display text-2xl font-semibold text-foreground mt-3">Kamu sudah merawat dirimu! 💕</h2>
          <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
            Setiap kalimat yang kamu baca dengan sungguh-sungguh memperkuat koneksi antara pikiranmu dan belas kasih pada dirimu sendiri.
          </p>
        </div>

        {/* Favorite phrases */}
        {favorites.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/60">
              ❤️ Kalimat Favoritmu ({favorites.length})
            </p>
            <div className="space-y-2">
              {favorites.map((fav, i) => (
                <div key={i} className="rounded-2xl bg-rose-50 ring-1 ring-rose-200 p-3.5">
                  <p className="text-sm italic text-foreground leading-relaxed">"{fav}"</p>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground/60 text-center">
              Simpan screenshot kalimat ini untuk dibaca kapanpun kamu membutuhkannya 📸
            </p>
          </div>
        )}

        {/* Science note */}
        <div className="flex items-start gap-3 rounded-2xl bg-violet-50 ring-1 ring-violet-200 p-4">
          <span className="text-xl">🧠</span>
          <p className="text-xs text-violet-800 leading-relaxed">
            <strong>Tahukah kamu?</strong> Saat otak mendengar kata-kata penuh kasih (bahkan dari diri sendiri),
            ia melepaskan <strong>oksitosin</strong> — hormon koneksi dan keamanan — yang secara langsung menenangkan amigdala.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2">
          <button
            onClick={() => { setCategoryIdx(0); setPhraseIdx(0); setPhase("exercise"); }}
            className="w-full rounded-full bg-primary py-3.5 text-sm font-semibold text-primary-foreground shadow-soft transition-all duration-300 hover:-translate-y-0.5 active:scale-95"
          >
            Baca Ulang 🔄
          </button>
          <button
            onClick={() => setPhase("intro")}
            className="w-full rounded-full border border-border py-3 text-sm font-medium text-foreground transition-colors hover:bg-cream-deep"
          >
            Baca panduan lagi
          </button>
        </div>
      </section>
    );
  }

  /* ── EXERCISE ───────────────────────────────────── */
  return (
    <section className="rounded-3xl bg-card ring-1 ring-border/60 shadow-card overflow-hidden">
      {/* Progress bar */}
      <div className="h-1 bg-border/30">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{
            width: `${(currentProgress / totalPhrases) * 100}%`,
            background: `linear-gradient(90deg, var(--color-primary), ${category.color})`,
          }}
        />
      </div>

      {/* Header */}
      <div className="px-6 pt-5 pb-4 border-b border-border/40 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-lg">{category.emoji}</span>
            <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${category.badge}`}>
              {category.label}
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground mt-1">{currentProgress}/{totalPhrases} kalimat</p>
        </div>
        <button
          onClick={() => setPhase("intro")}
          className="text-xs text-muted-foreground/60 hover:text-muted-foreground transition-colors px-3 py-1.5 rounded-full hover:bg-cream-deep"
        >
          ← Kembali
        </button>
      </div>

      {/* Phrase card */}
      <div className="p-6">
        <div
          className={`rounded-2xl p-7 ring-1 ${category.bg} ${category.ring} animate-scale-in text-center space-y-5`}
          key={`${categoryIdx}-${phraseIdx}`}
        >
          {/* Breathe button visual */}
          <div className="flex justify-center">
            <div className="relative">
              {breatheActive && (
                <div
                  className="absolute inset-0 rounded-full animate-breath-ring"
                  style={{ background: category.color }}
                />
              )}
              <button
                onClick={() => setBreatheActive(a => !a)}
                className="relative w-16 h-16 rounded-full flex items-center justify-center transition-all duration-500"
                style={{
                  background: breatheActive ? category.color : "white",
                  boxShadow: breatheActive
                    ? `0 0 0 8px ${category.color}22, 0 4px 20px ${category.color}44`
                    : "0 2px 8px rgba(0,0,0,0.08)",
                  transform: breatheActive ? "scale(1.1)" : "scale(1)",
                }}
                title="Klik untuk napas dalam saat membaca"
              >
                <span className="text-2xl">{breatheActive ? "🌬️" : "🤍"}</span>
              </button>
            </div>
          </div>

          {/* Main phrase */}
          <blockquote>
            <p className="font-display text-xl font-semibold italic leading-relaxed text-foreground">
              "{phrase}"
            </p>
          </blockquote>

          {/* Repeat instruction */}
          <p className="text-xs text-muted-foreground/70">
            Baca pelan-pelan — ulangi 2–3 kali jika terasa nyaman 🌿
          </p>
        </div>

        {/* Category dots */}
        <div className="flex justify-center gap-1.5 mt-5">
          {CATEGORIES.map((c, ci) => (
            <button
              key={c.id}
              onClick={() => { setCategoryIdx(ci); setPhraseIdx(0); }}
              className="flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-medium transition-all duration-200"
              style={{
                background: ci === categoryIdx ? category.color + "22" : "transparent",
                color: ci === categoryIdx ? category.color : "var(--color-muted-foreground)",
                opacity: ci === categoryIdx ? 1 : 0.5,
              }}
            >
              {c.emoji}
            </button>
          ))}
        </div>

        {/* Phrase dots */}
        <div className="flex justify-center gap-1 mt-3">
          {category.phrases.map((_, i) => (
            <button
              key={i}
              onClick={() => setPhraseIdx(i)}
              className="rounded-full transition-all duration-300"
              style={{
                width: i === phraseIdx ? 16 : 6,
                height: 6,
                background: i === phraseIdx ? category.color : "var(--color-border)",
              }}
            />
          ))}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-5">
          <button
            onClick={handlePrev}
            disabled={categoryIdx === 0 && phraseIdx === 0}
            className="rounded-full border border-border px-5 py-2.5 text-sm font-medium transition-all duration-200 hover:bg-cream-deep disabled:opacity-30"
          >
            ← Sebelumnya
          </button>

          <button
            onClick={() => toggleFavorite(phrase)}
            className="p-2.5 rounded-full transition-all duration-200 hover:scale-110"
            style={{
              color: favorites.includes(phrase) ? "#ef4444" : "var(--color-muted-foreground)",
            }}
            title={favorites.includes(phrase) ? "Hapus dari favorit" : "Simpan ke favorit"}
          >
            {favorites.includes(phrase) ? "❤️" : "🤍"}
          </button>

          <button
            onClick={isLast ? () => setPhase("done") : handleNext}
            className="rounded-full px-6 py-2.5 text-sm font-semibold text-white transition-all duration-250 hover:-translate-y-0.5 active:scale-95"
            style={{ background: isLast ? "oklch(0.60 0.14 0)" : category.color }}
          >
            {isLast ? "Selesai 🌸" : "Selanjutnya →"}
          </button>
        </div>
      </div>
    </section>
  );
}
