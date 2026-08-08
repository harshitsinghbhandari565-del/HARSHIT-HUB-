/**
 * Content contract tests — Dev Plan Gate 1: the Zod schema must reject
 * malformed entries at build time (TAD G2 / invariant I5).
 *
 * The schema is exercised directly (pure Zod), so these tests run without
 * Astro internals.
 */
import { describe, expect, it } from 'vitest';

import { presentationSchema } from '../../src/content/schemas';

const valid = {
  title: 'Photosynthesis: How Plants Make Food',
  subject: 'Science',
  date: '2026-08-02',
  tags: ['biology', 'plants', 'energy'],
  googleSlidesUrl: 'https://docs.google.com/presentation/d/1AbCdefGhIjKlMnOpQrStUvWxYz/present',
  dropboxUrl: 'https://www.dropbox.com/s/xyz123/photosynthesis.pptx',
  published: true,
  order: 1,
  description: 'An overview of the photosynthesis process.',
};

describe('presentationSchema', () => {
  it('accepts a valid presentation and applies operational defaults', () => {
    const parsed = presentationSchema.parse(valid);
    expect(parsed.tags).toHaveLength(3);
    expect(parsed.forceDownload).toBe(false);
    expect(parsed.linkHealth).toEqual({ slides: 'unknown', dropbox: 'unknown' });
    expect(parsed.date).toBeInstanceOf(Date);
  });

  it('accepts a minimal entry (backup optional, tags default empty)', () => {
    const parsed = presentationSchema.parse({
      title: 'Minimal',
      subject: 'Math',
      date: '2026-01-01',
      googleSlidesUrl: 'https://docs.google.com/presentation/d/abc-123/present',
      published: false,
    });
    expect(parsed.tags).toEqual([]);
    expect(parsed.dropboxUrl).toBeUndefined();
  });

  // Gate 1: the schema rejects malformed dates such as "2026-13-45".
  it('rejects an invalid date', () => {
    expect(() => presentationSchema.parse({ ...valid, date: '2026-13-45' })).toThrow();
  });

  it('rejects a non-Google-Slides URL', () => {
    expect(() =>
      presentationSchema.parse({ ...valid, googleSlidesUrl: 'https://example.com/deck/present' }),
    ).toThrow();
  });

  it('rejects a Slides URL without the /present suffix', () => {
    expect(() =>
      presentationSchema.parse({
        ...valid,
        googleSlidesUrl: 'https://docs.google.com/presentation/d/1AbCdefGhIjKlMnOpQrStUvWxYz/edit',
      }),
    ).toThrow();
  });

  it('rejects a non-Dropbox backup URL', () => {
    expect(() =>
      presentationSchema.parse({ ...valid, dropboxUrl: 'https://example.com/backup' }),
    ).toThrow();
  });

  it('requires an explicit published flag', () => {
    const { published: _published, ...rest } = valid;
    expect(() => presentationSchema.parse(rest)).toThrow();
  });

  it('rejects an unmapped subject (enum guard, TAD §8.2)', () => {
    expect(() => presentationSchema.parse({ ...valid, subject: 'Sciene' })).toThrow();
  });

  it('bounds tags at 12 items of at most 30 characters', () => {
    expect(() =>
      presentationSchema.parse({ ...valid, tags: Array.from({ length: 13 }, (_, i) => `t${i}`) }),
    ).toThrow();
    expect(() => presentationSchema.parse({ ...valid, tags: ['x'.repeat(31)] })).toThrow();
  });

  it('bounds the title at 120 characters', () => {
    expect(() => presentationSchema.parse({ ...valid, title: 'x'.repeat(121) })).toThrow();
  });
});
