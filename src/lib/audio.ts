// Global Audio Engine for JN-CALM Ambient Soundscapes (Multi-channel Mixer)
export type SoundType = "rain" | "waves" | "forest" | "wind" | "whitenoise" | "piano" | "guitar";

export const SOUNDS: { id: SoundType; emoji: string; label: string; desc: string }[] = [
  { id: "rain",       emoji: "🌧️", label: "Hujan",       desc: "Suara rintik hujan yang menenangkan" },
  { id: "waves",      emoji: "🌊", label: "Ombak",       desc: "Deburan ombak laut berirama" },
  { id: "forest",     emoji: "🌲", label: "Hutan",       desc: "Kicauan burung & gemericik angin" },
  { id: "wind",       emoji: "💨", label: "Angin",       desc: "Hembusan angin sepoi yang sejuk" },
  { id: "whitenoise", emoji: "🌫️", label: "White Noise", desc: "Suara putih untuk fokus & tidur" },
  { id: "piano",      emoji: "🎹", label: "Melodi Piano", desc: "Suara piano ambient yang menenteramkan" },
  { id: "guitar",     emoji: "🎸", label: "Gitar Akustik", desc: "Petikan gitar akustik yang menenangkan" },
];

export interface ActiveSoundChannel {
  source: AudioBufferSourceNode;
  gainNode: GainNode;
  interval?: ReturnType<typeof setInterval>;
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
    piano: 0,
    guitar: 0,
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
    if (window.__bloomChannels) {
      delete window.__bloomChannels[sound];
    }
  }
};

const updateChannelGain = (sound: SoundType) => {
  const channel = window.__bloomChannels?.[sound];
  if (!channel || !window.__bloomAudioCtx) return;

  const localVol = window.__bloomChannelVolumes?.[sound] ?? 0.5;
  
  let factor = 1.0;
  if (sound === "rain") factor = 0.45;
  else if (sound === "waves") factor = 0.35;
  else if (sound === "forest") factor = 0.25;
  else if (sound === "wind") factor = 0.35;
  else if (sound === "whitenoise") factor = 0.2;
  else if (sound === "piano") factor = 0.70;
  else if (sound === "guitar") factor = 0.70;

  channel.gainNode.gain.setTargetAtTime(localVol * factor, window.__bloomAudioCtx.currentTime, 0.1);
};

export const setAmbientVolume = (vol: number) => {
  window.__bloomMasterVolume = vol;
  const ctx = window.__bloomAudioCtx;
  if (ctx) {
    const masterGain = getMasterGain(ctx);
    masterGain.gain.setTargetAtTime(vol, ctx.currentTime, 0.15);
  }
  notifyListeners();
};

export const setChannelVolume = (sound: SoundType, vol: number) => {
  if (!window.__bloomChannelVolumes) {
    window.__bloomChannelVolumes = { rain: 0.5, waves: 0.5, forest: 0.5, wind: 0.5, whitenoise: 0.5, piano: 0.5, guitar: 0.5 };
  }
  window.__bloomChannelVolumes[sound] = vol;
  updateChannelGain(sound);
  notifyListeners();
};

