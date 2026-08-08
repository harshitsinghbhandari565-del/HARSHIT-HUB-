/**
 * RecentRail island (T-E2) — Design §13.2 dual strategy in jsdom:
 * fallback untouched without recency, reorder + heading swap with
 * recency, stale-slug filtering, and quick-launch recency recording.
 */
import { JSDOM } from 'jsdom';
import { render as preactRender } from 'preact';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import RecentRail from '../../../src/features/presentations/islands/RecentRail';
import { RECENCY_STORAGE_KEY, readRecency } from '../../../src/features/presentations/lib/recency';

let dom: JSDOM;
let host: HTMLElement;

function railHtml() {
  const cards = [
    { slug: 'alpha', title: 'Alpha Talk' },
    { slug: 'beta', title: 'Beta Talk' },
    { slug: 'gamma', title: 'Gamma Talk' },
  ];
  const items = cards
    .map(
      (c) =>
        `<li data-slug="${c.slug}"><article class="card"><a class="card__link" href="/presentations/${c.slug}">${c.title}</a><a class="card__quick-launch" data-quick-launch data-slug="${c.slug}" href="https://docs.google.com/presentation/d/${c.slug}/present">Present</a></article></li>`,
    )
    .join('');
  return `<section><h2 data-rail-heading>Latest Presentations</h2><ul data-rail>${items}</ul></section>`;
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

function orderedSlugs(): string[] {
  return Array.from(
    dom.window.document.querySelectorAll('ul[data-rail] > li'),
  ).map((li) => li.getAttribute('data-slug') ?? '');
}

beforeEach(() => {
  dom = new JSDOM(`<!doctype html><html><body><div id="host"></div></body></html>`, {
    url: 'https://example.test/',
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

describe('RecentRail island', () => {
  it('leaves the server-rendered "Latest" state untouched without recency', async () => {
    preactRender(
      <RecentRail>
        <div dangerouslySetInnerHTML={{ __html: railHtml() }} />
      </RecentRail>,
      host,
    );
    await waitFor(() => orderedSlugs().length === 3, 'rail mounted');
    // Give any (incorrect) reorder a chance to happen before asserting.
    await new Promise((resolve) => setTimeout(resolve, 30));
    expect(orderedSlugs()).toEqual(['alpha', 'beta', 'gamma']);
    expect(
      dom.window.document.querySelector('[data-rail-heading]')?.textContent,
    ).toBe('Latest Presentations');
    expect(host.querySelector('[data-recent-rail]')?.hasAttribute('data-is-recent')).toBe(false);
  });

  it('reorders by personal recency and swaps the heading', async () => {
    dom.window.localStorage.setItem(
      RECENCY_STORAGE_KEY,
      JSON.stringify([
        { slug: 'gamma', at: 2 },
        { slug: 'alpha', at: 1 },
      ]),
    );
    preactRender(
      <RecentRail>
        <div dangerouslySetInnerHTML={{ __html: railHtml() }} />
      </RecentRail>,
      host,
    );
    await waitFor(
      () =>
        dom.window.document.querySelector('[data-rail-heading]')?.textContent ===
        'Recent Presentations',
      'heading swap',
    );
    // Recency order first, remaining card keeps its place behind.
    expect(orderedSlugs()).toEqual(['gamma', 'alpha', 'beta']);
    expect(host.querySelector('[data-recent-rail]')?.getAttribute('data-is-recent')).toBe('true');
  });

  it('filters out stale slugs that no longer exist', async () => {
    dom.window.localStorage.setItem(
      RECENCY_STORAGE_KEY,
      JSON.stringify([
        { slug: 'deleted-deck', at: 5 },
        { slug: 'beta', at: 4 },
      ]),
    );
    preactRender(
      <RecentRail>
        <div dangerouslySetInnerHTML={{ __html: railHtml() }} />
      </RecentRail>,
      host,
    );
    await waitFor(
      () =>
        dom.window.document.querySelector('[data-rail-heading]')?.textContent ===
        'Recent Presentations',
      'heading swap',
    );
    expect(orderedSlugs()).toEqual(['beta', 'alpha', 'gamma']);
  });

  it('records a launch when a quick-launch anchor is clicked', async () => {
    preactRender(
      <RecentRail>
        <div dangerouslySetInnerHTML={{ __html: railHtml() }} />
      </RecentRail>,
      host,
    );
    await waitFor(() => orderedSlugs().length === 3, 'rail mounted');
    // The island marks itself once the mount effect (and the launch
    // listener) is attached — wait for that, not for arbitrary time.
    await waitFor(
      () => host.querySelector('[data-rail-mounted]') !== null,
      'island mounted',
    );
    const quick = dom.window.document.querySelector(
      'a[data-quick-launch][data-slug="beta"]',
    ) as HTMLAnchorElement;
    quick.click();
    await new Promise((resolve) => setTimeout(resolve, 20));
    expect(readRecency(dom.window.localStorage).map((e) => e.slug)).toEqual(['beta']);
  });

  it('ignores corrupt recency data and keeps the fallback', async () => {
    dom.window.localStorage.setItem(RECENCY_STORAGE_KEY, '{corrupt');
    preactRender(
      <RecentRail>
        <div dangerouslySetInnerHTML={{ __html: railHtml() }} />
      </RecentRail>,
      host,
    );
    await waitFor(() => orderedSlugs().length === 3, 'rail mounted');
    await new Promise((resolve) => setTimeout(resolve, 30));
    expect(orderedSlugs()).toEqual(['alpha', 'beta', 'gamma']);
    expect(
      dom.window.document.querySelector('[data-rail-heading]')?.textContent,
    ).toBe('Latest Presentations');
  });
});
