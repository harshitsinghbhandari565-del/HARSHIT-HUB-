/**
 * Phase C islands — interactive tests: MobileMenu (Gate 2: keyboard +
 * pointer, focus trap, aria-expanded) and ThemeToggle (persistence,
 * pressed state). Rendered with Preact into jsdom (D-018 pattern).
 */
import { JSDOM } from 'jsdom';
import { render as preactRender } from 'preact';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import MobileMenu from '../../../src/shared/components/MobileMenu';
import ThemeToggle from '../../../src/features/theme/islands/ThemeToggle';
import { THEME_STORAGE_KEY } from '../../../src/features/theme/lib/theme';

const LINKS = [
  { label: 'Presentations', href: '/presentations' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
] as const;

let dom: JSDOM;
let host: HTMLElement;

// Preact defers re-render and effect execution via its own timers; fixed
// tick counts race them. Poll for an observable condition instead.
async function waitFor(condition: () => boolean, what: string, timeoutMs = 2000) {
  const start = Date.now();
  while (!condition()) {
    if (Date.now() - start > timeoutMs) throw new Error(`waitFor timed out: ${what}`);
    await new Promise((resolve) => setTimeout(resolve, 5));
  }
}

const flush = async () => {
  await new Promise((resolve) => setTimeout(resolve, 0));
  await new Promise((resolve) => setTimeout(resolve, 0));
};

function setGlobals() {
  const g = globalThis as unknown as Record<string, unknown>;
  g.window = dom.window;
  g.document = dom.window.document;
  g.localStorage = dom.window.localStorage;
  g.matchMedia = (query: string) => ({ matches: false, media: query }) as MediaQueryList;
}

function clearGlobals() {
  const g = globalThis as unknown as Record<string, unknown>;
  delete g.window;
  delete g.document;
  delete g.localStorage;
  delete g.matchMedia;
}

beforeEach(() => {
  dom = new JSDOM(
    `<!doctype html><html data-theme="light"><body>
       <main id="main-content"></main>
       <div id="host"></div>
       <footer></footer>
     </body></html>`,
    { url: 'https://example.test/', pretendToBeVisual: true },
  );
  setGlobals();
  host = dom.window.document.getElementById('host') as HTMLElement;
});

afterEach(() => {
  preactRender(null, host);
  clearGlobals();
  dom.window.close();
});

describe('MobileMenu island', () => {
  function query() {
    const doc = dom.window.document;
    return {
      trigger: doc.querySelector('[data-menu-toggle]') as HTMLButtonElement,
      panel: doc.getElementById('mobile-menu-panel') as HTMLElement,
      closeButton: doc.querySelector('[aria-label="Close menu"]') as HTMLButtonElement,
      main: doc.querySelector('main') as HTMLElement,
      footer: doc.querySelector('footer') as HTMLElement,
      links: Array.from(doc.querySelectorAll('#mobile-menu-panel nav a')) as HTMLAnchorElement[],
    };
  }

  async function openMenu() {
    const { trigger } = query();
    trigger.click();
    // Wait for the open effect (scroll lock proves the effect body ran,
    // i.e. the trap and Escape listeners are attached).
    await waitFor(
      () => dom.window.document.documentElement.style.overflow === 'hidden',
      'menu open effect',
    );
  }

  it('starts closed: collapsed trigger, inert panel, page interactive', async () => {
    preactRender(<MobileMenu links={LINKS} currentPage="/" />, host);
    await flush();
    const { trigger, panel, main } = query();
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
    expect(trigger.getAttribute('aria-controls')).toBe('mobile-menu-panel');
    expect(panel.hasAttribute('inert')).toBe(true);
    expect(main.hasAttribute('inert')).toBe(false);
  });

  it('opens on click: focus moves in, page goes inert, scroll locks', async () => {
    preactRender(<MobileMenu links={LINKS} currentPage="/" />, host);
    await flush();
    await openMenu();
    const { trigger, panel, closeButton, main, footer } = query();
    expect(trigger.getAttribute('aria-expanded')).toBe('true');
    expect(panel.hasAttribute('inert')).toBe(false);
    expect(dom.window.document.activeElement).toBe(closeButton);
    expect(main.hasAttribute('inert')).toBe(true);
    expect(footer.hasAttribute('inert')).toBe(true);
    expect(dom.window.document.documentElement.style.overflow).toBe('hidden');
  });

  it('closes on Escape and returns focus to the trigger', async () => {
    preactRender(<MobileMenu links={LINKS} currentPage="/" />, host);
    await flush();
    await openMenu();
    const { trigger, panel, main } = query();
    panel.dispatchEvent(
      new dom.window.KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }),
    );
    await waitFor(
      () =>
        trigger.getAttribute('aria-expanded') === 'false' && !main.hasAttribute('inert'),
      'Escape close + inert cleanup',
    );
    expect(dom.window.document.activeElement).toBe(trigger);
    expect(main.hasAttribute('inert')).toBe(false);
    expect(dom.window.document.documentElement.style.overflow).not.toBe('hidden');
  });

  it('closes via the close button and returns focus to the trigger', async () => {
    preactRender(<MobileMenu links={LINKS} currentPage="/" />, host);
    await flush();
    await openMenu();
    const { trigger, closeButton } = query();
    closeButton.click();
    await waitFor(
      () =>
        trigger.getAttribute('aria-expanded') === 'false' &&
        !query().main.hasAttribute('inert'),
      'close button + inert cleanup',
    );
    expect(dom.window.document.activeElement).toBe(trigger);
  });

  it('traps Tab focus inside the open panel', async () => {
    preactRender(<MobileMenu links={LINKS} currentPage="/" />, host);
    await flush();
    await openMenu();
    const { closeButton, links } = query();
    const lastLink = links[links.length - 1];
    lastLink.focus();
    lastLink.dispatchEvent(
      new dom.window.KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true }),
    );
    expect(dom.window.document.activeElement).toBe(closeButton);
    closeButton.dispatchEvent(
      new dom.window.KeyboardEvent('keydown', {
        key: 'Tab',
        shiftKey: true,
        bubbles: true,
        cancelable: true,
      }),
    );
    expect(dom.window.document.activeElement).toBe(lastLink);
  });

  it('renders nav links with the active page marked', async () => {
    preactRender(<MobileMenu links={LINKS} currentPage="/about" />, host);
    await flush();
    const { links } = query();
    expect(links).toHaveLength(3);
    const current = links.find((a) => a.getAttribute('aria-current') === 'page');
    expect(current?.getAttribute('href')).toBe('/about');
  });
});

