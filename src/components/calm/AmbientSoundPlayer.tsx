import { useState, useEffect } from "react";
import { toast } from "sonner";
import { SOUNDS, SoundType, subscribeAudioState, toggleAmbientSound, setAmbientVolume, stopAllAmbient } from "@/lib/audio";

export function AmbientSoundPlayer() {
  const [activeSound, setActiveSound] = useState<SoundType | null>(() => {
    return typeof window !== "undefined" ? window.__bloomActiveSound || null : null;
  });
  const [volume, setVolume] = useState(() => {
    return typeof window !== "undefined" && typeof window.__bloomVolume === "number" ? window.__bloomVolume : 0.5;
  });

  useEffect(() => {
    const unsubscribe = subscribeAudioState((sound, vol) => {
      setActiveSound(sound);
      setVolume(vol);
    });
    return unsubscribe;
  }, []);

  const handleToggle = (sound: SoundType) => {
    try {
      toggleAmbientSound(sound);
    } catch (err) {
      console.error("Audio failed", err);
      toast.error("Gagal memulai audio");
    }
  };

  const handleVolumeChange = (vol: number) => {
    setAmbientVolume(vol);
  };

  const activeInfo = SOUNDS.find(s => s.id === activeSound);

  return (
    <div className="rounded-3xl bg-card ring-1 ring-border/60 shadow-card overflow-hidden animate-scale-in">
      {/* Header row */}
      <div className="px-5 pt-5 pb-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className="grid h-10 w-10 place-items-center rounded-2xl text-xl transition-all duration-300"
            style={{ background: activeSound ? "oklch(0.90 0.04 160)" : "oklch(0.95 0.02 80)" }}
          >
            {activeInfo?.emoji ?? "🎵"}
          </div>
          <div>
            <p className="text-sm font-semibold">Soundscape Penenang</p>
            <p className="text-[11px] text-muted-foreground transition-all duration-300">
              {activeInfo ? activeInfo.desc : "Pilih suara latar untuk membantumu rileks"}
            </p>
          </div>
        </div>

        {/* Volume slider */}
        {activeSound && (
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs text-muted-foreground">🔈</span>
            <input
              type="range" min="0" max="1" step="0.05" value={volume}
              onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
              className="w-20 h-1 cursor-pointer accent-primary"
              aria-label="Volume soundscape"
            />
            <span className="text-xs text-muted-foreground">🔊</span>
          </div>
        )}
      </div>

      {/* Sound buttons row */}
      <div className="px-5 pb-5 flex items-center gap-2 overflow-x-auto scrollbar-none">
        {SOUNDS.map(s => (
          <button
            key={s.id}
            onClick={() => handleToggle(s.id)}
            className={`flex-shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-semibold transition-all duration-200 active:scale-95 ${
              activeSound === s.id
                ? "bg-primary text-primary-foreground shadow-soft"
                : "border border-border/60 bg-background hover:bg-cream-deep text-foreground"
            }`}
          >
            <span>{s.emoji}</span>
            <span>{s.label}</span>
          </button>
        ))}

        {activeSound && (
          <button
            onClick={stopAllAmbient}
            className="flex-shrink-0 h-8 w-8 rounded-full border border-destructive/30 flex items-center justify-center text-xs text-destructive hover:bg-destructive/5 active:scale-95 transition-all"
            title="Matikan"
          >
            ⏹
          </button>
        )}
      </div>
    </div>
  );
}
