/**
 * Phase C chrome — structural tests for Header, Footer, and the
 * BaseLayout shell incl. the FOUC guard's runtime behaviour (Gate 2:
 * FOUC guard verified under simulated storage/panel conditions).
 */
import { JSDOM } from 'jsdom';
import { describe, expect, it } from 'vitest';

import BaseLayout from '../../../src/shared/layouts/BaseLayout.astro';
import Footer from '../../../src/shared/components/Footer.astro';
import Header from '../../../src/shared/components/Header.astro';
import { expectNoA11yViolations, parse, render } from '../helpers/render';

describe('Header', () => {
  it('renders brand, primary nav landmark, all links, and the tablet dropdown', async () => {
    const html = await render(Header);
    const root = parse(html);
    expect(root.querySelector('.header__brand')?.textContent).toContain('Harshit');
    const nav = root.querySelector('nav[aria-label="Primary"]');
    expect(nav).not.toBeNull();
    const hrefs = Array.from(nav!.querySelectorAll('a')).map((a) => a.getAttribute('href'));
    expect(hrefs).toContain('/presentations');
    expect(hrefs).toContain('/about');
    expect(hrefs).toContain('/contact');
    // Tablet "More" dropdown (T-C3) carries the overflow links.
    const summary = root.querySelector('.more__summary');
    expect(summary?.textContent).toContain('More');
    const dropdownLink = root.querySelector('.more__menu a');
    expect(dropdownLink?.getAttribute('href')).toBe('/contact');
    await expectNoA11yViolations(html);
  });

  it('marks only the current page with aria-current', async () => {
    const html = await render(Header, { props: { currentPage: '/presentations' } });
    const root = parse(html);
    const current = root.querySelectorAll('[aria-current="page"]');
    expect(current).toHaveLength(1);
    expect(current[0].getAttribute('href')).toBe('/presentations');
  });

  it('has an actions slot for chrome islands', async () => {
    const html = await render(Header, {
      slots: { actions: '<button data-probe="action">A</button>' },
    });
    expect(parse(html).querySelector('[data-probe="action"]')).not.toBeNull();
  });
});

describe('Footer', () => {
  it('renders the signature content with the current year', async () => {
    const html = await render(Footer);
    const root = parse(html);
    expect(root.textContent).toContain(`© ${new Date().getFullYear()} Harshit`);
    expect(root.textContent).toContain('Built with care');
    await expectNoA11yViolations(html);
  });
});

describe('BaseLayout shell (Phase C composition)', () => {
  it('composes skip link, header, main content, and footer in order', async () => {
    const html = await render(BaseLayout, {
      props: { title: 'Probe', activePath: '/about' },
      slots: { default: '<main id="main-content"><h1>Body</h1></main>' },
    });
    const root = parse(html);
    const body = root.querySelector('body')!;
    const order = Array.from(body.children).map((el) => el.tagName.toLowerCase());
    expect(order[0]).toBe('a'); // SkipLink first
    expect(order).toContain('header');
    expect(order).toContain('footer');
    expect(body.querySelector('main#main-content')).not.toBeNull();
    // Active path reaches the nav.
    expect(body.querySelector('.header__nav [aria-current="page"]')?.getAttribute('href')).toBe(
      '/about',
    );
    // Chrome islands render their server markup into the actions slot.
    expect(body.querySelector('[data-theme-toggle]')).not.toBeNull();
    expect(body.querySelector('[data-menu-toggle]')).not.toBeNull();
  });
});

describe('FOUC guard (Gate 2)', () => {
  async function extractGuard(): Promise<string> {
    const html = await render(BaseLayout, { props: { title: 'Probe' } });
    const match = html.match(/<script>([\s\S]*?)<\/script>/);
    expect(match, 'inline FOUC guard script must exist').not.toBeNull();
    return match![1];
  }

  function runGuardIn(options: { storage?: string; panelMatches?: boolean; storageThrows?: boolean }) {
    const dom = new JSDOM('<!doctype html><html data-theme="light"><head></head><body></body></html>', {
      runScripts: 'outside-only',
      url: 'https://example.test/',
    });
    if (options.storageThrows) {
      Object.defineProperty(dom.window, 'localStorage', {
        get() {
          throw new Error('blocked');
        },
      });
    } else if (options.storage !== undefined) {
      dom.window.localStorage.setItem('theme', options.storage);
    }
    (dom.window as unknown as { matchMedia: unknown }).matchMedia = (query: string) =>
      ({ matches: options.panelMatches ?? false, media: query }) as MediaQueryList;
    return dom;
  }

  it('defaults to light and marks the document as JS-enabled', async () => {
    const script = await extractGuard();
    const dom = runGuardIn({});
    dom.window.eval(script);
    // The guard never flips to dark without a stored preference.
    expect(dom.window.document.documentElement.dataset.theme).toBe('light');
    expect(dom.window.document.documentElement.classList.contains('js')).toBe(true);
    dom.window.close();
  });

  it('applies a stored dark preference before paint', async () => {
    const script = await extractGuard();
    const dom = runGuardIn({ storage: 'dark' });
    dom.window.eval(script);
    expect(dom.window.document.documentElement.dataset.theme).toBe('dark');
    dom.window.close();
  });

  it('forces light on classroom panels despite a stored dark preference', async () => {
    const script = await extractGuard();
    const dom = runGuardIn({ storage: 'dark', panelMatches: true });
    dom.window.eval(script);
    expect(dom.window.document.documentElement.dataset.theme).toBe('light');
    dom.window.close();
  });

  it('fails safe to light when storage throws', async () => {
    const script = await extractGuard();
    const dom = runGuardIn({ storageThrows: true });
    expect(() => dom.window.eval(script)).not.toThrow();
    expect(dom.window.document.documentElement.dataset.theme).toBe('light');
    dom.window.close();
  });

  it('is synchronous, inline, and placed before stylesheets', async () => {
    const html = await render(BaseLayout, { props: { title: 'Probe' } });
    const scriptPos = html.indexOf('localStorage.getItem');
    const stylesheetPos = html.indexOf('rel="stylesheet"');
    expect(scriptPos).toBeGreaterThan(-1);
    expect(stylesheetPos === -1 || scriptPos < stylesheetPos).toBe(true);
    // Blocking script: no async/defer/module attributes.
    const tag = html.slice(html.lastIndexOf('<script>', scriptPos), scriptPos);
    expect(tag).not.toContain('async');
    expect(tag).not.toContain('defer');
    expect(tag).not.toContain('module');
  });
});
