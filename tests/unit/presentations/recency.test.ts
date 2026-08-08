/**
 * recency — personal recency logic (FR-3, Design §13.2): storage
 * discipline, dedupe/cap, stale-slug resolution for the rail.
 */
import { describe, expect, it } from 'vitest';

import {
  readRecency,
  RECENCY_MAX,
  RECENCY_STORAGE_KEY,
  resolveRecentSlugs,
  writeRecency,
} from '../../../src/features/presentations/lib/recency';

function makeStorage(initial: Record<string, string> = {}): Storage {
  const map = new Map(Object.entries(initial));
  return {
    getItem: (k) => (map.has(k) ? (map.get(k) as string) : null),
    setItem: (k, v) => void map.set(k, String(v)),
    removeItem: (k) => void map.delete(k),
    clear: () => map.clear(),
    key: (i) => Array.from(map.keys())[i] ?? null,
    get length() {
      return map.size;
    },
  };
}

describe('readRecency', () => {
  it('returns [] for missing or blocked storage', () => {
    expect(readRecency(makeStorage())).toEqual([]);
    expect(readRecency(undefined)).toEqual([]);
    const throwing = {
      ...makeStorage(),
      getItem: () => {
        throw new Error('blocked');
      },
    } as Storage;
    expect(readRecency(throwing)).toEqual([]);
  });

  it('discards malformed JSON and foreign shapes', () => {
    expect(readRecency(makeStorage({ [RECENCY_STORAGE_KEY]: 'not json' }))).toEqual([]);
    expect(readRecency(makeStorage({ [RECENCY_STORAGE_KEY]: '{"a":1}' }))).toEqual([]);
    expect(
      readRecency(makeStorage({ [RECENCY_STORAGE_KEY]: '[{"slug":123},{"at":5},"x"]' })),
    ).toEqual([]);
  });

  it('keeps only valid entries', () => {
    const storage = makeStorage({
      [RECENCY_STORAGE_KEY]: '[{"slug":"a","at":1},{"bogus":true},{"slug":"b","at":2}]',
    });
    expect(readRecency(storage)).toEqual([
      { slug: 'a', at: 1 },
      { slug: 'b', at: 2 },
    ]);
  });
});

describe('writeRecency', () => {
  it('records newest-first and persists under the contract key', () => {
    const storage = makeStorage();
    writeRecency('one', 100, storage);
    writeRecency('two', 200, storage);
    expect(readRecency(storage)).toEqual([
      { slug: 'two', at: 200 },
      { slug: 'one', at: 100 },
    ]);
  });

  it('deduplicates by slug, moving the re-launch to the front', () => {
    const storage = makeStorage();
    writeRecency('one', 100, storage);
    writeRecency('two', 200, storage);
    writeRecency('one', 300, storage);
    expect(readRecency(storage).map((e) => e.slug)).toEqual(['one', 'two']);
  });

  it('caps the list at RECENCY_MAX entries', () => {
    const storage = makeStorage();
    for (let i = 0; i < RECENCY_MAX + 3; i += 1) writeRecency(`slug-${i}`, i, storage);
    const entries = readRecency(storage);
    expect(entries).toHaveLength(RECENCY_MAX);
    expect(entries[0].slug).toBe(`slug-${RECENCY_MAX + 2}`);
  });

  it('survives blocked storage silently', () => {
    const throwing = {
      ...makeStorage(),
      setItem: () => {
        throw new Error('blocked');
      },
    } as Storage;
    expect(() => writeRecency('x', 1, throwing)).not.toThrow();
  });
});

describe('resolveRecentSlugs (Design §13.2)', () => {
  const existing = ['alpha', 'beta', 'gamma'];

  it('keeps only slugs that still exist, newest first, max 3', () => {
    const recency = [
      { slug: 'gamma', at: 3 },
      { slug: 'gone', at: 2 },
      { slug: 'alpha', at: 1 },
    ];
    expect(resolveRecentSlugs(recency, existing)).toEqual(['gamma', 'alpha']);
  });

  it('returns [] when nothing matches (rail keeps the Latest fallback)', () => {
    expect(resolveRecentSlugs([{ slug: 'gone', at: 1 }], existing)).toEqual([]);
    expect(resolveRecentSlugs([], existing)).toEqual([]);
  });

  it('respects the max parameter', () => {
    const recency = [
      { slug: 'alpha', at: 3 },
      { slug: 'beta', at: 2 },
      { slug: 'gamma', at: 1 },
    ];
    expect(resolveRecentSlugs(recency, existing, 2)).toEqual(['alpha', 'beta']);
  });
});
