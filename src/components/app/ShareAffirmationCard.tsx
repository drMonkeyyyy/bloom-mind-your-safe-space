import { useState, useCallback, useRef, useEffect } from "react";
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

/* ── Helper to resolve absolute URLs for html-to-image compatibility ── */
const getAbsoluteUrl = (path: string) => {
  if (typeof window === "undefined") return path;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return `${window.location.origin}${path}`;
};

/* ── Cozy Journal Book Illustration ──────────────────────────── */
function JournalBook({ size = 50, style = {} }: { size?: number; style?: React.CSSProperties }) {
  return (
    <svg
      viewBox="0 0 60 70"
      width={size}
      height={size}
      style={style}
      aria-hidden="true"
    >
      <rect x="7" y="10" width="46" height="54" rx="4" fill="rgba(0,0,0,0.06)" />
      <rect x="5" y="8" width="46" height="54" rx="4" fill="#607666" />
      <rect x="5" y="8" width="5" height="54" rx="1" fill="#4B5E50" />
      <path d="M51 12 L53 12 L53 60 L51 60 Z" fill="#EAE5D9" />
      <path
        d="M28 28 C28 28 22 23 22 30 C22 34 28 38 28 38 C28 38 34 34 34 30 C34 23 28 28 28 28 Z"
        fill="#FFF"
        opacity="0.9"
      />
    </svg>
  );
}

/* ── Pampas Vase Illustration ────────────────────────────────── */
function PampasVase({ size = 80, style = {} }: { size?: number; style?: React.CSSProperties }) {
  return (
    <svg
      viewBox="0 0 100 150"
      width={size}
      height={size}
      style={style}
      aria-hidden="true"
    >
      <path d="M45 100 Q30 40 10 20" stroke="#C4B7A6" strokeWidth="1.5" fill="none" />
      <path d="M50 100 Q50 30 40 10" stroke="#C4B7A6" strokeWidth="1.5" fill="none" />
      <path d="M55 100 Q70 40 90 25" stroke="#C4B7A6" strokeWidth="1.5" fill="none" />
      <path d="M10 20 C15 15 25 25 20 35 C15 45 5 35 10 20 Z" fill="#DCD3C7" opacity="0.8" />
      <path d="M40 10 C45 5 50 15 45 25 C40 35 35 25 40 10 Z" fill="#DCD3C7" opacity="0.8" />
      <path d="M90 25 C95 20 98 35 90 40 C82 45 85 30 90 25 Z" fill="#DCD3C7" opacity="0.8" />
      <path
        d="M35 100 C35 85 65 85 65 100 L62 135 C62 140 38 140 38 135 Z"
        fill="#E5C3B3"
      />
      <path d="M42 100 C45 92 55 92 58 100" stroke="#FFF" strokeWidth="1" fill="none" opacity="0.4" />
    </svg>
  );
}

/* ── Hanging Lantern Illustration ─────────────────────────────── */
function HangingLantern({ size = 80, style = {} }: { size?: number; style?: React.CSSProperties }) {
  return (
    <svg
      viewBox="0 0 80 160"
      width={size}
      height={size}
      style={style}
      aria-hidden="true"
    >
      <line x1="40" y1="0" x2="40" y2="60" stroke="#FFEAA7" strokeWidth="1.5" strokeDasharray="3,3" />
      <path d="M25 60 L55 60 L48 50 L32 50 Z" fill="#4A455A" />
      <path d="M25 60 L55 60 L50 65 L30 65 Z" fill="#D4AF37" />
      <path d="M28 65 L52 65 L56 105 L24 105 Z" fill="rgba(255, 230, 150, 0.15)" stroke="#D4AF37" strokeWidth="1.5" />
      <circle cx="40" cy="85" r="10" fill="#FFEAA7" style={{ filter: "blur(2px)" }} />
      <path d="M37 90 C37 90 40 80 40 80 C40 80 43 90 43 90 Z" fill="#E5A93B" />
      <rect x="20" y="105" width="40" height="10" rx="2" fill="#4A455A" />
      <rect x="25" y="115" width="30" height="5" rx="1" fill="#D4AF37" />
    </svg>
  );
}

