/**
 * rangeviz.js — "音域的三百年": how the compass grew from 49 keys to 88.
 * Each era is a bar over an 88-key baseline strip. Hovering a row dims
 * the keys outside that era's compass; clicking plays its lowest and
 * highest note with that era's timbre.
 */

import { engine } from './audio/engine.js';
import { ERA_BY_ID } from './data/eras.js';

const FULL_LOW = 21;
const FULL_SPAN = 88;
const BLACK_SEMITONES = new Set([1, 3, 6, 8, 10]);

const ROWS = [
  { eraId: 'cristofori', year: '1700', label: '克里斯托福里', low: 36, high: 84 },
  { eraId: 'vienna', year: '1777', label: '施泰因 / 瓦尔特', low: 29, high: 89 },
  { eraId: 'london', year: '1818', label: '布罗德伍德', low: 24, high: 96 },
  { eraId: 'erard', year: '1821', label: '埃拉尔', low: 24, high: 101 },
  { eraId: 'iron', year: '1859', label: '施坦威', low: 21, high: 105 },
  { eraId: 'coda', year: '1880s—今', label: '现代标准 88 键', low: 21, high: 108 },
];

export function initRangeViz(keyboard) {
  const host = document.getElementById('compass-viz');

  const rowsEl = document.createElement('div');
  rowsEl.className = 'compass-rows';

  const keysEl = document.createElement('div');
  keysEl.className = 'compass-keys';
  const keyEls = new Map();

  // 88-key baseline strip (same geometry as the dock, in miniature)
  const whiteCount = countWhites(FULL_LOW, FULL_LOW + FULL_SPAN - 1);
  const whiteW = 100 / whiteCount;
  let whiteIndex = -1;
  for (let midi = FULL_LOW; midi < FULL_LOW + FULL_SPAN; midi += 1) {
    const isBlack = BLACK_SEMITONES.has(midi % 12);
    if (!isBlack) whiteIndex += 1;
    const key = document.createElement('i');
    key.className = `ck ${isBlack ? 'is-black' : 'is-white'}`;
    if (isBlack) {
      key.style.left = `${(whiteIndex + 0.68) * whiteW}%`;
      key.style.width = `${whiteW * 0.6}%`;
    } else {
      key.style.left = `${whiteIndex * whiteW}%`;
      key.style.width = `${whiteW}%`;
    }
    keysEl.appendChild(key);
    keyEls.set(midi, key);
  }

  const setDim = (low, high) => {
    for (const [midi, el] of keyEls) {
      el.classList.toggle('is-dim', low !== null && (midi < low || midi > high));
    }
  };

  for (const row of ROWS) {
    const rowEl = document.createElement('div');
    rowEl.className = 'compass-row';
    const keys = row.high - row.low + 1;
    const leftPct = ((row.low - FULL_LOW) / FULL_SPAN) * 100;
    const widthPct = (keys / FULL_SPAN) * 100;
    rowEl.innerHTML = `
      <span class="compass-row-label">${row.year}<b>${row.label}</b></span>
      <span class="compass-track">
        <button class="compass-bar" data-cursor style="left:${leftPct}%;width:${widthPct}%"
          aria-label="${row.label}，${keys} 键，点击试听最低音与最高音">
          <span class="compass-count">${keys} 键</span>
        </button>
      </span>`;

    const bar = rowEl.querySelector('.compass-bar');
    rowEl.addEventListener('mouseenter', () => setDim(row.low, row.high));
    rowEl.addEventListener('mouseleave', () => setDim(null));
    bar.addEventListener('click', () => {
      engine.unlock();
      const era = ERA_BY_ID[row.eraId];
      engine.playNote(row.low, { velocity: 0.8, timbre: era.timbre, eraId: era.id });
      keyboard?.flashKey(row.low, 400);
      setTimeout(() => {
        engine.playNote(row.high, { velocity: 0.7, timbre: era.timbre, eraId: era.id });
        keyboard?.flashKey(row.high, 400);
      }, 450);
    });
    rowsEl.appendChild(rowEl);
  }

  const legend = document.createElement('div');
  legend.className = 'compass-legend';
  legend.innerHTML = '<span>A0 · 27.5 Hz</span><span>中央 C</span><span>C8 · 4186 Hz</span>';

  host.append(rowsEl, keysEl, legend);
}

function countWhites(low, high) {
  let count = 0;
  for (let midi = low; midi <= high; midi += 1) {
    if (!BLACK_SEMITONES.has(midi % 12)) count += 1;
  }
  return count;
}
