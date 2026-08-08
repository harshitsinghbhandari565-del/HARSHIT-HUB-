/**
 * Phase D routes — page logic tests (T-D3/T-D5). The content boundary
 * (astro:content) is mocked so the tests verify page logic — the
 * published-only filter, default ordering, island data contract, and
 * launch URLs — independently of the content loader (which runs at build
 * time and is exercised by `astro build` + the schema contract tests).
 */
import { describe, expect, it, vi } from 'vitest';

import GalleryPage from '../../../src/pages/presentations/index.astro';
import DetailPage from '../../../src/pages/presentations/[slug].astro';
import { parse, render } from '../helpers/render';

const fixtures = vi.hoisted(() => [
  {
    id: 'photosynthesis',
    data: {
      title: 'Photosynthesis: How Plants Make Food',
      subject: 'Science',
      date: new Date('2026-08-01'),
      tags: ['biology', 'plants'],
      googleSlidesUrl: 'https://docs.google.com/presentation/d/x/present',
      dropboxUrl: 'https://www.dropbox.com/s/x/y',
      forceDownload: false,
      description: 'An overview.',
      published: true,
      linkHealth: { slides: 'ok', dropbox: 'ok' },
    },
  },
  {
    id: 'french-revolution',
    data: {
      title: 'The French Revolution: Causes and Consequences',
      subject: 'History',
      date: new Date('2026-07-24'),
      tags: ['revolution', 'europe'],
      googleSlidesUrl: 'https://docs.google.com/presentation/d/y/present',
      dropboxUrl: 'https://www.dropbox.com/s/y/z',
      forceDownload: false,
      description: 'Why 1789 happened.',
      published: true,
      linkHealth: { slides: 'ok', dropbox: 'ok' },
    },
  },
  {
    id: 'draft-deck',
    data: {
      title: 'Unfinished Draft',
      subject: 'Science',
      date: new Date('2026-08-03'),
      tags: [],
      googleSlidesUrl: 'https://docs.google.com/presentation/d/z/present',
      forceDownload: false,
      published: false, // must never reach the gallery or static paths
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

describe('Gallery page (T-D3)', () => {
  it('renders every published presentation — and never unpublished ones', async () => {
    const root = parse(await render(GalleryPage));
    const items = Array.from(root.querySelectorAll('ul[data-gallery] > li'));
    expect(items).toHaveLength(2);
    const titles = items.map((li) => li.getAttribute('data-title'));
    expect(titles).toContain('Photosynthesis: How Plants Make Food');
    expect(titles).toContain('The French Revolution: Causes and Consequences');
    expect(root.textContent).not.toContain('Unfinished Draft');
  });

  it('renders in Most-Recent order by default', async () => {
    const root = parse(await render(GalleryPage));
    const dates = Array.from(root.querySelectorAll('ul[data-gallery] > li')).map(
      (li) => li.getAttribute('data-date') ?? '',
    );
    expect(dates).toEqual([...dates].sort((a, b) => b.localeCompare(a)));
    expect(root.querySelectorAll('ul[data-gallery] > li')[0].getAttribute('data-title')).toBe(
      'Photosynthesis: How Plants Make Food',
    );
  });

  it('exposes the data contract the GalleryController island relies on', async () => {
    const root = parse(await render(GalleryPage));
    const first = root.querySelector('ul[data-gallery] > li');
    expect(first?.getAttribute('data-subject')).toBeTruthy();
    expect(first?.getAttribute('data-date')).toBeTruthy();
    expect(first?.getAttribute('data-title')).toBeTruthy();
  });

  it('renders chips for the subjects present and the four sort options', async () => {
    const root = parse(await render(GalleryPage));
    expect(root.textContent).toContain('All');
    expect(root.textContent).toContain('Science');
    expect(root.textContent).toContain('History');
    expect(root.textContent).not.toContain('English'); // no English fixture published
    const options = Array.from(root.querySelectorAll('#gallery-sort option')).map((o) =>
      o.textContent?.trim(),
    );
    expect(options).toEqual(['Most Recent', 'Oldest First', 'Subject A–Z', 'Subject Z–A']);
  });

  it('shows the published presentation count', async () => {
    const root = parse(await render(GalleryPage));
    expect(root.querySelector('.gallery__count')?.textContent?.trim()).toBe('2 presentations');
  });

  it('links every card to its detail route', async () => {
    const root = parse(await render(GalleryPage));
    const hrefs = Array.from(root.querySelectorAll('.card__link'))
      .map((a) => a.getAttribute('href'))
      .sort();
    expect(hrefs).toEqual([
      '/presentations/french-revolution',
      '/presentations/photosynthesis',
    ]);
  });
});

describe('Detail page (T-D5)', () => {
  const props = { presentation: fixtures[0] };

  it('renders the full title in an H1 without truncation', async () => {
    const root = parse(await render(DetailPage, { props }));
    expect(root.querySelector('h1')?.textContent?.trim()).toBe(
      'Photosynthesis: How Plants Make Food',
    );
  });

  it('renders breadcrumb, back link, detail meta, all tags, and the sign-in hint', async () => {
    const root = parse(await render(DetailPage, { props }));
    expect(root.querySelector('nav[aria-label="Breadcrumb"]')).not.toBeNull();
    expect(root.textContent).toContain('Back to Presentations');
    expect(root.querySelector('.meta--detail')).not.toBeNull();
    expect(root.querySelectorAll('.tag-row li')).toHaveLength(2); // detail shows all
    expect(root.textContent).toContain('Anyone with the link can view');
  });

  it('builds the launch URLs: normalized /present and ?dl=0 backup', async () => {
    const root = parse(await render(DetailPage, { props }));
    const present = root.querySelector('a[href*="docs.google.com"]');
    expect(present?.getAttribute('href')).toBe(
      'https://docs.google.com/presentation/d/x/present',
    );
    const backup = root.querySelector('a[href*="dropbox.com"]');
    expect(backup?.getAttribute('href')).toBe('https://www.dropbox.com/s/x/y?dl=0');
  });

  it('describes the page from the description or a generated fallback', async () => {
    const html = await render(DetailPage, { props });
    expect(html).toContain('An overview.');
  });
});
