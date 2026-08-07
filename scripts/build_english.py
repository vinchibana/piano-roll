#!/usr/bin/env python3
"""Build the static English page from the Chinese source without duplicating layout markup."""

from pathlib import Path
import re


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "index.html"
TARGET = ROOT / "index-en.html"


REPLACEMENTS = [
    ('<html lang="zh-CN">', '<html lang="en">'),
    ('<title>可以听的钢琴三百年 · A Listening History of the Piano</title>', '<title>A Listening History of the Piano · 1700 to Today</title>'),
    ('<meta name="description" content="从 1700 年克里斯托福里的击弦机，到今天的数码钢琴——一部可以用耳朵阅读的钢琴史。滚动页面，键盘的音域与音色将随历史变化。">', '<meta name="description" content="From Cristofori’s hammer action around 1700 to today’s digital instruments: an interactive history of the piano you can read with your ears.">'),
    ('<meta name="keywords" content="钢琴史,钢琴历史,击弦机,Cristofori,fortepiano,piano history,双重擒纵,可听的历史">', '<meta name="keywords" content="piano history,Cristofori,fortepiano,piano action,double escapement,player piano,MIDI,interactive music history">'),
    ('<link rel="canonical" href="https://avenryai.com/labs/arts/piano-history/">', '<link rel="canonical" href="https://avenryai.com/labs/arts/piano-history/index-en.html">'),
    ('<meta property="og:locale" content="zh_CN">', '<meta property="og:locale" content="en_US">'),
    ('<meta property="og:locale:alternate" content="en_US">', '<meta property="og:locale:alternate" content="zh_CN">'),
    ('<meta property="og:url" content="https://avenryai.com/labs/arts/piano-history/">', '<meta property="og:url" content="https://avenryai.com/labs/arts/piano-history/index-en.html">'),
    ('<meta property="og:title" content="可以听的钢琴三百年 · A Listening History of the Piano">', '<meta property="og:title" content="A Listening History of the Piano">'),
    ('<meta property="og:description" content="从 1700 年克里斯托福里的击弦机，到今天的数码钢琴——一部可以用耳朵阅读的钢琴史。滚动页面，键盘的音域与音色将随历史变化。">', '<meta property="og:description" content="Three centuries of piano history, made audible: scroll, play and hear the keyboard change with time.">'),
    ('assets/og.png', 'assets/og-en.png'),
    ('<meta property="og:image:alt" content="可以听的钢琴三百年">', '<meta property="og:image:alt" content="A Listening History of the Piano">'),
    ('<meta name="twitter:title" content="可以听的钢琴三百年 · A Listening History of the Piano">', '<meta name="twitter:title" content="A Listening History of the Piano">'),
    ('<meta name="twitter:description" content="从 1700 年克里斯托福里的击弦机，到今天的数码钢琴——一部可以用耳朵阅读的钢琴史。">', '<meta name="twitter:description" content="Three centuries of piano history, made audible.">'),
    ('"name": "可以听的钢琴三百年"', '"name": "A Listening History of the Piano"'),
    ('"alternateName": "A Listening History of the Piano"', '"alternateName": "Three Centuries of the Piano You Can Hear"'),
    ('"description": "从 1700 年克里斯托福里的击弦机，到今天的数码钢琴——一部可以用耳朵阅读的钢琴史。滚动页面，键盘的音域与音色将随历史变化。"', '"description": "From Cristofori’s hammer action around 1700 to today’s digital instruments: an interactive history of the piano you can read with your ears."'),
    ('"url": "https://avenryai.com/labs/arts/piano-history/",', '"url": "https://avenryai.com/labs/arts/piano-history/index-en.html",'),
    ('"inLanguage": ["zh-CN", "en"]', '"inLanguage": "en"'),

    ('<a class="topbar-brand" href="#top" data-cursor>可以听的钢琴三百年</a>', '<a class="topbar-brand" href="#top" data-cursor>A Listening History of the Piano</a>'),
    ('<a class="topbar-lang mono" href="index-en.html" lang="en" hreflang="en" data-cursor aria-label="Switch to English">EN</a>', '<a class="topbar-lang mono" href="index.html" lang="zh-CN" hreflang="zh-CN" data-cursor aria-label="Switch to Chinese">中</a>'),
    ('aria-label="声音开关"', 'aria-label="Sound on or off"'),
    ('<span id="sound-label">声音</span>', '<span id="sound-label">Sound</span>'),
    ('aria-label="章节导航"', 'aria-label="Chapter navigation"'),

    ('<span class="hero-title-line reveal">可以听的</span>', '<span class="hero-title-line reveal">A Listening</span>'),
    ('<span class="hero-title-line hero-title-em reveal">钢琴三百年</span>', '<span class="hero-title-line hero-title-em reveal">History of the Piano</span>'),
    ('<p class="hero-sub reveal">我把三百年钢琴史，做成了一个可以听的网站。<br>\n          从佛罗伦萨一间工坊里的四个八度，到你屏幕下方的八十八个琴键——<br>\n          滚动页面，历史会随你的指尖改变音域与音色。</p>', '<p class="hero-sub reveal">Three centuries of piano history, made into a website you can hear.<br>\n          From four octaves in a Florentine workshop to the eighty-eight keys below your screen—<br>\n          scroll, play, and hear the instrument change with time.</p>'),
    ('<span class="btn-ring" aria-hidden="true"></span>开始聆听', '<span class="btn-ring" aria-hidden="true"></span>Begin listening'),
    ('建议佩戴耳机 · 键盘 Z–M / Q–U 两排即可弹奏', 'Headphones recommended · Play with the Z–M and Q–U rows'),
    ('<span class="mono">向下滚动</span>', '<span class="mono">SCROLL TO BEGIN</span>'),

    ('佛罗伦萨 · 美第奇宫廷', 'FLORENCE · THE MEDICI COURT'),
    ('<span class="chapter-yearnote mono">约</span>', '<span class="chapter-yearnote mono">C.</span>'),
    ('一台能轻、能响的「羽管键琴」', 'A harpsichord that could play soft and loud'),
    ('巴尔托洛梅奥·克里斯托福里（Bartolomeo Cristofori）是美第奇家族斐迪南多王子的乐器管家。羽管键琴用羽管拨弦，无论手指多用力，音量几乎不变；而他想造一件<em>由触键决定强弱</em>的乐器。1700 年前后，美第奇宫廷的乐器清单里第一次出现了它的名字——「一台能弹出轻与响的琴」（arpicembalo che fa\' il piano e il forte）。「钢琴」这个名字，从诞生之日起说的就是<em>强弱</em>本身。', 'Bartolomeo Cristofori served Grand Prince Ferdinando de’ Medici as keeper of his musical instruments. A harpsichord plucks its strings, so touch alone changes its volume very little. Cristofori set out to build an instrument whose loudness would answer the player’s hands. A Medici inventory dated 1700 records an <em>arpicimbalo</em>, “newly invented by Bartolomeo Cristofori,” with hammers, dampers, two keyboards and a four-octave compass. The name <em>pianoforte</em> would later preserve that promise: soft and loud.'),
    ('真正的天才藏在琴键之下：<strong>擒纵机构（escapement）</strong>。琴槌被抛向琴弦后立即脱开、自由回落，既不压住琴弦闷住声音，也不反复弹跳。轻按则弱，重击则强——键盘乐器第一次拥有了「触感即表情」。克里斯托福里存世的钢琴只有三台：1720 年（纽约大都会博物馆）、1722 年（罗马）、1726 年（莱比锡）。', 'The decisive invention sits beneath the keys: the <strong>escapement</strong>. The jack throws the hammer toward the string and then moves clear, allowing the hammer to fall back without blocking the string or rebounding against it. A light touch can be quiet; a forceful touch can be loud. Only three Cristofori pianos survive: instruments dated 1720 in New York, 1722 in Rome and 1726 in Leipzig.'),
    ('alt="克里斯托福里 1720 年制造的钢琴，现藏纽约大都会艺术博物馆"', 'alt="Bartolomeo Cristofori’s 1720 piano at The Metropolitan Museum of Art"'),
    ('现存最古老的钢琴：克里斯托福里，1720 年，纽约大都会艺术博物馆藏。<span class="mono">Wikimedia Commons · 公有领域</span>', 'The oldest surviving piano: Bartolomeo Cristofori, Florence, 1720. The Metropolitan Museum of Art. <span class="mono">WIKIMEDIA COMMONS · PUBLIC DOMAIN</span>'),
    ('声音档案 · SOUND PROFILE', 'SOUND PROFILE'),
    ('<div><dt>音域</dt><dd>约 4 个八度（49 键）</dd></div>', '<div><dt>Compass</dt><dd>About four octaves; the surviving 1720 instrument has 54 notes</dd></div>'),
    ('<div><dt>音量</dt><dd>很小——羊皮纸槌头、细弦、轻木框架</dd></div>', '<div><dt>Volume</dt><dd>Intimate—paper-and-leather hammers, thin strings, light wooden case</dd></div>'),
    ('<div><dt>机构</dt><dd>初代擒纵击弦机</dd></div>', '<div><dt>Action</dt><dd>Cristofori’s escapement action</dd></div>'),
    ('<div><dt>音色印象</dt><dd>介于羽管键琴与古钢琴之间，银亮而含蓄</dd></div>', '<div><dt>Timbre</dt><dd>Bright and intimate, closer to a harpsichord than a modern grand</dd></div>'),
    ('<span class="motif-icon" aria-hidden="true"></span>聆听这个时代', '<span class="motif-icon" aria-hidden="true"></span>Hear this era'),

    ('这项发明第一次被印成铅字', 'The invention enters print'),
    ('学者希皮奥内·马费伊（Scipione Maffei）到访佛罗伦萨后，在《意大利文人期刊》上发表了对这件新乐器的详细报道，称之为「gravicembalo col piano, e forte」——带有轻与响的大键琴——并附上了击弦机构的原理图。这是钢琴第一份公开的「技术文档」。', 'After visiting Florence, the scholar and journalist Scipione Maffei published a detailed account in the <em>Giornale de’ Letterati d’Italia</em>. He called the instrument a <em>gravicembalo col piano, e forte</em>—a harpsichord with soft and loud—and included a diagram of the action. It was the piano’s first widely circulated technical description.'),
    ('1725 年，这篇文章被译成德文出版。图纸越过阿尔卑斯山，落到了德意志管风琴师们的工作台上——其中就包括萨克森的戈特弗里德·西尔伯曼。一篇文章，把一间工坊里的发明，变成了整个欧洲的事业。', 'A German translation followed in 1725. The drawing crossed the Alps and reached instrument makers in the German lands, including Gottfried Silbermann in Saxony. Print turned an invention from one Florentine workshop into a European project.'),
    ('琴键 tasto', 'KEY · TASTO'),
    ('顶杆 linguetta', 'JACK · LINGUETTA'),
    ('琴槌 martello', 'HAMMER · MARTELLO'),
    ('弦 corda', 'STRING · CORDA'),
    ('<span class="motif-icon" aria-hidden="true"></span>先轻，后响 · piano, e forte', '<span class="motif-icon" aria-hidden="true"></span>Soft, then loud · piano, e forte'),

    ('萨克森 · 弗赖贝格', 'SAXONY · FREIBERG'),
    ('西尔伯曼、巴赫，与一次著名的差评', 'Silbermann, Bach, and a famous bad review'),
    ('管风琴名匠戈特弗里德·西尔伯曼（Gottfried Silbermann）读到马费伊图纸后，在 1730 年代造出了自己的「强弱琴」，并请约翰·塞巴斯蒂安·巴赫试奏。据其学生阿格里科拉记载，巴赫的评价相当不客气：<em>高音太弱，琴键太重</em>。西尔伯曼恼怒之余，埋头改进了许多年。', 'The celebrated organ builder Gottfried Silbermann encountered Cristofori’s design through Maffei’s published account and began building pianofortes in the 1730s. According to Johann Friedrich Agricola, Johann Sebastian Bach objected that the treble was too weak and the action too heavy. Silbermann continued refining the instrument.'),
    ('1747 年 5 月，巴赫到波茨坦觐见普鲁士国王腓特烈大帝。宫中各处摆着西尔伯曼的新钢琴，国王让巴赫逐一试奏，并当场给了他一个主题——巴赫即兴演奏了三声部赋格，回到莱比锡后将它扩展成《音乐的奉献》。晚年的巴赫认可了这件乐器，甚至在 1749 年为西尔伯曼的钢琴做过一次「经销商」。', 'In May 1747 Bach visited Frederick II of Prussia at Potsdam, where the king owned several Silbermann pianos. Frederick supplied a theme; Bach improvised on it and later developed the encounter into <em>The Musical Offering</em>. Bach’s position had clearly softened: in 1749 he signed a receipt connected with the sale of a Silbermann piano.'),
    ('alt="豪斯曼绘制的约翰·塞巴斯蒂安·巴赫肖像，1748 年"', 'alt="Portrait of Johann Sebastian Bach by Elias Gottlob Haussmann, 1748"'),
    ('巴赫肖像，豪斯曼（E. G. Haussmann）绘，1748 年。<span class="mono">Wikimedia Commons · 公有领域</span>', 'Johann Sebastian Bach, painted by Elias Gottlob Haussmann, 1748. <span class="mono">WIKIMEDIA COMMONS · PUBLIC DOMAIN</span>'),
    ('<div><dt>音域</dt><dd>约 4 个半八度</dd></div>', '<div><dt>Compass</dt><dd>About four and a half octaves</dd></div>'),
    ('<div><dt>音量</dt><dd>仍然偏小，但高音经改良后更明亮</dd></div>', '<div><dt>Volume</dt><dd>Still modest; later instruments gained a clearer treble</dd></div>'),
    ('<div><dt>机构</dt><dd>忠实于克里斯托福里的擒纵设计</dd></div>', '<div><dt>Action</dt><dd>Closely based on Cristofori’s escapement</dd></div>'),
    ('<div><dt>音色印象</dt><dd>木质、克制，适合对位与赋格的清晰线条</dd></div>', '<div><dt>Timbre</dt><dd>Woody, restrained, and clear enough for contrapuntal lines</dd></div>'),
    ('<span class="motif-icon" aria-hidden="true"></span>聆听「国王的主题」', '<span class="motif-icon" aria-hidden="true"></span>Hear the Royal Theme'),

    ('奥格斯堡 → 维也纳', 'AUGSBURG → VIENNA'),
    ('维也纳式击弦机：轻若耳语的机敏', 'The Viennese action: quick as a whisper'),
    ('1777 年 10 月，21 岁的莫扎特在奥格斯堡试了施泰因（Johann Andreas Stein）的钢琴，随即写信给父亲：「他的琴永远不会<em>糊</em>掉——擒纵装置让琴槌击弦后立刻回落，无论按得多快。」施泰因把琴槌直接装在琴键上（Prellmechanik），触感极轻、反应极快；他的女婿一辈安东·瓦尔特（Anton Walter）随后在维也纳把这种设计推向巅峰，莫扎特自己就买了一台瓦尔特。', 'On 17 October 1777, the twenty-one-year-old Wolfgang Amadeus Mozart wrote to his father from Augsburg praising Johann Andreas Stein’s pianofortes: “they are made with an escapement.” However he attacked the keys, Mozart said, the tone remained even and stopped exactly when he wished. Stein’s hammers pivoted directly on the keys in what became known as the Viennese action. Viennese makers—notably Anton Walter—later strengthened and refined the design. Mozart acquired a Walter fortepiano built around 1782 and used it in his Vienna concerts.'),
    ('这就是「维也纳式击弦机」：五个八度、皮革槌头、用膝盖顶杆代替踏板。音量不大，衰减很快，却字字清晰——莫扎特协奏曲里那些珍珠般的走句，正是为这种转瞬即逝的音色写的。', 'The Viennese action paired a light touch with leather-covered hammers and knee levers for the dampers. Its tone was smaller and decayed faster than that of a modern grand, but every articulation spoke clearly—the kind of fleeting, pearled sound for which Mozart’s passagework was conceived.'),
    ('alt="克罗齐绘制的莫扎特家庭画像局部，约1780年"', 'alt="Wolfgang Amadeus Mozart in a family portrait by Johann Nepomuk della Croce, c. 1780"'),
    ('莫扎特，克罗齐（J. N. della Croce）绘，约 1780 年。<span class="mono">Wikimedia Commons · 公有领域</span>', 'Wolfgang Amadeus Mozart, painted by Johann Nepomuk della Croce, c. 1780. <span class="mono">WIKIMEDIA COMMONS · PUBLIC DOMAIN</span>'),
    ('<div><dt>音域</dt><dd>5 个八度（61 键，F1–F6）</dd></div>', '<div><dt>Compass</dt><dd>Five octaves (61 keys, F1–F6)</dd></div>'),
    ('<div><dt>音量</dt><dd>小而灵敏，强弱层次细腻</dd></div>', '<div><dt>Volume</dt><dd>Modest but highly responsive to touch</dd></div>'),
    ('<div><dt>机构</dt><dd>维也纳式（琴槌装在琴键上）</dd></div>', '<div><dt>Action</dt><dd>Viennese action; hammers pivot on the keys</dd></div>'),
    ('<div><dt>音色印象</dt><dd>清脆、透明、衰减快——「珍珠般的」</dd></div>', '<div><dt>Timbre</dt><dd>Crisp, transparent and quick to decay—often described as pearly</dd></div>'),

    ('伦敦 → 维也纳', 'LONDON → VIENNA'),
    ('英式击弦机：一件送给聋人的乐器', 'An English grand for a deaf composer'),
    ('伦敦人走了另一条路。英式击弦机把琴槌装在独立的槌架上、由顶杆推动，琴键更深、更重，声音也更厚、更响。布罗德伍德（Broadwood）工厂率先扩张音域：1790 年代初为杜赛克加到五个半八度，1794 年做出六个八度——作曲家们立刻把新音区写进乐谱，音域军备竞赛就此开始。', 'London makers took another path. In the English grand action, a jack lifts a hammer mounted on a separate rail. The key dip was deeper and the touch heavier, but the result was a fuller, more powerful sound. During the 1790s, John Broadwood & Sons and other London makers pushed the keyboard compass toward six octaves, and composers quickly occupied the new notes.'),
    ('1818 年，托马斯·布罗德伍德把一台六个八度（C1–C7）的三角钢琴从伦敦运到维也纳，赠予几乎全聋的贝多芬。贝多芬珍爱这台琴直到去世。也正是在这两年，他写下了钢琴史上最庞然的《「槌子键琴」奏鸣曲》Op. 106——那是写给<em>未来的钢琴</em>的音乐：更宽的音域、更大的音量、更长的呼吸。', 'Thomas Broadwood presented Ludwig van Beethoven with a six-octave grand built in 1817. It left London on 27 December and reached Vienna in 1818. Beethoven treasured it until his death. The gift arrived while he was completing the <em>Hammerklavier</em> Sonata, Op. 106—music that seems written for a future piano with a wider compass, greater power and a longer breath.'),
    ('alt="施蒂勒绘制的贝多芬肖像，1820年"', 'alt="Portrait of Ludwig van Beethoven by Joseph Karl Stieler, 1820"'),
    ('贝多芬肖像，施蒂勒（J. K. Stieler）绘，1820 年。<span class="mono">Wikimedia Commons · 公有领域</span>', 'Ludwig van Beethoven, painted by Joseph Karl Stieler, 1820. <span class="mono">WIKIMEDIA COMMONS · PUBLIC DOMAIN</span>'),
    ('<div><dt>音域</dt><dd>6 个八度（C1–C7）</dd></div>', '<div><dt>Compass</dt><dd>Six octaves (C1–C7)</dd></div>'),
    ('<div><dt>音量</dt><dd>显著增大，低音浑厚</dd></div>', '<div><dt>Volume</dt><dd>Significantly greater, with a weightier bass</dd></div>'),
    ('<div><dt>机构</dt><dd>英式（顶杆推动独立槌架）</dd></div>', '<div><dt>Action</dt><dd>English grand action; jack and separate hammer rail</dd></div>'),
    ('<div><dt>音色印象</dt><dd>深沉、绵长、带着木头与黄铜的重量</dd></div>', '<div><dt>Timbre</dt><dd>Deep and sustained, with the weight of wood and brass</dd></div>'),

    ('巴黎 · 埃拉尔工坊', 'PARIS · THE ÉRARD WORKSHOPS'),
    ('双重擒纵：同一个音，可以说得更快', 'Double escapement: the same note, repeated faster'),
    ('此前所有钢琴都有一个物理极限：想重复同一个音，必须等琴键完全抬起、机构复位。塞巴斯蒂安·埃拉尔（Sébastien Érard）的<strong>双重擒纵机构</strong>（1821 年在伦敦以侄子皮埃尔的名义申请专利）加入了一根带弹簧的复震杠杆：琴槌回落到一半就被托住，琴键只需抬起一点点，就能再次击弦。', 'Earlier actions imposed a physical limit: to repeat a note, the key had to rise far enough for the mechanism to reset. Sébastien Érard’s <strong>double-escapement action</strong>, patented in London in 1821 in the name of his nephew Pierre, added a spring-loaded repetition lever. It catches the hammer partway down, so another strike is possible after the key rises only slightly.'),
    ('震音、同音反复、快速装饰音——手指的速度第一次超过了机械的速度。今天世界上每一台三角钢琴的击弦机，仍是埃拉尔这项设计的直系后代。', 'Tremolos, repeated notes and fast ornaments could now outrun the old mechanism. Érard’s principle, subsequently refined, remains the basis of the modern grand-piano action.'),
    ('键 KEY', 'KEY'),
    ('复震杠杆 REPETITION LEVER', 'REPETITION LEVER'),
    ('槌 HAMMER', 'HAMMER'),
    ('复震杠杆示意：琴槌半途被托住，随时准备第二次出发。', 'The repetition lever catches the falling hammer, keeping it ready for a second strike.'),
    ('<div><dt>音域</dt><dd>约 6 个半八度</dd></div>', '<div><dt>Compass</dt><dd>About six and a half octaves</dd></div>'),
    ('<div><dt>音量</dt><dd>洪亮，可与乐队抗衡</dd></div>', '<div><dt>Volume</dt><dd>Powerful enough to contend with an orchestra</dd></div>'),
    ('<div><dt>机构</dt><dd>双重擒纵（复震奏机构）</dd></div>', '<div><dt>Action</dt><dd>Double escapement with repetition lever</dd></div>'),
    ('<div><dt>音色印象</dt><dd>歌唱性的连奏，闪电般的同音反复</dd></div>', '<div><dt>Timbre</dt><dd>Singing legato and lightning-fast repeated notes</dd></div>'),
    ('<span class="motif-icon" aria-hidden="true"></span>听：越来越快的同一个音', '<span class="motif-icon" aria-hidden="true"></span>Hear one note accelerate'),

    ('互动装置 · 一', 'INTERACTIVE · I'),
    ('击弦机解剖室', 'Inside the piano action'),
    ('三种改变历史的机械设计。点击图中的琴键（或按钮），看琴槌如何飞向琴弦。', 'Three mechanisms that changed the instrument. Press a key in the diagram—or use the button—to watch the hammer travel toward the string.'),

    ('波士顿 · 纽约', 'BOSTON · NEW YORK'),
    ('钢铁进场：工业革命重铸钢琴', 'Enter iron: industry rebuilds the piano'),
    ('更响的声音需要更粗的弦、更高的张力，木框架已经到了极限。1825 年 12 月，波士顿的阿尔菲厄斯·巴布科克（Alpheus Babcock）为<strong>整体铸铁框架</strong>申请专利。克里斯托福里的木框架只须承受一两吨拉力，而现代音乐会三角钢琴的铸铁架上绷着约二十吨——相当于把三头大象挂在琴弦上。', 'More volume required heavier strings and greater tension; wooden framing had reached its limit. In December 1825, the Boston maker Alpheus Babcock patented a <strong>one-piece cast-iron frame</strong> for a square piano. The plate of a modern concert grand carries roughly twenty tons of string tension.'),
    ('1853 年，德国移民家庭施坦威（Steinway）在曼哈顿开业。1859 年，小亨利·施坦威取得<strong>交叉弦列</strong>（overstringing）专利：低音弦斜跨在中音弦之上，弦更长、琴桥移到音板中央——声音从此有了金色的共鸣。铸铁框架 + 交叉弦列 + 双重擒纵，现代钢琴的三块基石在这十年间合拢。', 'Steinway & Sons opened in Manhattan in 1853. In 1859, Henry Steinway Jr. patented an <strong>overstrung plate</strong>: longer bass strings crossed above the tenor strings, allowing a more compact scale and placing the bass bridge nearer the soundboard’s most resonant area. Cast-iron framing, overstringing and the refined double-escapement action became three foundations of the modern grand.'),
    ('平行弦列', 'STRAIGHT-STRUNG'),
    ('交叉弦列 · 1859', 'OVERSTRUNG · 1859'),
    ('低音弦（粗线）斜跨过中音弦——同样的琴身，装下更长的弦。', 'The bass strings cross above the tenor: longer strings within the same case.'),
    ('<div><dt>音域</dt><dd>85 键（A0–A7），逼近现代</dd></div>', '<div><dt>Compass</dt><dd>85 keys (A0–A7), approaching the modern standard</dd></div>'),
    ('<div><dt>音量</dt><dd>可以填满两千人的音乐厅</dd></div>', '<div><dt>Volume</dt><dd>Built to project through a large concert hall</dd></div>'),
    ('<div><dt>机构</dt><dd>铸铁框架 + 交叉弦列</dd></div>', '<div><dt>Structure</dt><dd>Cast-iron plate plus overstringing</dd></div>'),
    ('<div><dt>音色印象</dt><dd>低音如管风琴，泛音金色而绵长</dd></div>', '<div><dt>Timbre</dt><dd>Organ-like bass and a long, complex halo of overtones</dd></div>'),
    ('<span class="motif-icon" aria-hidden="true"></span>聆听新的低音', '<span class="motif-icon" aria-hidden="true"></span>Hear the new bass'),

    ('互动装置 · 二', 'INTERACTIVE · II'),
    ('音域的三百年', 'Three centuries of compass'),
    ('从四个八度到八十八键。悬停任意年代即可高亮它的疆域，点击两端试听它的最低音与最高音。', 'From four octaves to eighty-eight keys. Hover over an era to reveal its territory; select its bar to hear the lowest and highest notes.'),

    ('全欧洲的音乐厅', 'CONCERT HALLS ACROSS EUROPE'),
    ('李斯特狂热：钢琴成为奇观', 'Lisztomania: the piano becomes a spectacle'),
    ('1839 到 1847 年，弗朗茨·李斯特横扫欧洲，一个人、一台琴撑起整场音乐会——「独奏会」（recital）这个词，就是 1840 年为他在伦敦的演出发明的。他侧对观众而坐，让人看清手指；琴弦被弹断是常事，海涅在 1844 年为这种集体癫狂造了一个词：<em>李斯特狂热（Lisztomania）</em>。炫技时代的钢琴，是那个世纪的摇滚现场。', 'From 1839 to 1847, Franz Liszt toured Europe with programs built around a single pianist and a single instrument. A London program in 1840 used the new phrase “pianoforte recital.” Liszt sat in profile so the audience could see his hands; broken strings became part of the legend. In 1844 Heinrich Heine named the collective fever <em>Lisztomania</em>.'),
    ('与此同时，钢琴走进了千家万户的客厅，成为十九世纪家庭的娱乐中心：女儿练琴、全家合唱、四手联弹的歌剧改编——在留声机出现之前，<em>钢琴就是人类的音响</em>。到十九世纪末，欧美的钢琴制造商数以百计，产量以十万计。', 'At the same time, pianos entered middle-class homes as the nineteenth century’s domestic media system: lessons, family songs and four-hand arrangements brought the opera house into the parlor. Before recorded sound became ordinary, the piano was how many households replayed the world’s music.'),
    ('alt="纳达尔拍摄的弗朗茨·李斯特肖像，1886年3月"', 'alt="Portrait photograph of Franz Liszt by Nadar, March 1886"'),
    ('李斯特，纳达尔（Nadar）摄，1886 年 3 月。<span class="mono">Wikimedia Commons · 公有领域</span>', 'Franz Liszt, photographed by Nadar, March 1886. <span class="mono">WIKIMEDIA COMMONS · PUBLIC DOMAIN</span>'),
    ('<div><dt>音域</dt><dd>82–85 键，作品直逼键盘两端</dd></div>', '<div><dt>Compass</dt><dd>82–85 keys; repertory pressed toward both extremes</dd></div>'),
    ('<div><dt>音量</dt><dd>极限动态：从耳语到雷鸣</dd></div>', '<div><dt>Volume</dt><dd>Extreme dynamics, from whisper to thunder</dd></div>'),
    ('<div><dt>机构</dt><dd>埃拉尔双重擒纵 + 日益强化的框架</dd></div>', '<div><dt>Action</dt><dd>Érard double escapement and increasingly reinforced frames</dd></div>'),
    ('<div><dt>音色印象</dt><dd>辉煌、危险、剧场感十足</dd></div>', '<div><dt>Timbre</dt><dd>Brilliant, dangerous and unmistakably theatrical</dd></div>'),
    ('<span class="motif-icon" aria-hidden="true"></span>聆听炫技时代', '<span class="motif-icon" aria-hidden="true"></span>Hear the virtuoso age'),

    ('互动装置 · 三 ｜ 1880s—1920s', 'INTERACTIVE · III | 1880s—1920s'),
    ('纸卷上的幽灵之手', 'A ghost hand on a paper roll'),
    ('按下播放，一卷打孔纸将替你弹完斯科特·乔普林的《The Entertainer》（1902）。<br>孔洞经过读取杆的一瞬，就是音符发声的一瞬。', 'Press play and a perforated roll will perform Scott Joplin’s <em>The Entertainer</em>, published in 1902.<br>A note sounds at the instant its hole crosses the tracker bar.'),
    ('1895 年，埃德温·沃提（Edwin Votey）发明了「Pianola」：一台推到钢琴前的气动装置，用风箱与打孔纸卷驱动琴键。1908 年，制造商们在布法罗开会，把纸卷规格统一为 88 音、每英寸 9 孔——<em>这可能是音乐史上第一个数字化标准</em>。一个世纪后，MIDI 做的仍是同一件事。', 'Edwin S. Votey developed the Pianola as a cabinet player in 1895 and filed a patent in 1897. Placed in front of an ordinary piano, it used pedals, pneumatics and a perforated paper roll to press the keys. At a 1908 industry convention in Buffalo, manufacturers agreed on an 88-note roll format with nine perforation positions per inch—an early machine-readable music standard. MIDI would later encode many of the same events electronically.'),
    ('更精密的「再现钢琴」（Welte-Mignon 1904、Duo-Art、Ampico）能记录演奏家的力度与踏板：德彪西、马勒、格什温、拉赫玛尼诺夫都留下了纸卷。1920 年代初的美国，出厂的钢琴过半带有自动演奏装置——直到收音机与大萧条终结了这场狂欢。这卷打孔纸，也成为贯穿本站的视觉线索。', 'More sophisticated reproducing-piano systems—Welte-Mignon, Duo-Art and Ampico—encoded aspects of dynamics and pedaling as well as pitch and rhythm. Composers and pianists including Debussy, Mahler, Gershwin and Rachmaninoff left rolls behind. Player pianos flourished in the early twentieth century before radio, recorded music and the Depression transformed the market. That perforated paper archive supplies the visual motif running through this site.'),
    ('alt="装在自动钢琴上的打孔纸卷"', 'alt="A perforated paper music roll mounted in a player piano"'),
    ('装上琴的打孔纸卷。孔的横向位置是音高，长度是时值。<span class="mono">Wikimedia Commons</span>', 'A player-piano roll: horizontal position encodes pitch; perforation length contributes to duration. <span class="mono">WIKIMEDIA COMMONS</span>'),

    ('纽约 · 哈莱姆 · 西雅图', 'NEW YORK · HARLEM · SEATTLE'),
    ('二十世纪：被拆解与被即兴的钢琴', 'The twentieth century: improvised and taken apart'),
    ('拉赫玛尼诺夫把浪漫主义的黄昏弹进了唱片与纸卷，而在哈莱姆的出租屋派对上，钢琴长出了另一种身体：斯特莱德左手如钟摆横跨键盘，阿特·塔图姆的双手快过任何纸卷。爵士乐把钢琴从沙龙乐器变成了<em>节奏引擎</em>。', 'Sergei Rachmaninoff carried the late-Romantic piano into records and reproducing rolls. At Harlem rent parties, the instrument acquired another body: the stride pianist’s left hand swung across the keyboard while artists such as James P. Johnson and Art Tatum turned the piano into a <em>rhythm engine</em>.'),
    ('1940 年，约翰·凯奇要为舞者西薇拉·福特的《巴克萨纳尔》配乐，剧场里却放不下打击乐队。他掀开琴盖，把螺栓、螺丝和橡胶塞进琴弦之间——<strong>预置钢琴</strong>诞生了：一台钢琴，八十八种打击乐。轻按琴键，出来的却是锣、鼓与加美兰。钢琴第一次被当作「一个装着声音的家具」重新发明。', 'In 1940, John Cage needed music for Syvilla Fort’s dance <em>Bacchanale</em>, but the performance space could not accommodate a percussion ensemble. He placed bolts, screws, rubber and other materials between the strings: the <strong>prepared piano</strong> was born. One keyboard could now summon muted thuds, metallic rattles and gamelan-like resonance.'),
    ('alt="谢尔盖·拉赫玛尼诺夫在斯坦威钢琴前，美国国会图书馆藏照片"', 'alt="Sergei Rachmaninoff at a Steinway piano, Library of Congress photograph"'),
    ('拉赫玛尼诺夫在施坦威琴前。美国国会图书馆藏。<span class="mono">Wikimedia Commons · 公有领域</span>', 'Sergei Rachmaninoff at a Steinway piano. Library of Congress. <span class="mono">WIKIMEDIA COMMONS · PUBLIC DOMAIN</span>'),
    ('<div><dt>音域</dt><dd>88 键成为世界标准</dd></div>', '<div><dt>Compass</dt><dd>Eighty-eight keys become the global norm</dd></div>'),
    ('<div><dt>音量</dt><dd>从音乐厅的轰鸣到预置琴的噗噗闷响</dd></div>', '<div><dt>Volume</dt><dd>From concert-hall thunder to the dry thud of a prepared string</dd></div>'),
    ('<div><dt>机构</dt><dd>标准现代击弦机（+ 螺栓与橡胶）</dd></div>', '<div><dt>Action</dt><dd>Modern grand action—plus bolts, screws and rubber</dd></div>'),
    ('<div><dt>音色印象</dt><dd>此刻键盘已切换为「预置钢琴」——去弹弹看</dd></div>', '<div><dt>Timbre</dt><dd>The dock is now a prepared piano—try a few notes</dd></div>'),
    ('<span class="motif-icon" aria-hidden="true"></span>聆听预置钢琴', '<span class="motif-icon" aria-hidden="true"></span>Hear the prepared piano'),

    ('加利福尼亚 · 底特律的电台', 'CALIFORNIA · DETROIT RADIO'),
    ('电与磁：不需要音板的钢琴', 'Electric and magnetic: a piano without a soundboard'),
    ('哈罗德·罗兹（Harold Rhodes）在二战期间用飞机零件给伤兵做音乐治疗课的小键琴，战后长成了 <strong>Rhodes 电钢琴</strong>：琴槌敲击金属音叉（tine），电磁拾音器把振动变成电流。没有音板、不怕跑调，音色像浸了蜜的钟声。1954 年问世的 <strong>Wurlitzer</strong> 则敲击簧片，声音更干、更有咬字感——雷·查尔斯 1959 年的《What\'d I Say》让全世界记住了它。', 'During the Second World War, Harold Rhodes built compact practice instruments for wounded servicemen, using surplus aircraft aluminum. After the war, the idea evolved into the <strong>Rhodes electric piano</strong>: felt hammers strike tuned metal tines, and electromagnetic pickups turn their vibration into an electrical signal. There is no soundboard; amplification supplies the scale. The <strong>Wurlitzer electronic piano</strong>, introduced in 1954, struck tuned reeds instead and produced a drier, sharper attack—famously heard on Ray Charles’s 1959 recording of <em>What’d I Say</em>.'),
    ('1969 年前后，迈尔斯·戴维斯把 Rhodes 塞进乐队，赫比·汉考克、奇克·柯里亚、乔·扎维努尔用它铺出融合爵士的星空。灵魂乐、放克、爵士——七十年代的音乐记忆，一半是通了电的琴键。', 'By the end of the 1960s, Miles Davis was placing electric pianos inside dense ensembles. Herbie Hancock, Chick Corea and Joe Zawinul made the Rhodes central to fusion, while soul and funk found their own uses for its bell-like attack and amplified growl.'),
    ('音块 TONE BAR', 'TONE BAR'),
    ('音叉 TINE', 'TINE'),
    ('拾音器 PICKUP', 'PICKUP'),
    ('琴槌敲击音叉，拾音器把磁场的颤动变成声音——原理与电吉他同宗。', 'A hammer strikes the tine; a pickup converts its motion into an electrical signal.'),
    ('<div><dt>音域</dt><dd>Rhodes 常见 73 键（E1–E7）</dd></div>', '<div><dt>Compass</dt><dd>A common Rhodes format is 73 keys (E1–E7)</dd></div>'),
    ('<div><dt>音量</dt><dd>取决于音箱——第一次「插电」的钢琴</dd></div>', '<div><dt>Volume</dt><dd>Defined by the amplifier—the piano joins the electric band</dd></div>'),
    ('<div><dt>机构</dt><dd>琴槌 + 金属音叉 + 电磁拾音器</dd></div>', '<div><dt>Action</dt><dd>Hammer + tuned tine + electromagnetic pickup</dd></div>'),
    ('<div><dt>音色印象</dt><dd>温暖圆润，重击时有著名的「咆哮」</dd></div>', '<div><dt>Timbre</dt><dd>Warm and rounded, with a celebrated growl when played hard</dd></div>'),
    ('<span class="motif-icon" aria-hidden="true"></span>聆听电钢琴', '<span class="motif-icon" aria-hidden="true"></span>Hear the electric piano'),

    ('滨松 · 硅谷', 'HAMAMATSU · SILICON VALLEY'),
    ('数字时代：钢琴变成了信息', 'The digital era: the piano becomes information'),
    ('1983 年是分水岭。1 月的 NAMM 展会上，戴夫·史密斯的 Prophet-600 与罗兰的 Jupiter-6 用一根五针线缆互相演奏——<strong>MIDI</strong> 诞生，乐器第一次说上了同一种语言（史密斯与梯郁太郎因此在 2013 年获得格莱美技术奖）。同年，雅马哈发布 <strong>DX7</strong>：斯坦福大学约翰·乔宁的 FM 合成算法造出的玻璃质感电钢音色，回荡在此后十年几乎每一首流行抒情曲里。', 'At the January 1983 NAMM show, a Sequential Circuits Prophet-600 and a Roland Jupiter-6 gave the first public demonstration of instruments communicating through <strong>MIDI</strong>. The five-pin connection carried note, velocity and control data across brands. Dave Smith and Roland founder Ikutaro Kakehashi later received a 2013 Technical Grammy for their roles in MIDI’s development. In May 1983 Yamaha released the <strong>DX7</strong>, using FM synthesis derived from John Chowning’s research at Stanford. Its glassy electric-piano presets became a signature of 1980s pop.'),
    ('数码钢琴用采样与建模装下整台三角琴；1987 年进入美国市场的雅马哈 <strong>Disklavier</strong> 则是纸卷的转世：光学传感器记录每个琴键与琴槌的真实运动，电磁铁原样重放——今天它可以隔着大洋直播一场演奏，或让 AI 在真实的琴弦上落下琴槌。打孔纸带变成了字节，而琴槌击弦的瞬间，与 1700 年并无不同。', 'Digital pianos placed sampled or modeled grands behind a keyboard. Yamaha introduced the <strong>Disklavier</strong> reproducing piano to North America in 1987: sensors capture key, hammer and pedal information, while electromechanical actuators reproduce a performance on an acoustic piano. The perforated roll had become data, but the final event—a hammer striking a real string—still belonged to Cristofori’s world.'),
    ('1983 年，乐器的共同语言', '1983 · INSTRUMENTS SPEAK MIDI'),
    ('五针 DIN 插头：音符、力度、踏板，一切都成了数据。', 'Five-pin DIN: notes, velocity and pedal gestures become data.'),
    ('<div><dt>音域</dt><dd>88 键，或任意——它只是数据</dd></div>', '<div><dt>Compass</dt><dd>Eighty-eight keys—or any range at all; the notes are data</dd></div>'),
    ('<div><dt>音量</dt><dd>从耳机的私语到体育场的墙</dd></div>', '<div><dt>Volume</dt><dd>From private headphones to a stadium sound system</dd></div>'),
    ('<div><dt>机构</dt><dd>FM 合成 / 采样 / 建模 / 传感器</dd></div>', '<div><dt>System</dt><dd>FM synthesis / sampling / modeling / sensors</dd></div>'),
    ('<div><dt>音色印象</dt><dd>此刻键盘是一台 FM 电钢——玻璃般清凉</dd></div>', '<div><dt>Timbre</dt><dd>The dock is now an FM electric piano—cool and glass-like</dd></div>'),
    ('<span class="motif-icon" aria-hidden="true"></span>聆听 1983', '<span class="motif-icon" aria-hidden="true"></span>Hear 1983'),

    ('<p class="chapter-eyebrow mono reveal">终章</p>', '<p class="chapter-eyebrow mono reveal">CODA</p>'),
    ('三百年，八十八键', 'Three centuries, eighty-eight keys'),
    ('从佛罗伦萨工坊里四个八度的轻声细语，到二十吨张力上的金色轰鸣，再到一串可以横渡大洋的字节——钢琴的历史，是人类想把<em>触碰变成歌唱</em>的三百年。', 'From four quiet octaves in a Florentine workshop, through the golden roar of strings held under roughly twenty tons of tension, to data able to cross an ocean—the piano’s history is three centuries of trying to turn <em>touch into song</em>.'),
    ('现在，屏幕下方的键盘已经装下了所有时代。往回滚动，它会变旧；弹下去，它会回答你。', 'The keyboard below now contains every era. Scroll backward and it grows older. Play a note and it answers.'),
    ('<span class="motif-icon" aria-hidden="true"></span>听：一个装下三百年的和弦', '<span class="motif-icon" aria-hidden="true"></span>Hear one chord hold three centuries'),
    ('制作说明 · COLOPHON', 'COLOPHON & SOURCES'),
    ('历史肖像与乐器照片来自 <a href="https://commons.wikimedia.org" data-cursor>Wikimedia Commons</a>（公有领域），示意图为本站手绘 SVG。', 'Historical portraits and instrument images come from <a href="https://commons.wikimedia.org" data-cursor>Wikimedia Commons</a>; schematic diagrams are original SVG drawings.'),
    ('目前所有声音由 Web Audio API 实时合成（击弦 / 音叉 / FM / 预置四种模型），作为占位音色；真实录音制作完成后，按 <span class="mono">assets/audio/</span> 目录约定放入即可无缝替换，详见 README。', 'All current audio is synthesized in real time with the Web Audio API—hammered string, tine, FM and prepared-piano models—and is explicitly a representative placeholder, not a museum-grade reconstruction. Recorded material can replace it through <span class="mono">assets/audio/</span>.'),
    ('字体：Fraunces · Noto Serif SC · IBM Plex Mono（Google Fonts）。', 'Type: Fraunces · Noto Serif SC · IBM Plex Mono via Google Fonts.'),
    ('纯静态构建：HTML + CSS + 原生 ES Modules，无框架、无构建工具。', 'Static build: HTML, CSS and native ES modules; no framework or build tool.'),
    ('<p class="credits-sig mono">可以听的钢琴三百年 · 为耳朵而写的历史</p>', '<p class="credits-sig mono">A Listening History of the Piano · written for the ear</p>'),

    ('<button class="dock-toggle mono" id="dock-toggle" data-cursor aria-expanded="true">收起键盘</button>', '<button class="dock-toggle mono" id="dock-toggle" data-cursor aria-expanded="true">Hide keyboard</button>'),
    ('aria-label="可弹奏的钢琴键盘"', 'aria-label="Playable piano keyboard"'),
    ('<noscript><p style="text-align:center;padding:2rem">本站需要 JavaScript 才能发声。</p></noscript>', '<noscript><p style="text-align:center;padding:2rem">JavaScript is required for the interactive audio.</p></noscript>'),
]


