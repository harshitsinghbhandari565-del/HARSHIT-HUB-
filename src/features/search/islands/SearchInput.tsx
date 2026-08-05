/**
 * SearchInput — presentational search field (Design §11.4), shared by the
 * global SearchOverlay and the gallery's inline search. NOT independently
 * hydrated: it is composed inside a single owning island (GalleryController
 * for the gallery, SearchOverlay for the global overlay), so one island owns
 * the URL/filter state and invariant I6 (no cross-island coupling) holds
 * (D-037).
 *
 * Accessibility (TAD §11.4 / Design §11.4): a real <label> (visually
 * hidden), placeholder is never the label, a clear button appears when the
 * input has a value, and focus is fully keyboard-operable.
 */
import { useRef } from 'preact/hooks';

import styles from './SearchInput.module.css';

export interface SearchInputProps {
  id: string;
  label: string;
  value: string;
  placeholder?: string;
  onInput: (value: string) => void;
  onClear: () => void;
  /** Forwarded so the owning island can attach roving-focus handlers. */
  inputRef?: preact.Ref<HTMLInputElement>;
  onKeyDown?: (event: KeyboardEvent) => void;
  autoComplete?: string;
}

export default function SearchInput({
  id,
  label,
  value,
  placeholder,
  onInput,
  onClear,
  inputRef,
  onKeyDown,
}: SearchInputProps) {
  const localRef = useRef<HTMLInputElement>(null);

  const setRefs = (el: HTMLInputElement | null) => {
    localRef.current = el;
    if (typeof inputRef === 'function') inputRef(el);
    else if (inputRef) inputRef.current = el;
  };

  return (
    <div class={styles.wrap}>
      <label class={styles.label} for={id}>
        {label}
      </label>
      <svg class={styles.icon} viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21l-4.3-4.3" />
      </svg>
      <input
        ref={setRefs}
        id={id}
        class={styles.input}
        type="search"
        value={value}
        placeholder={placeholder}
        autocomplete="off"
        spellcheck={false}
        onInput={(e) => onInput((e.target as HTMLInputElement).value)}
        onKeyDown={(e) => onKeyDown?.(e as unknown as KeyboardEvent)}
      />
      {value !== '' && (
        <button
          type="button"
          class={styles.clear}
          aria-label="Clear search"
          onClick={() => {
            onClear();
            localRef.current?.focus();
          }}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M18 6 6 18M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
}
