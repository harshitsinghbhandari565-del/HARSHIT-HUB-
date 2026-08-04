/**
 * Gallery sort options — Design §14.2 (authoritative list; Dev Plan §9.2's
 * older wording superseded — Phase 1 report X-2). The island reorders
 * pre-rendered DOM with these comparators; the server renders the default.
 */

export type SortOption = 'date-desc' | 'date-asc' | 'subject-asc' | 'subject-desc';

export const SORT_OPTIONS: ReadonlyArray<{ value: SortOption; label: string }> = [
  { value: 'date-desc', label: 'Most Recent' },
  { value: 'date-asc', label: 'Oldest First' },
  { value: 'subject-asc', label: 'Subject A–Z' },
  { value: 'subject-desc', label: 'Subject Z–A' },
];

export const DEFAULT_SORT: SortOption = 'date-desc';

export interface SortablePresentation {
  /** Epoch ms (or anything Date-coercible). */
  dateMs: number;
  subject: string;
  title: string;
}

export function isSortOption(value: string | null): value is SortOption {
  return SORT_OPTIONS.some((o) => o.value === value);
}

/** Stable comparator for the given option (title breaks subject ties). */
export function comparePresentations(option: SortOption) {
  return (a: SortablePresentation, b: SortablePresentation): number => {
    switch (option) {
      case 'date-desc':
        return b.dateMs - a.dateMs;
      case 'date-asc':
        return a.dateMs - b.dateMs;
      case 'subject-asc':
        return (
          a.subject.localeCompare(b.subject) || a.title.localeCompare(b.title)
        );
      case 'subject-desc':
        return (
          b.subject.localeCompare(a.subject) || a.title.localeCompare(b.title)
        );
    }
  };
}

export function sortPresentations<T extends SortablePresentation>(
  items: readonly T[],
  option: SortOption,
): T[] {
  return [...items].sort(comparePresentations(option));
}
