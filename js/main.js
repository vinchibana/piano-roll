/**
 * main.js — wires every module together.
 */

import { engine } from './audio/engine.js';
import { ERA_BY_ID } from './data/eras.js';
import { KeyboardDock } from './keyboard.js';

// Test hook: ?noanim renders everything instantly (used for screenshots/QA).
if (new URLSearchParams(location.search).has('noanim')) {
  document.documentElement.classList.add('force-visible');
}
import { initScroll } from './scroll.js';
import { initCursor } from './cursor.js';
import { initHeroCanvas, initRollPlayer } from './pianoroll.js';
import { initAnatomy } from './anatomy.js';
import { initRangeViz } from './rangeviz.js';
import { initGallery } from './gallery.js';
import { initPlaylists } from './playlists.js';

const ENGLISH = document.documentElement.lang.startsWith('en');
const t = (zh, en) => ENGLISH ? en : zh;

const keyboard = new KeyboardDock();
keyboard.setEra('prelude');

initCursor();
initHeroCanvas();
// Content-injecting modules must run BEFORE initScroll: they create
// .reveal elements that the scroll module's IntersectionObserver collects.
initAnatomy(keyboard);
initRangeViz(keyboard);
initRollPlayer(keyboard);
initGallery();
initPlaylists();
initScroll(keyboard);

/* ------------------------------------------------------------------ */
/* Toast helper                                                        */
/* ------------------------------------------------------------------ */

const toast = document.getElementById('audio-toast');
let toastTimer = null;

function showToast(message, duration = 3200) {
  toast.textContent = message;
  toast.classList.add('is-visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('is-visible'), duration);
}

/* ------------------------------------------------------------------ */
/* Sound unlock & mute toggle                                          */
/* ------------------------------------------------------------------ */

const soundToggle = document.getElementById('sound-toggle');
const soundLabel = document.getElementById('sound-label');

function setSoundUI(on) {
  soundToggle.setAttribute('aria-pressed', String(on));
  soundLabel.textContent = on ? t('声音 开', 'Sound on') : t('声音 关', 'Sound off');
}

soundToggle.addEventListener('click', () => {
  if (!engine.unlocked) {
    engine.unlock();
    setSoundUI(true);
    showToast(t('声音已开启 · 弹弹下方的琴键吧', 'Sound is on · try the keyboard below'));
    return;
  }
  const nowMuted = !engine.muted;
  engine.setMuted(nowMuted);
  setSoundUI(!nowMuted);
});

const beginBtn = document.getElementById('begin-btn');
beginBtn.addEventListener('click', () => {
  engine.unlock();
  engine.setMuted(false);
  setSoundUI(true);

  // A soft prelude chord confirms that audio is alive.
  const era = ERA_BY_ID.prelude;
  engine.playMotif(era, { onNote: (midi) => keyboard.flashKey(midi, 400) });

  showToast(t('声音已开启 · 向下滚动，键盘会随时代改变', 'Sound is on · scroll to hear the keyboard change with time'));
  document.getElementById('cristofori').scrollIntoView({ behavior: 'smooth' });
});

// Any first interaction with the keys also unlocks audio
// (covers users who skip the hero button and go straight to the keyboard).
document.getElementById('dock-keys').addEventListener('pointerdown', () => {
  const wasLocked = !engine.unlocked;
  engine.unlock();
  if (wasLocked) setSoundUI(true);
}, { capture: true });

/* ------------------------------------------------------------------ */
/* Era motif buttons（聆听这个时代）                                     */
/* ------------------------------------------------------------------ */

let playingBtn = null;

for (const btn of document.querySelectorAll('.motif-btn[data-motif]')) {
  btn.addEventListener('click', async () => {
    engine.unlock();
    setSoundUI(true);
    if (engine.muted) engine.setMuted(false);

    if (playingBtn === btn) {
      engine.stopMotif();
      btn.classList.remove('is-playing');
      playingBtn = null;
      return;
    }
    playingBtn?.classList.remove('is-playing');
    playingBtn = btn;
    btn.classList.add('is-playing');

    const era = ERA_BY_ID[btn.dataset.motif];
    await engine.playMotif(era, {
      onNote: (midi) => keyboard.flashKey(midi, 300),
      onDone: () => {
        if (playingBtn === btn) {
          btn.classList.remove('is-playing');
          playingBtn = null;
        }
      },
    });
  });
}

/* ------------------------------------------------------------------ */
/* Keyboard dock collapse                                              */
/* ------------------------------------------------------------------ */

const dock = document.getElementById('dock');
const dockToggle = document.getElementById('dock-toggle');

dockToggle.addEventListener('click', () => {
  const collapsed = dock.dataset.collapsed === 'true';
  dock.dataset.collapsed = String(!collapsed);
  dockToggle.setAttribute('aria-expanded', String(collapsed));
  dockToggle.textContent = collapsed ? t('收起键盘', 'Hide keyboard') : t('展开键盘', 'Show keyboard');
});
