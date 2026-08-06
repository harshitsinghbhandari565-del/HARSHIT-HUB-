# Harshit — Personal Academic Portfolio & Presentation Hub

A single premium website serving two tightly-coupled jobs:

1. **The 10-second launch** — a blazing-fast path from "teacher asks for the presentation" to "full-screen slides on the projector" (≤3 clicks, owned segment ≤700 ms).
2. **The polished impression** — a modern, professional portfolio surface for teachers, classmates, and future recruiters.

## Architecture in one paragraph

Statically generated, content-driven site with near-zero client JavaScript: **Astro 6** with a small number of **Preact islands**, TypeScript (strict), CSS custom-property design tokens, and content as Zod-validated JSON in the repository (**Git-as-CMS**). No application server, no database, no authentication, no client-side router. Hosted on **Netlify**; the contact form uses Netlify Forms. Binding sources of truth: the Technical Architecture Document (TAD) and its ADRs.

## Folder structure

```
├── .github/workflows/ci.yml      # quality pipeline: typecheck → lint → test → build
├── public/                       # static assets (favicon, robots.txt; fonts/og added by tooling)
├── src/
│   ├── content.config.ts         # collection wiring (Astro 6 location)
│   ├── content/                  # THE CONTENT ("CMS")
│   │   ├── schemas.ts            # Zod content contract (TAD §8.1)
│   │   ├── presentations/        # one JSON file per presentation
│   │   └── site/                 # profile.json (name, tagline, contact links)
│   ├── features/                 # domain features — public API = index.ts only
│   │   ├── presentations/        # Phase D · components/ islands/ lib/
│   │   ├── search/               # Phase F
│   │   ├── theme/                # Phase C
│   │   └── contact/              # Phase G
│   ├── shared/                   # knows nothing about features
│   │   ├── ui/                   # primitives (Phase B)
│   │   ├── components/           # Header/Footer/etc. (Phase C)
│   │   ├── layouts/BaseLayout.astro
│   │   ├── lib/                  # pure utilities
│   │   ├── config/               # site.ts, subjects.ts
│   │   └── styles/               # tokens.css · tokens.dark.css · global.css · utilities.css
│   └── pages/                    # thin route composition only
├── tests/                        # unit/ (Vitest) · e2e/ (Phase H) · a11y/ (Phase H)
├── docs/                         # adr/ · operational guides (Phase H)
├── astro.config.mjs · tsconfig.json · eslint.config.js
├── .stylelintrc.json · .prettierrc.json · netlify.toml
└── DECISIONS.md · KNOWN_ISSUES.md · IMPLEMENTATION_LOG.md
```

**Import rules (lint-enforced, TAD §5.1):** `shared/` never imports `features/` or `content/`; a feature imports another feature only through its `index.ts`; `pages/` contain no business logic.

## Setup

Requires **Node ≥ 22.12** (see `.nvmrc`).

```bash
npm install        # reproducible: npm ci in CI
npm run dev        # local dev server
```

Environment: copy `.env.example` to `.env` for local overrides. This project has **no secrets** (architecture invariant I3) — only non-sensitive build-time config (`SITE_URL`).

## Scripts

| Script | Purpose |
|---|---|
| `npm run dev` / `start` | Dev server |
| `npm run build` | Production build — Zod content validation runs here (invariant I5) |
| `npm run preview` | Preview the production build |
| `npm run typecheck` | `astro check` (TypeScript strict incl. `.astro`) |
| `npm run lint` / `lint:css` | ESLint (incl. import boundaries) / Stylelint (token rules) |
| `npm run test` | Vitest unit suite |
| `npm run format` / `format:check` | Prettier |

## Development workflow

1. Branch from `main`; keep commits small and logical (one unit of work each).
2. All quality gates must pass locally before pushing: `typecheck`, `lint`, `lint:css`, `test`, `build`.
3. CI runs the same gates on every push/PR; they block merge (never advisory).
4. Architectural choices made along the way are recorded in `DECISIONS.md` (implementation-level) and `docs/adr/` (architecture-level).
5. Discovered problems go into `KNOWN_ISSUES.md` — never silently ignored.

## Repository conventions

