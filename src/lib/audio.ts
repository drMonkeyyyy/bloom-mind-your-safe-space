// Global Audio Engine for JN-CALM Ambient Soundscapes (Multi-channel Mixer)
export type SoundType = "rain" | "waves" | "forest" | "wind" | "whitenoise" | "canon";

export const SOUNDS: { id: SoundType; emoji: string; label: string; desc: string }[] = [
  { id: "rain",       emoji: "🌧️", label: "Hujan",       desc: "Suara rintik hujan yang menenangkan" },
  { id: "waves",      emoji: "🌊", label: "Ombak",       desc: "Deburan ombak laut berirama" },
  { id: "forest",     emoji: "🌲", label: "Hutan",       desc: "Kicauan burung & gemericik angin" },
  { id: "wind",       emoji: "💨", label: "Angin",       desc: "Hembusan angin sepoi yang sejuk" },
  { id: "whitenoise", emoji: "🌫️", label: "White Noise", desc: "Suara putih untuk fokus & tidur" },
  { id: "canon",      emoji: "🎻", label: "Canon in D",   desc: "LAYERS CLASSIC (Violin, Cello, Piano)" },
];

export interface ActiveSoundChannel {
  source: AudioBufferSourceNode;
  gainNode: GainNode;
  interval?: ReturnType<typeof setInterval>;
  timeouts?: any[];
}

declare global {
  interface Window {
    __bloomAudioCtx?: AudioContext;
    __bloomMasterGain?: GainNode;
    __bloomChannels?: Partial<Record<SoundType, ActiveSoundChannel>>;
    __bloomChannelVolumes?: Record<SoundType, number>;
    __bloomMasterVolume?: number;
    __bloomListeners?: Set<(channels: Record<SoundType, number>, masterVolume: number) => void>;
  }
}

// Add state change listener support
const getListeners = () => {
  if (!window.__bloomListeners) {
    window.__bloomListeners = new Set();
  }
  return window.__bloomListeners;
};

export const subscribeAudioState = (cb: (channels: Record<SoundType, number>, masterVolume: number) => void) => {
  const listeners = getListeners();
  listeners.add(cb);
  // Initial fire
  cb(getChannelVolumesState(), getMasterVolumeState());
  return () => {
    listeners.delete(cb);
  };
};

const getChannelVolumesState = (): Record<SoundType, number> => {
  const state: Record<SoundType, number> = {
    rain: 0,
    waves: 0,
    forest: 0,
    wind: 0,
    whitenoise: 0,
    canon: 0,
  };
  if (window.__bloomChannels && window.__bloomChannelVolumes) {
    for (const key of Object.keys(state) as SoundType[]) {
      if (window.__bloomChannels[key]) {
        state[key] = window.__bloomChannelVolumes[key] ?? 0.5;
      }
    }
  }
  return state;
};

const getMasterVolumeState = (): number => {
  return typeof window.__bloomMasterVolume === "number" ? window.__bloomMasterVolume : 0.5;
};

const notifyListeners = () => {
  const channels = getChannelVolumesState();
  const vol = getMasterVolumeState();
  getListeners().forEach((cb) => cb(channels, vol));
};

function createNoiseBuffer(ctx: AudioContext, type: "brown" | "white" | "pink") {
  const bufferSize = 2 * ctx.sampleRate;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  let lastOut = 0.0;
  let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0;
  for (let i = 0; i < bufferSize; i++) {
    const white = Math.random() * 2 - 1;
    if (type === "brown") {
      data[i] = (lastOut + (0.02 * white)) / 1.02;
      lastOut = data[i];
      data[i] *= 3.5;
    } else if (type === "pink") {
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + white * 0.5362) * 0.11;
    } else {
      data[i] = white;
    }
  }
  return buffer;
}

export const initCtx = () => {
  if (!window.__bloomAudioCtx) {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    window.__bloomAudioCtx = new AudioCtx();
  }
  if (window.__bloomAudioCtx.state === "suspended") {
    window.__bloomAudioCtx.resume();
  }
  return window.__bloomAudioCtx;
};

