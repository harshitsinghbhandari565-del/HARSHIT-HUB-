/**
 * Gallery inline search (TAD §11.3 — two surfaces, one matcher):
 * GalleryController's SearchInput filters the pre-rendered cards,
 * syncs ?q= via replaceState, applies URL params at hydration, and
 * shows the Design §18.3 empty state with a reset action.
 */
import { JSDOM } from 'jsdom';
import { render as preactRender } from 'preact';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import GalleryController from '../../../src/features/presentations/islands/GalleryController';

let dom: JSDOM;
let host: HTMLElement;

function galleryHtml() {
  const rows = [
    { slug: 'alpha', subject: 'Science', date: '2026-08-01T00:00:00.000Z', title: 'Plant Biology Basics', tags: 'biology|plants' },
    { slug: 'beta', subject: 'History', date: '2026-07-24T00:00:00.000Z', title: 'The French Revolution', tags: 'europe|revolution' },
    { slug: 'gamma', subject: 'Science', date: '2026-07-10T00:00:00.000Z', title: 'Energy and Cells', tags: 'biology|energy' },
  ];
  const items = rows
    .map(
      (r) =>
        `<li data-slug="${r.slug}" data-subject="${r.subject}" data-date="${r.date}" data-title="${r.title}" data-tags="${r.tags}">${r.title}</li>`,
    )
    .join('');
  return `<ul data-gallery>${items}</ul>`;
}

function setGlobals() {
  const g = globalThis as unknown as Record<string, unknown>;
  g.window = dom.window;
  g.document = dom.window.document;
  g.localStorage = dom.window.localStorage;
}

function clearGlobals() {
  const g = globalThis as unknown as Record<string, unknown>;
  delete g.window;
  delete g.document;
  delete g.localStorage;
}

async function waitFor(condition: () => boolean, what: string, timeoutMs = 2000) {
  const start = Date.now();
  while (!condition()) {
    if (Date.now() - start > timeoutMs) throw new Error(`waitFor timed out: ${what}`);
    await new Promise((resolve) => setTimeout(resolve, 5));
  }
}

function visibleTitles(): string[] {
  return Array.from(
    dom.window.document.querySelectorAll('ul[data-gallery] > li:not([hidden])'),
  ).map((li) => li.getAttribute('data-title') ?? '');
}

function typeInSearch(text: string) {
  const input = dom.window.document.querySelector('#gallery-search') as HTMLInputElement;
  input.value = text;
  input.dispatchEvent(new dom.window.Event('input', { bubbles: true }));
}

beforeEach(() => {
  dom = new JSDOM(`<!doctype html><html><body><div id="host"></div></body></html>`, {
    url: 'https://example.test/presentations',
    pretendToBeVisual: true,
  });
  setGlobals();
  host = dom.window.document.getElementById('host') as HTMLElement;
});

afterEach(() => {
  preactRender(null, host);
  clearGlobals();
  dom.window.close();
});

describe('Gallery inline search', () => {
  it('renders the search field with a real label', async () => {
    preactRender(
      <GalleryController subjects={['Science', 'History']}>
        <div dangerouslySetInnerHTML={{ __html: galleryHtml() }} />
      </GalleryController>,
      host,
    );
    await waitFor(() => dom.window.document.querySelector('#gallery-search') !== null, 'search rendered');
    const label = dom.window.document.querySelector('label[for="gallery-search"]');
    expect(label?.textContent).toBe('Search presentations');
  });

  it('filters cards by title/subject/tag and syncs ?q= via replaceState', async () => {
    preactRender(
      <GalleryController subjects={['Science', 'History']}>
        <div dangerouslySetInnerHTML={{ __html: galleryHtml() }} />
      </GalleryController>,
      host,
    );
    await waitFor(() => dom.window.document.querySelector('#gallery-search') !== null, 'search rendered');

    typeInSearch('biology');
    await waitFor(() => visibleTitles().length === 2, 'tag filter applied');
    expect(visibleTitles().sort()).toEqual(['Energy and Cells', 'Plant Biology Basics']);
    await waitFor(
      () => dom.window.location.search.includes('q=biology'),
      'q synced to URL',
    );
    expect(dom.window.location.search).toContain('q=biology');

    // Refinement → replaceState, not a navigation (history length unchanged
    // is not observable in jsdom; assert the param shape instead).
    typeInSearch('revolution');
    await waitFor(() => visibleTitles().length === 1, 'second filter applied');
    expect(visibleTitles()).toEqual(['The French Revolution']);
    expect(dom.window.location.search).toContain('q=revolution');
  });

  it('combines the query with the subject filter', async () => {
    preactRender(
      <GalleryController subjects={['Science', 'History']}>
        <div dangerouslySetInnerHTML={{ __html: galleryHtml() }} />
      </GalleryController>,
      host,
    );
    await waitFor(() => dom.window.document.querySelector('#gallery-search') !== null, 'search rendered');

    const historyChip = Array.from(host.querySelectorAll('button')).find(
      (b) => b.textContent === 'History',
    ) as HTMLButtonElement;
    historyChip.click();
    typeInSearch('biology');
    await waitFor(() => dom.window.location.search.includes('q=biology'), 'q synced');
    // 'biology' matches Science cards only; subject filter History excludes them.
    await waitFor(() => visibleTitles().length === 0, 'combined filter yields none');
  });

  it('shows the empty state with a clear action that resets everything', async () => {
    preactRender(
      <GalleryController subjects={['Science', 'History']}>
        <div dangerouslySetInnerHTML={{ __html: galleryHtml() }} />
      </GalleryController>,
      host,
    );
    await waitFor(() => dom.window.document.querySelector('#gallery-search') !== null, 'search rendered');

    typeInSearch('zzzznothing');
    await waitFor(() => visibleTitles().length === 0, 'no matches');
    const noResults = host.querySelector('[class*="noResults"]');
    expect(noResults?.textContent).toContain('No presentations found');

    const clear = Array.from(host.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('Clear your search'),
    ) as HTMLButtonElement;
    clear.click();
    await waitFor(() => visibleTitles().length === 3, 'cleared restores all');
    await waitFor(() => !dom.window.location.search.includes('q='), 'q removed from URL');
  });

  it('applies ?q= present in the URL at hydration', async () => {
    dom.window.close();
    dom = new JSDOM(`<!doctype html><html><body><div id="host"></div></body></html>`, {
      url: 'https://example.test/presentations?q=revolution',
      pretendToBeVisual: true,
    });
    setGlobals();
    host = dom.window.document.getElementById('host') as HTMLElement;

    preactRender(
      <GalleryController subjects={['Science', 'History']}>
        <div dangerouslySetInnerHTML={{ __html: galleryHtml() }} />
      </GalleryController>,
      host,
    );
    await waitFor(() => visibleTitles().length === 1, 'URL query applied');
    expect(visibleTitles()).toEqual(['The French Revolution']);
    expect((dom.window.document.querySelector('#gallery-search') as HTMLInputElement).value).toBe(
      'revolution',
    );
  });
});
