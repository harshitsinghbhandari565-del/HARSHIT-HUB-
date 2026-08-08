# Phase 5 Report — Global Search Experience (Development Plan Phase F)

**Project:** Harshit — Personal Academic Portfolio & Presentation Hub
**Date:** 2026-08-04

> **Reconstruction note.** The original completion report lived outside the repository and was lost in a sandbox workspace reset. This version is faithfully reconstructed from the permanent records: IMPLEMENTATION_LOG ("Phase 5: Global Search Experience (Development Plan Phase F)") and TEST_REPORT ("Phase 5") entries, plus DECISIONS.md. No new findings are invented; the concluding verdict is reconstructed from the recorded gate results.

---

## 1. Objectives

Deliver search per Dev Plan Phase F: T-F1 build-time index endpoint, T-F2 scored matcher, T-F3 SearchOverlay island (focus trap, arrow roving, live announcements) — plus the gallery's inline search surface (TAD §11.3: two surfaces, one matcher) and the header trigger wired into the global chrome. Fast, keyboard-accessible, progressively enhanced, within TAD §14.1 budgets, zero new dependencies.

## 2. Work completed

- **Matcher core (T-F2):** normalize (lowercase/diacritics/whitespace) + tokenize; hand-rolled scored matcher with TAD §11.2 semantics (AND across tokens; title 100/60/40, subject 30, tag 25/15; score desc → date desc); `docMatches` shares the semantics with the gallery filter; index builder maps published entries to shortened-key docs.
- **Index endpoint (T-F1):** `/search-index.json` generated from the PUBLISHED collection at build time — static, cached (netlify.toml already configured), descriptions excluded, zero runtime dependencies.
- **SearchOverlay (T-F3):** plain header trigger + on-demand dialog (D-038). First click dynamically imports Preact + SearchDialog, so pages nobody searches from pay ~0.3 KB instead of ~10 KB. The dialog implements the full TAD §11.4 contract: dialog semantics + inert background, focus to input, focus trap, Arrow roving over real result links, Escape/close with focus returned to the trigger, polite live counts, Design §18.3 empty state with clear action, graceful fetch-error state. Index fetched once, cached in memory.
- **Gallery inline search (D-039):** GalleryController owns all gallery state (single-writer URL sync, I6): SearchInput filters the pre-rendered cards via data attributes + the shared matcher, `?q=` replaceState sync (TAD §10.2), URL params applied at hydration, 250ms debounce, empty state with clear-search reset.
- **ThemeToggle vanilla conversion (D-038):** Phase 2's Preact island became a vanilla bundled script (wiring in `lib/theme.ts` `initThemeToggle`) — removes the Preact runtime from island-free pages. Behaviour unchanged (flip/persist/aria-pressed/panel-hidden).
- **Budget compliance restored:** with on-demand search + vanilla toggle, eager JS is homepage 6.34 KB ≤20, gallery 6.34 KB ≤25, detail 6.89 KB ≤10 KB (measurement method in TEST_REPORT.md; includes mobile island hydration the detail page stays under budget even counting MobileMenu).
- **Tests:** 29 new (170 total) — matcher/normalizer, index builder, endpoint, trigger structure, dialog behaviour, mount lifecycle, gallery search, ThemeToggle rewrite.

## 3. Quality gate results

| Gate | Result |
|---|---|
| Typecheck | ✅ 0 errors |
| ESLint / Stylelint | ✅ 0 |
| Tests | ✅ **170/170** (29 new; breakdown: matcher/normalize 11 · index-builder 2 · endpoint 1 · trigger structure 1 · SearchDialog 6 · search-mount 3 · gallery search 5 · ThemeToggle rewrite 3 · prior phases 141) |
| Build | ✅ clean |
| Budgets | ✅ all routes within TAD §14.1 (TD-13 method standardized this phase) |

**Accessibility:** dialog contract per TAD §11.4 verified by tests — `role="dialog"` + `aria-modal`, accessible name, focus to input on open, focus trap while open, focus returned to the trigger on close, `aria-live="polite"` result counts, Escape closes. Results are real links — Enter activates natively; Arrow keys rove focus; the input has a real visually-hidden label. Empty state offers a keyboard-reachable clear action; announcements polite (no focus theft). Trigger carries `aria-label`, `aria-expanded`, `aria-controls`. Reduced motion: global block disables transitions; search has no entrance animation. Browser-level keyboard/SR passes: Phase H (tracked).

