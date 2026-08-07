#!/usr/bin/env node

/**
 * Resolve playlist search terms to concrete Apple Music catalog tracks.
 *
 * This is a development-only helper. The website ships the reviewed track IDs
 * and never calls the Search API at runtime.
 */

globalThis.document = { documentElement: { lang: 'zh-CN' } };

const { PLAYLISTS } = await import('../js/playlists.js');
const entries = Object.entries(PLAYLISTS).flatMap(([era, tracks]) =>
  tracks.map((track, index) => ({ era, index, ...track })),
);

const normalize = (value) => value
  .normalize('NFKD')
  .replace(/[\u0300-\u036f]/g, '')
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, ' ')
  .trim();

const scoreResult = (term, result) => {
  const tokens = normalize(term).split(' ').filter((token) => token.length > 2);
  const haystack = normalize(`${result.artistName} ${result.trackName} ${result.collectionName}`);
  return tokens.reduce((score, token) => score + (haystack.includes(token) ? 1 : 0), 0);
};

const output = [];
for (const entry of entries) {
  const params = new URLSearchParams({
    term: entry.term,
    country: 'cn',
    media: 'music',
    entity: 'song',
    limit: '8',
  });
  const response = await fetch(`https://itunes.apple.com/search?${params}`);
  if (!response.ok) throw new Error(`Search failed (${response.status}): ${entry.term}`);
  const payload = await response.json();
  const ranked = payload.results
    .map((result, order) => ({ result, order, score: scoreResult(entry.term, result) }))
    .sort((a, b) => b.score - a.score || a.order - b.order);
  const match = ranked[0]?.result;
  output.push({
    era: entry.era,
    index: entry.index,
    work: entry.work,
    term: entry.term,
    trackId: match?.trackId ?? null,
    artist: match?.artistName ?? null,
    track: match?.trackName ?? null,
    album: match?.collectionName ?? null,
    url: match?.trackViewUrl ?? null,
  });
}

process.stdout.write(`${JSON.stringify(output, null, 2)}\n`);
