/**
 * JSON-LD builders + serializer (TAD §17.3, D-047). Pure functions —
 * pages map Zod-validated collection data into the structural input
 * types, so structured data cannot drift from visible content.
 */
import { describe, expect, it } from 'vitest';

import {
  breadcrumbSchema,
  collectionSchema,
  personSchema,
  presentationSchema,
  serializeJsonLd,
  webPageSchema,
  websiteSchema,
  type JsonLdPresentation,
} from '../../../src/shared/lib/jsonLd';

const ITEM: JsonLdPresentation = {
  slug: 'photosynthesis',
  title: 'Photosynthesis: How Plants Make Food',
  subject: 'Science',
  dateISO: '2026-08-01T00:00:00.000Z',
  description: 'How plants convert light into chemical energy.',
};

describe('serializeJsonLd (D-047 safety)', () => {
  it('produces valid JSON for ordinary schemas', () => {
    expect(JSON.parse(serializeJsonLd(ITEM as unknown as Record<string, unknown>))).toEqual(ITEM);
  });

  it('escapes every "<" so the script element can never close early', () => {
    const hostile = {
      name: '</script><script>alert(1)</script>',
      nested: { trick: '<<<>>>' },
    };
    const output = serializeJsonLd(hostile);
    expect(output).not.toContain('<');
    // JSON.stringify leaves ">" alone — harmless, only "<" can open/close
    // markup; the safety property is the absence of any literal "<".
    expect(output).toContain('\\u003c/script>');
    // The escape is transparent to JSON parsers.
    expect(JSON.parse(output)).toEqual(hostile);
  });

  it('escapes "<" even inside unicode-rich content', () => {
    const output = serializeJsonLd({ name: 'a < b — ✓ <tag>', list: ['<x>'] });
    expect(output).not.toContain('<');
    expect(JSON.parse(output)).toEqual({ name: 'a < b — ✓ <tag>', list: ['<x>'] });
  });
});

describe('JSON-LD builders (TAD §17.3)', () => {
  it('Person carries identity fields and an (empty until IA-2) sameAs', () => {
    const schema = personSchema();
    expect(schema['@type']).toBe('Person');
    expect(schema['@context']).toBe('https://schema.org');
    expect(schema.name).toBe('Harshit');
    expect(typeof schema.description).toBe('string');
    expect(String(schema.email)).toMatch(/^mailto:/);
    expect(schema.sameAs).toEqual([]);
  });

  it('WebSite names the hub', () => {
    const schema = websiteSchema();
    expect(schema['@type']).toBe('WebSite');
    expect(schema.name).toBe('Harshit');
    expect(String(schema.url)).toMatch(/^https:\/\//);
  });

  it('CollectionPage enumerates items positionally with stable URLs', () => {
    const schema = collectionSchema([ITEM, { ...ITEM, slug: 'other', title: 'Other' }]);
    expect(schema['@type']).toBe('CollectionPage');
    const list = schema.mainEntity as Record<string, unknown>;
    expect(list['@type']).toBe('ItemList');
    const elements = list.itemListElement as Array<Record<string, unknown>>;
    expect(elements).toHaveLength(2);
    expect(elements[0]).toMatchObject({
      '@type': 'ListItem',
      position: 1,
      name: ITEM.title,
    });
    expect(String(elements[0].url)).toContain('/presentations/photosynthesis/');
    expect((elements[1] as Record<string, unknown>).position).toBe(2);
  });

  it('PresentationDigitalDocument carries item semantics', () => {
    const schema = presentationSchema(ITEM);
    expect(schema['@type']).toBe('PresentationDigitalDocument');
    expect(schema.name).toBe(ITEM.title);
    expect(schema.datePublished).toBe(ITEM.dateISO);
    expect(schema.genre).toBe('Science');
    expect(schema.description).toBe(ITEM.description);
    expect(String(schema.url)).toContain('/presentations/photosynthesis/');
  });

  it('PresentationDigitalDocument omits description when absent', () => {
    const { description: _omit, ...rest } = ITEM;
    expect(presentationSchema(rest)).not.toHaveProperty('description');
  });

  it('BreadcrumbList mirrors the visible trail order', () => {
    const schema = breadcrumbSchema([
      { name: 'Home', path: '/' },
      { name: 'Presentations', path: '/presentations/' },
      { name: ITEM.title, path: `/presentations/${ITEM.slug}/` },
    ]);
    expect(schema['@type']).toBe('BreadcrumbList');
    const elements = schema.itemListElement as Array<Record<string, unknown>>;
    expect(elements.map((e) => e.name)).toEqual(['Home', 'Presentations', ITEM.title]);
    expect(elements.map((e) => e.position)).toEqual([1, 2, 3]);
    for (const element of elements) {
      expect(String(element.item)).toMatch(/^https:\/\//);
    }
  });

  it('AboutPage/ContactPage carry the page type and URL', () => {
    expect(webPageSchema('AboutPage', 'About', '/about/')['@type']).toBe('AboutPage');
    expect(webPageSchema('ContactPage', 'Contact', '/contact/')['@type']).toBe('ContactPage');
    expect(String(webPageSchema('AboutPage', 'About', '/about/').url)).toContain('/about/');
  });
});
