/**
 * anatomy.js — the "action dissection room".
 * Three schematic, animated cross-sections: Viennese Prellmechanik,
 * English grand action, and Érard's double escapement. Clicking the
 * diagram (or its button) fires the hammer and sounds a matching note.
 *
 * The SVGs are deliberately schematic — engraving-style line drawings,
 * not engineering blueprints. Moving parts are grouped (.g-key /
 * .g-jack / .g-hammer / .g-lever) and animated with CSS classes.
 */

import { engine } from './audio/engine.js';
import { ERA_BY_ID } from './data/eras.js';

const ACTIONS = [
  {
    id: 'viennese',
    label: '维也纳式 · 1770s',
    throwDeg: 34,
    note: '琴槌直接装在琴键上（叉形槌座），机构轻得近乎透明：触键的每一丝变化都立刻传到琴槌。<strong>轻、快、清晰</strong>——莫扎特珍爱的手感；代价是力量有限。',
    demo: (kb) => playDemo('vienna', [[0, 76, 0.6]], kb),
    svg: `
      <svg class="anatomy-svg" viewBox="0 0 460 250" style="--hammer-throw: 34deg" role="img" aria-label="维也纳式击弦机示意图">
        <line class="string-line" x1="60" y1="42" x2="420" y2="42" stroke-width="2"/>
        <text class="part-label" x="392" y="32">弦 STRING</text>
        <g class="frame-part" fill="none" stroke-width="2">
          <rect x="330" y="150" width="14" height="34" rx="2"/>
        </g>
        <text class="part-label" x="352" y="170">制动轨</text>
        <g class="g-key" style="transform-origin: 150px 205px">
          <g fill="none" stroke="currentColor" stroke-width="2">
            <rect x="30" y="198" width="310" height="14" rx="2"/>
          </g>
          <circle cx="150" cy="205" r="4" fill="currentColor"/>
          <g class="g-hammer" style="transform-origin: 285px 192px">
            <g class="moving-part" fill="none" stroke-width="2">
              <path d="M285 192 L172 128"/>
              <path d="M285 192 l24 -8" />
            </g>
            <ellipse class="hammer-head" cx="164" cy="122" rx="13" ry="10"/>
            <circle cx="285" cy="192" r="5" fill="none" stroke="currentColor" stroke-width="2"/>
          </g>
        </g>
        <text class="part-label" x="30" y="234">琴键 KEY（槌装于键上）</text>
        <text class="part-label" x="120" y="108">琴槌 HAMMER</text>
        <line class="part-line" x1="160" y1="112" x2="150" y2="98"/>
        <text class="part-label" x="256" y="176">叉形槌座 KAPSEL</text>
      </svg>`,
  },
  {
    id: 'english',
    label: '英式 · 1790s',
    throwDeg: 19,
    note: '琴槌铰接在独立的槌架上，由琴键上的<strong>顶杆</strong>推动；键程更深、杠杆更长，声音<strong>厚重宏大</strong>。贝多芬的布罗德伍德正是这种设计——力量的代价是重复稍慢。',
    demo: (kb) => playDemo('london', [[0, 48, 0.85]], kb),
    svg: `
      <svg class="anatomy-svg" viewBox="0 0 460 250" style="--hammer-throw: 19deg" role="img" aria-label="英式击弦机示意图">
        <line class="string-line" x1="60" y1="42" x2="420" y2="42" stroke-width="2"/>
        <text class="part-label" x="392" y="32">弦 STRING</text>
        <g class="frame-part" fill="none" stroke-width="2">
          <rect x="345" y="118" width="16" height="12" rx="2"/>
          <circle cx="303" cy="128" r="4"/>
        </g>
        <text class="part-label" x="286" y="114">断联钮 SET-OFF</text>
        <g class="g-hammer" style="transform-origin: 353px 140px">
          <g class="moving-part" fill="none" stroke-width="2">
            <path d="M353 140 L214 118"/>
          </g>
          <ellipse class="hammer-head" cx="204" cy="114" rx="13" ry="10"/>
          <circle cx="353" cy="140" r="5" fill="none" stroke="currentColor" stroke-width="2"/>
        </g>
        <text class="part-label" x="368" y="146">槌架铰链</text>
        <text class="part-label" x="150" y="98">琴槌 HAMMER</text>
        <g class="g-key" style="transform-origin: 195px 205px">
          <g fill="none" stroke="currentColor" stroke-width="2">
            <rect x="30" y="198" width="310" height="14" rx="2"/>
          </g>
          <circle cx="195" cy="205" r="4" fill="currentColor"/>
          <g class="g-jack" style="transform-origin: 318px 198px">
            <path class="moving-part" d="M318 198 L322 148 L334 143" fill="none" stroke-width="2"/>
          </g>
        </g>
        <text class="part-label" x="30" y="234">琴键 KEY</text>
        <text class="part-label" x="322" y="182">顶杆 JACK</text>
      </svg>`,
  },
  {
    id: 'erard',
    label: '埃拉尔双擒纵 · 1821',
    throwDeg: 19,
    doubleStrike: true,
    note: '<strong>复震杠杆</strong>（带弹簧）在琴槌回落一半时把它托住：琴键只需抬起一点点就能再次击弦。点击试试——琴槌会<strong>连击两次</strong>。今天每台三角钢琴的击弦机都是它的后代。',
    demo: (kb) => playDemo('erard', [[0, 76, 0.7], [0.22, 76, 0.85]], kb),
    svg: `
      <svg class="anatomy-svg" viewBox="0 0 460 250" style="--hammer-throw: 19deg" role="img" aria-label="埃拉尔双重擒纵机构示意图">
        <line class="string-line" x1="60" y1="42" x2="420" y2="42" stroke-width="2"/>
        <text class="part-label" x="392" y="32">弦 STRING</text>
        <g class="frame-part" fill="none" stroke-width="2">
          <circle cx="303" cy="122" r="4"/>
        </g>
        <g class="g-hammer" style="transform-origin: 353px 138px">
          <g class="moving-part" fill="none" stroke-width="2">
            <path d="M353 138 L214 116"/>
          </g>
          <ellipse class="hammer-head" cx="204" cy="112" rx="13" ry="10"/>
          <circle cx="353" cy="138" r="5" fill="none" stroke="currentColor" stroke-width="2"/>
        </g>
        <text class="part-label" x="150" y="96">琴槌 HAMMER</text>
        <g class="g-key" style="transform-origin: 195px 205px">
          <g fill="none" stroke="currentColor" stroke-width="2">
            <rect x="30" y="198" width="310" height="14" rx="2"/>
          </g>
          <circle cx="195" cy="205" r="4" fill="currentColor"/>
          <g class="g-lever" style="transform-origin: 336px 160px">
            <path class="moving-part" d="M252 160 L342 156" fill="none" stroke-width="2.4"/>
            <path class="moving-part" d="M282 162 l6 8 l6 -8 l6 8 l6 -8" fill="none" stroke-width="1.3"/>
          </g>
          <g class="g-jack" style="transform-origin: 318px 198px">
            <path class="moving-part" d="M318 198 L322 150" fill="none" stroke-width="2"/>
          </g>
          <path class="moving-part" d="M246 198 L240 158" fill="none" stroke-width="2"/>
        </g>
        <text class="part-label" x="30" y="234">琴键 KEY</text>
        <text class="part-label" x="196" y="152">回止 CHECK</text>
        <text class="part-label" x="238" y="186">复震杠杆 + 弹簧 REPETITION LEVER</text>
      </svg>`,
  },
];

