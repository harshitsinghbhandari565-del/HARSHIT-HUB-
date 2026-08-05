/**
 * features/search — public interface (TAD §5.1 rule 2).
 *
 * Global search over the build-time index (TAD §11): the header trigger
 * (vanilla script + on-demand dialog mount, D-038), the shared search
 * field, the scored matcher, and the index builder. The gallery's inline
 * search reuses the same matcher through the GalleryController island
 * (TAD §11.3 — two surfaces, one matcher).
 */
export { default as SearchOverlay } from './islands/SearchOverlay.astro';
export { default as SearchInput } from './islands/SearchInput';
export { openSearchDialog } from './islands/search-mount';
export { searchDocs, docMatches, type SearchDoc, type SearchResult } from './lib/matcher';
export { normalizeText, tokenize } from './lib/normalize';
export { buildSearchIndex, type IndexablePresentation } from './lib/index-builder';
