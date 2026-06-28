/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

let audioCtx: AudioContext | null = null;
let masterGain: GainNode | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
      masterGain = audioCtx.createGain();
      masterGain.connect(audioCtx.destination);
      masterGain.gain.setValueAtTime(0.3, audioCtx.currentTime); // Standard comfortable volume
    }
  }
  // Resume context if suspended (browser security block)
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export function setVolume(volume: number) {
  const ctx = getAudioContext();
  if (ctx && masterGain) {
    masterGain.gain.setValueAtTime(Math.max(0, Math.min(1, volume)), ctx.currentTime);
  }
}

/**
 * Procedural Synthesized Sounds
 */

// Custom tone sound
export function playBeep(freq: number, duration: number, type: 'sine' | 'square' | 'triangle' | 'sawtooth' = 'sine') {
  const ctx = getAudioContext();
  if (!ctx || !masterGain) return;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = type;
  osc.frequency.setValueAtTime(freq, ctx.currentTime);

  gain.gain.setValueAtTime(0.15, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

  osc.connect(gain);
  gain.connect(masterGain);

  osc.start();
  osc.stop(ctx.currentTime + duration);
}

// Tick sound during multiplier increase
export function playTick(multiplier: number) {
  const ctx = getAudioContext();
  if (!ctx || !masterGain) return;

  // Scale frequency slightly with multiplier
  const baseFreq = 300 + Math.min(multiplier * 15, 600);
  playBeep(baseFreq, 0.05, 'triangle');
}

// Engine startup hum
export function playStartupBleep(prog: number) {
  const ctx = getAudioContext();
  if (!ctx || !masterGain) return;

  const freq = 150 + (prog * 3);
  playBeep(freq, 0.12, 'sine');
}

// Success chords on Cash Out
export function playSuccessCashout() {
  const ctx = getAudioContext();
  if (!ctx || !masterGain) return;

  const now = ctx.currentTime;
  const notes = [261.63, 329.63, 392.00, 523.25]; // C4, E4, G4, C5 major chord

  notes.forEach((freq, idx) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now + idx * 0.06);

    gain.gain.setValueAtTime(0.2, now + idx * 0.06);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5 + idx * 0.06);

    osc.connect(gain);
    gain.connect(masterGain);

    osc.start(now + idx * 0.06);
    osc.stop(now + 0.6 + idx * 0.06);
  });
}

// Synthesized Noise Explosion on Crash
export function playExplosion() {
  const ctx = getAudioContext();
  if (!ctx || !masterGain) return;

  const bufferSize = ctx.sampleRate * 0.6; // 0.6 seconds of noise
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);

  // Fill buffer with random noise (white noise)
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }

  const noiseNode = ctx.createBufferSource();
  noiseNode.buffer = buffer;

  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(1000, ctx.currentTime);
  filter.frequency.exponentialRampToValueAtTime(10, ctx.currentTime + 0.5);

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.4, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.55);

  noiseNode.connect(filter);
  filter.connect(gain);
  gain.connect(masterGain);

  noiseNode.start();
  noiseNode.stop(ctx.currentTime + 0.6);

  // Also play a low sub boom
  const subOsc = ctx.createOscillator();
  const subGain = ctx.createGain();

  subOsc.type = 'triangle';
  subOsc.frequency.setValueAtTime(120, ctx.currentTime);
  subOsc.frequency.linearRampToValueAtTime(20, ctx.currentTime + 0.4);

  subGain.gain.setValueAtTime(0.35, ctx.currentTime);
  subGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.45);

  subOsc.connect(subGain);
  subGain.connect(masterGain);

  subOsc.start();
  subOsc.stop(ctx.currentTime + 0.5);
}
