import { useState, useCallback } from "react";
import { createPortal } from "react-dom";
import { toast } from "sonner";

/* ── Theme palettes for the share card ─────────────────────────── */
const CARD_THEMES = [
  {
    id: "sage",
    label: "Sage",
    bg: "linear-gradient(145deg, oklch(0.93 0.035 165) 0%, oklch(0.96 0.025 150) 40%, oklch(0.94 0.03 170) 100%)",
    textColor: "oklch(0.22 0.04 160)",
    accentColor: "oklch(0.71 0.045 160)",
    blobA: "oklch(0.71 0.045 160 / 0.15)",
    blobB: "oklch(0.77 0.085 40 / 0.10)",
    tagBg: "oklch(0.71 0.045 160 / 0.15)",
    tagText: "oklch(0.35 0.04 160)",
  },
  {
    id: "peach",
    label: "Peach",
    bg: "linear-gradient(145deg, oklch(0.97 0.03 50) 0%, oklch(0.95 0.05 40) 45%, oklch(0.97 0.03 30) 100%)",
    textColor: "oklch(0.28 0.06 35)",
    accentColor: "oklch(0.77 0.085 40)",
    blobA: "oklch(0.77 0.085 40 / 0.18)",
    blobB: "oklch(0.71 0.045 160 / 0.10)",
    tagBg: "oklch(0.77 0.085 40 / 0.18)",
    tagText: "oklch(0.35 0.07 35)",
  },
  {
    id: "lavender",
    label: "Lavender",
    bg: "linear-gradient(145deg, oklch(0.96 0.025 290) 0%, oklch(0.94 0.035 280) 45%, oklch(0.97 0.02 300) 100%)",
    textColor: "oklch(0.25 0.05 280)",
    accentColor: "oklch(0.65 0.075 285)",
    blobA: "oklch(0.65 0.075 285 / 0.18)",
    blobB: "oklch(0.77 0.085 40 / 0.09)",
    tagBg: "oklch(0.65 0.075 285 / 0.15)",
    tagText: "oklch(0.30 0.06 285)",
  },
  {
    id: "aurora",
    label: "Aurora",
    bg: "linear-gradient(145deg, oklch(0.96 0.02 195) 0%, oklch(0.94 0.03 175) 45%, oklch(0.96 0.025 220) 100%)",
    textColor: "oklch(0.22 0.045 195)",
    accentColor: "oklch(0.60 0.07 200)",
    blobA: "oklch(0.60 0.07 200 / 0.18)",
    blobB: "oklch(0.71 0.045 160 / 0.12)",
    tagBg: "oklch(0.60 0.07 200 / 0.15)",
    tagText: "oklch(0.28 0.05 200)",
  },
];

/* ── Leaf SVG decoration ────────────────────────────────────────── */
function CardLeaf({
  x, y, size, rotate, opacity, accent,
}: { x: string; y: string; size: number; rotate: number; opacity: number; accent: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: size,
        height: size,
        transform: `rotate(${rotate}deg)`,
        opacity,
        pointerEvents: "none",
      }}
      aria-hidden="true"
    >
      <path
        d="M24 4C14 4 6 14 8 26c2 12 14 18 22 16C22 34 18 22 24 4z"
        fill={accent}
      />
      <path
        d="M24 4C34 4 42 14 40 26"
        fill="none"
        stroke={accent}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M24 4 C18 14 16 24 20 36"
        fill="none"
        stroke="white"
        strokeWidth="0.8"
        strokeLinecap="round"
        opacity="0.5"
      />
    </svg>
  );
}

/* ── Bloom Mind Logo mark ───────────────────────────────────────── */
function BloomLogo({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" width="18" height="18" aria-hidden="true">
      <circle cx="16" cy="16" r="4" fill={color} />
      <circle cx="16" cy="8" r="4" fill={color} opacity="0.8" />
      <circle cx="22" cy="11.5" r="4" fill={color} opacity="0.7" />
      <circle cx="22" cy="20.5" r="4" fill={color} opacity="0.7" />
      <circle cx="16" cy="24" r="4" fill={color} opacity="0.8" />
      <circle cx="10" cy="20.5" r="4" fill={color} opacity="0.7" />
      <circle cx="10" cy="11.5" r="4" fill={color} opacity="0.7" />
    </svg>
  );
}

