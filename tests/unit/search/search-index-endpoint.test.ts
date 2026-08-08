/**
 * search-index.json endpoint (T-F1): static JSON of published-only
 * entries; content boundary mocked (D-028 pattern).
 */
import { describe, expect, it, vi } from 'vitest';

import { GET } from '../../../src/pages/search-index.json';

const fixtures = vi.hoisted(() => [
  {
    id: 'alpha',
    data: {
      title: 'Alpha Talk',
      subject: 'Science',
      date: new Date('2026-08-01T00:00:00.000Z'),
      tags: ['one'],
      googleSlidesUrl: 'https://docs.google.com/presentation/d/a/present',
      description: 'Body text that must NOT reach the index',
      forceDownload: false,
      published: true,
      linkHealth: { slides: 'ok', dropbox: 'absent' },
    },
  },
  {
    id: 'hidden-draft',
    data: {
      title: 'Hidden Draft',
      subject: 'History',
      date: new Date('2026-08-02T00:00:00.000Z'),
      tags: [],
      googleSlidesUrl: 'https://docs.google.com/presentation/d/b/present',
      forceDownload: false,
      published: false,
      linkHealth: { slides: 'unknown', dropbox: 'absent' },
    },
  },
]);

vi.mock('astro:content', () => ({
  getCollection: async (
    _name: string,
    filter?: (entry: { data: Record<string, unknown> }) => boolean,
  ) => (filter ? fixtures.filter((e) => filter({ data: e.data as never })) : fixtures),
}));

describe('GET /search-index.json', () => {
  it('returns JSON containing only published entries, without descriptions', async () => {
    const response = await GET();
    expect(response.headers.get('content-type')).toContain('application/json');
    const body = (await response.json()) as Array<Record<string, unknown>>;
    expect(body).toHaveLength(1);
    expect(body[0]).toEqual({ s: 'alpha', t: 'Alpha Talk', u: 'Science', g: ['one'], d: '2026-08-01' });
    expect(JSON.stringify(body)).not.toContain('must NOT reach the index');
    expect(JSON.stringify(body)).not.toContain('Hidden Draft');
  });
});
