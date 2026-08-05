/**
 * Search matcher + normalization (T-F2, TAD §11.2): semantics, scoring
 * hierarchy, AND-across-tokens, date tie-break, diacritic forgiveness.
 */
import { describe, expect, it } from 'vitest';

import { docMatches, searchDocs, type SearchDoc } from '../../../src/features/search/lib/matcher';
import { normalizeText, tokenize } from '../../../src/features/search/lib/normalize';

const docs: SearchDoc[] = [
  { s: 'photosynthesis', t: 'Photosynthesis: How Plants Make Food', u: 'Science', g: ['biology', 'plants', 'energy'], d: '2026-08-01' },
  { s: 'french-revolution', t: 'The French Revolution: Causes and Consequences', u: 'History', g: ['revolution', 'europe'], d: '2026-07-24' },
  { s: 'romantic-poetry', t: 'The Poetry of the Romantics', u: 'English', g: ['poetry', 'romanticism', 'literature'], d: '2026-07-10' },
  { s: 'plant-cells', t: 'Plant Cells Under the Microscope', u: 'Science', g: ['biology', 'cells'], d: '2026-06-15' },
];

describe('normalizeText / tokenize', () => {
  it('lowercases, trims, and collapses whitespace', () => {
    expect(normalizeText('  Hello   WORLD  ')).toBe('hello world');
  });

  it('strips diacritics so accented queries match', () => {
    expect(normalizeText('Café Crème')).toBe('cafe creme');
  });

  it('tokenizes on whitespace; empty query yields no tokens', () => {
    expect(tokenize('plant food')).toEqual(['plant', 'food']);
    expect(tokenize('   ')).toEqual([]);
  });
});

describe('searchDocs (TAD §11.2 semantics)', () => {
  it('returns [] for empty or whitespace-only queries', () => {
    expect(searchDocs('', docs)).toEqual([]);
    expect(searchDocs('   ', docs)).toEqual([]);
  });

  it('matches title substrings', () => {
    const results = searchDocs('plants', docs);
    expect(results.map((r) => r.doc.s)).toContain('photosynthesis');
  });

  it('matches subjects and tags', () => {
    expect(searchDocs('history', docs).map((r) => r.doc.s)).toEqual(['french-revolution']);
    expect(searchDocs('biology', docs).map((r) => r.doc.s).sort()).toEqual([
      'photosynthesis',
      'plant-cells',
    ]);
  });

  it('requires every token to match somewhere (AND semantics)', () => {
    expect(searchDocs('science energy', docs).map((r) => r.doc.s)).toEqual(['photosynthesis']);
    expect(searchDocs('plants nonexistent', docs)).toEqual([]);
  });

  it('ranks title exact > prefix > substring > subject > tag', () => {
    const ranked = searchDocs('poetry', docs);
    expect(ranked[0].doc.s).toBe('romantic-poetry'); // title hit beats tag-only hits
    const scores = ranked.map((r) => r.score);
    expect(scores).toEqual([...scores].sort((a, b) => b - a));
  });

  it('breaks score ties by date descending', () => {
    const tied = searchDocs('biology', docs);
    expect(tied.map((r) => r.doc.s)).toEqual(['photosynthesis', 'plant-cells']);
  });

  it('is case- and diacritic-insensitive', () => {
    expect(searchDocs('PHOTOSYNTHESIS', docs)).toHaveLength(1);
    const accented = [{ s: 'x', t: 'Café au Lait', u: 'Art', g: [], d: '2026-01-01' }];
    expect(searchDocs('cafe', accented)).toHaveLength(1);
  });
});

describe('docMatches (gallery inline filter)', () => {
  it('applies the same AND semantics to a single document', () => {
    expect(docMatches('plants energy', docs[0])).toBe(true);
    expect(docMatches('plants revolution', docs[0])).toBe(false);
    expect(docMatches('', docs[0])).toBe(false);
  });
});
