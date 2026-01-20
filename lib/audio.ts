"use client";

export type SfxType = 'click' | 'hover' | 'success' | 'select' | 'gacha_shake' | 'gacha_open' | 'gacha_reveal';

export function playSfx(type: SfxType) {
  if (typeof window === 'undefined') return;

  // Real implementation with synth for fallback if files missing
  // This allows sound without assets for demo
  try {
    const AudioContextCtor = window.AudioContext || window.webkitAudioContext;
    if (AudioContextCtor) {
      const ctx = new AudioContextCtor();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      const now = ctx.currentTime;
      
      switch (type) {
        case 'click':
          osc.type = 'sine';
          osc.frequency.setValueAtTime(800, now);
          osc.frequency.exponentialRampToValueAtTime(300, now + 0.1);
          gain.gain.setValueAtTime(0.1, now);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
          osc.start(now);
          osc.stop(now + 0.1);
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
        case 'gacha_shake':
          osc.type = 'square';
          osc.frequency.setValueAtTime(100, now);
          osc.frequency.linearRampToValueAtTime(150, now + 0.05);
          gain.gain.setValueAtTime(0.1, now);
          gain.gain.linearRampToValueAtTime(0, now + 0.1);
          osc.start(now);
          osc.stop(now + 0.1);
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
    }
  } catch (e) {
    console.error("Audio synth error", e);
  }

  // Also try to play real file if exists (commented out for now as files don't exist)
  // const audio = new Audio(`/assets/audio/${type}.mp3`);
  // audio.play().catch(() => {});
}
