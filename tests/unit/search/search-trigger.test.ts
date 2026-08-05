/**
 * Search trigger wiring (D-044) — document-level delegation keeps search
 * working across ClientRouter body swaps, and the first click still routes
 * through search-mount's on-demand dynamic import (D-038, mocked here at
 * the module boundary).
 */
import { JSDOM } from 'jsdom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { initSearchTrigger } from '../../../src/features/search/lib/search-trigger';
import { openSearchDialog } from '../../../src/features/search/islands/search-mount';

vi.mock('../../../src/features/search/islands/search-mount', () => ({
  openSearchDialog: vi.fn(async () => {}),
  isDialogMounted: vi.fn(() => false),
  __resetMountForTests: vi.fn(),
}));

let dom: JSDOM;

const TRIGGER_HTML =
  '<button type="button" data-search-trigger aria-expanded="false">Search</button>';

beforeEach(() => {
  dom = new JSDOM(`<!doctype html><html><body>${TRIGGER_HTML}</body></html>`, {
    url: 'https://example.test/',
  });
  const g = globalThis as unknown as Record<string, unknown>;
  g.window = dom.window;
  g.document = dom.window.document;
  g.HTMLElement = dom.window.HTMLElement; // runtime instanceof in the trigger
  vi.mocked(openSearchDialog).mockClear();
});

afterEach(() => {
  const g = globalThis as unknown as Record<string, unknown>;
  delete g.window;
  delete g.document;
  delete g.HTMLElement;
  dom.window.close();
});

async function clickTrigger() {
  const trigger = dom.window.document.querySelector('[data-search-trigger]') as HTMLButtonElement;
  trigger.click();
  // The handler awaits the dynamic import before delegating.
  await new Promise((resolve) => setTimeout(resolve, 0));
  return trigger;
}

describe('initSearchTrigger (D-044 delegation)', () => {
  it('opens the dialog with the clicked trigger', async () => {
    initSearchTrigger(dom.window.document);
    const trigger = await clickTrigger();
    expect(openSearchDialog).toHaveBeenCalledTimes(1);
    expect(openSearchDialog).toHaveBeenCalledWith(trigger);
  });

  it('still works after a router-style body swap', async () => {
    initSearchTrigger(dom.window.document);
    await clickTrigger();

    // ClientRouter replaces the whole body; identical scripts do not re-run.
    dom.window.document.body.innerHTML = TRIGGER_HTML;

    const swapped = await clickTrigger();
    expect(openSearchDialog).toHaveBeenCalledTimes(2);
    expect(openSearchDialog).toHaveBeenLastCalledWith(swapped);
  });

  it('ignores clicks outside the trigger', async () => {
    initSearchTrigger(dom.window.document);
    const other = dom.window.document.createElement('p');
    dom.window.document.body.appendChild(other);
    other.click();
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(openSearchDialog).not.toHaveBeenCalled();
  });
});
