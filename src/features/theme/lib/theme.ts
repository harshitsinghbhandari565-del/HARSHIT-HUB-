/**
 * Theme utilities — pure logic shared by the FOUC guard, ThemeToggle
 * island, and tests. Dark mode is opt-in (Design §17): light is the
 * default-safe state everywhere, and classroom panels force light
 * (ADR-0011: width ≥1920px AND coarse pointer / no hover).
 */

export const THEME_STORAGE_KEY = 'theme';

export type Theme = 'light' | 'dark';

/**
 * Panel theme-lock media query (ADR-0011). A large touch panel reports a
 * coarse pointer; a desktop monitor with a mouse reports fine — so the
 * lock applies to panels, not to 1920px desktops.
 */
export const PANEL_QUERY = '(min-width: 1920px) and ((pointer: coarse) or (hover: none))';

export function isPanelLocked(
  matchMediaImpl: (query: string) => MediaQueryList = globalThis.matchMedia?.bind(globalThis),
): boolean {
  try {
    return Boolean(matchMediaImpl?.(PANEL_QUERY)?.matches);
  } catch {
    return false;
  }
}

/** Read the stored preference; anything malformed or blocked yields null. */
export function getStoredTheme(storage: Storage | undefined = globalThis.localStorage): Theme | null {
  try {
    const value = storage?.getItem(THEME_STORAGE_KEY);
    return value === 'dark' || value === 'light' ? value : null;
  } catch {
    return null;
  }
}

export function storeTheme(
  theme: Theme,
  storage: Storage | undefined = globalThis.localStorage,
): void {
  try {
    storage?.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // Storage blocked (private mode, panel kiosk) — the in-DOM attribute
    // still applies for this visit; nothing to do.
  }
}

export function applyTheme(
  theme: Theme,
  root: HTMLElement | undefined = globalThis.document?.documentElement,
): void {
  if (root) root.dataset.theme = theme;
}

/** The FOUC guard's decision, isolated for testing (TAD §12.2). */
export function initialTheme(
  stored: Theme | null,
  panelLocked: boolean,
): Theme {
  return stored === 'dark' && !panelLocked ? 'dark' : 'light';
}
