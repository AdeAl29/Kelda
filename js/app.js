/* ==========================================================================
   APP.JS - Main State Machine & Storytelling Orchestration (States 1 - 9)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const sceneOpening = document.getElementById('scene-opening');
  const sceneLetter = document.getElementById('scene-letter');
  const sceneCake = document.getElementById('scene-cake');
  const cardElement = document.getElementById('main-card');
  const letterWrapper = document.getElementById('letter-wrapper');
  const btnSurprise = document.getElementById('btn-surprise-reveal');
  const btnBlowCandle = document.getElementById('btn-blow-candle');
  const micStatus = document.getElementById('mic-status');
  const celebrationOverlay = document.getElementById('celebration-overlay');
  const lightBurst = document.getElementById('light-burst');
  const darkRoom = document.getElementById('dark-room');
  const balloonsLayer = document.getElementById('celebration-balloons');
  const audioToggleBtn = document.getElementById('audio-toggle-btn');
  const audioStatusText = document.getElementById('audio-status-text');
  const musicHint = document.getElementById('music-hint-toast');
  const btnReplay = document.getElementById('btn-replay');

  let currentState = 1;
  let micDetector = null;
  let hasInteracted = false;
  let isCandleExtinguished = false;

  // Initialize 3D Card Tilt Physics
  if (window.initCardTilt) {
    window.initCardTilt(cardElement);
  }

  // Flame Wobble hook for microphone breath sensing
  window.flameWobble = (intensity) => {
    const flames = document.querySelectorAll('.candle-flame');
    flames.forEach(flame => {
      const angle = (Math.random() - 0.5) * 30 * intensity;
      const scaleX = 1 + (Math.random() - 0.5) * intensity;
      flame.style.transform = `rotate(${angle}deg) scale(${scaleX}, ${1 - intensity * 0.4})`;
    });
  };

  // =========================================================================
  // GLOBAL AUDIO & INTERACTION UNLOCK
  // =========================================================================
  function unlockAudio() {
    if (!hasInteracted) {
      hasInteracted = true;
      window.soundEngine.init();
      window.soundEngine.startBGM();
      document.body.classList.add('audio-playing');
      audioStatusText.textContent = 'Musik: On';

      // Show temporary pleasant toast
      if (musicHint) {
        musicHint.classList.add('show');
        setTimeout(() => musicHint.classList.remove('show'), 3500);
      }
    }
  }

  audioToggleBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    unlockAudio();
    const isPlaying = window.soundEngine.toggleMute();
    if (isPlaying) {
      document.body.classList.add('audio-playing');
      audioStatusText.textContent = 'Musik: On';
    } else {
      document.body.classList.remove('audio-playing');
      audioStatusText.textContent = 'Musik: Muted';
    }
  });

  // =========================================================================
  // STATE 1 -> STATE 2 -> STATE 3: OPENING THE 3D CARD
  // =========================================================================
  cardElement.addEventListener('click', () => {
    if (currentState !== 1) return;
    unlockAudio();
    openCardSequence();
  });

  function openCardSequence() {
    currentState = 2;

    // 1. Play sounds
    window.soundEngine.playPaperRustle();
    setTimeout(() => {
      window.soundEngine.playMagicChime();
    }, 400);

    // 2. Trigger Sparkle Burst from Card Center
    const cardRect = cardElement.getBoundingClientRect();
    const centerX = cardRect.left + cardRect.width / 2;
    const centerY = cardRect.top + cardRect.height / 2;
    window.particleEngine.createSparkleBurst(centerX, centerY, 50);

    // 3. Open 3D Card Cover
    cardElement.classList.add('is-open');

    // 4. GSAP Timeline for Zoom & Reveal
    const tl = gsap.timeline({
      onComplete: () => {
        transitionToLetterState();
      }
    });

    tl.to(cardElement, {
      scale: 1.08,
      duration: 0.8,
      ease: 'power2.out'
    })
    .to('.card-shadow-layer', {
      opacity: 0.2,
      duration: 0.6
    }, '<')
    .to(cardElement, {
      scale: 0.95,
      opacity: 0,
      filter: 'blur(10px)',
      duration: 0.7,
      delay: 0.5,
      ease: 'power2.in'
    });
  }

  // =========================================================================
  // STATE 3: PARCHMENT LETTER REVEAL & STAGGERED TEXT
  // =========================================================================
  function transitionToLetterState() {
    currentState = 3;
    sceneOpening.classList.remove('active');
    sceneLetter.classList.add('active');

    // Slide out the parchment letter with spring physics
    setTimeout(() => {
      letterWrapper.classList.add('revealed');
      window.soundEngine.playPaperRustle();

      // Staggered reveal of letter paragraphs
      const paragraphs = document.querySelectorAll('.letter-paragraph');
      paragraphs.forEach((p, idx) => {
        setTimeout(() => {
          p.classList.add('visible');
        }, 700 + idx * 900);
      });

      // Show Surprise CTA Button after paragraphs finish
      setTimeout(() => {
        currentState = 4;
        const letterFooter = document.getElementById('letter-footer');
        letterFooter.classList.add('visible');
      }, 700 + paragraphs.length * 900 + 400);
    }, 100);
  }

  // =========================================================================
  // STATE 4 -> STATE 5 -> STATE 6: TRANSITION TO CAKE & CANDLE 33
  // =========================================================================
  btnSurprise.addEventListener('click', () => {
    if (currentState < 4) return;
    unlockAudio();
    revealCakeSurprise();
  });

  function revealCakeSurprise() {
    currentState = 5;

    // 1. Play magic transition sounds
    window.soundEngine.playMagicChime();

    // 2. Hide Letter
    gsap.to(letterWrapper, {
      opacity: 0,
      scale: 0.8,
      y: 80,
      duration: 0.6,
      ease: 'power2.in',
      onComplete: () => {
        sceneLetter.classList.remove('active');
      }
    });

    // 3. Dim the room smoothly into mystery
    darkRoom.classList.add('dimmed');

    // 4. Particle convergence at center
    setTimeout(() => {
      window.particleEngine.createSparkleBurst(window.innerWidth / 2, window.innerHeight / 2, 70);
    }, 600);

    // 5. Light burst flash + cake reveal
    setTimeout(() => {
      currentState = 6;
      lightBurst.classList.add('burst');
      window.soundEngine.playMagicChime();

      setTimeout(() => {
        darkRoom.classList.remove('dimmed');
        sceneCake.classList.add('active');

        // Animate Cake in
        gsap.fromTo('.cake-stage', 
          { scale: 0.4, y: 100, opacity: 0 },
          { scale: 1, y: 0, opacity: 1, duration: 1.2, ease: 'back.out(1.4)' }
        );

        gsap.fromTo('.blow-interaction-card',
          { y: 30, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.8, delay: 0.6, ease: 'power2.out' }
        );

        setTimeout(() => {
          lightBurst.classList.remove('burst');
          initMicrophoneBlowing();
        }, 400);
      }, 350);
    }, 1100);
  }

  // =========================================================================
  // STATE 7: BLOW CANDLE INTERACTION (Mic + Button)
  // =========================================================================
  function initMicrophoneBlowing() {
    currentState = 7;
    micDetector = new window.MicBlowDetector(() => {
      extinguishCandles();
    });

    // Auto-attempt mic listening if supported
    micDetector.startListening().then((isListening) => {
      if (isListening && micStatus) {
        micStatus.classList.add('mic-listening');
        micStatus.innerHTML = '<span class="mic-pulse-dot"></span> <span>Mikrofon Aktif: Tiup layar Anda!</span>';
      }
    });
  }

  // Touch / Click Button fallback
  btnBlowCandle.addEventListener('click', () => {
    unlockAudio();
    extinguishCandles();
  });

  function extinguishCandles() {
    if (isCandleExtinguished) return;
    isCandleExtinguished = true;

    // Stop mic listener
    if (micDetector) {
      micDetector.stopListening();
    }

    // 1. Play wind blow sound + extinguish puff
    window.soundEngine.playBlowSound();
    setTimeout(() => {
      window.soundEngine.playExtinguishSound();
    }, 450);

    // 2. Animate flame violent flutter -> extinguish
    const flames = document.querySelectorAll('.candle-flame');
    gsap.to(flames, {
      scaleY: 0.3,
      scaleX: 1.8,
      rotation: 25,
      duration: 0.3,
      onComplete: () => {
        document.getElementById('cake-stage').classList.add('candle-extinguished');
      }
    });

    // 3. Briefly dim scene for dramatic pause
    gsap.to('.cake-ambient-glow', { opacity: 0, duration: 0.5 });
    
    // 4. Sparkle & smoke at wicks
    const candlePos1 = document.querySelector('.number-candle:nth-child(1)').getBoundingClientRect();
    const candlePos2 = document.querySelector('.number-candle:nth-child(2)').getBoundingClientRect();
    window.particleEngine.createSparkleBurst(candlePos1.left + 15, candlePos1.top, 15);
    window.particleEngine.createSparkleBurst(candlePos2.left + 15, candlePos2.top, 15);

    // 5. Trigger Grand Celebration Surprise!
    setTimeout(() => {
      triggerCelebrationSequence();
    }, 1000);
  }

  // =========================================================================
  // STATE 8 & 9: GRAND CELEBRATION, CONFETTI & FINAL MESSAGE
  // =========================================================================
  function triggerCelebrationSequence() {
    currentState = 8;

    // 1. Play Celebration Fanfare
    window.soundEngine.playFanfare();

    // 2. Light burst surge
    lightBurst.classList.add('burst');
    setTimeout(() => lightBurst.classList.remove('burst'), 600);

    // 3. Launch Balloons
    balloonsLayer.classList.add('active');

    // 4. Fire Canvas Confetti Explosions
    fireLuxuryConfetti();

    // 5. Show Celebration Overlay & Final Message (State 9)
    setTimeout(() => {
      currentState = 9;
      celebrationOverlay.classList.add('active');
      
      // Secondary continuous confetti shower
      const end = Date.now() + 3.5 * 1000;
      const colors = ['#d4af37', '#f43f5e', '#fbbf24', '#ffffff', '#a855f7'];

      (function frame() {
        if (typeof confetti === 'function') {
          confetti({
            particleCount: 3,
            angle: 60,
            spread: 55,
            origin: { x: 0 },
            colors: colors
          });
          confetti({
            particleCount: 3,
            angle: 120,
            spread: 55,
            origin: { x: 1 },
            colors: colors
          });
        }

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      }());
    }, 800);
  }

  function fireLuxuryConfetti() {
    if (typeof confetti !== 'function') return;

    // Center burst from behind cake
    confetti({
      particleCount: 120,
      spread: 100,
      origin: { y: 0.6 },
      colors: ['#f59e0b', '#fbbf24', '#fda4af', '#f43f5e', '#ffffff', '#e2b744'],
      ticks: 300,
      gravity: 0.8,
      scalar: 1.15
    });

    // Left cannon
    setTimeout(() => {
      confetti({
        particleCount: 80,
        angle: 60,
        spread: 70,
        origin: { x: 0.1, y: 0.7 },
        colors: ['#d4af37', '#f43f5e', '#fef08a']
      });
    }, 300);

    // Right cannon
    setTimeout(() => {
      confetti({
        particleCount: 80,
        angle: 120,
        spread: 70,
        origin: { x: 0.9, y: 0.7 },
        colors: ['#d4af37', '#f43f5e', '#fef08a']
      });
    }, 500);
  }

  // =========================================================================
  // REPLAY / RELIVE FUNCTIONALITY
  // =========================================================================
  if (btnReplay) {
    btnReplay.addEventListener('click', () => {
      window.location.reload();
    });
  }
});
