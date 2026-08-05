/**
 * Phase C chrome — interactive tests: MobileMenu (Gate 2: keyboard +
 * pointer, focus trap, aria-expanded) and ThemeToggle. Both are vanilla
 * bundled-script components (D-038 ThemeToggle, D-044 MobileMenu):
 * container render + init-function wiring, no script eval.
 */
import { JSDOM } from 'jsdom';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import MobileMenu from '../../../src/shared/components/MobileMenu.astro';
import ThemeToggle from '../../../src/features/theme/islands/ThemeToggle.astro';
import { initThemeToggle, THEME_STORAGE_KEY } from '../../../src/features/theme/lib/theme';
import { initMobileMenu } from '../../../src/shared/lib/mobileMenu';
import { render as containerRender } from '../helpers/render';

const LINKS = [
  { label: 'Presentations', href: '/presentations' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
];

let dom: JSDOM;
let host: HTMLElement;

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
  clearGlobals();
  dom.window.close();
});

describe('MobileMenu (vanilla, D-044)', () => {
  async function mount(currentPage = '/'): Promise<void> {
    const html = await containerRender(MobileMenu, {
      props: { links: LINKS, currentPage },
    });
    host.innerHTML = html.replace(/<script[\s\S]*?<\/script>/g, '');
    initMobileMenu(dom.window.document);
  }

  function query() {
    const doc = dom.window.document;
    return {
      trigger: doc.querySelector('[data-menu-toggle]') as HTMLButtonElement,
      panel: doc.getElementById('mobile-menu-panel') as HTMLElement,
      closeButton: doc.querySelector('[data-menu-close]') as HTMLButtonElement,
      main: doc.querySelector('main') as HTMLElement,
      footer: doc.querySelector('footer') as HTMLElement,
      links: Array.from(doc.querySelectorAll('#mobile-menu-panel nav a')) as HTMLAnchorElement[],
    };
  }

  it('starts closed: collapsed trigger, inert panel, page interactive', async () => {
    await mount();
    const { trigger, panel, main } = query();
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
    expect(trigger.getAttribute('aria-controls')).toBe('mobile-menu-panel');
    expect(panel.hasAttribute('inert')).toBe(true);
    expect(main.hasAttribute('inert')).toBe(false);
  });

  it('opens on click: focus moves in, page goes inert, scroll locks', async () => {
    await mount();
    const { trigger } = query();
    trigger.click();
    const opened = query();
    expect(opened.trigger.getAttribute('aria-expanded')).toBe('true');
    expect(opened.panel.hasAttribute('inert')).toBe(false);
    expect(dom.window.document.activeElement).toBe(opened.closeButton);
    expect(opened.main.hasAttribute('inert')).toBe(true);
    expect(opened.footer.hasAttribute('inert')).toBe(true);
    expect(dom.window.document.documentElement.style.overflow).toBe('hidden');
  });

  it('closes on Escape and returns focus to the trigger', async () => {
    await mount();
    query().trigger.click();
    const { trigger, panel, main } = query();
    panel.dispatchEvent(
      new dom.window.KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }),
    );
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
    expect(dom.window.document.activeElement).toBe(trigger);
    expect(main.hasAttribute('inert')).toBe(false);
    expect(dom.window.document.documentElement.style.overflow).not.toBe('hidden');
  });

  it('closes via the close button and returns focus to the trigger', async () => {
    await mount();
    query().trigger.click();
    const { trigger, closeButton } = query();
    closeButton.click();
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
    expect(dom.window.document.activeElement).toBe(trigger);
  });

  it('traps Tab focus inside the open panel', async () => {
    await mount();
    query().trigger.click();
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
    await mount('/about');
    const { links } = query();
    expect(links).toHaveLength(3);
    const current = links.find((a) => a.getAttribute('aria-current') === 'page');
    expect(current?.getAttribute('href')).toBe('/about');
  });
});

describe('ThemeToggle (vanilla script, D-038)', () => {
  async function mount(): Promise<HTMLButtonElement> {
    const html = await containerRender(ThemeToggle);
    host.innerHTML = html.replace(/<script[\s\S]*?<\/script>/g, '');
    initThemeToggle(dom.window.document);
    return host.querySelector('[data-theme-toggle]') as HTMLButtonElement;
  }

  it('starts in light mode and switches to dark on click', async () => {
    const button = await mount();
    expect(button.getAttribute('aria-pressed')).toBe('false');
    expect(button.getAttribute('aria-label')).toBe('Switch to dark theme');
    button.click();
    expect(dom.window.document.documentElement.dataset.theme).toBe('dark');
    expect(dom.window.localStorage.getItem(THEME_STORAGE_KEY)).toBe('dark');
    expect(button.getAttribute('aria-pressed')).toBe('true');
    expect(button.getAttribute('aria-label')).toBe('Switch to light theme');
  });

  it('switches back to light on a second click', async () => {
    const button = await mount();
    button.click();
    button.click();
    expect(dom.window.document.documentElement.dataset.theme).toBe('light');
    expect(dom.window.localStorage.getItem(THEME_STORAGE_KEY)).toBe('light');
  });

  it('reflects a dark document state set before the script runs', async () => {
    dom.window.document.documentElement.dataset.theme = 'dark';
    const button = await mount();
    expect(button.getAttribute('aria-pressed')).toBe('true');
    expect(button.getAttribute('aria-label')).toBe('Switch to light theme');
  });
});

describe('navigation resilience (D-044: ClientRouter swaps the body without re-running identical scripts)', () => {
  it('ThemeToggle: a swapped-in toggle works and syncs to the current theme', async () => {
    const html = await containerRender(ThemeToggle);
    const markup = html.replace(/<script[\s\S]*?<\/script>/g, '');
    host.innerHTML = markup;
    initThemeToggle(dom.window.document);
    (host.querySelector('[data-theme-toggle]') as HTMLButtonElement).click();
    expect(dom.window.document.documentElement.dataset.theme).toBe('dark');

    // Simulate the router swap: fresh body content, same document.
    host.innerHTML = markup;
    dom.window.document.dispatchEvent(new dom.window.Event('astro:after-swap'));

    const swapped = host.querySelector('[data-theme-toggle]') as HTMLButtonElement;
    // SSR markup says light; the after-swap resync corrects the state.
    expect(swapped.getAttribute('aria-pressed')).toBe('true');
    swapped.click(); // delegated listener still wired
    expect(dom.window.document.documentElement.dataset.theme).toBe('light');
  });

  it('MobileMenu: a swapped-in menu opens and closes', async () => {
    const html = await containerRender(MobileMenu, { props: { links: LINKS, currentPage: '/' } });
    const markup = html.replace(/<script[\s\S]*?<\/script>/g, '');
    host.innerHTML = markup;
    initMobileMenu(dom.window.document);

    // Simulate the router swap.
    host.innerHTML = markup;

    const trigger = host.querySelector('[data-menu-toggle]') as HTMLButtonElement;
    trigger.click();
    expect(trigger.getAttribute('aria-expanded')).toBe('true');
    const panel = dom.window.document.getElementById('mobile-menu-panel') as HTMLElement;
    expect(panel.hasAttribute('inert')).toBe(false);
    (host.querySelector('[data-menu-close]') as HTMLButtonElement).click();
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
    expect(dom.window.document.activeElement).toBe(trigger);
  });
});
