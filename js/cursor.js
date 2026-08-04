/**
 * cursor.js — a small hammer-and-ring cursor that trails the pointer.
 * Disabled for touch devices and prefers-reduced-motion.
 */

export function initCursor() {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(pointer: fine)').matches;
  const el = document.getElementById('cursor');
  if (!finePointer || reducedMotion) {
    el.remove();
    return;
  }

  document.body.classList.add('has-cursor');
  const dot = el.querySelector('.cursor-dot');
  const ring = el.querySelector('.cursor-ring');

  let targetX = -100;
  let targetY = -100;
  let ringX = -100;
  let ringY = -100;
  let scale = 1;
  let targetScale = 1;
  let isDown = false;
  let isActive = false;

  const updateTargetScale = () => {
    targetScale = isDown ? 0.7 : isActive ? 1.7 : 1;
  };

  window.addEventListener('pointermove', (event) => {
    targetX = event.clientX;
    targetY = event.clientY;
    dot.style.transform = `translate(${targetX}px, ${targetY}px)`;
    isActive = Boolean(event.target.closest('[data-cursor], a, button, .piano-key'));
    el.classList.toggle('is-active', isActive);
    updateTargetScale();
  }, { passive: true });

  window.addEventListener('pointerdown', () => { isDown = true; updateTargetScale(); });
  window.addEventListener('pointerup', () => { isDown = false; updateTargetScale(); });

  // The ring eases after the dot — a touch of mechanical lag.
  const follow = () => {
    ringX += (targetX - ringX) * 0.16;
    ringY += (targetY - ringY) * 0.16;
    scale += (targetScale - scale) * 0.2;
    ring.style.transform = `translate(${ringX}px, ${ringY}px) scale(${scale.toFixed(3)})`;
    requestAnimationFrame(follow);
  };
  requestAnimationFrame(follow);
}
