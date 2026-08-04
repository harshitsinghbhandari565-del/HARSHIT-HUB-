/**
 * features/presentations — public interface (TAD §5.1 rule 2).
 *
 * The presentation domain: visual identifiers, meta, tags, the
 * ADR-0007 linked card, the projector launch row, build-time link-health
 * alerts, and the gallery controller island. Other features import only
 * through this module.
 */
export { default as ActionRow } from './components/ActionRow.astro';
export { default as LinkHealthAlert } from './components/LinkHealthAlert.astro';
export { default as PresentationCard } from './components/PresentationCard.astro';
export { default as PresentationMeta } from './components/PresentationMeta.astro';
export { default as SubjectVisual } from './components/SubjectVisual.astro';
export { default as TagRow } from './components/TagRow.astro';
export { default as GalleryController } from './islands/GalleryController';
export {
  buildBackupUrl,
  normalizeSlidesUrl,
} from './lib/slidesUrl';
export {
  comparePresentations,
  DEFAULT_SORT,
  isSortOption,
  SORT_OPTIONS,
  sortPresentations,
  type SortablePresentation,
  type SortOption,
} from './lib/sorting';
