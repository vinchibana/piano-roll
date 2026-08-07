/**
 * pianoroll.js — the punched paper roll, the site's visual motif.
 *
 *   initHeroCanvas()  — ambient drifting roll behind the hero title
 *   initRollPlayer()  — a working player-piano: a punched roll of
 *                       Scott Joplin's "The Entertainer" (1902, public
 *                       domain) plays real notes as holes cross the
 *                       tracker bar.
 */

import { engine } from './audio/engine.js';
import { ERA_BY_ID } from './data/eras.js';

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const ENGLISH = document.documentElement.lang.startsWith('en');
const t = (zh, en) => ENGLISH ? en : zh;

/* ==========================================================================
   Hero ambience
   ========================================================================== */

export function initHeroCanvas() {
  const canvas = document.getElementById('hero-canvas');
  const ctx = canvas.getContext('2d');
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  let width = 0;
  let height = 0;
  let holes = [];

  const resize = () => {
    width = canvas.clientWidth;
    height = canvas.clientHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    seed();
    if (reducedMotion) draw(0);
  };

  const seed = () => {
    holes = [];
    const lanes = Math.floor(width / 26);
    const count = Math.floor((width * height) / 16000);
    for (let i = 0; i < count; i += 1) {
      holes.push({
        lane: Math.floor(Math.random() * lanes),
        y: Math.random() * height,
        len: 14 + Math.random() * 60,
        speed: 8 + Math.random() * 14,
        alpha: 0.06 + Math.random() * 0.16,
      });
    }
  };

  let last = performance.now();
  const draw = (now) => {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    ctx.clearRect(0, 0, width, height);

    // Faint lane rules, like the printed guides on a roll.
    ctx.strokeStyle = 'rgba(236, 228, 210, 0.045)';
    ctx.lineWidth = 1;
    for (let x = 13; x < width; x += 26) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }

    for (const hole of holes) {
      if (!reducedMotion) {
        hole.y += hole.speed * dt;
        if (hole.y - hole.len > height) { hole.y = -hole.len; hole.lane = Math.floor(Math.random() * (width / 26)); }
      }
      const x = hole.lane * 26 + 13;
      ctx.fillStyle = `rgba(201, 168, 106, ${hole.alpha})`;
      roundedRect(ctx, x - 4, hole.y - hole.len, 8, hole.len, 4);
      ctx.fill();
    }
    if (!reducedMotion) requestAnimationFrame(draw);
  };

  new ResizeObserver(resize).observe(canvas);
  resize();
  if (!reducedMotion) requestAnimationFrame(draw);
}

