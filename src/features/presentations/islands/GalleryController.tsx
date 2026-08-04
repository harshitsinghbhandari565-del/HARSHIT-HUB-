/**
 * GalleryController island (Dev Plan T-D4) — hydrates client:load on
 * /presentations. Manages subject filter, sort options, and URL sync —
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
}

function readCards(list: HTMLUListElement): CardData[] {
  return Array.from(list.querySelectorAll<HTMLLIElement>(':scope > li[data-subject]')).map(
    (el) => ({
      el,
      dateMs: Date.parse(el.dataset.date ?? '') || 0,
      subject: el.dataset.subject ?? '',
      title: el.dataset.title ?? '',
    }),
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

  const [sort, setSort] = useState<SortOption>(initialSort);
  const [subject, setSubject] = useState<string | null>(
    initialSubject && subjects.includes(initialSubject) ? initialSubject : null,
  );
  const [visibleCount, setVisibleCount] = useState<number | null>(null);

  // Take ownership of the pre-rendered list once on mount.
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const list = container.querySelector<HTMLUListElement>('ul[data-gallery]');
    if (!list) return;
    listRef.current = list;
    cardsRef.current = readCards(list);
  }, []);

  // Apply sort + filter to the DOM whenever either changes.
  useEffect(() => {
    const list = listRef.current;
    const cards = cardsRef.current;
    if (!list || !cards || cards.length === 0) return;

    const ordered = sortValue(sort, cards);
    let visible = 0;
    for (const card of ordered) {
      const matches = subject === null || card.subject === subject;
      card.el.toggleAttribute('hidden', !matches);
      if (matches) visible += 1;
      list.appendChild(card.el); // moves the node into sorted order
    }
    setVisibleCount(visible);
  }, [sort, subject]);

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
          : subject === null
            ? `${visibleCount} presentation${visibleCount === 1 ? '' : 's'}`
            : `${visibleCount} of ${total} presentation${total === 1 ? '' : 's'} shown`}
      </p>

      {children}
    </div>
  );
}
