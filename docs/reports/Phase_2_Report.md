# Phase 2 Report — Chrome & Frame (Development Plan Phase C)

**Project:** Harshit — Personal Academic Portfolio & Presentation Hub
**Date:** 2026-08-04

> **Reconstruction note.** The original completion report lived outside the repository and was lost in a sandbox workspace reset. This version is faithfully reconstructed from the permanent records: IMPLEMENTATION_LOG ("Phase 2: Chrome & Frame (Development Plan Phase C)") and TEST_REPORT ("Phase 2") entries, plus DECISIONS.md. No new findings are invented; the concluding verdict is reconstructed from the recorded gate results.

---

## 1. Objectives

Deliver the global frame per Dev Plan Phase C: T-C1 Header, T-C2 MobileMenu island, T-C3 tablet "More" dropdown, T-C4 ThemeToggle island, T-C5 Footer — advancing Milestone M2 (chrome functional across mobile/tablet/panel widths; dark mode hydrates without flash) and Gate 2's FOUC + mobile-nav verification items.

## 2. Work completed

- **Theme foundation (ADR-0011 enforcement):** `features/theme/lib/theme.ts` — storage discipline, the panel-lock query (≥1920px AND coarse pointer / no hover), and the FOUC guard's initial-theme decision as pure, injected-dependency logic. FOUC guard updated: applies stored dark only off-panel, adds the `js` class for progressive-enhancement CSS (D-021/D-024).
- **Focus trap:** `shared/lib/focusTrap.ts` — document-level Tab interception, edge wrapping both directions, stray-focus recovery; reusable by Phase F's SearchOverlay.
- **ThemeToggle island (T-C4):** opt-in toggle per Design §17 — flips `data-theme`, persists, updates `aria-pressed`/label; hidden on panels (forced light) and without JS; Lucide sun/moon inline SVG (astro-icon cannot render inside islands).
- **MobileMenu island (T-C2):** trigger + slide-in panel in one island (D-022): `aria-expanded`/`aria-controls`, focus-in on open, focus-trapped while open, Escape closes, focus returns to the trigger, `inert` on main/footer, scroll lock; 300ms/250ms slide per Design §29.5; `client:media` keeps it off desktop downloads (TAD §14.3); no-JS users keep the static nav (I1).
- **Header (T-C1):** frosted glass from a token-based `color-mix` (dark-adaptive), solid fallback via `@supports` + panel widths, scroll-shadow class toggle (inline script per TAD §7.2), brand signature, `aria-current` active states, panel-width nav text bump (Design §24.4).
- **Tablet dropdown (T-C3, D-020):** 768–899px overflow links collapse into a zero-JS `<details>` "More" control — natively keyboard-operable; ≥900px all inline (Design §12.5).
- **Footer (T-C5):** Design §11.11 with the v2 neutral-600 correction.
- **Composition:** BaseLayout renders SkipLink → Header → page → Footer, passing both islands through the header's actions slot; layouts may compose feature islands as a documented import-rule exception (D-023, ESLint updated).
- **Tests:** 33 new tests (65 total) — theme lib, focus trap, chrome structure, FOUC guard executed under simulated storage/panel conditions (Gate 2 evidence), MobileMenu keyboard + pointer flows (Gate 2 evidence), ThemeToggle persistence; container helper registers the Preact server renderer; condition-based `waitFor` for Preact's deferred scheduling (D-025).

## 3. Quality gate results

| Gate | Result |
|---|---|
| Typecheck | ✅ 0 errors |
| ESLint / Stylelint | ✅ 0 |
| Tests | ✅ **65/65** (33 new) |
| Build | ✅ clean |
| axe-core | ✅ zero violations at component level |

**Accessibility:** focus trap + focus-return + Escape verified by tests (WCAG 2.1.2/2.4.3); `aria-modal` dialog semantics; inert background; ThemeToggle hidden (not merely invisible) on panels and without JS; no-JS navigation preserved (I1/D-024).

**Performance:** homepage JS ≈16.6 KB gz desktop (≈18 KB mobile incl. MobileMenu chunk) ≤ 20 KB ✅; CSS 3.4 KB ≤ 15 KB ✅; MobileMenu ships only under 768px (`client:media`); ThemeToggle `client:idle` off the critical path.

**Responsive:** desktop/tablet/mobile nav switching implemented per Design §29.4 (inline → "More" dropdown → island menu); real-viewport E2E deferred to Phase H.

**Bugs found & fixed:** fixed-tick flushes raced Preact's deferred render/effect scheduling (flaky focus/inert assertions) → condition-based `waitFor` (D-025); container lacked the Preact server renderer (`NoMatchingRenderer`) → renderer registration in the container helper.

## 4. Files created / modified

**Created:** `src/features/theme/lib/theme.ts` · `src/features/theme/islands/ThemeToggle.tsx` (+ module css) · `src/shared/lib/focusTrap.ts` · `src/shared/components/MobileMenu.tsx` (+ module css) · `src/shared/components/Header.astro` · `src/shared/components/Footer.astro` · `tests/unit/components/{theme-lib,focus-trap,chrome}.test.ts` · `tests/unit/components/islands.test.tsx`

**Modified:** `src/features/theme/index.ts` (public interface) · `src/shared/layouts/BaseLayout.astro` (chrome composition, FOUC guard, chrome tokens) · `src/pages/index.astro` (activePath) · `src/env.d.ts` (CSS-module types) · `eslint.config.js` (layouts exception) · `vitest.config.ts` (.tsx specs) · `.stylelintrc.json` (module-css ignore) · `tests/unit/helpers/render.ts` (Preact renderer) · permanent docs

## 5. Decisions

D-020 (zero-JS details dropdown) · D-021 (panel lock enforcement) · D-022 (single MobileMenu island) · D-023 (layouts compose feature islands) · D-024 (js-class progressive enhancement) · D-025 (condition-based test waits).

## 6. Assumptions

- Tablet dropdown auto-close (outside click/Escape) stays native `<details>` behavior at this phase — tracked as TD-11.
- SearchTrigger deferred to Phase F (search overlay does not exist yet); header structure already accommodates it.
- Phase 2 ≙ Development Plan Phase C (numbering convention from prior phases).

## 7. Outstanding work

- **Phase 3 ≙ Dev Plan Phase D:** presentation engine (SubjectVisual/PresentationMeta/TagRow, linked-card PresentationCard per ADR-0007, gallery + detail routes, ActionRow, projector dry-run gate — needs Harshit's real Slides/Dropbox URLs, IA-2).
- TD-11 (dropdown auto-close), FI-9/FI-10 unchanged.

---

**Verdict (reconstructed from recorded gates):** Phase 2 complete — 65/65 automated checks, zero axe violations, all gates green.
