# Implementation Log

Chronological implementation history. Entries are appended, never replaced.

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
