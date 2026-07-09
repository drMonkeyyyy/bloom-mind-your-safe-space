with open("src/components/app/ShareAffirmationCard.tsx", "r") as f:
    content = f.read()

start_idx = content.find('export function AffirmationCardPreview')
end_idx = content.find('/* ── Share Modal ────────────────────────────────────────────────── */')

new_component = """export function AffirmationCardPreview({
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

  // Layout specific coordinates to perfectly cover dummy text and dummy QR codes
  const getLayoutConfig = () => {
    switch (layout) {
      case "journal":
        return { textTop: "33%", qrBottom: "6%", qrRight: "6%", textLeft: "14%", textWidth: "72%" };
      case "botanical":
        // Adjusted from screenshot to perfectly hide the dummy QR and start text below the title
        return { textTop: "29%", qrBottom: "11%", qrRight: "14%", textLeft: "12%", textWidth: "76%" };
      case "aesthetic":
        return { textTop: "33%", qrBottom: "6%", qrRight: "6%", textLeft: "14%", textWidth: "72%" };
      case "landscape":
        return { textTop: "33%", qrBottom: "6%", qrRight: "6%", textLeft: "14%", textWidth: "72%" };
      case "midnight":
        return { textTop: "33%", qrBottom: "6%", qrRight: "6%", textLeft: "14%", textWidth: "72%" };
      case "meadow":
        return { textTop: "33%", qrBottom: "6%", qrRight: "6%", textLeft: "14%", textWidth: "72%" };
      default:
        return { textTop: "33%", qrBottom: "6%", qrRight: "6%", textLeft: "14%", textWidth: "72%" };
    }
  };

  const bgImageUrl = getAbsoluteUrl("/canva-layouts-grid.jpg");
  const config = getLayoutConfig();

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
          top: config.textTop,
          left: config.textLeft,
          width: config.textWidth,
          // Using padding instead of fixed height so long text grows downwards without overlapping the title above
          paddingTop: `${20 * scale}px`,
          paddingBottom: `${24 * scale}px`,
          backgroundColor: "#FFFFFF",
          // Heavy feathered edges to blend seamlessly into the image's white card and hide dummy text
          boxShadow: `0 0 ${18 * scale}px ${18 * scale}px #FFFFFF`,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "flex-start",
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
          bottom: config.qrBottom,
          right: config.qrRight,
          width: "18%",
          height: "18%",
          backgroundColor: "#FFFFFF",
          borderRadius: 8 * scale,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 10,
          boxShadow: `0 0 ${8 * scale}px ${4 * scale}px #FFFFFF`,
          padding: 4 * scale,
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

with open("src/components/app/ShareAffirmationCard.tsx", "w") as f:
    f.write(content[:start_idx] + new_component + content[end_idx:])

print("Component Layout Mappings Replaced")
