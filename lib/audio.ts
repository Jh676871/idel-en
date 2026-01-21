"use client";

export type SfxType = 'click' | 'hover' | 'success' | 'error' | 'select' | 'gacha_shake' | 'gacha_open' | 'gacha_reveal';

export function playSfx(type: SfxType) {
  if (typeof window === 'undefined') return;

  const fileSrc = `/assets/audio/sfx/${type}.mp3`;

  const playSynth = () => {
    try {
      const AudioContextCtor = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextCtor) return;

      const ctx = new AudioContextCtor();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      const now = ctx.currentTime;

      switch (type) {
        case 'hover':
          osc.type = 'sine';
          osc.frequency.setValueAtTime(1000, now);
          osc.frequency.exponentialRampToValueAtTime(600, now + 0.06);
          gain.gain.setValueAtTime(0.05, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
          osc.start(now);
          osc.stop(now + 0.06);
          break;
        case 'click':
          osc.type = 'sine';
          osc.frequency.setValueAtTime(800, now);
          osc.frequency.exponentialRampToValueAtTime(300, now + 0.1);
          gain.gain.setValueAtTime(0.1, now);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
          osc.start(now);
          osc.stop(now + 0.1);
          break;
        case 'select':
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(520, now);
          osc.frequency.linearRampToValueAtTime(780, now + 0.12);
          gain.gain.setValueAtTime(0.09, now);
          gain.gain.linearRampToValueAtTime(0, now + 0.18);
          osc.start(now);
          osc.stop(now + 0.18);
          break;
        case 'success':
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(400, now);
          osc.frequency.linearRampToValueAtTime(600, now + 0.1);
          osc.frequency.linearRampToValueAtTime(1000, now + 0.3);
          gain.gain.setValueAtTime(0.1, now);
          gain.gain.linearRampToValueAtTime(0, now + 0.5);
          osc.start(now);
          osc.stop(now + 0.5);
          break;
        case 'error':
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(300, now);
          osc.frequency.linearRampToValueAtTime(150, now + 0.2);
          gain.gain.setValueAtTime(0.1, now);
          gain.gain.linearRampToValueAtTime(0, now + 0.2);
          osc.start(now);
          osc.stop(now + 0.2);
          break;
        case 'gacha_shake':
          osc.type = 'square';
          osc.frequency.setValueAtTime(100, now);
          osc.frequency.linearRampToValueAtTime(150, now + 0.05);
          gain.gain.setValueAtTime(0.1, now);
          gain.gain.linearRampToValueAtTime(0, now + 0.1);
          osc.start(now);
          osc.stop(now + 0.1);
          break;
        case 'gacha_open':
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(140, now);
          osc.frequency.linearRampToValueAtTime(420, now + 0.25);
          gain.gain.setValueAtTime(0.08, now);
          gain.gain.linearRampToValueAtTime(0, now + 0.4);
          osc.start(now);
          osc.stop(now + 0.4);
          break;
        case 'gacha_reveal':
          osc.type = 'sine';
          osc.frequency.setValueAtTime(200, now);
          osc.frequency.linearRampToValueAtTime(800, now + 0.5);
          gain.gain.setValueAtTime(0, now);
          gain.gain.linearRampToValueAtTime(0.2, now + 0.1);
          gain.gain.linearRampToValueAtTime(0, now + 1.5);
          osc.start(now);
          osc.stop(now + 1.5);
          break;
      }
    } catch (e) {
      console.error("Audio synth error", e);
    }
  };

  try {
    const audio = new Audio(fileSrc);
    audio.volume = 0.65;
    audio.play().catch(() => playSynth());
  } catch {
    playSynth();
  }
}