const getMasterGain = (ctx: AudioContext) => {
  if (!window.__bloomMasterGain) {
    const masterGain = ctx.createGain();
    masterGain.connect(ctx.destination);
    const masterVol = typeof window.__bloomMasterVolume === "number" ? window.__bloomMasterVolume : 0.5;
    masterGain.gain.setValueAtTime(masterVol, ctx.currentTime);
    window.__bloomMasterGain = masterGain;
  }
  return window.__bloomMasterGain;
};

export const stopAllAmbient = () => {
  if (window.__bloomChannels) {
    const keys = Object.keys(window.__bloomChannels) as SoundType[];
    for (const key of keys) {
      stopChannel(key);
    }
  }
  notifyListeners();
};

const stopChannel = (sound: SoundType) => {
  const channel = window.__bloomChannels?.[sound];
  if (channel) {
    try { channel.source.stop(); } catch (e) {}
    if (channel.interval) {
      clearInterval(channel.interval);
    }
    if (channel.timeouts) {
      channel.timeouts.forEach(t => clearTimeout(t));
    }
    if (window.__bloomChannels) {
      delete window.__bloomChannels[sound];
    }
  }

  if (sound === "canon") {
    const player = (window as any).__bloomYoutubePlayer;
    if (player && typeof player.pauseVideo === "function") {
      player.pauseVideo();
    }
  }
};

const updateChannelGain = (sound: SoundType) => {
  if (sound === "canon") {
    const player = (window as any).__bloomYoutubePlayer;
    if (player && typeof player.setVolume === "function") {
      const localVol = window.__bloomChannelVolumes?.["canon"] ?? 0.5;
      const masterVol = typeof window.__bloomMasterVolume === "number" ? window.__bloomMasterVolume : 0.5;
      player.setVolume(Math.round(localVol * masterVol * 100));
    }
    return;
  }

  const channel = window.__bloomChannels?.[sound];
  if (!channel || !window.__bloomAudioCtx) return;

  const localVol = window.__bloomChannelVolumes?.[sound] ?? 0.5;
  
  let factor = 1.0;
  if (sound === "rain") factor = 0.45;
  else if (sound === "waves") factor = 0.35;
  else if (sound === "forest") factor = 0.25;
  else if (sound === "wind") factor = 0.35;
  else if (sound === "whitenoise") factor = 0.2;

  channel.gainNode.gain.setTargetAtTime(localVol * factor, window.__bloomAudioCtx.currentTime, 0.1);
};

export const setAmbientVolume = (vol: number) => {
  window.__bloomMasterVolume = vol;
  const ctx = window.__bloomAudioCtx;
  if (ctx) {
    const masterGain = getMasterGain(ctx);
    masterGain.gain.setTargetAtTime(vol, ctx.currentTime, 0.15);
  }

  // Update youtube player volume if active
  const player = (window as any).__bloomYoutubePlayer;
  if (player && typeof player.setVolume === "function") {
    const localVol = window.__bloomChannelVolumes?.["canon"] ?? 0.5;
    player.setVolume(Math.round(localVol * vol * 100));
  }

  notifyListeners();
};

export const setChannelVolume = (sound: SoundType, vol: number) => {
  if (!window.__bloomChannelVolumes) {
    window.__bloomChannelVolumes = { rain: 0.5, waves: 0.5, forest: 0.5, wind: 0.5, whitenoise: 0.5, canon: 0.5 };
  }
  window.__bloomChannelVolumes[sound] = vol;
  updateChannelGain(sound);
  notifyListeners();
};

