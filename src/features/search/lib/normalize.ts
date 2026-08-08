/**
 * Query/document text normalization for the search matcher (TAD §5/§11.2).
 * Lowercase, strip diacritics, trim, collapse whitespace — so "Café  Art"
 * matches "cafe art" and sloppy typing is forgiven without fuzzy matching.
 */

export function normalizeText(input: string): string {
  return input
    .normalize('NFD')
    .replace(/\p{M}/gu, '') // strip diacritics
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ');
}

/** Split a query into normalized tokens (whitespace-separated). */
export function tokenize(query: string): string[] {
  const normalized = normalizeText(query);
  return normalized === '' ? [] : normalized.split(' ');
}
