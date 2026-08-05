/**
 * RecentRail island (Dev Plan T-E2, Design §13.2 dual strategy).
 *
 * The rail's cards are server-rendered (the top-3 by date, heading
 * "Latest Presentations") so the section is complete with JavaScript
 * disabled (invariant I1). This island hydrates client:load and adds the
 * personal layer on top:
 *
 *   - reads the validated localStorage recency list
 *   - keeps only slugs that still exist among the rendered cards
 *   - reorders the pre-rendered <li> nodes (newest launch first) and
 *     swaps the heading to "Recent Presentations"
 *   - leaves the server-rendered "Latest" state untouched when there is
 *     no recency — no flicker, no work (TAD §10.4)
 *   - records a launch when a quick-launch anchor is clicked
 *     (Design §29.3) without intercepting the navigation
 *
 * The island takes ownership of the list DOM after mount; the slot vdom
 * is constant, so Preact never overwrites the mutations (D-030).
 */
import { useEffect, useRef, useState } from 'preact/hooks';

import { readRecency, resolveRecentSlugs, writeRecency } from '../lib/recency';
import styles from './RecentRail.module.css';

export interface RecentRailProps {
  children?: preact.ComponentChildren;
}

export default function RecentRail({ children }: RecentRailProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isRecent, setIsRecent] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const list = container.querySelector<HTMLUListElement>('ul[data-rail]');
    const heading = container.querySelector<HTMLElement>('[data-rail-heading]');
    if (!list) return;

    const cards = Array.from(list.querySelectorAll<HTMLLIElement>(':scope > li[data-slug]'));
    if (cards.length === 0) return;

    // Personal recency → reorder + relabel; otherwise keep "Latest".
    const existingSlugs = cards.map((c) => c.dataset.slug ?? '');
    const recent = resolveRecentSlugs(readRecency(), existingSlugs, 3);

    if (recent.length > 0) {
      const bySlug = new Map(cards.map((c) => [c.dataset.slug ?? '', c]));
      // Move recent cards to the front in newest-first order; the rest
      // keep their server-rendered relative order behind them.
      const ordered = [
        ...recent.map((slug) => bySlug.get(slug)).filter(Boolean) as HTMLLIElement[],
        ...cards.filter((c) => !recent.includes(c.dataset.slug ?? '')),
      ];
      for (const card of ordered) list.appendChild(card);
      if (heading) heading.textContent = 'Recent Presentations';
      setIsRecent(true);
    }

    // Record launches from quick-launch anchors (Design §29.3). We do not
    // preventDefault — the anchor still opens Slides (works without JS).
    const onQuickLaunch = (event: Event) => {
      const target = event.target as HTMLElement;
      const anchor = target.closest<HTMLAnchorElement>('a[data-quick-launch]');
      if (!anchor) return;
      const slug = anchor.dataset.slug;
      if (slug) writeRecency(slug);
    };
    container.addEventListener('click', onQuickLaunch);
    // Observable mount marker — the click listener above is attached.
    container.setAttribute('data-rail-mounted', '');
    return () => container.removeEventListener('click', onQuickLaunch);
  }, []);

  return (
    <div
      ref={containerRef}
      class={styles.rail}
      data-recent-rail
      data-is-recent={isRecent || undefined}
    >
      {children}
    </div>
  );
}
