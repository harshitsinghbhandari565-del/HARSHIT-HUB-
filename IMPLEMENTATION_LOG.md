# Implementation Log

Chronological implementation history. Entries are appended, never replaced.

---

## 2026-08-05 — Phase 7: Hardening & Release Candidate (Development Plan Phase H)

### Objectives

Final engineering phase — no new product features. Complete Dev Plan Phase H (T-H1 accessibility audits, T-H2 security headers & CSP, T-H3 budget audit & performance, T-H4 final artifact delivery), plus a whole-project engineering audit: dead/duplicated code, navigation correctness, performance, accessibility, security, content placeholders, and documentation.

### Work completed

- **Engineering audit findings (all fixed unless noted):**
  1. Vitest reported 2 unhandled errors in the search-mount suite (deferred Preact work firing after jsdom teardown) — this fails the run (exit 1) and could mask real failures. Fixed by settling observable markers before teardown + an afterEach timer flush.
  2. **ClientRouter navigation broke the chrome** (found by code audit of Astro's router: it swaps the whole `<body>` and does NOT re-run scripts whose content already ran, so element-bound listeners die after the first navigation): ThemeToggle, search trigger, and header scroll-shadow all stopped working after the first SPA navigation; swapped-in toggles showed stale theme state. Fixed with document-level delegation + `astro:after-swap` re-sync (D-044).
  3. **TAD §15.4 focus management was unimplemented** — client-side navigation never moved focus or announced the page. Added the `astro:page-load` handler: focus to the new h1/main + polite live-region title announcement (initial load untouched).
  4. **/presentations/[slug] was over its 10 KB TAD §14.1 JS budget at mobile widths** (15.0 KB): the MobileMenu Preact island (`client:media`) dragged ~8 KB of Preact onto every island-free route. Rewrote MobileMenu as a vanilla bundled script — identical markup, styles, and Gate-2 a11y contract; detail route now 7.8 KB, island-free pages 14.5 → 7.2 KB (D-044).
  5. **Gallery heading-order axe violation** (h1 → h3 skip): PresentationCard gained a `headingLevel` prop (gallery uses h2; homepage rail keeps h3).
  6. Entrance script now carries `data-astro-rerun` so the full/reduced mode is re-decided on SPA returns home (Design §23.4 time logic).
- **Security (T-H2):** strict CSP enforced via `netlify.toml` — build-time generator hashes every inline script/style across all pages (`scripts/generate-csp.mjs`), no `unsafe-inline`, exact TAD §19.3 directive set incl. `frame-ancestors 'none'`; preconditions verified (no inline handlers, no cross-origin resources); netlify.toml treated as a lockfile with a CI drift check (D-042).
- **Performance (T-H3):** build-time budget gate (`scripts/budgets.mjs`) — TD-13 method, all TAD §14.1 limits, fails the build on overage; client:visible hydration reported separately (TD-14 resolved: /contact eager 7.24 KB ≤ 15).
- **Supply chain (TAD §19.6):** `scripts/audit.mjs` — npm audit at high/critical fails CI; 4 advisories allowlisted with exploitability rationales; stale entries fail the gate. Dependabot configured (weekly, grouped minor/patch).
- **Accessibility (T-H1):** site-wide axe suite over the BUILT site — every page × both themes (24 scans) in CI; contrast remains manual (jsdom limitation, documented).
- **Ops (T-H4 + TD-4 + FI-1 + FI-4):** `docs/ADDING-A-PRESENTATION.md`, `docs/RUNBOOK.md`; environment-aware robots.txt (previews → `Disallow: /`, production validated + smoke-tested, Sitemap directive added); internal link health script + weekly workflow; ADR-0001…0012 migrated verbatim from TAD §23 into `docs/adr/`.
- **Tests:** 190 → 233 (29 files): MobileMenu vanilla suite, navigation-resilience suites, search-trigger delegation, nav focus/announce handler, robots smoke tests, entrance rerun assertion, 24 site-wide axe scans.

### Files created

`scripts/{generate-csp,budgets,audit,link-check,robots}.mjs` · `src/shared/lib/{mobileMenu,navA11y}.ts` · `src/features/search/lib/search-trigger.ts` · `src/shared/components/MobileMenu.astro` · `tests/a11y/site-wide.test.ts` · `tests/unit/components/nav-a11y.test.ts` · `tests/unit/search/search-trigger.test.ts` · `tests/unit/tooling/robots.test.ts` · `docs/{ADDING-A-PRESENTATION,RUNBOOK}.md` · `docs/adr/ADR-0001…0012` · `.github/{dependabot.yml,workflows/link-check.yml}`

### Files modified

`netlify.toml` (CSP block + robots build step) · `eslint.config.js` (Node globals for scripts/) · `vitest.config.ts` (a11y include) · `.github/workflows/ci.yml` (hardened gates) · `src/shared/layouts/BaseLayout.astro` (nav a11y script, vanilla MobileMenu) · `src/features/theme/lib/theme.ts` (delegation + swap re-sync) · `src/features/search/islands/SearchOverlay.astro` · `src/shared/components/Header.astro` (swap-proof scroll handler) · `src/pages/index.astro` (entrance rerun) · `src/features/presentations/components/PresentationCard.astro` + `src/pages/presentations/index.astro` (heading levels) · `public/robots.txt` · `tests/unit/components/islands.test.tsx` (rewritten) · `tests/unit/search/search-mount.test.tsx` (teardown hygiene) · `tests/unit/home/entrance.test.ts` · `docs/adr/README.md` · permanent docs

### Files removed

`src/shared/components/MobileMenu.tsx` + `MobileMenu.module.css` (vanilla rewrite, D-044)

### Commits made

`test(hardening)` → `feat(security): CSP` → `fix(chrome): navigation resilience + focus management + vanilla MobileMenu` → `fix(a11y): heading order` → `test(a11y): site-wide axe` → `feat(perf): budget gate` → `feat(ops): robots/audit/link/ADR` → `ci(phase-h)` → `docs`. See `git log`.

### Decisions

D-042 (hash-union header CSP via build-time generator — Astro's `security.csp` is incompatible with ClientRouter) · D-043 (budget gate: TD-13 method enforced at build; client:visible deferred hydration reported, not gated — TD-14 resolution) · D-044 (navigation hardening family: delegation, after-swap re-sync, page-load focus/announce, vanilla MobileMenu, entrance rerun) · D-045 (supply-chain audit gate with rationale allowlist) · D-046 (PresentationCard headingLevel prop for heading-order).

### Assumptions

- Phase 7 ≙ Development Plan Phase H (established numbering convention).
- Playwright E2E and real Lighthouse CI runs are deploy/hardware-dependent — substituted by the jsdom journey suites + build-time gates + manual checklist items (RELEASE_CHECKLIST), consistent with FI-2/FI-3 deferral discipline.
- CSP enforcement ships with a documented report-only verification step for the first deploy preview (RUNBOOK §5) per TAD deployment discipline.

### Outstanding work

- **Go-live tasks (owner/deploy-dependent):** first deploy + CSP report-only verification, rollback rehearsal, live contact-form submission, Lighthouse/CWV on the real deploy, real-viewport matrix, panel theme-lock verification, VoiceOver pass, WCAG contrast spot-check in a real browser.
- **CI workflow commits held locally** — GitHub App lacks the `workflows` permission (since Phase 3).
- Real content (IA-2); T-D7 projector dry-run. See RELEASE_CHECKLIST.

---

## 2026-08-05 — Phase 6: Remaining Pages & Error Layouts (Development Plan Phase G)

### Objectives

Deliver the remaining pages per Dev Plan Phase G: T-G1 About (long-form content from the content layer), T-G2 Contact (Netlify form + honeypot + island enhancement), T-G3 Coming Soon placeholders (noindex, out of nav), T-G4 404/500 recovery layouts — plus the two new tracking documents (RELEASE_CHECKLIST.md, PROJECT_STATUS.md).

### Work completed

- **About page (T-G1):** `content/site/about.md` as the new `about` collection; rendered via the Astro 6 `render(entry)` API (D-040) with `:global` prose styling under a page-local namespace; decorative profile visual placeholder; breadcrumb. Copy is a labelled mock (IA-2).
- **Contact page (T-G2):** Netlify form first (`data-netlify` + `netlify-honeypot` + hidden `form-name`) — submits without JS (I1); ContactForm island (client:visible) adds inline validation with focus-to-first-invalid (`aria-invalid` + `aria-describedby`), async submission, the exact Design §11.10 success copy, an error alert preserving entered values, and privacy microcopy; honeypot off-screen + aria-hidden + tab-skipped (TAD §15.6, D-041); labelled mock email (IA-2 / OQ-4).
- **Coming Soon (T-G3):** /projects, /certificates, /resume exist (no dead URLs), render the Design §18.4 state (EmptyState + coming-soon Tag + Back to Home), stay out of nav (Design §28.2), carry `noindex, follow` (TAD §6.4); BaseLayout gained a `noindex` prop; sitemap filter excludes the three placeholders (TAD §17.4) — verified in the built sitemap (7 URLs).
- **Error pages (T-G4):** 404 with friendly copy + Home/Presentations recovery (real 404 status, noindex); 500 with recovery path and no internals (TAD §16.6).
- **Tracking documents:** RELEASE_CHECKLIST.md (9 sections, status/notes/date per item) and PROJECT_STATUS.md (live snapshot) created; will be maintained through Phase H.
- **Tests:** 20 new (190 total) — About composition, Contact form contract + labels + honeypot + privacy, ContactForm island interactions (validation/focus, success/error/submitting), Coming Soon ×3 structure + noindex, 404/500 copy + recovery.

### Files created

`src/content/site/about.md` · `src/pages/about.astro` · `src/features/contact/islands/ContactForm.tsx` (+ module css) · `src/features/contact/index.ts` · `src/pages/contact.astro` · `src/pages/{projects,certificates,resume}.astro` · `src/pages/{404,500}.astro` · `tests/fixtures/MockAboutContent.astro` · `tests/unit/pages/{about-contact,coming-soon-errors,contact-form}.test.tsx` · `RELEASE_CHECKLIST.md` · `PROJECT_STATUS.md`

### Files modified

`src/content.config.ts` (about collection) · `src/shared/config/site.ts` (mock email constant) · `src/shared/layouts/BaseLayout.astro` (noindex prop) · `astro.config.mjs` (sitemap filter) · permanent docs

### Commits made

`feat(about)` → `feat(contact)` → `feat(pages): Coming Soon + noindex + sitemap filter` → `feat(pages): 404 + 500` → `test: Phase G suite` → `docs`. See `git log`.

### Decisions

D-040 (About via render(entry) + :global prose styles) · D-041 (Contact = Netlify form first, island enhances; honeypot per TAD §15.6).

### Assumptions

- PRD OQ-4 assumption holds: contact = email + form; socials join when provided.
- About/Contact/placeholder copy is mock-labelled pending IA-2; replacement is content-only (I4).
- The 500 page is a documented fallback; the host's own 500 applies where the platform serves it on a static deploy.
- Phase 6 ≙ Development Plan Phase G (established numbering convention).

### Outstanding work

- **Phase 7 ≙ Dev Plan Phase H:** WCAG 2.2 AA audit both themes, manual keyboard/SR passes, CSP report-only→enforce, Lighthouse CI budgets, Playwright E2E journeys, link-check workflow, ADDING-A-PRESENTATION.md + RUNBOOK.md, rollback rehearsal, go-live prep.
- Real content (IA-2): decks, tagline/teasers, About bio, contact email/socials, profile image.
- T-D7 projector dry-run (needs content + panel).
- Contact budget nuance tracked in KNOWN_ISSUES (TD-14).

---

## 2026-08-04 — Phase 5: Global Search Experience (Development Plan Phase F)

### Objectives

Deliver search per Dev Plan Phase F: T-F1 build-time index endpoint, T-F2 scored matcher, T-F3 SearchOverlay island (focus trap, arrow roving, live announcements) — plus the gallery's inline search surface (TAD §11.3: two surfaces, one matcher) and the header trigger wired into the global chrome. Fast, keyboard-accessible, progressively enhanced, within TAD §14.1 budgets, zero new dependencies.

### Work completed

- **Matcher core (T-F2):** normalize (lowercase/diacritics/whitespace) + tokenize; hand-rolled scored matcher with TAD §11.2 semantics (AND across tokens; title 100/60/40, subject 30, tag 25/15; score desc → date desc); `docMatches` shares the semantics with the gallery filter; index builder maps published entries to shortened-key docs.
- **Index endpoint (T-F1):** `/search-index.json` generated from the PUBLISHED collection at build time — static, cached (netlify.toml already configured), descriptions excluded, zero runtime dependencies.
- **SearchOverlay (T-F3):** plain header trigger + on-demand dialog (D-038). First click dynamically imports Preact + SearchDialog, so pages nobody searches from pay ~0.3 KB instead of ~10 KB. The dialog implements the full TAD §11.4 contract: dialog semantics + inert background, focus to input, focus trap, Arrow roving over real result links, Escape/close with focus returned to the trigger, polite live counts, Design §18.3 empty state with clear action, graceful fetch-error state. Index fetched once, cached in memory.
- **Gallery inline search (D-039):** GalleryController owns all gallery state (single-writer URL sync, I6): SearchInput filters the pre-rendered cards via data attributes + the shared matcher, `?q=` replaceState sync (TAD §10.2), URL params applied at hydration, 250ms debounce, empty state with clear-search reset.
- **ThemeToggle vanilla conversion (D-038):** Phase 2's Preact island became a vanilla bundled script (wiring in `lib/theme.ts` `initThemeToggle`) — removes the Preact runtime from island-free pages. Behaviour unchanged (flip/persist/aria-pressed/panel-hidden).
- **Budget compliance restored:** with on-demand search + vanilla toggle, eager JS is homepage 6.34 KB ≤20, gallery 6.34 KB ≤25, detail 6.89 KB ≤10 KB (measurement method in TEST_REPORT.md; includes mobile island hydration the detail page stays under budget even counting MobileMenu).
- **Tests:** 29 new (170 total) — matcher/normalizer, index builder, endpoint, trigger structure, dialog behaviour, mount lifecycle, gallery search, ThemeToggle rewrite.

### Files created

`src/features/search/lib/{normalize,matcher,index-builder}.ts` · `src/pages/search-index.json.ts` · `src/features/search/islands/{SearchOverlay.astro,search-mount.ts,SearchDialog.tsx,SearchDialog.module.css,SearchInput.tsx,SearchInput.module.css}` · `src/features/search/index.ts` · `src/features/theme/islands/ThemeToggle.astro` · `tests/unit/search/{matcher,index-builder,search-index-endpoint,search-overlay,search-mount,gallery-search}.test.tsx`

### Files modified

`src/features/presentations/islands/GalleryController.tsx` (+ module css — inline search) · `src/pages/presentations/index.astro` (data-slug/data-tags) · `src/features/theme/lib/theme.ts` (initThemeToggle) · `src/features/theme/index.ts` · `src/shared/layouts/BaseLayout.astro` (vanilla controls, no hydration directives) · `tests/unit/components/islands.test.tsx` (ThemeToggle rewrite) · permanent docs

### Files deleted

`src/features/theme/islands/ThemeToggle.tsx` + `ThemeToggle.module.css` (replaced by the Astro component, D-038)

### Commits made

`feat(search): matcher/normalizer/index builder (T-F2)` → `feat(search): index endpoint (T-F1)` → `feat(search): overlay on-demand + vanilla ThemeToggle (T-F3, D-038)` → `feat(search): gallery inline search (D-039)` → `test: Phase F suite` → `docs`. See `git log`.

### Decisions

D-037 (SearchInput is a shared sub-component of its owning island — single hydration owner per surface) · D-038 (on-demand search dialog + vanilla ThemeToggle for budget compliance) · D-039 (gallery search lives inside GalleryController — single-writer URL sync).

### Assumptions

- TAD §11.2 scoring constants and AND semantics implemented verbatim (no tuning without evidence).
- Gallery query param is `q` (TAD §10.2 names it); sort/subject params carried over from Phase D.
- Search trigger present on all pages (global header per TAD §11.3), including detail pages.
- Phase 5 ≙ Development Plan Phase F (established numbering convention).

### Outstanding work

- **Phase 6 ≙ Dev Plan Phase G:** About + Contact pages (+ Netlify Forms + honeypot), Coming Soon routes, 404/500.
- Real content (IA-2) still pending — affects search only by populating the index.
- Phase H: browser-level a11y (keyboard/SR passes on the overlay), E2E search journeys, CWV field data.

---

## 2026-08-04 — Phase 4: Homepage / Landing Experience (Development Plan Phase E)

### Objectives

Deliver the homepage per Dev Plan Phase E: T-E1 Hero with optimized LCP and entrance choreography, T-E2 RecentRail island with client-side recency (Design §13.2 dual strategy), T-E3 About/Contact teaser blocks — assembling the systems built in prior phases rather than rebuilding any of them.

### Work completed

- **Recency foundation:** `features/presentations/lib/recency.ts` — validated per-visitor launch history (newest-first, deduped, capped at 5, corrupt data discarded, blocked storage no-op) + `resolveRecentSlugs` for the rail (Design §13.2; TAD §10.4 no-flicker rule).
- **Homepage copy constants (D-034):** labelled MOCK tagline + about/contact teasers in `site.ts` until Harshit's real words arrive (IA-2) — content-driven, replacement is a config edit.
- **Hero (T-E1):** Design §11.7 composition — overline, brand name with accent period, tagline, CTA row with the U2 hierarchy fix (View Presentations at primary height, Electric Blue reserved for Present). Entrance choreography per Design §23.4 + ADR-0008 (D-032): `html.js` + `data-entrance` gating, hero name transform-only (LCP paints frame one), full vs reduced mode decided by an inline sessionStorage-timestamp guard in the head slot, no-JS fully static (I1).
- **Quick-launch + recency recording (D-033):** rail-only quick-launch on PresentationCard — sibling anchor layered above the hit-area overlay (ADR-0007 rule 3), desktop hover + keyboard focus-within only, real anchor (works no-JS); RecentRail records launches on click; detail page records via a small deferred script (Design §29.3, progressive enhancement).
- **RecentRail island (T-E2):** client:load enhancement of the server-rendered rail: untouched "Latest" fallback without recency; reorder + heading swap with validated recency; stale slugs dropped; DOM ownership after mount (D-030); deterministic `data-rail-mounted` marker (D-036).
- **Teasers (T-E3):** AboutTeaser (labelled section, decorative placeholder visual until the profile image arrives, Read More → /about) + ContactTeaser (Get in Touch → /contact), in shared/components as content-agnostic composition (D-035).
- **Homepage assembly:** index.astro replaces the initialization shell — **TD-1 resolved**. Rail entrance stagger (550ms heading, cards from 600ms/80ms steps) dropped automatically when the island reorders.
- **Tests:** 28 new (141 total) — recency lib, Hero/teasers, homepage page (content boundary mocked, D-028), RecentRail island interactions, entrance guard executed in jsdom.

### Files created

`src/features/presentations/lib/recency.ts` · `src/shared/components/Hero.astro` · `src/shared/components/AboutTeaser.astro` · `src/shared/components/ContactTeaser.astro` · `src/features/presentations/islands/RecentRail.tsx` (+ module css) · `tests/unit/presentations/recency.test.ts` · `tests/unit/home/{homepage,hero,entrance}.test.ts` · `tests/unit/home/recent-rail.test.tsx`

### Files modified

`src/shared/config/site.ts` (MOCK copy constants) · `src/features/presentations/components/PresentationCard.astro` (quick-launch) · `src/pages/presentations/[slug].astro` (recency recording script) · `src/pages/index.astro` (full homepage, placeholder replaced) · permanent docs

### Commits made

`feat(home): recency lib + copy` → `feat(home): Hero (T-E1)` → `feat(presentations): quick-launch + recency recording` → `feat(home): RecentRail (T-E2)` → `feat(home): teasers + assembly (T-E3, TD-1)` → `test: Phase E suite` → `docs`. See `git log`.

### Decisions

D-032 (entrance gating mechanism; transform-only name) · D-033 (quick-launch sibling anchor + enhancement-only recording) · D-034 (labelled MOCK copy constants) · D-035 (homepage sections in shared/components; RecentRail in features/presentations) · D-036 (data-rail-mounted marker for deterministic tests).

### Assumptions

- Homepage copy constants stay labelled MOCK until Harshit's real tagline/bio/teasers arrive (IA-2 family).
- Profile visual stays a decorative gradient placeholder until a profile image is provided.
- Rail shows a reorder/subset of the server-rendered top-3 (TAD §10.4 "filter to slugs that still exist") — recency never requires rendering un-served cards.
- Phase 4 ≙ Development Plan Phase E (established numbering convention).

### Outstanding work

- Real homepage copy + profile image when Harshit provides them (content-only changes).
- **Phase 5 ≙ Dev Plan Phase F:** search index endpoint, matcher, SearchOverlay island wired into the header + gallery row.
- Phase H: browser-level verification (Playwright), CWV field data, both-theme page axe.

---

## 2026-08-04 — Phase 3: Presentation Gallery & Engine (Development Plan Phase D)

### Objectives

Deliver the presentation engine per Dev Plan Phase D: T-D1 decoration blocks (SubjectVisual, PresentationMeta, TagRow), T-D2 the ADR-0007 linked-card PresentationCard, T-D3 the gallery route, T-D4 the GalleryController island (filters/sort/URL sync), T-D5 detail pages with unlimited-line H1 + LinkHealthAlert, T-D6 the anchor-first ActionRow, and the T-D7 projector dry-run gate (manual — pending real content/hardware). Milestone M3 targets: engine operational, linked-card valid HTML, /present path verified, backup functioning.

### Work completed

- **Content seed (D-029):** three clearly-labeled mock presentations (description prefix "MOCK SEED CONTENT") validating the full schema — incl. a 6-tag entry exercising TagRow overflow. Replaceable by deleting three files and adding real ones (IA-2 still open).
- **Libs:** `slidesUrl.ts` (/present normalization, ADR-0012 dl-param builder), `sorting.ts` (Design §14.2 four options, stable comparators, URL-param guard), `shared/lib/formatDate.ts` (en-IN medium).
- **Decoration (T-D1):** SubjectVisual (gradient map, aria-hidden, card/detail shapes), PresentationMeta (subject pill + `<time>` date, caption/detail sizes), TagRow (≤5 visible, >5 → 4 + "+N more" with full list in title; detail renders all).
- **PresentationCard (T-D2):** ADR-0007 linked-card pattern exact — one title anchor with `::after` hit-area expansion, no nested interactives, selectable title, two-line clamp; verified in tests AND built HTML.
- **Gallery route (T-D3):** published-only via Zod collection, Most-Recent default, per-card data contract for the island, chips + sort row, count, auto-fill grid + panel minimums.
- **GalleryController island (T-D4):** enhances the pre-rendered list (I1): chip filter + sort select reorder/hide `<li>` nodes the island owns post-mount; pushState for sort, replaceState for filter (TAD §10.2); aria-live status. No-JS gallery stays complete.
- **Detail route (T-D5):** static page per published entry — unlimited word-break H1 (Design §15.3), breadcrumb + back link (D-026), meta, all tags, derived launch URLs, LinkHealthAlert, always-visible sign-in hint (Design §20.7), optional description; title/meta derive from content (TAD §17.2).
- **ActionRow (T-D6):** Present as a REAL external anchor per TAD §24.5 (pre-hydration, no-JS, middle-click safe), composed from the shared Button primitive (D-027); slides-down disables Present and promotes backup; backup omitted without error when absent.
- **Tests:** 48 new (113 total) — libs, components, routes (astro:content mocked at the boundary, D-028), island interactivity; TEST_REPORT.md introduced as the permanent testing history (Phase 1–2 entries retroactive).

### Files created

`src/content/presentations/{photosynthesis,french-revolution,poetry-of-the-romantics}.json` · `src/features/presentations/lib/{slidesUrl,sorting}.ts` · `src/shared/lib/formatDate.ts` · `src/features/presentations/components/{SubjectVisual,PresentationMeta,TagRow,PresentationCard,ActionRow,LinkHealthAlert}.astro` · `src/features/presentations/islands/GalleryController.tsx` (+ module css) · `src/pages/presentations/index.astro` · `src/pages/presentations/[slug].astro` · `src/features/presentations/index.ts` · `tests/unit/presentations/{slides-url,sorting,components,pages}.test.ts` · `tests/unit/presentations/gallery-controller.test.tsx` · `TEST_REPORT.md`

### Files modified

None outside the new feature/test/docs surface (no regressions; all prior gates re-verified).

### Commits made

`feat(content): mock seed` → `feat(presentations): libs` → `feat(presentations): decoration (T-D1)` → `feat(presentations): linked card (T-D2)` → `feat(presentations): ActionRow + LinkHealthAlert (T-D6)` → `feat(presentations): GalleryController (T-D4)` → `feat(presentations): routes + index (T-D3/T-D5)` → `test: Phase D suite` → `docs`. See `git log`.

### Decisions

D-026 (detail keeps both breadcrumb and back link — both are designed) · D-027 (ActionRow composes the shared Button; TAD §24.5 contract preserved) · D-028 (page tests mock astro:content at the boundary) · D-029 (labeled mock seed content) · D-030 (island owns the pre-rendered list DOM — TAD §10.4 contract) · D-031 (T-D7 dry-run pending real content/hardware).

### Assumptions

- Mock seed content stays until Harshit's real decks arrive (IA-2); gallery/detail logic is content-agnostic.
- Design §14.2 sort list is authoritative over Dev Plan §9.2's older wording (Phase 1 X-2 already decided).
- T-D7 (projector dry-run) is a manual gate requiring real URLs + panel access — outstanding.
- Phase 3 ≙ Development Plan Phase D (numbering convention from prior phases).

### Outstanding work

- **T-D7 projector dry-run** (M3 item) — blocked on real Slides/Dropbox URLs + panel access (KNOWN_ISSUES).
- Replace mock seed with Harshit's real presentations when provided (IA-2).
- **Phase 4 ≙ Dev Plan Phase E:** homepage (hero with LCP exemption, RecentRail island + recency lib, teasers).
- Phase F search input joins the gallery controls row (slot already accommodated).

---

## 2026-08-04 — Phase 2: Chrome & Frame (Development Plan Phase C)

### Objectives

Deliver the global frame per Dev Plan Phase C: T-C1 Header, T-C2 MobileMenu island, T-C3 tablet "More" dropdown, T-C4 ThemeToggle island, T-C5 Footer — advancing Milestone M2 (chrome functional across mobile/tablet/panel widths; dark mode hydrates without flash) and Gate 2's FOUC + mobile-nav verification items.

### Work completed

- **Theme foundation (ADR-0011 enforcement):** `features/theme/lib/theme.ts` — storage discipline, the panel-lock query (≥1920px AND coarse pointer / no hover), and the FOUC guard's initial-theme decision as pure, injected-dependency logic. FOUC guard updated: applies stored dark only off-panel, adds the `js` class for progressive-enhancement CSS (D-021/D-024).
- **Focus trap:** `shared/lib/focusTrap.ts` — document-level Tab interception, edge wrapping both directions, stray-focus recovery; reusable by Phase F's SearchOverlay.
- **ThemeToggle island (T-C4):** opt-in toggle per Design §17 — flips `data-theme`, persists, updates `aria-pressed`/label; hidden on panels (forced light) and without JS; Lucide sun/moon inline SVG (astro-icon cannot render inside islands).
- **MobileMenu island (T-C2):** trigger + slide-in panel in one island (D-022): `aria-expanded`/`aria-controls`, focus-in on open, focus-trapped while open, Escape closes, focus returns to the trigger, `inert` on main/footer, scroll lock; 300ms/250ms slide per Design §29.5; `client:media` keeps it off desktop downloads (TAD §14.3); no-JS users keep the static nav (I1).
- **Header (T-C1):** frosted glass from a token-based `color-mix` (dark-adaptive), solid fallback via `@supports` + panel widths, scroll-shadow class toggle (inline script per TAD §7.2), brand signature, `aria-current` active states, panel-width nav text bump (Design §24.4).
- **Tablet dropdown (T-C3, D-020):** 768–899px overflow links collapse into a zero-JS `<details>` "More" control — natively keyboard-operable; ≥900px all inline (Design §12.5).
- **Footer (T-C5):** Design §11.11 with the v2 neutral-600 correction.
- **Composition:** BaseLayout renders SkipLink → Header → page → Footer, passing both islands through the header's actions slot; layouts may compose feature islands as a documented import-rule exception (D-023, ESLint updated).
- **Tests:** 33 new tests (65 total) — theme lib, focus trap, chrome structure, FOUC guard executed under simulated storage/panel conditions (Gate 2 evidence), MobileMenu keyboard + pointer flows (Gate 2 evidence), ThemeToggle persistence; container helper registers the Preact server renderer; condition-based `waitFor` for Preact's deferred scheduling (D-025).

### Files created

`src/features/theme/lib/theme.ts` · `src/features/theme/islands/ThemeToggle.tsx` (+ module css) · `src/shared/lib/focusTrap.ts` · `src/shared/components/MobileMenu.tsx` (+ module css) · `src/shared/components/Header.astro` · `src/shared/components/Footer.astro` · `tests/unit/components/{theme-lib,focus-trap,chrome}.test.ts` · `tests/unit/components/islands.test.tsx`

### Files modified

`src/features/theme/index.ts` (public interface) · `src/shared/layouts/BaseLayout.astro` (chrome composition, FOUC guard, chrome tokens) · `src/pages/index.astro` (activePath) · `src/env.d.ts` (CSS-module types) · `eslint.config.js` (layouts exception) · `vitest.config.ts` (.tsx specs) · `.stylelintrc.json` (module-css ignore) · `tests/unit/helpers/render.ts` (Preact renderer) · permanent docs

### Commits made

`feat(theme): lib` → `feat(a11y): focus trap` → `feat(theme): ThemeToggle` → `feat(nav): MobileMenu` → `feat(chrome): Header/Footer` → `feat(layout): BaseLayout composition` → `test: Phase C suite` → `docs`. See `git log`.

### Decisions

D-020 (zero-JS details dropdown) · D-021 (panel lock enforcement) · D-022 (single MobileMenu island) · D-023 (layouts compose feature islands) · D-024 (js-class progressive enhancement) · D-025 (condition-based test waits).

### Assumptions

- Tablet dropdown auto-close (outside click/Escape) stays native `<details>` behavior at this phase — tracked as TD-11.
- SearchTrigger deferred to Phase F (search overlay does not exist yet); header structure already accommodates it.
- Phase 2 ≙ Development Plan Phase C (numbering convention from prior phases).

### Outstanding work

- **Phase 3 ≙ Dev Plan Phase D:** presentation engine (SubjectVisual/PresentationMeta/TagRow, linked-card PresentationCard per ADR-0007, gallery + detail routes, ActionRow, projector dry-run gate — needs Harshit's real Slides/Dropbox URLs, IA-2).
- TD-11 (dropdown auto-close), FI-9/FI-10 unchanged.

---

## 2026-08-04 — Phase 1: Shared Primitives & Design System (Development Plan Phase B)

### Objectives

Deliver the ten shared UI primitives (Dev Plan §4 Phase B: T-B1…T-B4) with immediate automated accessibility gates, plus the two foundation gaps the initialization phase deferred: self-hosted fonts (TAD §14.5, TD-7) and the icon system (TAD §3.7, D-006). No feature pages, no islands, no product content.

### Work completed

- **Fonts (TAD §14.5):** Inter (400/500/600) and Plus Jakarta Sans (600/700/800) via the Astro 6 Fonts API with the **local provider** — files read from version-pinned `@fontsource` packages, emitted hashed and self-hosted to `dist/_astro/fonts/`, latin subset, `font-display: swap`, metric-adjusted fallback stacks generated (CLS control per TAD §8.6). Design tokens stay verbatim; `--font-body`/`--font-display` are re-pointed at the generated stacks in a BaseLayout component style block with safe fallbacks. `<Font />` injection in the layout head; preload filter tuned to emit **exactly the two first-paint weights** (Inter 400, PJS 800) per TAD §14.5.
- **Icons (TAD §3.7):** `astro-icon` integration with the local `@iconify-json/lucide` pack — inline SVG at build time, zero runtime JS, no CDN.
- **Ten primitives in `src/shared/ui/`:** VisuallyHidden, SkipLink, SectionOverline, Tag, Alert, EmptyState, Skeleton, Breadcrumb, IconButton, and the polymorphic Button (anchor/button by `href`, disabled links become disabled buttons, external `noopener noreferrer`, subtitle inside the accessible name — TAD §7.5/§24.5).
- **Token addition:** `--color-accent-700` for the primary button active state (Design §11.1 value, tokenized per Rule 2 — D-014).
- **BaseLayout wiring:** SkipLink as the first focusable element; `<Font />` components in head.
- **Component test stack (T-B4):** Vitest via `getViteConfig` (Astro compiles `.astro` in tests), node environment with jsdom-as-library, Astro Container API rendering, axe-core scans asserting **zero violations** per component, structural contract tests (polymorphism, roles, truncation, mandatory labels, FOUC guard, skip-link target).

### Files created

`src/shared/ui/{VisuallyHidden,SkipLink,SectionOverline,Tag,Alert,EmptyState,Skeleton,Breadcrumb,IconButton,Button}.astro` · `tests/unit/helpers/render.ts` · `tests/unit/components/button.test.ts` · `tests/unit/components/primitives.test.ts`

### Files modified

`astro.config.mjs` (icon integration; fonts config local provider) · `package.json` / `package-lock.json` (astro-icon, @iconify-json/lucide, @fontsource/inter, @fontsource/plus-jakarta-sans, axe-core, jsdom, @types/jsdom) · `.gitignore` (.astro-icon) · `src/shared/styles/tokens.css` (accent-700) · `src/shared/layouts/BaseLayout.astro` (SkipLink, `<Font />` injection, font token wiring) · `vitest.config.ts` (getViteConfig + vitest/config types reference) · `eslint.config.js` (defineConfig migration, .astro-icon ignore)

### Commits made

`chore(icons)` → `feat(tokens)` → `feat(layout)` → `feat(ui): display primitives` → `feat(ui): Breadcrumb/Button family` → `test: Phase B suite` → `feat(ui): VisuallyHidden` → `docs` (this entry). See `git log`.

### Decisions

D-014 (accent-700 token) · D-015 (subject pill styling stays in features/presentations) · D-016 (font wiring & injection mechanics incl. fontsource→local provider journey and first-paint preload filter) · D-017 (Lucide via astro-icon, local pack) · D-018 (component test stack: node env + jsdom-as-library; vitest jsdom environment rejected — it breaks the transform pipeline) · D-019 (Tag paddings follow Design §11.3 spec values verbatim even where off the 4px grid).

### Assumptions

- B9 held: JetBrains Mono not loaded (token retained).
- Design v1 loading-state details remain unavailable — Skeleton ships a conservative, token-driven placeholder; semantics documented (TD-10).
- Phase 1 ≙ Development Plan Phase B (Foundation/Phase A was completed as Repository Initialization).

### Outstanding work

- **Phase C**: Header (scroll shadow, tablet "More ▾"), Footer, ThemeToggle island, MobileMenu island, FOUC-validation report (Gate 2 items).
- TD-10: Skeleton/loading detail spec awaits Design v1.
- KNOWN_ISSUES FI-1 (ADR file migration) and the rest of the phase roadmap unchanged.

---

## 2026-08-04 — Repository Initialization (Development Plan Phase A, foundation scope)

### Objectives

Establish the project foundation exactly per the approved Technical Architecture Document and Development Plan: project structure, tooling, design-token foundation, content contract, shared layout shell, CI, deployment config, and permanent project files. **No product features.**

### Work completed

- Scaffolded an Astro 6.4 (static output) + TypeScript strict + Preact project with pinned, compatibility-verified dependency versions (Astro 6 line, not the newer major; see DECISIONS D-001/D-002).
- Created the full TAD §5 folder hierarchy: `src/content`, `src/features/{presentations,search,theme,contact}` (index-only public interfaces), `src/shared/{ui,components,layouts,lib,config,styles}`, `src/pages`, `tests/{unit,e2e,a11y}`, `docs/adr`, `public`.
- Implemented the design-token foundation: `tokens.css` copied **verbatim** from Design Spec v2 §26.1; derived `tokens.dark.css` (assumption B1, documented provenance in-file); `global.css` reset/base/focus/reduced-motion; `utilities.css`.
- Implemented the Zod content contract (TAD §8.1): `presentationSchema` + `siteProfileSchema`, collections wired with the Astro 6 glob loader; slug derives from filename.
- Created `BaseLayout.astro`: HTML shell, `{title} · Harshit` metadata, blocking inline FOUC-guard theme script (TAD §12.2), View Transitions `ClientRouter` (fallback `swap`), light default with `data-theme`.
- Created the temporary root route shell (routing foundation only; replaced wholesale in Phase E).
- Configured ESLint (flat) with TAD §5.1 import-boundary rules, jsx-a11y on islands, Prettier (+astro plugin), Stylelint (token-only colors; `--color-neutral-400` banned for text per Design Rule 11).
- Configured Vitest with the content-contract suite; **verified Gate 1**: a malformed date (`2026-13-45`) fails the build naming the file and field; valid tree builds clean.
- Configured GitHub Actions CI (typecheck → lint → stylelint → unit tests → build, cheapest-first per TAD §18.3).
- Prepared deployment: `netlify.toml` (build/publish, security headers, caching per TAD §14.7, redirects section), `robots.txt`, placeholder favicon, `.env.example`.
- Wrote README, DECISIONS.md, KNOWN_ISSUES.md, this log, and the ADR index.
- All quality gates green: typecheck 0 errors · ESLint 0 · Stylelint 0 · tests 10/10 · build succeeds (1 page + sitemap).

### Files created

`package.json` · `package-lock.json` · `tsconfig.json` · `astro.config.mjs` · `src/env.d.ts` · `src/content.config.ts` · `src/content/schemas.ts` · `src/content/presentations/.gitkeep` · `src/content/site/.gitkeep` · `src/shared/config/site.ts` · `src/shared/config/subjects.ts` · `src/shared/styles/{tokens.css,tokens.dark.css,global.css,utilities.css}` · `src/shared/layouts/BaseLayout.astro` · `src/shared/ui/.gitkeep` · `src/shared/components/.gitkeep` · `src/shared/lib/.gitkeep` · `src/features/{presentations,search,theme,contact}/index.ts` (+ `.gitkeep` subdirs) · `src/pages/index.astro` · `tests/unit/content-schema.test.ts` · `tests/e2e/.gitkeep` · `tests/a11y/.gitkeep` · `vitest.config.ts` · `eslint.config.js` · `.prettierrc.json` · `.prettierignore` · `.stylelintrc.json` · `.github/workflows/ci.yml` · `netlify.toml` · `public/robots.txt` · `public/favicon.svg` · `.env.example` · `.gitignore` · `.editorconfig` · `.nvmrc` · `README.md` · `IMPLEMENTATION_LOG.md` · `DECISIONS.md` · `KNOWN_ISSUES.md` · `docs/adr/README.md`

### Files modified

`README.md` (replaced the initial placeholder with project documentation).

### Commits made

See `git log` — initialization was committed as small logical units: repository hygiene → scaffold/manifest → design tokens → content contract & config → layout shell & routing → scaffolding → tests → lint/format configs → CI → deployment assets → documentation.

### Decisions

Recorded in `DECISIONS.md` as D-001 … D-013 (scaffold method, Astro 6.4 API adaptations, explicit zod pin, schema split, derived dark palette, Lucide intent, no content seeding, temporary route, subdomain URL, lint-stack pinning, CI shape, `/present` pathname validation, Stylelint scope).

### Assumptions

- Classification-report assumptions B1–B13 and IA-1…IA-7 hold (recorded in the Clarifications Classification Report; key ones: derived dark palette until Design v1 values arrive; Netlify subdomain first; two font families; five-subject enum; placeholder content until Harshit's real content arrives).
- Astro 6 is pinned deliberately (TAD/Dev Plan mandate; registry now offers Astro 7).

### Outstanding work

- **Phase B**: shared UI primitives (Button, IconButton, Tag, Alert, EmptyState, Skeleton, Breadcrumb, SectionOverline, VisuallyHidden) + axe tests; font acquisition/subsetting via the Astro Fonts API; icon integration (Lucide via astro-icon).
- **Phase C**: Header/Footer/MobileMenu/ThemeToggle; tablet "More ▾" dropdown; FOUC validation report.
- **Phase D**: presentation engine (linked-card pattern per ADR-0007), gallery + detail routes, ActionRow, **projector dry-run gate** (needs Harshit's real Slides/Dropbox URLs and panel access).
- **Phase E**: homepage (hero with LCP exemption, RecentRail island + recency, teasers).
- **Phase F**: search index endpoint, matcher, SearchOverlay (header search is an AC-1 requirement, not optional — TAD §6.3).
- **Phase G**: About, Contact (Netlify Forms + honeypot), Coming Soon routes, 404/500.
- **Phase H**: a11y audits (both themes), CSP report-only→enforce, Lighthouse budgets, E2E journeys, link-check workflow, `ADDING-A-PRESENTATION.md` + `RUNBOOK.md`, rollback rehearsal, environment-aware robots.txt.
- **Content dependency (IA-2)**: ≥3 real presentations, bio, email/socials, profile image.
- **Written acknowledgment (IA-3)**: ≤3 s budget split, before launch review.
