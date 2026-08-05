# Test Report

Permanent testing history of the project. Entries are appended per phase, never overwritten.

Methodology notes (apply to all entries):

- Automated suites run in Vitest; `.astro` components render through the Astro Container API; Preact islands render into jsdom and are exercised with real DOM events.
- Accessibility automation is axe-core (component level). Browser-level axe, keyboard, and screen-reader passes arrive with Phase H's E2E tooling (Playwright + `@axe-core/playwright`).
- Performance evidence until Phase H is build-artifact measurement (gzipped route assets) against TAD §14.1 budgets; field RUM arrives in Phase 2 of the roadmap.
- Responsive behaviour is implemented per Design §24/§29.4 breakpoint specs and verified structurally; real-viewport verification is a Phase H E2E activity.

---

## Phase 5 — Global Search Experience (Development Plan Phase F)

**Date:** 2026-08-04

**Features tested:**
- Matcher + normalizer: diacritic stripping, whitespace collapse, case insensitivity, AND-across-tokens semantics, scoring hierarchy (title exact > prefix > substring > subject > tag exact > tag prefix), score-desc → date-desc tie-break, `docMatches` parity with `searchDocs`, empty-query behaviour
- Index builder + endpoint: shortened-key shape (s/t/u/g/d), published-only filtering, descriptions excluded, content-type header (astro:content mocked per D-028)
- SearchOverlay trigger: structure + dialog wiring attributes
- SearchDialog: dialog semantics + inert background, focus-to-input, fetch-once index, results + polite live count, zero-results announcement + clear action (Design §18.3), Escape → onClose, Arrow roving (down from input, down/up through results, up back to input), fetch-error state (cold-cache ordering documented)
- search-mount lifecycle: on-demand mount, unmount + focus-return-to-trigger, reopen, module-state isolation between jsdoms
- Gallery inline search: filter + `?q=` replaceState sync, query×subject combination, empty state + clear-search reset, `?q=` applied at hydration
- ThemeToggle (vanilla rewrite): flip/persist/pressed both directions, pre-set dark reflection

**Automated test count:** 170 total (29 new this phase; 23 files). Breakdown: matcher/normalize 11 · index-builder 2 · endpoint 1 · trigger structure 1 · SearchDialog 6 · search-mount 3 · gallery search 5 · ThemeToggle rewrite 3 · prior phases 141.

**Accessibility results:**
- Dialog contract per TAD §11.4 verified by tests: `role="dialog"` + `aria-modal`, accessible name, focus to input on open, focus trap while open, focus returned to the trigger on close, `aria-live="polite"` result counts, Escape closes.
- Results are real links — Enter activates natively; Arrow keys rove focus; the input has a real visually-hidden label (placeholder never the label).
- Empty state offers a keyboard-reachable clear action; announcements polite (no focus theft).
- Trigger carries `aria-label`, `aria-expanded`, `aria-controls`.
- Reduced motion: global block disables transitions; search has no entrance animation.
- Browser-level keyboard/screen-reader passes on the live overlay: Phase H (tracked).

**Performance results (build artifacts, gzipped):**

Budget method (standardised this phase, TD-13): eager set = real `<script type="module">`/`<link rel=stylesheet>` tags + their static import closure; island hydration chunks counted where they fire on load (client:load islands on their pages; client:media on matching viewports). Dynamic-import edges (SearchDialog, matcher on first open) excluded from eager totals.

| Route | Eager JS | Budget | CSS | Budget |
|---|---|---|---|---|
| `/` | 6.34 KB (+RecentRail hydration ≈16 KB total) | ≤20 KB ✅ | 5.12 KB | ≤15 KB ✅ |
| `/presentations` | 6.34 KB (+GalleryController hydration ≈17 KB) | ≤25 KB ✅ | 5.01 KB | ≤15 KB ✅ |
| `/presentations/[slug]` | 6.89 KB (+MobileMenu on mobile ≈8 KB) | ≤10 KB ✅ | 3.84 KB | ≤12 KB ✅ |

Search adds ≈0.3 KB per page until first open; the dialog + matcher + input then load once (index fetch included). Zero new dependencies. The Phase 2–4 detail-page overage (transitive preact from header islands, previously under-measured) is resolved by D-038.

**Responsive verification:** dialog panel min(640px,100%) with mobile top-sheet padding (≤767px, 80vh); gallery search input flex row per Design §14.2. Real-viewport E2E: Phase H.

**Browser compatibility:** jsdom + Astro build output; cross-browser matrix Phase H.

**Manual verification:** built dist inspected — `/search-index.json` emitted with correct shape; trigger present in header; dialog markup contracts confirmed in tests against real built components.

