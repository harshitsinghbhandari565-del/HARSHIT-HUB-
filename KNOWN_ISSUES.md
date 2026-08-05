# Known Issues

Every discovered concern is recorded here — never silently ignored.

## Resolved (kept for history)

| # | Item | Resolution |
|---|---|---|
| TD-7 | Fonts not self-hosted | **Resolved in Phase 1** — Astro Fonts API local provider; hashed self-hosted woff2, latin subset, swap, metric-adjusted fallbacks, first-paint preloads only (D-016) |
| TD-9 | `astro check` hint in eslint.config.js | **Resolved in Phase 1** — migrated to ESLint core `defineConfig()`; typecheck now 0 errors / 0 warnings / 0 hints |
| TD-1 | Temporary index.astro placeholder shell | **Resolved in Phase 4** — homepage assembly replaced the shell (TD-1 closed in the Phase E commit) |

## Current Issues

| # | Item | Status |
|---|---|---|
| CI-1 | **T-D7 projector dry-run pending** — the M3 manual gate needs Harshit's real Slides/Dropbox URLs (IA-2) and physical panel access; everything automatable around it is test-verified (D-031) | Open — blocked on content + hardware |
| CI-2 | **Mock seed content live** — three labeled mock presentations (D-029) render until Harshit's real decks replace them | Open — replacement is a content-only change |

_All quality gates green at Phase 4 completion (typecheck 0/0/0, ESLint 0, Stylelint 0, tests 141/141, build clean; homepage budgets JS ≈17.4 KB gz ≤ 20 KB, CSS 5.0 KB ≤ 15 KB — see TEST_REPORT.md)._

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
| TD-12 | Homepage copy constants are labelled MOCK (tagline, about/contact teasers — D-034) and the About teaser visual is a gradient placeholder pending the profile image | Phase 4 | Content-only replacements when Harshit's words/image arrive |
| TD-11 | Tablet "More" `<details>` dropdown does not auto-close on outside click or Escape (native disclosure behavior; D-020) | Phase 2 | If review deems it needed, add a small shared script or promote to an island before Phase F |

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
