/**
 * Gallery sorting — Design §14.2 option set (authoritative; supersedes
 * the older Dev Plan §9.2 wording — Phase 1 report X-2).
 */
import { describe, expect, it } from 'vitest';

import {
  DEFAULT_SORT,
  isSortOption,
  SORT_OPTIONS,
  sortPresentations,
} from '../../../src/features/presentations/lib/sorting';

const items = [
  { title: 'Alpha', subject: 'History', dateMs: 200 },
  { title: 'Beta', subject: 'Science', dateMs: 300 },
  { title: 'Gamma', subject: 'Science', dateMs: 100 },
  { title: 'Delta', subject: 'English', dateMs: 400 },
];

describe('SORT_OPTIONS', () => {
  it('matches the Design §14.2 four options in order', () => {
    expect(SORT_OPTIONS.map((o) => o.value)).toEqual([
      'date-desc',
      'date-asc',
      'subject-asc',
      'subject-desc',
    ]);
    expect(SORT_OPTIONS.map((o) => o.label)).toEqual([
      'Most Recent',
      'Oldest First',
      'Subject A–Z',
      'Subject Z–A',
    ]);
    expect(DEFAULT_SORT).toBe('date-desc');
  });
});

describe('isSortOption', () => {
  it('accepts only known options', () => {
    expect(isSortOption('date-desc')).toBe(true);
    expect(isSortOption('bogus')).toBe(false);
    expect(isSortOption(null)).toBe(false);
  });
});

describe('sortPresentations', () => {
  it('sorts newest first by default', () => {
    expect(sortPresentations(items, 'date-desc').map((i) => i.title)).toEqual([
      'Delta',
      'Beta',
      'Alpha',
      'Gamma',
    ]);
  });

  it('sorts oldest first', () => {
    expect(sortPresentations(items, 'date-asc').map((i) => i.title)).toEqual([
      'Gamma',
      'Alpha',
      'Beta',
      'Delta',
    ]);
  });

  it('sorts subjects A–Z with title tie-break', () => {
    expect(sortPresentations(items, 'subject-asc').map((i) => i.title)).toEqual([
      'Delta',
      'Alpha',
      'Beta',
      'Gamma',
    ]);
  });

  it('sorts subjects Z–A with title tie-break', () => {
    expect(sortPresentations(items, 'subject-desc').map((i) => i.title)).toEqual([
      'Beta',
      'Gamma',
      'Alpha',
      'Delta',
    ]);
  });

  it('does not mutate the input array', () => {
    const original = [...items];
    sortPresentations(items, 'date-asc');
    expect(items).toEqual(original);
  });
});