**Bugs found (this phase):**
1. Focus restored before dialog unmount → focus lost to `<body>` (fixed: post-unmount transition effect; surfaced by tests).
2. Trigger script statically imported the mount module → Preact eager on every page, detail over budget (fixed: dynamic import on click — D-038).
3. Cross-test module state leak in search-mount (stale host element across jsdoms — fixed: explicit test reset).
4. Escape dispatch raced fixed-tick waits in one test (fixed: condition-based waitFor).
5. ESLint: dialog/backdrop handler rules needed justified disables + one misplaced directive (fixed: canonical placements with rationale comments).

**Bugs fixed:** all five above. No product-code behaviour bugs escaped review; the matcher's AND semantics and scoring constants follow TAD §11.2 verbatim.

**Remaining issues:**
- Browser-level keyboard/SR pass on the overlay (Phase H).
- Search UX tuning (ranking feel) only with real content feedback (IA-2).
- TD-13: budget method standardised this phase; earlier-phase numbers were under-measured (corrected by D-038, documented).

**Overall test status:** ✅ PASS — 170/170 automated, zero regressions, all quality gates green, budgets within limits on every route.

---

## Phase 4 — Homepage / Landing Experience (Development Plan Phase E)

**Date:** 2026-08-04

**Features tested:**
- Recency library: storage discipline (missing/blocked/malformed/foreign data), dedupe + newest-first ordering, RECENCY_MAX cap, silent blocked-storage behaviour, `resolveRecentSlugs` stale-slug filtering and max parameter (Design §13.2)
- Hero: overline/name + accent dot/tagline/CTA structure and targets; axe-clean
- About/Contact teasers: labelled sections, decorative visual `aria-hidden`, Read More → /about, Get in Touch → /contact; axe-clean
- Homepage assembly: hero contract; rail renders top-3 published newest-first with quick-launch anchors to `/present` URLs; unpublished fixture excluded; "Latest Presentations" server-rendered heading; teasers' targets; initialization placeholder gone; entrance guard script present
- RecentRail island: untouched fallback without recency; reorder + heading swap with recency; stale-slug filtering; quick-launch click records recency; corrupt-data fail-safe — all waits condition-based on `data-rail-mounted` (D-036)
- Entrance-mode guard executed in jsdom: first visit → full; <30s return → reduced; >30s → full again; blocked storage → document untouched (Design §23.4)

**Automated test count:** 141 total (28 new this phase; 17 files). Breakdown: recency 13 · hero/teasers 5 · homepage page 6 · RecentRail island 5 · entrance guard 4 · prior phases 113.

**Accessibility results:**
- axe-core: zero violations on Hero, AboutTeaser, ContactTeaser, and homepage fragments.
- Keyboard: quick-launch revealed on `:focus-within` (keyboard users can reach it without hover); skip link and focus-visible rings unchanged from prior phases.
- Semantics: labelled sections (`aria-labelledby`), decorative elements `aria-hidden`, rail is a real `<ul>` list.
- ADR-0008 upheld: hero name (LCP) has no opacity animation — verified by construction (transform-only keyframes).
- No-JS: page fully static without JS (entrance gated on `html.js`); quick-launch and Present anchors are real links (I1).
- Browser-level keyboard/screen-reader passes: Phase H (tracked).

**Performance results (build artifacts, gzipped):**
- Homepage JS ≈17.4 KB (ClientRouter 5.35 + preact core 4.37 + signals/hooks/client/jsxRuntime ≈5.7 + RecentRail 0.63 + recency lib 0.34 + MobileMenu 1.38 mobile-only) ≤ 20 KB budget ✅.
- Homepage CSS 5.0 KB ≤ 15 KB ✅. No route exceeds its budget; zero new dependencies.
- Entrance animation is pure CSS — zero added JS on the critical path; LCP element unanimated in opacity (ADR-0008).

**Responsive verification:** rail horizontal scroll + snap on mobile → 2-col tablet → 3-col desktop/panel (Design §29.4); teasers stack → two-column about at 768px; hero display-lg → display-xl at 768px. Real-viewport E2E: Phase H.

**Browser compatibility:** jsdom + Astro build output; cross-browser matrix Phase H.

**Manual verification:** built `dist/index.html` inspected — hero, rail data contract (data-rail, data-slug, data-quick-launch ×3), teasers, entrance script, no placeholder shell.

**Bugs found (this phase):**
1. Detail-page recency script closed with a stray `</style>` tag (fixed: `</script>`).
2. Entrance inline script used `var`/named-empty-catch — lint failures (fixed: `const` + optional catch binding).
3. Quick-launch test raced Preact's deferred mount effect — flaky by construction (fixed properly: island exposes `data-rail-mounted`; tests wait on the marker — D-036; intermediate 100ms-sleep version replaced).

**Bugs fixed:** all three above. No product-code behaviour bugs escaped review.

