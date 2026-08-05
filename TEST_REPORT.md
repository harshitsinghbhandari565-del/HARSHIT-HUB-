# Test Report

Permanent testing history of the project. Entries are appended per phase, never overwritten.

Methodology notes (apply to all entries):

- Automated suites run in Vitest; `.astro` components render through the Astro Container API; Preact islands render into jsdom and are exercised with real DOM events.
- Accessibility automation is axe-core at two layers: component level (Container API) and, since Phase H, **site-wide over the built output** (`tests/a11y/`, every page × both themes). Colour contrast returns "incomplete" under jsdom (no visual rendering) and is covered by the Design §25.1 token table plus a real-browser manual pass (RELEASE_CHECKLIST). Screen-reader passes remain manual (no headless SR exists).
- Performance evidence is build-artifact measurement (gzipped route assets) against TAD §14.1 budgets — **automated as a build gate since Phase H** (`scripts/budgets.mjs`, TD-13 method); lab Lighthouse and field RUM require deploy previews / real traffic (post-launch).
- Responsive behaviour is implemented per Design §24/§29.4 breakpoint specs and verified structurally; real-viewport verification is a post-launch activity (Playwright deferred — FI-2).

---

## Content Update — first real presentation: "Indigo (Chapter 5)"

**Date:** 2026-08-06 (content-only change; no architecture/UI/design changes)

- Replaced the `poetry-of-the-romantics` mock with `src/content/presentations/indigo-chapter-5.json` (subject English, 9 tags, published). Subject mapped to the existing enum value `English` — "English Reader" carried as a tag (adding an enum value would be a schema change, out of scope). Slides URL stored in the schema-required `/present` form (deck id `1Ce8sDcOjx-bY1F7mSpOonBKvUS8JsGvB`); Dropbox backup keeps its `rlkey`/`st` params with `dl=0` preview (ADR-0012). Description stored plain-text (414 chars ≤ 500; Markdown emphasis markers removed).
- **Validation:** Zod content contract passed at build (invariant I5); full rebuild clean (12 pages).
- **Verification:** gallery card + subject filter attribute render; detail page h1/description/Present/Backup correct; search index entry correct; matcher re-probed on the real index — title (full/partial), subject, single-word tags, and multi-word-tag leading-word prefixes all find it; second-word-only queries ("gandhi", "fischer") and full multi-word phrases score zero **by approved design** (TAD §11.2: tag exact/prefix per token, AND across tokens); descriptions are not indexed by design; sitemap/JSON-LD updated automatically (CollectionPage newest-first, PresentationDigitalDocument + BreadcrumbList valid, escape-safe). One content-coupled integration assertion (ItemList first item) updated to the new newest deck.
- **External links:** Slides `/present` verified live (18-slide Indigo deck, exact content match); Dropbox preview verified live (Indigo_Presentation.pptx, shared by the owner). Full in-browser launch remains the T-D7 panel dry-run.
- **Gates after the change:** 250/250 tests · typecheck 0/0/0 · ESLint 0 · Stylelint 0 · budgets OK · CSP regenerated + in sync · robots/link-check/audit OK.
- No schema fields added: the schema has no display-title or thumbnail fields; the subject-visual fallback renders unchanged (as instructed, no new thumbnail).

---

## Phase 7 — Hardening & Release Candidate (Development Plan Phase H)

**Date:** 2026-08-05

**Scope:** quality, not features. Whole-project audit + Phase H gates (T-H1 a11y, T-H2 security/CSP, T-H3 budgets, T-H4 ops docs), plus the fix wave the audit triggered.

**Bugs found by the audit (all fixed):**
1. Vitest reported 2 unhandled errors in search-mount (deferred Preact effect + re-render firing after jsdom teardown) — exit code 1, masks real failures. Tests now settle observable markers before finishing + afterEach timer flush.
2. **ClientRouter swaps broke the chrome** — Astro's router replaces the whole `<body>` and skips scripts whose content already ran; element-bound listeners (theme toggle, search trigger, header scroll) died after the first navigation, and swapped-in toggles showed stale theme state. Fixed via document-level delegation + `astro:after-swap` re-sync (D-044). Covered by the new navigation-resilience suites.
3. **TAD §15.4 focus management absent** — route changes never moved focus or announced the page. Added `astro:page-load` handler (focus → new h1/main, title announced via polite live region; initial load untouched). 4 dedicated tests.
4. **Detail route over its 10 KB budget at mobile widths** (15.0 KB): MobileMenu `client:media` hydration carried Preact onto every island-free route. Rewritten vanilla (identical markup/styles/Gate-2 contract) → 7.8 KB; island-free pages 14.5 → 7.2 KB. MobileMenu suite rewritten (now synchronous — no timer races).
5. **Gallery heading-order (WCAG 1.3.1)** — h1 → h3 skip found by the new site-wide axe scans; fixed via PresentationCard `headingLevel` (D-046).
6. Entrance script never re-ran on SPA returns home → `data-astro-rerun` (Design §23.4 time logic restored); asserted in entrance.test.ts.

