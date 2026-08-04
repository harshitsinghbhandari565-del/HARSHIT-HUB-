/**
 * Site configuration — TAD §5 (shared/config) / §18.5.
 * Non-secret values only (invariant I3). Environment handling:
 * - SITE_URL is provided by the platform at deploy time (Netlify); a
 *   deterministic fallback keeps local/CI builds stable.
 * - .env.example documents the variable; .env files are git-ignored.
 */

export const SITE_NAME = 'Harshit';

export const SITE_URL = import.meta.env.SITE_URL ?? 'https://harshit-portfolio-hub.netlify.app';

/** Default metadata until Harshit's copy arrives (assumption IA-2). */
export const SITE_DEFAULT_DESCRIPTION =
  'Harshit — Personal Academic Portfolio & Presentation Hub.';

/**
 * Global navigation — future sections (Projects, Certificates, Resume) are
 * deliberately absent (TAD §6.4 / F4: routes exist as unlinked, noindex
 * Coming Soon pages).
 */
export const NAV_LINKS: ReadonlyArray<{ label: string; href: string }> = [
  { label: 'Presentations', href: '/presentations' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
];

/**
 * Breakpoints (Design §24 / §29.4). The PANEL layout breakpoint keys off
 * width alone; the THEME lock additionally requires a coarse pointer /
 * no hover (TAD ADR-0011 / F5) — see KNOWN_ISSUES for the media-query pair.
 */
export const BREAKPOINTS = {
  tablet: 768,
  tabletMoreDropdown: 900,
  desktop: 1024,
  panel: 1920,
} as const;