**Remaining issues:**
- MOCK homepage copy + placeholder about visual until Harshit's content arrives (TD-12, D-034).
- T-D7 projector dry-run still pending (CI-1, carried from Phase 3).
- Phase H: browser-level axe/keyboard/screen-reader, real-viewport matrix, CWV field data.

**Overall test status:** ✅ PASS — 141/141 automated, zero axe violations, all quality gates green, budgets within limits, zero regressions from Phases 1–3.

---

## Phase 3 — Presentation Gallery & Engine (Development Plan Phase D)

**Date:** 2026-08-04

**Features tested:**
- URL derivation: `/present` normalization (idempotent; edit/view rewrite; query stripping), Dropbox `dl=0`/`dl=1` param handling (ADR-0012)
- Gallery sorting: Design §14.2 four options, stable comparators, title tie-break, input immutability, URL-param guard
- SubjectVisual: subject gradients, decorative `aria-hidden`, card/detail shapes and heights
- PresentationMeta: subject pill + formatted `<time>` date
- TagRow: ≤5 visible; >5 collapses to 4 + "+N more" (full list in `title`); detail mode renders all
- PresentationCard: **ADR-0007 linked-card contract** — exactly one anchor wrapping the title, no nested interactive elements, axe-clean; verified in container tests AND in the built HTML (3 cards, 1 anchor / 0 buttons each)
- ActionRow: real external anchor + `rel="noopener noreferrer"`, subtitle inside the accessible name, backup omitted when absent, slides-down → disabled Present + promoted backup
- LinkHealthAlert: slides-down warning, backup-down warning, both-down error, healthy/unknown render nothing
- Gallery route: published-only filter (an unpublished fixture is excluded), Most-Recent default order, island data contract, chips/sort/count, card hrefs
- Detail route: unlimited-line H1, breadcrumb + back link, meta, all tags, sign-in hint, launch URLs (`/present`, `?dl=0`)
- GalleryController island: sort reorder + `pushState`, subject filter + `replaceState` + aria-live status, URL params applied at hydration

**Automated test count:** 113 total (48 new this phase; 12 files). Breakdown: slidesUrl 9 · sorting 9 · components (SubjectVisual/Meta/TagRow/Card/ActionRow/LinkHealthAlert) 15 · gallery page 6 · detail page 4 · GalleryController island 4 · prior phases 65.

**Accessibility results:**
- axe-core: zero violations on PresentationCard, ActionRow, LinkHealthAlert, and rendered fragments.
- Card link accessible name = presentation title (screen-reader link lists stay meaningful).
- Gallery filter chips carry `aria-pressed`; sort has a real `<label>`/`htmlFor`; filter results announced via `role="status"` `aria-live="polite"`.
- Detail page: `<time datetime>`, breadcrumb `aria-current="page"`, decorative gradients `aria-hidden`.
- Browser-level keyboard/screen-reader pass: Phase H (tracked).

**Performance results (build artifacts, gzipped):**
- Detail route: JS 5.42 KB (ClientRouter only — no islands) ≤ 10 KB budget ✅; CSS 1.25 KB ≤ 12 KB ✅.
- Gallery route: JS ≈ 12 KB (preact core + hooks + GalleryController 1.36 KB) ≤ 25 KB ✅; CSS ≈ 4.7 KB ≤ 15 KB ✅.
- Homepage unchanged: ≈16.6 KB JS ≤ 20 KB ✅, CSS 3.4 KB ≤ 15 KB ✅.
- Zero new runtime dependencies.

**Responsive verification:** card grid `auto-fill minmax(320px, 1fr)` with panel minimums (Design §14.2/§24.4); action row stacked→inline; card padding 16→24px. Real-viewport E2E: Phase H.

**Browser compatibility:** jsdom + Astro build output. Cross-browser matrix: Phase H Playwright.

**Manual verification:** built pages inspected (dist): linked-card structure, external-link rel pairs, subtitle, breadcrumb, sign-in hint, chip/sort markup. **T-D7 projector dry-run is still pending** — it requires Harshit's real Slides/Dropbox URLs (IA-2) and physical panel access; tracked in KNOWN_ISSUES.

**Bugs found (this phase):**
1. `htmlFor` lint failure — JSX `for` attribute not recognized by jsx-a11y (fixed: `htmlFor`).
2. `dataset` on `Element` type errors in island tests (fixed: `querySelectorAll<HTMLElement>`).
3. Container limitation discovered: AstroContainer renders island **own markup** but not **slot children**, and `getCollection` returns empty — page tests would have silently asserted nothing (fixed: mock `astro:content` at the boundary; loader behaviour covered by build + schema tests).
4. Assertion-format mismatches (style serialization whitespace; text-node whitespace) — test-side fixes only.

**Bugs fixed:** all four above. No product-code behaviour bugs escaped review (the linked-card pattern, URL derivation, and health-state logic were test-driven).

