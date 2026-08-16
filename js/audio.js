/* ==========================================================================
   AUDIO.JS - Web Audio API Synthesizer & Sound Effects Engine
   (100% Zero Dependency & Always Works Without External Asset 404s)
   ========================================================================== */

class SoundEngine {
  constructor() {
    this.ctx = null;
    this.isMuted = false;
    this.bgmPlaying = false;
    this.bgmTimer = null;
    this.masterGain = null;
    this.bgmGain = null;
    this.sfxGain = null;
    this.currentNoteIndex = 0;
  }

  // Initialize Web Audio Context upon first user interaction
  init() {
    if (this.ctx) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.8, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      this.bgmGain = this.ctx.createGain();
      this.bgmGain.gain.setValueAtTime(0.35, this.ctx.currentTime);
      this.bgmGain.connect(this.masterGain);

      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.setValueAtTime(0.7, this.ctx.currentTime);
      this.sfxGain.connect(this.masterGain);

      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
    } catch (err) {
      console.warn('Web Audio API not supported on this device:', err);
    }
  }

  resume() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.masterGain && this.ctx) {
      const targetGain = this.isMuted ? 0 : 0.8;
      this.masterGain.gain.setTargetAtTime(targetGain, this.ctx.currentTime, 0.05);
    }
    return !this.isMuted;
  }

  // =========================================================================
  // SOUND EFFECTS
  // =========================================================================

  // 1. Soft Paper Rustle & Card Creak
  playPaperRustle() {
    if (!this.ctx || this.isMuted) return;
    this.resume();

    const now = this.ctx.currentTime;
    const bufferSize = this.ctx.sampleRate * 0.35;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.25));
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1400, now);
    filter.frequency.exponentialRampToValueAtTime(700, now + 0.3);
    filter.Q.setValueAtTime(2.5, now);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    noise.start(now);
  }

  // 2. Magic Chime Arpeggio (When card opens or surprise triggers)
  playMagicChime() {
    if (!this.ctx || this.isMuted) return;
    this.resume();

    const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51, 1567.98]; // C5, E5, G5, C6, E6, G6
    const now = this.ctx.currentTime;

    notes.forEach((freq, idx) => {
      const startTime = now + idx * 0.07;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(0.2, startTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 1.2);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(startTime);
      osc.stop(startTime + 1.25);
    });
  }

  // 3. Candle Wind Blow Sound
  playBlowSound() {
    if (!this.ctx || this.isMuted) return;
    this.resume();

    const now = this.ctx.currentTime;
    const duration = 0.9;
    const bufferSize = this.ctx.sampleRate * duration;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1);
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(300, now);
    filter.frequency.linearRampToValueAtTime(800, now + 0.3);
    filter.frequency.exponentialRampToValueAtTime(150, now + duration);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.05, now);
    gain.gain.linearRampToValueAtTime(0.5, now + 0.25);
    gain.gain.exponentialRampToValueAtTime(0.01, now + duration);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    noise.start(now);
  }

  // 4. Candle Extinguish Puff & Smoke
  playExtinguishSound() {
    if (!this.ctx || this.isMuted) return;
    this.resume();

    const now = this.ctx.currentTime;
    
    // Low pop
    const osc = this.ctx.createOscillator();
    const oscGain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(160, now);
    osc.frequency.exponentialRampToValueAtTime(40, now + 0.18);

    oscGain.gain.setValueAtTime(0.35, now);
    oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

    osc.connect(oscGain);
    oscGain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.2);

    // Hiss puff
    const bufferSize = this.ctx.sampleRate * 0.25;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.15));
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(1800, now);

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.3, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.005, now + 0.25);

    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(this.sfxGain);
    noise.start(now);
  }

  // 5. Celebration Chime Fanfare
  playFanfare() {
    if (!this.ctx || this.isMuted) return;
    this.resume();

    // Uplifting Birthday Melody chords
    const chordProgression = [
      [523.25, 659.25, 783.99],       // C Major
      [587.33, 698.46, 880.00],       // D Minor
      [659.25, 783.99, 987.77],       // E Minor
      [783.99, 987.77, 1174.66, 1567.98] // G Major / High C
    ];

    const now = this.ctx.currentTime;
    chordProgression.forEach((chord, step) => {
      const stepTime = now + step * 0.22;
      chord.forEach((freq) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, stepTime);

        gain.gain.setValueAtTime(0, stepTime);
        gain.gain.linearRampToValueAtTime(0.18, stepTime + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.001, stepTime + 1.4);

        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(stepTime);
        osc.stop(stepTime + 1.5);
      });
    });
  }

  // =========================================================================
  // CONTINUOUS BACKGROUND PIANO AMBIENT (Pure Web Audio Synthesis)
  // =========================================================================
  startBGM() {
    if (this.bgmPlaying || !this.ctx) return;
    this.bgmPlaying = true;
    this.scheduleNextBGMChord();
  }

  scheduleNextBGMChord() {
    if (!this.bgmPlaying || !this.ctx) return;

    // Soothing emotional piano progression in C Major / A Minor:
    // Cmaj9 -> Am9 -> Fmaj7 -> Gsus4
    const chords = [
      [261.63, 329.63, 392.00, 493.88, 587.33], // C, E, G, B, D
      [220.00, 261.63, 329.63, 392.00, 493.88], // A, C, E, G, B
      [174.61, 261.63, 329.63, 349.23, 440.00], // F, C, E, F, A
      [196.00, 293.66, 392.00, 440.00, 587.33]  // G, D, G, A, D
    ];

    const currentChord = chords[this.currentNoteIndex % chords.length];
    this.currentNoteIndex++;

    const now = this.ctx.currentTime;
    currentChord.forEach((freq, idx) => {
      const noteDelay = idx * 0.15;
      const startTime = now + noteDelay;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime);

      // Gentle piano envelope
      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(0.12, startTime + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 3.8);

      osc.connect(gain);
      gain.connect(this.bgmGain);

      osc.start(startTime);
      osc.stop(startTime + 4.0);
    });

    // Schedule next chord in 3.4 seconds
    this.bgmTimer = setTimeout(() => {
      this.scheduleNextBGMChord();
    }, 3400);
  }

  stopBGM() {
    this.bgmPlaying = false;
    if (this.bgmTimer) {
      clearTimeout(this.bgmTimer);
      this.bgmTimer = null;
    }
  }
}

// Global Audio Singleton
window.soundEngine = new SoundEngine();
