# Phase 4 Report — Homepage / Landing Experience (Development Plan Phase E)

**Project:** Harshit — Personal Academic Portfolio & Presentation Hub
**Date:** 2026-08-04

> **Reconstruction note.** The original completion report lived outside the repository and was lost in a sandbox workspace reset. This version is faithfully reconstructed from the permanent records: IMPLEMENTATION_LOG ("Phase 4: Homepage / Landing Experience (Development Plan Phase E)") and TEST_REPORT ("Phase 4") entries, plus DECISIONS.md. No new findings are invented; the concluding verdict is reconstructed from the recorded gate results.

---

## 1. Objectives

Deliver the homepage per Dev Plan Phase E: T-E1 Hero with optimized LCP and entrance choreography, T-E2 RecentRail island with client-side recency (Design §13.2 dual strategy), T-E3 About/Contact teaser blocks — assembling the systems built in prior phases rather than rebuilding any of them.

## 2. Work completed

- **Recency foundation:** `features/presentations/lib/recency.ts` — validated per-visitor launch history (newest-first, deduped, capped at 5, corrupt data discarded, blocked storage no-op) + `resolveRecentSlugs` for the rail (Design §13.2; TAD §10.4 no-flicker rule).
- **Homepage copy constants (D-034):** labelled MOCK tagline + about/contact teasers in `site.ts` until Harshit's real words arrive (IA-2) — content-driven, replacement is a config edit.
- **Hero (T-E1):** Design §11.7 composition — overline, brand name with accent period, tagline, CTA row with the U2 hierarchy fix (View Presentations at primary height, Electric Blue reserved for Present). Entrance choreography per Design §23.4 + ADR-0008 (D-032): `html.js` + `data-entrance` gating, hero name transform-only (LCP paints frame one), full vs reduced mode decided by an inline sessionStorage-timestamp guard in the head slot, no-JS fully static (I1).
- **Quick-launch + recency recording (D-033):** rail-only quick-launch on PresentationCard — sibling anchor layered above the hit-area overlay (ADR-0007 rule 3), desktop hover + keyboard focus-within only, real anchor (works no-JS); RecentRail records launches on click; detail page records via a small deferred script (Design §29.3, progressive enhancement).
- **RecentRail island (T-E2):** client:load enhancement of the server-rendered rail: untouched "Latest" fallback without recency; reorder + heading swap with validated recency; stale slugs dropped; DOM ownership after mount (D-030); deterministic `data-rail-mounted` marker (D-036).
- **Teasers (T-E3):** AboutTeaser (labelled section, decorative placeholder visual until the profile image arrives, Read More → /about) + ContactTeaser (Get in Touch → /contact), in shared/components as content-agnostic composition (D-035).
- **Homepage assembly:** index.astro replaces the initialization shell — **TD-1 resolved**. Rail entrance stagger (550ms heading, cards from 600ms/80ms steps) dropped automatically when the island reorders.
- **Tests:** 28 new (141 total) — recency lib, Hero/teasers, homepage page (content boundary mocked, D-028), RecentRail island interactions, entrance guard executed in jsdom.

## 3. Quality gate results

| Gate | Result |
|---|---|
| Typecheck | ✅ 0 errors |
| ESLint / Stylelint | ✅ 0 |
| Tests | ✅ **141/141** (28 new; breakdown: recency 13 · hero/teasers 5 · homepage page 6 · RecentRail island 5 · entrance guard 4 · prior phases 113) |
| Build | ✅ clean |
| axe-core | ✅ zero violations on Hero, AboutTeaser, ContactTeaser, and homepage fragments |

**Accessibility:** keyboard — quick-launch revealed on `:focus-within` (keyboard users can reach it without hover); labelled sections (`aria-labelledby`), decorative elements `aria-hidden`, rail is a real `<ul>` list; ADR-0008 upheld (hero name/LCP has no opacity animation — transform-only keyframes, verified by construction); no-JS page fully static (I1). Browser-level keyboard/SR passes: Phase H (tracked).

**Performance (build artifacts, gzipped):**
- Homepage JS ≈17.4 KB (ClientRouter 5.35 + preact core 4.37 + signals/hooks/client/jsxRuntime ≈5.7 + RecentRail 0.63 + recency lib 0.34 + MobileMenu 1.38 mobile-only) ≤ 20 KB ✅
- Homepage CSS 5.0 KB ≤ 15 KB ✅ — no route exceeds its budget; zero new dependencies
- Entrance animation pure CSS — zero added JS on the critical path; LCP element unanimated in opacity (ADR-0008)

**Responsive:** rail horizontal scroll + snap on mobile → 2-col tablet → 3-col desktop/panel (Design §29.4); teasers stack → two-column about at 768px; hero display-lg → display-xl at 768px. Real-viewport E2E: Phase H.

**Manual verification:** built `dist/index.html` inspected — hero, rail data contract (data-rail, data-slug, data-quick-launch ×3), teasers, entrance script, no placeholder shell.

**Bugs found & fixed:** detail-page recency script closed with a stray `</style>` tag; entrance inline script used `var`/named-empty-catch (lint failures); quick-launch test raced Preact's deferred mount effect (fixed properly with the `data-rail-mounted` marker — D-036). No product-code behaviour bugs escaped review.

## 4. Files created / modified

**Created:** `src/features/presentations/lib/recency.ts` · `src/shared/components/Hero.astro` · `src/shared/components/AboutTeaser.astro` · `src/shared/components/ContactTeaser.astro` · `src/features/presentations/islands/RecentRail.tsx` (+ module css) · `tests/unit/presentations/recency.test.ts` · `tests/unit/home/{homepage,hero,entrance}.test.ts` · `tests/unit/home/recent-rail.test.tsx`

**Modified:** `src/shared/config/site.ts` (MOCK copy constants) · `src/features/presentations/components/PresentationCard.astro` (quick-launch) · `src/pages/presentations/[slug].astro` (recency recording script) · `src/pages/index.astro` (full homepage, placeholder replaced) · permanent docs

## 5. Decisions

D-032 (entrance gating mechanism; transform-only name) · D-033 (quick-launch sibling anchor + enhancement-only recording) · D-034 (labelled MOCK copy constants) · D-035 (homepage sections in shared/components; RecentRail in features/presentations) · D-036 (data-rail-mounted marker for deterministic tests).

## 6. Assumptions

- Homepage copy constants stay labelled MOCK until Harshit's real tagline/bio/teasers arrive (IA-2 family).
- Profile visual stays a decorative gradient placeholder until a profile image is provided.
- Rail shows a reorder/subset of the server-rendered top-3 (TAD §10.4 "filter to slugs that still exist") — recency never requires rendering un-served cards.
- Phase 4 ≙ Development Plan Phase E (established numbering convention).

## 7. Outstanding work

- Real homepage copy + profile image when Harshit provides them (content-only changes).
- **Phase 5 ≙ Dev Plan Phase F:** search index endpoint, matcher, SearchOverlay island wired into the header + gallery row.
- Phase H: browser-level verification (Playwright), CWV field data, both-theme page axe.

---

**Verdict (reconstructed from recorded gates):** Phase 4 complete — 141/141 automated checks, zero axe violations, all quality gates green, budgets within limits, zero regressions from Phases 1–3.
