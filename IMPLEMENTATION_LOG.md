# Implementation Log

Chronological implementation history. Entries are appended, never replaced.

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
