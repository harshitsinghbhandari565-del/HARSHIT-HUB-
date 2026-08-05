/**
 * SEO integration (TAD §17.2 metadata architecture + §17.3 JSON-LD) over
 * the BUILT output. Run after `npm run build`.
 *
 * Testing-strategy note: the Astro Container API does not load the
 * project config, so `Astro.site` (needed for absolute canonical/og:url)
 * is unavailable to a container-rendered SeoHead. Rather than hack the
 * component, this suite asserts on the real static artifacts, which is
 * the closest supported strategy AND the highest-fidelity one — it
 * exercises exactly what ships. Skips with a notice when dist/ is absent
 * (bare `vitest run` before a build); CI orders it after the build step.
 */
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

const DIST = fileURLToPath(new URL('../../dist/', import.meta.url));
const SITE = 'https://harshit-portfolio-hub.netlify.app';

function page(rel: string): string {
  return readFileSync(`${DIST}${rel}`, 'utf8');
}

function jsonLdBlocks(html: string): Array<Record<string, unknown>> {
  return [...html.matchAll(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)].map(
    (m) => JSON.parse(m[1]) as Record<string, unknown>,
  );
}

describe.skipIf(!existsSync(DIST))('SEO metadata architecture (TAD §17.2)', () => {
  const indexable: Array<[string, string]> = [
    ['index.html', `${SITE}/`],
    ['presentations/index.html', `${SITE}/presentations/`],
    ['presentations/photosynthesis/index.html', `${SITE}/presentations/photosynthesis/`],
    ['about/index.html', `${SITE}/about/`],
    ['contact/index.html', `${SITE}/contact/`],
  ];

  it.each(indexable)('%s: canonical + OG + robots are absolute and correct', (rel, canonical) => {
    const html = page(rel);
    // Void-element serialization varies (self-closing slash is optional),
    // so assert the attribute pair rather than an exact tag string.
    expect(html).toContain(`rel="canonical" href="${canonical}"`);
    expect(html).toContain(`property="og:url" content="${canonical}"`);
    expect(html).toContain('name="robots" content="index, follow"');
    expect(html).toContain('property="og:type" content="website"');
    expect(html).toContain('property="og:site_name" content="Harshit"');
    expect(html).toContain('<meta property="og:title"');
    expect(html).toContain('<meta name="description"');
    expect(html).toContain('<meta property="og:description"');
    expect(html).toContain('<meta name="twitter:card"');
  });

  it('noindex pages carry noindex,follow and no JSON-LD', () => {
    for (const rel of ['projects/index.html', 'certificates/index.html', 'resume/index.html', '404.html']) {
      const html = page(rel);
      expect(html, rel).toContain('content="noindex, follow"');
      expect(jsonLdBlocks(html), `${rel} must not emit structured data`).toHaveLength(0);
    }
  });
});

describe.skipIf(!existsSync(DIST))('JSON-LD structured data (TAD §17.3)', () => {
  it('home emits Person + WebSite', () => {
    const types = jsonLdBlocks(page('index.html')).map((b) => b['@type']);
    expect(types).toEqual(['Person', 'WebSite']);
  });

  it('gallery emits a CollectionPage enumerating the published decks', () => {
    const [schema] = jsonLdBlocks(page('presentations/index.html'));
    expect(schema['@type']).toBe('CollectionPage');
    const list = schema.mainEntity as Record<string, unknown>;
    expect(list['@type']).toBe('ItemList');
    const items = list.itemListElement as Array<Record<string, unknown>>;
    expect(items.length).toBeGreaterThan(0);
    expect(items[0].name).toBe('Photosynthesis: How Plants Make Food');
  });

  it('detail emits PresentationDigitalDocument + matching BreadcrumbList', () => {
    const blocks = jsonLdBlocks(page('presentations/photosynthesis/index.html'));
    const types = blocks.map((b) => b['@type']);
    expect(types).toEqual(['PresentationDigitalDocument', 'BreadcrumbList']);
    const doc = blocks[0];
    expect(doc.name).toBe('Photosynthesis: How Plants Make Food');
    expect(doc.genre).toBe('Science');
    const crumbs = (blocks[1].itemListElement as Array<Record<string, unknown>>).map((c) => c.name);
    expect(crumbs).toEqual(['Home', 'Presentations', 'Photosynthesis: How Plants Make Food']);
  });

  it('about/contact emit their page types', () => {
    expect(jsonLdBlocks(page('about/index.html'))[0]['@type']).toBe('AboutPage');
    expect(jsonLdBlocks(page('contact/index.html'))[0]['@type']).toBe('ContactPage');
  });

  it('no JSON-LD body contains a literal "<" (D-047 escape)', () => {
    for (const rel of ['index.html', 'presentations/index.html', 'presentations/photosynthesis/index.html', 'about/index.html', 'contact/index.html']) {
      for (const m of page(rel).matchAll(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)) {
        expect(m[1], `${rel} JSON-LD must be escape-safe`).not.toContain('<');
      }
    }
  });
});
