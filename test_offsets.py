# Let's write the updated component to ShareAffirmationCard.tsx
with open("src/components/app/ShareAffirmationCard.tsx", "r") as f:
    code = f.read()

start_idx = code.find("export function AffirmationCardPreview")
end_idx = code.find("/* ── Share Modal ────────────────────────────────────────────────── */")

new_component = """export function AffirmationCardPreview({
  text,
  theme,
  isHighRes = false,
  layout = "journal",
  logoSrc,
  qrSrc,
  bgSrc,
}: PreviewProps) {
  const scale = isHighRes ? 3.375 : 1;
  
  // Mapping layout to pixel offset coordinates for the 3x2 grid image (canva-layouts-grid.jpg)
  // Instead of using CSS background-image (which breaks html-to-image), we use an absolute <img> tag shifted inside a clip container.
  const getBackgroundOffsets = () => {
    switch (layout) {
      case "journal":
        return { left: "0%", top: "0%" };
      case "botanical":
        return { left: "-100%", top: "0%" };
      case "aesthetic":
        return { left: "-200%", top: "0%" };
      case "landscape":
        return { left: "0%", top: "-100%" };
      case "midnight":
        return { left: "-100%", top: "-100%" };
      case "meadow":
        return { left: "-200%", top: "-100%" };
      default:
        return { left: "0%", top: "0%" };
    }
  };

  const getLayoutConfig = () => {
    switch (layout) {
      case "journal":
        return { textTop: "33%", textHeight: "42%", textLeft: "14%", textWidth: "72%" };
      case "botanical":
        return { textTop: "30%", textHeight: "42%", textLeft: "14%", textWidth: "72%" };
      case "aesthetic":
        return { textTop: "31%", textHeight: "42%", textLeft: "14%", textWidth: "72%" };
      case "landscape":
        return { textTop: "33%", textHeight: "40%", textLeft: "14%", textWidth: "72%" };
      case "midnight":
        return { textTop: "33%", textHeight: "40%", textLeft: "14%", textWidth: "72%" };
      case "meadow":
        return { textTop: "31%", textHeight: "42%", textLeft: "14%", textWidth: "72%" };
      default:
        return { textTop: "33%", textHeight: "42%", textLeft: "14%", textWidth: "72%" };
    }
  };

  const bgImageUrl = bgSrc || getAbsoluteUrl("/canva-layouts-grid.jpg");
  const offsets = getBackgroundOffsets();
  const config = getLayoutConfig();

  // Dynamic font sizing based on length of text to prevent any overlap
  const getDynamicFontSize = (str: string) => {
    const len = str.length;
    if (len > 120) return 9.5; // Very small font for long paragraphs
    if (len > 90) return 11;
    if (len > 60) return 13;
    return 15;
  };

  const fontSize = getDynamicFontSize(text);

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        aspectRatio: "1 / 1",
        position: "relative",
        overflow: "hidden",
        backgroundColor: "#FFF",
      }}
    >
      {/* Absolute Image Tag Sprite Sheet (Flawless html-to-image render) */}
      <img
        src={bgImageUrl}
        alt="Background Template"
        style={{
          position: "absolute",
          width: "300%",
          height: "200%",
          left: offsets.left,
          top: offsets.top,
          objectFit: "fill",
          zIndex: 1,
        }}
      />

      {/* Dynamic Font Loading */}
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;0,700;1,600&family=Inter:wght@400;500;600;700&display=swap');
        `}
      </style>

      {/* Transparent Text Overlay (NO WHITE BOX to preserve original Canva layouts) */}
      <div
        style={{
          position: "absolute",
          top: config.textTop,
          left: config.textLeft,
          width: config.textWidth,
          height: config.textHeight,
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
            fontSize: fontSize * scale,
            fontWeight: 600,
            color: "#2D3748",
            margin: 0,
            lineHeight: 1.45,
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
            marginTop: 8 * scale,
            marginBottom: 4 * scale,
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

      {/* Overlay to inject the dynamic QR Code exactly over the dummy Canva QR */}
      <div
        style={{
          position: "absolute",
          bottom: "5.5%",
          right: "5.5%",
          width: "17%",
          height: "17%",
          backgroundColor: "#FFFFFF",
          borderRadius: 6 * scale,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 10,
          boxShadow: `0 0 ${4 * scale}px ${2 * scale}px #FFFFFF`,
          padding: 3 * scale,
        }}
      >
        {qrSrc ? (
          <img
            src={qrSrc}
            alt="JN-CALM QR Code"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "contain",
            }}
          />
        ) : (
          <img
            src={getAbsoluteUrl("/qr-code.png")}
            alt="JN-CALM QR Code"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "contain",
            }}
          />
        )}
      </div>
    </div>
  );
}

"""

code = code[:start_idx] + new_component + code[end_idx:]

with open("src/components/app/ShareAffirmationCard.tsx", "w") as f:
    f.write(code)

print("Rewrote ShareAffirmationCard with offsets and dynamic scale font size")