function roundedRect(ctx, x, y, w, h, r) {
  const radius = Math.min(r, h / 2, w / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

/* ==========================================================================
   "The Entertainer" — encoded straight from the sheet, simplified.
   Times are in eighth notes; [tEighth, midi, durEighths, velocity].
   ========================================================================== */

function buildScore() {
  const notes = [];
  const add = (t, midi, dur = 1, vel = 0.72) => notes.push([t, midi, dur, vel]);

  // Intro: the famous two-octave descending run.
  const run = [74, 76, 72, 69, 71, 67, 62, 64, 60, 57, 59, 55, 50, 52, 48, 45];
  run.forEach((midi, i) => add(i, midi, 1, 0.66 + (i % 2) * 0.06));
  add(16, 47, 1, 0.7);
  add(17, 43, 3, 0.72);

  // Main strain, twice; T = phrase start in eighths.
  const phrase = (T, endVariant) => {
    // Right hand — syncopated octave-call motif.
    const rh = [
      [0, 63, 1], [1, 64, 1], [2, 72, 2], [4, 64, 1], [5, 72, 2],
      [7, 64, 1], [8, 72, 3],
      [11, 72, 1], [12, 74, 1], [13, 75, 1], [14, 76, 1], [15, 72, 1],
      [16, 74, 1], [17, 76, 2], [19, 71, 1], [20, 74, 2],
    ];
    for (const [t, midi, dur] of rh) add(T + t, midi, dur, 0.74);
    if (endVariant === 'open') {
      add(T + 22, 72, 4, 0.76);
    } else {
      // Closing turn: … c' – d' – c'
      add(T + 22, 72, 1, 0.74);
      add(T + 23, 76, 1, 0.7);
      add(T + 24, 72, 1, 0.74);
      add(T + 25, 67, 1, 0.66);
      add(T + 26, 60, 4, 0.78);
      add(T + 26, 48, 4, 0.7);
      add(T + 26, 55, 4, 0.6);
    }
    // Left hand — oom-pah: bass note, then a small chord.
    const bass = [
      [0, [36]], [2, [52, 55]], [4, [43]], [6, [52, 55]],
      [8, [36]], [10, [52, 55]], [12, [41]], [14, [53, 57]],
      [16, [43]], [18, [50, 53]], [20, [36]],
    ];
    for (const [t, midis] of bass) {
      for (const midi of midis) add(T + t, midi, 1, midis.length > 1 ? 0.42 : 0.6);
    }
  };

  phrase(21, 'open');
  phrase(48, 'closed');

  notes.sort((a, b) => a[0] - b[0]);
  const total = Math.max(...notes.map(([t, , d]) => t + d));
  return { notes, total };
}

/* ==========================================================================
   Roll player widget
   ========================================================================== */

export function initRollPlayer(keyboard) {
  const host = document.getElementById('roll-player');
  host.innerHTML = `
    <div class="roll-frame">
      <canvas class="roll-canvas" height="430"></canvas>
    </div>
    <div class="roll-controls">
      <button class="roll-play" data-cursor><span class="roll-play-label">${t('播放纸卷', 'Play the roll')}</span></button>
      <span class="roll-tune mono">SCOTT JOPLIN · THE ENTERTAINER · 1902 · 88-NOTE ROLL</span>
    </div>`;

  const canvas = host.querySelector('.roll-canvas');
  const playBtn = host.querySelector('.roll-play');
  const playLabel = host.querySelector('.roll-play-label');
  const ctx = canvas.getContext('2d');
  const dpr = Math.min(window.devicePixelRatio || 1, 2);

  const { notes, total } = buildScore();
  const BPM = 92;
  const EIGHTH = 60 / BPM / 2;           // seconds per eighth note
  const PX_PER_SECOND = 66;              // paper speed

  let width = 0;
  let height = 0;
  let playing = false;
  let startTime = 0;                     // engine-clock time of eighth 0
  let nextIndex = 0;
  let rafId = 0;

  const resize = () => {
    width = canvas.clientWidth;
    height = 430;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    drawFrame(playing ? nowSeconds() : -1.5);
  };

  const nowSeconds = () => (engine.ctx ? engine.ctx.currentTime - startTime : 0);

  const laneX = (midi) => {
    const margin = 46;
    return margin + ((midi - 21) / 87) * (width - margin * 2);
  };

  function drawFrame(now) {
    const trackerY = height - 64;
    ctx.clearRect(0, 0, width, height);

    // Paper
    const paper = ctx.createLinearGradient(0, 0, 0, height);
    paper.addColorStop(0, '#d9c69b');
    paper.addColorStop(0.5, '#e4d3a9');
    paper.addColorStop(1, '#d3bf92');
    ctx.fillStyle = paper;
    ctx.fillRect(18, 0, width - 36, height);

    // Curled paper shadow at edges
    const edge = ctx.createLinearGradient(0, 0, 26, 0);
    edge.addColorStop(0, 'rgba(40,28,10,0.55)');
    edge.addColorStop(1, 'rgba(40,28,10,0)');
    ctx.fillStyle = edge;
    ctx.fillRect(18, 0, 26, height);
    const edge2 = ctx.createLinearGradient(width - 44, 0, width - 18, 0);
    edge2.addColorStop(0, 'rgba(40,28,10,0)');
    edge2.addColorStop(1, 'rgba(40,28,10,0.55)');
    ctx.fillStyle = edge2;
    ctx.fillRect(width - 44, 0, 26, height);

    // Sprocket holes
    ctx.fillStyle = 'rgba(30, 20, 8, 0.8)';
    const sprocketPhase = (now * PX_PER_SECOND) % 22;
    for (let y = -22 + sprocketPhase; y < height + 22; y += 22) {
      ctx.beginPath();
      ctx.arc(30, y, 2.6, 0, Math.PI * 2);
      ctx.arc(width - 30, y, 2.6, 0, Math.PI * 2);
      ctx.fill();
    }

    // Octave guide rules (every C)
    ctx.strokeStyle = 'rgba(90, 66, 28, 0.22)';
    ctx.lineWidth = 1;
    for (let midi = 24; midi <= 108; midi += 12) {
      const x = laneX(midi);
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }

    // Note holes
    for (const [tEighth, midi, durEighth] of notes) {
      const ts = tEighth * EIGHTH;
      const durS = durEighth * EIGHTH;
      const yBottom = trackerY + (now - ts) * PX_PER_SECOND;
      const len = Math.max(10, durS * PX_PER_SECOND - 4);
      const yTop = yBottom - len;
      if (yBottom < -10 || yTop > height + 10) continue;
      const active = now >= ts && now <= ts + durS + 0.1;
      const x = laneX(midi);
      ctx.fillStyle = active ? '#8a5a18' : 'rgba(32, 22, 8, 0.92)';
      roundedRect(ctx, x - 3.4, yTop, 6.8, len, 3.4);
      ctx.fill();
      if (active) {
        ctx.fillStyle = 'rgba(229, 172, 74, 0.35)';
        ctx.beginPath();
        ctx.arc(x, trackerY, 9, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Tracker bar (the brass "reading" bar)
    const bar = ctx.createLinearGradient(0, trackerY - 5, 0, trackerY + 5);
    bar.addColorStop(0, '#8f6a2c');
    bar.addColorStop(0.5, '#e2b45e');
    bar.addColorStop(1, '#77551f');
    ctx.fillStyle = bar;
    ctx.fillRect(18, trackerY - 4, width - 36, 8);
    ctx.fillStyle = 'rgba(20, 12, 2, 0.65)';
    for (let midi = 21; midi <= 108; midi += 3) {
      ctx.fillRect(laneX(midi) - 1, trackerY - 2, 2, 4);
    }

    // Title printed on the leader paper before the music starts
    if (now < 0.5) {
      ctx.save();
      ctx.globalAlpha = Math.max(0, Math.min(1, (0.5 - now) / 1.2));
      ctx.fillStyle = '#5a421c';
      ctx.font = '600 15px "IBM Plex Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('THE ENTERTAINER — S. JOPLIN', width / 2, trackerY + (now * PX_PER_SECOND) - 130);
      ctx.font = '11px "IBM Plex Mono", monospace';
      ctx.fillText('TEMPO 92 · PLAYED BY PAPER', width / 2, trackerY + (now * PX_PER_SECOND) - 108);
      ctx.restore();
    }
  }

  function tick() {
    const now = nowSeconds();
    // Fire notes whose start time has been crossed by the tracker bar.
    while (nextIndex < notes.length && notes[nextIndex][0] * EIGHTH <= now) {
      const [, midi, durEighth, vel] = notes[nextIndex];
      const era = ERA_BY_ID.roll;
      engine.playNote(midi, { velocity: vel, timbre: era.timbre, eraId: era.id });
      keyboard.flashKey(midi, Math.max(160, durEighth * EIGHTH * 1000));
      nextIndex += 1;
    }
    drawFrame(now);
    if (now > total * EIGHTH + 2.5) {
      // Rewind the roll and keep playing.
      startTime = engine.ctx.currentTime + 1.2;
      nextIndex = 0;
    }
    if (playing) rafId = requestAnimationFrame(tick);
  }

  const stop = () => {
    playing = false;
    cancelAnimationFrame(rafId);
    playLabel.textContent = t('播放纸卷', 'Play the roll');
    playBtn.classList.remove('is-playing');
    drawFrame(-1.5);
  };

  playBtn.addEventListener('click', () => {
    if (playing) { stop(); return; }
    engine.unlock();
    playing = true;
    playLabel.textContent = t('停止', 'Stop');
    playBtn.classList.add('is-playing');
    startTime = engine.ctx.currentTime + 1.4; // leader paper rolls in first
    nextIndex = 0;
    rafId = requestAnimationFrame(tick);
  });

  // Pause the pneumatics when the section scrolls far away.
  const io = new IntersectionObserver((entries) => {
    if (!entries[0].isIntersecting && playing) stop();
  }, { threshold: 0 });
  io.observe(host);

  new ResizeObserver(resize).observe(canvas);
  resize();
}
