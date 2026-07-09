import { useState, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import { toast } from "sonner";
import * as htmlToImage from "html-to-image";

/* ── Theme palettes for the share card ─────────────────────────── */
const CARD_THEMES = [
  {
    id: "sage",
    label: "Sage",
    bg: "linear-gradient(145deg, oklch(0.93 0.035 165) 0%, oklch(0.85 0.05 160) 100%)",
    textColor: "oklch(0.22 0.04 160)",
    accentColor: "oklch(0.71 0.045 160)",
    blobA: "oklch(0.71 0.045 160 / 0.18)",
    blobB: "oklch(0.77 0.085 40 / 0.12)",
    tagBg: "oklch(0.71 0.045 160 / 0.15)",
    tagText: "oklch(0.35 0.04 160)",
  },
  {
    id: "peach",
    label: "Peach",
    bg: "linear-gradient(145deg, oklch(0.97 0.03 50) 0%, oklch(0.88 0.07 45) 100%)",
    textColor: "oklch(0.28 0.06 35)",
    accentColor: "oklch(0.77 0.085 40)",
    blobA: "oklch(0.77 0.085 40 / 0.22)",
    blobB: "oklch(0.71 0.045 160 / 0.12)",
    tagBg: "oklch(0.77 0.085 40 / 0.18)",
    tagText: "oklch(0.35 0.07 35)",
  },
  {
    id: "lavender",
    label: "Lavender",
    bg: "linear-gradient(145deg, oklch(0.96 0.025 290) 0%, oklch(0.88 0.05 280) 100%)",
    textColor: "oklch(0.25 0.05 280)",
    accentColor: "oklch(0.65 0.075 285)",
    blobA: "oklch(0.65 0.075 285 / 0.22)",
    blobB: "oklch(0.77 0.085 40 / 0.12)",
    tagBg: "oklch(0.65 0.075 285 / 0.15)",
    tagText: "oklch(0.30 0.06 285)",
  },
  {
    id: "aurora",
    label: "Aurora",
    bg: "linear-gradient(145deg, oklch(0.96 0.02 195) 0%, oklch(0.86 0.05 195) 100%)",
    textColor: "oklch(0.22 0.045 195)",
    accentColor: "oklch(0.60 0.07 200)",
    blobA: "oklch(0.60 0.07 200 / 0.22)",
    blobB: "oklch(0.71 0.045 160 / 0.14)",
    tagBg: "oklch(0.60 0.07 200 / 0.15)",
    tagText: "oklch(0.28 0.05 200)",
  },
];

/* ── Premium botanical branch SVG component ─────────────────────── */
function PremiumLeafBranch({ color, opacity = 0.35 }: { color: string; opacity?: number }) {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      style={{ width: "100%", height: "100%" }}
      aria-hidden="true"
    >
      <path
        d="M50 95 C49 75 42 42 20 18"
        stroke={color}
        strokeWidth="2.2"
        strokeLinecap="round"
        opacity={opacity}
      />
      {/* Elegant Leaf Silhouettes */}
      <path d="M46 72 Q31 66 33 56 Q43 59 46 72" fill={color} opacity={opacity * 1.25} />
      <path d="M47 62 Q63 56 58 46 Q51 50 47 62" fill={color} opacity={opacity} />
      <path d="M40 50 Q25 44 27 34 Q37 37 40 50" fill={color} opacity={opacity * 1.25} />
      <path d="M39 39 Q54 34 50 24 Q43 27 39 39" fill={color} opacity={opacity} />
      <path d="M32 28 Q18 22 21 12 Q29 16 32 28" fill={color} opacity={opacity * 1.25} />
      <path d="M22 17 C27 7 22 4 20 2" fill={color} opacity={opacity * 1.3} />
    </svg>
  );
}

/* ── JN-CALM Logo mark ───────────────────────────────────────── */
function BloomLogo({ color, size = 18 }: { color: string; size?: number }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" width={size} height={size} aria-hidden="true">
      <circle cx="16" cy="16" r="4" fill={color} />
      <circle cx="16" cy="8" r="4" fill={color} opacity="0.85" />
      <circle cx="22" cy="11.5" r="4" fill={color} opacity="0.75" />
      <circle cx="22" cy="20.5" r="4" fill={color} opacity="0.75" />
      <circle cx="16" cy="24" r="4" fill={color} opacity="0.85" />
      <circle cx="10" cy="20.5" r="4" fill={color} opacity="0.75" />
      <circle cx="10" cy="11.5" r="4" fill={color} opacity="0.75" />
    </svg>
  );
}

