/**
 * features/theme — public interface (TAD §5.1 rule 2).
 *
 * Dark mode is opt-in (Design §17): light default everywhere, toggle for
 * personal browsing, panel breakpoint forces light (ADR-0011). The FOUC
 * guard lives in BaseLayout's blocking inline script (TAD §12.2).
 */
export {
  PANEL_QUERY,
  THEME_STORAGE_KEY,
  applyTheme,
  getStoredTheme,
  initialTheme,
  isPanelLocked,
  storeTheme,
  type Theme,
} from './lib/theme';
export { default as ThemeToggle } from './islands/ThemeToggle';
