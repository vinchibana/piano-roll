/**
 * AudioEngine — every sound on the site flows through this single module.
 *
 * Design goals:
 *   1. The site is playable TODAY via Web Audio synthesis (four timbre models).
 *   2. Real recordings can be dropped in later with zero code changes:
 *        assets/audio/notes/{midi}.mp3     — per-note samples (shared)
 *        assets/audio/{eraId}/{midi}.mp3   — per-era per-note samples (優先)
 *        assets/audio/motifs/{eraId}.mp3   — one file replacing an era motif
 *        assets/audio/ambience/{eraId}.mp3 — looping room tone per era
 *      Missing files degrade silently back to synthesis / no ambience.
 *   3. AudioContext is created lazily on the first user gesture (`unlock()`).
 */

const MAX_VOICES = 28;

export class AudioEngine {
  constructor() {
    this.ctx = null;
    this.master = null;
    this.dryGain = null;
    this.wetGain = null;
    this.muted = false;
    this.voices = new Set();
    /** url -> AudioBuffer | 'missing' | Promise */
    this.bufferCache = new Map();
    this.motifTimer = null;
    this.motifVoices = [];
    this.ambienceSource = null;
    this.ambienceGain = null;
    this.ambienceEra = null;
    this.manifestPromise = null;
  }

