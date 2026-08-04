/**
 * playlists.js — "时代乐单": 3–4 historically matched tracks per era,
 * linked to Apple Music search pages (search links are stable even
 * when exact track IDs vary between regions).
 */

/** eraId → [{ work, meta, term }]; term feeds the Apple Music search URL. */
const PLAYLISTS = {
  cristofori: [
    { work: '朱斯蒂尼《12 首为「软与响的键琴」而作的奏鸣曲》', meta: 'GIUSTINI · 1732 · 史上最早的钢琴曲集', term: 'Giustini Sonate da cimbalo di piano e forte' },
    { work: 'D. 斯卡拉蒂《d 小调奏鸣曲》K. 9', meta: 'D. SCARLATTI · K. 9', term: 'Scarlatti Sonata K 9' },
    { work: 'D. 斯卡拉蒂《d 小调奏鸣曲》K. 141（同音反复）', meta: 'D. SCARLATTI · K. 141', term: 'Scarlatti Sonata K 141' },
  ],
  silbermann: [
    { work: '巴赫《音乐的奉献》——三声部利切卡尔', meta: 'J. S. BACH · BWV 1079 · 1747 波茨坦', term: 'Bach Musical Offering Ricercar a 3' },
    { work: 'C. P. E. 巴赫《普鲁士奏鸣曲》', meta: 'C. P. E. BACH · WQ 48 · 献给腓特烈大帝', term: 'CPE Bach Prussian Sonatas Wq 48' },
    { work: '巴赫《平均律键盘曲集》第二卷', meta: 'J. S. BACH · BWV 870–893', term: 'Bach Well-Tempered Clavier Book 2' },
  ],
  vienna: [
    { work: '莫扎特《C 大调奏鸣曲》K. 545', meta: 'MOZART · K. 545 · 1788', term: 'Mozart Piano Sonata K 545' },
    { work: '莫扎特《A 大调第二十三钢琴协奏曲》K. 488', meta: 'MOZART · K. 488 · 1786', term: 'Mozart Piano Concerto No 23 K 488' },
    { work: '莫扎特《d 小调幻想曲》K. 397', meta: 'MOZART · K. 397', term: 'Mozart Fantasia D minor K 397' },
    { work: '海顿《D 大调奏鸣曲》Hob. XVI:37', meta: 'HAYDN · HOB. XVI:37', term: 'Haydn Piano Sonata Hob XVI 37' },
  ],
  london: [
    { work: '贝多芬《降 B 大调「槌子键琴」奏鸣曲》Op. 106', meta: 'BEETHOVEN · OP. 106 · 1818', term: 'Beethoven Hammerklavier Sonata Op 106' },
    { work: '贝多芬《升 c 小调「月光」奏鸣曲》Op. 27 No. 2', meta: 'BEETHOVEN · OP. 27/2 · 1801', term: 'Beethoven Moonlight Sonata' },
    { work: '克莱门蒂 钢琴奏鸣曲（他本人就在伦敦造钢琴）', meta: 'CLEMENTI', term: 'Clementi piano sonata' },
    { work: '杜赛克 钢琴奏鸣曲（把布罗德伍德推到五个半八度的人）', meta: 'DUSSEK', term: 'Dussek piano sonata' },
  ],
  erard: [
    { work: '肖邦《降 E 大调夜曲》Op. 9 No. 2', meta: 'CHOPIN · OP. 9/2 · 1832', term: 'Chopin Nocturne Op 9 No 2' },
    { work: '门德尔松《无词歌》', meta: 'MENDELSSOHN · LIEDER OHNE WORTE', term: 'Mendelssohn Songs Without Words' },
    { work: '塔尔贝格《「摩西」主题大幻想曲》（埃拉尔的招牌艺术家）', meta: 'THALBERG · OP. 33', term: 'Thalberg Fantasy Moses' },
  ],
  iron: [
    { work: '柴可夫斯基《降 b 小调第一钢琴协奏曲》（1875 年在波士顿首演）', meta: 'TCHAIKOVSKY · OP. 23 · 1875', term: 'Tchaikovsky Piano Concerto No 1' },
    { work: '勃拉姆斯《两首狂想曲》Op. 79', meta: 'BRAHMS · OP. 79 · 1879', term: 'Brahms Rhapsodies Op 79' },
    { work: '格里格《a 小调钢琴协奏曲》', meta: 'GRIEG · OP. 16 · 1868', term: 'Grieg Piano Concerto' },
  ],
  liszt: [
    { work: '李斯特《钟》（帕格尼尼大练习曲之三）', meta: 'LISZT · LA CAMPANELLA · 1851', term: 'Liszt La Campanella' },
    { work: '李斯特《匈牙利狂想曲第二号》', meta: 'LISZT · S. 244/2', term: 'Liszt Hungarian Rhapsody No 2' },
    { work: '李斯特《爱之梦第三号》', meta: 'LISZT · LIEBESTRAUM NO. 3', term: 'Liszt Liebestraum No 3' },
    { work: '李斯特《梅菲斯托圆舞曲第一号》', meta: 'LISZT · S. 514', term: 'Liszt Mephisto Waltz No 1' },
  ],
  modern20: [
    { work: '拉赫玛尼诺夫《c 小调第二钢琴协奏曲》', meta: 'RACHMANINOFF · OP. 18 · 1901', term: 'Rachmaninoff Piano Concerto No 2' },
    { work: '詹姆斯·P. 约翰逊《Carolina Shout》（斯特莱德钢琴的里程碑）', meta: 'JAMES P. JOHNSON · 1921', term: 'James P Johnson Carolina Shout' },
    { work: '阿特·塔图姆《Tea for Two》', meta: 'ART TATUM · 1933', term: 'Art Tatum Tea for Two' },
    { work: '凯奇《为预置钢琴而作的奏鸣曲与间奏曲》', meta: 'CAGE · 1946–48', term: 'John Cage Sonatas and Interludes' },
  ],
  electric: [
    { work: '雷·查尔斯《What\u2019d I Say》（Wurlitzer 之声）', meta: 'RAY CHARLES · 1959', term: "Ray Charles What'd I Say" },
    { work: '迈尔斯·戴维斯《In a Silent Way》（三台 Rhodes 同台）', meta: 'MILES DAVIS · 1969', term: 'Miles Davis In a Silent Way' },
    { work: '赫比·汉考克《Chameleon》', meta: 'HERBIE HANCOCK · 1973', term: 'Herbie Hancock Chameleon' },
    { work: '回归永恒乐队《Spain》（奇克·柯里亚的 Rhodes）', meta: 'RETURN TO FOREVER · 1972', term: 'Return to Forever Spain' },
  ],
  digital: [
    { work: '赫比·汉考克《Rockit》（数字时代开幕曲）', meta: 'HERBIE HANCOCK · 1983', term: 'Herbie Hancock Rockit' },
    { work: '惠特尼·休斯顿《Greatest Love of All》（DX7 电钢前奏）', meta: 'WHITNEY HOUSTON · 1985', term: 'Whitney Houston Greatest Love of All' },
    { work: 'Berlin《Take My Breath Away》（DX7 低音）', meta: 'BERLIN · 1986', term: 'Berlin Take My Breath Away' },
    { work: '坂本龙一《Merry Christmas Mr. Lawrence》', meta: 'RYUICHI SAKAMOTO · 1983', term: 'Ryuichi Sakamoto Merry Christmas Mr Lawrence' },
  ],
};

const searchUrl = (term) => `https://music.apple.com/cn/search?term=${encodeURIComponent(term)}`;

export function initPlaylists() {
  for (const card of document.querySelectorAll('.sound-card')) {
    const eraId = card.closest('section[data-era]')?.dataset.era;
    const tracks = PLAYLISTS[eraId];
    if (!tracks) continue;

    const wrap = document.createElement('div');
    wrap.className = 'playlist';
    wrap.innerHTML = `
      <h4 class="playlist-title mono">时代乐单 · LISTEN ON APPLE MUSIC</h4>
      <ol class="playlist-list">
        ${tracks.map((track) => `
          <li>
            <a href="${searchUrl(track.term)}" target="_blank" rel="noopener" data-cursor>
              <span class="pl-work">${track.work}</span>
              <span class="pl-meta mono">${track.meta}</span>
            </a>
          </li>`).join('')}
      </ol>`;
    card.appendChild(wrap);
  }
}
