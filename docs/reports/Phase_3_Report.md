# Phase 3 Report — Presentation Gallery & Engine (Development Plan Phase D)

**Project:** Harshit — Personal Academic Portfolio & Presentation Hub
**Date:** 2026-08-04

> **Reconstruction note.** The original completion report lived outside the repository and was lost in a sandbox workspace reset. This version is faithfully reconstructed from the permanent records: IMPLEMENTATION_LOG ("Phase 3: Presentation Gallery & Engine (Development Plan Phase D)") and TEST_REPORT ("Phase 3") entries, plus DECISIONS.md. No new findings are invented; the concluding verdict is reconstructed from the recorded gate results.

---

## 1. Objectives

Deliver the presentation engine per Dev Plan Phase D: T-D1 decoration blocks (SubjectVisual, PresentationMeta, TagRow), T-D2 the ADR-0007 linked-card PresentationCard, T-D3 the gallery route, T-D4 the GalleryController island (filters/sort/URL sync), T-D5 detail pages with unlimited-line H1 + LinkHealthAlert, T-D6 the anchor-first ActionRow, and the T-D7 projector dry-run gate (manual — pending real content/hardware). Milestone M3 targets: engine operational, linked-card valid HTML, /present path verified, backup functioning.

## 2. Work completed

- **Content seed (D-029):** three clearly-labeled mock presentations (description prefix "MOCK SEED CONTENT") validating the full schema — incl. a 6-tag entry exercising TagRow overflow. Replaceable by deleting three files and adding real ones (IA-2 still open).
- **Libs:** `slidesUrl.ts` (/present normalization, ADR-0012 dl-param builder), `sorting.ts` (Design §14.2 four options, stable comparators, URL-param guard), `shared/lib/formatDate.ts` (en-IN medium).
- **Decoration (T-D1):** SubjectVisual (gradient map, aria-hidden, card/detail shapes), PresentationMeta (subject pill + `<time>` date, caption/detail sizes), TagRow (≤5 visible, >5 → 4 + "+N more" with full list in title; detail renders all).
- **PresentationCard (T-D2):** ADR-0007 linked-card pattern exact — one title anchor with `::after` hit-area expansion, no nested interactives, selectable title, two-line clamp; verified in tests AND built HTML.
- **Gallery route (T-D3):** published-only via Zod collection, Most-Recent default, per-card data contract for the island, chips + sort row, count, auto-fill grid + panel minimums.
- **GalleryController island (T-D4):** enhances the pre-rendered list (I1): chip filter + sort select reorder/hide `<li>` nodes the island owns post-mount; pushState for sort, replaceState for filter (TAD §10.2); aria-live status. No-JS gallery stays complete.
- **Detail route (T-D5):** static page per published entry — unlimited word-break H1 (Design §15.3), breadcrumb + back link (D-026), meta, all tags, derived launch URLs, LinkHealthAlert, always-visible sign-in hint (Design §20.7), optional description; title/meta derive from content (TAD §17.2).
- **ActionRow (T-D6):** Present as a REAL external anchor per TAD §24.5 (pre-hydration, no-JS, middle-click safe), composed from the shared Button primitive (D-027); slides-down disables Present and promotes backup; backup omitted without error when absent.
- **Tests:** 48 new (113 total) — libs, components, routes (astro:content mocked at the boundary, D-028), island interactivity; TEST_REPORT.md introduced as the permanent testing history (Phase 1–2 entries retroactive).

## 3. Quality gate results

| Gate | Result |
|---|---|
| Typecheck | ✅ 0 errors / 0 warnings / 0 hints |
| ESLint / Stylelint | ✅ 0 |
| Tests | ✅ **113/113** (48 new; breakdown: slidesUrl 9 · sorting 9 · components 15 · gallery page 6 · detail page 4 · GalleryController island 4 · prior phases 65) |
| Build | ✅ clean |
| axe-core | ✅ zero violations on PresentationCard, ActionRow, LinkHealthAlert, and rendered fragments |