export const playAmbientSound = (sound: SoundType) => {
  const ctx = initCtx();
  const masterGain = getMasterGain(ctx);

  if (!window.__bloomChannels) {
    window.__bloomChannels = {};
  }
  if (!window.__bloomChannelVolumes) {
    window.__bloomChannelVolumes = { rain: 0.5, waves: 0.5, forest: 0.5, wind: 0.5, whitenoise: 0.5, piano: 0.5, guitar: 0.5 };
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
  } else if (sound === "piano") {
    const src = ctx.createBufferSource();
    src.buffer = ctx.createBuffer(1, 1, ctx.sampleRate);
    src.loop = true;
    src.connect(channelGain);
    sourceNode = src;
    src.start();

    // Calming chord progression: Cmaj9 -> Fmaj7 -> Am9 -> Gsus4
    const progression = [
      [261.63, 329.63, 392.00, 493.88, 523.25], // Cmaj9 (C4, E4, G4, B4, C5)
      [349.23, 440.00, 523.25, 659.25, 698.46], // Fmaj7 (F4, A4, C5, E5, F5)
      [220.00, 329.63, 392.00, 440.00, 523.25], // Am9 (A3, E4, G4, A4, C5)
      [293.66, 392.00, 440.00, 587.33, 783.99]  // Gsus4 (D4, G4, A4, D5, G5)
    ];

    let chordIdx = 0;
    
    const playPianoNote = (freq: number, delay: number, volume: number) => {
      setTimeout(() => {
        if (!window.__bloomAudioCtx || !window.__bloomChannels?.["piano"]) return;
        const c = window.__bloomAudioCtx;
        const curLocalVol = window.__bloomChannelVolumes?.["piano"] ?? 0.5;
        
        const osc1 = c.createOscillator();
        const osc2 = c.createOscillator();
        const g = c.createGain();
        const filter = c.createBiquadFilter();

        osc1.type = "triangle";
        osc1.frequency.setValueAtTime(freq, c.currentTime);
        osc1.detune.setValueAtTime(-4, c.currentTime);

        osc2.type = "sine";
        osc2.frequency.setValueAtTime(freq * 2, c.currentTime);
        osc2.detune.setValueAtTime(4, c.currentTime);

        filter.type = "lowpass";
        filter.frequency.setValueAtTime(1500, c.currentTime);
        filter.frequency.exponentialRampToValueAtTime(150, c.currentTime + 1.2);

        g.gain.setValueAtTime(0, c.currentTime);
        g.gain.linearRampToValueAtTime(volume * curLocalVol * 0.28, c.currentTime + 0.04);
        g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 3.0);

        osc1.connect(filter);
        osc2.connect(filter);
        filter.connect(g);
        g.connect(channelGain);

        osc1.start();
        osc2.start();
        osc1.stop(c.currentTime + 3.2);
        osc2.stop(c.currentTime + 3.2);
      }, delay);
    };

    const triggerChord = () => {
      const chord = progression[chordIdx];
      chord.forEach((freq, index) => {
        const arpeggioDelay = index * 180 + Math.random() * 40;
        const noteVol = 0.7 - (index * 0.08);
        playPianoNote(freq, arpeggioDelay, noteVol);
      });
      chordIdx = (chordIdx + 1) % progression.length;
    };

    triggerChord();

    intervalId = setInterval(() => {
      triggerChord();
    }, 5500);

  } else if (sound === "guitar") {
    const src = ctx.createBufferSource();
    src.buffer = ctx.createBuffer(1, 1, ctx.sampleRate);
    src.loop = true;
    src.connect(channelGain);
    sourceNode = src;
    src.start();

    const guitarProgression = [
      [130.81, 196.00, 261.63, 329.63, 392.00], // C (C3, G3, C4, E4, G4)
      [146.83, 220.00, 293.66, 349.23, 440.00], // Dm (D3, A3, D4, F4, A4)
      [174.61, 261.63, 349.23, 440.00, 523.25], // F (F3, C4, F4, A4, C5)
      [196.00, 293.66, 392.00, 493.88, 587.33]  // G (G3, D4, G4, B4, D5)
    ];

    let guitarChordIdx = 0;

    const playGuitarNote = (freq: number, delay: number, volume: number) => {
      setTimeout(() => {
        if (!window.__bloomAudioCtx || !window.__bloomChannels?.["guitar"]) return;
        const c = window.__bloomAudioCtx;
        const curLocalVol = window.__bloomChannelVolumes?.["guitar"] ?? 0.5;

        const osc1 = c.createOscillator();
        const osc2 = c.createOscillator();
        const g = c.createGain();
        const filter = c.createBiquadFilter();

        osc1.type = "triangle";
        osc1.frequency.setValueAtTime(freq, c.currentTime);
        osc1.detune.setValueAtTime(-8, c.currentTime);

        osc2.type = "sawtooth";
        osc2.frequency.setValueAtTime(freq, c.currentTime);
        osc2.detune.setValueAtTime(8, c.currentTime);

        filter.type = "lowpass";
        filter.frequency.setValueAtTime(2000, c.currentTime);
        filter.frequency.exponentialRampToValueAtTime(120, c.currentTime + 0.8);

        g.gain.setValueAtTime(0, c.currentTime);
        g.gain.linearRampToValueAtTime(volume * curLocalVol * 0.16, c.currentTime + 0.006);
        g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 2.5);

        osc1.connect(filter);
        const sawGain = c.createGain();
        sawGain.gain.setValueAtTime(0.15, c.currentTime);
        osc2.connect(sawGain);
        sawGain.connect(filter);
        
        filter.connect(g);
        g.connect(channelGain);

        osc1.start();
        osc2.start();
        osc1.stop(c.currentTime + 2.8);
        osc2.stop(c.currentTime + 2.8);
      }, delay);
    };

    const triggerGuitarChord = () => {
      const chord = guitarProgression[guitarChordIdx];
      chord.forEach((freq, index) => {
        const pluckDelay = index * 140 + Math.random() * 30;
        const noteVol = 0.8 - (index * 0.05);
        playGuitarNote(freq, pluckDelay, noteVol);
      });
      guitarChordIdx = (guitarChordIdx + 1) % guitarProgression.length;
    };

    triggerGuitarChord();

    intervalId = setInterval(() => {
      triggerGuitarChord();
    }, 4800);

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
