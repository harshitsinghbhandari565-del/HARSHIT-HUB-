/**
 * JSON-LD builders — TAD §17.3 structured data. Generated from the same
 * content that renders each page (pages pass real collection data in),
 * so structured data cannot drift from visible content.
 *
 * Pure functions with minimal structural input types (shared/ never
 * imports content/ — TAD §5.1 rule 1; pages map entries to this shape).
 */
import { SITE_EMAIL, SITE_NAME, SITE_TAGLINE, SITE_URL } from '../config/site';

/** The presentation fields structured data needs (mapped by pages). */
export interface JsonLdPresentation {
  slug: string;
  title: string;
  subject: string;
  /** ISO date string (from the validated content date). */
  dateISO: string;
  description?: string;
}

export interface JsonLdCrumb {
  name: string;
  path: string;
}

/**
 * Serialize a schema for a `<script type="application/ld+json">` body
 * (D-047). Astro treats script bodies as raw text, so serialized data
 * must be injected via set:html; this function makes that injection
 * provably safe: every `<` becomes `\u003c`, so the output can contain
 * no markup and can NEVER close the script element early — identical
 * characters to any JSON parser. Input is build-time, Zod-validated
 * content only; user input never reaches this path.
 */
export function serializeJsonLd(schema: Record<string, unknown>): string {
  return JSON.stringify(schema).replace(/</g, '\\u003c');
}

export function personSchema(): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: SITE_NAME,
    description: SITE_TAGLINE,
    url: SITE_URL,
    email: `mailto:${SITE_EMAIL}`,
    sameAs: [], // socials join when provided (IA-2 / OQ-4)
  };
}

export function websiteSchema(): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: SITE_URL,
  };
}

export function collectionSchema(items: readonly JsonLdPresentation[]): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `Presentations · ${SITE_NAME}`,
    url: `${SITE_URL}/presentations/`,
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: items.map((item, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        url: `${SITE_URL}/presentations/${item.slug}/`,
        name: item.title,
      })),
    },
  };
}

export function presentationSchema(item: JsonLdPresentation): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'PresentationDigitalDocument',
    name: item.title,
    url: `${SITE_URL}/presentations/${item.slug}/`,
    datePublished: item.dateISO,
    genre: item.subject,
    ...(item.description ? { description: item.description } : {}),
  };
}

export function breadcrumbSchema(trail: readonly JsonLdCrumb[]): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: trail.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.name,
      item: `${SITE_URL}${crumb.path}`,
    })),
  };
}

export function webPageSchema(
  type: 'AboutPage' | 'ContactPage',
  name: string,
  path: string,
  description?: string,
): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': type,
    name,
    url: `${SITE_URL}${path}`,
    ...(description ? { description } : {}),
  };
}
