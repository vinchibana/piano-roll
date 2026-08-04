/**
 * gallery.js — "观察机构": real photographs & period engravings of each
 * era's piano action, shown in a museum-plate style lightbox.
 *
 * Every asset is a verified direct link from Wikimedia Commons
 * (public domain / CC0 / CC BY / CC BY-SA, noted per item).
 * The modal supports Esc + backdrop close, focus restore, and
 * prefers-reduced-motion.
 */

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** eraId → mechanism exhibit. Credits shown verbatim in the caption. */
const ACTION_MEDIA = {
  cristofori: {
    src: 'https://upload.wikimedia.org/wikipedia/commons/6/6e/Britannica_Pianoforte_Cristofori_Escapement_Action.png',
    alt: '克里斯托福里 1726 年击弦机构剖面版画',
    title: '克里斯托福里的擒纵击弦机 · 1726',
    note: '注意琴槌下方的可动顶杆（hopper）：琴槌被抛出后它立刻侧倾让位，琴槌自由回落——「触感即强弱」的全部秘密都在这一厘米的机械里。图为 1911 年《大英百科全书》所刊剖面版画，依莱比锡藏 1726 年原琴绘制。',
    credit: '《大英百科全书》第十一版（1911）· Wikimedia Commons · 公有领域',
  },
  silbermann: {
    src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c8/Hammerfl%C3%BCgelmechanik_Silbermann.jpg/1280px-Hammerfl%C3%BCgelmechanik_Silbermann.jpg',
    alt: '西尔伯曼式击弦机构模型照片',
    title: '西尔伯曼的击弦机构（模型）',
    note: '西尔伯曼几乎原样继承了克里斯托福里的设计——巴赫抱怨过的琴键重量，问题就出在这些杠杆的配重上。他后来的改进让腓特烈大帝一口气买下了多台。',
    credit: '击弦机构模型照片 · Wikimedia Commons · CC0（公有领域贡献）',
  },
  vienna: {
    src: 'https://upload.wikimedia.org/wikipedia/commons/f/f4/Britannica_Pianoforte_Stein_Action.png',
    alt: '施泰因维也纳式击弦机构剖面版画',
    title: '施泰因的维也纳式击弦机 · 1770s',
    note: '琴槌装在琴键上的叉形槌座（Kapsel）里，槌头朝向演奏者。整套机构只有寥寥数件，轻得近乎透明——这就是莫扎特信里「永远不会糊掉」的机敏。',
    credit: '《大英百科全书》第十一版（1911）· Wikimedia Commons · 公有领域',
  },
  london: {
    src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2d/Fortepian_-_mechanizm_angielski.svg/1280px-Fortepian_-_mechanizm_angielski.svg.png',
    alt: '英式三角钢琴击弦机构示意图',
    title: '英式大击弦机（English Grand Action）',
    note: '琴槌铰接在独立槌架上、槌头背向演奏者，由琴键上的顶杆推起。杠杆更长、键程更深，换来贝多芬需要的雷鸣——布罗德伍德赠琴用的正是这套机构。',
    credit: '示意图 · Wikimedia Commons · CC BY-SA 3.0',
  },
  erard: {
    src: 'https://upload.wikimedia.org/wikipedia/commons/1/19/Britannica_Pianoforte_Erard_Double_Escapement_Action.png',
    alt: '埃拉尔双重擒纵机构剖面版画',
    title: '埃拉尔的双重擒纵机构 · 1821',
    note: '比英式机构多出的那根带弹簧的复震杠杆，会在琴槌半落时把它托住。手指只需松开几毫米，就能再次击弦。这张版画里的每一个零件，今天仍能在任何一台三角钢琴里找到后代。',
    credit: '《大英百科全书》第十一版（1911）· Wikimedia Commons · 公有领域',
  },
  iron: {
    src: 'https://upload.wikimedia.org/wikipedia/commons/5/5f/Britannica_Pianoforte_Steinway_Grand_Piano_Action.png',
    alt: '施坦威三角钢琴击弦机构剖面版画',
    title: '施坦威三角钢琴击弦机 · 19 世纪末',
    note: '埃拉尔设计的工业化成熟形态：滚轮、复震杠杆、回止、断联调节——数十个零件为每个琴键复制一套，88 键就是数千个零件在铸铁的轰鸣之下精密协作。',
    credit: '《大英百科全书》第十一版（1911）· Wikimedia Commons · 公有领域',
  },
  liszt: {
    src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/ca/Budapest%2C_Hungarian_National_Museum%2C_Broadwood_piano_once_belonging_to_Beethoven_and_Liszt.jpg/1280px-Budapest%2C_Hungarian_National_Museum%2C_Broadwood_piano_once_belonging_to_Beethoven_and_Liszt.jpg',
    alt: '布达佩斯匈牙利国家博物馆藏，曾先后属于贝多芬与李斯特的布罗德伍德钢琴',
    title: '一台传了两代人的琴',
    note: '这台 1817 年的布罗德伍德正是当年赠予贝多芬的那台。贝多芬去世后几经辗转，1846 年被李斯特购藏，视若圣物——炫技之王的书房里，供着前一个时代的雷声。现藏布达佩斯匈牙利国家博物馆。',
    credit: '摄影 · Wikimedia Commons · CC BY 4.0',
  },
  modern20: {
    src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Donaueschingen-_Donaueschinger_Musiktage%3B_Mr._Cage_am_reparierten_Fl%C3%BCgel_-_LABW_-_Staatsarchiv_Freiburg_W_134_Nr._039531a.jpeg/1280px-Donaueschingen-_Donaueschinger_Musiktage%3B_Mr._Cage_am_reparierten_Fl%C3%BCgel_-_LABW_-_Staatsarchiv_Freiburg_W_134_Nr._039531a.jpeg',
    alt: '约翰·凯奇在多瑙埃辛根音乐节调整预置钢琴，1954 年',
    title: '凯奇与他的预置钢琴 · 1954',
    note: '多瑙埃辛根音乐节的后台：凯奇俯身在琴弦之间安放螺栓与橡胶。档案原注把这台琴写成「修理过的钢琴」（reparierten Flügel）——一个美丽的误会。',
    credit: '巴登-符腾堡州立档案馆（弗赖堡国家档案馆）· Wikimedia Commons · CC BY 4.0',
  },
  electric: {
    src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a0/Fender_Rhodes_%28Inside%29.jpg/1280px-Fender_Rhodes_%28Inside%29.jpg',
    alt: 'Fender Rhodes 电钢琴内部：琴槌、音叉与拾音器',
    title: 'Rhodes 的内部：音叉与拾音器',
    note: '掀开琴盖：每个琴键对应一根金属音叉（tine）与一个电磁拾音器，琴槌仍在，音板没了。木头与琴弦的三百年传统，在这里换成了钢、磁与电流。',
    credit: '照片 · Wikimedia Commons · CC BY-SA 3.0',
  },
  digital: {
    src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/22/Yamaha_DX7_synthesizer_-_combined_image_with_diagonal_and_top_views.jpg/1280px-Yamaha_DX7_synthesizer_-_combined_image_with_diagonal_and_top_views.jpg',
    alt: '雅马哈 DX7 合成器，斜视与俯视组合图',
    title: 'Yamaha DX7 · 1983',
    note: '这里已经没有任何击弦机构可以解剖——61 个琴键下只有开关与芯片，六个 FM 算子在硅片上振荡。「机构」变成了算法，这正是数字时代的全部隐喻。',
    credit: '照片 · Wikimedia Commons · CC BY 4.0',
  },
  roll: {
    src: 'https://upload.wikimedia.org/wikipedia/commons/d/de/Britannica_Pianoforte_Modern_Pianola.png',
    alt: '自动钢琴（Pianola）气动机构剖面版画',
    title: 'Pianola 的气动机构 · 约 1910',
    note: '纸卷上的孔洞经过读取杆时接通气路，风箱驱动木指按下真实的琴键。图为《大英百科全书》所刊的自动演奏机构剖面——一台用空气编程的机器人。',
    credit: '《大英百科全书》第十一版（1911）· Wikimedia Commons · 公有领域',
  },
};