**Performance (build artifacts, gzipped; TD-13 method standardized this phase):**

| Route | Eager JS | Budget | CSS | Budget |
|---|---|---|---|---|
| `/` | 6.34 KB (+RecentRail hydration ≈16 KB total) | ≤20 KB ✅ | 5.12 KB | ≤15 KB ✅ |
| `/presentations` | 6.34 KB (+GalleryController hydration ≈17 KB) | ≤25 KB ✅ | 5.01 KB | ≤15 KB ✅ |
| `/presentations/[slug]` | 6.89 KB (+MobileMenu on mobile ≈8 KB) | ≤10 KB ✅ | 3.84 KB | ≤12 KB ✅ |

Search adds ≈0.3 KB per page until first open; the dialog + matcher + input then load once (index fetch included). Zero new dependencies. The Phase 2–4 detail-page overage (transitive preact from header islands, previously under-measured) is resolved by D-038.

**Manual verification:** built dist inspected — `/search-index.json` emitted with correct shape; trigger present in header; dialog markup contracts confirmed in tests against real built components.

**Bugs found & fixed:** focus restored before dialog unmount → focus lost to `<body>` (post-unmount transition effect); trigger script statically imported the mount module → Preact eager on every page, detail over budget (dynamic import on click — D-038); cross-test module state leak in search-mount (explicit test reset); Escape dispatch raced fixed-tick waits (condition-based waitFor); ESLint dialog/backdrop handler rule disables (canonical placements with rationale). No product-code behaviour bugs escaped review.

## 4. Files created / modified / deleted

**Created:** `src/features/search/lib/{normalize,matcher,index-builder}.ts` · `src/pages/search-index.json.ts` · `src/features/search/islands/{SearchOverlay.astro,search-mount.ts,SearchDialog.tsx,SearchDialog.module.css,SearchInput.tsx,SearchInput.module.css}` · `src/features/search/index.ts` · `src/features/theme/islands/ThemeToggle.astro` · `tests/unit/search/{matcher,index-builder,search-index-endpoint,search-overlay,search-mount,gallery-search}.test.tsx`

**Modified:** `src/features/presentations/islands/GalleryController.tsx` (+ module css — inline search) · `src/pages/presentations/index.astro` (data-slug/data-tags) · `src/features/theme/lib/theme.ts` (initThemeToggle) · `src/features/theme/index.ts` · `src/shared/layouts/BaseLayout.astro` (vanilla controls, no hydration directives) · `tests/unit/components/islands.test.tsx` (ThemeToggle rewrite) · permanent docs

**Deleted:** `src/features/theme/islands/ThemeToggle.tsx` + `ThemeToggle.module.css` (replaced by the Astro component, D-038)

## 5. Decisions

D-037 (SearchInput is a shared sub-component of its owning island — single hydration owner per surface) · D-038 (on-demand search dialog + vanilla ThemeToggle for budget compliance) · D-039 (gallery search lives inside GalleryController — single-writer URL sync).

## 6. Assumptions

- TAD §11.2 scoring constants and AND semantics implemented verbatim (no tuning without evidence).
- Gallery query param is `q` (TAD §10.2 names it); sort/subject params carried over from Phase D.
- Search trigger present on all pages (global header per TAD §11.3), including detail pages.
- Phase 5 ≙ Development Plan Phase F (established numbering convention).

## 7. Outstanding work

- **Phase 6 ≙ Dev Plan Phase G:** About + Contact pages (+ Netlify Forms + honeypot), Coming Soon routes, 404/500.
- Real content (IA-2) still pending — affects search only by populating the index.
- Phase H: browser-level a11y (keyboard/SR passes on the overlay), E2E search journeys, CWV field data.

---

**Verdict (reconstructed from recorded gates):** Phase 5 complete — 170/170 automated checks, zero regressions, all quality gates green, budgets within limits on every route.