/* ── Custom detailed SVG QR Code ────────────────────────────────── */
function PremiumQRCode({ color, size = 32 }: { color: string; size?: number }) {
  return (
    <svg
      viewBox="0 0 29 29"
      width={size}
      height={size}
      style={{
        background: "white",
        padding: size * 0.1,
        borderRadius: size * 0.22,
        boxShadow: "0 4px 12px rgba(0,0,0,0.03)",
      }}
      aria-hidden="true"
    >
      {/* Finder Pattern Top-Left */}
      <rect x="0" y="0" width="7" height="7" fill={color} />
      <rect x="1" y="1" width="5" height="5" fill="white" />
      <rect x="2" y="2" width="3" height="3" fill={color} />
      
      {/* Finder Pattern Top-Right */}
      <rect x="22" y="0" width="7" height="7" fill={color} />
      <rect x="23" y="1" width="5" height="5" fill="white" />
      <rect x="24" y="2" width="3" height="3" fill={color} />
      
      {/* Finder Pattern Bottom-Left */}
      <rect x="0" y="22" width="7" height="7" fill={color} />
      <rect x="1" y="23" width="5" height="5" fill="white" />
      <rect x="2" y="24" width="3" height="3" fill={color} />

      {/* Timing Patterns & Alignment */}
      <rect x="8" y="2" width="2" height="1" fill={color} />
      <rect x="11" y="2" width="1" height="1" fill={color} />
      <rect x="13" y="2" width="2" height="1" fill={color} />
      <rect x="16" y="2" width="1" height="1" fill={color} />
      <rect x="18" y="2" width="2" height="1" fill={color} />
      
      <rect x="8" y="4" width="1" height="2" fill={color} />
      <rect x="10" y="4" width="2" height="1" fill={color} />
      <rect x="13" y="4" width="1" height="3" fill={color} />
      <rect x="15" y="5" width="2" height="1" fill={color} />
      <rect x="18" y="4" width="1" height="2" fill={color} />
      <rect x="20" y="5" width="1" height="1" fill={color} />

      {/* Data blocks representation */}
      <rect x="8" y="8" width="2" height="2" fill={color} />
      <rect x="11" y="9" width="1" height="1" fill={color} />
      <rect x="13" y="8" width="3" height="1" fill={color} />
      <rect x="17" y="9" width="2" height="2" fill={color} />
      <rect x="20" y="8" width="1" height="1" fill={color} />

      <rect x="8" y="11" width="1" height="3" fill={color} />
      <rect x="10" y="12" width="2" height="1" fill={color} />
      <rect x="13" y="11" width="1" height="2" fill={color} />
      <rect x="15" y="13" width="3" height="1" fill={color} />
      <rect x="19" y="11" width="2" height="1" fill={color} />
      <rect x="22" y="10" width="1" height="3" fill={color} />
      <rect x="24" y="9" width="2" height="1" fill={color} />
      <rect x="27" y="11" width="1" height="2" fill={color} />

      <rect x="10" y="15" width="1" height="1" fill={color} />
      <rect x="12" y="16" width="3" height="2" fill={color} />
      <rect x="16" y="15" width="1" height="1" fill={color} />
      <rect x="18" y="16" width="2" height="1" fill={color} />
      <rect x="21" y="15" width="2" height="2" fill={color} />
      <rect x="24" y="16" width="1" height="1" fill={color} />
      <rect x="26" y="15" width="2" height="1" fill={color} />

      <rect x="8" y="19" width="2" height="1" fill={color} />
      <rect x="11" y="18" width="1" height="2" fill={color} />
      <rect x="13" y="19" width="3" height="1" fill={color} />
      <rect x="17" y="18" width="2" height="1" fill={color} />
      <rect x="20" y="19" width="1" height="2" fill={color} />
      <rect x="22" y="18" width="2" height="1" fill={color} />
      <rect x="25" y="19" width="1" height="1" fill={color} />
      <rect x="27" y="18" width="2" height="2" fill={color} />

      <rect x="8" y="22" width="1" height="2" fill={color} />
      <rect x="10" y="23" width="2" height="1" fill={color} />
      <rect x="13" y="22" width="1" height="3" fill={color} />
      <rect x="15" y="24" width="2" height="1" fill={color} />
      <rect x="18" y="23" width="1" height="2" fill={color} />
      <rect x="20" y="22" width="2" height="1" fill={color} />
      <rect x="23" y="24" width="3" height="1" fill={color} />
      <rect x="27" y="23" width="1" height="3" fill={color} />

      <rect x="10" y="26" width="2" height="2" fill={color} />
      <rect x="14" y="27" width="3" height="1" fill={color} />
      <rect x="18" y="26" width="2" height="1" fill={color} />
      <rect x="21" y="27" width="4" height="1" fill={color} />
    </svg>
  );
}