/* ── Scented Candle Illustration ──────────────────────────────── */
function ScentedCandle({ size = 45, style = {} }: { size?: number; style?: React.CSSProperties }) {
  return (
    <svg
      viewBox="0 0 60 60"
      width={size}
      height={size}
      style={style}
      aria-hidden="true"
    >
      <rect x="15" y="25" width="30" height="28" rx="4" fill="#D2B48C" opacity="0.6" stroke="#C2A47C" strokeWidth="1" />
      <rect x="17" y="32" width="26" height="19" rx="2" fill="#EAE5D9" />
      <line x1="30" y1="20" x2="30" y2="25" stroke="#4A3B32" strokeWidth="1.5" />
      <path d="M30 10 C32 15 30 20 30 20 C30 20 28 15 30 10 Z" fill="#FFC048" />
    </svg>
  );
}

/* ── Meadow Flowers Illustration ──────────────────────────────── */
function MeadowFlowers({ size = 80, style = {} }: { size?: number; style?: React.CSSProperties }) {
  return (
    <svg
      viewBox="0 0 100 80"
      width={size}
      height={size * 0.8}
      style={style}
      aria-hidden="true"
    >
      <path d="M30 80 Q25 40 15 20" stroke="#558B6E" strokeWidth="1.5" fill="none" />
      <path d="M50 80 Q55 35 65 15" stroke="#558B6E" strokeWidth="1.5" fill="none" />
      <path d="M70 80 Q65 45 80 30" stroke="#558B6E" strokeWidth="1" fill="none" />
      <circle cx="15" cy="20" r="8" fill="#FFF" />
      <circle cx="15" cy="20" r="3.5" fill="#F39C12" />
      <circle cx="65" cy="15" r="7" fill="#F1C40F" />
      <circle cx="65" cy="15" r="2.5" fill="#D35400" />
      <circle cx="80" cy="30" r="5" fill="#FFF" />
      <circle cx="80" cy="30" r="2" fill="#F39C12" />
    </svg>
  );
}

/* ── Leaf Sprig SVG helper ────────────────────────────────────── */
function LeafSprig({ color, style = {}, scale = 1 }: { color: string; style?: React.CSSProperties; scale?: number }) {
  return (
    <svg
      viewBox="0 0 50 100"
      width={25 * scale}
      height={50 * scale}
      style={style}
      aria-hidden="true"
    >
      <path d="M25 100 Q20 50 25 10" stroke={color} strokeWidth="1.5" fill="none" />
      <path d="M25 80 Q10 70 8 60 C8 55 18 55 24 72" fill={color} />
      <path d="M25 70 Q40 60 42 50 C42 45 32 45 26 62" fill={color} />
      <path d="M25 50 Q10 40 8 30 C8 25 18 25 24 42" fill={color} />
      <path d="M25 40 Q40 30 42 20 C42 15 32 15 26 32" fill={color} />
      <path d="M25 20 Q15 10 25 5 C35 10 25 20 25 20" fill={color} />
    </svg>
  );
}

/* ── Header with logo & tagline ──────────────────────────────── */
function BrandHeader({ color, scale = 1, isMidnight = false }: { color: string; scale?: number; isMidnight?: boolean }) {
  const brandColor = isMidnight ? "#FFE3A8" : color;
  const tagColor = isMidnight ? "#C3BEDA" : "rgba(0,0,0,0.5)";
  
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        marginTop: 18 * scale,
        marginBottom: 10 * scale,
        zIndex: 3,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 6 * scale }}>
        <svg
          viewBox="0 0 24 24"
          width={18 * scale}
          height={18 * scale}
          fill="none"
          stroke={brandColor}
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 22C12 22 20 16 20 11C20 6.5 16.5 3 12 3C7.5 3 4 6.5 4 11C4 16 12 22 12 22Z" />
          <path d="M12 22V10" />
          <path d="M12 14C12 14 9 12 9 10" />
          <path d="M12 12C12 12 15 10 15 8" />
        </svg>
        <span
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: 12 * scale,
            fontWeight: 800,
            letterSpacing: "0.15em",
            color: brandColor,
          }}
        >
          JN-CALM
        </span>
      </div>
      <span
        style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: 6 * scale,
          fontWeight: 600,
          letterSpacing: "0.08em",
          color: tagColor,
          textTransform: "uppercase",
          marginTop: 2 * scale,
        }}
      >
        Find Calm. Find Yourself.
      </span>
    </div>
  );
}