/* ── The actual shareable card visual ──────────────────────────── */
function AffirmationCardPreview({
  text,
  theme,
}: {
  text: string;
  theme: typeof CARD_THEMES[0];
}) {
  return (
    <div
      style={{
        width: "100%",
        aspectRatio: "9 / 16",
        background: theme.bg,
        borderRadius: 28,
        position: "relative",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "10% 8%",
        boxShadow:
          "0 20px 60px -12px rgba(0,0,0,0.18), 0 4px 12px -4px rgba(0,0,0,0.10)",
      }}
    >
      {/* Ambient blobs */}
      <div
        style={{
          position: "absolute",
          width: "60%",
          aspectRatio: "1",
          borderRadius: "50%",
          background: theme.blobA,
          filter: "blur(48px)",
          top: "-10%",
          right: "-10%",
          animation: "blob-drift 16s ease-in-out infinite",
        }}
      />
      <div
        style={{
          position: "absolute",
          width: "45%",
          aspectRatio: "1",
          borderRadius: "50%",
          background: theme.blobB,
          filter: "blur(40px)",
          bottom: "5%",
          left: "-8%",
          animation: "blob-drift-alt 20s ease-in-out infinite",
        }}
      />
      <div
        style={{
          position: "absolute",
          width: "30%",
          aspectRatio: "1",
          borderRadius: "50%",
          background: theme.blobA,
          filter: "blur(32px)",
          top: "40%",
          left: "5%",
          opacity: 0.5,
          animation: "blob-drift-slow 24s ease-in-out infinite",
        }}
      />

      {/* Leaf decorations */}
      <CardLeaf x="2%" y="12%" size={52} rotate={-25} opacity={0.45} accent={theme.accentColor} />
      <CardLeaf x="75%" y="6%" size={38} rotate={40} opacity={0.35} accent={theme.accentColor} />
      <CardLeaf x="80%" y="70%" size={46} rotate={-15} opacity={0.40} accent={theme.accentColor} />
      <CardLeaf x="0%" y="72%" size={34} rotate={30} opacity={0.30} accent={theme.accentColor} />

      {/* Top badge */}
      <div
        style={{
          position: "absolute",
          top: "6%",
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          alignItems: "center",
          gap: 6,
          background: theme.tagBg,
          border: `1px solid ${theme.accentColor}30`,
          borderRadius: 999,
          padding: "5px 14px",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          whiteSpace: "nowrap",
        }}
      >
        <BloomLogo color={theme.accentColor} />
        <span
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: 10,
            fontWeight: 700,
            color: theme.tagText,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
          }}
        >
          Bloom Mind
        </span>
      </div>

      {/* Main content area */}
      <div
        style={{
          position: "relative",
          zIndex: 1,
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 20,
          padding: "0 4%",
        }}
      >
        {/* Decorative quote mark */}
        <span
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 72,
            lineHeight: 0.6,
            color: theme.accentColor,
            opacity: 0.3,
            userSelect: "none",
          }}
          aria-hidden="true"
        >
          "
        </span>

        {/* Affirmation text */}
        <p
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: "clamp(14px, 4vw, 18px)",
            fontWeight: 600,
            color: theme.textColor,
            lineHeight: 1.65,
            textAlign: "center",
            letterSpacing: "-0.01em",
          }}
        >
          {text}
        </p>

        {/* Divider ornament */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginTop: 4,
          }}
        >
          <div
            style={{
              width: 32,
              height: 1,
              background: `linear-gradient(90deg, transparent, ${theme.accentColor}80)`,
            }}
          />
          <span style={{ fontSize: 12, opacity: 0.6 }}>🌸</span>
          <div
            style={{
              width: 32,
              height: 1,
              background: `linear-gradient(270deg, transparent, ${theme.accentColor}80)`,
            }}
          />
        </div>
      </div>

      {/* Bottom branding */}
      <div
        style={{
          position: "absolute",
          bottom: "5%",
          left: "50%",
          transform: "translateX(-50%)",
          textAlign: "center",
        }}
      >
        <p
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: 9,
            fontWeight: 600,
            color: theme.textColor,
            opacity: 0.45,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            whiteSpace: "nowrap",
          }}
        >
          Your Safe Space · bloom-mind.app
        </p>
      </div>
    </div>
  );
}

/* ── Share Modal ────────────────────────────────────────────────── */
interface ShareModalProps {
  open: boolean;
  onClose: () => void;
  affirmation: string;
}