**New automated coverage (60 new tests → 250 total, 32 files):**
- `tests/a11y/site-wide.test.ts` — every built page × light/dark under axe (wcag2a/2aa/22aa + best-practice): **24 scans, zero violations**. Skips cleanly when dist/ absent; CI runs it post-build.
- Navigation resilience: ThemeToggle swap re-sync + delegated click; MobileMenu open/close after a simulated swap.
- `search-trigger.test.ts` — delegation, post-swap behaviour, non-trigger clicks (search-mount mocked at the module boundary).
- `nav-a11y.test.ts` — initial-load no-steal, focus + announce on navigation, main fallback, announcer recreation across swaps.
- `robots.test.ts` — production/preserve/preview-rewrite/self-heal/fail-closed over the real script.
- `tests/unit/seo/jsonld.test.ts` — JSON-LD builders + serializer safety (hostile `</script>` payloads, parser transparency).
- `tests/integration/seo.test.ts` — built-output checks for canonical/OG/Twitter/robots and JSON-LD validity/drift (TAD §17.2/§17.3).

**Quality gates (all green):**

| Gate | Result |
|---|---|
| Typecheck (astro check) | 0 errors / 0 warnings / 0 hints |
| ESLint | 0 (incl. new Node-globals block for scripts/) |
| Stylelint | 0 |
| Vitest | **250/250**, 0 unhandled errors |
| Build | clean — 12 pages + /search-index.json |
| CSP sync (`generate-csp.mjs --check`) | in sync (8 script / 15 style hashes) |
| Performance budgets (`budgets.mjs`) | all routes within TAD §14.1 |
| Internal link health (`link-check.mjs`) | all resolve; noopener verified; sitemap ↔ pages exact |
| Supply-chain audit (`audit.mjs`) | green with 4 documented allowlisted advisories |
| robots policy | production valid; previews → Disallow (TD-4) |

**Performance results (build artifacts, gzipped, TD-13 method):**

| Route | Eager JS | Budget | CSS | Budget |
|---|---|---|---|---|
| / | 14.83 KB | ≤20 ✅ | 7.70 KB | ≤15 ✅ |
| /presentations | 16.75 KB | ≤25 ✅ | 7.24 KB | ≤15 ✅ |
| /presentations/[slug] | 7.78 KB | ≤10 ✅ | 6.51 KB | ≤12 ✅ |
| /about, /contact, placeholders, errors | 7.24 KB | ≤15 ✅ | 5.52–6.09 KB | ≤12 ✅ |

/contact `client:visible` hydration (+8.23 KB) fires on scroll and is reported separately — TD-14 resolved under the TD-13 method (D-043).

**Accessibility results:**
- 24/24 site-wide axe scans clean (both themes, full WCAG 2.0–2.2 AA + best-practice rulesets).
- Route-change focus + title announcement implemented and tested (TAD §15.4).
- Colour contrast: incomplete under jsdom by design — real-browser verification on the first deploy preview (RELEASE_CHECKLIST); token pairs follow Design §25.1.
- Manual keyboard-only + screen-reader passes: RELEASE_CHECKLIST (requires human + hardware).

**Security results (T-H2):**
- Strict CSP enforced via netlify.toml: hash-allowlisted inline scripts/styles, no unsafe-inline, `frame-ancestors 'none'`, TAD §19.3 directive set (D-042). Generator verifies preconditions (no inline handlers / cross-origin resources / frames).
- Headers: HSTS, nosniff, Referrer-Policy, Permissions-Policy (Phase 1) + CSP (this phase).
- Supply chain: audit gate + Dependabot + lockfile CI installs (TAD §19.6). Known benign: ClientRouter `data:` probe blocked by design (CI-4).
- No secrets (I3), no set:html, noopener lint-enforced, honeypot per TAD §15.6 — all re-verified.

**Remaining manual / deploy-dependent items:** RELEASE_CHECKLIST (CSP report-only verification on first preview, rollback rehearsal, live form submission, Lighthouse/CWV, real-viewport matrix, panel theme-lock, VoiceOver, contrast spot-check, T-D7 projector dry-run).

