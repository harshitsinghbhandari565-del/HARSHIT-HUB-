/**
 * ThemeToggle island (Dev Plan T-C4) — hydrates client:idle, never on the
 * critical path. Dark mode is opt-in (Design §17): flips data-theme on
 * <html>, persists the preference, updates its accessible name/pressed
 * state. Hidden on panel breakpoints where light is forced (ADR-0011),
 * and hidden without JS (the control would be inert).
 */
import { useState } from 'preact/hooks';

import { applyTheme, storeTheme } from '../lib/theme';
import styles from './ThemeToggle.module.css';

/** Lucide `sun` (decorative). */
function SunIcon() {
  return (
    <svg
      class={styles.icon}
      viewBox="0 0 24 24"
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32l1.41 1.41M2 12h2m16 0h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
    </svg>
  );
}

/** Lucide `moon` (decorative). */
function MoonIcon() {
  return (
    <svg
      class={styles.icon}
      viewBox="0 0 24 24"
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    >
      <path d="M20.985 12.486a9 9 0 1 1-9.473-9.472c.405-.022.617.46.402.803a6 6 0 0 0 8.268 8.268c.344-.215.825-.004.803.401" />
    </svg>
  );
}

export default function ThemeToggle() {
  const [dark, setDark] = useState(
    () => globalThis.document?.documentElement.dataset.theme === 'dark',
  );

  const toggle = () => {
    const next = !dark;
    setDark(next);
    applyTheme(next ? 'dark' : 'light');
    storeTheme(next ? 'dark' : 'light');
  };

  return (
    <button
      type="button"
      class={styles.toggle}
      data-theme-toggle
      onClick={toggle}
      aria-pressed={dark}
      aria-label={dark ? 'Switch to light theme' : 'Switch to dark theme'}
    >
      {dark ? <SunIcon /> : <MoonIcon />}
    </button>
  );
}
