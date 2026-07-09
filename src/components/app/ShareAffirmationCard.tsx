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

/* ── Helper to resolve absolute URLs for html-to-image compatibility ── */
const getAbsoluteUrl = (path: string) => {
  if (typeof window === "undefined") return path;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return `${window.location.origin}${path}`;
};

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

  const accentColor = "#8EA18D"; // Sage green

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        aspectRatio: "1 / 1",
        position: "relative",
        overflow: "hidden",
        backgroundColor: "#FAF8F4",
        fontFamily: "'Inter', sans-serif",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;0,700;1,600&family=Caveat:wght@600;700&family=Inter:wght@400;500;600;700&display=swap');
        `}
      </style>
      
      {/* Background Leaves */}
      <div style={{ position: 'absolute', top: '15%', left: '-5%', opacity: 0.7, transform: 'rotate(15deg) scale(' + scale + ')', zIndex: 1 }}>
        <svg width="80" height="120" viewBox="0 0 80 120" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M40 120 C40 80 0 60 10 20 C20 -10 60 10 70 50 C80 90 40 120 40 120 Z" fill="#8EA18D" opacity="0.6"/>
          <path d="M40 120 C40 80 80 60 70 20 C60 -10 20 10 10 50 C0 90 40 120 40 120 Z" fill="#7C8F7B" opacity="0.4"/>
          <path d="M40 120 L40 20" stroke="#FAF8F4" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      </div>

      {/* Top Header */}
      <div style={{
        marginTop: 18 * scale,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        zIndex: 2,
      }}>
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 6 * scale, marginBottom: 4 * scale }}>
          {logoSrc ? (
            <img src={logoSrc} alt="Logo" style={{ width: 22 * scale, height: 22 * scale }} />
          ) : (
            <svg width={22 * scale} height={22 * scale} viewBox="0 0 24 24" fill="none" stroke="#2C423F" strokeWidth="1.5">
              <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" />
              <path d="M12 16V12M12 8H12.01" strokeWidth="2" strokeLinecap="round" />
            </svg>
          )}
          <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 13 * scale, fontWeight: 700, letterSpacing: "0.15em", color: "#6A7B69" }}>JN-CALM</span>
        </div>
        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 6.5 * scale, fontWeight: 600, letterSpacing: "0.1em", color: "#8EA18D", textTransform: "uppercase", margin: 0, marginBottom: 14 * scale }}>
          Find Calm. Find Yourself.
        </p>

        {/* Title */}
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 34 * scale, fontWeight: 700, color: "#2E4035", margin: 0, lineHeight: 1.1 }}>
          Afirmasi Positif
        </h1>
        {/* Subtitle Script */}
        <h2 style={{ fontFamily: "'Caveat', cursive", fontSize: 24 * scale, fontWeight: 700, color: "#C0937A", margin: 0, marginTop: -4 * scale }}>
          Hari Ini ♡
        </h2>
        {/* Small subtext */}
        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: 8.5 * scale, fontWeight: 500, color: "#8E8880", margin: 0, marginTop: 8 * scale }}>
          Kata-kata kecil untuk hati yang besar.
        </p>
      </div>

      {/* Top Right Illustration: Journal */}
      <div style={{ position: "absolute", top: 35 * scale, right: 25 * scale, transform: "rotate(12deg)", zIndex: 1 }}>
        <svg width={70 * scale} height={90 * scale} viewBox="0 0 70 90" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Shadow */}
          <rect x="4" y="4" width="60" height="80" rx="4" fill="rgba(0,0,0,0.06)" />
          {/* Book Cover */}
          <rect x="0" y="0" width="60" height="80" rx="4" fill="#6A7B69" />
          <rect x="2" y="0" width="4" height="80" fill="#586857" />
          {/* Heart on cover */}
          <path d="M30 42C30 42 26 38 26 35C26 32 29 30 32 32C32 32 35 30 38 32C38 35 34 42 34 42L30 42Z" fill="#FAF8F4" />
          <rect x="52" y="10" width="10" height="15" fill="#FAF8F4" opacity="0.8" />
        </svg>
      </div>

      {/* Main White Card */}
      <div style={{
        position: "absolute",
        top: "33%",
        left: "14%",
        width: "72%",
        height: "44%",
        backgroundColor: "#FFFFFF",
        borderRadius: 40 * scale,
        boxShadow: "0px 8px 32px rgba(44, 66, 63, 0.04)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: `0 ${24 * scale}px`,
        textAlign: "center",
        zIndex: 10,
      }}>
        {/* Sun/Dot Icon */}
        <div style={{ 
          width: 24 * scale, 
          height: 24 * scale, 
          borderRadius: "50%", 
          backgroundColor: accentColor, 
          marginBottom: 12 * scale,
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}>
          <svg width={14 * scale} height={14 * scale} viewBox="0 0 24 24" fill="none" stroke="#FFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="5" />
            <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
          </svg>
        </div>

        {/* Affirmation Text */}
        <p style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: 16 * scale,
          fontWeight: 600,
          color: "#2C423F",
          margin: 0,
          lineHeight: 1.5,
          letterSpacing: "0.01em",
        }}>
          {text}
        </p>

        {/* Heart Divider */}
        <div style={{ marginTop: 14 * scale, marginBottom: 10 * scale }}>
           <span style={{ fontSize: 12 * scale, color: "#C0937A" }}>♡</span>
        </div>

        {/* Small subtitle */}
        <p style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: 9 * scale,
          fontWeight: 500,
          color: "#7C8F7B",
          margin: 0,
          marginBottom: 14 * scale
        }}>
          Tenanglah, kamu sedang bertumbuh dengan cara yang indah.
        </p>

        {/* CTA Button */}
        <div style={{
          backgroundColor: accentColor,
          borderRadius: 20 * scale,
          padding: `${6 * scale}px ${16 * scale}px`,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 6 * scale,
        }}>
          <span style={{ fontSize: 9 * scale, color: "#FFF" }}>🧘‍♀️</span>
          <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 7.5 * scale, fontWeight: 700, letterSpacing: "0.05em", color: "#FFF", textTransform: "uppercase" }}>
            Tarik napas. Fokus. Kamu mampu.
          </span>
        </div>
      </div>

      {/* Footer Icons */}
      <div style={{
        position: "absolute",
        bottom: 25 * scale,
        left: 20 * scale,
        display: "flex",
        gap: 8 * scale,
        zIndex: 5,
      }}>
        {[
          { icon: "♡", label: "Bersyukur" },
          { icon: "🍃", label: "Fokus" },
          { icon: "🪷", label: "Tenang" },
          { icon: "⭐", label: "Bersinar" }
        ].map((item, i) => (
          <div key={i} style={{
            display: "flex",
            alignItems: "center",
            gap: 4 * scale,
            backgroundColor: "rgba(255,255,255,0.7)",
            padding: `${5 * scale}px ${10 * scale}px`,
            borderRadius: 20 * scale,
            boxShadow: "0 2px 8px rgba(0,0,0,0.02)"
          }}>
            <span style={{ fontSize: 10 * scale }}>{item.icon}</span>
            <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 8 * scale, fontWeight: 600, color: "#6A7B69" }}>{item.label}</span>
          </div>
        ))}
      </div>

      {/* QR Code */}
      <div style={{
        position: "absolute",
        bottom: 20 * scale,
        right: 20 * scale,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        zIndex: 10,
        width: "14%",
      }}>
        <div style={{
          width: "100%",
          aspectRatio: "1/1",
          backgroundColor: "#FFFFFF",
          borderRadius: 8 * scale,
          padding: 5 * scale,
          boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 6 * scale,
        }}>
          {qrSrc ? (
            <img src={qrSrc} alt="QR Code" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
          ) : (
            <img src={getAbsoluteUrl("/qr-code.png")} alt="QR Code" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
          )}
        </div>
        <p style={{
          fontFamily: "'Inter', sans-serif",
          fontSize: 5.5 * scale,
          fontWeight: 600,
          color: "#8E8880",
          textAlign: "center",
          margin: 0,
          lineHeight: 1.3
        }}>
          Scan untuk inspirasi dan latihan mindfulness
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
    const convertToBase64 = async (url: string, callback: (base64: string) => void) => {
      try {
        const res = await fetch(`${url}?cb=${Date.now()}`);
        const blob = await res.blob();
        const reader = new FileReader();
        reader.onloadend = () => {
          if (isMounted) callback(reader.result as string);
        };
        reader.readAsDataURL(blob);
      } catch (e) {
        console.error("Image loading failed for url:", url, e);
      }
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
            height: "1080px",
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
