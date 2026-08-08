/**
 * GalleryController island (Dev Plan T-D4 + Phase F search wiring) —
 * hydrates client:load on /presentations. Manages the inline search
 * input (TAD §11.3 — two surfaces, one matcher), subject filter, sort
 * options, and URL sync —
 * by enhancing the server-rendered card list (invariant I1: with
 * JavaScript disabled every card is present and the gallery is complete).
 *
 * The card <ul> arrives as the island's slot; the island takes ownership
 * of its DOM order/visibility after mount (the slot vdom is constant, so
 * Preact never overwrites the mutations — the same contract RecentRail
 * will use, TAD §10.4).
 *
 * URL behaviour (TAD §10.2): sort changes are deliberate, back-navigable
 * actions → pushState; filter changes are refinements → replaceState.
 */
import { useEffect, useRef, useState } from 'preact/hooks';

import SearchInput from '../../search/islands/SearchInput';
import { docMatches, type SearchDoc } from '../../search/lib/matcher';
import {
  DEFAULT_SORT,
  isSortOption,
  SORT_OPTIONS,
  type SortOption,
} from '../lib/sorting';
import styles from './GalleryController.module.css';

export interface GalleryControllerProps {
  /** Subjects present in the published catalog (for the filter chips). */
  subjects: string[];
  children?: preact.ComponentChildren;
}

interface CardData {
  el: HTMLLIElement;
  dateMs: number;
  subject: string;
  title: string;
  /** Searchable view of the card (TAD §11.3 — same matcher as the overlay). */
  doc: SearchDoc;
}

function readCards(list: HTMLUListElement): CardData[] {
  return Array.from(list.querySelectorAll<HTMLLIElement>(':scope > li[data-subject]')).map(
    (el) => {
      const subject = el.dataset.subject ?? '';
      const title = el.dataset.title ?? '';
      const dateMs = Date.parse(el.dataset.date ?? '') || 0;
      return {
        el,
        dateMs,
        subject,
        title,
        doc: {
          s: el.dataset.slug ?? '',
          t: title,
          u: subject,
          g: (el.dataset.tags ?? '').split('|').filter(Boolean),
          d: el.dataset.date ?? '',
        },
      };
    },
  );
}

function sortValue(option: SortOption, cards: CardData[]): CardData[] {
  const sorted = [...cards];
  switch (option) {
    case 'date-desc':
      sorted.sort((a, b) => b.dateMs - a.dateMs);
      break;
    case 'date-asc':
      sorted.sort((a, b) => a.dateMs - b.dateMs);
      break;
    case 'subject-asc':
      sorted.sort(
        (a, b) => a.subject.localeCompare(b.subject) || a.title.localeCompare(b.title),
      );
      break;
    case 'subject-desc':
      sorted.sort(
        (a, b) => b.subject.localeCompare(a.subject) || a.title.localeCompare(b.title),
      );
      break;
  }
  return sorted;
}

