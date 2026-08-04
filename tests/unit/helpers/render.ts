/**
 * Shared helpers for Phase B component tests (T-B4):
 * render .astro primitives via the Astro Container API, then verify
 * structure and accessibility with jsdom + axe-core (used as a library in
 * the node environment — vitest's jsdom environment patches globals in a
 * way that breaks the transform pipeline, so DOM work stays explicit).
 */
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import axe from 'axe-core';
import { JSDOM } from 'jsdom';
import { expect } from 'vitest';

/** Anything the container accepts as a renderable component. */
export type RenderableComponent = Parameters<AstroContainer['renderToString']>[0];

export interface RenderOptions {
  props?: Record<string, unknown>;
  slots?: Record<string, string>;
}

/** Render an Astro component to an HTML string. */
export async function render(component: RenderableComponent, options: RenderOptions = {}) {
  const container = await AstroContainer.create();
  return container.renderToString(component, {
    props: options.props,
    slots: options.slots,
  });
}

/**
 * Parse rendered markup for structural asserts. Full documents (e.g.
 * BaseLayout output) are returned at documentElement level; fragments are
 * wrapped in a body and returned at body level.
 */
export function parse(html: string): HTMLElement {
  // Full documents contain an <html> tag (fragments never do). The output
  // may begin with comments, so test for the tag anywhere in the markup.
  const isFullDocument = /<html[\s>]/i.test(html);
  const dom = new JSDOM(
    isFullDocument ? html : `<!doctype html><html><body>${html}</body></html>`,
  );
  return isFullDocument
    ? (dom.window.document.documentElement as HTMLElement)
    : dom.window.document.body;
}

/**
 * Assert zero axe violations for a rendered fragment.
 * The fragment is wrapped in a <main> landmark so document-level rules
 * reflect the fragment's own responsibilities only. Color-contrast checks
 * in jsdom are reported "incomplete" (no visual rendering), not violations
 * — contrast is covered by Design §25.1's verified table.
 */
export async function expectNoA11yViolations(html: string) {
  const dom = new JSDOM(
    `<!doctype html><html lang="en"><body><main id="main-content">${html}</main></body></html>`,
    { pretendToBeVisual: true },
  );
  const globals = globalThis as unknown as { window?: unknown; document?: unknown };
  const previous = { window: globals.window, document: globals.document };
  globals.window = dom.window;
  globals.document = dom.window.document;
  try {
    const target = dom.window.document.querySelector('#main-content') as HTMLElement;
    const results = await axe.run(target as unknown as axe.ElementContext);
    const violations = results.violations.map(
      (v) => `${v.id}: ${v.help} (${v.nodes.length} node(s))`,
    );
    expect(violations, violations.join('\n')).toEqual([]);
  } finally {
    globals.window = previous.window;
    globals.document = previous.document;
    dom.window.close();
  }
}