/** Play the demo notes with a given era's timbre, flashing dock keys. */
function playDemo(eraId, seq, keyboard) {
  engine.unlock();
  const era = ERA_BY_ID[eraId] ?? ERA_BY_ID.erard;
  for (const [delay, midi, vel] of seq) {
    setTimeout(() => {
      engine.playNote(midi, { velocity: vel, timbre: era.timbre, eraId: era.id });
      keyboard?.flashKey(midi);
    }, delay * 1000);
  }
}

export function initAnatomy(keyboard) {
  const host = document.getElementById('anatomy-widget');

  const tabs = document.createElement('div');
  tabs.className = 'anatomy-tabs reveal';
  const stage = document.createElement('div');
  stage.className = 'anatomy-stage reveal';
  host.append(tabs, stage);

  let current = null;
  let animating = false;

  const render = (action) => {
    current = action;
    stage.innerHTML = `
      ${action.svg}
      <div class="anatomy-caption">
        <p class="anatomy-note">${action.note}</p>
        <button class="motif-btn anatomy-strike" data-cursor>
          <span class="motif-icon" aria-hidden="true"></span>按下琴键
        </button>
      </div>`;
    for (const btn of tabs.children) {
      btn.classList.toggle('is-active', btn.dataset.id === action.id);
    }
    const svg = stage.querySelector('svg');
    const strike = () => triggerStrike(svg, action);
    svg.addEventListener('click', strike);
    svg.style.cursor = 'pointer';
    stage.querySelector('.anatomy-strike').addEventListener('click', strike);
  };

  const triggerStrike = (svg, action) => {
    if (animating) return;
    animating = true;
    action.demo(keyboard);
    svg.classList.add('is-striking');
    if (action.doubleStrike) {
      // Fall halfway, get caught by the repetition lever, strike again.
      setTimeout(() => { svg.classList.remove('is-striking'); svg.classList.add('is-repeating'); }, 190);
      setTimeout(() => { svg.classList.remove('is-repeating'); svg.classList.add('is-striking'); }, 330);
      setTimeout(() => { svg.classList.remove('is-striking'); animating = false; }, 620);
    } else {
      setTimeout(() => { svg.classList.remove('is-striking'); animating = false; }, 420);
    }
  };

  for (const action of ACTIONS) {
    const tab = document.createElement('button');
    tab.className = 'anatomy-tab';
    tab.dataset.id = action.id;
    tab.dataset.cursor = '';
    tab.textContent = action.label;
    tab.addEventListener('click', () => render(action));
    tabs.appendChild(tab);
  }

  render(ACTIONS[0]);
}