**Overall test status:** ✅ PASS — 250/250 automated, zero unhandled errors, every quality gate green, all TAD §14.1 budgets met, zero axe violations across the built site in both themes, TAD §17.2/§17.3 metadata + structured data verified on the built output.

---

## Phase 6 — Remaining Pages & Error Layouts (Development Plan Phase G)

**Date:** 2026-08-05

**Features tested:**
- About page: content-layer composition via `render(entry)` (fixture component), decorative visual `aria-hidden`, breadcrumb
- Contact page: Netlify form contract (data-netlify / netlify-honeypot / hidden form-name / POST), real labels for all three fields, honeypot off-screen + `aria-hidden` + `tabindex="-1"`, exact privacy microcopy, mailto details
- ContactForm island: empty-submit validation with focus-to-first-invalid + `aria-invalid`/`aria-describedby`; invalid-email rejection; success state with the exact Design §11.10 copy and `form-name` in the POST body; error state preserving entered values; disabled-while-submitting (fetch mocked at the network boundary)
- Coming Soon ×3: Coming Soon state + Back-to-Home recovery + `noindex, follow`
- 404/500: friendly copy, Home/Presentations recovery paths, no leaked internals

**Automated test count:** 190 total (20 new this phase; 26 files). Breakdown: About 2 · Contact page 4 · ContactForm island 5 · Coming Soon 6 · 404/500 3 · prior phases 170.

**Accessibility results:**
- Contact form: every field has a real programmatic label; validation errors are linked via `aria-describedby` with focus moved to the first invalid field; honeypot excluded from the a11y tree and tab order.
- Coming Soon / error pages: heading hierarchy intact, recovery links real anchors, noindex pages excluded from nav.
- axe-core: zero violations across all new rendered surfaces.
- Manual keyboard / screen-reader passes on the new pages: Phase H (tracked in RELEASE_CHECKLIST).

**Performance results (build artifacts, gzipped):**

| Route | Eager JS | Budget | + island hydration | CSS | Budget |
|---|---|---|---|---|---|
| /about | 6.34 KB | ≤15 ✅ | +8.84 KB (chrome only) | 3.43 KB | ≤12 ✅ |
| /contact | 6.34 KB | ≤15 ✅ | +10.44 KB (ContactForm) | 3.43 KB | ≤12 ✅ |
| /projects (et al.) | 6.34 KB | ≤15 ✅ | +8.84 KB | 3.43 KB | ≤12 ✅ |
| /404 | 6.34 KB | ≤15 ✅ | +8.84 KB | 3.43 KB | ≤12 ✅ |

Eager budgets met on every route. Contact's effective load with ContactForm hydration ≈16.8 KB vs the 15 KB budget: the overage is Preact itself (required by the designed form island); tracked as TD-14 for the Phase H budget review.

**Responsive verification:** contact form max-width 560px (Design §11.10); about two-column from 768px (Design §24.2); placeholders/errors centred grids. Real-viewport matrix: Phase H.

**Browser compatibility:** jsdom + Astro build output; cross-browser matrix Phase H.

**Manual verification:** built dist inspected — 13 routes + /search-index.json generated; sitemap contains exactly the 7 indexable URLs; noindex verified in the built HTML of the three placeholders; 404.html + 500.html emitted.

**Bugs found (this phase):**
1. `entry.render()` does not exist in Astro 6 — correct API is `render(entry)` from `astro:content` (fixed; D-040).
2. Sitemap filter missed trailing-slash URLs — placeholders leaked into the sitemap (fixed: match both forms).
3. jsdom test environment: Node's undici `FormData` rejects jsdom forms (fixed: jsdom FormData stub, documented in the test).
4. Test assertion false-positive: "no internals" check matched the `--font-inter-stack` variable name (fixed: stack-trace-pattern assertion).
5. Vitest typing: untyped fetch spies broke `mock.calls` tuple access (fixed: typed stubs).

**Bugs fixed:** all five above (four test/tooling-side, one build-config). No product-code behaviour bugs escaped review.

**Remaining issues:**
- Contact hydration budget nuance (TD-14) — Phase H budget review.
- Manual keyboard/SR passes + WCAG 2.2 AA audit both themes — Phase H.
- Live Netlify form submission test requires a deployed site — Phase H / go-live.

**Overall test status:** ✅ PASS — 190/190 automated, zero regressions, all quality gates green, eager budgets within limits on every route.

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