/* ── Delicate Sparkle SVG for Celestial theme ─────────────────── */
function CelestialSparkle({ color, size = 18, style = {} }: { color: string; size?: number; style?: React.CSSProperties }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      width={size}
      height={size}
      style={style}
      aria-hidden="true"
    >
      <path d="M12 3a9 9 0 0 0 9 9 9 9 0 0 0-9 9 9 9 0 0 0-9-9 9 9 0 0 0 9-9z" />
    </svg>
  );
}

/* ── Crescent Moon SVG for Celestial theme ────────────────────── */
function CelestialMoon({ color, size = 20 }: { color: string; size?: number }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      width={size}
      height={size}
      aria-hidden="true"
    >
      <path d="M12 3a9 9 0 1 0 9 9 7 7 0 1 1-9-9z" />
    </svg>
  );
}

/* ── Zen Flower SVG for Minimalist theme ──────────────────────── */
function ZenLotus({ color, size = 20 }: { color: string; size?: number }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="1.8"
      width={size}
      height={size}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 2c1.5 4 4.5 6 7 7-2.5 1-5.5 3-7 7-1.5-4-4.5-6-7-7 2.5-1 5.5-3 7-7z" />
      <circle cx="12" cy="12" r="2" fill={color} />
    </svg>
  );
}

/* ── The actual shareable card visual ──────────────────────────── */
interface AffirmationCardPreviewProps {
  text: string;
  theme: typeof CARD_THEMES[0];
  style?: React.CSSProperties;
  isHighRes?: boolean;
  layout?: "botanical" | "minimalist" | "celestial";
}

