/**
 * Phase H (T-H1) — full static accessibility scans of the BUILT site:
 * every page in dist/ under axe-core, in both themes. Runs after
 * `npm run build` (CI orders it after the build step); skips with a loud
 * notice when dist/ is absent so a bare `vitest run` never fails for a
 * missing artifact.
 *
 * Colour contrast cannot be computed under jsdom (no visual rendering);
 * axe reports those checks "incomplete", not as violations. Contrast is
 * covered by the Design §25.1 token table and the manual Phase H pass
 * (RELEASE_CHECKLIST).
 */
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

import axe from 'axe-core';
import { JSDOM } from 'jsdom';
import { describe, expect, it } from 'vitest';

const DIST = fileURLToPath(new URL('../../dist/', import.meta.url));

function htmlFiles(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) htmlFiles(full, out);
    else if (entry.name.endsWith('.html')) out.push(full);
  }
  return out;
}

const pages = existsSync(DIST) ? htmlFiles(DIST).sort() : [];

describe.skipIf(pages.length === 0)(
  'site-wide axe scans (TAD §15.5, T-H1)',
  () => {
    if (pages.length === 0) return;

    async function scan(file: string, theme: 'light' | 'dark') {
      const html = readFileSync(file, 'utf8');
      const dom = new JSDOM(html, {
        url: 'https://harshit-portfolio-hub.netlify.app/',
        pretendToBeVisual: true,
      });
      dom.window.document.documentElement.dataset.theme = theme;
      const globals = globalThis as unknown as Record<string, unknown>;
      const previous = {
        window: globals.window,
        document: globals.document,
        HTMLElement: globals.HTMLElement,
        Node: globals.Node,
        Element: globals.Element,
      };
      globals.window = dom.window;
      globals.document = dom.window.document;
      globals.HTMLElement = dom.window.HTMLElement;
      globals.Node = dom.window.Node;
      globals.Element = dom.window.Element;
      try {
        const results = await axe.run(dom.window.document.documentElement, {
          // The pages are real, complete documents — run the full ruleset.
          runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag22aa', 'best-practice'] },
        });
        const violations = results.violations.map(
          (v) =>
            `${v.id} (${v.impact}): ${v.help}\n` +
            v.nodes.slice(0, 3).map((n) => `    ${n.target.join(' ')} — ${n.failureSummary}`).join('\n'),
        );
        expect(violations, `${file} [${theme}]\n${violations.join('\n')}`).toEqual([]);
      } finally {
        globals.window = previous.window;
        globals.document = previous.document;
        globals.HTMLElement = previous.HTMLElement;
        globals.Node = previous.Node;
        globals.Element = previous.Element;
        dom.window.close();
      }
    }

    for (const file of pages) {
      const name = file.slice(DIST.length);
      it(`${name} — light theme: zero axe violations`, async () => scan(file, 'light'), 20_000);
      it(`${name} — dark theme: zero axe violations`, async () => scan(file, 'dark'), 20_000);
    }
  },
);
