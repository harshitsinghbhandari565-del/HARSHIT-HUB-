/**
 * Site configuration — TAD §5 (shared/config) / §18.5.
 * Non-secret values only (invariant I3). Environment handling:
 * - SITE_URL is provided by the platform at deploy time (Netlify); a
 *   deterministic fallback keeps local/CI builds stable.
 * - .env.example documents the variable; .env files are git-ignored.
 */

export const SITE_NAME = 'Harshit';

/**
 * Homepage copy — DEFAULTS ONLY (content pending, IA-2 / D-034).
 * Replace with Harshit's real tagline/bio when provided; nothing here
 * is structural. Labelled mock values ship until then.
 */
export const SITE_TAGLINE =
  'MOCK TAGLINE — Building ideas, one presentation at a time.';

export const SITE_ABOUT_TEASER =
  'MOCK ABOUT TEASER — Student, presenter, and builder. I turn classroom topics into clear, confident presentations — and this hub keeps every one of them a click away.';

export const SITE_CONTACT_TEASER =
  'MOCK CONTACT TEASER — Questions, feedback, or a project in mind? I would love to hear from you.';

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
