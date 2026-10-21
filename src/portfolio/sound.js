// Tiny synthesized sound effects — no audio files needed.

let ctx = null;
let master = null;
let noise = null;
let hum = null;
let muted = false;
const VOLUME = 0.7;

try { muted = localStorage.getItem('portfolio-muted') === '1'; } catch { /* storage unavailable */ }

function noiseBuffer() {
  if (noise) return noise;
  noise = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
  const d = noise.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  return noise;
}

function envGain(peak, attack, release, at = ctx.currentTime) {
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, at);
  g.gain.exponentialRampToValueAtTime(peak, at + attack);
  g.gain.exponentialRampToValueAtTime(0.0001, at + attack + release);
  g.connect(master);
  return g;
}

function tone(type, freq, peak, attack, release, at = ctx.currentTime, freqEnd) {
  const o = ctx.createOscillator();
  o.type = type;
  o.frequency.setValueAtTime(freq, at);
  if (freqEnd) o.frequency.exponentialRampToValueAtTime(freqEnd, at + attack + release);
  o.connect(envGain(peak, attack, release, at));
  o.start(at);
  o.stop(at + attack + release + 0.05);
}

export const sfx = {
  // Set while skipping the intro so one-shot effects stay silent.
  quiet: false,

  init() {
    if (ctx) { ctx.resume(); return; }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = muted ? 0 : VOLUME;
    master.connect(ctx.destination);
  },

  get muted() { return muted; },

  toggleMute() {
    muted = !muted;
    try { localStorage.setItem('portfolio-muted', muted ? '1' : '0'); } catch { /* ignore */ }
    if (ctx) master.gain.setTargetAtTime(muted ? 0 : VOLUME, ctx.currentTime, 0.05);
    return muted;
  },

  ready() { return ctx && !this.quiet; },

  footstep() {
    if (!this.ready()) return;
    const src = ctx.createBufferSource();
    src.buffer = noiseBuffer();
    const f = ctx.createBiquadFilter();
    f.type = 'lowpass';
    f.frequency.value = 350 + Math.random() * 250;
    src.connect(f).connect(envGain(0.55, 0.004, 0.13));
    src.start(ctx.currentTime, Math.random());
    src.stop(ctx.currentTime + 0.2);
    tone('sine', 70 + Math.random() * 20, 0.25, 0.004, 0.08);
  },

  creak() {
    if (!this.ready()) return;
    const t = ctx.currentTime;
    [0, 0.35].forEach((d, i) => {
      const o = ctx.createOscillator();
      o.type = 'sawtooth';
      o.frequency.setValueAtTime(110 + i * 30, t + d);
      o.frequency.linearRampToValueAtTime(170 + i * 20, t + d + 0.3);
      const f = ctx.createBiquadFilter();
      f.type = 'bandpass';
      f.frequency.value = 1100;
      f.Q.value = 9;
      o.connect(f).connect(envGain(0.06, 0.05, 0.3, t + d));
      o.start(t + d);
      o.stop(t + d + 0.45);
    });
    // fabric "thump" of sitting down
    const src = ctx.createBufferSource();
    src.buffer = noiseBuffer();
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 220;
    src.connect(lp).connect(envGain(0.6, 0.02, 0.35, t + 0.9));
    src.start(t + 0.9);
    src.stop(t + 1.4);
  },

  click() {
    if (!this.ready()) return;
    const t = ctx.currentTime;
    tone('square', 2400, 0.08, 0.001, 0.02, t);
    tone('square', 1500, 0.06, 0.001, 0.02, t + 0.06);
    tone('sine', 120, 0.2, 0.002, 0.06, t);
  },

  beep() {
    if (!this.ready()) return;
    tone('square', 1000, 0.05, 0.005, 0.14);
  },

  chime() {
    if (!this.ready()) return;
    const t = ctx.currentTime;
    [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => {
      tone('sine', f, 0.09, 0.02, 1.6, t + i * 0.09);
      tone('triangle', f * 2, 0.02, 0.02, 0.8, t + i * 0.09);
    });
  },

  powerDown() {
    if (!this.ready()) return;
    tone('sine', 600, 0.08, 0.01, 0.5, ctx.currentTime, 120);
  },

  ui() {
    if (!this.ready()) return;
    tone('triangle', 1500, 0.035, 0.002, 0.04);
  },

  // Continuous PC fan hum. Ignores `quiet` since it's ambience.
  hum(on) {
    if (!ctx) return;
    if (on && !hum) {
      const src = ctx.createBufferSource();
      src.buffer = noiseBuffer();
      src.loop = true;
      const lp = ctx.createBiquadFilter();
      lp.type = 'lowpass';
      lp.frequency.value = 260;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.09, ctx.currentTime + 1.5);
      src.connect(lp).connect(g).connect(master);
      src.start();
      hum = { src, g };
    } else if (!on && hum) {
      const { src, g } = hum;
      g.gain.setTargetAtTime(0.0001, ctx.currentTime, 0.4);
      src.stop(ctx.currentTime + 2);
      hum = null;
    }
  },
};
