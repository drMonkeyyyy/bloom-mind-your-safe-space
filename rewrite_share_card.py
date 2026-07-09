import re

with open("src/components/app/ShareAffirmationCard.tsx", "r") as f:
    code = f.read()

# Replace PreviewProps to include bgSrc
preview_props_target = """interface PreviewProps {
  text: string;
  theme: typeof CARD_THEMES[0];
  isHighRes?: boolean;
  layout?: "journal" | "botanical" | "aesthetic" | "landscape" | "midnight" | "meadow";
  logoSrc?: string;
  qrSrc?: string;
}"""

preview_props_replacement = """interface PreviewProps {
  text: string;
  theme: typeof CARD_THEMES[0];
  isHighRes?: boolean;
  layout?: "journal" | "botanical" | "aesthetic" | "landscape" | "midnight" | "meadow";
  logoSrc?: string;
  qrSrc?: string;
  bgSrc?: string;
}"""

code = code.replace(preview_props_target, preview_props_replacement)

# Replace AffirmationCardPreview component entirely
component_start = code.find("export function AffirmationCardPreview")
component_end = code.find("/* ── Share Modal ────────────────────────────────────────────────── */")

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

  // Adjust Y-positioning and Y-height for the text container per layout
  const getLayoutConfig = () => {
    switch (layout) {
      case "journal":
        return { textTop: "32%", textHeight: "40%", textLeft: "14%", textWidth: "72%" };
      case "botanical":
        return { textTop: "30%", textHeight: "40%", textLeft: "14%", textWidth: "72%" };
      case "aesthetic":
        return { textTop: "31%", textHeight: "42%", textLeft: "14%", textWidth: "72%" };
      case "landscape":
        return { textTop: "32%", textHeight: "40%", textLeft: "14%", textWidth: "72%" };
      case "midnight":
        return { textTop: "32%", textHeight: "40%", textLeft: "14%", textWidth: "72%" };
      case "meadow":
        return { textTop: "32%", textHeight: "40%", textLeft: "14%", textWidth: "72%" };
      default:
        return { textTop: "32%", textHeight: "40%", textLeft: "14%", textWidth: "72%" };
    }
  };

  const bgImageUrl = bgSrc || getAbsoluteUrl("/canva-layouts-grid.jpg");
  const config = getLayoutConfig();

  // Dynamic font sizing based on length of text to prevent any overlap
  const getDynamicFontSize = (str: string) => {
    const len = str.length;
    if (len > 120) return 11;
    if (len > 90) return 12.5;
    if (len > 60) return 14.5;
    return 16;
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

code = code[:component_start] + new_component + code[component_end:]

# Now replace the ShareAffirmationModal internal logic for background loading
modal_start = code.find("export function ShareAffirmationModal")

# Find the state declarations inside ShareAffirmationModal
state_block_target = """  const [selectedTheme, setSelectedTheme] = useState(0);
  const [selectedLayout, setSelectedLayout] = useState<"journal" | "botanical" | "aesthetic" | "landscape" | "midnight" | "meadow">("journal");
  const [sharing, setSharing] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [logoBase64, setLogoBase64] = useState<string>("");
  const [qrBase64, setQrBase64] = useState<string>("");"""

state_block_replacement = """  const [selectedTheme, setSelectedTheme] = useState(0);
  const [selectedLayout, setSelectedLayout] = useState<"journal" | "botanical" | "aesthetic" | "landscape" | "midnight" | "meadow">("journal");
  const [sharing, setSharing] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [logoBase64, setLogoBase64] = useState<string>("");
  const [qrBase64, setQrBase64] = useState<string>("");
  const [bgBase64, setBgBase64] = useState<string>("");"""

code = code.replace(state_block_target, state_block_replacement)

# Update convertToBase64 calls inside useEffect
effect_target = """    convertToBase64("/logo.png", setLogoBase64);
    convertToBase64("/qr-code.png", setQrBase64);"""

effect_replacement = """    convertToBase64("/logo.png", setLogoBase64);
    convertToBase64("/qr-code.png", setQrBase64);
    convertToBase64("/canva-layouts-grid.jpg", setBgBase64);"""

code = code.replace(effect_target, effect_replacement)

# Update instantiations of AffirmationCardPreview in exportRef
export_preview_target = """          <AffirmationCardPreview
            text={affirmation}
            theme={theme}
            isHighRes={true}
            layout={selectedLayout}
            logoSrc={logoBase64}
            qrSrc={qrBase64}
          />"""

export_preview_replacement = """          <AffirmationCardPreview
            text={affirmation}
            theme={theme}
            isHighRes={true}
            layout={selectedLayout}
            logoSrc={logoBase64}
            qrSrc={qrBase64}
            bgSrc={bgBase64}
          />"""

code = code.replace(export_preview_target, export_preview_replacement)

# Update instantiation in preview container
modal_preview_target = """<AffirmationCardPreview text={affirmation} theme={theme} layout={selectedLayout} logoSrc={logoBase64} qrSrc={qrBase64} />"""
modal_preview_replacement = """<AffirmationCardPreview text={affirmation} theme={theme} layout={selectedLayout} logoSrc={logoBase64} qrSrc={qrBase64} bgSrc={bgBase64} />"""

code = code.replace(modal_preview_target, modal_preview_replacement)

with open("src/components/app/ShareAffirmationCard.tsx", "w") as f:
    f.write(code)

print("Rewrote ShareAffirmationCard with dynamic font scaling and base64 background")
