/**
 * scroll.js — everything driven by scrolling:
 *   · era switching (body[data-era] → colours, keyboard compass, ambience)
 *   · the punched-roll progress rail
 *   · .reveal staggered entrances
 *   · light parallax on figures (skipped for prefers-reduced-motion)
 */

import { ERAS, ERA_BY_ID } from './data/eras.js';
import { engine } from './audio/engine.js';

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export function initScroll(keyboard) {
  const sections = [...document.querySelectorAll('[data-era]')].filter((el) => el.tagName === 'SECTION');
  const topbarEra = document.getElementById('topbar-era');
  const rail = document.getElementById('rail');

  /* ---------------- progress rail ---------------- */
  const holes = new Map();
  for (const section of sections) {
    const era = ERA_BY_ID[section.dataset.era];
    if (!era) continue;
    const hole = document.createElement('button');
    hole.className = 'rail-hole';
    hole.dataset.cursor = '';
    hole.setAttribute('aria-label', `${era.year} ${era.name}`);
    hole.innerHTML = `<span class="rail-tip">${era.year} · ${era.name}</span>`;
    hole.addEventListener('click', () => {
      section.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth' });
    });
    rail.appendChild(hole);
    holes.set(section.dataset.era, hole);
  }

  /* ---------------- era switching ---------------- */
  let currentEra = 'prelude';

  const applyEra = (eraId) => {
    if (eraId === currentEra) return;
    currentEra = eraId;
    const era = ERA_BY_ID[eraId];
    document.body.dataset.era = eraId;
    topbarEra.textContent = era ? `${era.year} — ${era.name}` : '';
    keyboard.setEra(eraId);
    engine.setEraAmbience(eraId);

    const order = ERAS.map((e) => e.id);
    const activeIndex = order.indexOf(eraId);
    for (const [id, hole] of holes) {
      const idx = order.indexOf(id);
      hole.classList.toggle('is-active', id === eraId);
      hole.classList.toggle('is-past', idx < activeIndex);
    }
  };

  // Pick the section closest to mid-viewport whenever visibility shifts.
  const visibility = new Map();
  const eraObserver = new IntersectionObserver((entries) => {
    for (const entry of entries) visibility.set(entry.target, entry.intersectionRatio);
    let best = null;
    let bestRatio = 0;
    for (const [section, ratio] of visibility) {
      if (ratio > bestRatio) { best = section; bestRatio = ratio; }
    }
    if (best && bestRatio > 0.12) applyEra(best.dataset.era);
  }, { threshold: [0, 0.12, 0.3, 0.5, 0.75, 1] });

  for (const section of sections) eraObserver.observe(section);

  /* ---------------- reveals ---------------- */
  const revealEls = document.querySelectorAll('.reveal');
  // Stagger siblings that enter together.
  const revealObserver = new IntersectionObserver((entries) => {
    let stagger = 0;
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      entry.target.style.setProperty('--reveal-delay', `${stagger * 0.12}s`);
      entry.target.classList.add('is-visible');
      revealObserver.unobserve(entry.target);
      stagger += 1;
    }
  }, { threshold: 0.15, rootMargin: '0px 0px -6% 0px' });

  for (const el of revealEls) revealObserver.observe(el);

  /* ---------------- parallax ---------------- */
  if (!reducedMotion) {
    const parallaxEls = [...document.querySelectorAll('[data-parallax]')];
    let ticking = false;
    const update = () => {
      ticking = false;
      const vh = window.innerHeight;
      for (const el of parallaxEls) {
        const rect = el.getBoundingClientRect();
        if (rect.bottom < 0 || rect.top > vh) continue;
        // -1 (below viewport) .. +1 (above); a gentle 26px total travel
        const progress = ((rect.top + rect.height / 2) / vh - 0.5) * 2;
        el.style.transform = `translateY(${(-progress * 13).toFixed(1)}px)`;
      }
    };
    window.addEventListener('scroll', () => {
      if (!ticking) { ticking = true; requestAnimationFrame(update); }
    }, { passive: true });
    update();
  }
}
