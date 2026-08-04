/**
 * keyboard.js — the playable keyboard dock, the site's signature element.
 *
 * All 88 keys (A0–C8) are always rendered, but only the current era's
 * compass is "real": keys outside it turn into ghosts ("not yet invented").
 * Scrolling through history therefore makes the keyboard visibly grow
 * from 4 octaves to 88 keys, while its timbre follows the era.
 *
 * Input: pointer (with glissando drag), touch, and computer keys
 * (Z-row = lower octave, Q-row = upper octave, ←/→ shifts octave).
 */

import { engine } from './audio/engine.js';
import { ERA_BY_ID } from './data/eras.js';

const FULL_LOW = 21;   // A0
const FULL_HIGH = 108; // C8
const BLACK_SEMITONES = new Set([1, 3, 6, 8, 10]);
const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

/** Physical-key → semitone offset, two manual rows like a tracker/DAW. */
const KEYMAP = {
  KeyZ: 0, KeyS: 1, KeyX: 2, KeyD: 3, KeyC: 4, KeyV: 5, KeyG: 6, KeyB: 7,
  KeyH: 8, KeyN: 9, KeyJ: 10, KeyM: 11, Comma: 12, KeyL: 13, Period: 14,
  KeyQ: 12, Digit2: 13, KeyW: 14, Digit3: 15, KeyE: 16, KeyR: 17, Digit5: 18,
  KeyT: 19, Digit6: 20, KeyY: 21, Digit7: 22, KeyU: 23, KeyI: 24,
};
/** Labels shown on the keys for the primary (Z + Q) rows. */
const KEY_HINTS = {
  0: 'Z', 2: 'X', 4: 'C', 5: 'V', 7: 'B', 9: 'N', 11: 'M',
  12: 'Q', 14: 'W', 16: 'E', 17: 'R', 19: 'T', 21: 'Y', 23: 'U', 24: 'I',
};

function midiName(midi) {
  return NOTE_NAMES[midi % 12] + (Math.floor(midi / 12) - 1);
}

export class KeyboardDock {
  constructor() {
    this.container = document.getElementById('dock-keys');
    this.eraLabel = document.getElementById('dock-era');
    this.rangeLabel = document.getElementById('dock-range');
    this.keys = new Map(); // midi -> element
    this.era = ERA_BY_ID.prelude;
    this.keyboardBase = 48; // MIDI note the Z key maps to
    this.pointerActive = false;
    this.heldCodes = new Map(); // physical code -> midi
    this.#build();
    this.#bindPointer();
    this.#bindComputerKeys();
  }

  /* ------------------------------ build ------------------------------ */

  #build() {
    const inner = document.createElement('div');
    inner.className = 'dock-keys-inner';

    const whiteMidis = [];
    for (let m = FULL_LOW; m <= FULL_HIGH; m += 1) {
      if (!BLACK_SEMITONES.has(m % 12)) whiteMidis.push(m);
    }
    const whiteW = 100 / whiteMidis.length;