const initYoutubePlayer = (callback: (player: any) => void) => {
  const existingPlayer = (window as any).__bloomYoutubePlayer;
  if (existingPlayer) {
    callback(existingPlayer);
    return;
  }

  // 1. Check if the script is already added
  let script = document.getElementById("youtube-iframe-api") as HTMLScriptElement;
  if (!script) {
    script = document.createElement("script");
    script.id = "youtube-iframe-api";
    script.src = "https://www.youtube.com/iframe_api";
    document.head.appendChild(script);
  }

  // 2. Create the hidden container if not exists
  let container = document.getElementById("bloom-yt-container");
  if (!container) {
    container = document.createElement("div");
    container.id = "bloom-yt-container";
    container.style.position = "absolute";
    container.style.top = "-9999px";
    container.style.left = "-9999px";
    container.style.width = "200px";
    container.style.height = "200px";
    container.style.opacity = "0.001";
    container.style.pointerEvents = "none";
    document.body.appendChild(container);
  }

  // Define the global callback that YT API calls when loaded
  const onAPIReady = () => {
    const YT = (window as any).YT;
    if (!YT) return;
    
    const player = new YT.Player("bloom-yt-container", {
      videoId: "SjYecEQFL0U",
      playerVars: {
        autoplay: 1,
        loop: 1,
        playlist: "SjYecEQFL0U", // required for looping single video
        controls: 0,
        disablekb: 1,
        fs: 0,
        modestbranding: 1,
        rel: 0,
        playsinline: 1
      },
      events: {
        onReady: () => {
          (window as any).__bloomYoutubePlayer = player;
          callback(player);
        }
      }
    });
  };

  if ((window as any).YT && (window as any).YT.Player) {
    onAPIReady();
  } else {
    // If API is loading, wait for onYouTubeIframeAPIReady
    const prevReady = (window as any).onYouTubeIframeAPIReady;
    (window as any).onYouTubeIframeAPIReady = () => {
      if (prevReady) prevReady();
      onAPIReady();
    };
  }
};