/* ── Top script layout title ─────────────────────────────────── */
function TitleSection({ scale = 1, isMidnight = false }: { scale?: number; isMidnight?: boolean }) {
  const titleColor = isMidnight ? "#FFF" : "#2E3B2F";
  const scriptColor = isMidnight ? "#FFE3A8" : "#8A6D5F";
  const subtitleColor = isMidnight ? "#A39EC4" : "rgba(0,0,0,0.5)";
  
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        zIndex: 3,
        marginBottom: 12 * scale,
      }}
    >
      <h1
        style={{
          fontFamily: "'Playfair Display', Georgia, serif",
          fontSize: 22 * scale,
          fontWeight: 700,
          color: titleColor,
          margin: 0,
          lineHeight: 1.1,
          letterSpacing: "0.02em",
        }}
      >
        Afirmasi Positif
      </h1>
      <span
        style={{
          fontFamily: "'Caveat', cursive",
          fontSize: 24 * scale,
          color: scriptColor,
          lineHeight: 1.0,
          marginTop: -2 * scale,
          display: "flex",
          alignItems: "center",
          gap: 4 * scale,
        }}
      >
        Hari Ini <span style={{ fontSize: 16 * scale }}>♡</span>
      </span>
      <span
        style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: 7 * scale,
          fontWeight: 500,
          letterSpacing: "0.05em",
          color: subtitleColor,
          marginTop: 4 * scale,
        }}
      >
        Kata-kata kecil untuk hati yang besar.
      </span>
    </div>
  );
}

/* ── 4 bottom outlined icons row ──────────────────────────────── */
function BottomIconsRow({ color, scale = 1, isMidnight = false }: { color: string; scale?: number; isMidnight?: boolean }) {
  const gap = 8 * scale;
  const fontSize = 7 * scale;
  
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 12 * scale,
        zIndex: 3,
        width: "90%",
        marginTop: 18 * scale,
      }}
    >
      {[
        { label: "Bersyukur", icon: "♡" },
        { label: "Fokus", icon: "🍃" },
        { label: "Tenang", icon: "🧘" },
        { label: "Bersinar", icon: "⭐" },
      ].map((item) => (
        <div
          key={item.label}
          style={{
            display: "flex",
            alignItems: "center",
            gap: gap,
            background: "rgba(255, 255, 255, 0.4)",
            border: "1px solid rgba(255, 255, 255, 0.3)",
            borderRadius: "999px",
            padding: `${4 * scale}px ${10 * scale}px`,
            boxShadow: "0 2px 8px rgba(0,0,0,0.02)",
            backdropFilter: "blur(4px)",
          }}
        >
          <span style={{ fontSize: 9 * scale }}>{item.icon}</span>
          <span
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: fontSize,
              fontWeight: 700,
              color: isMidnight ? "#FFE3A8" : color,
              letterSpacing: "0.05em",
            }}
          >
            {item.label}
          </span>
        </div>
      ))}
    </div>
  );
}

interface PreviewProps {
  text: string;
  theme: typeof CARD_THEMES[0];
  isHighRes?: boolean;
  layout?: "journal" | "botanical" | "aesthetic" | "landscape" | "midnight" | "meadow";
  logoSrc?: string;
  qrSrc?: string;
}