export function ShareAffirmationModal({ open, onClose, affirmation }: ShareModalProps) {
  const [selectedTheme, setSelectedTheme] = useState(0);
  const [sharing, setSharing] = useState(false);
  const theme = CARD_THEMES[selectedTheme];

  const handleShare = useCallback(async () => {
    setSharing(true);
    const shareText = `${affirmation}\n\n🌸 Bloom Mind — Your Safe Space\nbloommind.app`;

    try {
      if (navigator.share) {
        await navigator.share({
          title: "Bloom Mind · Afirmasi Hari Ini",
          text: shareText,
        });
        toast.success("Berhasil dibagikan! 🌸");
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(shareText);
        toast.success("Teks afirmasi disalin! Tempelkan di media sosialmu. 📋");
      }
    } catch (err) {
      // User cancelled share – not an error
      if ((err as Error)?.name !== "AbortError") {
        // Silent fallback
        try {
          await navigator.clipboard.writeText(shareText);
          toast.success("Teks afirmasi disalin ke clipboard! 📋");
        } catch {
          toast.error("Tidak dapat berbagi saat ini.");
        }
      }
    } finally {
      setSharing(false);
    }
  }, [affirmation]);

  const handleCopyText = useCallback(async () => {
    const shareText = `${affirmation}\n\n🌸 Bloom Mind — Your Safe Space\nbloommind.app`;
    try {
      await navigator.clipboard.writeText(shareText);
      toast.success("Teks afirmasi disalin! 📋");
    } catch {
      toast.error("Gagal menyalin.");
    }
  }, [affirmation]);

  if (!open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Bagikan Afirmasi"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-foreground/30 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
        style={{ animation: "fade-in-up 0.2s ease-out both" }}
      />

      {/* Modal sheet */}
      <div
        className="relative z-10 w-full sm:max-w-sm bg-card rounded-t-[2.5rem] sm:rounded-[2rem] shadow-elevated ring-1 ring-border/60 overflow-hidden"
        style={{ animation: "slide-up 0.38s cubic-bezier(0.16, 1, 0.3, 1) both" }}
      >
        {/* Drag handle (mobile) */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="h-1.5 w-10 rounded-full bg-border" />
        </div>

        <div className="px-5 pt-3 pb-2 sm:px-6 sm:pt-5">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-primary">
                ✨ Bagikan Afirmasi
              </p>
              <h2 className="font-display text-lg font-semibold text-foreground mt-0.5">
                Pilih Tema Kartu
              </h2>
            </div>
            <button
              onClick={onClose}
              className="grid h-8 w-8 place-items-center rounded-full bg-cream-deep text-muted-foreground hover:bg-border transition-colors"
              aria-label="Tutup"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="h-4 w-4" aria-hidden="true">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Card preview */}
          <div
            className="w-full max-w-[200px] mx-auto"
            style={{ animation: "scale-in 0.4s cubic-bezier(0.16, 1, 0.3, 1) both" }}
          >
            <AffirmationCardPreview text={affirmation} theme={theme} />
          </div>

          {/* Theme selector */}
          <div className="flex items-center justify-center gap-2.5 mt-4">
            {CARD_THEMES.map((t, i) => (
              <button
                key={t.id}
                onClick={() => setSelectedTheme(i)}
                id={`share-theme-${t.id}`}
                className="relative h-7 w-7 rounded-full transition-all duration-200 hover:scale-110 active:scale-95"
                style={{ background: t.bg }}
                aria-label={`Tema ${t.label}`}
                title={t.label}
              >
                {selectedTheme === i && (
                  <span className="absolute inset-0 rounded-full ring-2 ring-offset-2 ring-offset-card"
                    style={{ boxShadow: `0 0 0 2px ${t.accentColor}` }} />
                )}
              </button>
            ))}
          </div>

          {/* Privacy note */}
          <div className="mt-4 flex items-start gap-2 rounded-2xl bg-primary-soft/30 border border-primary/10 px-3.5 py-2.5">
            <span className="text-sm mt-0.5">🛡️</span>
            <p className="text-[10px] text-primary/80 font-medium leading-relaxed">
              Hanya afirmasi ini yang dibagikan. Isi jurnal & percakapan AI kamu tetap sepenuhnya pribadi.
            </p>
          </div>

          {/* Action buttons */}
          <div className="mt-4 flex gap-2.5 pb-5 sm:pb-3">
            <button
              onClick={handleCopyText}
              id="share-affirmation-copy-btn"
              className="flex-1 flex items-center justify-center gap-1.5 rounded-full border border-border/80 bg-background py-2.5 text-xs font-bold text-foreground/80 hover:bg-cream-deep transition-all duration-200 active:scale-95"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5" aria-hidden="true">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
              </svg>
              Salin Teks
            </button>

            <button
              onClick={handleShare}
              id="share-affirmation-share-btn"
              disabled={sharing}
              className="flex-[2] flex items-center justify-center gap-2 rounded-full py-2.5 text-xs font-bold text-primary-foreground shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:shadow-float active:scale-95 disabled:opacity-60"
              style={{
                background: "linear-gradient(135deg, oklch(0.71 0.045 160) 0%, oklch(0.65 0.055 170) 100%)",
              }}
            >
              {sharing ? (
                <>
                  <svg className="h-3.5 w-3.5 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                  </svg>
                  Membagikan...
                </>
              ) : (
                <>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5" aria-hidden="true">
                    <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8M16 6l-4-4-4 4M12 2v13" />
                  </svg>
                  Bagikan Sekarang
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
