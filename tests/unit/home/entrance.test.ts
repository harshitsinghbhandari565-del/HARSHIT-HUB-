/**
 * Entrance-mode guard (Design §23.4): the homepage inline script decides
 * full vs reduced entrance from a sessionStorage timestamp. Executed in
 * jsdom against the real rendered script — same approach as the Phase 2
 * FOUC guard tests.
 */
import { JSDOM } from 'jsdom';
import { describe, expect, it, vi } from 'vitest';

import HomePage from '../../../src/pages/index.astro';
import { render } from '../helpers/render';

const fixtures = vi.hoisted(() => [
  {
    id: 'alpha',
    data: {
      title: 'Alpha Talk',
      subject: 'Science',
      date: new Date('2026-08-01'),
      tags: [],
      googleSlidesUrl: 'https://docs.google.com/presentation/d/x/present',
      forceDownload: false,
      published: true,
      linkHealth: { slides: 'ok', dropbox: 'absent' },
    },
  },
]);

vi.mock('astro:content', () => ({
  getCollection: async () => fixtures,
}));

async function extractEntranceScript(): Promise<string> {
  const html = await render(HomePage);
  const match = html.match(/<script>\s*\/\/ Entrance mode[\s\S]*?<\/script>/);
  expect(match, 'entrance script must exist').not.toBeNull();
  return match![0].replace(/<\/?script>/g, '');
}

function runIn(options: { lastVisit?: number; storageThrows?: boolean }) {
  const dom = new JSDOM('<!doctype html><html><head></head><body></body></html>', {
    runScripts: 'outside-only',
    url: 'https://example.test/',
  });
  if (options.storageThrows) {
    Object.defineProperty(dom.window, 'sessionStorage', {
      get() {
        throw new Error('blocked');
      },
    });
  } else if (options.lastVisit !== undefined) {
    dom.window.sessionStorage.setItem('lastHomeVisit', String(options.lastVisit));
  }
  return dom;
}

describe('Entrance-mode guard (Design §23.4)', () => {
  it('chooses "full" on a first visit and stamps the timestamp', async () => {
    const script = await extractEntranceScript();
    const dom = runIn({});
    dom.window.eval(script);
    expect(dom.window.document.documentElement.dataset.entrance).toBe('full');
    expect(Number(dom.window.sessionStorage.getItem('lastHomeVisit'))).toBeGreaterThan(0);
    dom.window.close();
  });

  it('chooses "reduced" when returning within 30 seconds', async () => {
    const script = await extractEntranceScript();
    const dom = runIn({ lastVisit: Date.now() - 5_000 });
    dom.window.eval(script);
    expect(dom.window.document.documentElement.dataset.entrance).toBe('reduced');
    dom.window.close();
  });

  it('chooses "full" again after more than 30 seconds away', async () => {
    const script = await extractEntranceScript();
    const dom = runIn({ lastVisit: Date.now() - 60_000 });
    dom.window.eval(script);
    expect(dom.window.document.documentElement.dataset.entrance).toBe('full');
    dom.window.close();
  });

  it('fails safe without touching the document when storage throws', async () => {
    const script = await extractEntranceScript();
    const dom = runIn({ storageThrows: true });
    expect(() => dom.window.eval(script)).not.toThrow();
    expect(dom.window.document.documentElement.dataset.entrance).toBeUndefined();
    dom.window.close();
  });
});
