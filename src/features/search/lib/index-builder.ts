/**
 * Build-time search index construction (Dev Plan T-F1, TAD §11.2).
 * Maps validated content entries to the shortened-key document shape.
 * Descriptions are excluded on purpose: they multiply payload for
 * marginal recall on a small corpus (TAD §11.2).
 */

import type { SearchDoc } from './matcher';

export interface IndexablePresentation {
  slug: string;
  title: string;
  subject: string;
  tags: string[];
  date: Date;
}

export function buildSearchIndex(entries: readonly IndexablePresentation[]): SearchDoc[] {
  return entries.map((entry) => ({
    s: entry.slug,
    t: entry.title,
    u: entry.subject,
    g: entry.tags,
    d: entry.date.toISOString().slice(0, 10),
  }));
}
