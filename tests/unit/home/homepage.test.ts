/**
 * Phase E homepage — assembles prior systems (TD-1 shell replaced).
 * Content boundary mocked (D-028): verifies hero, rail composition over
 * the gallery engine, teasers, and the entrance-mode guard script.
 */
import { describe, expect, it, vi } from 'vitest';

import HomePage from '../../../src/pages/index.astro';
import { parse, render } from '../helpers/render';

const fixtures = vi.hoisted(() => [
  {
    id: 'photosynthesis',
    data: {
      title: 'Photosynthesis: How Plants Make Food',
      subject: 'Science',
      date: new Date('2026-08-01'),
      tags: ['biology'],
      googleSlidesUrl: 'https://docs.google.com/presentation/d/x/present',
      dropboxUrl: 'https://www.dropbox.com/s/x/y',
      forceDownload: false,
      published: true,
      linkHealth: { slides: 'ok', dropbox: 'ok' },
    },
  },
  {
    id: 'french-revolution',
    data: {
      title: 'The French Revolution',
      subject: 'History',
      date: new Date('2026-07-24'),
      tags: ['history'],
      googleSlidesUrl: 'https://docs.google.com/presentation/d/y/present',
      forceDownload: false,
      published: true,
      linkHealth: { slides: 'ok', dropbox: 'absent' },
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

describe('Homepage (Phase E)', () => {
  it('renders the hero: overline, brand name with accent dot, tagline, CTAs', async () => {
    const root = parse(await render(HomePage));
    expect(root.textContent).toContain('Academic Portfolio');
    const name = root.querySelector('.hero__name');
    expect(name?.textContent).toContain('Harshit');
    expect(name?.querySelector('.hero__name-dot')?.textContent).toBe('.');
    expect(root.querySelector('.hero__tagline')).not.toBeNull();
    const viewAll = Array.from(root.querySelectorAll('.hero__ctas a')).find((a) =>
      a.textContent?.includes('View Presentations'),
    );
    expect(viewAll?.getAttribute('href')).toBe('/presentations');
    const about = Array.from(root.querySelectorAll('.hero__ctas a')).find((a) =>
      a.textContent?.includes('About Me'),
    );
    expect(about?.getAttribute('href')).toBe('/about');
  });

  it('renders the rail with the top-3 published decks, newest first, with quick-launch', async () => {
    const root = parse(await render(HomePage));
    const items = Array.from(root.querySelectorAll('ul[data-rail] > li'));
    expect(items).toHaveLength(2); // 2 published fixtures
    expect(items[0].getAttribute('data-slug')).toBe('photosynthesis');
    expect(items[0].querySelector('[data-quick-launch]')).not.toBeNull();
    expect(root.textContent).not.toContain('Unfinished Draft');
    // Rail heading defaults to "Latest Presentations" (server-rendered).
    expect(root.querySelector('[data-rail-heading]')?.textContent?.trim()).toBe(
      'Latest Presentations',
    );
  });

  it('quick-launch anchors go straight to the /present URL', async () => {
    const root = parse(await render(HomePage));
    const quick = root.querySelector('a[data-quick-launch]');
    expect(quick?.getAttribute('href')).toBe(
      'https://docs.google.com/presentation/d/x/present',
    );
    expect(quick?.getAttribute('rel')).toBe('noopener noreferrer');
  });

  it('renders About and Contact teasers linking to their pages', async () => {
    const root = parse(await render(HomePage));
    expect(root.querySelector('.about-teaser')).not.toBeNull();
    expect(root.querySelector('.contact-teaser')).not.toBeNull();
    const readMore = Array.from(root.querySelectorAll('a')).find((a) =>
      a.textContent?.includes('Read More'),
    );
    expect(readMore?.getAttribute('href')).toBe('/about');
    const getInTouch = Array.from(root.querySelectorAll('a')).find((a) =>
      a.textContent?.includes('Get in Touch'),
    );
    expect(getInTouch?.getAttribute('href')).toBe('/contact');
  });

  it('no longer renders the initialization placeholder shell', async () => {
    const html = await render(HomePage);
    expect(html).not.toContain('Foundation initialized');
  });

  it('ships the entrance-mode guard script (Design §23.4)', async () => {
    const html = await render(HomePage);
    expect(html).toContain('lastHomeVisit');
    expect(html).toContain("dataset.entrance");
  });
});
