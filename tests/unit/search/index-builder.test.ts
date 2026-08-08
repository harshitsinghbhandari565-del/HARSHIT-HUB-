/**
 * Search index construction (T-F1): shortened-key document shape.
 */
import { describe, expect, it } from 'vitest';

import { buildSearchIndex } from '../../../src/features/search/lib/index-builder';

describe('buildSearchIndex', () => {
  it('maps entries to the shortened-key shape (TAD §11.2)', () => {
    const index = buildSearchIndex([
      {
        slug: 'alpha',
        title: 'Alpha Talk',
        subject: 'Science',
        tags: ['one', 'two'],
        date: new Date('2026-08-01T00:00:00.000Z'),
      },
    ]);
    expect(index).toEqual([
      { s: 'alpha', t: 'Alpha Talk', u: 'Science', g: ['one', 'two'], d: '2026-08-01' },
    ]);
  });

  it('handles empty catalogs', () => {
    expect(buildSearchIndex([])).toEqual([]);
  });
});
