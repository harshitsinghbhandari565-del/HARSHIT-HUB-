/**
 * slidesUrl — presentation URL derivation (TAD §8.3, ADR-0012).
 */
import { describe, expect, it } from 'vitest';

import { buildBackupUrl, normalizeSlidesUrl } from '../../../src/features/presentations/lib/slidesUrl';

const SLIDES = 'https://docs.google.com/presentation/d/1AbCdefGhIjKlMnOpQrStUvWxYz';

describe('normalizeSlidesUrl', () => {
  it('is idempotent for URLs already in /present mode', () => {
    expect(normalizeSlidesUrl(`${SLIDES}/present`)).toBe(`${SLIDES}/present`);
  });

  it('rewrites /edit and /view URLs to /present', () => {
    expect(normalizeSlidesUrl(`${SLIDES}/edit`)).toBe(`${SLIDES}/present`);
    expect(normalizeSlidesUrl(`${SLIDES}/view`)).toBe(`${SLIDES}/present`);
  });

  it('appends /present when no mode segment exists', () => {
    expect(normalizeSlidesUrl(SLIDES)).toBe(`${SLIDES}/present`);
  });

  it('drops query noise but keeps the document identity', () => {
    expect(normalizeSlidesUrl(`${SLIDES}/edit?usp=sharing`)).toBe(`${SLIDES}/present`);
  });

  it('returns unparseable input unchanged (schema is the real guard)', () => {
    expect(normalizeSlidesUrl('not a url')).toBe('not a url');
  });
});

describe('buildBackupUrl (ADR-0012)', () => {
  const DROPBOX = 'https://www.dropbox.com/s/xyz123/deck.pptx';

  it('defaults to ?dl=0 in-browser preview', () => {
    expect(buildBackupUrl(DROPBOX, false)).toBe(`${DROPBOX}?dl=0`);
  });

  it('opts into ?dl=1 download via forceDownload', () => {
    expect(buildBackupUrl(DROPBOX, true)).toBe(`${DROPBOX}?dl=1`);
  });

  it('replaces an existing dl param and preserves other params', () => {
    expect(buildBackupUrl(`${DROPBOX}?dl=1&raw=1`, false)).toBe(`${DROPBOX}?dl=0&raw=1`);
  });

  it('returns unparseable input unchanged', () => {
    expect(buildBackupUrl('not a url', false)).toBe('not a url');
  });
});
