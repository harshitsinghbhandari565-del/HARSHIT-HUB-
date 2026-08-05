/**
 * search-mount (D-038) — the on-demand mount lifecycle: first open
 * imports + mounts the dialog, aria-expanded tracks state, closing
 * unmounts and returns focus to the trigger.
 */
import { JSDOM } from 'jsdom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { __resetMountForTests, openSearchDialog } from '../../../src/features/search/islands/search-mount';

const INDEX = [
  { s: 'photosynthesis', t: 'Photosynthesis', u: 'Science', g: [], d: '2026-08-01' },
];

let dom: JSDOM;
let trigger: HTMLButtonElement;

async function waitFor(condition: () => boolean, what: string, timeoutMs = 2000) {
  const start = Date.now();
  while (!condition()) {
    if (Date.now() - start > timeoutMs) throw new Error(`waitFor timed out: ${what}`);
    await new Promise((resolve) => setTimeout(resolve, 5));
  }
}

beforeEach(() => {
  dom = new JSDOM(
    `<!doctype html><html><body><main id="m"></main><button data-search-trigger aria-expanded="false">Search</button><footer id="f"></footer></body></html>`,
    { url: 'https://example.test/', pretendToBeVisual: true },
  );
  const g = globalThis as unknown as Record<string, unknown>;
  g.window = dom.window;
  g.document = dom.window.document;
  g.localStorage = dom.window.localStorage;
  trigger = dom.window.document.querySelector('[data-search-trigger]') as HTMLButtonElement;
  vi.stubGlobal(
    'fetch',
    vi.fn(() => Promise.resolve({ ok: true, json: () => Promise.resolve(INDEX) })),
  );
});

afterEach(() => {
  __resetMountForTests(); // module state must not leak between jsdoms
  vi.unstubAllGlobals();
  const g = globalThis as unknown as Record<string, unknown>;
  delete g.window;
  delete g.document;
  delete g.localStorage;
  dom.window.close();
});

describe('openSearchDialog (on-demand mount)', () => {
  it('mounts the dialog on first open and tracks aria-expanded', async () => {
    await openSearchDialog(trigger);
    await waitFor(() => dom.window.document.querySelector('[role="dialog"]') !== null, 'dialog mounted');
    expect(trigger.getAttribute('aria-expanded')).toBe('true');
  });

  it('unmounts on close and returns focus to the trigger', async () => {
    await openSearchDialog(trigger);
    await waitFor(() => dom.window.document.querySelector('[role="dialog"]') !== null, 'dialog mounted');
    const panel = dom.window.document.querySelector('[role="dialog"]') as HTMLElement;
    panel.dispatchEvent(
      new dom.window.KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }),
    );
    await waitFor(() => dom.window.document.querySelector('[role="dialog"]') === null, 'dialog unmounted');
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
    await waitFor(() => dom.window.document.activeElement === trigger, 'focus returned');
  });

  it('reopens after closing', async () => {
    await openSearchDialog(trigger);
    await waitFor(() => dom.window.document.querySelector('[role="dialog"]') !== null, 'first open');
    const panel = dom.window.document.querySelector('[role="dialog"]') as HTMLElement;
    panel.dispatchEvent(
      new dom.window.KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }),
    );
    await waitFor(() => dom.window.document.querySelector('[role="dialog"]') === null, 'closed');
    await openSearchDialog(trigger);
    await waitFor(() => dom.window.document.querySelector('[role="dialog"]') !== null, 'reopened');
  });
});