    let whiteIndex = -1;
    for (let m = FULL_LOW; m <= FULL_HIGH; m += 1) {
      const isBlack = BLACK_SEMITONES.has(m % 12);
      if (!isBlack) whiteIndex += 1;
      const key = document.createElement('button');
      key.className = `piano-key ${isBlack ? 'is-black' : 'is-white'}`;
      key.dataset.midi = m;
      key.setAttribute('aria-label', `琴键 ${midiName(m)}`);
      key.tabIndex = -1; // pointer/computer-key driven; avoids 88 tab stops
      if (m === 60) key.classList.add('is-middle-c');
      if (isBlack) {
        key.style.left = `${(whiteIndex + 0.68) * whiteW}%`;
        key.style.width = `${whiteW * 0.62}%`;
      } else {
        key.style.left = `${whiteIndex * whiteW}%`;
        key.style.width = `${whiteW}%`;
      }
      const hint = document.createElement('span');
      hint.className = 'key-hint';
      key.appendChild(hint);
      inner.appendChild(key);
      this.keys.set(m, key);
    }
    this.container.appendChild(inner);
  }

  /* ------------------------------ input ------------------------------ */

  #bindPointer() {
    const keyFromEvent = (event) => event.target.closest('.piano-key');

    this.container.addEventListener('pointerdown', (event) => {
      const key = keyFromEvent(event);
      if (!key) return;
      event.preventDefault();
      this.pointerActive = true;
      this.#press(Number(key.dataset.midi), this.#velocityFromEvent(event, key));
    });

    // Glissando: slide across keys while the pointer is down.
    this.container.addEventListener('pointerover', (event) => {
      if (!this.pointerActive) return;
      const key = keyFromEvent(event);
      if (key) this.#press(Number(key.dataset.midi), 0.7);
    });

    window.addEventListener('pointerup', () => { this.pointerActive = false; });
    this.container.addEventListener('pointercancel', () => { this.pointerActive = false; });
  }

  /** Striking a white key lower on its face = louder, like a real hammer. */
  #velocityFromEvent(event, key) {
    const rect = key.getBoundingClientRect();
    const ratio = (event.clientY - rect.top) / rect.height;
    return 0.45 + Math.min(1, Math.max(0, ratio)) * 0.5;
  }

  #bindComputerKeys() {
    window.addEventListener('keydown', (event) => {
      if (event.repeat || event.metaKey || event.ctrlKey || event.altKey) return;
      if (/^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement?.tagName ?? '')) return;

      if (event.code === 'ArrowLeft' || event.code === 'ArrowRight') {
        const dir = event.code === 'ArrowLeft' ? -12 : 12;
        this.#setKeyboardBase(this.keyboardBase + dir);
        return;
      }
      const offset = KEYMAP[event.code];
      if (offset === undefined) return;
      const midi = this.keyboardBase + offset;
      if (this.heldCodes.has(event.code)) return;
      this.heldCodes.set(event.code, midi);
      this.#press(midi, 0.75);
    });

    window.addEventListener('keyup', (event) => {
      this.heldCodes.delete(event.code);
    });
  }

  /* ------------------------------ playback --------------------------- */

  #press(midi, velocity) {
    const [low, high] = this.era.range;
    if (midi < low || midi > high) return; // ghost keys stay silent
    engine.unlock();
    engine.playNote(midi, { velocity, timbre: this.era.timbre, eraId: this.era.id });
    this.flashKey(midi);
  }

  /** Visual key-down flash, also used by motif playback and the roll. */
  flashKey(midi, duration = 180) {
    const key = this.keys.get(midi);
    if (!key) return;
    key.classList.add('is-down');
    clearTimeout(key._flashTimer);
    key._flashTimer = setTimeout(() => key.classList.remove('is-down'), duration);
  }

  /* ------------------------------ era state --------------------------- */

  setEra(eraId) {
    const era = ERA_BY_ID[eraId];
    if (!era || era === this.era) return;
    this.era = era;
    const [low, high] = era.range;

    for (const [midi, key] of this.keys) {
      key.classList.toggle('is-ghost', midi < low || midi > high);
    }

    this.eraLabel.textContent = `${era.year} · ${era.name}`;
    this.rangeLabel.textContent = era.rangeLabel
      ? `${era.rangeLabel} · ${high - low + 1} KEYS`
      : `${midiName(low)}–${midiName(high)} · ${high - low + 1} KEYS`;

    // Re-anchor the computer-key rows near middle C, inside the compass.
    this.#setKeyboardBase(48);
    this.#scrollToRangeCenter(low, high);
  }

  #setKeyboardBase(base) {
    const [low, high] = this.era.range;
    const clamped = Math.min(Math.max(base, low), Math.max(low, high - 24));
    this.keyboardBase = clamped;
    for (const [midi, key] of this.keys) {
      const hintOffset = midi - clamped;
      key.querySelector('.key-hint').textContent = KEY_HINTS[hintOffset] ?? '';
    }
  }

  #scrollToRangeCenter(low, high) {
    const lowKey = this.keys.get(low);
    const highKey = this.keys.get(high);
    if (!lowKey || !highKey) return;
    const center = (lowKey.offsetLeft + highKey.offsetLeft + highKey.offsetWidth) / 2;
    this.container.scrollTo({
      left: center - this.container.clientWidth / 2,
      behavior: 'smooth',
    });
  }
}
