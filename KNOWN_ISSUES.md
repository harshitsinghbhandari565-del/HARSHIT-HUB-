# Known Issues

Every discovered concern is recorded here — never silently ignored.

## Resolved (kept for history)

| # | Item | Resolution |
|---|---|---|
| TD-7 | Fonts not self-hosted | **Resolved in Phase 1** — Astro Fonts API local provider; hashed self-hosted woff2, latin subset, swap, metric-adjusted fallbacks, first-paint preloads only (D-016) |
| TD-9 | `astro check` hint in eslint.config.js | **Resolved in Phase 1** — migrated to ESLint core `defineConfig()`; typecheck now 0 errors / 0 warnings / 0 hints |

## Current Issues

_None blocking. All quality gates green at Phase 1 completion (typecheck 0/0/0, ESLint 0, Stylelint 0, tests 32/32, build clean)._

## Technical Debt

| # | Item | Origin | Resolution path |
|---|---|---|---|
| TD-1 | Temporary `src/pages/index.astro` placeholder shell | D-008 | Deleted when the Phase E homepage lands |
| TD-2 | Dark palette is **derived** (Design v1 §24.2 values not delivered) | D-005 / assumption B1 | Replace verbatim if Design v1 arrives; full both-theme contrast audit in Phase H |
| TD-3 | Stylelint covers standalone CSS only — not `.astro` scoped styles; strict-value plugin has no shorthand expansion | D-013 | Custom-syntax integration + review discipline; revisit when component CSS grows (Phase B/C) |
| TD-4 | `robots.txt` is not yet environment-aware (preview deploys should emit `Disallow: /`) | TAD §17.4 | Phase H: build-time robots generation + smoke test asserting the production value |
| TD-5 | CSP header not yet shipped | TAD §19.3 | Phase H: report-only first, verify all routes/both themes, then enforce |
| TD-6 | View Transitions focus management (`astro:page-load` handler: focus to `<h1>`, title announcement) not yet implemented | TAD §15.4 | Lands with real navigation in Phase C; must not ship to users without it |
| TD-8 | Placeholder favicon | Initialization | Replace when design provides the brand mark |
| TD-10 | Skeleton/loading detailed spec lives in Design v1 (not delivered); current Skeleton is a conservative, token-driven placeholder with documented semantics (aria-hidden; consumers announce loading where needed) | Phase 1 (D-018 era) | Replace/extend when Design v1 loading-state spec arrives |

## Future Improvements

| # | Item | Phase |
|---|---|---|
| FI-1 | Migrate TAD §23 ADR-0001…0012 into individual `docs/adr/` files | Before launch (Phase H) |
| FI-2 | Playwright E2E (8 journeys) + axe both-theme scans in CI | Phase H |
| FI-3 | Lighthouse CI per-route budgets + bundle-size gate | Phase H (budgets defined: TAD §14.1) |
| FI-4 | Weekly `link-check.yml` writing `linkHealth` + GitHub issues | Phase H (ADR-0006) |
| FI-5 | Prefetch tuning (`data-astro-prefetch="viewport"` on rail cards) | Phase E |
| FI-6 | Subject filter chips on the gallery | At 25–50 items (TAD §20.2) |
| FI-7 | Search migration (Pagefind/MiniSearch) | At ~100 items (TAD §20.2) |
| FI-8 | Decap/TinaCMS over the same Git files | If GitHub-web-UI authoring creates friction (ADR-0004) |
| FI-9 | Fonts config is the first thing to re-verify on Astro upgrades (local-provider `options.variants` shape, `<Font />` preload filter) | Any Astro minor/major bump (D-016) |
| FI-10 | Stylelint coverage for `.astro` scoped styles (custom syntax) and shorthand color expansion | When component CSS grows (Phase C, TD from D-013) |

## Nice-to-Have Enhancements

| # | Item | Trigger |
|---|---|---|
| NH-1 | QR code component in the contact teaser | Phase 2 (PRD Could-have) |
| NH-2 | Privacy-respecting analytics (cookieless RUM) | Phase 2 (PRD A-8) |
| NH-3 | Service worker / offline support | Only if classroom network failures actually occur (TAD §20.4) |
| NH-4 | Visual regression testing | When the design system exceeds ~30 components (TAD §20.4) |
