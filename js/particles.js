/* ==========================================================================
   PARTICLES.JS - 60 FPS Multi-Layer Canvas Magic Particle Engine
   ========================================================================== */

class ParticleEngine {
  constructor() {
    this.canvas = document.getElementById('particle-canvas');
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.particles = [];
    this.bokehList = [];
    this.mouse = { x: -1000, y: -1000, active: false };
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.animationFrameId = null;

    this.init();
  }

  init() {
    this.resize();
    window.addEventListener('resize', () => this.resize());

    // Track mouse / touch for interactive sparkle attraction
    window.addEventListener('mousemove', (e) => {
      this.mouse.x = e.clientX;
      this.mouse.y = e.clientY;
      this.mouse.active = true;
      if (Math.random() < 0.35) {
        this.addCursorFairyDust(e.clientX, e.clientY);
      }
    });

    window.addEventListener('touchmove', (e) => {
      if (e.touches.length > 0) {
        this.mouse.x = e.touches[0].clientX;
        this.mouse.y = e.touches[0].clientY;
        this.mouse.active = true;
        if (Math.random() < 0.4) {
          this.addCursorFairyDust(this.mouse.x, this.mouse.y);
        }
      }
    }, { passive: true });

    // Seed initial ambient celestial stars
    const starCount = Math.min(100, Math.floor((this.width * this.height) / 10000));
    for (let i = 0; i < starCount; i++) {
      this.particles.push(this.createStar());
    }

    // Seed dreamy floating bokeh orbs
    for (let i = 0; i < 14; i++) {
      this.bokehList.push(this.createBokeh());
    }

    this.animate();
  }

  resize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.canvas.width = this.width * window.devicePixelRatio;
    this.canvas.height = this.height * window.devicePixelRatio;
    this.ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
  }

  createStar() {
    return {
      x: Math.random() * this.width,
      y: Math.random() * this.height,
      radius: Math.random() * 1.5 + 0.5,
      alpha: Math.random() * 0.8 + 0.2,
      baseAlpha: Math.random() * 0.7 + 0.3,
      twinkleSpeed: Math.random() * 0.03 + 0.008,
      twinkleOffset: Math.random() * Math.PI * 2,
      vx: (Math.random() - 0.5) * 0.15,
      vy: -Math.random() * 0.2 - 0.05,
      color: Math.random() > 0.3 ? '#fef08a' : '#fda4af'
    };
  }

  createBokeh() {
    return {
      x: Math.random() * this.width,
      y: Math.random() * this.height,
      radius: Math.random() * 60 + 25,
      alpha: Math.random() * 0.08 + 0.02,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      hue: Math.random() > 0.5 ? 42 : 340 // Gold (42) or Rose (340)
    };
  }

  addCursorFairyDust(x, y) {
    this.particles.push({
      x: x + (Math.random() - 0.5) * 20,
      y: y + (Math.random() - 0.5) * 20,
      radius: Math.random() * 2.5 + 1,
      alpha: 1,
      decay: Math.random() * 0.025 + 0.015,
      vx: (Math.random() - 0.5) * 1.5,
      vy: -Math.random() * 1.5 - 0.5,
      color: Math.random() > 0.4 ? '#fef08a' : '#f43f5e',
      isFairyDust: true
    });
  }

  // Trigger Burst of Gold & Rose Sparkles from a coordinate
  createSparkleBurst(x, y, count = 40) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 6 + 2;
      this.particles.push({
        x: x,
        y: y,
        radius: Math.random() * 3 + 1.2,
        alpha: 1,
        decay: Math.random() * 0.02 + 0.01,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color: Math.random() > 0.3 ? '#fbbf24' : '#fb7185',
        isFairyDust: true
      });
    }
  }

  animate() {
    this.ctx.clearRect(0, 0, this.width, this.height);

    const time = Date.now() * 0.001;

    // 1. Draw Ambient Floating Bokeh Orbs
    for (let i = 0; i < this.bokehList.length; i++) {
      const b = this.bokehList[i];
      b.x += b.vx;
      b.y += b.vy;

      if (b.x < -b.radius) b.x = this.width + b.radius;
      if (b.x > this.width + b.radius) b.x = -b.radius;
      if (b.y < -b.radius) b.y = this.height + b.radius;
      if (b.y > this.height + b.radius) b.y = -b.radius;

      const grad = this.ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.radius);
      grad.addColorStop(0, `hsla(${b.hue}, 90%, 65%, ${b.alpha})`);
      grad.addColorStop(1, `hsla(${b.hue}, 90%, 65%, 0)`);

      this.ctx.fillStyle = grad;
      this.ctx.beginPath();
      this.ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
      this.ctx.fill();
    }

    // 2. Draw Stars & Fairy Dust
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];

      if (p.isFairyDust) {
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= p.decay;
        p.radius *= 0.98;

        if (p.alpha <= 0 || p.radius < 0.2) {
          this.particles.splice(i, 1);
          continue;
        }

        this.ctx.save();
        this.ctx.globalAlpha = Math.max(0, p.alpha);
        this.ctx.fillStyle = p.color;
        this.ctx.shadowBlur = 10;
        this.ctx.shadowColor = p.color;
        this.ctx.beginPath();
        this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.restore();
      } else {
        // Celestial Star
        p.x += p.vx;
        p.y += p.vy;
        p.alpha = p.baseAlpha + Math.sin(time * 3 + p.twinkleOffset) * 0.3;

        if (p.y < 0) p.y = this.height;
        if (p.x < 0) p.x = this.width;
        if (p.x > this.width) p.x = 0;

        this.ctx.save();
        this.ctx.globalAlpha = Math.max(0.1, Math.min(1, p.alpha));
        this.ctx.fillStyle = p.color;
        this.ctx.shadowBlur = 6;
        this.ctx.shadowColor = p.color;
        this.ctx.beginPath();
        this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.restore();
      }
    }

    this.animationFrameId = requestAnimationFrame(() => this.animate());
  }
}

// Global Particle Engine
window.particleEngine = new ParticleEngine();