export const playAmbientSound = (sound: SoundType) => {
  const ctx = initCtx();
  const masterGain = getMasterGain(ctx);

  if (!window.__bloomChannels) {
    window.__bloomChannels = {};
  }
  if (!window.__bloomChannelVolumes) {
    window.__bloomChannelVolumes = { rain: 0.5, waves: 0.5, forest: 0.5, wind: 0.5, whitenoise: 0.5, canon: 0.5 };
  }

  // If already playing, do nothing
  if (window.__bloomChannels[sound]) return;

  const channelGain = ctx.createGain();
  channelGain.connect(masterGain);

  let sourceNode: AudioBufferSourceNode;
  let intervalId: ReturnType<typeof setInterval> | undefined;

  const localVol = window.__bloomChannelVolumes[sound] ?? 0.5;

  if (sound === "rain") {
    const src = ctx.createBufferSource();
    src.buffer = createNoiseBuffer(ctx, "brown");
    src.loop = true;
    const lp = ctx.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 900;
    src.connect(lp); lp.connect(channelGain);
    sourceNode = src;
    
    // Initial gain
    channelGain.gain.value = localVol * 0.45;
    src.start();

    let tick = 0;
    intervalId = setInterval(() => {
      if (!window.__bloomChannels?.["rain"]) return;
      const curLocalVol = window.__bloomChannelVolumes?.["rain"] ?? 0.5;
      const v = 0.35 + 0.1 * Math.sin((2 * Math.PI * tick) / 60);
      channelGain.gain.setTargetAtTime(v * curLocalVol * 0.45, ctx.currentTime, 0.5);
      tick++;
    }, 200);

  } else if (sound === "waves") {
    const src = ctx.createBufferSource();
    src.buffer = createNoiseBuffer(ctx, "brown");
    src.loop = true;
    const lp = ctx.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 450;
    src.connect(lp); lp.connect(channelGain);
    sourceNode = src;

    channelGain.gain.value = localVol * 0.35;
    src.start();

    let tick = 0;
    intervalId = setInterval(() => {
      if (!window.__bloomChannels?.["waves"]) return;
      const curLocalVol = window.__bloomChannelVolumes?.["waves"] ?? 0.5;
      const v = 0.18 + 0.15 * Math.sin((2 * Math.PI * tick) / 80);
      channelGain.gain.setTargetAtTime(v * curLocalVol * 2.0 * 0.35, ctx.currentTime, 0.15);
      tick = (tick + 1) % 80;
    }, 100);

  } else if (sound === "forest") {
    const src = ctx.createBufferSource();
    src.buffer = createNoiseBuffer(ctx, "pink");
    src.loop = true;
    const lp = ctx.createBiquadFilter(); lp.type = "bandpass"; lp.frequency.value = 1800; lp.Q.value = 0.5;
    src.connect(lp); lp.connect(channelGain);
    sourceNode = src;

    channelGain.gain.value = localVol * 0.25;
    src.start();

    const makeChirp = (freq: number, delay: number) => {
      setTimeout(() => {
        if (!window.__bloomAudioCtx || !window.__bloomChannels?.["forest"]) return;
        const c = window.__bloomAudioCtx;
        const curLocalVol = window.__bloomChannelVolumes?.["forest"] ?? 0.5;
        const osc = c.createOscillator();
        const g = c.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, c.currentTime);
        osc.frequency.exponentialRampToValueAtTime(freq * 1.35, c.currentTime + 0.08);
        osc.frequency.exponentialRampToValueAtTime(freq, c.currentTime + 0.2);
        g.gain.setValueAtTime(0, c.currentTime);
        g.gain.linearRampToValueAtTime(curLocalVol * 0.06, c.currentTime + 0.02);
        g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.25);
        osc.connect(g); g.connect(channelGain); // connect to channel gain!
        osc.start(); osc.stop(c.currentTime + 0.28);
      }, delay);
    };

    intervalId = setInterval(() => {
      if (Math.random() < 0.35) {
        const freq = 1800 + Math.random() * 1400;
        makeChirp(freq, 0);
        if (Math.random() < 0.5) makeChirp(freq * 1.1, 350);
      }
    }, 1200);

  } else if (sound === "wind") {
    const src = ctx.createBufferSource();
    src.buffer = createNoiseBuffer(ctx, "pink");
    src.loop = true;
    const hp = ctx.createBiquadFilter(); hp.type = "highpass"; hp.frequency.value = 200;
    const lp = ctx.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 2000;
    src.connect(hp); hp.connect(lp); lp.connect(channelGain);
    sourceNode = src;

    channelGain.gain.value = localVol * 0.35;
    src.start();

    let tick = 0;
    intervalId = setInterval(() => {
      if (!window.__bloomChannels?.["wind"]) return;
      const curLocalVol = window.__bloomChannelVolumes?.["wind"] ?? 0.5;
      const v = 0.12 + 0.12 * (0.5 + 0.5 * Math.sin((2 * Math.PI * tick) / 200));
      channelGain.gain.setTargetAtTime(v * curLocalVol * 2.0 * 0.35, ctx.currentTime, 1.5);
      tick++;
    }, 100);

  } else if (sound === "whitenoise") {
    const src = ctx.createBufferSource();
    src.buffer = createNoiseBuffer(ctx, "white");
    src.loop = true;
    const lp = ctx.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 6000;
    src.connect(lp); lp.connect(channelGain);
    sourceNode = src;

    channelGain.gain.value = localVol * 0.2;
    src.start();
  } else if (sound === "canon") {
    // Create a dummy source node to register the canon channel in our mixer state
    const src = ctx.createBufferSource();
    src.buffer = ctx.createBuffer(1, 1, ctx.sampleRate);
    src.loop = true;
    src.connect(channelGain);
    sourceNode = src;
    src.start();

    // Initialize & Play the YouTube Player
    initYoutubePlayer((player) => {
      const curLocalVol = window.__bloomChannelVolumes?.["canon"] ?? 0.5;
      const masterVol = typeof window.__bloomMasterVolume === "number" ? window.__bloomMasterVolume : 0.5;
      player.setVolume(Math.round(curLocalVol * masterVol * 100));
      player.playVideo();
    });

  } else {
    return; // Fallback safety
  }

  window.__bloomChannels[sound] = {
    source: sourceNode,
    gainNode: channelGain,
    interval: intervalId
  };

  notifyListeners();
};

export const toggleAmbientSound = (sound: SoundType) => {
  if (window.__bloomChannels?.[sound]) {
    stopChannel(sound);
    notifyListeners();
  } else {
    playAmbientSound(sound);
  }
};