/* ------------------------------------------------------------------ */
/* Modal                                                                */
/* ------------------------------------------------------------------ */

function buildModal() {
  const modal = document.createElement('div');
  modal.className = 'gallery-modal';
  modal.hidden = true;
  modal.setAttribute('role', 'dialog');
  modal.setAttribute('aria-modal', 'true');
  modal.setAttribute('aria-labelledby', 'gallery-title');
  modal.innerHTML = `
    <div class="gallery-backdrop" data-gallery-close></div>
    <figure class="gallery-panel">
      <button class="gallery-close mono" data-gallery-close data-cursor aria-label="关闭">关闭 · ESC</button>
      <div class="gallery-media"><img alt=""></div>
      <figcaption class="gallery-caption">
        <h3 class="gallery-title" id="gallery-title"></h3>
        <p class="gallery-note"></p>
        <p class="gallery-credit mono"></p>
      </figcaption>
    </figure>`;
  document.body.appendChild(modal);
  return modal;
}

export function initGallery() {
  const modal = buildModal();
  const img = modal.querySelector('img');
  const titleEl = modal.querySelector('.gallery-title');
  const noteEl = modal.querySelector('.gallery-note');
  const creditEl = modal.querySelector('.gallery-credit');
  let lastFocused = null;

  const open = (media, opener) => {
    lastFocused = opener;
    img.src = media.src;
    img.alt = media.alt;
    modal.classList.add('is-loading');
    img.onload = () => modal.classList.remove('is-loading');
    img.onerror = () => modal.classList.remove('is-loading');
    titleEl.textContent = media.title;
    noteEl.textContent = media.note;
    creditEl.textContent = `来源：${media.credit}`;
    modal.hidden = false;
    document.body.style.overflow = 'hidden';
    requestAnimationFrame(() => modal.classList.add('is-open'));
    modal.querySelector('.gallery-close').focus();
  };

  const close = () => {
    modal.classList.remove('is-open');
    document.body.style.overflow = '';
    const finish = () => { modal.hidden = true; img.src = ''; };
    if (reducedMotion) finish();
    else setTimeout(finish, 320);
    lastFocused?.focus();
  };

  modal.addEventListener('click', (event) => {
    if (event.target.closest('[data-gallery-close]')) close();
  });
  window.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !modal.hidden) close();
  });

  /* -------- inject "观察机构" buttons into the sound cards -------- */
  for (const card of document.querySelectorAll('.sound-card')) {
    const eraId = card.closest('section[data-era]')?.dataset.era;
    const media = ACTION_MEDIA[eraId];
    const motifBtn = card.querySelector('.motif-btn');
    if (!media || !motifBtn) continue;

    // Group the two buttons on one row without touching the HTML.
    const actions = document.createElement('div');
    actions.className = 'sound-card-actions';
    motifBtn.replaceWith(actions);
    actions.appendChild(motifBtn);
    actions.appendChild(makeGalleryButton(media, open));
  }

  // The player-piano module has no sound card; its button joins the controls.
  const rollControls = document.querySelector('.roll-controls');
  if (rollControls && ACTION_MEDIA.roll) {
    rollControls.appendChild(makeGalleryButton(ACTION_MEDIA.roll, open));
  }
}

function makeGalleryButton(media, open) {
  const btn = document.createElement('button');
  btn.className = 'gallery-btn';
  btn.dataset.cursor = '';
  btn.setAttribute('aria-haspopup', 'dialog');
  btn.innerHTML = `
    <svg viewBox="0 0 16 16" width="13" height="13" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.4">
      <circle cx="7" cy="7" r="4.6"/><line x1="10.4" y1="10.4" x2="14" y2="14"/>
    </svg>观察机构`;
  btn.addEventListener('click', () => open(media, btn));
  return btn;
}
