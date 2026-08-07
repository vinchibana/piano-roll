# 可以听的钢琴三百年 · A Listening History of the Piano

> 我把 300 年钢琴史，做成了一个可以听的网站。

一个纯静态的单页沉浸式网站：从 1700 年前后克里斯托福里在佛罗伦萨发明击弦机，
到 MIDI、数码钢琴与 Disklavier。滚动页面时，底部那排**可弹奏的键盘**会随着
历史改变音域与音色——克里斯托福里时代只有约四个八度、声音很小；到了现代，
则是完整的 88 键。

## 中英文版本

- 中文入口：`index.html`
- 英文入口：`index-en.html`
- 两个页面共用同一套 CSS、音频引擎和交互模块；模块会依据 `<html lang>` 自动切换语言。
- 顶栏的 `EN / 中` 可在两个版本之间切换。
- 英文页面由 `scripts/build_english.py` 从中文版骨架生成，历史专名、年代与英文正文集中维护在该脚本及各交互模块的英文数据中。
- 英文 Open Graph 图片：`assets/og-en.png`。

## 本地预览

无需构建工具，任意静态服务器即可（因使用 ES Modules 与 fetch，请勿直接双击
HTML 文件打开）：

```bash
cd piano-roll-bilingual
python3 -m http.server 8000
# 打开 http://localhost:8000
```

## 项目结构

```
index.html            页面骨架与全部章节文案（16 个章节/模块）
css/
  base.css            设计令牌、排版、自定义光标、reveal 动画基元
  layout.css          顶栏、纸卷进度条、Hero、章节网格、键盘底座
  components.css      声音档案卡、聆听按钮、期刊插章、解剖室、音域图、纸卷播放器
  eras.css            每个时代一套氛围色（烛光→瓷金→深红→青铜→纸黄→冷青）
js/
  main.js             入口：装配所有模块、声音开关、「聆听时代」按钮
  data/eras.js        ★ 时代注册表：音域、合成音色参数、听觉母题音序
  audio/engine.js     ★ 唯一的音频出口：合成器 + 真实录音加载与降级
  keyboard.js         88 键可弹键盘（鼠标滑奏/触摸/电脑键盘 Z、Q 两排）
  scroll.js           滚动驱动：时代切换、进度纸卷、入场动画、视差
  pianoroll.js        Hero 漂移纸卷 + 可播放《The Entertainer》的打孔纸卷
  anatomy.js          击弦机解剖室（维也纳式 / 英式 / 埃拉尔双擒纵动画）
  rangeviz.js         音域演变可视化（49 → 88 键）
  gallery.js          「观察机构」浮层：各时代击弦机的真实图片/版画 + 出处
  playlists.js        「时代乐单」：各时代 3–4 首曲目的 Apple Music 链接
assets/audio/         ★ 真实录音的放置目录（见下）
```

## 音频接口约定（如何接入真实录音）

站内**所有声音都经由 `js/audio/engine.js`**。当前使用 Web Audio API 实时合成
四种占位音色（击弦 / 音叉 / FM 电钢 / 预置钢琴）。录音制作完成后，按以下路径
放入 mp3 即可**无缝替换，无需改任何代码**——引擎总是先尝试加载文件，失败才
回落到合成器：

| 路径 | 作用 | 优先级 |
| --- | --- | --- |
| `assets/audio/{eraId}/{midi}.mp3` | 某时代专属的单音采样（如 `cristofori/60.mp3` 是克氏钢琴的中央 C） | 最高 |
| `assets/audio/notes/{midi}.mp3` | 所有时代共用的单音采样 | 次之 |
| `assets/audio/motifs/{eraId}.mp3` | 整段替换该时代的「聆听这个时代」乐句 | 有则优先于合成音序 |
| `assets/audio/ambience/{eraId}.mp3` | 时代环境音（循环播放，随滚动淡入淡出）；无文件则静默跳过 | 可选 |

放好文件后，把相对路径加入 `assets/audio/manifest.json` 的 `files` 数组，例如：

```json
{ "files": ["notes/60.mp3", "motifs/cristofori.mp3", "ambience/roll.mp3"] }
```

