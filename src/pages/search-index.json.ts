/**
 * Build-time search index (Dev Plan T-F1, TAD §11.2).
 *
 * A static JSON endpoint generated from the PUBLISHED content collection:
 * no runtime database, no API key, works offline once cached (invariant
 * I2/I3). Fetched by the SearchOverlay on first open and held in memory.
 * Caching is configured in netlify.toml (TAD §14.7).
 *
 * The shortened-key document shape keeps the payload tiny (~150 bytes
 * per item) so compression dominates (TAD §11.2).
 */
import { getCollection } from 'astro:content';

import { buildSearchIndex } from '../features/search/lib/index-builder';

export async function GET(): Promise<Response> {
  const published = await getCollection('presentations', ({ data }) => data.published);

  const index = buildSearchIndex(
    published.map((entry) => ({
      slug: entry.id,
      title: entry.data.title,
      subject: entry.data.subject,
      tags: entry.data.tags,
      date: entry.data.date,
    })),
  );

  return new Response(JSON.stringify(index), {
    headers: { 'content-type': 'application/json; charset=utf-8' },
  });
}