- **TypeScript strict**; types derive from Zod schemas, never hand-duplicated.
- **Tokens only** in CSS — no hard-coded colors/spacing/radii/durations (Stylelint-enforced). `--color-neutral-400` is forbidden for text (Design Rule 11).
- **Components default to zero-JS `.astro`**; promote to a Preact island only for state/events/focus management (TAD §7.2). Islands are leaf-level (invariant I6).
- **Everything renders without JavaScript** (invariant I1) — actions are real `<a>`/`<button>` elements first.
- Naming: `PascalCase.astro` / `PascalCase.tsx` components, `camelCase.ts` modules, `kebab-case.json` content (filename = slug), booleans `is/has/can`, handlers `onX`/`handleX`.

## Deployment

- **Netlify** (ADR-0009): build `npm run build`, publish `dist/`. Deploy previews on every PR; production on merge to `main`. Headers/redirects live in `netlify.toml`.
- Rollback: Netlify one-click deploy rollback, or `git revert` for content errors (RUNBOOK arrives in Phase H).
- Security headers are live; **CSP ships in Phase H** (report-only first, then enforced — TAD §19.3).

## Project Reports

Phase-by-phase completion reports and readiness assessments (documentation synchronization, 2026-08-06):

| Report | Content |
|---|---|
| [Implementation Readiness](docs/reports/Implementation_Readiness_Report.md) | Pre-implementation assessment of the four approved documents |
| [Repository Initialization](docs/reports/Repository_Initialization_Report.md) | Foundation setup (Dev Plan Phase A) |
| [Phase 1](docs/reports/Phase_1_Report.md) | Shared Primitives & Design System (Dev Plan Phase B) |
| [Phase 2](docs/reports/Phase_2_Report.md) | Chrome & Frame (Dev Plan Phase C) |
| [Phase 3](docs/reports/Phase_3_Report.md) | Presentation Gallery & Engine (Dev Plan Phase D) |
| [Phase 4](docs/reports/Phase_4_Report.md) | Homepage / Landing Experience (Dev Plan Phase E) |
| [Phase 5](docs/reports/Phase_5_Report.md) | Global Search Experience (Dev Plan Phase F) |
| [Phase 6](docs/reports/Phase_6_Report.md) | Remaining Pages & Error Layouts (Dev Plan Phase G) |
| [Phase 7](docs/reports/Phase_7_Report.md) | Hardening & Release Candidate (Dev Plan Phase H) — identical to `Release_Candidate_Report.md` at the repo root |
| [Deployment Readiness](docs/reports/Deployment_Readiness_Report.md) | Pre-deployment verification for Vercel (2026-08-06) |

## Documentation index

| Document | Content |
|---|---|
| `IMPLEMENTATION_LOG.md` | Chronological implementation history |
| `DECISIONS.md` | Implementation decision log |
| `KNOWN_ISSUES.md` | Issues, tech debt, future improvements |
| `docs/adr/` | Architecture Decision Records (TAD §23, migration in progress) |
| `docs/ADDING-A-PRESENTATION.md` | Non-developer content guide (Phase H deliverable) |
| `docs/RUNBOOK.md` | Operations & incident procedures (Phase H deliverable) |

## How presentations are added (no code changes)

The approved mechanism (TAD ADR-0004) is **Git-as-CMS**: each presentation is one JSON file in `src/content/presentations/`, created through the GitHub web UI. The gallery, search index, sitemap, and detail pages all derive automatically; a malformed file fails the build and the live site stays untouched. The step-by-step guide for Harshit (`docs/ADDING-A-PRESENTATION.md`) is a Phase H release deliverable.

**Content contract** (Zod-enforced): `title` (≤120), `subject` (enum), `date` (ISO 8601), `tags` (≤12), `googleSlidesUrl` (Slides doc URL ending in `/present`), optional `dropboxUrl`, optional `description` (≤500), optional `order`, explicit `published` boolean, CI-written `linkHealth`.

## Configuration locations

| Concern | File |
|---|---|
| Framework & integrations | `astro.config.mjs` |
| Canonical site URL / nav / breakpoints | `src/shared/config/site.ts` (+ `SITE_URL` env) |
| Subject enum & gradients | `src/shared/config/subjects.ts` |
| Content schemas | `src/content/schemas.ts` |
| Design tokens | `src/shared/styles/tokens.css` (+ `tokens.dark.css`) |
| Lint/format/style rules | `eslint.config.js` · `.prettierrc.json` · `.stylelintrc.json` |
| Headers, redirects, build | `netlify.toml` |
| CI pipeline | `.github/workflows/ci.yml` |
