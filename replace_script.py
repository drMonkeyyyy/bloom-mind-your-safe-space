with open("src/components/app/ShareAffirmationCard.tsx", "r") as f:
    content = f.read()

start_idx = content.find('export function AffirmationCardPreview')
end_idx = content.find('/* ── Share Modal ────────────────────────────────────────────────── */')

if start_idx == -1 or end_idx == -1:
    print("Could not find boundaries")
    exit(1)

new_component = """export function AffirmationCardPreview({
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

"""

with open("src/components/app/ShareAffirmationCard.tsx", "w") as f:
    f.write(content[:start_idx] + new_component + content[end_idx:])

print("Component Replaced")
