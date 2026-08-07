# Modartt Demo 音源筛选清单

抓取日期：2026-08-06

用途：为《300 年钢琴史》网页保存候选原始声音。已确认的条目经过响度统一和淡入淡出后，输出至 `../motifs/` 并接入网页播放器；本目录继续保留完整原文件。

## 遍历范围

已从 Modartt 的 [Pianoteq instruments](https://www.modartt.com/pianoteq_instruments) 索引读取全部 27 个乐器包页面：

`bechstein`、`bells`、`bluethner`、`bosendorfer`、`celeste`、`electric`、`grotrian`、`guitar`、`harp`、`harpsichord`、`hohner_collection`、`k2`、`karsten`、`kawai`、`kivir`、`kremsegg1`、`kremsegg2`、`modelb`、`modeld`、`petrof`、`steelpans`、`steingraeber`、`syngular`、`u4`、`vibes`、`xylo`、`yc5`。

当前页面接口共返回 391 条 Demo，完整原始索引见 `all-current-demos.json`。KIViR 历史页当前不从该接口返回曲目，所以又检查了 Walter、Schöffstoss、Schmidt、Schantz、Graf、Pleyel、Érard 等旧页面及其公开媒体直链。

## 已下载候选

| 文件 | 对应网页节点 | 实际模型 / 曲目 | 匹配度 | 使用说明 |
| --- | --- | --- | --- | --- |
| `Cristofori.mp3` | 1700 Cristofori | Cristofori piano; Domenico Scarlatti, Sonata K.9 | 很高 | 项目补充音源，已取 20 秒片段接入 `motifs/cristofori.mp3`。 |
| `Bach Silbermann.mp3` | 1730s Silbermann | Silbermann piano; J. S. Bach, Partita No. 2 in C minor, BWV 826 | 很高 | 项目补充音源，已取 20 秒片段接入 `motifs/silbermann.mp3`。 |
| `01-1700-pre-piano-grimaldi-1697.mp3` | 1700 Cristofori | Grimaldi harpsichord (1697); Handel, *E major Suite: Allemande*; Robin Bigwood | 时代高、机制低 | 不是钢琴。适合当“钢琴出现以前”的对照，不应标成 Cristofori 音色。[来源页面](https://www.modartt.com/pianoteq_free#pianoforte) |
| `02-1730s-date-reference-blanchet-1733.mp3` | 1730s Silbermann | Blanchet harpsichord (1733); Couperin, *Les Barricades mystérieuses*; Robin Bigwood | 年代高、机制低 | 年份几乎完全对应，但仍是拨弦古钢琴，只适合时代参照。[来源页面](https://www.modartt.com/pianoteq_free#pianoforte) |
| `03-1730s-fortepiano-proxy-dohnal-1795.mp3` | 1700 / 1730s 早期槌击钢琴 | J. Dohnal pianoforte (1795); Pachelbel, *Chaconne in F minor*; Noa Leigh Kleisen | 机制中高、年代低 | Modartt 内最接近早期木框槌击钢琴的替代之一，但比 Silbermann 晚约 60 年。[来源页面](https://www.modartt.com/kremsegg1) |
| `04-1777-vienna-walter-ca1790.mp3` | 1777 Vienna | Anton Walter pianoforte, ca. 1790; Scarlatti, Sonata K.3/L.378; Kaila Rochelle | 高 | 维也纳式轻型击弦机和莫扎特时代语境都很合适。[来源页面](https://www.modartt.com/walter) |
| `05-1812-vienna-schoeffstoss.mp3` | 1777 Vienna / 1818 London 对照 | Schöffstoss pianoforte (1812); Mozart, Sonata K.457; Darrett Zusko | 高（维也纳支线） | 用来和 Broadwood 对照很有价值；原文件约 15 分钟，网页应截短。[来源页面](https://www.modartt.com/schoffstoss) |
| `06-1818-london-broadwood-1796.mp3` | 1818 London / Beethoven | J. Broadwood grand piano (1796); Beethoven, *Hammerklavier*; Joseph Felice | 高 | 品牌、英国流派和贝多芬语境准确；模型年份比 1818 早约 22 年。[来源页面](https://www.modartt.com/kremsegg2) |
| `07-1821-date-proxy-graf-1826.mp3` | 1821 双擒纵前后 | Graf pianoforte (1826); Beethoven, Sonata Op.90; Joris Holtackers | 年代高、机制低 | 时间最接近，但不是 Érard 双擒纵击弦机。适合表达 1820 年代的一般音响，不适合演示发明本身。[来源页面](https://www.modartt.com/graf) |
| `08-1821-mechanism-erard-1849.mp3` | 1821 Érard double escapement | S. Érard grand piano (1849); Liszt, *Gnomenreigen*; Natalie Lo | 机制/品牌高、年代中 | 品牌与技术谱系准确；快速重复音也能体现双擒纵的价值，但模型晚 28 年。[来源页面](https://www.modartt.com/kremsegg1) |
| `09-1840s-liszt-erard-1849.mp3` | 1840s Liszt | S. Érard grand piano (1849); Liszt, *Waldesrauschen*; Boris Feiner | 很高 | 当前资源中最贴合“李斯特 + 1840 年代 + Érard”的条目。[来源页面](https://www.modartt.com/kremsegg1) |
| `10-1859-ny-steinway-square-1858.mp3` | 1859 iron / Steinway | New York Steinway square piano (1858); Schumann, *Variations on the name Abegg*; Christopher Son Richardson | 很高 | 品牌与年份几乎精确；但它是方形钢琴，不是现代三角钢琴。[来源页面](https://www.modartt.com/karsten) |
| `11-1900s-bechstein-1899.mp3` | 1900s player-piano era | C. Bechstein grand piano (1899); Debussy, *Ondine*; Tami Lin | 音色/时代高、装置低 | 很适合世纪之交音色，但 Demo 没有复刻卷轴与气动机构；网页文案不能称其为 player-piano 录音。[来源页面](https://www.modartt.com/kremsegg2) |
| `12-1965-rhodes-mki.mp3` | 1965 electric | Rhodes Mark I; *On the Road again*; Blaž Jurjevčič | 很高 | 与电钢琴节点直接对应。[来源页面](https://www.modartt.com/electric) |
| `13-1965-wurlitzer-w1.mp3` | 1965 electric | Wurlitzer W1; *Wurly Wonderland*; Joris Holtackers | 很高 | 可与 Rhodes 并列，让用户听见音叉/簧片电钢的差异。[来源页面](https://www.modartt.com/electric) |
| `15-today-ny-steinway-d.mp3` | Today / modern concert grand | New York Steinway D; Schumann, *Variations on the name Abegg*; Christopher Son Richardson | 很高 | 与 1858 Steinway Square 使用同曲、同演奏者，天然构成跨 160 年 A/B 对比。[来源页面](https://www.modartt.com/modeld) |

## 没有精确匹配的节点

- **1700 Cristofori**：站内没有 Cristofori 模型。Grimaldi 1697 只能作为发明前的拨弦键盘对照；Dohnal 1795 只能作为后世早期槌击钢琴近似。
- **1940 prepared piano**：391 条当前 Demo 中没有 John Cage 式螺栓、橡皮等预置物音色。`felt`、`honky-tonk` 和 Syngular 都不是同一机制，因此没有下载并冒充替代品。
- **1983 Yamaha DX7**：Pianoteq 是物理建模产品，站内没有 DX7 的六运算器 FM 钢琴。旧 CP-80 Demo 直链已经失效（HTTP 404）；CP-80 即使可用也属于电声钢琴，不是 DX7 的替代品。
- **1900s player piano**：有 1899 Bechstein 的时代音色，没有卷轴/气动重放机制的演示。

## 已接入网页

- `cristofori`：Cristofori piano / Scarlatti K.9
- `silbermann`：Silbermann piano / J. S. Bach, Partita No. 2, BWV 826
- `vienna`：Anton Walter pianoforte, ca. 1790
- `london`：J. Broadwood grand, 1796
- `erard`：S. Érard grand, 1849 / Liszt, *Gnomenreigen*
- `iron`：New York Steinway square, 1858
- `liszt`：S. Érard grand, 1849 / Liszt, *Waldesrauschen*
- `electric`：Rhodes Mark I 与 Wurlitzer W1 串联对比
- `coda`：现代 New York Steinway D

Maffei 强弱对比、player-piano 纸卷、prepared piano 和 DX7 节点继续使用原有实时合成，因为当前候选录音不能准确表达这些节点的具体机制。

## 建议的网页剪辑长度

原始文件总计约 93 MB，多数为 1–6 分钟完整 Demo。网页版本采用 20 秒试听片段，电钢琴对比为 27.2 秒；全部统一至约 -18 LUFS，并加入短淡入淡出。最终 `motifs/` 音频约 3.6 MB，且只在用户点击后加载。

## 权利与标注

这些文件来自 Modartt 公共网页与 `media.modartt.com` 媒体服务器。下载本身不代表取得再发布许可。上线前至少要确认：Modartt 对 Demo 音频的再分发授权、演奏者/录音权、作品权利状态，以及页面中对 Pianoteq 模型而非历史实物录音的准确标注。