function AffirmationCardPreview({
  text,
  theme,
  style = {},
  isHighRes = false,
  layout = "botanical",
}: AffirmationCardPreviewProps) {
  // Scaling factors for high-res export (1080x1920)
  const padding = isHighRes ? "160px 100px" : "48px 24px";
  const gap = isHighRes ? "56px" : "20px";
  const badgeTextSize = isHighRes ? "22px" : "10px";
  const badgePadding = isHighRes ? "12px 36px" : "6px 14px";
  const badgeGap = isHighRes ? "12px" : "6px";
  const logoSize = isHighRes ? 36 : 14;
  const quoteFontSize = isHighRes ? "240px" : "80px";
  const quoteMarginBottom = isHighRes ? "-100px" : "-36px";
  const textFontSize = isHighRes ? "54px" : "18px";
  const textLineHeight = "1.85";
  const dividerLine = isHighRes ? "100px" : "32px";
  const dividerHeight = isHighRes ? "3px" : "1.5px";
  const dividerGap = isHighRes ? "20px" : "8px";

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
        justifyContent: "space-between",
        padding: padding,
        boxShadow: isHighRes
          ? "none"
          : "0 20px 60px -12px rgba(0,0,0,0.15), 0 4px 12px -4px rgba(0,0,0,0.08)",
        boxSizing: "border-box",
        ...style,
      }}
    >
      {/* Background Blobs (only for botanical) */}
      {layout === "botanical" && (
        <>
          <div
            style={{
              position: "absolute",
              width: "70%",
              aspectRatio: "1",
              borderRadius: "50%",
              background: theme.blobA,
              filter: isHighRes ? "blur(180px)" : "blur(64px)",
              top: "-10%",
              right: "-10%",
            }}
          />
          <div
            style={{
              position: "absolute",
              width: "60%",
              aspectRatio: "1",
              borderRadius: "50%",
              background: theme.blobB,
              filter: isHighRes ? "blur(150px)" : "blur(50px)",
              bottom: "-5%",
              left: "-10%",
            }}
          />
        </>
      )}

      {/* Background Stars/Sparkles (only for celestial) */}
      {layout === "celestial" && (
        <div style={{ position: "absolute", inset: 0, opacity: 0.2, pointerEvents: "none" }}>
          <CelestialSparkle color={theme.textColor} size={isHighRes ? 48 : 16} style={{ position: "absolute", top: "15%", left: "20%" }} />
          <CelestialSparkle color={theme.textColor} size={isHighRes ? 36 : 12} style={{ position: "absolute", top: "25%", right: "15%" }} />
          <CelestialSparkle color={theme.textColor} size={isHighRes ? 42 : 14} style={{ position: "absolute", top: "45%", left: "10%" }} />
          <CelestialSparkle color={theme.textColor} size={isHighRes ? 30 : 10} style={{ position: "absolute", top: "60%", right: "20%" }} />
          <CelestialSparkle color={theme.textColor} size={isHighRes ? 48 : 16} style={{ position: "absolute", bottom: "20%", left: "25%" }} />
        </div>
      )}

      {/* Decorative Botanical Branches (only for botanical) */}
      {layout === "botanical" && (
        <>
          <div
            style={{
              position: "absolute",
              top: isHighRes ? "40px" : "12px",
              left: isHighRes ? "40px" : "12px",
              width: isHighRes ? "400px" : "130px",
              height: isHighRes ? "400px" : "130px",
              transform: "rotate(-15deg)",
            }}
          >
            <PremiumLeafBranch color={theme.textColor} opacity={0.15} />
          </div>
          <div
            style={{
              position: "absolute",
              bottom: isHighRes ? "40px" : "12px",
              right: isHighRes ? "40px" : "12px",
              width: isHighRes ? "400px" : "130px",
              height: isHighRes ? "400px" : "130px",
              transform: "rotate(165deg) scaleX(-1)",
            }}
          >
            <PremiumLeafBranch color={theme.textColor} opacity={0.15} />
          </div>
        </>
      )}

      {/* Celestial corner frames (only for celestial) */}
      {layout === "celestial" && (
        <div
          style={{
            position: "absolute",
            inset: isHighRes ? "40px" : "12px",
            border: `1.5px solid ${theme.textColor}25`,
            borderRadius: isHighRes ? "40px" : "16px",
            pointerEvents: "none",
          }}
        />
      )}

      {/* Minimalist Inset Frame (only for minimalist) */}
      {layout === "minimalist" && (
        <div
          style={{
            position: "absolute",
            inset: isHighRes ? "30px" : "10px",
            border: `2px solid ${theme.textColor}15`,
            borderRadius: isHighRes ? "40px" : "18px",
            pointerEvents: "none",
          }}
        />
      )}

      {/* Top Header/Badge */}
      {layout === "botanical" && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: badgeGap,
            background: "rgba(255, 255, 255, 0.45)",
            border: isHighRes ? "2px solid rgba(255,255,255,0.7)" : "1px solid rgba(255, 255, 255, 0.5)",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
            borderRadius: 999,
            padding: badgePadding,
            zIndex: 3,
          }}
        >
          <BloomLogo color={theme.textColor} size={logoSize} />
          <span
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: badgeTextSize,
              fontWeight: 800,
              color: theme.textColor,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
            }}
          >
            JN-CALM
          </span>
        </div>
      )}

      {layout === "minimalist" && (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px", zIndex: 3 }}>
          <ZenLotus color={theme.textColor} size={isHighRes ? 36 : 14} />
          <span
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: isHighRes ? "18px" : "8px",
              fontWeight: 700,
              color: theme.textColor,
              opacity: 0.6,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
            }}
          >
            JN-CALM
          </span>
        </div>
      )}

      {layout === "celestial" && (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px", zIndex: 3 }}>
          <CelestialMoon color={theme.textColor} size={isHighRes ? 36 : 14} />
          <span
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: isHighRes ? "18px" : "8px",
              fontWeight: 700,
              color: theme.textColor,
              opacity: 0.6,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
            }}
          >
            JN-CALM
          </span>
        </div>
      )}

      {/* Main Content (Quote) */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          textAlign: "center",
          gap: gap,
          zIndex: 3,
          flex: 1,
        }}
      >
        {/* Serif quote icon (only for botanical) */}
        {layout === "botanical" && (
          <span
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: quoteFontSize,
              lineHeight: 1,
              color: theme.textColor,
              opacity: 0.18,
              marginBottom: quoteMarginBottom,
              userSelect: "none",
            }}
            aria-hidden="true"
          >
            “
          </span>
        )}

        {/* Body quote text */}
        <p
          style={{
            fontFamily: layout === "minimalist" ? "'Inter', sans-serif" : "'Playfair Display', serif",
            fontSize: textFontSize,
            fontWeight: layout === "minimalist" ? 500 : 600,
            color: theme.textColor,
            lineHeight: textLineHeight,
            textAlign: "center",
            letterSpacing: layout === "minimalist" ? "0" : "-0.01em",
            margin: 0,
            padding: "0 8%",
          }}
        >
          {text}
        </p>

        {/* Divider */}
        {layout === "botanical" && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: dividerGap,
              width: "100%",
            }}
          >
            <div
              style={{
                width: dividerLine,
                height: dividerHeight,
                background: `linear-gradient(90deg, transparent, ${theme.textColor}35)`,
              }}
            />
            <div
              style={{
                width: isHighRes ? 8 : 4,
                height: isHighRes ? 8 : 4,
                borderRadius: "50%",
                background: theme.textColor,
                opacity: 0.5,
              }}
            />
            <div
              style={{
                width: dividerLine,
                height: dividerHeight,
                background: `linear-gradient(270deg, transparent, ${theme.textColor}35)`,
              }}
            />
          </div>
        )}

        {layout === "minimalist" && (
          <div
            style={{
              width: isHighRes ? "60px" : "20px",
              height: isHighRes ? "2px" : "1px",
              background: theme.textColor,
              opacity: 0.35,
            }}
          />
        )}

        {layout === "celestial" && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: dividerGap,
              width: "100%",
            }}
          >
            <div
              style={{
                width: dividerLine,
                height: dividerHeight,
                background: `linear-gradient(90deg, transparent, ${theme.textColor}25)`,
              }}
            />
            <CelestialSparkle color={theme.textColor} size={isHighRes ? 24 : 8} style={{ opacity: 0.6 }} />
            <div
              style={{
                width: dividerLine,
                height: dividerHeight,
                background: `linear-gradient(270deg, transparent, ${theme.textColor}25)`,
              }}
            />
          </div>
        )}
      </div>

      {/* Bottom branding: JNCALM custom speech bubble QR code */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 3,
        }}
      >
        <img
          src="/qr-code.png"
          alt="JN-CALM QR Code"
          style={{
            height: isHighRes ? "180px" : "60px",
            width: "auto",
            mixBlendMode: "multiply",
            borderRadius: isHighRes ? "20px" : "6px",
          }}
        />
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
  const [selectedLayout, setSelectedLayout] = useState<"botanical" | "minimalist" | "celestial">("botanical");
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
  }, [selectedTheme, selectedLayout]);

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
  }, [affirmation, selectedTheme, selectedLayout]);

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
            layout={selectedLayout}
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
                Pilih Desain & Tema
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
            <AffirmationCardPreview text={affirmation} theme={theme} layout={selectedLayout} />
          </div>

          {/* Selector section */}
          <div className="mt-4 space-y-3.5">
            {/* Layout selector */}
            <div>
              <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-muted-foreground mb-1.5 text-center">
                Gaya Desain
              </p>
              <div className="flex bg-cream-deep/60 p-1.5 rounded-2xl gap-1">
                {(["botanical", "minimalist", "celestial"] as const).map((lay) => (
                  <button
                    key={lay}
                    onClick={() => setSelectedLayout(lay)}
                    className={`flex-1 py-1.5 text-[11px] font-bold rounded-xl transition-all duration-250 ${
                      selectedLayout === lay
                        ? "bg-background text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {lay === "botanical" ? "Botanical" : lay === "minimalist" ? "Minimal" : "Celestial"}
                  </button>
                ))}
              </div>
            </div>

            {/* Theme selector */}
            <div>
              <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-muted-foreground mb-2 text-center">
                Warna Tema
              </p>
              <div className="flex items-center justify-center gap-3">
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
            </div>
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
