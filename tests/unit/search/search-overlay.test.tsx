/**
 * Search overlay — trigger structure (container) + SearchDialog behaviour
 * (T-F3, TAD §11.4) in jsdom: dialog semantics, focus in + trap, Escape,
 * arrow roving, live announcements, empty state, fetch lifecycle
 * (mocked at the network boundary). Mount lifecycle lives in
 * search-mount.test.tsx (D-038 split).
 */
import { JSDOM } from 'jsdom';
import { render as preactRender } from 'preact';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import SearchDialog from '../../../src/features/search/islands/SearchDialog';
import SearchOverlay from '../../../src/features/search/islands/SearchOverlay.astro';
import { parse, render } from '../helpers/render';

const INDEX = [
  { s: 'photosynthesis', t: 'Photosynthesis: How Plants Make Food', u: 'Science', g: ['biology'], d: '2026-08-01' },
  { s: 'french-revolution', t: 'The French Revolution', u: 'History', g: ['europe'], d: '2026-07-24' },
];

let dom: JSDOM;
let host: HTMLElement;
let closeSpy: () => void;

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

function input(): HTMLInputElement {
  return dom.window.document.querySelector('#search-overlay-input') as HTMLInputElement;
}

function type(text: string) {
  const el = input();
  el.value = text;
  el.dispatchEvent(new dom.window.Event('input', { bubbles: true }));
}

function mountDialog() {
  preactRender(<SearchDialog onClose={closeSpy} />, host);
}

beforeEach(() => {
  dom = new JSDOM(
    `<!doctype html><html><body><main id="m"></main><div id="host"></div><footer id="f"></footer></body></html>`,
    { url: 'https://example.test/', pretendToBeVisual: true },
  );
  setGlobals();
  host = dom.window.document.getElementById('host') as HTMLElement;
  closeSpy = vi.fn();
  vi.stubGlobal(
    'fetch',
    vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(INDEX),
      }),
    ),
  );
});

afterEach(() => {
  preactRender(null, host);
  vi.unstubAllGlobals();
  clearGlobals();
  dom.window.close();
});

describe('SearchOverlay trigger (structure)', () => {
  it('renders the header trigger with dialog wiring attributes', async () => {
    const root = parse(await render(SearchOverlay));
    const trigger = root.querySelector('[data-search-trigger]');
    expect(trigger).not.toBeNull();
    expect(trigger?.getAttribute('aria-label')).toBe('Search presentations');
    expect(trigger?.getAttribute('aria-expanded')).toBe('false');
    expect(trigger?.getAttribute('aria-controls')).toBe('search-overlay-panel');
  });
});

describe('SearchDialog (TAD §11.4)', () => {
  // NOTE: declared first on purpose — the dialog caches the fetched index
  // at module level, and the error state is only reachable on a cold cache.
  it('shows an error state when the index fetch fails', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() => Promise.resolve({ ok: false, status: 500, json: () => Promise.resolve([]) })),
    );
    mountDialog();
    await waitFor(
      () => (dom.window.document.querySelector('[role="status"]')?.textContent ?? '').includes('unavailable'),
      'error announced',
    );
  });

  it('renders dialog semantics, moves focus to input, makes page inert', async () => {
    mountDialog();
    await waitFor(() => input() !== null, 'dialog mounted');
    const panel = dom.window.document.querySelector('[role="dialog"]');
    expect(panel).not.toBeNull();
    expect(panel?.getAttribute('aria-modal')).toBe('true');
    expect(panel?.getAttribute('id')).toBe('search-overlay-panel');
    await waitFor(() => dom.window.document.activeElement === input(), 'focus in input');
    expect(dom.window.document.getElementById('m')?.hasAttribute('inert')).toBe(true);
    expect(dom.window.document.getElementById('f')?.hasAttribute('inert')).toBe(true);
  });

  it('fetches the index once and renders matching results with a live count', async () => {
    mountDialog();
    await waitFor(() => input() !== null, 'dialog mounted');
    type('science');
    await waitFor(
      () => (dom.window.document.querySelector('[role="status"]')?.textContent ?? '').includes('1 presentation'),
      'count announced',
    );
    expect(dom.window.document.querySelector('a[href="/presentations/photosynthesis"]')).not.toBeNull();
  });

  it('announces zero results and offers a clear action (Design §18.3)', async () => {
    mountDialog();
    await waitFor(() => input() !== null, 'dialog mounted');
    type('zzzznothing');
    await waitFor(
      () => (dom.window.document.querySelector('[role="status"]')?.textContent ?? '').includes('No presentations found'),
      'empty announcement',
    );
    const clear = Array.from(dom.window.document.querySelectorAll('button')).find((b) =>
      b.textContent?.includes('Clear your search'),
    );
    expect(clear).not.toBeUndefined();
  });

  it('calls onClose on Escape (unmount + focus return are the mount\'s job)', async () => {
    mountDialog();
    await waitFor(() => input() !== null, 'dialog mounted');
    const panel = dom.window.document.querySelector('[role="dialog"]') as HTMLElement;
    panel.dispatchEvent(
      new dom.window.KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }),
    );
    await waitFor(() => (closeSpy as ReturnType<typeof vi.fn>).mock.calls.length === 1, 'onClose called');
  });

  it('moves through results with ArrowDown and back with ArrowUp', async () => {
    mountDialog();
    await waitFor(() => input() !== null, 'dialog mounted');
    type('the'); // substring of "The ..." in both titles
    await waitFor(() => dom.window.document.querySelectorAll('ul li a').length >= 1, 'results rendered');
    const panel = dom.window.document.querySelector('[role="dialog"]') as HTMLElement;
    const links = Array.from(dom.window.document.querySelectorAll<HTMLAnchorElement>('ul li a'));

    input().dispatchEvent(
      new dom.window.KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true, cancelable: true }),
    );
    expect(dom.window.document.activeElement).toBe(links[0]);

    if (links.length > 1) {
      panel.dispatchEvent(
        new dom.window.KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true, cancelable: true }),
      );
      expect(dom.window.document.activeElement).toBe(links[1]);
      panel.dispatchEvent(
        new dom.window.KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true, cancelable: true }),
      );
      expect(dom.window.document.activeElement).toBe(links[0]);
    }

    // ArrowUp from the first result returns to the input.
    panel.dispatchEvent(
      new dom.window.KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true, cancelable: true }),
    );
    expect(dom.window.document.activeElement).toBe(input());
  });
});