def build() -> None:
    text = SOURCE.read_text(encoding="utf-8")
    missing = []
    for old, new in REPLACEMENTS:
        if old not in text:
            missing.append(old[:100])
            continue
        text = text.replace(old, new)

    # Add a short, source-backed fact-checking note to the English colophon.
    marker = '<li>Static build: HTML, CSS and native ES modules; no framework or build tool.</li>'
    source_note = '''<li>Historical fact-checking: <a href="https://www.metmuseum.org/essays/the-piano-the-pianofortes-of-bartolomeo-cristofori-1655-1731" data-cursor>The Met</a> · <a href="https://dme.mozarteum.at/DME/objs/raradocs/transcr/pdf_eng/0352_WAM_LM_1777.pdf" data-cursor>Digital Mozart Edition</a> · <a href="https://internet.beethoven.de/en/exhibition/beethoven-and-great-britain/" data-cursor>Beethoven-Haus Bonn</a> · <a href="https://www.steinway.com/news/features/laguardia-wagner-archive" data-cursor>Steinway Archives</a> · <a href="https://www.si.edu/object/aeolian-pianola-piano-player%3Anmah_1160837" data-cursor>Smithsonian</a> · <a href="https://www.yamaha.com/en/tech-design/design/insights/id_009/" data-cursor>Yamaha</a> · <a href="https://midi.org/midi-history-chapter-6-midi-begins-1981-1983" data-cursor>MIDI Association</a>.</li>'''
    text = text.replace(marker, marker + "\n            " + source_note)

    # English document points back to Chinese as the default and uses its own canonical URL.
    text = text.replace(
        '<link rel="alternate" hreflang="en" href="https://avenryai.com/labs/arts/piano-history/index-en.html">',
        '<link rel="alternate" hreflang="en" href="https://avenryai.com/labs/arts/piano-history/index-en.html">',
    )

    if missing:
        raise RuntimeError("Source changed; replacements not found:\n- " + "\n- ".join(missing))

    TARGET.write_text(text, encoding="utf-8")
    print(f"Wrote {TARGET}")

    # Ignore source comments and the deliberate one-character Chinese language switch.
    visible_scan = re.sub(r'<!--.*?-->', '', text, flags=re.S).replace('>中<', '><')
    remaining = sorted(set(re.findall(r'[\u4e00-\u9fff]+', visible_scan)))
    if remaining:
        print("Remaining Han text to inspect:", remaining)


if __name__ == "__main__":
    build()
