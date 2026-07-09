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
  
  // Mapping layout to grid positions for the 3x2 sprite sheet (canva-layouts-grid.jpg)
  const getBackgroundPosition = () => {
    switch (layout) {
      case "journal": return "0% 0%";
      case "botanical": return "50% 0%";
      case "aesthetic": return "100% 0%";
      case "landscape": return "0% 100%";
      case "midnight": return "50% 100%";
      case "meadow": return "100% 100%";
      default: return "0% 0%";
    }
  };

  const bgImageUrl = getAbsoluteUrl("/canva-layouts-grid.jpg");

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        aspectRatio: "1 / 1",
        position: "relative",
        overflow: "hidden",
        backgroundImage: `url(${bgImageUrl})`,
        backgroundSize: "300% 200%",
        backgroundPosition: getBackgroundPosition(),
        backgroundColor: "#FFF",
      }}
    >
      {/* Dynamic Font Loading */}
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;0,700;1,600&family=Inter:wght@400;500;600;700&display=swap');
        `}
      </style>

      {/* Overlay to hide the dummy text in the Canva image and show real dynamic text */}
      <div
        style={{
          position: "absolute",
          top: "33%",
          left: "14%",
          width: "72%",
          height: "40%",
          backgroundColor: "#FFFFFF",
          // Feather edges to blend seamlessly into the image's white card
          boxShadow: `0 0 ${14 * scale}px ${10 * scale}px #FFFFFF`,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          zIndex: 10,
        }}
      >
        <p
          style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: 16 * scale,
            fontWeight: 600,
            color: "#2D3748",
            margin: 0,
            lineHeight: 1.5,
            letterSpacing: "0.01em",
            padding: `0 ${8 * scale}px`,
          }}
        >
          {text}
        </p>
        <span
          style={{
            fontSize: 14 * scale,
            color: "rgba(0,0,0,0.3)",
            marginTop: 10 * scale,
            marginBottom: 6 * scale,
          }}
        >
          ♡
        </span>
        <p
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: 8.5 * scale,
            fontWeight: 500,
            color: "rgba(0,0,0,0.5)",
            margin: 0,
          }}
        >
          Tenanglah, kamu sedang bertumbuh dengan cara yang indah.
        </p>
      </div>

      {/* Overlay to inject the dynamic QR Code */}
      <div
        style={{
          position: "absolute",
          bottom: "6%",
          right: "6%",
          width: "16%",
          height: "16%",
          backgroundColor: "#FFFFFF",
          borderRadius: 6 * scale,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 10,
          boxShadow: `0 0 ${6 * scale}px ${3 * scale}px #FFFFFF`,
        }}
      >
        {qrSrc ? (
          <img
            src={qrSrc}
            alt="JN-CALM QR Code"
            style={{
              width: "88%",
              height: "88%",
              objectFit: "contain",
            }}
          />
        ) : (
          <img
            src={getAbsoluteUrl("/qr-code.png")}
            alt="JN-CALM QR Code"
            style={{
              width: "88%",
              height: "88%",
              objectFit: "contain",
            }}
          />
        )}
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
