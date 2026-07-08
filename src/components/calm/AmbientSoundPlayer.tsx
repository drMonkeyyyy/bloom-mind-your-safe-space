import { useState, useEffect } from "react";
import { toast } from "sonner";
import { SOUNDS, SoundType, subscribeAudioState, toggleAmbientSound, setAmbientVolume, setChannelVolume, stopAllAmbient } from "@/lib/audio";

export function AmbientSoundPlayer() {
  const [activeChannels, setActiveChannels] = useState<Record<SoundType, number>>({
    rain: 0,
    waves: 0,
    forest: 0,
    wind: 0,
    whitenoise: 0,
    canon: 0,
  });
  const [masterVolume, setMasterVolume] = useState(0.5);

  useEffect(() => {
    const unsubscribe = subscribeAudioState((channels, masterVol) => {
      setActiveChannels(channels);
      setMasterVolume(masterVol);
    });
    return unsubscribe;
  }, []);

  const handleToggle = (sound: SoundType) => {
    try {
      toggleAmbientSound(sound);
    } catch (err) {
      console.error("Audio failed", err);
      toast.error("Gagal mengubah suara");
    }
  };

  const handleChannelVolumeChange = (sound: SoundType, vol: number) => {
    setChannelVolume(sound, vol);
  };

  const handleMasterVolumeChange = (vol: number) => {
    setAmbientVolume(vol);
  };

  const isAnySoundPlaying = Object.values(activeChannels).some((vol) => vol > 0);

  return (
    <div className="rounded-3xl bg-card ring-1 ring-border/60 shadow-card p-6 space-y-6 overflow-hidden animate-scale-in">
      {/* Header & Master Control */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border/40 pb-5">
        <div className="flex items-center gap-3">
          <div
            className={`grid h-12 w-12 place-items-center rounded-2xl text-2xl transition-all duration-500 shadow-sm ${
              isAnySoundPlaying ? "bg-primary-soft/80 text-primary animate-pulse" : "bg-cream-deep text-muted-foreground"
            }`}
          >
            {isAnySoundPlaying ? "🍃" : "🎵"}
          </div>
          <div>
            <h2 className="text-base font-semibold text-foreground">Mixer Suara Relaksasi</h2>
            <p className="text-xs text-muted-foreground">
              {isAnySoundPlaying 
                ? "Mixer suara aktif. Buat suasana tenang versi terbaikmu." 
                : "Pilih satu atau beberapa suara penenang di bawah ini."}
            </p>
          </div>
        </div>

        {/* Master volume controller */}
        <div className="flex items-center gap-3 bg-cream-deep/30 px-4 py-2.5 rounded-2xl border border-border/40 shrink-0 self-start sm:self-center">
          <button
            disabled={!isAnySoundPlaying}
            onClick={stopAllAmbient}
            className="grid h-7 w-7 place-items-center rounded-full bg-destructive/10 text-destructive hover:bg-destructive/20 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            title="Matikan semua suara"
          >
            ⏹
          </button>
          <div className="h-4 w-px bg-border/80" />
          <span className="text-xs">🔈</span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={masterVolume}
            onChange={(e) => handleMasterVolumeChange(parseFloat(e.target.value))}
            className="w-24 h-1 cursor-pointer accent-primary"
            aria-label="Master Volume"
          />
          <span className="text-xs">🔊</span>
        </div>
      </div>

      {/* Grid of Sound Channels */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
        {SOUNDS.map((s) => {
          const isPlaying = activeChannels[s.id] > 0;
          const channelVol = activeChannels[s.id] || 0.5;

          return (
            <div
              key={s.id}
              className={`relative flex flex-col p-4 rounded-3xl border transition-all duration-300 ${
                isPlaying
                  ? "bg-primary-soft/30 border-primary/20 shadow-sm"
                  : "bg-background border-border/60 hover:bg-cream-deep/20 hover:border-border"
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className={`text-2xl transition-transform duration-300 ${isPlaying ? "scale-110 animate-bounce [animation-duration:3s]" : ""}`}>
                    {s.emoji}
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm text-foreground">{s.label}</h3>
                    <p className="text-[10px] text-muted-foreground line-clamp-1">{s.desc}</p>
                  </div>
                </div>

                {/* Individual toggle */}
                <button
                  onClick={() => handleToggle(s.id)}
                  className={`grid h-8 w-8 place-items-center rounded-full transition-all duration-200 active:scale-90 ${
                    isPlaying
                      ? "bg-primary text-primary-foreground shadow-soft"
                      : "bg-cream-deep text-muted-foreground hover:bg-border"
                  }`}
                  title={isPlaying ? "Matikan" : "Nyalakan"}
                >
                  {isPlaying ? "⏸" : "▶"}
                </button>
              </div>

              {/* Slider appears if playing */}
              <div
                className={`mt-4 space-y-1 transition-all duration-300 ${
                  isPlaying ? "opacity-100 h-10 visible" : "opacity-0 h-0 invisible overflow-hidden"
                }`}
              >
                <div className="flex items-center justify-between text-[10px] text-muted-foreground font-medium">
                  <span>Volume</span>
                  <span>{Math.round(channelVol * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={channelVol}
                  onChange={(e) => handleChannelVolumeChange(s.id, parseFloat(e.target.value))}
                  className="w-full h-1 cursor-pointer accent-primary"
                  aria-label={`Volume ${s.label}`}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