清单的作用是避免网站为不存在的文件发出 404 请求；**直接删除 manifest.json
也可以**——引擎会退回「逐个探测」模式，功能完全相同，只是控制台会多一些
404 噪音。

- `{midi}` 为 MIDI 音号（A0 = 21，中央 C = 60，C8 = 108）。
- `{eraId}` 取值见 `js/data/eras.js`：`cristofori` `maffei` `silbermann`
  `vienna` `london` `erard` `iron` `liszt` `roll` `modern20` `electric`
  `digital` `coda` 等。
- 采样不必录满 88 个音——缺哪个音，哪个音自动用合成器补上。
- 每个时代的音域、音量、合成参数也都在 `js/data/eras.js` 中集中调整。

## 交互一览

- **Hero「开始聆听」**：解锁 AudioContext（浏览器要求用户手势），播放序章和弦。
- **底部键盘**：鼠标点击/按住滑奏、触摸、电脑键盘（Z 排低八度、Q 排高八度、
  ←/→ 移动八度）。时代之外的琴键显示为半透明「幽灵键」，不可发声。
- **聆听这个时代**：每章的特征乐句（巴赫「国王的主题」、莫扎特 K.545 音型、
  埃拉尔同音反复、凯奇预置节奏……），播放时琴键同步亮起。
- **击弦机解剖室**：三种机构的动画对比，点击图面即可击弦；埃拉尔式会连击两次。
- **音域的三百年**：悬停高亮各时代疆域，点击试听最低/最高音。
- **纸卷播放器**：打孔纸卷播放乔普林《The Entertainer》(1902)，孔洞过读取杆
  的瞬间触发真实发声。
- **观察机构**：各时代「声音档案」卡片可打开浮层，查看该时代击弦机的真实
  照片或 1911 年《大英百科全书》剖面版画（素材均来自 Wikimedia Commons，
  公有领域 / CC0 / CC BY / CC BY-SA，浮层内注明出处）。Esc 或点击遮罩关闭。
- **时代乐单**：每张「声音档案」卡片附 3–4 首经史实核对的代表曲目，
  点击通过 Apple Music Universal Link 打开固定曲目，数据在 `js/playlists.js`。
- **无障碍**：支持 `prefers-reduced-motion`（关闭视差/漂移动画）、键盘焦点可见。

## 已知待完善项

- 所有音色目前为合成占位，等待真实录音（见上方约定）。
- 历史图片使用 Wikimedia Commons 直链，离线或链接失效时会显示占位框
  （已做 `onerror` 降级）。
- 移动端键盘为横向滚动浏览，超小屏幕上琴键较窄。

## 素材与致谢

- 历史肖像与乐器照片：Wikimedia Commons（公有领域）——克里斯托福里 1720 年
  钢琴（纽约大都会艺术博物馆）、豪斯曼《巴赫》、克罗齐《莫扎特》、施蒂勒
  《贝多芬》、纳达尔《李斯特》、拉赫玛尼诺夫（美国国会图书馆）等。
- 击弦机素材（「观察机构」浮层，均为 Wikimedia Commons 直链）：1911 年
  《大英百科全书》击弦机版画系列（克里斯托福里 / 施泰因 / 埃拉尔 / 施坦威 /
  Pianola，公有领域）、西尔伯曼机构模型（CC0）、英式机构示意图（CC BY-SA
  3.0）、贝多芬-李斯特的布罗德伍德（匈牙利国家博物馆，CC BY 4.0）、凯奇
  与预置钢琴（巴登-符腾堡州立档案馆，CC BY 4.0）、Fender Rhodes 内部
  （CC BY-SA 3.0）、Yamaha DX7（CC BY 4.0）。
- 示意图（击弦机、交叉弦列、音叉、DIN-5）：本站手绘 SVG。
- 字体：[Fraunces](https://fonts.google.com/specimen/Fraunces) ·
  [Noto Serif SC](https://fonts.google.com/specimen/Noto+Serif+SC) ·
  [IBM Plex Mono](https://fonts.google.com/specimen/IBM+Plex+Mono)（Google Fonts）。
