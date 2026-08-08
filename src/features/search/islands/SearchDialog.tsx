/**
 * SearchDialog — the search dialog body, dynamically imported by the
 * SearchOverlay trigger island on first open (TAD §11.4). Loaded on
 * demand so search JS never taxes page loads where nobody searches.
 *
 * Accessibility contract (TAD §11.4): dialog semantics + inert
 * background, focus moves to the input on open, focus is trapped while
 * open, Arrow keys rove results, Enter activates (results are real
 * links), Escape closes, and a polite live region announces counts.
 */
import { useEffect, useRef, useState } from 'preact/hooks';

import { createFocusTrap, type FocusTrap } from '../../../shared/lib/focusTrap';
import { searchDocs, type SearchDoc } from '../lib/matcher';
import SearchInput from './SearchInput';
import styles from './SearchDialog.module.css';

/** In-memory index cache — shared across opens on the same page. */
let cachedIndex: SearchDoc[] | null = null;
let fetchPromise: Promise<SearchDoc[]> | null = null;

function loadIndex(): Promise<SearchDoc[]> {
  if (cachedIndex) return Promise.resolve(cachedIndex);
  if (!fetchPromise) {
    fetchPromise = fetch('/search-index.json')
      .then((res) => {
        if (!res.ok) throw new Error(`index unavailable (${res.status})`);
        return res.json() as Promise<SearchDoc[]>;
      })
      .then((docs) => {
        cachedIndex = docs;
        return docs;
      })
      .catch((error) => {
        fetchPromise = null; // allow retry on the next open
        throw error;
      });
  }
  return fetchPromise;
}

type Status = 'idle' | 'loading' | 'ready' | 'error';

export interface SearchDialogProps {
  onClose: () => void;
}

export default function SearchDialog({ onClose }: SearchDialogProps) {
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<Status>(cachedIndex ? 'ready' : 'loading');
  const [docs, setDocs] = useState<SearchDoc[]>(cachedIndex ?? []);

  const panelRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const trapRef = useRef<FocusTrap | null>(null);
  const debounceRef = useRef<number | undefined>(undefined);

  const results = status === 'ready' ? searchDocs(query, docs) : [];

  // On mount: load the index once, move focus in, trap it, inert the page.
  useEffect(() => {
    const panel = panelRef.current;
    if (!panel) return;

    if (!cachedIndex) {
      setStatus('loading');
      loadIndex()
        .then((loaded) => {
          setDocs(loaded);
          setStatus('ready');
        })
        .catch(() => setStatus('error'));
    }

    trapRef.current = createFocusTrap(panel);
    trapRef.current.activate();
    for (const el of [document.querySelector('main'), document.querySelector('footer')]) {
      el?.setAttribute('inert', '');
    }
    inputRef.current?.focus();

    return () => {
      trapRef.current?.deactivate();
      trapRef.current = null;
      for (const el of [document.querySelector('main'), document.querySelector('footer')]) {
        el?.removeAttribute('inert');
      }
      window.clearTimeout(debounceRef.current);
    };
  }, []);

  const close = () => onClose();

  const onInput = (value: string) => {
    setQuery(value);
    window.clearTimeout(debounceRef.current);
    debounceRef.current = window.setTimeout(() => {
      // Matching is synchronous; the debounce only paces announcements.
    }, 250);
  };

  // Single dialog-level key handler (bubbles from input/results):
  // ArrowDown/Up rove the results (Enter activates natively — results are
  // real links), Escape closes (TAD §11.4).
  const onPanelKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      event.stopPropagation();
      close();
      return;
    }

    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      const list = listRef.current;
      if (!list) return;
      const links = Array.from(list.querySelectorAll<HTMLAnchorElement>('a'));
      if (links.length === 0) return;
      event.preventDefault();
      const active = document.activeElement as HTMLElement | null;
      const index = active ? links.indexOf(active as HTMLAnchorElement) : -1;

      if (event.key === 'ArrowDown') {
        links[Math.min(index + 1, links.length - 1)].focus();
      } else if (index <= 0) {
        inputRef.current?.focus();
      } else {
        links[index - 1].focus();
      }
    }
  };

  const hasQuery = query.trim() !== '';
  const announcement =
    status === 'ready' && hasQuery
      ? results.length === 0
        ? 'No presentations found'
        : `${results.length} presentation${results.length === 1 ? '' : 's'} found`
      : '';

  return (
    // Backdrop click-to-close is a pointer convenience; the accessible
    // close paths are the Close button and Escape (TAD §11.4).
    // eslint-disable-next-line jsx-a11y/no-static-element-interactions
    <div class={styles.backdrop} onMouseDown={(e) => e.target === e.currentTarget && close()}>
      {/* Dialog-level Escape + arrow roving is the canonical pattern for
          modal search (TAD §11.4); focus is trapped while open. */}
      {/* eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions */}
      <div
        ref={panelRef}
        id="search-overlay-panel"
        class={styles.panel}
        role="dialog"
        aria-modal="true"
        aria-label="Search presentations"
        onKeyDown={onPanelKeyDown}
      >
        <div class={styles.panelHeader}>
          <SearchInput
            id="search-overlay-input"
            label="Search presentations"
            value={query}
            placeholder="Search presentations by title, subject, or tag..."
            onInput={onInput}
            onClear={() => setQuery('')}
            inputRef={inputRef}
          />
          <button type="button" class={styles.close} aria-label="Close search" onClick={close}>
            <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <p class={styles.status} role="status" aria-live="polite">
          {status === 'loading' ? 'Loading search…' : announcement}
          {status === 'error' && 'Search is unavailable right now. Browse the gallery instead.'}
        </p>

        {status === 'ready' && hasQuery && results.length > 0 && (
          <ul ref={listRef} class={styles.results}>
            {results.map(({ doc }) => (
              <li key={doc.s}>
                <a class={styles.result} href={`/presentations/${doc.s}`}>
                  <span class={styles.resultTitle}>{doc.t}</span>
                  <span class={styles.resultMeta}>
                    {doc.u} · {doc.d}
                  </span>
                </a>
              </li>
            ))}
          </ul>
        )}

        {status === 'ready' && hasQuery && results.length === 0 && (
          <div class={styles.empty}>
            <p class={styles.emptyHeading}>No presentations found</p>
            <p class={styles.emptyBody}>
              Try a different title, subject, or tag.
            </p>
            <button
              type="button"
              class={styles.emptyAction}
              onClick={() => {
                setQuery('');
                inputRef.current?.focus();
              }}
            >
              Clear your search
            </button>
          </div>
        )}

        {status === 'ready' && !hasQuery && (
          <p class={styles.prompt}>
            Search across titles, subjects, and tags — for example “{docs.length > 0 ? docs[0].u.toLowerCase() : 'science'}”.
          </p>
        )}
      </div>
    </div>
  );
}
