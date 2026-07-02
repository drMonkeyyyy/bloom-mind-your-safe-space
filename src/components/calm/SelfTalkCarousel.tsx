import { useState } from "react";

const PHRASES = [
  "Aku boleh merasa seperti ini. Perasaan ini tidak akan selamanya.",
  "Aku aman saat ini. Aku punya waktu untuk pelan-pelan.",
  "Aku tidak harus sempurna untuk berharga.",
  "Satu langkah kecil sudah cukup untuk hari ini.",
  "Aku layak mendapat ketenangan dan kebaikan.",
  "Ini momen yang sulit, bukan karakter ku.",
];

export function SelfTalkCarousel() {
  const [idx, setIdx] = useState(0);
  return (
    <section className="rounded-3xl bg-card p-6 ring-1 ring-border/60 shadow-card space-y-4">
      <p className="text-sm font-semibold">Kalimat untuk dirimu sendiri</p>
      <div
        className="rounded-2xl p-6 text-center animate-scale-in"
        key={idx}
        style={{ background: "linear-gradient(135deg, oklch(0.95 0.025 230) 0%, oklch(0.96 0.02 270) 100%)" }}
      >
        <p className="text-2xl mb-4">🤍</p>
        <p className="font-display text-lg font-semibold italic leading-relaxed text-foreground">
          "{PHRASES[idx]}"
        </p>
      </div>
      <div className="flex items-center justify-between">
        <button
          onClick={() => setIdx(i => (i - 1 + PHRASES.length) % PHRASES.length)}
          disabled={idx === 0}
          className="rounded-full border border-border px-4 py-2 text-sm transition-all duration-200 hover:bg-cream-deep disabled:opacity-30"
        >
          ← Sebelumnya
        </button>
        <div className="flex gap-1">
          {PHRASES.map((_, i) => (
            <div
              key={i}
              className="h-1.5 rounded-full transition-all duration-300"
              style={{
                width: i === idx ? 16 : 6,
                background: i === idx ? "var(--color-primary)" : "var(--color-border)",
              }}
            />
          ))}
        </div>
        <button
          onClick={() => setIdx(i => (i + 1) % PHRASES.length)}
          disabled={idx === PHRASES.length - 1}
          className="rounded-full border border-border px-4 py-2 text-sm transition-all duration-200 hover:bg-cream-deep disabled:opacity-30"
        >
          Selanjutnya →
        </button>
      </div>
    </section>
  );
}
