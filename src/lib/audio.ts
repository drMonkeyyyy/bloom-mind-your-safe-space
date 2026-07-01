// Global Audio Engine for Bloom Mind Ambient Soundscapes
export type SoundType = "rain" | "waves" | "forest" | "wind" | "whitenoise";

export const SOUNDS: { id: SoundType; emoji: string; label: string; desc: string }[] = [
  { id: "rain",       emoji: "🌧️", label: "Hujan",       desc: "Suara rintik hujan yang menenangkan" },
  { id: "waves",      emoji: "🌊", label: "Ombak",       desc: "Deburan ombak laut berirama" },
  { id: "forest",     emoji: "🌲", label: "Hutan",       desc: "Kicauan burung & gemericik angin" },
  { id: "wind",       emoji: "💨", label: "Angin",       desc: "Hembusan angin sepoi yang sejuk" },
  { id: "whitenoise", emoji: "🌫️", label: "White Noise", desc: "Suara putih untuk fokus & tidur" },
];

declare global {
  interface Window {
    __bloomAudioCtx?: AudioContext;
    __bloomSource?: AudioBufferSourceNode;
    __bloomGain?: GainNode;
    __bloomModInterval?: ReturnType<typeof setInterval>;
    __bloomActiveSound?: SoundType | null;
    __bloomVolume?: number;
    __bloomListeners?: Set<(sound: SoundType | null, volume: number) => void>;
  }
}

// Add state change listener support
const getListeners = () => {
  if (!window.__bloomListeners) {
    window.__bloomListeners = new Set();
  }
  return window.__bloomListeners;
};

export const subscribeAudioState = (cb: (sound: SoundType | null, volume: number) => void) => {
  const listeners = getListeners();
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
};

const notifyListeners = () => {
  const sound = window.__bloomActiveSound || null;
  const vol = typeof window.__bloomVolume === "number" ? window.__bloomVolume : 0.5;
  getListeners().forEach((cb) => cb(sound, vol));
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

export const stopAllAmbient = () => {
  try { window.__bloomSource?.stop(); } catch (e) {}
  window.__bloomSource = undefined;
  window.__bloomGain = undefined;
  if (window.__bloomModInterval) {
    clearInterval(window.__bloomModInterval);
    window.__bloomModInterval = undefined;
  }
  window.__bloomActiveSound = null;
  notifyListeners();
};

export const setAmbientVolume = (vol: number) => {
  window.__bloomVolume = vol;
  if (window.__bloomGain && window.__bloomAudioCtx) {
    // Some sounds scale the master volume, let's keep master gain responsive
    const sound = window.__bloomActiveSound;
    let factor = 1.0;
    if (sound === "rain") factor = 0.4;
    else if (sound === "waves") factor = 0.18; // base gain factor
    else if (sound === "forest") factor = 0.15;
    else if (sound === "wind") factor = 0.2;
    else if (sound === "whitenoise") factor = 0.12;
    
    window.__bloomGain.gain.setTargetAtTime(vol * factor, window.__bloomAudioCtx.currentTime, 0.1);
  }
  notifyListeners();
};

export const playAmbientSound = (sound: SoundType) => {
  stopAllAmbient();
  const ctx = initCtx();
  const masterGain = ctx.createGain();
  masterGain.connect(ctx.destination);
  window.__bloomGain = masterGain;

  const currentVol = typeof window.__bloomVolume === "number" ? window.__bloomVolume : 0.5;

  if (sound === "rain") {
    const src = ctx.createBufferSource();
    src.buffer = createNoiseBuffer(ctx, "brown");
    src.loop = true;
    const lp = ctx.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 900;
    src.connect(lp); lp.connect(masterGain);
    masterGain.gain.value = currentVol * 0.4;
    src.start();
    window.__bloomSource = src;
    let tick = 0;
    window.__bloomModInterval = setInterval(() => {
      const v = 0.35 + 0.1 * Math.sin((2 * Math.PI * tick) / 60);
      masterGain.gain.setTargetAtTime(v * currentVol, ctx.currentTime, 0.5);
      tick++;
    }, 200);

  } else if (sound === "waves") {
    const src = ctx.createBufferSource();
    src.buffer = createNoiseBuffer(ctx, "brown");
    src.loop = true;
    const lp = ctx.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 450;
    src.connect(lp); lp.connect(masterGain);
    masterGain.gain.value = 0.05;
    src.start();
    window.__bloomSource = src;
    let tick = 0;
    window.__bloomModInterval = setInterval(() => {
      const v = 0.18 + 0.15 * Math.sin((2 * Math.PI * tick) / 80);
      masterGain.gain.setTargetAtTime(v * currentVol, ctx.currentTime, 0.1);
      tick = (tick + 1) % 80;
    }, 100);

  } else if (sound === "forest") {
    const src = ctx.createBufferSource();
    src.buffer = createNoiseBuffer(ctx, "pink");
    src.loop = true;
    const lp = ctx.createBiquadFilter(); lp.type = "bandpass"; lp.frequency.value = 1800; lp.Q.value = 0.5;
    src.connect(lp); lp.connect(masterGain);
    masterGain.gain.value = currentVol * 0.15;
    src.start();
    window.__bloomSource = src;
    const makeChirp = (freq: number, delay: number) => {
      setTimeout(() => {
        if (!window.__bloomAudioCtx) return;
        const c = window.__bloomAudioCtx;
        const osc = c.createOscillator();
        const g = c.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, c.currentTime);
        osc.frequency.exponentialRampToValueAtTime(freq * 1.35, c.currentTime + 0.08);
        osc.frequency.exponentialRampToValueAtTime(freq, c.currentTime + 0.2);
        g.gain.setValueAtTime(0, c.currentTime);
        g.gain.linearRampToValueAtTime(currentVol * 0.06, c.currentTime + 0.02);
        g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.25);
        osc.connect(g); g.connect(c.destination);
        osc.start(); osc.stop(c.currentTime + 0.28);
      }, delay);
    };
    window.__bloomModInterval = setInterval(() => {
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
    src.connect(hp); hp.connect(lp); lp.connect(masterGain);
    masterGain.gain.value = currentVol * 0.2;
    src.start();
    window.__bloomSource = src;
    let tick = 0;
    window.__bloomModInterval = setInterval(() => {
      const v = 0.12 + 0.12 * (0.5 + 0.5 * Math.sin((2 * Math.PI * tick) / 200));
      masterGain.gain.setTargetAtTime(v * currentVol, ctx.currentTime, 1.5);
      tick++;
    }, 100);

  } else if (sound === "whitenoise") {
    const src = ctx.createBufferSource();
    src.buffer = createNoiseBuffer(ctx, "white");
    src.loop = true;
    const lp = ctx.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 6000;
    src.connect(lp); lp.connect(masterGain);
    masterGain.gain.value = currentVol * 0.12;
    src.start();
    window.__bloomSource = src;
  }

  window.__bloomActiveSound = sound;
  notifyListeners();
};

export const toggleAmbientSound = (sound: SoundType) => {
  if (window.__bloomActiveSound === sound) {
    stopAllAmbient();
  } else {
    playAmbientSound(sound);
  }
};