export function AffirmationCardPreview({
  text,
  theme,
  isHighRes = false,
  layout = "journal",
  logoSrc,
  qrSrc,
}: PreviewProps) {
  const scale = isHighRes ? 3.375 : 1;
  const isMidnight = layout === "midnight";
  
  // Custom styles for each layout background
  const getBackgroundStyle = (): React.CSSProperties => {
    switch (layout) {
      case "journal":
        return { backgroundColor: "#F6EFE6" };
      case "botanical":
        return { backgroundColor: "#E8EFE9" };
      case "aesthetic":
        return { backgroundColor: "#FAF4EC" };
      case "landscape":
        return { backgroundColor: "#EDF4EE" };
      case "midnight":
        return { background: "linear-gradient(180deg, #2E284A 0%, #161224 100%)" };
      case "meadow":
        return { background: "linear-gradient(180deg, #E3F2FD 0%, #F5F7FA 100%)" };
      default:
        return { backgroundColor: "#F6EFE6" };
    }
  };

  return (
    <div
      style={{
        ...getBackgroundStyle(),
        width: "100%",
        height: "100%",
        aspectRatio: "9/16",
        position: "relative",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "space-between",
        padding: `${24 * scale}px ${16 * scale}px`,
        boxSizing: "border-box",
      }}
    >
      {/* Dynamic Font Loading */}
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Caveat:wght@700&family=Playfair+Display:ital,wght@0,600;0,700;1,600&family=Inter:wght@400;600;700&family=Fredoka:wght@600;700&display=swap');
        `}
      </style>

      {/* ── Background illustrations & curves based on layout ── */}
      
      {/* Layout 1: Cozy Journal */}
      {layout === "journal" && (
        <>
          <svg
            style={{ position: "absolute", bottom: 0, left: 0, width: "55%", height: "45%", zIndex: 1 }}
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            <path d="M 0 100 L 0 25 C 35 35 65 70 100 100 Z" fill="#8F9F8F" opacity="0.8" />
          </svg>
          {/* Notebook thin grid lines backdrop */}
          <div 
            style={{
              position: "absolute",
              inset: 0,
              backgroundImage: "linear-gradient(rgba(0,0,0,0.03) 1px, transparent 1px)",
              backgroundSize: `100% ${18 * scale}px`,
              zIndex: 1,
              pointerEvents: "none"
            }}
          />
          <LeafSprig color="#6D7E6D" style={{ position: "absolute", bottom: "4%", left: "4%", transform: "rotate(45deg)", zIndex: 2 }} scale={scale} />
          <LeafSprig color="#6D7E6D" style={{ position: "absolute", top: "14%", left: "2%", transform: "rotate(-30deg)", zIndex: 2 }} scale={scale} />
          <JournalBook size={46 * scale} style={{ position: "absolute", top: "12%", right: "6%", transform: "rotate(-10deg)", zIndex: 2 }} />
        </>
      )}

      {/* Layout 2: Leafy Fresh */}
      {layout === "botanical" && (
        <>
          <LeafSprig color="#4A5F4E" style={{ position: "absolute", top: "12%", left: "4%", transform: "rotate(-20deg)", zIndex: 2 }} scale={scale} />
          <LeafSprig color="#4A5F4E" style={{ position: "absolute", bottom: "10%", right: "4%", transform: "rotate(160deg) scaleX(-1)", zIndex: 2 }} scale={scale} />
        </>
      )}

      {/* Layout 3: Warm Aesthetic */}
      {layout === "aesthetic" && (
        <>
          <svg
            style={{ position: "absolute", top: "16%", left: "10%", width: "80%", height: "68%", zIndex: 1 }}
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            <path d="M 10 100 A 40 40 0 0 1 90 100 Z" fill="none" stroke="#EFE6DC" strokeWidth="1.5" />
            <path d="M 15 100 A 35 35 0 0 1 85 100 Z" fill="none" stroke="#EFE6DC" strokeWidth="0.8" />
          </svg>
          <PampasVase size={75 * scale} style={{ position: "absolute", bottom: "16%", right: "2%", zIndex: 2 }} />
          <ScentedCandle size={36 * scale} style={{ position: "absolute", bottom: "14%", left: "4%", zIndex: 2 }} />
        </>
      )}

      {/* Layout 4: Mountain Landscape */}
      {layout === "landscape" && (
        <>
          <svg
            style={{ position: "absolute", bottom: 0, left: 0, width: "100%", height: "45%", zIndex: 1 }}
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            <path d="M 0 100 L 0 50 Q 25 35 50 55 Q 75 75 100 45 L 100 100 Z" fill="#D3DFD6" />
            <path d="M 0 100 L 0 65 Q 30 55 60 70 Q 80 50 100 70 L 100 100 Z" fill="#B4C9BA" />
            <path d="M 0 100 L 0 80 Q 40 70 70 85 Q 85 80 100 90 L 100 100 Z" fill="#90A896" />
            <path d="M 30 100 C 40 85 55 85 65 100 Z" fill="#E8F4F8" opacity="0.6" />
          </svg>
          <LeafSprig color="#5E7864" style={{ position: "absolute", top: "8%", left: "4%", transform: "rotate(-10deg)", zIndex: 2 }} scale={scale} />
        </>
      )}

      {/* Layout 5: Midnight Lantern */}
      {layout === "midnight" && (
        <>
          <svg
            viewBox="0 0 24 24"
            width={34 * scale}
            height={34 * scale}
            style={{ position: "absolute", top: "10%", left: "8%", zIndex: 2 }}
          >
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" fill="#FFEAA7" opacity="0.9" />
          </svg>
          <HangingLantern size={65 * scale} style={{ position: "absolute", top: "8%", right: "8%", zIndex: 2 }} />
          <span style={{ position: "absolute", top: "35%", left: "5%", fontSize: 10 * scale, color: "#FFEAA7", opacity: 0.6 }}>✦</span>
          <span style={{ position: "absolute", bottom: "35%", right: "5%", fontSize: 12 * scale, color: "#FFEAA7", opacity: 0.5 }}>✦</span>
          <span style={{ position: "absolute", top: "20%", right: "25%", fontSize: 8 * scale, color: "#FFEAA7", opacity: 0.7 }}>✦</span>
        </>
      )}

      {/* Layout 6: Flower Meadow */}
      {layout === "meadow" && (
        <>
          <svg
            viewBox="0 0 100 50"
            width={40 * scale}
            height={20 * scale}
            style={{ position: "absolute", top: "12%", right: "12%", zIndex: 2, opacity: 0.6 }}
          >
            <path d="M 5 15 Q 12 5 20 15 Q 28 5 35 15" stroke="#7EA8BE" strokeWidth="1.5" fill="none" />
            <path d="M 50 25 Q 55 18 60 25 Q 65 18 70 25" stroke="#7EA8BE" strokeWidth="1" fill="none" />
          </svg>
          <svg
            style={{ position: "absolute", bottom: 0, left: 0, width: "100%", height: "25%", zIndex: 1 }}
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            <path d="M 0 100 L 0 50 Q 50 70 100 50 L 100 100 Z" fill="#A8D5B9" opacity="0.8" />
            <path d="M 0 100 L 0 70 Q 50 60 100 70 L 100 100 Z" fill="#8AC79E" />
          </svg>
          <MeadowFlowers size={110 * scale} style={{ position: "absolute", bottom: 0, left: "4%", zIndex: 2 }} />
          <MeadowFlowers size={90 * scale} style={{ position: "absolute", bottom: 0, right: "4%", transform: "scaleX(-1)", zIndex: 2 }} />
        </>
      )}

      {/* ── Brand Header ── */}
      <BrandHeader color={theme.accentColor} scale={scale} isMidnight={isMidnight} />

      {/* ── Title Section ── */}
      <TitleSection scale={scale} isMidnight={isMidnight} />

      {/* ── Quote Card Container ── */}
      <div
        style={{
          width: "86%",
          backgroundColor: "rgba(255, 255, 255, 0.94)",
          borderRadius: 22 * scale,
          padding: `${26 * scale}px ${20 * scale}px`,
          boxShadow: isHighRes ? "none" : "0 8px 30px rgba(0, 0, 0, 0.03)",
          border: "1px solid rgba(255, 255, 255, 0.8)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          position: "relative",
          zIndex: 3,
          minHeight: 160 * scale,
          boxSizing: "border-box",
        }}
      >
        {/* Layout 1 Cozy tape */}
        {layout === "journal" && (
          <div
            style={{
              position: "absolute",
              top: -10 * scale,
              left: "50%",
              transform: "translateX(-50%) rotate(-1deg)",
              width: 70 * scale,
              height: 18 * scale,
              backgroundColor: "rgba(224, 218, 206, 0.75)",
              borderLeft: "1px dashed rgba(0,0,0,0.08)",
              borderRight: "1px dashed rgba(0,0,0,0.08)",
              boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
              zIndex: 10,
            }}
          />
        )}

        {/* Top elements inside Card container based on design */}
        {layout === "journal" && (
          <div
            style={{
              width: 24 * scale,
              height: 24 * scale,
              borderRadius: "50%",
              backgroundColor: "#8F9F8F",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 10 * scale,
            }}
          >
            <svg viewBox="0 0 24 24" width={12 * scale} height={12 * scale} fill="none" stroke="#FFF" strokeWidth="2">
              <circle cx="12" cy="12" r="4" />
              <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
            </svg>
          </div>
        )}

        {layout === "botanical" && (
          <div
            style={{
              position: "absolute",
              top: 6 * scale,
              left: 14 * scale,
              fontFamily: "'Playfair Display', serif",
              fontSize: 48 * scale,
              color: "rgba(96, 118, 102, 0.15)",
              lineHeight: 1.0,
              fontWeight: 900,
            }}
          >
            “
          </div>
        )}

        {layout === "aesthetic" && (
          <svg
            viewBox="0 0 24 24"
            width={18 * scale}
            height={18 * scale}
            fill="none"
            stroke="#E5C3B3"
            strokeWidth="1.5"
            style={{ marginBottom: 8 * scale }}
          >
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
        )}

        {(layout === "landscape" || layout === "meadow") && (
          <span style={{ fontSize: 16 * scale, marginBottom: 8 * scale }}>🍃</span>
        )}
        {layout === "midnight" && (
          <span style={{ fontSize: 16 * scale, marginBottom: 8 * scale }}>✨</span>
        )}

        {/* The Quote text */}
        <p
          style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: 14 * scale,
            fontWeight: 600,
            color: "#2D3748",
            margin: 0,
            lineHeight: 1.55,
            letterSpacing: "0.01em",
            zIndex: 4,
            padding: `0 ${8 * scale}px`,
          }}
        >
          {text}
        </p>

        {/* Small Heart Spacer */}
        <span
          style={{
            fontFamily: "'Caveat', cursive",
            fontSize: 18 * scale,
            color: "rgba(0,0,0,0.3)",
            marginTop: 8 * scale,
            marginBottom: 6 * scale,
          }}
        >
          ♡
        </span>

        {/* Bottom card message */}
        <p
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: 8 * scale,
            fontWeight: 500,
            color: "rgba(0,0,0,0.5)",
            margin: 0,
          }}
        >
          Tenanglah, kamu sedang bertumbuh dengan cara yang indah.
        </p>

        {/* Pill Badge */}
        {["journal", "landscape", "midnight", "meadow"].includes(layout) && (
          <div
            style={{
              marginTop: 10 * scale,
              backgroundColor:
                layout === "journal"
                  ? "#8F9F8F"
                  : layout === "midnight"
                    ? "#4A455A"
                    : layout === "meadow"
                      ? "#7EA8BE"
                      : "#6E8C75",
              borderRadius: "999px",
              padding: `${4 * scale}px ${12 * scale}px`,
              display: "inline-flex",
              alignItems: "center",
              gap: 4 * scale,
              boxShadow: "0 2px 6px rgba(0,0,0,0.03)",
            }}
          >
            <span style={{ fontSize: 7 * scale, color: "#FFF" }}>🧘</span>
            <span
              style={{
                fontFamily: "'Inter', sans-serif",
                fontSize: 7 * scale,
                fontWeight: 700,
                color: "#FFF",
                letterSpacing: "0.04em",
                textTransform: "uppercase",
              }}
            >
              Tarik napas. Fokus. Kamu mampu.
            </span>
          </div>
        )}
      </div>

      {/* ── Bottom outlined icons row ── */}
      <BottomIconsRow color={theme.accentColor} scale={scale} isMidnight={isMidnight} />

      {/* ── Footer Row (QR and tag text) ── */}
      <div
        style={{
          width: "86%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginTop: 12 * scale,
          zIndex: 3,
          boxSizing: "border-box",
        }}
      >
        <div style={{ flex: 1, paddingRight: 12 * scale }}>
          <p
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: 7 * scale,
              fontWeight: 600,
              color: isMidnight ? "#C3BEDA" : "rgba(0, 0, 0, 0.45)",
              margin: 0,
              lineHeight: 1.4,
              letterSpacing: "0.02em",
            }}
          >
            Scan untuk inspirasi dan latihan mindfulness
          </p>
        </div>
        <div
          style={{
            backgroundColor: "white",
            padding: 5 * scale,
            borderRadius: 10 * scale,
            boxShadow: isHighRes ? "none" : "0 4px 14px rgba(0,0,0,0.04)",
            border: "1px solid rgba(0,0,0,0.05)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <img
            src={qrSrc || getAbsoluteUrl("/qr-code.png")}
            alt="JN-CALM QR Code"
            style={{
              height: 52 * scale,
              width: 52 * scale,
              display: "block",
            }}
          />
        </div>
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
  const [selectedLayout, setSelectedLayout] = useState<"journal" | "botanical" | "aesthetic" | "landscape" | "midnight" | "meadow">("journal");
  const [sharing, setSharing] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [logoBase64, setLogoBase64] = useState<string>("");
  const [qrBase64, setQrBase64] = useState<string>("");
  const exportRef = useRef<HTMLDivElement>(null);
  const theme = CARD_THEMES[selectedTheme];

  useEffect(() => {
    if (!open) return;
    
    let isMounted = true;
    const convertToBase64 = (url: string, callback: (base64: string) => void) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        try {
          const canvas = document.createElement("canvas");
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.drawImage(img, 0, 0);
            const dataUrl = canvas.toDataURL("image/png");
            if (isMounted) {
              callback(dataUrl);
            }
          }
        } catch (e) {
          console.error("Canvas conversion failed:", e);
        }
      };
      img.onerror = () => {
        console.error("Image loading failed for url:", url);
      };
      img.src = `${url}?cb=${Date.now()}`;
    };

    convertToBase64("/logo.png", setLogoBase64);
    convertToBase64("/qr-code.png", setQrBase64);

    return () => {
      isMounted = false;
    };
  }, [open]);

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
            logoSrc={logoBase64}
            qrSrc={qrBase64}
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
            <AffirmationCardPreview text={affirmation} theme={theme} layout={selectedLayout} logoSrc={logoBase64} qrSrc={qrBase64} />
          </div>

          {/* Selector section */}
          <div className="mt-4 space-y-3.5">
            {/* Layout selector */}
            <div>
              <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-muted-foreground mb-1.5 text-center">
                Gaya Desain
              </p>
              <div className="grid grid-cols-3 gap-1.5 bg-cream-deep/60 p-1.5 rounded-2xl">
                {(["journal", "botanical", "aesthetic", "landscape", "midnight", "meadow"] as const).map((lay) => (
                  <button
                    key={lay}
                    onClick={() => setSelectedLayout(lay)}
                    className={`py-1.5 text-[9.5px] font-bold rounded-xl transition-all duration-250 ${
                      selectedLayout === lay
                        ? "bg-background text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {lay === "journal" 
                      ? "1. Cozy Journal" 
                      : lay === "botanical" 
                        ? "2. Leafy Fresh" 
                        : lay === "aesthetic" 
                          ? "3. Warm Aesthetic" 
                          : lay === "landscape" 
                            ? "4. Landscape" 
                            : lay === "midnight" 
                              ? "5. Midnight" 
                              : "6. Meadow"}
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
