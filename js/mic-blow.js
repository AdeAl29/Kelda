/* ==========================================================================
   MIC-BLOW.JS - Real-Time Microphone Breath & Wind Detection for Candle Blowing
   ========================================================================== */

class MicBlowDetector {
  constructor(onBlowCallback) {
    this.onBlow = onBlowCallback;
    this.audioContext = null;
    this.analyser = null;
    this.microphone = null;
    this.javascriptNode = null;
    this.isListening = false;
    this.stream = null;
    this.consecutiveBlowFrames = 0;
    this.blowThreshold = 38; // Energy threshold for wind turbulence
  }

  async startListening() {
    if (this.isListening) return true;

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        console.warn('Microphone getUserMedia not available.');
        return false;
      }

      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false
        },
        video: false
      });

      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.audioContext = new AudioCtx();
      this.analyser = this.audioContext.createAnalyser();
      this.microphone = this.audioContext.createMediaStreamSource(this.stream);

      this.analyser.fftSize = 512;
      this.analyser.smoothingTimeConstant = 0.2;

      this.microphone.connect(this.analyser);
      this.isListening = true;
      this.consecutiveBlowFrames = 0;

      this.analyzeLoop();
      return true;
    } catch (err) {
      console.warn('Microphone permission not granted or unavailable:', err);
      this.isListening = false;
      return false;
    }
  }

  analyzeLoop() {
    if (!this.isListening || !this.analyser) return;

    const bufferLength = this.analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    this.analyser.getByteFrequencyData(dataArray);

    // Calculate energy in low-to-mid frequency bins (typical for wind blow turbulence: 50Hz - 500Hz)
    let lowEnergy = 0;
    const lowBins = Math.min(24, bufferLength);
    for (let i = 2; i < lowBins; i++) {
      lowEnergy += dataArray[i];
    }
    const avgLowEnergy = lowEnergy / (lowBins - 2);

    // Visual flame wobble effect if breathing lightly
    if (avgLowEnergy > 20 && window.flameWobble) {
      window.flameWobble(avgLowEnergy / 100);
    }

    if (avgLowEnergy > this.blowThreshold) {
      this.consecutiveBlowFrames++;
      if (this.consecutiveBlowFrames >= 3) {
        // Confirmed blow detection!
        this.stopListening();
        if (typeof this.onBlow === 'function') {
          this.onBlow();
        }
        return;
      }
    } else {
      this.consecutiveBlowFrames = Math.max(0, this.consecutiveBlowFrames - 1);
    }

    requestAnimationFrame(() => this.analyzeLoop());
  }

  stopListening() {
    this.isListening = false;
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
    if (this.audioContext && this.audioContext.state !== 'closed') {
      this.audioContext.close().catch(() => {});
    }
  }
}

window.MicBlowDetector = MicBlowDetector;
