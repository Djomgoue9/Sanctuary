// ================================
// SANCTUARY — animations.js
// GSAP — Micro-animations subtiles
// ================================

// Enregistrer ScrollTrigger
gsap.registerPlugin(ScrollTrigger);

// ================================
// 1. ANIMATION D'ENTRÉE DE PAGE
// ================================
function initPageAnimation() {
  // Fade in du header
  gsap.from('header', {
    duration: 0.5,
    y: -20,
    opacity: 0,
    ease: 'power2.out'
  });

  // Animation des sections en cascade
  gsap.from('main > section, main > div', {
    duration: 0.4,
    y: 20,
    opacity: 0,
    stagger: 0.05,
    ease: 'power2.out',
    delay: 0.1
  });

  // Navigation du bas
  gsap.from('nav', {
    duration: 0.4,
    y: 20,
    opacity: 0,
    ease: 'power2.out',
    delay: 0.2
  });
}

// ================================
// 2. SCROLL ANIMATIONS
// ================================
function initScrollAnimations() {
  // Chaque section apparaît au scroll
  gsap.utils.toArray('section').forEach(section => {
    gsap.from(section, {
      scrollTrigger: {
        trigger: section,
        start: 'top 85%',
        toggleActions: 'play none none none'
      },
      duration: 0.4,
      y: 15,
      opacity: 0,
      ease: 'power2.out'
    });
  });
}

// ================================
// 3. MICRO-ANIMATIONS BOUTONS
// ================================
function initButtonAnimations() {
  document.querySelectorAll('button').forEach(btn => {
    btn.addEventListener('mouseenter', () => {
      gsap.to(btn, { duration: 0.15, scale: 1.02, ease: 'power1.out' });
    });
    btn.addEventListener('mouseleave', () => {
      gsap.to(btn, { duration: 0.15, scale: 1, ease: 'power1.out' });
    });
  });
}

// ================================
// 4. ANIMATION NAVIGATION
// ================================
function initNavAnimation() {
  document.querySelectorAll('nav a').forEach(link => {
    link.addEventListener('click', function(e) {
      if (this.href && !this.href.includes('#')) {
        e.preventDefault();
        const href = this.href;
        gsap.to('body', {
          duration: 0.2,
          opacity: 0,
          ease: 'power2.in',
          onComplete: () => { window.location.href = href; }
        });
      }
    });
  });
}

// ================================
// 5. ANIMATION CARDS AU HOVER
// ================================
function initCardAnimations() {
  document.querySelectorAll('li, .carte-grande, .carte-petite, .task-card, .budget-card').forEach(card => {
    card.addEventListener('mouseenter', () => {
      gsap.to(card, { duration: 0.2, y: -2, ease: 'power2.out' });
    });
    card.addEventListener('mouseleave', () => {
      gsap.to(card, { duration: 0.2, y: 0, ease: 'power2.out' });
    });
  });
}

// ================================
// 6. ÉTAT HORS CONNEXION
// ================================
function initOfflineState() {
  window.addEventListener('offline', () => {
    showToast('📡 Pas de connexion — Sanctuary fonctionne en mode hors ligne', 'warning');
  });
  window.addEventListener('online', () => {
    showToast('✅ Connexion rétablie !', 'success');
  });
}

// ================================
// 7. TOAST NOTIFICATIONS
// ================================
function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  toast.className = `sanctuary-toast toast-${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);

  gsap.timeline()
    .from(toast, { duration: 0.3, y: 60, opacity: 0, ease: 'back.out(1.7)' })
    .to(toast, { duration: 0.3, y: 60, opacity: 0, ease: 'power2.in', delay: 2.5 })
    .call(() => toast.remove());
}

// ================================
// 8. ANIMATION CHRONOMÈTRE
// ================================
function animateTimer() {
  const timer = document.getElementById('chrono-temps') || document.getElementById('chrono-sport-temps');
  if (timer) {
    gsap.from(timer, {
      duration: 0.2,
      scale: 1.05,
      color: '#D4A373',
      ease: 'power1.out'
    });
  }
}

// ================================
// INITIALISATION GLOBALE
// ================================
document.addEventListener('DOMContentLoaded', () => {
  // Fade in à l'entrée
  gsap.set('body', { opacity: 0 });
  gsap.to('body', { duration: 0.3, opacity: 1, ease: 'power2.out' });

  initPageAnimation();
  initScrollAnimations();
  initButtonAnimations();
  initNavAnimation();
  initCardAnimations();
  initOfflineState();
});