  /**
   * assets/audio/manifest.json lists which recording files exist, so we
   * never fire 404 requests for files that were not produced yet.
   * If the manifest itself is missing, we fall back to probing every URL
   * (still functional, just noisier in the network log).
   */
  #getManifest() {
    if (!this.manifestPromise) {
      this.manifestPromise = fetch('assets/audio/manifest.json')
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => (Array.isArray(data?.files) ? new Set(data.files) : null))
        .catch(() => null);
    }
    return this.manifestPromise;
  }

  get unlocked() {
    return this.ctx !== null;
  }

  /** Must be called from a user gesture (click / keydown / touch). */
  unlock() {
    if (this.ctx) {
      if (this.ctx.state === 'suspended') this.ctx.resume();
      return;
    }
    const Ctx = window.AudioContext || window.webkitAudioContext;
    this.ctx = new Ctx();

    this.master = this.ctx.createGain();
    this.master.gain.value = 0.9;

    // Gentle glue compression keeps big-chord motifs from clipping.
    const comp = this.ctx.createDynamicsCompressor();
    comp.threshold.value = -18;
    comp.knee.value = 24;
    comp.ratio.value = 4;
    comp.attack.value = 0.004;
    comp.release.value = 0.24;

    // A small generated hall: white-noise impulse with exponential decay.
    const reverb = this.ctx.createConvolver();
    reverb.buffer = this.#makeImpulse(2.4, 2.6);

    this.dryGain = this.ctx.createGain();
    this.dryGain.gain.value = 0.82;
    this.wetGain = this.ctx.createGain();
    this.wetGain.gain.value = 0.24;

    this.dryGain.connect(comp);
    this.wetGain.connect(reverb);
    reverb.connect(comp);
    comp.connect(this.master);
    this.master.connect(this.ctx.destination);
  }

  setMuted(muted) {
    this.muted = muted;
    if (this.master) {
      const t = this.ctx.currentTime;
      this.master.gain.cancelScheduledValues(t);
      this.master.gain.setTargetAtTime(muted ? 0 : 0.9, t, 0.06);
    }
  }

  /* ------------------------------------------------------------------ */
  /* Public playback API                                                 */
  /* ------------------------------------------------------------------ */

  /**
   * Play one note. Tries era-specific sample, then shared sample,
   * then falls back to the synthesiser. `timbre` comes from eras.js.
   */
  async playNote(midi, { velocity = 0.75, timbre, eraId } = {}) {
    if (!this.ctx || this.muted) return;
    const t = this.ctx.currentTime;
    const urls = [];
    if (eraId) urls.push(`assets/audio/${eraId}/${midi}.mp3`);
    urls.push(`assets/audio/notes/${midi}.mp3`);
    const buffer = await this.#firstAvailableBuffer(urls);
    if (buffer) {
      this.#playBuffer(buffer, t, velocity * (timbre?.gain ?? 1));
    } else {
      this.#synthNote(midi, t, velocity, timbre ?? {});
    }
  }

  /**
   * Play an era motif: prefers assets/audio/motifs/{eraId}.mp3,
   * otherwise schedules the synthesised sequence from eras.js.
   * Returns a stop() function; onDone fires when playback ends.
   */
  async playMotif(era, { onNote, onDone } = {}) {
    if (!this.ctx || this.muted) return () => {};
    this.stopMotif();

    const fileBuffer = await this.#firstAvailableBuffer([`assets/audio/motifs/${era.id}.mp3`]);
    if (fileBuffer) {
      const src = this.#playBuffer(fileBuffer, this.ctx.currentTime, 0.9);
      const timer = setTimeout(() => onDone?.(), fileBuffer.duration * 1000 + 100);
      this.motifTimer = timer;
      return () => { clearTimeout(timer); src.stop(); };
    }

    const beat = 60 / (era.motifBpm ?? 90);
    const start = this.ctx.currentTime + 0.08;
    let lastEnd = 0;
    for (const [tBeat, midi, durBeat, vel] of era.motif) {
      const when = start + tBeat * beat;
      this.#synthNote(midi, when, vel, era.timbre, durBeat * beat);
      lastEnd = Math.max(lastEnd, (tBeat + durBeat) * beat);
      if (onNote) {
        const delay = (when - this.ctx.currentTime) * 1000;
        this.motifVoices.push(setTimeout(() => onNote(midi, vel), Math.max(0, delay)));
      }
    }
    const doneTimer = setTimeout(() => onDone?.(), (lastEnd + 0.4) * 1000);
    this.motifTimer = doneTimer;
    return () => this.stopMotif();
  }

  stopMotif() {
    if (this.motifTimer) clearTimeout(this.motifTimer);
    for (const timer of this.motifVoices) clearTimeout(timer);
    this.motifVoices = [];
    this.motifTimer = null;
  }

  /**
   * Crossfade the optional ambience loop for an era.
   * Silently does nothing when assets/audio/ambience/{eraId}.mp3 is absent.
   */
  async setEraAmbience(eraId) {
    if (!this.ctx || eraId === this.ambienceEra) return;
    this.ambienceEra = eraId;
    const buffer = await this.#firstAvailableBuffer([`assets/audio/ambience/${eraId}.mp3`]);
    // Era may have changed again while the file was loading.
    if (this.ambienceEra !== eraId) return;

    const t = this.ctx.currentTime;
    if (this.ambienceSource) {
      this.ambienceGain.gain.setTargetAtTime(0, t, 0.8);
      const old = this.ambienceSource;
      setTimeout(() => old.stop(), 2500);
      this.ambienceSource = null;
    }
    if (!buffer) return;

    const src = this.ctx.createBufferSource();
    src.buffer = buffer;
    src.loop = true;
    const gain = this.ctx.createGain();
    gain.gain.value = 0;
    gain.gain.setTargetAtTime(0.3, t, 1.2);
    src.connect(gain);
    gain.connect(this.dryGain);
    src.start();
    this.ambienceSource = src;
    this.ambienceGain = gain;
  }

  /* ------------------------------------------------------------------ */
  /* Sample loading with graceful degradation                            */
  /* ------------------------------------------------------------------ */

  async #firstAvailableBuffer(urls) {
    const manifest = await this.#getManifest();
    for (const url of urls) {
      // With a manifest, only fetch files it declares.
      if (manifest && !manifest.has(url.replace('assets/audio/', ''))) continue;
      const buf = await this.#loadBuffer(url);
      if (buf) return buf;
    }
    return null;
  }

  #loadBuffer(url) {
    const cached = this.bufferCache.get(url);
    if (cached === 'missing') return Promise.resolve(null);
    if (cached instanceof AudioBuffer) return Promise.resolve(cached);
    if (cached) return cached; // in-flight promise

    const promise = fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error('missing');
        return res.arrayBuffer();
      })
      .then((data) => this.ctx.decodeAudioData(data))
      .then((buffer) => {
        this.bufferCache.set(url, buffer);
        return buffer;
      })
      .catch(() => {
        this.bufferCache.set(url, 'missing');
        return null;
      });
    this.bufferCache.set(url, promise);
    return promise;
  }

  #playBuffer(buffer, when, gainValue) {
    const src = this.ctx.createBufferSource();
    src.buffer = buffer;
    const gain = this.ctx.createGain();
    gain.gain.value = gainValue;
    src.connect(gain);
    gain.connect(this.dryGain);
    gain.connect(this.wetGain);
    src.start(when);
    return src;
  }

  /* ------------------------------------------------------------------ */
  /* Synthesiser — four timbre models                                    */
  /* ------------------------------------------------------------------ */

  #synthNote(midi, when, velocity, timbre, holdDur) {
    if (this.voices.size >= MAX_VOICES) {
      const oldest = this.voices.values().next().value;
      oldest.kill();
    }
    const freq = 440 * 2 ** ((midi - 69) / 12);
    const model = timbre.model ?? 'struck';
    if (model === 'tine') this.#tineVoice(freq, when, velocity, timbre, holdDur);
    else if (model === 'fm') this.#fmVoice(freq, when, velocity, timbre, holdDur);
    else if (model === 'prepared') this.#preparedVoice(midi, freq, when, velocity, timbre);
    else this.#struckVoice(midi, freq, when, velocity, timbre, holdDur);
  }

  #registerVoice(nodes, stopAt) {
    const voice = {
      kill: () => {
        for (const node of nodes) {
          try { node.stop(); } catch { /* already stopped */ }
        }
        this.voices.delete(voice);
      },
    };
    this.voices.add(voice);
    setTimeout(() => this.voices.delete(voice), (stopAt - this.ctx.currentTime) * 1000 + 60);
    return voice;
  }

  /** Generic hammered string: stretched partials + filtered hammer noise. */
  #struckVoice(midi, freq, when, velocity, timbre, holdDur) {
    const ctx = this.ctx;
    const {
      brightness = 8, decay = 3, inharmonicity = 0.0004, hammer = 0.6, gain = 0.9,
    } = timbre;

    // Bass notes ring longer, treble dies quickly — scale decay by register.
    const register = (midi - 21) / 87; // 0 = lowest, 1 = highest
    const noteDecay = decay * (1.5 - register) * (holdDur ? Math.min(1, (holdDur + 0.7) / decay) : 1);
    const peak = 0.24 * gain * (0.4 + velocity * 0.85);

    const out = ctx.createGain();
    out.gain.setValueAtTime(0, when);
    out.gain.linearRampToValueAtTime(peak, when + 0.004);
    out.gain.exponentialRampToValueAtTime(0.0001, when + Math.max(0.25, noteDecay));

    // Brightness follows velocity, like a real hammer hitting harder.
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    const cutoff = Math.min(14000, freq * brightness * (0.5 + velocity));
    filter.frequency.setValueAtTime(cutoff, when);
    filter.frequency.exponentialRampToValueAtTime(Math.max(freq * 1.4, 320), when + noteDecay * 0.7);
    filter.Q.value = 0.4;

    out.connect(filter);
    filter.connect(this.dryGain);
    filter.connect(this.wetGain);

    const partialGains = [1, 0.5 + velocity * 0.2, 0.32, 0.18, 0.09];
    const oscs = [];
    const stopAt = when + noteDecay + 0.15;
    for (let n = 1; n <= 5; n += 1) {
      const osc = ctx.createOscillator();
      // Inharmonic stretching: real strings run sharp in upper partials.
      osc.frequency.value = freq * n * Math.sqrt(1 + inharmonicity * n * n);
      osc.type = n === 1 ? 'triangle' : 'sine';
      const og = ctx.createGain();
      og.gain.value = partialGains[n - 1] / 1.9;
      osc.connect(og);
      og.connect(out);
      osc.start(when);
      osc.stop(stopAt);
      oscs.push(osc);
    }

    // Hammer thump: a short band-passed noise burst at the attack.
    if (hammer > 0) {
      const noise = this.#noiseSource(0.09);
      const nf = ctx.createBiquadFilter();
      nf.type = 'bandpass';
      nf.frequency.value = Math.min(9000, freq * 3);
      nf.Q.value = 1.1;
      const ng = ctx.createGain();
      ng.gain.setValueAtTime(peak * hammer * 0.7, when);
      ng.gain.exponentialRampToValueAtTime(0.0001, when + 0.08);
      noise.connect(nf);
      nf.connect(ng);
      ng.connect(this.dryGain);
      noise.start(when);
      oscs.push(noise);
    }
    this.#registerVoice(oscs, stopAt);
  }

  /** Rhodes-like tine: pure fundamental + bell partial + soft bark. */
  #tineVoice(freq, when, velocity, timbre, holdDur) {
    const ctx = this.ctx;
    const gain = timbre.gain ?? 0.85;
    const decayLen = (timbre.decay ?? 3.5) * (holdDur ? Math.min(1, (holdDur + 0.8) / 3) : 1);
    const peak = 0.3 * gain * (0.35 + velocity * 0.9);
    const stopAt = when + decayLen + 0.2;

    const out = ctx.createGain();
    out.gain.setValueAtTime(0, when);
    out.gain.linearRampToValueAtTime(peak, when + 0.006);
    out.gain.exponentialRampToValueAtTime(0.0001, when + decayLen);
    out.connect(this.dryGain);
    out.connect(this.wetGain);

    const fundamental = ctx.createOscillator();
    fundamental.type = 'sine';
    fundamental.frequency.value = freq;

    // The metallic "ping" sits near the 4th partial and dies fast.
    const bell = ctx.createOscillator();
    bell.type = 'sine';
    bell.frequency.value = freq * 3.98;
    const bellGain = ctx.createGain();
    bellGain.gain.setValueAtTime(0.5 * velocity, when);
    bellGain.gain.exponentialRampToValueAtTime(0.0001, when + 0.5);

    // Hard playing adds the famous Rhodes "bark" (2nd partial growl).
    const bark = ctx.createOscillator();
    bark.type = 'sine';
    bark.frequency.value = freq * 2;
    const barkGain = ctx.createGain();
    barkGain.gain.setValueAtTime(Math.max(0, velocity - 0.5) * 0.8, when);
    barkGain.gain.exponentialRampToValueAtTime(0.0001, when + 0.9);

    fundamental.connect(out);
    bell.connect(bellGain);
    bellGain.connect(out);
    bark.connect(barkGain);
    barkGain.connect(out);
    for (const osc of [fundamental, bell, bark]) {
      osc.start(when);
      osc.stop(stopAt);
    }
    this.#registerVoice([fundamental, bell, bark], stopAt);
  }

  /** DX7-style electric piano: body pair (1:1) + fast-decaying tine pair (1:14). */
  #fmVoice(freq, when, velocity, timbre, holdDur) {
    const ctx = this.ctx;
    const gain = timbre.gain ?? 0.8;
    const decayLen = (timbre.decay ?? 3) * (holdDur ? Math.min(1, (holdDur + 0.8) / 3) : 1);
    const peak = 0.28 * gain * (0.35 + velocity * 0.9);
    const stopAt = when + decayLen + 0.2;

    const out = ctx.createGain();
    out.gain.setValueAtTime(0, when);
    out.gain.linearRampToValueAtTime(peak, when + 0.004);
    out.gain.exponentialRampToValueAtTime(0.0001, when + decayLen);
    out.connect(this.dryGain);
    out.connect(this.wetGain);

    const makePair = (ratio, index, indexDecay, level) => {
      const carrier = ctx.createOscillator();
      carrier.type = 'sine';
      carrier.frequency.value = freq;
      const mod = ctx.createOscillator();
      mod.type = 'sine';
      mod.frequency.value = freq * ratio;
      const modGain = ctx.createGain();
      modGain.gain.setValueAtTime(freq * index * velocity, when);
      modGain.gain.exponentialRampToValueAtTime(freq * 0.02, when + indexDecay);
      mod.connect(modGain);
      modGain.connect(carrier.frequency);
      const cg = ctx.createGain();
      cg.gain.value = level;
      carrier.connect(cg);
      cg.connect(out);
      carrier.start(when);
      carrier.stop(stopAt);
      mod.start(when);
      mod.stop(stopAt);
      return [carrier, mod];
    };

    const nodes = [
      ...makePair(1, 1.4, 1.6, 0.8),   // warm body
      ...makePair(14, 1.8, 0.18, 0.35), // glassy attack "clink"
    ];
    this.#registerVoice(nodes, stopAt);
  }

  /** Prepared piano: pitch smeared by hardware, mostly percussive thunk. */
  #preparedVoice(midi, freq, when, velocity, timbre) {
    const ctx = this.ctx;
    const gain = timbre.gain ?? 0.85;
    const peak = 0.3 * gain * (0.4 + velocity * 0.8);
    // Screws and bolts detune each note unpredictably (but deterministically per key).
    const detune = 1 + (Math.sin(midi * 12.9898) * 0.5) * 0.06;
    const stopAt = when + 1.1;

    const out = ctx.createGain();
    out.gain.setValueAtTime(0, when);
    out.gain.linearRampToValueAtTime(peak, when + 0.003);
    out.gain.exponentialRampToValueAtTime(0.0001, when + (timbre.decay ?? 0.9));
    out.connect(this.dryGain);
    out.connect(this.wetGain);

    const tone = ctx.createOscillator();
    tone.type = 'triangle';
    tone.frequency.value = freq * detune;
    const toneGain = ctx.createGain();
    toneGain.gain.value = 0.4;

    // A metallic clang partial, non-harmonic on purpose.
    const clang = ctx.createOscillator();
    clang.type = 'square';
    clang.frequency.value = freq * detune * 2.76;
    const clangGain = ctx.createGain();
    clangGain.gain.setValueAtTime(0.16, when);
    clangGain.gain.exponentialRampToValueAtTime(0.0001, when + 0.3);

    const noise = this.#noiseSource(0.2);
    const nf = ctx.createBiquadFilter();
    nf.type = 'bandpass';
    nf.frequency.value = Math.min(6000, freq * 2.5);
    nf.Q.value = 0.8;
    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(peak, when);
    noiseGain.gain.exponentialRampToValueAtTime(0.0001, when + 0.15);

    tone.connect(toneGain);
    toneGain.connect(out);
    clang.connect(clangGain);
    clangGain.connect(out);
    noise.connect(nf);
    nf.connect(noiseGain);
    noiseGain.connect(this.dryGain);

    tone.start(when); tone.stop(stopAt);
    clang.start(when); clang.stop(stopAt);
    noise.start(when);
    this.#registerVoice([tone, clang, noise], stopAt);
  }

  /* ------------------------------------------------------------------ */
  /* Helpers                                                             */
  /* ------------------------------------------------------------------ */

  #noiseSource(seconds) {
    const ctx = this.ctx;
    const buffer = ctx.createBuffer(1, ctx.sampleRate * seconds, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i += 1) data[i] = Math.random() * 2 - 1;
    const src = ctx.createBufferSource();
    src.buffer = buffer;
    return src;
  }

  #makeImpulse(seconds, decayPower) {
    const ctx = this.ctx;
    const rate = ctx.sampleRate;
    const length = rate * seconds;
    const impulse = ctx.createBuffer(2, length, rate);
    for (let channel = 0; channel < 2; channel += 1) {
      const data = impulse.getChannelData(channel);
      for (let i = 0; i < length; i += 1) {
        data[i] = (Math.random() * 2 - 1) * (1 - i / length) ** decayPower;
      }
    }
    return impulse;
  }
}

/** Shared singleton used by every module. */
export const engine = new AudioEngine();
