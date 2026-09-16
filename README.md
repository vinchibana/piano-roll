# A Listening History of the Piano

> Three hundred years of piano history, as a website you can listen to.

A static, single-page immersive site: from Cristofori’s invention of the hammer action in Florence around 1700, to MIDI, digital pianos, and the Disklavier. As you scroll, the playable keyboard at the bottom changes range and timbre with history—Cristofori’s era had only about four octaves and a quiet voice; the modern piano has a full 88 keys.

## Chinese and English versions

- Chinese entry: `index.html`
- English entry: `index-en.html`
- Both pages share the same CSS, audio engine, and interaction modules. Modules switch language based on `<html lang>`.
- The top-bar `EN / 中` control switches between the two versions.
- The English page is generated from the Chinese skeleton by `scripts/build_english.py`. Historical names, dates, and English copy are maintained in that script and in the English data of each interaction module.
- English Open Graph image: `assets/og-en.png`.

## Local preview

No build step is required. Any static file server works. Do not open the HTML file by double-clicking it, because the site uses ES modules and `fetch`.

```bash
python3 -m http.server 8000
# open http://localhost:8000
```

## Project structure

```
index.html            Page skeleton and all chapter copy (16 chapters / modules)
css/
  base.css            Design tokens, typography, custom cursor, reveal animation primitives
  layout.css          Top bar, paper-roll progress, hero, chapter grid, keyboard base
  components.css      Sound-archive cards, listen buttons, journal inserts, anatomy room, range map, roll player
  eras.css            One atmosphere palette per era (candlelight → porcelain gold → crimson → bronze → paper yellow → cool cyan)
js/
  main.js             Entry: wires modules, sound toggle, “listen to this era” buttons
  data/eras.js        ★ Era registry: range, synth timbre parameters, auditory motif sequences
  audio/engine.js     ★ Sole audio outlet: synthesizer + recorded-sample loading and fallback
  keyboard.js         88-key playable keyboard (mouse glissando / touch / computer keyboard Z and Q rows)
  scroll.js           Scroll driver: era switching, progress roll, entrance animation, parallax
  pianoroll.js        Hero drifting piano roll + playable punched roll of “The Entertainer”
  anatomy.js          Action anatomy room (Viennese / English / Érard double-escapement animation)
  rangeviz.js         Range-evolution visualization (49 → 88 keys)
  gallery.js          “Inspect the action” overlay: period photos / engravings of each action + sources
  playlists.js        “Era playlists”: 3–4 Apple Music links per era
assets/audio/         ★ Directory for recorded samples (see below)
```

## Audio interface (how to plug in real recordings)

**All sound on the site goes through `js/audio/engine.js`.** It currently synthesizes four placeholder timbres in real time with the Web Audio API (hammered / tine / FM electric / prepared piano). Once recordings are ready, drop mp3 files at the paths below to replace the placeholders with no code changes—the engine always tries to load a file first and falls back to the synthesizer on failure:

| Path | Role | Priority |
| --- | --- | --- |
| `assets/audio/{eraId}/{midi}.mp3` | Per-era single-note sample (e.g. `cristofori/60.mp3` is middle C on Cristofori’s piano) | Highest |
| `assets/audio/notes/{midi}.mp3` | Shared single-note samples for every era | Next |
| `assets/audio/motifs/{eraId}.mp3` | Replaces that era’s “listen to this era” phrase in full | Used instead of the synthesized sequence when present |
| `assets/audio/ambience/{eraId}.mp3` | Era ambience (loops, fades in and out with scroll); silently skipped if missing | Optional |

After adding files, list the relative paths in the `files` array of `assets/audio/manifest.json`, for example:

```json
{ "files": ["notes/60.mp3", "motifs/cristofori.mp3", "ambience/roll.mp3"] }
```

The manifest keeps the site from requesting files that do not exist. **You can also delete `manifest.json`**—the engine then falls back to probing each path. Behavior is the same; the console will just show extra 404 noise.

- `{midi}` is a MIDI note number (A0 = 21, middle C = 60, C8 = 108).
- `{eraId}` values live in `js/data/eras.js`: `cristofori` `maffei` `silbermann` `vienna` `london` `erard` `iron` `liszt` `roll` `modern20` `electric` `digital` `coda`, and others.
- You do not need all 88 notes. Any missing pitch is filled in by the synthesizer.
- Range, volume, and synth parameters for each era are also centralized in `js/data/eras.js`.

## Interactions

- **Hero “Start listening”**: unlocks the AudioContext (browsers require a user gesture) and plays the opening chord.
- **Bottom keyboard**: click / hold-and-glide, touch, or computer keyboard (Z row = lower octave, Q row = higher octave, ←/→ shift octave). Keys outside the current era render as translucent “ghost keys” and do not sound.
- **Listen to this era**: a characteristic phrase for each chapter (Bach’s “Royal Theme,” Mozart K.545 figuration, Érard repeated notes, Cage prepared-piano rhythm, and so on). Keys light up in sync while it plays.
- **Action anatomy room**: animated comparison of three actions. Click the drawing to strike a note; the Érard action repeats twice.
- **Three centuries of range**: hover to highlight each era’s compass; click to hear the lowest and highest notes.
- **Piano-roll player**: a punched roll of Joplin’s “The Entertainer” (1902). Notes fire as holes pass the tracker bar.
- **Inspect the action**: each era’s “sound archive” card opens an overlay with a period photograph of that action or a 1911 *Encyclopædia Britannica* cross-section engraving (all from Wikimedia Commons: public domain / CC0 / CC BY / CC BY-SA, with sources credited in the overlay). Esc or click the mask to close.
- **Era playlists**: each “sound archive” card includes 3–4 historically checked representative tracks. Clicks open a fixed track via Apple Music Universal Links. Data lives in `js/playlists.js`.
- **Accessibility**: honors `prefers-reduced-motion` (disables parallax / drift) and keeps keyboard focus visible.

## Known follow-ups

- All timbres are still synthesized placeholders pending real recordings (see the interface above).
- Historical images are hotlinked from Wikimedia Commons. Offline use or a broken link shows a placeholder (with `onerror` fallback).
- On mobile the keyboard scrolls horizontally; keys get quite narrow on very small screens.

## Credits

- Historical portraits and instrument photos: Wikimedia Commons (public domain)—Cristofori’s 1720 piano (The Metropolitan Museum of Art, New York), Haussmann’s Bach, Croce’s Mozart, Stieler’s Beethoven, Nadar’s Liszt, Rachmaninoff (Library of Congress), and others.
- Action materials (“Inspect the action” overlay, all Wikimedia Commons hotlinks): the 1911 *Encyclopædia Britannica* action engraving series (Cristofori / Stein / Érard / Steinway / Pianola, public domain), Silbermann action model (CC0), English-action diagram (CC BY-SA 3.0), Beethoven–Liszt Broadwood (Hungarian National Museum, CC BY 4.0), Cage and the prepared piano (Landesarchiv Baden-Württemberg, CC BY 4.0), Fender Rhodes interior (CC BY-SA 3.0), Yamaha DX7 (CC BY 4.0).
- Diagrams (actions, cross-stringing, tines, DIN-5): original SVGs drawn for this site.
- Fonts: [Fraunces](https://fonts.google.com/specimen/Fraunces) · [Noto Serif SC](https://fonts.google.com/specimen/Noto+Serif+SC) · [IBM Plex Mono](https://fonts.google.com/specimen/IBM+Plex+Mono) (Google Fonts).