export default function GalleryController({ subjects, children }: GalleryControllerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<CardData[] | null>(null);
  const listRef = useRef<HTMLUListElement | null>(null);

  const initialParams =
    typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
  const initialSort: SortOption = isSortOption(initialParams?.get('sort') ?? null)
    ? (initialParams?.get('sort') as SortOption)
    : DEFAULT_SORT;
  const initialSubject = initialParams?.get('subject') ?? null;
  const initialQuery = initialParams?.get('q') ?? '';

  const [sort, setSort] = useState<SortOption>(initialSort);
  const [subject, setSubject] = useState<string | null>(
    initialSubject && subjects.includes(initialSubject) ? initialSubject : null,
  );
  const [q, setQ] = useState(initialQuery);
  const [debouncedQ, setDebouncedQ] = useState(initialQuery);
  const [visibleCount, setVisibleCount] = useState<number | null>(null);
  const debounceRef = useRef<number | undefined>(undefined);

  // Take ownership of the pre-rendered list once on mount.
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const list = container.querySelector<HTMLUListElement>('ul[data-gallery]');
    if (!list) return;
    listRef.current = list;
    cardsRef.current = readCards(list);
  }, []);

  // Apply query + subject filter + sort to the DOM whenever any changes.
  useEffect(() => {
    const list = listRef.current;
    const cards = cardsRef.current;
    if (!list || !cards || cards.length === 0) return;

    const ordered = sortValue(sort, cards);
    let visible = 0;
    for (const card of ordered) {
      const subjectOk = subject === null || card.subject === subject;
      const queryOk = debouncedQ.trim() === '' || docMatches(debouncedQ, card.doc);
      const matches = subjectOk && queryOk;
      card.el.toggleAttribute('hidden', !matches);
      if (matches) visible += 1;
      list.appendChild(card.el); // moves the node into sorted order
    }
    setVisibleCount(visible);
  }, [sort, subject, debouncedQ]);

  // Debounce typing (TAD §10.2) and sync ?q= as a refinement.
  const onQueryInput = (value: string) => {
    setQ(value);
    window.clearTimeout(debounceRef.current);
    debounceRef.current = window.setTimeout(() => {
      setDebouncedQ(value);
      const params = new URLSearchParams(window.location.search);
      if (value.trim() === '') params.delete('q');
      else params.set('q', value);
      const query = params.toString();
      window.history.replaceState(null, '', query ? `?${query}` : window.location.pathname);
    }, 250);
  };

  const clearQuery = () => {
    window.clearTimeout(debounceRef.current);
    setQ('');
    setDebouncedQ('');
    const params = new URLSearchParams(window.location.search);
    params.delete('q');
    const query = params.toString();
    window.history.replaceState(null, '', query ? `?${query}` : window.location.pathname);
  };

  const searching = debouncedQ.trim() !== '';
  const noResults = searching && visibleCount === 0;

  const onSortChange = (value: string) => {
    if (!isSortOption(value)) return;
    setSort(value);
    const params = new URLSearchParams(window.location.search);
    if (value === DEFAULT_SORT) params.delete('sort');
    else params.set('sort', value);
    const query = params.toString();
    // Deliberate, back-navigable action (TAD §10.2).
    window.history.pushState(null, '', query ? `?${query}` : window.location.pathname);
  };

  const onSubjectChange = (next: string | null) => {
    setSubject(next);
    const params = new URLSearchParams(window.location.search);
    if (next === null) params.delete('subject');
    else params.set('subject', next);
    const query = params.toString();
    // Refinement, not a navigation (TAD §10.2).
    window.history.replaceState(null, '', query ? `?${query}` : window.location.pathname);
  };

  const total = cardsRef.current?.length ?? null;

  return (
    <div ref={containerRef} class={styles.controller}>
      <div class={styles.controls}>
        <div class={styles.searchRow}>
          <SearchInput
            id="gallery-search"
            label="Search presentations"
            value={q}
            placeholder="Search presentations by title, subject, or tag..."
            onInput={onQueryInput}
            onClear={clearQuery}
          />
        </div>

        <div class={styles.chips} role="group" aria-label="Filter presentations by subject">
          <button
            type="button"
            class={`${styles.chip} ${subject === null ? styles.chipActive : ''}`}
            aria-pressed={subject === null}
            onClick={() => onSubjectChange(null)}
          >
            All
          </button>
          {subjects.map((s) => (
            <button
              key={s}
              type="button"
              class={`${styles.chip} ${subject === s ? styles.chipActive : ''}`}
              aria-pressed={subject === s}
              onClick={() => onSubjectChange(s)}
            >
              {s}
            </button>
          ))}
        </div>

        <div class={styles.sort}>
          <label class={styles.sortLabel} htmlFor="gallery-sort">
            Sort
          </label>
          <select
            id="gallery-sort"
            class={styles.sortSelect}
            value={sort}
            onChange={(e) => onSortChange((e.target as HTMLSelectElement).value)}
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Announces filter results without stealing focus (Design §16 spirit). */}
      <p class={styles.status} role="status" aria-live="polite">
        {visibleCount === null
          ? ''
          : searching || subject !== null
            ? `${visibleCount} of ${total} presentation${total === 1 ? '' : 's'} shown`
            : `${visibleCount} presentation${visibleCount === 1 ? '' : 's'}`}
      </p>

      {/* Empty search results (Design §18.3) with a reset action. */}
      <div class={styles.noResults} hidden={!noResults}>
        <p class={styles.noResultsHeading}>No presentations found</p>
        <p class={styles.noResultsBody}>Try a different title, subject, or tag.</p>
        <button type="button" class={styles.noResultsAction} onClick={clearQuery}>
          Clear your search
        </button>
      </div>

      {children}
    </div>
  );
}