**Remaining issues:**
- T-D7 projector dry-run pending (real content + hardware required).
- TD-11 tablet dropdown auto-close (carried from Phase 2).
- Mock seed content in the repo until Harshit's decks arrive (D-029).
- Phase H: browser-level axe/keyboard/screen-reader, real-viewport responsive matrix, RUM.

**Overall test status:** ✅ PASS — 113/113 automated, zero axe violations, all quality gates green (typecheck 0/0/0, ESLint 0, Stylelint 0, build clean), budgets within limits.

---

## Phase 2 — Chrome & Frame (Development Plan Phase C)

**Date:** 2026-08-04 *(retroactive entry — TEST_REPORT.md introduced in Phase 3)*

**Features tested:** theme utilities (storage discipline, ADR-0011 panel query, FOUC initial-theme rule); focus trap (Tab/Shift+Tab edge wrapping, stray-focus recovery, deactivation); Header/Footer/BaseLayout structure (brand, nav landmark, tablet dropdown, `aria-current`, composition order); FOUC guard executed under simulated storage/panel conditions (light default, dark applied, panel-forced light, blocked-storage fail-safe, blocking position before stylesheets); MobileMenu (open/close via pointer, Escape, close button, focus-trap cycling both directions, inert + scroll lock, focus return to trigger, `aria-expanded`/`aria-controls`); ThemeToggle (flip + persistence + pressed/label both directions, pre-hydration dark state).

**Automated test count:** 65 total (33 new this phase).

**Accessibility results:** zero axe violations at component level; focus trap + focus-return + Escape verified by tests (WCAG 2.1.2/2.4.3); `aria-modal` dialog semantics; inert background; ThemeToggle hidden (not merely invisible) on panels and without JS; no-JS navigation preserved (I1/D-024).

**Performance results:** homepage JS ≈16.6 KB gz desktop (≈18 KB mobile incl. MobileMenu chunk) ≤ 20 KB ✅; CSS 3.4 KB ≤ 15 KB ✅; MobileMenu ships only under 768px (`client:media`); ThemeToggle `client:idle` off the critical path.

**Responsive verification:** desktop/tablet/mobile nav switching implemented per Design §29.4 (inline → "More" dropdown → island menu); breakpoints structural; real-viewport E2E deferred to Phase H.

**Browser compatibility:** jsdom + Astro build output; cross-browser matrix Phase H.

**Manual verification:** built HTML inspected (chrome markers, FOUC script, island hydration directives).

**Bugs found:** fixed-tick flushes raced Preact's deferred render/effect scheduling (flaky focus/inert assertions); container lacked the Preact server renderer (`NoMatchingRenderer`).
**Bugs fixed:** condition-based `waitFor` (D-025); renderer registration in the container helper.

**Remaining issues:** TD-11 dropdown auto-close; browser-level a11y passes (Phase H).

**Overall test status:** ✅ PASS — 65/65 automated, zero axe violations, all gates green.

---

## Phase 1 — Shared Primitives & Design System (Development Plan Phase B)

**Date:** 2026-08-04 *(retroactive entry — TEST_REPORT.md introduced in Phase 3)*

**Features tested:** content schema contract (Gate 1: malformed date `"2026-13-45"` rejected; Slides URL pattern + `/present` suffix; Dropbox host; required `published`; subject enum; tag/title bounds); Button polymorphism (anchor with `href`, button without, disabled-link semantics, external rel, subtitle-in-name, decorative icons); IconButton mandatory accessible name; Tag variant matrix; Alert roles (error=`alert`, others=`status`); EmptyState structure; Skeleton shapes; Breadcrumb truncation + `aria-current`; SectionOverline/VisuallyHidden/SkipLink; BaseLayout shell (light default, FOUC guard presence, skip link, title format).

**Automated test count:** 32 total (10 schema + 22 component).

**Accessibility results:** axe-core zero violations per primitive; mandatory labels enforced at the type level (IconButton); focus ring token verified (Design §25.1 ratios).

**Performance results:** fonts self-hosted (latin subset, swap, metric-adjusted fallbacks); exactly two first-paint preloads (Inter 400, PJS 800); zero-JS primitives.

**Responsive verification:** primitive-level only (chrome/pages arrived in Phase 2).

**Browser compatibility:** jsdom + Astro build output.

**Manual verification:** built HTML inspected (font-face count 13 incl. fallbacks, skip link, FOUC script).

**Bugs found:** container renderer registration for islands (pre-empted the Phase 2 fix); `MediaQueryList` cast incompleteness; unused `@ts-expect-error`.
**Bugs fixed:** all three.

**Remaining issues:** loading-state spec lives in Design v1 (TD-10).

**Overall test status:** ✅ PASS — 32/32 automated, zero axe violations, all gates green.
