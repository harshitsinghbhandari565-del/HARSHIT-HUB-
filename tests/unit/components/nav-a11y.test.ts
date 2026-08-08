/**
 * Navigation accessibility (TAD §15.4, D-044): after each ClientRouter
 * route change focus moves to the new h1/main and the page title is
 * announced via a polite live region; the initial load is skipped.
 * initNavA11y is wired by BaseLayout's bundled script.
 */
import { JSDOM } from 'jsdom';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { initNavA11y } from '../../../src/shared/lib/navA11y';

let dom: JSDOM;

beforeEach(() => {
  dom = new JSDOM(
    '<!doctype html><html><head></head><body><main id="main-content"><h1>Body</h1></main></body></html>',
    { url: 'https://example.test/' },
  );
  dom.window.document.title = 'Page One · Harshit';
  const g = globalThis as unknown as Record<string, unknown>;
  g.window = dom.window;
  g.document = dom.window.document;
  g.HTMLElement = dom.window.HTMLElement;
});

afterEach(() => {
  const g = globalThis as unknown as Record<string, unknown>;
  delete g.window;
  delete g.document;
  delete g.HTMLElement;
  dom.window.close();
});

function pageLoad() {
  dom.window.document.dispatchEvent(new dom.window.Event('astro:page-load'));
}

describe('route-change focus + announcement (TAD §15.4)', () => {
  it('does not steal focus on the initial page load', () => {
    initNavA11y(dom.window.document);
    pageLoad();
    expect(dom.window.document.activeElement).toBe(dom.window.document.body);
    expect(dom.window.document.getElementById('route-announcer')).toBeNull();
  });

  it('moves focus to the new h1 and announces the title on navigation', () => {
    initNavA11y(dom.window.document);
    pageLoad(); // initial — skipped

    // Simulate the router swap: fresh body, new title.
    dom.window.document.body.innerHTML = '<main id="main-content"><h1>About Harshit</h1></main>';
    dom.window.document.title = 'About · Harshit';
    pageLoad();

    const h1 = dom.window.document.querySelector('h1') as HTMLElement;
    expect(dom.window.document.activeElement).toBe(h1);
    expect(h1.getAttribute('tabindex')).toBe('-1');
    const announcer = dom.window.document.getElementById('route-announcer');
    expect(announcer).not.toBeNull();
    expect(announcer!.getAttribute('role')).toBe('status');
    expect(announcer!.getAttribute('aria-live')).toBe('polite');
    expect(announcer!.textContent).toBe('About · Harshit');
  });

  it('falls back to main when the page has no h1', () => {
    initNavA11y(dom.window.document);
    pageLoad();

    dom.window.document.body.innerHTML = '<main id="main-content"><p>No heading here.</p></main>';
    pageLoad();

    const main = dom.window.document.querySelector('main') as HTMLElement;
    expect(dom.window.document.activeElement).toBe(main);
  });

  it('recreates the announcer after each body swap', () => {
    initNavA11y(dom.window.document);
    pageLoad();

    dom.window.document.body.innerHTML = '<main><h1>Two</h1></main>';
    pageLoad();
    expect(dom.window.document.getElementById('route-announcer')).not.toBeNull();

    // The swap removes everything in the body, including the announcer.
    dom.window.document.body.innerHTML = '<main><h1>Three</h1></main>';
    dom.window.document.title = 'Three · Harshit';
    pageLoad();
    const announcer = dom.window.document.getElementById('route-announcer');
    expect(announcer).not.toBeNull();
    expect(announcer!.textContent).toBe('Three · Harshit');
  });
});
