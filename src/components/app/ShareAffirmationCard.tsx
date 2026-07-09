import { useState, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import { toast } from "sonner";
import * as htmlToImage from "html-to-image";

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

/* ── JN-CALM Logo mark ───────────────────────────────────────── */
function BloomLogo({ color, size = 18 }: { color: string; size?: number }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" width={size} height={size} aria-hidden="true">
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

/* ── Custom SVG Mini QR Code ────────────────────────────────────── */
function MiniQRCode({ color, size = 28 }: { color: string; size?: number }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      style={{
        background: "rgba(255, 255, 255, 0.45)",
        padding: size * 0.1,
        borderRadius: size * 0.2,
        border: `1px solid ${color}20`,
      }}
      aria-hidden="true"
    >
      {/* Finder patterns */}
      <path
        d="M 1,1 H 7 V 7 H 1 Z M 2,2 H 6 V 6 H 2 Z M 3,3 H 5 V 5 H 3 Z"
        fill={color}
      />
      <path
        d="M 17,1 H 23 V 7 H 17 Z M 18,2 H 22 V 6 H 18 Z M 19,3 H 21 V 5 H 19 Z"
        fill={color}
      />
      <path
        d="M 1,17 H 7 V 23 H 1 Z M 2,18 H 6 V 22 H 2 Z M 3,19 H 5 V 21 H 3 Z"
        fill={color}
      />
      {/* Dynamic/Random QR layout blocks */}
      <rect x="9" y="1" width="2" height="2" fill={color} />
      <rect x="13" y="1" width="2" height="2" fill={color} />
      <rect x="9" y="5" width="2" height="2" fill={color} />
      <rect x="11" y="9" width="2" height="2" fill={color} />
      <rect x="1" y="11" width="2" height="2" fill={color} />
      <rect x="5" y="13" width="2" height="2" fill={color} />
      <path
        d="M 9,13 H 11 V 15 H 9 Z M 11,15 H 13 V 17 H 11 Z M 13,11 H 15 V 13 H 13 Z M 15,13 H 17 V 15 H 15 Z M 17,9 H 19 V 11 H 17 Z"
        fill={color}
      />
      <path
        d="M 9,19 H 11 V 21 H 9 Z M 13,19 H 15 V 21 H 13 Z M 11,21 H 13 V 23 H 11 Z M 15,21 H 17 V 23 H 15 Z"
        fill={color}
      />
      <path
        d="M 19,13 H 21 V 15 H 19 Z M 21,15 H 23 V 17 H 21 Z M 17,17 H 19 V 19 H 17 Z M 21,19 H 23 V 21 H 21 Z M 19,21 H 21 V 23 H 19 Z"
        fill={color}
      />
    </svg>
  );
}

/* ── The actual shareable card visual ──────────────────────────── */
interface AffirmationCardPreviewProps {
  text: string;
  theme: typeof CARD_THEMES[0];
  style?: React.CSSProperties;
  isHighRes?: boolean;
}

function AffirmationCardPreview({
  text,
  theme,
  style = {},
  isHighRes = false,
}: AffirmationCardPreviewProps) {
  const leafScale = isHighRes ? 2.5 : 1;
  const quoteSize = isHighRes ? 180 : 72;
  const textSize = isHighRes ? 46 : 16;
  const dividerWidth = isHighRes ? 100 : 32;
  const dividerEmoji = isHighRes ? 24 : 12;
  const logoSize = isHighRes ? 36 : 18;
  const badgeTextSize = isHighRes ? 22 : 10;
  const qrSize = isHighRes ? 52 : 24;
  const brandTextSize = isHighRes ? 26 : 12;
  const badgePadding = isHighRes ? "12px 32px" : "5px 14px";
  const badgeGap = isHighRes ? 12 : 6;
  const badgeTop = isHighRes ? "120px" : "6%";
  const brandBottom = isHighRes ? "120px" : "5%";
  const brandGap = isHighRes ? 16 : 8;

  return (
    <div
      style={{
        width: "100%",
        aspectRatio: "9 / 16",
        background: theme.bg,
        borderRadius: isHighRes ? 0 : 28,
        position: "relative",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: isHighRes ? "160px 100px" : "10% 8%",
        boxShadow: isHighRes
          ? "none"
          : "0 20px 60px -12px rgba(0,0,0,0.18), 0 4px 12px -4px rgba(0,0,0,0.10)",
        boxSizing: "border-box",
        ...style,
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
          filter: isHighRes ? "blur(120px)" : "blur(48px)",
          top: "-10%",
          right: "-10%",
          animation: isHighRes ? "none" : "blob-drift 16s ease-in-out infinite",
        }}
      />
      <div
        style={{
          position: "absolute",
          width: "45%",
          aspectRatio: "1",
          borderRadius: "50%",
          background: theme.blobB,
          filter: isHighRes ? "blur(100px)" : "blur(40px)",
          bottom: "5%",
          left: "-8%",
          animation: isHighRes ? "none" : "blob-drift-alt 20s ease-in-out infinite",
        }}
      />
      <div
        style={{
          position: "absolute",
          width: "30%",
          aspectRatio: "1",
          borderRadius: "50%",
          background: theme.blobA,
          filter: isHighRes ? "blur(80px)" : "blur(32px)",
          top: "40%",
          left: "5%",
          opacity: 0.5,
          animation: isHighRes ? "none" : "blob-drift-slow 24s ease-in-out infinite",
        }}
      />

      {/* Leaf decorations */}
      <CardLeaf x={isHighRes ? "4%" : "2%"} y={isHighRes ? "10%" : "12%"} size={52 * leafScale} rotate={-25} opacity={0.45} accent={theme.accentColor} />
      <CardLeaf x={isHighRes ? "80%" : "75%"} y={isHighRes ? "8%" : "6%"} size={38 * leafScale} rotate={40} opacity={0.35} accent={theme.accentColor} />
      <CardLeaf x={isHighRes ? "82%" : "80%"} y={isHighRes ? "74%" : "70%"} size={46 * leafScale} rotate={-15} opacity={0.40} accent={theme.accentColor} />
      <CardLeaf x={isHighRes ? "2%" : "0%"} y={isHighRes ? "76%" : "72%"} size={34 * leafScale} rotate={30} opacity={0.30} accent={theme.accentColor} />

      {/* Top badge */}
      <div
        style={{
          position: "absolute",
          top: badgeTop,
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          alignItems: "center",
          gap: badgeGap,
          background: theme.tagBg,
          border: `1px solid ${theme.accentColor}30`,
          borderRadius: 999,
          padding: badgePadding,
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          whiteSpace: "nowrap",
        }}
      >
        <BloomLogo color={theme.accentColor} size={logoSize} />
        <span
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: badgeTextSize,
            fontWeight: 700,
            color: theme.tagText,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
          }}
        >
          JN-CALM
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
          gap: isHighRes ? 45 : 20,
          padding: "0 4%",
        }}
      >
        {/* Decorative quote mark */}
        <span
          style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: quoteSize,
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
            fontSize: textSize,
            fontWeight: 600,
            color: theme.textColor,
            lineHeight: 1.65,
            textAlign: "center",
            letterSpacing: "-0.01em",
            margin: 0,
          }}
        >
          {text}
        </p>

        {/* Divider ornament */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: isHighRes ? 24 : 10,
            marginTop: 4,
          }}
        >
          <div
            style={{
              width: dividerWidth,
              height: isHighRes ? 2 : 1,
              background: `linear-gradient(90deg, transparent, ${theme.accentColor}80)`,
            }}
          />
          <span style={{ fontSize: dividerEmoji, opacity: 0.6 }}>🌸</span>
          <div
            style={{
              width: dividerWidth,
              height: isHighRes ? 2 : 1,
              background: `linear-gradient(270deg, transparent, ${theme.accentColor}80)`,
            }}
          />
        </div>
      </div>

      {/* Bottom branding: jncalm + mini QR code */}
      <div
        style={{
          position: "absolute",
          bottom: brandBottom,
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          alignItems: "center",
          gap: brandGap,
          whiteSpace: "nowrap",
        }}
      >
        <MiniQRCode color={theme.textColor} size={qrSize} />
        <span
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: brandTextSize,
            fontWeight: 800,
            color: theme.textColor,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            opacity: 0.85,
          }}
        >
          jncalm
        </span>
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
  const [downloading, setDownloading] = useState(false);
  const exportRef = useRef<HTMLDivElement>(null);
  const theme = CARD_THEMES[selectedTheme];

  // Helper function to capture the high-res card offscreen and return standard data
  const capturePng = async (): Promise<string> => {
    if (!exportRef.current) throw new Error("Export container not ready");
    // Wait tiny bit for rendering styles/fonts to paint correctly
    await new Promise((resolve) => setTimeout(resolve, 300));
    return await htmlToImage.toPng(exportRef.current, {
      quality: 0.95,
      cacheBust: true,
    });
  };

  const handleDownload = useCallback(async () => {
    setDownloading(true);
    try {
      const dataUrl = await capturePng();
      const link = document.createElement("a");
      link.download = `jn-calm-affirmation-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
      toast.success("Gambar kartu afirmasi berhasil diunduh! 📸");
    } catch (err) {
      console.error(err);
      toast.error("Gagal mengunduh gambar.");
    } finally {
      setDownloading(false);
    }
  }, [selectedTheme]);

  const handleShareImage = useCallback(async () => {
    setSharing(true);
    try {
      const dataUrl = await capturePng();
      
      // Convert to file for Web Share API
      const res = await fetch(dataUrl);
      const blob = await res.blob();
      const file = new File([blob], "jn-calm-affirmation.png", { type: "image/png" });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: "JN-CALM · Afirmasi Harian",
          text: `🌸 Refleksi hari ini dari JN-CALM`,
        });
        toast.success("Berhasil dibagikan! 🌸");
      } else {
        // Fallback: download image and copy text
        const link = document.createElement("a");
        link.download = "jn-calm-affirmation.png";
        link.href = dataUrl;
        link.click();

        const shareText = `"${affirmation}"\n\n🌸 JN-CALM — Ruang Curhat & Refleksi Diri yang Aman\njn-calm.app`;
        await navigator.clipboard.writeText(shareText);
        toast.success("Membagikan gambar tidak didukung browser ini. Gambar diunduh & teks disalin ke clipboard! 📋");
      }
    } catch (err) {
      if ((err as Error)?.name !== "AbortError") {
        console.error(err);
        toast.error("Gagal membagikan gambar.");
      }
    } finally {
      setSharing(false);
    }
  }, [affirmation, selectedTheme]);

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

      {/* Off-screen Export Container (For high resolution generation 1080x1920) */}
      <div
        style={{
          position: "absolute",
          left: "-9999px",
          top: "-9999px",
          pointerEvents: "none",
        }}
      >
        <div
          ref={exportRef}
          style={{
            width: "1080px",
            height: "1920px",
            position: "relative",
          }}
        >
          <AffirmationCardPreview
            text={affirmation}
            theme={theme}
            isHighRes={true}
          />
        </div>
      </div>

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
              Isi jurnal & percakapan AI kamu tetap aman. Hanya kartu afirmasi estetik ini yang dibagikan.
            </p>
          </div>

          {/* Action buttons (Download & Share Image) */}
          <div className="mt-4 flex gap-2.5 pb-5 sm:pb-3">
            <button
              onClick={handleDownload}
              id="share-affirmation-download-btn"
              disabled={downloading}
              className="flex-1 flex items-center justify-center gap-1.5 rounded-full border border-border/80 bg-background py-2.5 text-xs font-bold text-foreground/80 hover:bg-cream-deep transition-all duration-200 active:scale-95 disabled:opacity-60"
            >
              {downloading ? (
                <>
                  <svg className="h-3.5 w-3.5 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                  </svg>
                  Mengunduh...
                </>
              ) : (
                <>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5" aria-hidden="true">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
                  </svg>
                  Unduh Gambar
                </>
              )}
            </button>

            <button
              onClick={handleShareImage}
              id="share-affirmation-share-btn"
              disabled={sharing}
              className="flex-[1.2] flex items-center justify-center gap-2 rounded-full py-2.5 text-xs font-bold text-primary-foreground shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:shadow-float active:scale-95 disabled:opacity-60"
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
                  Bagikan Gambar
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