describe('ThemeToggle island', () => {
  function query() {
    const button = dom.window.document.querySelector('[data-theme-toggle]') as HTMLButtonElement;
    return { button };
  }

  it('starts in light mode and switches to dark on click', async () => {
    preactRender(<ThemeToggle />, host);
    await flush();
    const { button } = query();
    expect(button.getAttribute('aria-pressed')).toBe('false');
    expect(button.getAttribute('aria-label')).toBe('Switch to dark theme');
    button.click();
    await flush();
    expect(dom.window.document.documentElement.dataset.theme).toBe('dark');
    expect(dom.window.localStorage.getItem(THEME_STORAGE_KEY)).toBe('dark');
    expect(button.getAttribute('aria-pressed')).toBe('true');
    expect(button.getAttribute('aria-label')).toBe('Switch to light theme');
  });

  it('switches back to light on a second click', async () => {
    preactRender(<ThemeToggle />, host);
    await flush();
    const { button } = query();
    button.click();
    await flush();
    button.click();
    await flush();
    expect(dom.window.document.documentElement.dataset.theme).toBe('light');
    expect(dom.window.localStorage.getItem(THEME_STORAGE_KEY)).toBe('light');
  });

  it('reflects a dark document state set before hydration', async () => {
    dom.window.document.documentElement.dataset.theme = 'dark';
    preactRender(<ThemeToggle />, host);
    await flush();
    const { button } = query();
    expect(button.getAttribute('aria-pressed')).toBe('true');
    expect(button.getAttribute('aria-label')).toBe('Switch to light theme');
  });
});
