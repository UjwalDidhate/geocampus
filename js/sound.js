/**
 * Campus Micro-Problem Mapper - Sound FX Engine
 * Web Audio API synthesizer for instant, zero-dependency micro-interaction feedback.
 * Developed by Ujwal Didhate
 */

class SoundEngine {
  constructor() {
    this.ctx = null;
    this.muted = false;
  }

  init() {
    if (!this.ctx && (window.AudioContext || window.webkitAudioContext)) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
    }
  }

  playTone(freq, type = 'sine', duration = 0.15, gainVal = 0.15) {
    if (this.muted) return;
    try {
      this.init();
      if (!this.ctx) return;
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      gain.gain.setValueAtTime(gainVal, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch (e) {
      console.warn('Audio not allowed yet:', e);
    }
  }

  playUpvote() {
    if (this.muted) return;
    this.playTone(523.25, 'sine', 0.1, 0.12); // C5
    setTimeout(() => this.playTone(659.25, 'sine', 0.15, 0.15), 60); // E5
    setTimeout(() => this.playTone(783.99, 'triangle', 0.2, 0.12), 120); // G5
  }

  playSuccess() {
    if (this.muted) return;
    this.playTone(440, 'triangle', 0.1, 0.1);
    setTimeout(() => this.playTone(554.37, 'triangle', 0.12, 0.12), 80);
    setTimeout(() => this.playTone(659.25, 'sine', 0.2, 0.15), 160);
    setTimeout(() => this.playTone(880, 'sine', 0.3, 0.15), 240);
  }

  playWarning() {
    if (this.muted) return;
    this.playTone(330, 'sawtooth', 0.12, 0.08);
    setTimeout(() => this.playTone(293.66, 'sawtooth', 0.18, 0.08), 100);
  }

  playClick() {
    if (this.muted) return;
    this.playTone(800, 'sine', 0.04, 0.05);
  }

  playVerify() {
    if (this.muted) return;
    this.playTone(600, 'sine', 0.08, 0.1);
    setTimeout(() => this.playTone(900, 'sine', 0.18, 0.15), 90);
  }

  toggleMute() {
    this.muted = !this.muted;
    return this.muted;
  }
}

window.soundEngine = new SoundEngine();
