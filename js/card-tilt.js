/* ==========================================================================
   CARD-TILT.JS - Realistic 3D Gyroscope & Mouse Parallax with Specular Lighting
   ========================================================================== */

class CardTilt3D {
  constructor(cardElement) {
    this.card = cardElement;
    if (!this.card) return;

    this.currentX = 0;
    this.currentY = 0;
    this.targetX = 0;
    this.targetY = 0;
    this.isHovered = false;
    this.animationId = null;

    this.init();
  }

  init() {
    // Mouse Interaction
    window.addEventListener('mousemove', (e) => this.onMouseMove(e));
    this.card.addEventListener('mouseenter', () => { this.isHovered = true; });
    this.card.addEventListener('mouseleave', () => {
      this.isHovered = false;
      this.targetX = 0;
      this.targetY = 0;
    });

    // Mobile Gyroscope / Device Orientation
    if (window.DeviceOrientationEvent && 'ontouchstart' in window) {
      window.addEventListener('deviceorientation', (e) => this.onDeviceOrientation(e));
    }

    // Touch Parallax for Mobile
    this.card.addEventListener('touchmove', (e) => {
      if (e.touches.length > 0) {
        const touch = e.touches[0];
        const rect = this.card.getBoundingClientRect();
        const x = touch.clientX - rect.left - rect.width / 2;
        const y = touch.clientY - rect.top - rect.height / 2;
        this.targetX = (y / (rect.height / 2)) * -14;
        this.targetY = (x / (rect.width / 2)) * 14;
        this.updateSpecular(touch.clientX, touch.clientY, rect);
      }
    }, { passive: true });

    this.card.addEventListener('touchend', () => {
      this.targetX = 0;
      this.targetY = 0;
    });

    this.renderLoop();
  }

  onMouseMove(e) {
    const rect = this.card.getBoundingClientRect();
    const cardCenterX = rect.left + rect.width / 2;
    const cardCenterY = rect.top + rect.height / 2;

    const diffX = e.clientX - cardCenterX;
    const diffY = e.clientY - cardCenterY;

    // Calculate rotation (-16deg to +16deg range)
    const maxAngle = 14;
    this.targetX = Math.max(-maxAngle, Math.min(maxAngle, -(diffY / (window.innerHeight / 2)) * maxAngle));
    this.targetY = Math.max(-maxAngle, Math.min(maxAngle, (diffX / (window.innerWidth / 2)) * maxAngle));

    this.updateSpecular(e.clientX, e.clientY, rect);
  }

  onDeviceOrientation(e) {
    if (e.gamma !== null && e.beta !== null) {
      // Gamma: Left to Right (-90 to 90)
      // Beta: Front to Back (-180 to 180)
      const gamma = Math.max(-30, Math.min(30, e.gamma));
      const beta = Math.max(-30, Math.min(30, e.beta - 45)); // assume holding at 45deg angle

      this.targetY = (gamma / 30) * 12;
      this.targetX = -(beta / 30) * 12;
    }
  }

  updateSpecular(clientX, clientY, rect) {
    const normX = ((clientX - rect.left) / rect.width) * 100;
    const normY = ((clientY - rect.top) / rect.height) * 100;
    this.card.style.setProperty('--mouse-x', `${Math.max(0, Math.min(100, normX))}%`);
    this.card.style.setProperty('--mouse-y', `${Math.max(0, Math.min(100, normY))}%`);
  }

  renderLoop() {
    // Smooth LERP (Linear Interpolation)
    const lerpFactor = 0.08;
    this.currentX += (this.targetX - this.currentX) * lerpFactor;
    this.currentY += (this.targetY - this.currentY) * lerpFactor;

    // Apply 3D Transform only if card is not fully opened or when tilting
    if (!this.card.classList.contains('opened-frozen')) {
      const shadowX = -this.currentY * 2;
      const shadowY = Math.abs(this.currentX) * 2 + 15;
      this.card.style.transform = `rotateX(${this.currentX.toFixed(2)}deg) rotateY(${this.currentY.toFixed(2)}deg)`;
    }

    this.animationId = requestAnimationFrame(() => this.renderLoop());
  }
}

// Export initialization hook
window.initCardTilt = function(cardElem) {
  return new CardTilt3D(cardElem);
};