**Accessibility:** card link accessible name = presentation title; gallery filter chips carry `aria-pressed`; sort has a real `<label>`/`htmlFor`; filter results announced via `role="status"` `aria-live="polite"`; detail page `<time datetime>`, breadcrumb `aria-current="page"`, decorative gradients `aria-hidden`. Browser-level keyboard/SR pass: Phase H (tracked).

**Performance (build artifacts, gzipped):**
- Detail route: JS 5.42 KB (ClientRouter only — no islands) ≤ 10 KB ✅; CSS 1.25 KB ≤ 12 KB ✅
- Gallery route: JS ≈ 12 KB (preact core + hooks + GalleryController 1.36 KB) ≤ 25 KB ✅; CSS ≈ 4.7 KB ≤ 15 KB ✅
- Homepage unchanged: ≈16.6 KB JS ≤ 20 KB ✅, CSS 3.4 KB ≤ 15 KB ✅
- Zero new runtime dependencies

**Manual verification:** built pages inspected (dist): linked-card structure, external-link rel pairs, subtitle, breadcrumb, sign-in hint, chip/sort markup. **T-D7 projector dry-run remains pending** — requires Harshit's real Slides/Dropbox URLs (IA-2) and physical panel access; tracked in KNOWN_ISSUES.

**Bugs found & fixed:** `htmlFor` lint failure (JSX `for` attribute); `dataset` on `Element` type errors in island tests; container limitation discovered (AstroContainer renders island own markup but not slot children; `getCollection` returns empty) → page tests mock `astro:content` at the boundary (D-028); assertion-format mismatches (test-side). No product-code behaviour bugs escaped review.

## 4. Files created

`src/content/presentations/{photosynthesis,french-revolution,poetry-of-the-romantics}.json` · `src/features/presentations/lib/{slidesUrl,sorting}.ts` · `src/shared/lib/formatDate.ts` · `src/features/presentations/components/{SubjectVisual,PresentationMeta,TagRow,PresentationCard,ActionRow,LinkHealthAlert}.astro` · `src/features/presentations/islands/GalleryController.tsx` (+ module css) · `src/pages/presentations/index.astro` · `src/pages/presentations/[slug].astro` · `src/features/presentations/index.ts` · `tests/unit/presentations/{slides-url,sorting,components,pages}.test.ts` · `tests/unit/presentations/gallery-controller.test.tsx` · `TEST_REPORT.md`

**Modified:** none outside the new feature/test/docs surface (no regressions; all prior gates re-verified).

## 5. Decisions

D-026 (detail keeps both breadcrumb and back link — both are designed) · D-027 (ActionRow composes the shared Button; TAD §24.5 contract preserved) · D-028 (page tests mock astro:content at the boundary) · D-029 (labeled mock seed content) · D-030 (island owns the pre-rendered list DOM — TAD §10.4 contract) · D-031 (T-D7 dry-run pending real content/hardware).

## 6. Assumptions

- Mock seed content stays until Harshit's real decks arrive (IA-2); gallery/detail logic is content-agnostic.
- Design §14.2 sort list is authoritative over Dev Plan §9.2's older wording (Phase 1 X-2 already decided).
- T-D7 (projector dry-run) is a manual gate requiring real URLs + panel access — outstanding.
- Phase 3 ≙ Development Plan Phase D (numbering convention from prior phases).

## 7. Outstanding work

- **T-D7 projector dry-run** (M3 item) — blocked on real Slides/Dropbox URLs + panel access (KNOWN_ISSUES).
- Replace mock seed with Harshit's real presentations when provided (IA-2).
- **Phase 4 ≙ Dev Plan Phase E:** homepage (hero with LCP exemption, RecentRail island + recency lib, teasers).
- Phase F search input joins the gallery controls row (slot already accommodated).

---

**Verdict (reconstructed from recorded gates):** Phase 3 complete — 113/113 automated checks, zero axe violations, all quality gates green, budgets within limits.
