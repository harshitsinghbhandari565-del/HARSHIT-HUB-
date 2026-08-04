# Technical Architecture Document (TAD)

## Harshit — Personal Academic Portfolio & Presentation Hub

| Field | Value |
|---|---|
| **Product** | Harshit — Personal Academic Portfolio & Presentation Hub |
| **Document** | Technical Architecture Document v1.0 |
| **Author** | Frontend Architecture |
| **Product Source of Truth** | PRD v1.0 (2026-08-04) |
| **Design Source of Truth** | UI/UX Design Specification v2.0 (2026-08-04) |
| **Internal Reference** | Frontend-Architect-Knowledge-Base.md |
| **Audience** | Senior Frontend Developer (primary), Stakeholders |
| **Status** | Ready for Implementation |
| **Last Updated** | 2026-08-04 |

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Architecture Goals](#2-architecture-goals)
3. [Technology Recommendations](#3-technology-recommendations)
4. [High-Level System Architecture](#4-high-level-system-architecture)
5. [Project Folder Structure](#5-project-folder-structure)
6. [Routing Architecture](#6-routing-architecture)
7. [Component Hierarchy](#7-component-hierarchy)
8. [Data Model](#8-data-model)
9. [Content Strategy](#9-content-strategy)
10. [State Management Strategy](#10-state-management-strategy)
11. [Search Architecture](#11-search-architecture)
12. [Theme Architecture](#12-theme-architecture)
13. [Animation Strategy](#13-animation-strategy)
14. [Performance Optimization Plan](#14-performance-optimization-plan)
15. [Accessibility Plan](#15-accessibility-plan)
16. [Error Handling Strategy](#16-error-handling-strategy)
17. [SEO Strategy](#17-seo-strategy)
18. [Deployment Architecture](#18-deployment-architecture)
19. [Security Considerations](#19-security-considerations)
20. [Scalability Plan](#20-scalability-plan)
21. [Risks & Mitigations](#21-risks--mitigations)
22. [Development Guidelines](#22-development-guidelines)
23. [Architecture Decision Records](#23-architecture-decision-records)
24. [Developer Handoff](#24-developer-handoff)

---

## 1. Executive Summary

### 1.1 What This Document Does

The PRD defines **what** to build. The Design Specification defines **how it looks and behaves**. This document defines **how it is engineered** — and it is the binding technical contract for implementation.

### 1.2 The Architecture in One Paragraph

This is a **statically generated, content-driven site with near-zero client JavaScript**, built on **Astro 6** with a small number of **Preact islands** for the handful of genuinely interactive surfaces. All presentation content lives in **type-validated data files** inside the repository, consumed through Astro Content Collections with a Zod schema that fails the build on malformed data. There is no application server, no database, no authentication, and no client-side router. Pages are pre-rendered HTML served from a CDN edge. The contact form is handled by the hosting platform's built-in form service, so no backend code exists anywhere in the system.

### 1.3 Why This Shape

The product has an unusual and clarifying property: **it is a content site wearing the costume of an application.** Ten items of read-only content, no user accounts, no writes, no personalization beyond one localStorage list. The dominant requirement (O1: reach slides in ≤3 seconds under classroom pressure) is a *latency* requirement, and the lowest-latency architecture is one that ships pre-built HTML from a nearby edge node with no JavaScript in the critical path.

Every major decision follows from that. Static generation because the content changes only when Harshit edits a file. Islands because five small widgets do not justify hydrating an entire page tree. Build-time schema validation because a broken link discovered in class is a product failure, and the cheapest place to catch it is CI. No global state library because there is almost no global state once server data is removed from the equation.

### 1.4 What the Developer Is Getting

- A stack where the **default behaviour is already fast** — performance is preserved by not adding weight, rather than recovered by optimization.
- A **content pipeline that cannot silently break** — a malformed date, a missing Slides URL, or a non-`/present` link fails the build with a readable error.
- **Five interactive islands**, each independently testable, totalling a small JS budget rather than a framework runtime on every page.
- Explicit resolution of **seven conflicts and technical impossibilities** found in the source documents (§1.5) — so no architectural guessing is required during implementation.

### 1.5 Critical Findings from Source-Document Review

Reviewing the PRD and Design Spec against technical reality surfaced seven items that **must** be resolved before coding. Each is resolved in this document; the two marked ⛔ change what gets built.

| # | Finding | Where | Resolution |
|---|---|---|---|
| **F1** ⛔ | **Broken-link detection is not technically possible from the browser.** Design §20.3 specifies detecting a dead Google Slides URL and showing a warning alert. A browser cannot check a cross-origin URL's health — `fetch` is blocked by CORS, and Slides sends no permissive headers. Any client-side attempt returns an opaque result that cannot distinguish "fine" from "deleted". | Design §20.3; PRD EC-1 | Moved to **build-time + scheduled CI link checking** with a `linkHealth` field in the data model. The alert renders from data, not from a runtime probe. §16.3 |
| **F2** ⛔ | **Card + nested quick-launch button is an accessibility violation.** Design §11.2 makes the whole card clickable *and* places a "▶ Present" button inside it. Nested interactive elements produce invalid HTML, unpredictable screen-reader output, and broken keyboard semantics. | Design §11.2, §29.6 | Card restructured to the **"linked card" pattern**: title is the only anchor, expanded via pseudo-element overlay; quick-launch button layered above it. §7.4 |
| **F3** | **Hero entrance animation delays LCP.** Design §23.4 fades the hero name in with a 200 ms delay + 500 ms duration. Chrome does not count `opacity: 0` elements as painted, so the LCP element's timestamp is pushed ~700 ms later than necessary — a self-inflicted penalty on the site's single most important metric. | Design §23.4 | **LCP element exempted from entrance animation.** Hero name paints immediately; surrounding elements animate. §13.3 |
| **F4** | **"Future sections hidden" contradicts "Coming Soon" pages.** Design §28.2 is titled *"Why Future Sections Are Hidden (Not 'Coming Soon' Pages)"*, but Design §18.4 and Design §29.2 specify Coming Soon empty states at `/projects`, `/certificates`, `/resume`. | Design §28.2 vs Design §18.4 and Design §29.2 | Both honoured: routes **exist and render Coming Soon** (no 404 for shared links) but are **absent from navigation and `noindex`**. §6.4 |
| **F5** | **Panel detection by viewport width alone misfires.** Design §17/§24.4 force light mode and hide the theme toggle at ≥1920px. Ordinary desktop monitors are 1920px+ and vastly outnumber classroom panels, so most desktop users would silently lose the toggle. | Design §17.1, §24.4 | Refined to **width ≥1920px AND coarse-pointer/no-hover**, with light remaining the default everywhere regardless. §12.4 |
| **F6** | **`?dl=1` forces a file download.** Design §15.2 recommends appending `?dl=1` to Dropbox URLs. On a classroom panel this downloads a `.pptx` that may have no installed handler — the opposite of a reliable backup. | Design §15.2 | Default changed to **`?dl=0`** (in-browser preview); `dl=1` available per-item via a data field. §8.2 |
| **F7** | **The ≤3 s target spans systems we do not control.** AC-1 measures until slides are visible; Google Slides' own load time is the majority of that budget. | PRD AC-1/O1 | Budget **explicitly split** into owned vs unowned segments with a measurable internal target of ≤700 ms. §14.2 |

---

## 2. Architecture Goals

Ranked. Where goals conflict, the higher-ranked one wins — this ordering is the tie-breaker rule for every implementation decision.

| # | Goal | Derived from | Engineering expression | How verified |
|---|---|---|---|---|
| **G1** | **Launch latency** | O1, US-1, AC-1 | Pre-rendered HTML, zero render-blocking JS, prefetched detail routes, no client router on the critical path | Owned-segment budget ≤700 ms at p75 (§14.2) |
| **G2** | **Content integrity** | NFR-7, AC-7, EC-1/2 | Build fails on invalid content; every presentation carries a backup path; no runtime dependency on external services for page render | CI schema validation + scheduled link check |
| **G3** | **Zero-code content editing** | O4, FR-17, AC-9 | One file per presentation, editable in the GitHub web UI; auto-deploy on commit | A non-developer adds a presentation end-to-end using only a browser |
| **G4** | **Premium perceived quality** | O2, NFR-1 | Design tokens implemented verbatim; no layout shift; self-hosted fonts; motion that never blocks | CLS ≤0.1; visual review against spec |
| **G5** | **Accessibility to WCAG 2.2 AA** | NFR-8, AC-11, EC-11 | Semantic HTML first; `:focus-visible` everywhere; verified contrast tokens; automated + manual gates in CI | axe clean + manual keyboard pass per release |
| **G6** | **Low maintenance** | O6, NFR-5 | No server, no database, no secrets, minimal dependencies, automated dependency updates | Dependency count budget; zero-touch weeks |
| **G7** | **Extensibility without rewrite** | O4, NFR-6, US-13 | Feature-based structure, content collections pattern reusable for Projects/Certificates, documented cut-over thresholds | New section addable without touching existing features |

### 2.1 Explicit Non-Goals

Naming these prevents accidental scope inflation:

- **Not** a single-page application. No client-side router, no route-level JS state.
- **Not** offline-first. A service worker is deliberately deferred (§20.4) — it adds cache-invalidation complexity that outweighs its benefit at this scale.
- **Not** a CMS-backed system at launch. Git *is* the CMS (§9.2).
- **Not** analytics-instrumented at launch. Privacy-respecting analytics is a documented Phase 2 addition (§18.6).
- **Not** authenticated. No login, no tokens, no session — which removes the single largest frontend security surface entirely (§19.1).

---

## 3. Technology Recommendations

### 3.1 Summary Stack

| Layer | Choice | Version target | Rationale § |
|---|---|---|---|
| Meta-framework | **Astro** | 6.x (stable since 2026-03-10) | §3.2 |
| Island framework | **Preact** | 10.x via `@astrojs/preact` | §3.3 |
| Language | **TypeScript** | 5.x, `strict: true` | §3.4 |
| Styling | **Astro scoped CSS + global token layer** | Native | §3.5 |
| Content | **Astro Content Collections + Zod** | Native (Zod 4) | §3.6 |
| Fonts | **Astro Fonts API** (self-hosted) | Native to Astro 6 | §3.7 |
| Icons | **astro-icon** (build-time inline SVG) | Latest | §3.7 |
| Search | **Hand-rolled scored matcher** over build-time index | — | §11 |
| Testing | **Vitest** + **Playwright** + **axe-core** | Latest | §22.4 |
| Hosting | **Netlify** (primary) / Cloudflare Pages (alternative) | — | §18 |
| Forms | **Netlify Forms** + honeypot | — | §18.4 |
| CI | **GitHub Actions** | — | §18.5 |

### 3.2 Framework: Astro 6

**Decision.** Build with Astro 6, static output mode (`output: 'static'`).

**Rationale.** The product's dominant characteristic is that **it is content, not application**. Ten read-only records, no writes, no personalization beyond one localStorage array. Astro's default output for such a site is HTML with zero JavaScript, which is the shortest possible path to G1. Specifically:

- **Zero-JS baseline.** Every other candidate ships a framework runtime before any of our code runs. On the classroom-panel and mid-range-phone profile that matters most here, that runtime cost is pure latency against O1.
- **Islands map exactly onto this UI.** The page is static text and cards with five small interactive widgets. Islands is the architecture that models this precisely; anything else models it as "an app that happens to be mostly static."
- **Content Collections with Zod** give build-time content validation natively (G2) — the single highest-leverage reliability feature available to this product, and the direct answer to AC-7 and EC-1.
- **Astro 6 specifics that pay off immediately:** the built-in **Fonts API** self-hosts and optimizes the three specified typefaces with almost no configuration (§14.5, protecting both LCP and CLS), and the **CSP API** generates a hash-based Content Security Policy at build time (§19.3) — normally fiddly on a static host.
- **View Transitions** via `<ClientRouter />` provide the spec's 200 ms page transitions (§13.4) without adopting a client-side router.

**Alternatives considered.**

| Option | Why it loses here |
|---|---|
| **Next.js (App Router / RSC)** | Ships a React runtime for a site with almost no interactivity; RSC's mental-model and serialization complexity buys nothing without server data; the RSC boundary carries a security surface (KB §2.4) irrelevant to a static portfolio; strongest on Vercel, adding platform gravity. Correct for data-heavy apps — this is not one. |
| **SvelteKit** | Genuinely excellent and would perform comparably. Loses on two counts: still ships a component runtime on every page where Astro ships none, and Svelte's hiring pool is the smallest of the majors — relevant because the maintainer is a student who may need help later. |
| **Plain HTML + vanilla JS** | Would be fastest of all and is a serious contender at this size. Rejected because it provides no content validation, no templating for a growing gallery, no component reuse, and no build pipeline — meaning G2 (integrity) and G7 (extensibility) are both hand-rolled. The complexity saved is smaller than the discipline lost. |
| **Nuxt / Vue SPA** | Same runtime-cost objection as Next.js, without a compensating advantage for this workload. |

**Trade-offs accepted.**
- Astro's ecosystem is smaller than React's. Mitigated: this project needs almost nothing from an ecosystem — no data-fetching library, no state library, no router, no form library.
- Interactivity requires explicit island boundaries, and islands do not share state by default. Mitigated: the five islands are genuinely independent; the one cross-island concern (theme) is handled through the DOM, not shared JS state (§12.3).
- Astro joined Cloudflare in January 2026. It remains MIT-licensed with open governance, but a single-vendor steward is a concentration risk. Mitigated: the output is plain static HTML/CSS deployable anywhere, so the *exit cost* is low even though the *rewrite cost* would not be (§21, R-8).

**Consequences.** Content authoring flows through Content Collections. Interactive code must be explicitly marked as an island. Hosting is a static-file CDN. The developer must understand the server/client boundary in `.astro` files (frontmatter runs at build time only).

### 3.3 Island Framework: Preact

**Decision.** Use Preact (via `@astrojs/preact`) for the five interactive islands. Use plain `.astro` components with inline `<script>` for trivial DOM behaviour that needs no state.

**Rationale.** Five islands need real state, keyboard handling, and focus management: SearchOverlay, GalleryController, MobileMenu, ThemeToggle, ContactForm. Preact provides a component model with a ~4 KB runtime (shared across all islands — it downloads once), and a JSX API that any React-familiar developer can pick up immediately, which matters for future help.

**Alternatives considered.**
- **Vanilla TypeScript / custom elements.** Ships even less JS and is defensible at this size. Rejected because the two hardest islands (SearchOverlay and MobileMenu) require focus trapping, `aria-live` result announcements, roving focus, and Escape handling — patterns that are error-prone hand-rolled and where a component model materially reduces defect risk. Accessibility (G5) is a ranked goal; hand-rolled focus management is where accessibility usually fails.
- **React.** ~40 KB versus ~4 KB for an identical API in this use case. No feature of React is needed here.
- **Svelte islands.** Smallest compiled output, but introduces a second syntax alongside `.astro` files and a smaller hiring pool.
- **Mixing vanilla + a framework.** Rejected as a coherence cost: two mental models for "interactive component" in one small codebase is worse than one slightly heavier model.

**Trade-off.** One extra dependency and ~4 KB of shared runtime, in exchange for structured, testable, accessible interactive components. Accepted.

**Rule.** An island is justified only when a component needs **state, event handling, or focus management**. Anything that merely toggles a class on scroll is an inline script, not an island. See the island budget in §14.3.

### 3.4 Language: TypeScript, strict

**Decision.** TypeScript with `strict: true` throughout, including `.astro` frontmatter.

**Rationale.** The knowledge base treats static analysis as the cheapest testing layer, and here it does specific work: Zod schemas infer the `Presentation` type, so **the content shape and the component props are provably the same type**. Adding a field to the schema surfaces every component that must handle it. For a codebase maintained intermittently by a student, the compiler is the most reliable reviewer available.

**Trade-off.** Slightly slower authoring. Negligible at this scale, and offset by editor autocomplete over content fields.

### 3.5 Styling: Astro scoped CSS + a global token layer

**Decision.** Three-layer CSS strategy, no CSS framework:
1. **`tokens.css`** — the Design Spec §26.1 token block, verbatim, as CSS custom properties on `:root`, plus a `[data-theme="dark"]` override block.
2. **`global.css`** — reset, base element styles, typography defaults, focus-visible rule, motion preferences.
3. **Component-scoped `<style>` blocks** in `.astro` files (Astro scopes these automatically) and **CSS Modules** for Preact islands.

**Rationale.** The Design Spec has already produced a complete, verified token system expressed as CSS custom properties. The correct engineering move is to **implement that contract directly** rather than translate it into a second system. Concretely:

- **Runtime theming for free.** Dark mode becomes a `data-theme` attribute flipping custom property values — no rebuild, no class permutation, no JS re-render (§12).
- **No translation layer, no drift.** A Tailwind config would restate every token in a second vocabulary; the two would diverge the first time a designer changes a value. The knowledge base is explicit that tokens are the design/engineering contract — adding a parallel vocabulary weakens it.
- **Zero CSS runtime and near-zero unused CSS.** Astro scopes and tree-shakes component styles; only the styles for rendered components ship.
- **Design Consistency Rule 2** ("all colors come from the token palette, no hard-coded hex") becomes lint-enforceable against a single source (§22.3).

**Alternatives considered.**

| Option | Assessment |
|---|---|
| **Tailwind CSS** | Excellent for teams composing from utility scales. Here it duplicates an existing token system, and arbitrary-value escape hatches (`text-[#B45309]`) actively undermine Rule 11 (`neutral-400` never for text). The spec is not utility-shaped — it is component-shaped, with named states per component. |
| **CSS-in-JS** | Adds a runtime and a hydration cost to a site whose premise is shipping no JS. Structurally wrong here. |
| **Sass** | Would work, but Astro's native scoping plus custom properties covers everything needed. Sass variables also compile away, which is exactly wrong for runtime theming. |
| **CSS Modules everywhere** | Used for Preact islands (where Astro's scoping does not apply), but redundant for `.astro` files. |

**Trade-off.** Developers write more CSS by hand than with utilities. Accepted: the spec dictates exact values, so most CSS is transcription, and the resulting stylesheet is small enough to read in one sitting.

### 3.6 Content: Astro Content Collections + Zod

**Decision.** Presentations are a Content Collection loaded from one JSON file per presentation, validated by a Zod schema at build time.

**Rationale.** This is the mechanism that turns G2 from an aspiration into a guarantee. The schema (§8.1) enforces that `googleSlidesUrl` is a URL matching the `/present` pattern, `date` is a valid ISO date, `slug` is URL-safe, and `published` is present. **A malformed entry fails the build, so it can never reach production.** For a product whose top risk is a broken link discovered live in class, moving that failure from "in front of a teacher" to "in CI" is the highest-value reliability decision available.

**Alternative considered.** A plain imported JSON array with manual runtime checks — simpler, but validation becomes optional and drifts, and there is no generated type. Rejected: the cost difference is one schema file.

### 3.7 Supporting Libraries

**Dependency policy: every dependency must be justified against G6.** The full production dependency list is intentionally short.

| Library | Purpose | Justification |
|---|---|---|
| `@astrojs/preact` + `preact` | Island runtime | §3.3 |
| `@astrojs/sitemap` | Sitemap generation from routes | Automated; prevents drift (KB §14.2) |
| `astro-icon` | Inline SVG icons at build time | Avoids an icon-font download and renders zero-JS. Icons are inlined, not fetched. |
| `zod` | Content schema (bundled with Astro 6) | §3.6 |

**Explicitly not used:** no date library (`Intl.DateTimeFormat` is native and zero-cost), no fuzzy-search library at launch (§11.3), no animation library (CSS handles the entire motion spec, §13), no form library (one form, native validation + Preact state), no state management library (§10), no HTTP client (no runtime data fetching).

---

## 4. High-Level System Architecture

### 4.1 System Context

```
┌──────────────────────────────────────────────────────────────────┐
│ AUTHORING (Harshit / maintainer)                                 │
│   GitHub web UI → edit/add src/content/presentations/<slug>.json │
│   Commit to main                                                 │
└───────────────────────────┬──────────────────────────────────────┘
                            │ git push (webhook)
                            ▼
┌──────────────────────────────────────────────────────────────────┐
│ BUILD & CI (GitHub Actions + Netlify build)                      │
│   1. Install, typecheck (tsc --noEmit)                           │
│   2. Lint (ESLint + Stylelint + a11y rules)                      │
│   3. Zod schema validation  ← BUILD FAILS on invalid content     │
│   4. Unit tests (Vitest)                                         │
│   5. astro build → static HTML/CSS/JS + search index + sitemap   │
│   6. Bundle-size budget gate                                     │
│   7. Deploy preview → Playwright E2E + axe a11y + Lighthouse CI  │
│   8. Promote to production (atomic)                              │
└───────────────────────────┬──────────────────────────────────────┘
                            │ static artifact
                            ▼
┌──────────────────────────────────────────────────────────────────┐
│ EDGE (Netlify CDN — global PoPs)                                 │
│   Immutable hashed assets (1yr) · HTML (short TTL, revalidate)   │
│   Security headers · CSP · redirects                             │
└───────────────────────────┬──────────────────────────────────────┘
                            │ HTTPS
                            ▼
┌──────────────────────────────────────────────────────────────────┐
│ BROWSER                                                          │
│   Static HTML paints (no JS required for any content)            │
│   ├─ Inline theme script (blocking, <1KB) — prevents FOUC        │
│   ├─ Islands hydrate on idle/visible/interaction                 │
│   └─ localStorage: theme · recentPresentations                   │
└───────┬──────────────────────────────────┬───────────────────────┘
        │ user-initiated, new tab          │ POST (contact only)
        ▼                                  ▼
┌───────────────────┐              ┌──────────────────────┐
│ Google Slides     │              │ Netlify Forms        │
│ Dropbox           │              │ (+ honeypot filter)  │
│ (external, uncontrolled)         │ → email notification │
└───────────────────┘              └──────────────────────┘
```

### 4.2 Architectural Invariants

These are non-negotiable properties. A change that violates one is an architectural change requiring a new ADR.

| # | Invariant | Why |
|---|---|---|
| **I1** | **All content renders without JavaScript.** Every page's text, cards, meta, and both action links exist in the served HTML. | G1 + G5 + G2: the site works if an island fails, if JS is blocked, or on a locked-down school network. |
| **I2** | **No runtime dependency on Google/Dropbox for page render.** External services are only touched when the user clicks. | EC-1/EC-2/EC-3: an outage degrades one button, never a page. |
| **I3** | **No secrets exist in the system.** No API keys, no tokens, no auth. | Removes the largest class of frontend security risk (§19.1). |
| **I4** | **Content is data, never code.** No presentation detail is hard-coded in a component. | FR-17 / AC-9. |
| **I5** | **The build is the validation gate.** Invalid content cannot deploy. | G2. |
| **I6** | **Islands are leaf-level and independent.** No island wraps a page; no island depends on another island's state. | Preserves I1 and keeps the JS budget bounded. |

### 4.3 Data Flow

**Build time (the only time content is read):**
```
src/content/presentations/*.json
  → Zod validation (fail fast)
  → getCollection('presentations')
  → filter(published === true)
  → sort/derive
  ├─→ Static HTML for / , /presentations , /presentations/[slug]
  ├─→ /search-index.json  (title, subject, tags, slug, date — no descriptions)
  └─→ /sitemap-index.xml
```

**Runtime (browser only):**
```
localStorage.recentPresentations ──┐
                                   ├─→ RecentRail island reorders pre-rendered cards
JSON-LD date ordering (fallback) ──┘

URL ?q= & ?sort= ──→ GalleryController island filters/sorts pre-rendered DOM
/search-index.json ──→ SearchOverlay island (fetched on first open, then cached)
```

**Note the direction:** islands *enhance pre-rendered DOM*; they do not render content from scratch. This is what preserves I1.

---

## 5. Project Folder Structure

The project structure is feature-based at the top level, with the strict import rules that make the structure real rather than cosmetic (KB §3.2).

```
harshit-portfolio/
├── .github/workflows/
│   ├── ci.yml                       # typecheck, lint, test, build, budget, a11y
│   └── link-check.yml               # scheduled weekly external link health (§16.3)
├── public/
│   ├── fonts/                       # self-hosted woff2 (managed by Astro Fonts API)
│   ├── og/                          # pre-generated Open Graph images
│   ├── favicon.svg
│   └── robots.txt
├── src/
│   ├── content/                     # ── CONTENT (the "CMS") ──
│   │   ├── config.ts                # Zod schemas — THE content contract
│   │   ├── presentations/
│   │   │   ├── photosynthesis.json  # one file per presentation
│   │   │   └── ...
│   │   └── site/
│   │       ├── about.md             # long-form About copy
│   │       └── profile.json         # name, tagline, contact links, SEO defaults
│   │
│   ├── features/                    # ── FEATURES (domain-owned) ──
│   │   ├── presentations/
│   │   │   ├── components/          # PresentationCard.astro, SubjectVisual.astro,
│   │   │   │                        # ActionRow.astro, PresentationMeta.astro,
│   │   │   │                        # TagRow.astro, LinkHealthAlert.astro
│   │   │   ├── islands/             # GalleryController.tsx, RecentRail.tsx,
│   │   │   │                        # QuickLaunch.tsx
│   │   │   ├── lib/                 # sorting.ts, recency.ts, slidesUrl.ts, launch.ts
│   │   │   └── index.ts             # PUBLIC INTERFACE — only legal import path
│   │   ├── search/
│   │   │   ├── islands/             # SearchOverlay.tsx, SearchInput.tsx
│   │   │   ├── lib/                 # matcher.ts, index-builder.ts, normalize.ts
│   │   │   └── index.ts
│   │   ├── theme/
│   │   │   ├── islands/             # ThemeToggle.tsx
│   │   │   ├── lib/                 # theme.ts, inline-script.ts (FOUC guard)
│   │   │   └── index.ts
│   │   └── contact/
│   │       ├── components/          # ContactDetails.astro, PrivacyNote.astro
│   │       ├── islands/             # ContactForm.tsx
│   │       └── index.ts
│   │
│   ├── shared/                      # ── SHARED (knows nothing of features) ──
│   │   ├── ui/                      # Button.astro, Tag.astro, Alert.astro,
│   │   │                            # EmptyState.astro, Skeleton.astro,
│   │   │                            # Breadcrumb.astro, SectionOverline.astro,
│   │   │                            # IconButton.astro, VisuallyHidden.astro
│   │   ├── layouts/                 # BaseLayout.astro, PageLayout.astro
│   │   ├── components/              # Header.astro, Footer.astro, SkipLink.astro,
│   │   │                            # SeoHead.astro, JsonLd.astro
│   │   ├── lib/                     # formatDate.ts, cn.ts, focusTrap.ts,
│   │   │                            # prefersReducedMotion.ts, slugify.ts
│   │   ├── styles/
│   │   │   ├── tokens.css           # Design Spec §26.1 — VERBATIM
│   │   │   ├── tokens.dark.css      # [data-theme="dark"] overrides
│   │   │   ├── global.css           # reset, base, focus-visible, motion
│   │   │   └── utilities.css        # .visually-hidden, .container, .stack
│   │   └── config/
│   │       ├── site.ts              # URL, title, nav links, breakpoints
│   │       └── subjects.ts          # subject → gradient/colour map
│   │
│   └── pages/                       # ── ROUTES (composition only) ──
│       ├── index.astro
│       ├── presentations/
│       │   ├── index.astro
│       │   └── [slug].astro
│       ├── about.astro
│       ├── contact.astro
│       ├── projects.astro           # Coming Soon, noindex
│       ├── certificates.astro       # Coming Soon, noindex
│       ├── resume.astro             # Coming Soon, noindex
│       ├── search-index.json.ts     # build-time endpoint → static JSON
│       ├── 404.astro
│       └── 500.astro
├── tests/
│   ├── unit/                        # Vitest — lib functions, matcher, recency
│   ├── e2e/                         # Playwright — critical journeys
│   └── a11y/                        # axe-core scans
├── docs/
│   ├── adr/                         # ADR-0001..NNNN (§23)
│   ├── ADDING-A-PRESENTATION.md     # ← the AC-9 deliverable, written for a non-dev
│   └── RUNBOOK.md                   # deploy, rollback, link-check, incident
├── astro.config.mjs
├── tsconfig.json
├── eslint.config.js
├── .stylelintrc.json
├── netlify.toml                     # headers, redirects, CSP, form config
└── package.json
```

### 5.1 Import Rules (enforced, not advisory)

These three rules are what make the structure durable. They are enforced by ESLint `no-restricted-imports` and fail CI (§22.3).

| # | Rule | Rationale |
|---|---|---|
| **1** | `shared/**` must **never** import from `features/**` or `content/**`. | Prevents dependency cycles and keeps shared code genuinely reusable (KB §1.4). |
| **2** | A feature may import another feature **only through its `index.ts`** — never a deep path. | Preserves replaceability; makes the public surface explicit. |
| **3** | `pages/**` composes features and shared; it contains **no business logic**. | Keeps routes thin and logic testable without rendering. |

**Fourth rule, by convention:** code is promoted into `shared/` only when a **second** consumer actually exists — never in anticipation (KB §1.5, rule of three).

### 5.2 Naming Conventions

| Artifact | Convention | Example |
|---|---|---|
| Astro components | `PascalCase.astro` | `PresentationCard.astro` |
| Preact islands | `PascalCase.tsx` | `SearchOverlay.tsx` |
| Library modules | `camelCase.ts` | `formatDate.ts` |
| CSS Modules | `PascalCase.module.css` | `SearchOverlay.module.css` |
| Content files | `kebab-case.json`, filename = slug | `photosynthesis.json` |
| CSS custom properties | Design Spec names, **verbatim** | `--color-focus` |
| Test files | `*.test.ts` / `*.spec.ts` | `matcher.test.ts` |
| Booleans | `is` / `has` / `can` prefix | `isPublished`, `hasBackup` |
| Handlers | `onX` prop, `handleX` implementation | `onSelect` / `handleSelect` |

---

## 6. Routing Architecture

### 6.1 Route Table

All routes are statically generated. There is no client-side router; `<ClientRouter />` provides View Transitions over real navigations.

| Path | Source | Generation | In nav? | Indexed? | Notes |
|---|---|---|---|---|---|
| `/` | `pages/index.astro` | Static | ✅ | ✅ | Hero + rail + teasers |
| `/presentations` | `pages/presentations/index.astro` | Static | ✅ | ✅ | All published; search/sort via query params |
| `/presentations/[slug]` | `[slug].astro` + `getStaticPaths()` | Static, one page per published item | — | ✅ | Detail + Present + Backup |
| `/about` | `pages/about.astro` | Static from `content/site/about.md` | ✅ | ✅ | |
| `/contact` | `pages/contact.astro` | Static | ✅ | ✅ | Form island + details |
| `/projects` | `pages/projects.astro` | Static | ❌ | ❌ `noindex` | Coming Soon (§6.4) |
| `/certificates` | `pages/certificates.astro` | Static | ❌ | ❌ `noindex` | Coming Soon |
| `/resume` | `pages/resume.astro` | Static | ❌ | ❌ `noindex` | Coming Soon |
| `/search-index.json` | `search-index.json.ts` | Static endpoint | — | ❌ | Built artifact, not a page |
| `/404` | `pages/404.astro` | Static | — | ❌ | Friendly recovery (EC-12) |
| `/500` | `pages/500.astro` | Static | — | ❌ | Host-level fallback |

### 6.2 URL Design Principles

URLs are the most durable contract in the system (KB §7.1) and are treated accordingly:

- **Slugs are human-readable and stable** (`/presentations/photosynthesis`). The slug is the filename, so renaming a file changes a URL — this is explicitly documented as a **breaking change** in `ADDING-A-PRESENTATION.md`.
- **No internal IDs in URLs.** Nothing enumerable, nothing revealing structure.
- **Query parameters carry view state, not identity:** `?q=`, `?sort=`. Never indexed (canonical tag always points to the clean path, §17.3).
- **Slug changes require a permanent redirect.** A `netlify.toml` redirect table is maintained; entries are never deleted.

### 6.3 Click-Depth Verification (AC-1)

| Journey | Clicks | Path |
|---|---|---|
| Home → present (via rail) | **3** | card → detail → Present |
| Home → present (rail quick-launch, desktop) | **2** | quick-launch → Slides |
| Home → present (via gallery) | **3** | View Presentations → card → detail → Present ⚠️ |
| Home → present (via search) | **3** | search icon → result → Present |
| Any page → Contact | **1–2** | nav → Contact |

⚠️ **The gallery route is 4 interactions, not 3.** AC-1 requires ≤3 clicks for *every* presentation. The rail covers only 3 items. **Resolution:** the header search (one click to open, type, one click on a result → detail, one click Present = 3) is the guaranteed ≤3-click path for *all* presentations, which is why search is promoted to the global header rather than living only in the gallery (Design §10.3 permits this: "optionally the header"). **This makes header search an AC-1 requirement, not an optional enhancement** — implement it in Phase 1.

### 6.4 Future Sections — Resolving F4

The Design Spec conflicts with itself: Design §28.2 argues for hiding future sections, while Design §18.4 and Design §29.2 specify Coming Soon pages. Both intents are satisfiable:

| Aspect | Decision | Serves |
|---|---|---|
| Route exists | ✅ Yes | A shared/typed URL never 404s |
| Renders | Coming Soon `EmptyState` + "Back to Home" | Design §18.4; EC-10 |
| In global nav | ❌ No | Design §28.2 — no unfinished impression |
| In sitemap | ❌ No | Prevents thin-content indexing |
| Meta robots | `noindex, follow` | SEO hygiene (§17) |

Adding real content later is a three-step change: write content, remove `noindex`, add the nav link. No structural work.

### 6.5 Transitions and Prefetch

- **View Transitions** via `<ClientRouter fallback="swap" />` in `BaseLayout` — 200 ms cross-fade (Design §29.5), automatically disabled under `prefers-reduced-motion`.
- **Prefetch on intent.** `prefetch` enabled with `defaultStrategy: 'hover'`, and `data-astro-prefetch="viewport"` on rail cards specifically. Detail pages are small static HTML, so by the time the user's click lands the page is usually already cached. **This is the single largest contributor to the ≤3 s goal within our control** (§14.2).
- **"Back to Presentations"** uses `history.back()` when `document.referrer` is same-origin and matches `/presentations`; otherwise a normal link to `/presentations` (Design §15.2). Implemented as a real `<a href="/presentations">` with a progressive-enhancement click handler, so it works without JS (I1).

---

## 7. Component Hierarchy

This section defines the component architecture: how components are classified, when they ship JavaScript, and how they compose into pages.

### 7.1 Classification

Components are classified by **domain awareness and reuse scope** (KB §4.2), not by visual complexity. The question that resolves every placement: *does this component know about presentations?*

| Tier | Location | Knows domain? | Interactive? |
|---|---|---|---|
| **Primitives** | `shared/ui/` | No | Mostly no |
| **Layout/chrome** | `shared/components/`, `shared/layouts/` | No | Header only |
| **Feature components** | `features/*/components/` | Yes | No — static `.astro` |
| **Islands** | `features/*/islands/` | Yes | Yes — Preact |
| **Pages** | `pages/` | Yes | No — composition only |

### 7.2 Static vs Island Decision Rule

> **Default to `.astro` (zero JS). Promote to a Preact island only if the component needs state, event handling, or focus management.**

Applying this to the Design Spec §29.1 inventory:

| Component | Type | Why |
|---|---|---|
| PrimaryButton / SecondaryButton / GhostButton / IconButton | `.astro` | Renders `<a>` or `<button>`; hover/focus/active are pure CSS |
| PresentationCard | `.astro` | Static markup; hover is CSS |
| Tag / TagOverflow | `.astro` | Overflow computed at build time |
| SubjectVisual | `.astro` | Gradient from a config map |
| Alert / EmptyState / Skeleton / Breadcrumb / Footer / SectionOverline / PrivacyNote | `.astro` | Presentational |
| NavigationHeader | `.astro` + inline script | Scroll shadow is a class toggle — not island-worthy |
| **MobileMenu** | **Island** | Open state, focus trap, Escape, `inert` on background |
| **ThemeToggle** | **Island** | State, persistence, panel-visibility logic |
| **SearchOverlay + SearchInput** | **Island** | Query state, async index fetch, focus trap, live announcements |
| **GalleryController** (SearchInput + SortDropdown + grid) | **Island** | Filter/sort state, URL sync, FLIP reorder |
| **RecentRail** | **Island** | Reads localStorage, reorders pre-rendered cards |
| **QuickLaunch** | Part of RecentRail island | Desktop-hover launch affordance |
| **ContactForm** | **Island** | Validation, submit, success/error state |
| Toast | `.astro` shell + island control | Rendered by ContactForm island |

**Result: 6 island entry points sharing one Preact runtime.** Three of them (`MobileMenu`, `SearchOverlay`, `ContactForm`) never appear on the homepage critical path.

### 7.3 Page Composition

```
BaseLayout.astro  ── <html>, <head>, SeoHead, JsonLd, tokens, ClientRouter,
│                     inline theme script (blocking), SkipLink
├── Header.astro                       [.astro + inline script]
│   ├── BrandLink                      [.astro]
│   ├── NavLinks / TabletNav("More ▾") [.astro + inline script]
│   ├── SearchTrigger                  [.astro button → opens island]
│   ├── ThemeToggle                    [ISLAND · client:idle]
│   └── MobileMenuTrigger              [.astro button → opens island]
├── MobileMenu                         [ISLAND · client:media(max-width:767px)]
├── SearchOverlay                      [ISLAND · client:idle]
├── <main id="main-content">
│   │
│   ├── / ────────────────────────────────────────────────────────
│   │   ├── HeroSection                [.astro]  ← LCP element here
│   │   ├── RecentOrLatestSection      [ISLAND · client:load]
│   │   │     └── PresentationCard[]   [.astro, server-rendered inside island slot]
│   │   ├── AboutTeaserSection         [.astro]
│   │   └── ContactTeaserSection       [.astro]
│   │
│   ├── /presentations ───────────────────────────────────────────
│   │   ├── PageHeader                 [.astro]
│   │   └── GalleryController          [ISLAND · client:load]
│   │         └── PresentationCard[]   [.astro, server-rendered]
│   │
│   ├── /presentations/[slug] ────────────────────────────────────
│   │   ├── Breadcrumb                 [.astro]
│   │   ├── SubjectVisual              [.astro]
│   │   ├── PresentationMeta           [.astro]
│   │   ├── <h1> title                 [.astro]
│   │   ├── TagRow                     [.astro]
│   │   ├── ActionRow                  [.astro]  ← Present + Backup, real <a> tags
│   │   ├── InfoNote (sign-in hint)    [.astro]
│   │   ├── LinkHealthAlert            [.astro, conditional on data]
│   │   └── Description                [.astro]
│   │
│   ├── /about · /contact · Coming Soon pages
│   │
└── Footer.astro                       [.astro]
```

**Critical detail:** cards inside `RecentRail` and `GalleryController` are **server-rendered Astro components passed as island children** (via `<slot />`). The island reorders and filters existing DOM; it does not construct cards in JavaScript. This preserves I1 — with JS disabled, all cards are present and correct, merely unfiltered.

### 7.4 PresentationCard — Resolving F2

The Design Spec makes the entire card clickable **and** nests a "▶ Present" button inside it. Nested interactive elements are invalid HTML and produce unpredictable screen-reader and keyboard behaviour. Required restructure — the **linked-card pattern**:

```
<article class="card">                       ← NOT interactive
  <SubjectVisual aria-hidden="true" />
  <div class="card__meta">Subject · Date</div>
  <h3 class="card__title">
    <a href="/presentations/{slug}" class="card__link">{title}</a>   ← the ONLY link
  </h3>                                       ← ::after overlay expands hit area
  <TagRow />
  <button class="card__quick-launch">…</button>  ← z-index above overlay; rail only
</article>
```

Rules:
1. **One anchor per card**, wrapping the title. Its accessible name is the presentation title — meaningful in a screen-reader link list (NFR-8).
2. **Hit area expanded** by `.card__link::after { position:absolute; inset:0; }` — full-card click without wrapping other content in the anchor.
3. **Quick-launch sits above** the overlay (`position: relative; z-index: 1`), so it is independently clickable and independently focusable.
4. **Quick-launch is `@media (hover: hover) and (pointer: fine)` only** — never rendered on touch (Design §29.4), and it must **not** be `display:none` from the accessibility tree on desktop; it is visually revealed on hover/focus-within but always focusable by keyboard.
5. **Text selection preserved** — the overlay does not block selecting the title.
6. **Card is `<article>`**, and the rail/grid is a `<ul>`/`<li>` so screen readers announce item counts (Design §25.4).

### 7.5 Component Contracts

Shared components are treated as published APIs (KB §4.5). Two rules with teeth:

**Discriminated unions over boolean soup.** The link-health state is modelled so impossible states cannot be represented:
```ts
type LinkHealth =
  | { status: 'ok' }
  | { status: 'slides-down'; checkedAt: string }
  | { status: 'backup-down'; checkedAt: string }
  | { status: 'both-down';  checkedAt: string };
```
This makes "Present disabled AND Backup emphasised" a single renderable state rather than a combination of flags that can drift.

**Button as one component, not three.** `Button.astro` takes `variant: 'primary' | 'secondary' | 'ghost'` and renders `<a>` when `href` is present, `<button>` otherwise. This centralises the "a link navigates, a button acts" rule (KB §9.3) — the distinction that most often breaks middle-click and screen-reader expectations.

---

## 8. Data Model

### 8.1 Presentation Schema

Defined in `src/content/config.ts`; this is the enforced content contract. Extensions beyond the Design Spec §29.8 baseline are marked ★ and justified.

```ts
const presentation = z.object({
  // ── Identity ──
  title:       z.string().min(1).max(120),
  subject:     z.enum(SUBJECTS),          // ★ enum, not string — see 8.3
  date:        z.coerce.date(),           // ISO 8601, coerced + validated
  tags:        z.array(z.string().min(1).max(30)).max(12).default([]),

  // ── External sources ──
  googleSlidesUrl: z.string().url()
    .refine(u => /docs\.google\.com\/presentation\/d\/[\w-]+/.test(u),
            'Must be a Google Slides document URL')
    .refine(u => u.includes('/present'),
            'Must end in /present so it opens in presentation mode'),
  dropboxUrl: z.string().url()
    .refine(u => u.includes('dropbox.com'), 'Must be a Dropbox URL')
    .optional(),                          // ★ optional — see 8.2
  forceDownload: z.boolean().default(false),  // ★ F6 — dl=1 opt-in

  // ── Publication ──
  published: z.boolean(),                 // required, no default (deliberate)
  order:     z.number().int().optional(),
  description: z.string().max(500).optional(),

  // ── Operational (written by CI, not by hand) ──
  linkHealth: z.object({                  // ★ F1 — see 8.4
    slides:    z.enum(['ok','unreachable','unknown']).default('unknown'),
    dropbox:   z.enum(['ok','unreachable','unknown','absent']).default('unknown'),
    checkedAt: z.string().datetime().optional(),
  }).default({ slides:'unknown', dropbox:'unknown' }),
});
```

`slug` is **not** a field — it is derived from the filename, which guarantees uniqueness structurally (two files cannot share a name) and prevents the class of bug where two entries declare the same slug.

### 8.2 Schema Decisions and Their Reasons

| Field | Decision | Rationale |
|---|---|---|
| `subject` | **Enum, not free string** | Subject drives the gradient map (Design §11.2.1). A typo ("Sciene") in a free string produces a silently unstyled card. An enum fails the build with a list of valid values. Adding a subject is a two-line change in `subjects.ts`. |
| `dropboxUrl` | **Optional** | Design §29.8 marks it required, but EC-2 explicitly describes a presentation with no working backup. Requiring it would force fake URLs, which is worse than modelling absence honestly. UI adapts (§16.4). |
| `forceDownload` | **New, defaults `false`** | **Resolves F6.** `?dl=1` downloads a `.pptx` that a classroom panel may be unable to open. Default `?dl=0` previews in-browser — the more reliable classroom fallback. Per-item override retained. |
| `published` | **Required, no default** | A default of `true` risks accidental publication; a default of `false` risks silent invisibility. Forcing an explicit choice makes intent unambiguous (Design §29.8 management rules). |
| `linkHealth` | **New, CI-written** | **Resolves F1.** See §8.4. |
| `date` | `z.coerce.date()` | Catches `"2026-13-45"` at build time; yields a real `Date` for sorting. |
| `tags` | Max 12, each ≤30 chars | Bounds the overflow UI (Design §13.3) at the data layer rather than trusting CSS to cope. |

### 8.3 Derived Data (computed at build, never stored)

| Value | Derivation |
|---|---|
| `slug` | Filename without extension |
| `isRecent` | Top 3 by date when no localStorage recency exists |
| `formattedDate` | `Intl.DateTimeFormat('en-IN', { dateStyle:'medium' })` |
| `subjectGradient` | `subjects.ts` lookup |
| `presentUrl` | `googleSlidesUrl` normalised to `/present` |
| `backupUrl` | `dropboxUrl` + `?dl=0` or `?dl=1` per `forceDownload` |
| `visibleTags` / `overflowCount` | First 4 + `+N more` on cards; all on detail (Design §13.3) |

**Principle:** derive, never duplicate (KB §5.3). Storing `formattedDate` alongside `date` guarantees eventual divergence.

### 8.4 Link Health — Resolving F1

**The problem.** Design §20.3 requires detecting a dead Slides link and showing a warning. This is **not achievable in the browser**: cross-origin `fetch` to `docs.google.com` is blocked by CORS; `no-cors` mode returns an opaque response indistinguishable between 200 and 404; Slides sets `X-Frame-Options`, so an iframe probe fails identically for healthy and dead links. Any client-side implementation would produce false alarms on working presentations — worse than no check at all.

**The architecture.** Move the check to where cross-origin requests are unrestricted: **CI**.

```
.github/workflows/link-check.yml   (weekly + manual dispatch)
  → for each published presentation:
      HEAD (fall back to GET) googleSlidesUrl and dropboxUrl
  → classify: ok | unreachable
  → if changed: commit updated linkHealth into the content file → triggers rebuild
  → if any unreachable: open/update a GitHub issue (the notification channel)
```

**Consequences.**
- The warning alert (Design §20.3) renders from **build-time data**, so it is server-rendered, requires no JS, and cannot false-positive.
- Detection lag is up to one week. Accepted: the Dropbox backup is **always visible regardless of health status**, so a stale-healthy record never leaves the user without a path. This is a deliberate reversal of Design §20.3's conditional display — showing the backup unconditionally is strictly more robust and costs one button.
- Directly satisfies AC-7 ("all external links valid at release") with evidence rather than assertion.

### 8.5 Site Content Model

`content/site/profile.json` — name, tagline, overline, email, social links, SEO defaults, `aboutTeaser`, `contactTeaser`. Also Zod-validated. **Nothing display-facing is hard-coded in a component** (I4), so the tagline can change without a developer.

### 8.6 Example Content File

```json
{
  "title": "Photosynthesis: How Plants Make Food",
  "subject": "Science",
  "date": "2026-08-02",
  "tags": ["biology", "plants", "energy"],
  "googleSlidesUrl": "https://docs.google.com/presentation/d/1AbC.../present",
  "dropboxUrl": "https://www.dropbox.com/s/xyz/photosynthesis.pptx",
  "forceDownload": false,
  "description": "An overview of the photosynthesis process...",
  "published": true,
  "order": 1
}
```

---

## 9. Content Strategy

### 9.1 The Requirement

FR-17 / AC-9 / O4: adding a presentation must require **no code changes** and must be documented. This is a Must-Have acceptance criterion, so the mechanism is architectural, not incidental.

### 9.2 Decision: Git-as-CMS with a Web-UI Authoring Path

**Decision.** Content lives as JSON files in `src/content/presentations/`. Harshit adds a presentation by creating a file through the **GitHub web interface** — no local environment, no terminal, no build tools. Commit triggers deploy.

**Why this satisfies "no code changes" honestly.** The distinction that matters is not "text file vs. database" but **"does the author touch application logic?"** Adding a JSON file to a content directory is a *content* operation: no component is edited, no route registered, no build config touched. The gallery, search index, sitemap, and detail page all derive automatically.

**The authoring flow (documented in `docs/ADDING-A-PRESENTATION.md`, written for a non-developer):**

```
1. In Google Slides: Share → "Anyone with the link" → Viewer.       ← prevents the #1 classroom failure
2. Copy the URL; replace everything after the ID with /present.
3. Upload the same deck to Dropbox; copy the share link.
4. GitHub → src/content/presentations/ → "Add file" → "Create new file".
5. Name it my-topic.json  (this becomes the URL: /presentations/my-topic).
6. Paste the template; fill in the fields.
7. "Commit changes" → live in ~2 minutes.
```

Step 1 is placed first deliberately: the Google sign-in interstitial (Design §20.7) is a *content-authoring* failure, and the cheapest fix is making the sharing step the first instruction rather than a troubleshooting note.

**Safety net.** If a field is wrong, the build **fails and the live site is unchanged** — Netlify only promotes successful builds. Harshit receives an email with the Zod error naming the file and field. **A bad edit can never break the live site**, which is the property that makes handing content control to a non-developer safe.

**Alternatives considered.**

| Option | Assessment |
|---|---|
| **Headless CMS** (Sanity/Contentful) | Nicest authoring UI, but adds an account, a runtime dependency, a free-tier risk, and a second source of truth. Violates G6. Content changes a handful of times per term — the UI polish does not justify a permanent external dependency. |
| **Git-based CMS** (Decap/Tina) | A visual editor over the same Git files — genuinely attractive. Deferred, not rejected: it requires an auth layer (OAuth proxy or Netlify Identity), reintroducing the auth surface I3 eliminates. **Documented as the Phase 2 upgrade** if the GitHub UI proves too rough (§20.3). The content model needs no change to adopt it. |
| **Google Sheets as source** | Familiar to a student, but adds a build-time network dependency and an API key, and offers no validation. |
| **Hard-coded array in a `.ts` file** | Fails AC-9 on its face — that *is* a code change. |

**Trade-offs accepted.** JSON syntax is unforgiving (a missing comma fails the build) — mitigated by a copy-paste template, a clear error email, and the guarantee that failure is safe. No preview before publish — mitigated by `published: false` staging plus Netlify deploy previews on branches.

### 9.3 Content Governance

| Concern | Mechanism |
|---|---|
| Staging unfinished work | `published: false` — file exists, site ignores it (Design §29.8) |
| Unpublishing | Flip to `false`; the record and its history remain |
| Ordering | `order` field overrides date sort |
| Deleting | Delete the file **and** add a 301 redirect in `netlify.toml` (§6.2) |
| Bulk edits | Multiple files in one commit → one build |
| Rollback | `git revert` → previous state redeploys |

### 9.4 Editorial Rules (in the authoring doc)

- **Titles** ≤120 chars; cards clamp to 2 lines, detail pages never truncate (Design §15.3).
- **Tags** lowercase, ≤12 per item; reuse existing tags — they are the search vocabulary (§11).
- **Descriptions** optional; 1–3 sentences, meaningful for SEO (used as `<meta description>`).
- **Every presentation should have a Dropbox backup.** Optional in the schema for honesty, but the doc treats it as expected practice.

---

## 10. State Management Strategy

### 10.1 The Analysis That Determines the Answer

Applying the knowledge base's state-category framework (KB §5.1) to this product:

| Category | Present? | Handling |
|---|---|---|
| **Server state** | **None at runtime.** All data is baked in at build. | No data-fetching library, no cache, no invalidation, no loading states for content |
| **URL state** | Search query, sort order | `?q=`, `?sort=` — shareable, back-navigable |
| **Local UI state** | Menu open, overlay open, form fields, dropdown open | Component-local island state |
| **Persisted client state** | Theme, recent presentations | `localStorage`, two keys |
| **Form state** | Contact form only | Local island state + native validation |
| **Global client state** | **None** | — |

**Conclusion: no state management library is warranted.** The knowledge base notes that once server state is properly handled, genuine global client state usually collapses to almost nothing. Here it collapses to *zero* — because the "server state" was eliminated entirely by static generation. Adding a store would be complexity with no corresponding problem.

### 10.2 Per-Category Implementation

**URL state — gallery search and sort**
- `GalleryController` island reads `?q=` and `?sort=` on mount, writes with `history.replaceState` (avoids polluting history on every keystroke) and `pushState` on sort change (a deliberate, back-navigable action).
- Debounced 250 ms on input.
- **Why the URL:** shareable ("look at these Science ones"), survives refresh, back-button correct, and — importantly here — readable by the server-rendered page, so a shared filtered link works even before JS loads (the page renders all cards; the island then filters).

**Persisted state — theme** (`localStorage['theme']`)
- Written by `ThemeToggle`; read by a blocking inline script in `<head>` before first paint (§12.2).

**Persisted state — recency** (`localStorage['recentPresentations']`)
```ts
type RecencyEntry = { slug: string; at: number };  // max 5, newest first
```
- Written on any Present activation (detail button or rail quick-launch).
- Read by `RecentRail` to reorder pre-rendered cards and switch the heading between "Recent Presentations" and "Latest Presentations" (Design §13.2).
- **Storage discipline:** wrapped in try/catch (Safari private mode throws on write), validated on read (corrupt/foreign data → discard and fall back), and stale slugs (deleted presentations) filtered against rendered cards.

**Local state** — plain `useState` inside islands. No context, no props drilling deeper than two levels.

### 10.3 Cross-Island Communication

Only one concern crosses island boundaries: **theme**. It is handled through the **DOM, not shared JS state** — `ThemeToggle` sets `document.documentElement.dataset.theme`, and CSS custom properties cascade. Nothing else needs to know.

This is deliberate: it keeps islands independent (I6), requires no event bus or shared store, and works even if another island fails to hydrate. If a second cross-island concern ever appears, the correct escalation is a tiny `CustomEvent` on `document` — still not a library.

### 10.4 Recency Fallback Logic (Design §13.2)

```
render (build): rail slot contains top-3 by date, heading = "Latest Presentations"
                ↓  (page is correct and complete with zero JS — I1)
hydrate:  read localStorage.recentPresentations
          ├─ empty/absent/corrupt → leave as-is. No flicker, no work.
          └─ valid → filter to slugs that still exist
                     ├─ none survive → leave as-is
                     └─ some survive → reorder DOM, swap heading to "Recent Presentations"
```

**Server-render the fallback, not the personalized state.** The common case (first-time visitor: teacher, classmate, recruiter) requires zero client work and shows no flicker. Only the returning owner pays a small reorder cost. This also means the homepage above-the-fold content is correct in the HTML for crawlers and no-JS users (Design §13.5 checklist).

---

## 11. Search Architecture

### 11.1 Requirements

FR-2 / US-3 / AC-5: search across title, subject, and tags, with a proper empty state. Design §16 specifies an overlay; §14.2 specifies inline gallery search. §6.3 of this document establishes header search as **AC-1-critical**, since it is the only ≤3-click path to *every* presentation.

### 11.2 Decision: Build-Time Index + Hand-Rolled Scored Matcher

**Decision.** Emit a static `/search-index.json` at build; client-side scored matching in the SearchOverlay island; the gallery filters already-rendered DOM.

**Index shape** (deliberately minimal — this file is on the interaction path):
```json
[{ "s":"photosynthesis", "t":"Photosynthesis: How Plants Make Food",
   "u":"Science", "g":["biology","plants","energy"], "d":"2026-08-02" }]
```
Descriptions are excluded: they multiply payload for marginal recall against a ten-item corpus. Short keys keep the file small enough that compression dominates.

**Sizing:** ~150 bytes/item → ~1.5 KB for 10 items, ~15 KB at 100 items, before Brotli. Fetched on **first overlay open**, then held in memory — so it costs nothing for the majority of visitors who never search.

**Matching algorithm** (~40 lines, no dependency):
```
normalize: lowercase, strip diacritics, trim, collapse whitespace
tokenize query on whitespace; every token must match somewhere (AND semantics)
score per field:  title exact 100 · title prefix 60 · title substring 40
                  subject match 30 · tag exact 25 · tag prefix 15
sort by score desc, then date desc
```
AND-across-tokens is correct for a small corpus: "science energy" should narrow, not widen. Weighting title above tags matches how people recall their own talks.

**Alternatives considered.**

| Option | Assessment |
|---|---|
| **Fuse.js / MiniSearch** | ~12–25 KB for fuzzy matching and typo tolerance. Real value at scale; at ten items a user can *see* every result, so fuzzy matching mostly adds surprising results. Rejected for launch, **explicitly planned at the 100-item threshold** (§20.2). |
| **Pagefind** | Excellent static full-text search with automatic index chunking. Overkill for ten records with no body content, and adds a build step and a WASM download. Correct choice if the site ever gains long-form content. |
| **Server/hosted search** (Algolia) | External dependency, API key, cost, network latency. Violates I2/I3/G6. |
| **Filter the DOM only, no index** | Works for the gallery (all cards are in the DOM) but not for the global header overlay on `/about` or a detail page, where cards do not exist. The index is what makes search global. |

**Trade-offs accepted.** No typo tolerance at launch ("photosynthisis" returns nothing) — mitigated by an empty state that offers a clear reset and links to the full gallery (Design §18.3), and by the corpus being small enough to browse. No result highlighting at launch (a documented enhancement). Index must be rebuilt on content change — automatic, since it is a build artifact.

### 11.3 Two Surfaces, One Matcher

| Surface | Data source | Behaviour |
|---|---|---|
| **Header SearchOverlay** (global) | `/search-index.json` | Full-screen overlay, focus-trapped, Escape closes, arrow-key result navigation, results link to detail pages |
| **Gallery inline search** (`/presentations`) | Pre-rendered DOM | Filters/hides existing cards; no fetch needed; syncs to `?q=` |

Both import the same `matcher.ts` from `features/search/lib/` — one scoring implementation, two consumers. The gallery matcher runs over card data attributes; the overlay runs over the index. Same function, different input.

### 11.4 Search Accessibility (non-negotiable)

- Overlay is `role="dialog"` `aria-modal="true"` with an accessible name; background content receives `inert`.
- Focus moves to the input on open; **returns to the trigger on close** (KB §9.5).
- Result count announced via `aria-live="polite"`: *"6 presentations found"* / *"No presentations found"* — otherwise the update is silent for screen-reader users (KB §6.7).
- Results are a `<ul>` of links; arrow keys move focus, Enter activates, Escape closes.
- Input has a real `<label>` (visually hidden); placeholder is not a label.
- **Race safety:** results are derived synchronously from an in-memory array, so out-of-order responses are structurally impossible — a benefit of the static index over a networked search.

---

## 12. Theme Architecture

### 12.1 Requirements and Constraints

Design §17 (v2, revised): **light is always the default**; `prefers-color-scheme` is deliberately *not* used for initial selection; dark is opt-in via toggle; persisted in `localStorage['theme']`; and on classroom panels the toggle is hidden and light is forced.

The rationale is sound and product-specific: a dark UI on a classroom projector is a legibility failure, and honouring a system preference could silently deliver exactly that.

### 12.2 Implementation: `data-theme` + Blocking Inline Script

**Mechanism.** `<html data-theme="light|dark">`; `tokens.dark.css` overrides custom properties under `[data-theme="dark"]`. No component knows which theme is active — the cascade handles everything. This is the payoff of the token architecture (§3.5).

**FOUC prevention.** A small **blocking, inlined** script in `<head>`, before any stylesheet:
```
try { const t = localStorage.getItem('theme');
      if (t === 'dark') document.documentElement.dataset.theme = 'dark'; }
catch (e) {}
```
This must be **synchronous and inline** — deferred or external, the page paints light and then flashes dark. It is the one place where a blocking script is correct, and it is <200 bytes. It is also **hash-allowlisted in the CSP** (§19.3), not `unsafe-inline`.

Note the default-safe design: the attribute is only *set* for dark. Any failure — storage blocked, script error, JS disabled — yields light, which is the classroom-safe state.

**Toggle island.** `ThemeToggle` (`client:idle` — never on the critical path) flips the attribute, writes storage, and updates `aria-pressed`. Because CSS custom properties are live, the change is instant with no re-render.

**Transition:** a 200 ms `background-color`/`color` transition on `:root`, suppressed under `prefers-reduced-motion`.

### 12.3 Panel Detection — Resolving F5

**The problem.** Design §17.1/§24.4 force light and hide the toggle at viewport ≥1920px. But ordinary desktop monitors are 1920×1080 and vastly outnumber classroom panels. As specified, **most desktop users would silently lose the theme toggle** — a real usability regression that the spec did not intend.

**Refined rule.** Treat "panel" as a *device class*, not a width:

```
isPanel = (min-width: 1920px) AND (pointer: coarse or hover: none)
```

A classroom touch panel reports a coarse pointer; a desktop monitor with a mouse reports fine. This distinguishes the two cases correctly in the overwhelming majority of real hardware.

| Context | Layout treatment (§24.4) | Theme toggle | Effective theme |
|---|---|---|---|
| Large touch panel | Panel layout: larger type, 52px targets, solid header | **Hidden** | Forced light |
| Large desktop monitor + mouse | Panel *layout* (spec's sizing benefits apply) | **Visible** | User preference |
| Projector fed by a laptop | Desktop | Visible | User preference |

**Residual risk, honestly stated.** A laptop driving a projector is indistinguishable from a laptop — if Harshit has dark mode on, he will present the *site* dark. Mitigations: (a) light is the default and never auto-switches, so this only happens if he deliberately enabled dark; (b) the site UI is visible for seconds before Slides takes over the screen; (c) `ADDING-A-PRESENTATION.md` includes a one-line pre-class checklist item. Attempting to auto-detect "a projector is attached" is not possible from the web platform, and heuristics would produce worse surprises than this residual case.

The panel *layout* breakpoint still keys off width alone — larger text and touch targets are harmless on a big monitor, so only the theme lock needs the stricter test.

### 12.4 Dark Mode Scope

Dark mode is a **token-override layer only**. Rules:
- No component may branch on theme in JavaScript. If a value differs by theme, it is a token.
- Dark tokens must pass the same contrast verification as light (Design §25.1). The dark focus ring uses `--color-focus-subtle` (#C7D2FE, ~5.2:1 on dark surfaces).
- **Contrast tests run against both themes** in CI (§15.5) — dark mode is where contrast regressions hide.

---

## 13. Animation Strategy

### 13.1 Governing Principle

Design §23.1 and the PRD's O1 agree: **motion must never delay access.** The architectural expression is a hard rule:

> **No animation may delay interactivity, block content paint, or sit on the critical path to the Present action.**

### 13.2 Technology: CSS Only

**Decision.** All motion is CSS (`transition`, `@keyframes`, View Transitions API). No animation library.

**Rationale.** Every animation in Design §29.5 is a discrete state transition — hover lift, press scale, fade-in, slide, stagger, shadow. All are expressible in CSS, which runs on the compositor, requires zero JS, and cannot delay hydration. A library (Framer Motion ~30 KB+) would add more weight than the entire island budget for effects CSS already provides.

The one animation needing coordination — **FLIP reorder on sort** (Design §14.4) — uses the native `View Transition API` where supported (~15 lines wrapping the DOM update), falling back to an instant reorder. No library needed.

**Only compositor-friendly properties are animated:** `transform` and `opacity` (KB §11.2). Animating `width`/`height`/`top` is prohibited by lint (§22.3). The card hover lift is `translateY(-4px)`, not a margin change.

### 13.3 Hero Entrance — Resolving F3

**The problem.** Design §23.4 animates the hero name with `opacity: 0` → 1, 500 ms duration, 200 ms delay. Chrome does not treat an element with `opacity: 0` as painted for LCP purposes. The hero name is almost certainly the LCP element, so **this specification pushes LCP ~700 ms later than the browser would otherwise report it** — a self-inflicted penalty on the metric that most directly represents G1 and G4.

**Resolution — exempt the LCP element:**

| Element | v2 spec | Implemented |
|---|---|---|
| Header | fade 200 ms | ✅ as specified |
| Hero overline | fade+rise, delay 100 ms | ✅ as specified |
| **Hero name (LCP)** | fade+rise 500 ms, delay 200 ms | ⚠️ **Paints immediately at full opacity.** Optional 300 ms `transform`-only rise from `translateY(8px)` — no opacity animation. |
| Hero tagline | fade+rise, delay 350 ms | ✅ as specified |
| Hero CTAs | fade+rise, delay 450 ms | ✅ as specified |
| Rail heading + cards | stagger from 550 ms | ✅ as specified |

The staged, premium feel (G4) is fully preserved — the name simply *starts* visible and rises into place rather than fading in. Transform-only animation does not affect LCP, because the element is painted from frame one.

**Return-visit reduction (Design §23.4)** is retained and is well-judged: `sessionStorage` timestamp; within 30 s, all entrance animation collapses to a 300 ms opacity fade — with the hero name still exempt.

### 13.4 Motion Inventory

Implemented from Design §29.5 as CSS using the spec's `--duration-*` and `--ease-*` tokens. Page transitions use `<ClientRouter />` (200 ms cross-fade). Card hover, button press, header shadow, menu slide, overlay fade, toast, and stagger are all token-driven CSS.

### 13.5 Reduced Motion

`prefers-reduced-motion: reduce` is honoured globally:
```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: .01ms !important; animation-iteration-count: 1 !important;
    transition-duration: .01ms !important; scroll-behavior: auto !important;
  }
}
```
Plus targeted overrides so feedback is *reduced, not removed* (KB §11.3): card hover keeps its shadow/border change but drops the lift; buttons keep an opacity change; View Transitions are disabled. Removing all feedback makes an interface harder to follow — "reduced" is not "none".

### 13.6 Panel Performance

The frosted-glass header (`backdrop-filter: blur(12px)`) is a known repaint cost on low-powered panel hardware. Design §11.5's fallback is implemented as specified:
```css
@supports not (backdrop-filter: blur(1px)) { .header { background: var(--color-white); } }
@media (min-width: 1920px)                 { .header { background: var(--color-white);
                                                        backdrop-filter: none; } }
```

---

## 14. Performance Optimization Plan

### 14.1 Targets

Core Web Vitals thresholds are Google's current published values (verified against web.dev, 2026-08), assessed at the **75th percentile of real users**, segmented mobile/desktop, with **all three required to pass**.

| Metric | Google "good" | Our target | Why stricter |
|---|---|---|---|
| **LCP** | ≤2.5 s | **≤1.5 s** | Static HTML from edge should beat the generic bar comfortably; O2's "premium in 5 seconds" demands it |
| **INP** | ≤200 ms | **≤100 ms** | Almost no JS on the main thread; anything slower indicates a defect |
| **CLS** | ≤0.1 | **≤0.05** | Fully static layout with reserved space — near-zero is achievable |
| **TTFB** | ≤800 ms | **≤200 ms** | CDN edge, pre-rendered |

**Bundle budgets (compressed), enforced in CI:**

| Route | JS | CSS | Total (excl. fonts) |
|---|---|---|---|
| `/` | ≤20 KB | ≤15 KB | ≤45 KB |
| `/presentations` | ≤25 KB | ≤15 KB | ≤50 KB |
| `/presentations/[slug]` | ≤10 KB | ≤12 KB | ≤35 KB |
| `/about`, `/contact` | ≤15 KB | ≤12 KB | ≤40 KB |

Budgets are **per route**, not per app, so a regression is attributable (KB §8.2). CI fails the build on breach; raising a budget requires a PR comment justifying it.

### 14.2 The ≤3 Second Launch — Resolving F7

**The honest decomposition.** AC-1 measures homepage → slides visible. That path crosses a boundary we do not control:

```
├─ OWNED (target ≤700 ms) ─────────────────────────────────┐
│  Homepage load (cached/edge)              50–300 ms      │
│  Click card → detail page                  <50 ms  ← prefetched
│  Detail render + click Present             ~50 ms        │
│  → window.open()                           ~10 ms        │
└──────────────────────────────────────────────────────────┘
├─ NOT OWNED (typically 1.5–4 s) ──────────────────────────┐
│  Google Slides load + auth check + render                │
│  School network conditions                               │
└──────────────────────────────────────────────────────────┘
```

**Architectural position.** The team commits to and measures the **owned segment at ≤700 ms p75**. The end-to-end ≤3 s is achievable in good conditions but cannot be *guaranteed*, because the majority of the budget belongs to Google. This matches Design Review W1's finding and the spec's own open question #2. **This must be acknowledged by the product owner (§21, R-1) rather than discovered during a demo.**

**What we do to protect the owned segment:**
1. **Prefetch detail pages** from the rail on hover/viewport (§6.5) — usually makes the second click instant.
2. **Zero render-blocking JS.** Islands are `client:idle` or `client:visible`; nothing blocks paint.
3. **Present is a real `<a target="_blank" rel="noopener noreferrer">`**, not a JS `window.open`. It works before hydration, before JS loads, and with JS disabled. The island only *enhances* it (records recency). **This is the single most important reliability decision on the critical path** — the primary action has no JavaScript dependency at all.
4. **Recency is recorded without blocking navigation** — write to `localStorage` synchronously in the click handler; the browser opens the tab regardless.

### 14.3 JavaScript Budget

| Island | Directive | Est. gz | On homepage? |
|---|---|---|---|
| Preact runtime (shared) | — | ~4 KB | Yes |
| RecentRail | `client:load` | ~2 KB | Yes |
| ThemeToggle | `client:idle` | ~1 KB | Yes |
| GalleryController | `client:load` | ~4 KB | No |
| SearchOverlay | `client:idle` | ~4 KB | Deferred |
| MobileMenu | `client:media(max-width:767px)` | ~2 KB | Mobile only |
| ContactForm | `client:visible` | ~3 KB | No |
| Inline theme script | blocking | <0.2 KB | Yes |

**Homepage total ≈ 11 KB compressed.** For comparison, a React framework runtime alone is roughly four times this before any application code.

**Hydration directive rules:**
- `client:load` — only when the island must work immediately (RecentRail affects above-the-fold content).
- `client:idle` — default for chrome (theme, search).
- `client:visible` — below-the-fold (contact form).
- `client:media` — viewport-conditional (mobile menu never downloads on desktop).

### 14.4 Images

There are **no photographic content images** in the design — subject identifiers are CSS gradients (Design §11.2.1), which is excellent for performance (zero bytes, zero requests, zero layout shift).

For the About profile visual and OG images:
- `<Image />` from `astro:assets` — AVIF/WebP with fallback, correct `srcset`/`sizes`.
- **Explicit `width`/`height` or `aspect-ratio` on every image** — the single most effective CLS control (KB §8.5).
- `loading="lazy"` below the fold; **never on an LCP candidate**.
- OG images pre-generated to `public/og/` at 1200×630.

### 14.5 Fonts

Three families are specified (Plus Jakarta Sans, Inter, JetBrains Mono). Fonts are a leading cause of both LCP delay and CLS.

**Using Astro 6's built-in Fonts API:**
- **Self-hosted** (no third-party origin; cross-origin font caches are partitioned anyway, so a font CDN provides no sharing benefit and adds a connection + privacy dependency).
- **Subset to `latin`** + only the weights actually used.
- **`font-display: swap`** for body text (protects LCP); **`optional`** considered for display headings.
- **Fallback metric overrides** (`size-adjust`, `ascent-override`) so the swap does not shift layout — this largely eliminates font-driven CLS (KB §8.6).
- **Preload only the weights needed for first paint** (display 700/800, body 400/500). Preloading everything creates contention.
- **JetBrains Mono is loaded only if actually used.** Reviewing the spec, mono appears in no visible component — **recommend dropping it** unless a use case emerges. One less family is one less download.

### 14.6 CSS Delivery

- Astro inlines small critical CSS and emits scoped, hashed stylesheets per route.
- Token files are shared and long-cached — one download for the whole site.
- Stylelint enforces no unused custom properties and no hard-coded values (§22.3).

### 14.7 Caching and Network

| Asset | Cache-Control |
|---|---|
| Hashed JS/CSS/fonts | `public, max-age=31536000, immutable` |
| HTML | `public, max-age=0, must-revalidate` |
| `/search-index.json` | `public, max-age=300, stale-while-revalidate=86400` |
| OG images | `public, max-age=604800` |

Brotli via the platform. HTTP/2+ multiplexing means no bundle-everything-into-one-file pressure.

### 14.8 Measurement

- **Lighthouse CI** on every PR against the deploy preview; budget breach fails the build.
- **Field data (RUM)** deferred to Phase 2 with privacy-respecting analytics (§18.6). Documented honestly: until then, all performance data is lab data, and lab data is for debugging, not grading (KB §8.8).
- **Manual verification on real hardware before launch** — a mid-range Android phone and the actual classroom panel. Non-negotiable: development machines systematically hide the problems this audience will hit (KB Principle 6).

---

## 15. Accessibility Plan

### 15.1 Target and Justification

**WCAG 2.2 Level AA.** Rationale: 2.2 is the current W3C Recommendation (October 2023; ISO/IEC 40500:2025) and is backward-compatible with 2.1, so conformance also satisfies regulations written against earlier versions. WCAG 3.0 remains a Working Draft with a Candidate Recommendation not anticipated before late 2027 — targeting 2.2 AA now is both the correct current standard and the best preparation for it.

The Design Spec has already done the hard part: Design §25.1 contains a **verified contrast table** with computed ratios, and v2 corrected four real failures (focus ring, amber-on-amber, `neutral-400` as text, coming-soon pill). Engineering's job is to implement that faithfully and prevent regression.

### 15.2 Architectural Approach

**Accessibility scales through components, not vigilance (KB §9.8).** If the ~20 shared primitives are correct, application code inherits correctness. The plan therefore concentrates effort on primitives and the five islands, then enforces with automation.

### 15.3 Semantic Foundations

- **Native elements first.** `<button>` for actions, `<a href>` for navigation, `<nav>`, `<main>`, `<header>`, `<footer>`, `<article>`, `<ul>`/`<li>` for card collections. ARIA only for gaps (KB §9.3).
- **Exactly one `<h1>` per page**, no skipped levels. Cards use `<h3>` inside sectioned regions.
- **`<a>` vs `<button>` is enforced by `Button.astro`** (§7.5) — the component chooses the element from whether `href` is present, so the distinction cannot be got wrong per-instance.
- **Landmarks + skip link.** "Skip to main content" as the first focusable element, visible on focus, targeting `#main-content`.

### 15.4 Focus Management

| Situation | Behaviour |
|---|---|
| Global focus style | `:focus-visible { outline: 2px solid var(--color-focus); outline-offset: 2px; }` — never removed |
| Dark surfaces | `--color-focus-subtle` (#C7D2FE, ~5.2:1) |
| Overlay/menu open | Focus moves in; background gets `inert`; Escape closes |
| Overlay/menu close | **Focus returns to the trigger** — the most-forgotten step |
| View Transition route change | Focus moves to `<h1>` (or `<main>`); page title announced |
| Form validation failure | Focus moves to first invalid field, error tied via `aria-describedby` |
| Card quick-launch | Independently focusable; revealed on `:hover` *and* `:focus-within` |

**View Transitions caveat:** client-side navigation does not reset focus or announce the page the way a full load does. `BaseLayout` registers an `astro:page-load` handler to move focus and announce the new title via a live region. Without this, keyboard and screen-reader users lose their place on every navigation — a common and serious SPA-style regression.

### 15.5 Testing and Enforcement

| Layer | Tool | Gate |
|---|---|---|
| Authoring | `eslint-plugin-jsx-a11y` (islands) + Astro a11y rules | Blocks CI |
| Token misuse | Stylelint rule: `--color-neutral-400` forbidden in `color`/text properties (Design Rule 11) | Blocks CI |
| Component | Vitest + `axe-core` on every shared primitive and island | Blocks CI |
| Page | Playwright + `@axe-core/playwright` on all routes, **light and dark** | Blocks CI |
| Manual keyboard | Documented checklist, every feature | Release gate |
| Screen reader | NVDA or VoiceOver on the critical path | Per release |

**Honest limitation stated up front:** automated tooling detects roughly 30–57% of WCAG issues. It cannot judge focus order sensibility, meaningful alt text, or whether the experience makes sense. The manual keyboard pass is **mandatory, not optional** — it is cheap and catches what automation structurally cannot.

### 15.6 Specific Risk Areas

| Risk | Control |
|---|---|
| Nested interactives in cards | Resolved architecturally (§7.4) |
| Icon-only buttons unnamed | `IconButton.astro` **requires** an `ariaLabel` prop — TypeScript error if omitted |
| Search results silent | `aria-live="polite"` count announcement (§11.4) |
| Gradient conveys subject | Gradient is `aria-hidden`; subject is always present as a text pill (never colour alone) |
| Horizontal scroll rail (mobile) | Keyboard-scrollable, focusable items, not a keyboard trap |
| Long titles | Never truncated on detail pages (Design §15.3); cards clamp visually but the anchor's accessible name is the full title |
| Dark mode contrast | Tested in both themes in CI |
| Touch targets | 44×44 px minimum; 52×52 px at panel breakpoints (WCAG 2.2 SC 2.5.8) |
| Honeypot field | `aria-hidden="true"` + `tabindex="-1"`, off-screen positioning (not `display:none`, which some bots detect) |

---

## 16. Error Handling Strategy

### 16.1 Philosophy

With no runtime data layer, the error surface is unusually small and almost entirely **external-dependency** or **user-input** shaped. Errors are designed states, not afterthoughts (KB §6.3).

### 16.2 Error Taxonomy

| Class | Trigger | User sees | System does |
|---|---|---|---|
| **Content invalid** | Bad JSON/schema | *Nothing — never reaches production* | Build fails; email to author with file + field |
| **Route not found** | Typo URL (EC-12) | Friendly 404 + links to Home/Presentations + search | Static 404 |
| **External link dead** | Slides/Dropbox removed (EC-1/2) | Warning alert from `linkHealth`; alternate path emphasised | Weekly CI check; GitHub issue |
| **Popup blocked** | Browser blocks new tab | Inline alert: "Popup blocked — allow popups, or use this link" + direct link | Detect `window.open() === null` |
| **Offline** (EC-3) | No network | Offline notice + retry | `navigator.onLine` + `offline` event |
| **Google sign-in wall** | Slides not public | Proactive info note, always visible (Design §20.7) | Prevention documented in authoring guide |
| **Form validation** | Bad input | Inline per-field messages, focus to first error | No submit |
| **Form submit failure** | Network/service error | Error toast; **field values preserved** | Retry available |
| **Island JS failure** | Unexpected exception | Page remains fully usable (I1) | Console error; no user-facing crash |

### 16.3 External Link Handling (EC-1, EC-2)

Per §8.4, health is **build-time data**, not a runtime probe. Rendering rules:

| `linkHealth` | Present button | Backup button | Alert |
|---|---|---|---|
| `slides: ok` | Enabled, primary | Shown, secondary | None |
| `slides: unreachable` | **Disabled**, tooltip "Presentation link unavailable" | **Promoted to primary** | Warning (Design §20.3) |
| `dropbox: unreachable` | Enabled | Shown with "may be unavailable" note | Subtle warning (Design §20.4) |
| `dropbox: absent` | Enabled | Not rendered | None — absence is not an error |
| both unreachable | Disabled | Not rendered | Warning + contact link |

**Deliberate divergence from Design §20.3:** the backup link is shown **unconditionally whenever it exists**, not only when Slides fails. Health data can be up to a week stale; an always-visible backup means a stale record never strands the user. The cost is one always-present secondary button — which the design already positions there.

### 16.4 The Present Action — Layered Failure Handling

```
Layer 1 (no JS):     <a href="{presentUrl}" target="_blank" rel="noopener noreferrer">
                     → always works. This is the baseline.
Layer 2 (island):    click handler records recency, then lets default proceed
Layer 3 (popup):     if enhanced open is blocked → inline alert + visible direct link
Layer 4 (dead link): build-time linkHealth disables and redirects attention to backup
Layer 5 (offline):   offline banner; backup may be cached
```

Each layer degrades to the one beneath it. The floor — a plain HTML link — cannot fail as long as the page rendered.

### 16.5 Error Boundaries and Global Handling

- Each island is wrapped in a small error boundary; a crashed island **removes itself** and leaves the server-rendered DOM intact. A broken RecentRail leaves the cards visible, merely unsorted.
- `window.onerror` / `unhandledrejection` log to console (and to analytics in Phase 2). No user-facing error is triggered by a non-critical island failure.
- **No user-facing raw errors.** Stack traces are never shown (KB §13.7).

### 16.6 404 and 500

- **404** (EC-12): friendly copy, search field, links to Home and Presentations. Returns a true 404 status — never a soft 404 (KB §14.3).
- **500**: static fallback page served by the host if the CDN cannot serve content. Rare for a static site but required for completeness.

---

## 17. SEO Strategy

### 17.1 Position

SEO matters here in a specific, bounded way: this is a **personal portfolio for a named individual**, discovered mostly via direct link, QR code, and name searches. The realistic goals are (1) rank for the person's name, (2) render correct, attractive previews when shared, and (3) be legible to AI retrieval systems that increasingly mediate discovery.

Static generation means SEO is largely solved by construction: **all content is in the HTML** (KB §14.1) — the single decision that determines the ceiling.

### 17.2 Metadata Architecture

`SeoHead.astro` takes typed props and is required by `BaseLayout` — a page cannot render without declaring its metadata, so the "someone forgot the meta description" failure is impossible.

| Element | Rule |
|---|---|
| `<title>` | `{Page} · Harshit` — unique per route; detail pages use the presentation title |
| `<meta description>` | From `description`, else generated from subject + tags. Never duplicated across pages |
| Canonical | Absolute URL, always the clean path (strips `?q=`/`?sort=`) |
| Open Graph | `og:title`, `og:description`, `og:image` (1200×630), `og:type`, `og:url` |
| Twitter Card | `summary_large_image` |
| `robots` | `index,follow` default; `noindex,follow` on Coming Soon pages |
| `lang` | `<html lang="en">` |

**Social crawlers do not execute JavaScript** — server-rendering these tags is what makes shared links render previews at all (KB §14.2).

### 17.3 Structured Data (JSON-LD)

| Page | Schema | Purpose |
|---|---|---|
| `/` | `Person` + `WebSite` | Name, tagline, sameAs social links — the primary entity |
| `/presentations` | `CollectionPage` + `ItemList` | Enumerates presentations |
| `/presentations/[slug]` | `PresentationDigitalDocument` + `BreadcrumbList` | Item semantics + breadcrumb display |
| `/about` | `AboutPage` | — |
| `/contact` | `ContactPage` | — |

Generated from the same content collection that renders the page, so structured data **cannot drift from visible content** — a mismatch risks penalties.

### 17.4 Crawlability

- **Sitemap** auto-generated by `@astrojs/sitemap` from real routes, excluding Coming Soon pages and the search index. Generated, never hand-maintained (they drift immediately).
- **`robots.txt`** allows all, references the sitemap. **Environment-aware:** preview deploys emit `Disallow: /` — a staging `noindex` leaking to production (or a production one leaking to staging) is a classic, costly incident, so a smoke test asserts the production value.
- **Real `<a href>` for all navigation.** Crawlers follow hrefs; they do not click JS handlers. This is the same requirement that keeps middle-click working (KB §14.3).
- **No infinite scroll** — the gallery renders all items in HTML.

### 17.5 Performance as SEO

Core Web Vitals are a tiebreaker among comparable pages rather than a dominant factor — but the same work (§14) also determines whether AI retrieval systems successfully fetch and cite the page. One investment, two channels.

---

## 18. Deployment Architecture

### 18.1 Hosting Decision

**Decision.** **Netlify** as the primary target. **Cloudflare Pages** documented as the drop-in alternative.

**Rationale.** The deciding factor is **Netlify Forms**. The contact form (FR-14) is the only feature needing server-side handling. Netlify Forms handles submission, spam filtering, storage, and email notification **with no backend code, no API keys, and no third-party account** — preserving I3 (no secrets) and G6 (low maintenance). Cloudflare Pages has no equivalent; it would require writing a Pages Function plus an email-provider integration and its API key, reintroducing exactly the surface this architecture removes.

Netlify also provides: atomic deploys with instant rollback, per-PR deploy previews, branch deploys, header/redirect config as code, and a free tier sufficient for this traffic profile.

**Alternatives considered.**

| Option | Assessment |
|---|---|
| **Cloudflare Pages** | Largest edge network, unlimited bandwidth, cheapest at scale. Loses on forms (above). **Recommended switch if traffic ever becomes cost-relevant** — the site is portable static output, so migration is a build-config change plus a form-service decision. Note Cloudflare is steering new projects toward Workers with static assets. |
| **Vercel** | Excellent DX, but optimized for Next.js; no built-in forms; free tier is personal-use-only. No advantage here. |
| **GitHub Pages** | Free and simple, but no forms, no preview deploys, no header control (so no CSP) — the header limitation alone disqualifies it (§19.3). |

**Lock-in assessment (honest):** the coupling is Netlify Forms and `netlify.toml`. The site itself is portable static output. Exit cost is roughly one day: swap the form to a hosted form service or a small function, and translate headers/redirects. **Documented in ADR-0009 so the trade is deliberate.**

### 18.2 Environments

| Environment | Trigger | URL | robots |
|---|---|---|---|
| Local | `npm run dev` | `localhost:4321` | n/a |
| **Deploy preview** | Every PR | `deploy-preview-N--site.netlify.app` | `Disallow: /` |
| Branch preview | Push to non-main | `branch--site.netlify.app` | `Disallow: /` |
| **Production** | Merge to `main` | custom domain | `Allow` |

No separate staging tier — deploy previews serve that role, which is appropriate at this scale and keeps environments identical.

### 18.3 CI/CD Pipeline

Ordered cheapest-first so feedback is fast (KB §16.1):

```
1. Install (cached)                             ~20 s
2. Typecheck  (tsc --noEmit)                    ~10 s   ┐
3. Lint       (ESLint + Stylelint)              ~10 s   ├ fast fail
4. Unit tests (Vitest)                          ~15 s   ┘
5. Build      (astro build) ← Zod validation here ~30 s
6. Bundle budget check                           ~5 s   ← fails on breach
7. Deploy preview
8. Playwright E2E + axe (light & dark)          ~90 s
9. Lighthouse CI vs budgets                     ~40 s
10. Merge → atomic production deploy
11. Post-deploy smoke test (200s, robots.txt, a presentation renders)
```

**Quality gates block merge.** Advisory checks get ignored under deadline pressure — this is a certainty, not a risk.

### 18.4 Contact Form

- Native `<form data-netlify="true" netlify-honeypot="bot-field">` — **works without JavaScript** (I1). The ContactForm island adds inline validation and async submission as enhancement.
- **Honeypot, no CAPTCHA** (Design §11.10) — better UX and accessibility, adequate for this threat level.
- Submissions → Netlify dashboard + email notification. **No data stored by the application** (NFR-9).
- Privacy microcopy rendered below the form (Design §11.10).
- Server-side validation is Netlify's; client validation is UX only (KB §5.5).

### 18.5 Environment Configuration

Astro exposes only `PUBLIC_`-prefixed variables to the client — a common accidental leak vector. **This project has no secrets** (I3), so the surface is empty by construction. `site.ts` holds non-secret config (URL, nav, breakpoints); `SITE_URL` comes from the platform-provided deploy URL so preview builds emit correct canonicals.

### 18.6 Monitoring

Sized honestly for a personal portfolio — instrumenting before there is anything to observe is waste:

| Signal | Launch | Phase 2 |
|---|---|---|
| Build/deploy failure | ✅ Netlify email + GitHub Actions | — |
| External link health | ✅ Weekly CI → GitHub issue (§8.4) | Daily |
| Uptime | Platform SLA | Optional synthetic check |
| Client errors | Console only | Lightweight error tracking |
| Field performance (RUM) | ❌ | Privacy-respecting analytics (Plausible/Umami class) |
| Page views | ❌ (PRD A-8: privacy-respecting, minimal) | Cookieless, no PII |

### 18.7 Rollback

Netlify keeps every deploy immutable. Rollback is one click, no rebuild, ~10 seconds. For content errors, `git revert` is equally fast. **The runbook documents both, and the procedure is practised once before launch** — an untested rollback is not a rollback.

---

## 19. Security Considerations

### 19.1 Threat Model

**The security posture is dominated by what this system does not have.** No authentication, no authorization, no user accounts, no database, no API keys, no server-side code, no secrets, no PII storage, no payments. Per invariant I3, there is nothing to steal from the client and no privileged operation to escalate into.

This is not luck — it is the security consequence of the architecture, and it should be preserved deliberately. **Any future feature proposing to add auth, a database, or a secret is an architectural change requiring a new ADR**, because it re-opens categories of risk that are currently closed.

What remains:

| Threat | Applicability | Control |
|---|---|---|
| **XSS** | Low but real — content is authored, not user-generated, but a compromised repo or careless HTML in a description could inject | Astro escapes interpolation by default; `set:html` forbidden by lint; CSP; no `eval` |
| **Supply chain** | **The single highest residual risk** | Minimal dependencies; lockfile; Dependabot; `npm audit` in CI |
| **Form spam / abuse** | Moderate | Honeypot; platform filtering; no data persisted by us |
| **Clickjacking** | Low | `frame-ancestors 'none'` |
| **Open redirect** | None | No redirect parameters exist |
| **Reverse tabnabbing** | Real — every Present/Backup link opens a new tab | `rel="noopener noreferrer"` mandatory, lint-enforced |
| **Dependency on external origins** | Moderate | Slides/Dropbox are user-initiated navigations, never embedded or fetched |
| **Content integrity** | Moderate | Repo access control; branch protection on `main` |

### 19.2 XSS Controls

- **Astro auto-escapes** all `{expression}` interpolation.
- **`set:html` and `dangerouslySetInnerHTML` are forbidden** by ESLint. If Markdown rendering ever needs raw HTML, it must go through a sanitizer with an allowlist — never a hand-rolled one (KB §13.2).
- **URL validation happens at build time.** The Zod schema constrains `googleSlidesUrl` and `dropboxUrl` to expected hosts, so a `javascript:` URI cannot enter the content and reach an `href`.
- **No user-generated content is rendered.** The contact form's data goes to Netlify and is never displayed on the site — which eliminates the stored-XSS vector entirely.

### 19.3 Content Security Policy

Astro 6's built-in **CSP API** generates hashes for inline scripts and styles at build time, so a strict policy is achievable on a static host without `unsafe-inline`.

```
default-src 'self';
script-src 'self' 'sha256-<generated>';        ← includes the theme script hash
style-src  'self' 'sha256-<generated>';
img-src    'self' data:;
font-src   'self';
connect-src 'self';                             ← search index only
form-action 'self';
frame-ancestors 'none';
base-uri 'self';
object-src 'none';
upgrade-insecure-requests;
```

Notes: `frame-ancestors 'none'` handles clickjacking (supersedes `X-Frame-Options`); `base-uri 'self'` blocks base-tag injection; there is **no `unsafe-inline`** — the inline theme script (§12.2) is hash-allowlisted, which is exactly why the CSP API is worth using.

**Deployment discipline:** ship `Content-Security-Policy-Report-Only` first, verify zero violations across all routes and both themes, then enforce. Deploying enforcement blind reliably breaks production.

### 19.4 Additional Headers (`netlify.toml`)

```
Strict-Transport-Security: max-age=31536000; includeSubDomains
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=(), interest-cohort=()
```

`Permissions-Policy` disables device APIs the site never uses — cheap defence in depth.

### 19.5 Privacy (NFR-9)

- **No cookies. No tracking. No third-party scripts at launch.** Nothing to consent to, so no consent banner — which is also a performance and CLS win (cookie banners are a leading CLS cause).
- `localStorage` holds only theme and recent slugs — **user preference data, not personal data**, never transmitted.
- Contact form: minimal fields, handled by the platform, not stored by the application, with privacy microcopy stating this plainly.
- Fonts self-hosted — no requests to a third-party font origin.
- Any Phase 2 analytics must be **cookieless and non-PII** (PRD A-8), documented in an ADR before adoption.

### 19.6 Supply Chain

The genuine residual risk, given how small the rest of the surface is.

- Minimal production dependencies (§3.7); each addition requires justification against G6.
- Lockfile committed; CI installs with `npm ci`.
- **Dependabot** for security patches; grouped minor updates weekly.
- `npm audit --audit-level=high` fails CI.
- **Patch latency is a security control, not a maintenance preference.** The React2Shell disclosure (CVE-2025-55182, CVSS 10.0) saw in-the-wild exploitation within about a day. This project's smaller surface reduces exposure, but the response discipline is the same: patch promptly.

---

## 20. Scalability Plan

This section covers future scalability: which axis actually grows, and the documented thresholds at which the architecture must change.

### 20.1 Which Axis

Applying the knowledge base's four axes (KB §1.3):

| Axis | Realistic trajectory | Assessment |
|---|---|---|
| **Content scale** | <10 → maybe 50–100 presentations over years | **The real axis.** Planned below. |
| **Traffic scale** | Tens to low hundreds of visitors | Non-issue. Static + CDN absorbs orders of magnitude more. |
| **Team scale** | One person, occasional help | Non-issue. Structure supports it regardless. |
| **Feature scale** | +Projects, Certificates, Resume (Phase 3) | Planned below. |

Naming the axis prevents building for scale that will not arrive — the most common architectural waste.

### 20.2 Content Scale: Documented Thresholds

Each threshold has a **trigger**, a **response**, and — critically — a note that the current architecture does not need to change until the trigger fires.

| Items | Status | Action |
|---|---|---|
| **<25** | Launch | Nothing. Everything is fine. |
| **25–50** | Comfortable | Consider subject filter chips on the gallery (UX, not architecture). |
| **~50** | Watch | Gallery renders all cards in one HTML page — still fine, but review page weight. |
| **~100** | **Cut-over point** (Design §14.4) | Migrate search to an indexed solution (Pagefind or MiniSearch). Add pagination or virtualization to the gallery. Search index approaches ~15 KB. |
| **>250** | Re-architect content | Move to a headless CMS or Astro's Live Content Collections; consider incremental builds. |

**Why these are safe deferrals:** the search matcher is isolated behind `features/search/lib/matcher.ts` with a stable interface, so swapping the algorithm touches one module. The gallery already renders from a collection query, so pagination is a query change plus a component. Neither requires structural work — which is exactly what §19.3 of the knowledge base means by designing for incremental migration.

### 20.3 Content Management Scale

If GitHub-web-UI editing becomes a friction point (a realistic outcome), the upgrade path is **Decap CMS or TinaCMS over the same Git files** — a visual editor writing the same JSON. The content model does not change; only the authoring interface does. This is why Git-as-CMS is a safe starting point rather than a dead end (§9.2).

### 20.4 Feature Scale

**Adding Projects / Certificates / Resume (Phase 3)** follows an established pattern:
1. New collection + Zod schema in `content/config.ts`.
2. New feature folder under `features/` with its own `index.ts`.
3. New routes under `pages/`.
4. Remove `noindex`, add nav link, add to sitemap.

**No existing feature is modified.** That property — new capability without touching working code — is the practical test of whether the modular structure earned its keep.

**Deliberately deferred, with triggers:**

| Feature | Trigger to build |
|---|---|
| Service worker / offline | Only if classroom network failures actually occur. Adds cache-invalidation complexity (KB §5.6) that is not currently justified. |
| RUM analytics | Phase 2, when there is enough traffic for the data to mean something. |
| QR code component | Phase 2 (PRD Could-have); homepage contact teaser has room. |
| Visual regression testing | When the design system exceeds ~30 components. |
| i18n | Not anticipated — but **logical CSS properties are used from day one** (§22.2), which is the cheap insurance that makes RTL viable later. |

### 20.5 Architectural Headroom

Properties that make future change cheap, and are already in place:

- **Content is data, not code** — new items need no deployment logic.
- **Islands are independent** — one can be rewritten or removed in isolation.
- **Tokens are the single styling source** — a rebrand is a token-file change.
- **Static output is portable** — host migration is a build-config change.
- **No auth, no database** — the two hardest things to unwind are simply absent.
- **Enforced import boundaries** — prevents the gradual coupling that makes systems unrewritable.

---

## 21. Risks & Mitigations

| ID | Risk | L | I | Mitigation | Owner |
|---|---|---|---|---|---|
| **R-1** | **≤3 s launch not met** because Google Slides load dominates the budget | High | High | Budget split and owned segment (≤700 ms) measured separately (§14.2); prefetch; **product owner must formally acknowledge the unowned portion** — this is the top open item | Product |
| **R-2** | **Google sign-in interstitial** blocks the class (link not public) | Medium | High | Sharing set to "Anyone with the link" is **step 1** of the authoring guide (§9.2); persistent info note (Design §20.7); Dropbox backup always visible | Harshit |
| **R-3** | **External link rot** (Slides/Dropbox deleted or moved) | Medium | High | Weekly CI link check → GitHub issue (§8.4); backup always shown; alert renders from data | CI |
| **R-4** | **Content edit breaks the build**, Harshit cannot publish | Medium | Medium | Failure is **safe** — live site unaffected; error email names file and field; copy-paste template; `published:false` staging | Dev |
| **R-5** | **Dark mode on a projector** via a laptop already in dark mode | Low | Medium | Light is default and never auto-switches; panel detection (§12.3); pre-class checklist. Residual risk accepted and documented | Harshit |
| **R-6** | **Frosted-glass header janks** on low-powered panel hardware | Low | Medium | Solid fallback at ≥1920px and via `@supports` (§13.6); **test on the actual panel before launch** | Dev |
| **R-7** | **Mobile→projector path unreliable** | Medium | Medium | Design §24.6 already scopes panel/laptop as the primary path; documented, not engineered around | Product |
| **R-8** | **Astro ecosystem/steward risk** (Cloudflare acquisition Jan 2026) | Low | Medium | MIT license, open governance; output is portable static HTML; content model is framework-agnostic JSON | Dev |
| **R-9** | **Supply-chain vulnerability** in a dependency | Low | High | Minimal deps; Dependabot; `npm audit` gate; prompt patching (§19.6) | Dev |
| **R-10** | **Accessibility regression** after launch | Medium | Medium | Automated axe gates on all routes and both themes; mandatory manual keyboard pass; primitives carry the burden | Dev |
| **R-11** | **Gallery path exceeds 3 clicks** for items outside the rail | — | — | **Resolved:** header search is an AC-1 requirement, not optional (§6.3) | Dev |
| **R-12** | **Netlify Forms lock-in** | Low | Low | Single, isolated integration; ~1 day to swap (§18.1); documented in ADR-0009 | Dev |
| **R-13** | **Design/implementation drift** over time | Medium | Low | Tokens implemented verbatim; Stylelint forbids hard-coded values; design consistency rules are lint rules (§22.3) | Dev |

---

## 22. Development Guidelines

### 22.1 Build Order

Dependency-ordered, so nothing is built on an unstable foundation. Matches Design §30's guidance.

```
Phase A — Foundation (no visible UI)
  1. Astro + TS + Preact scaffold; strict config
  2. tokens.css / tokens.dark.css — Design §26.1 VERBATIM
  3. global.css: reset, base, :focus-visible, reduced-motion
  4. content/config.ts Zod schemas  ← the contract
  5. 2–3 real content files; verify build fails on bad input
  6. BaseLayout, SeoHead, SkipLink, inline theme script
  7. CI skeleton: typecheck, lint, build

Phase B — Primitives  (build in isolation; write axe tests alongside)
  8. Button, IconButton, Tag, Alert, EmptyState, Skeleton,
     Breadcrumb, SectionOverline, VisuallyHidden

Phase C — Chrome
  9. Header (+ scroll shadow, tablet "More ▾"), Footer
 10. ThemeToggle island        ← first island; validates the pattern
 11. MobileMenu island (focus trap, inert, Escape)

Phase D — Presentations (the core value)
 12. SubjectVisual, PresentationMeta, TagRow
 13. PresentationCard  ← implement the §7.4 linked-card pattern exactly
 14. /presentations gallery (server-rendered, unfiltered)
 15. /presentations/[slug] with ActionRow
     ★ TEST THE PRESENT PATH ON A REAL PROJECTOR NOW — before more UI
 16. GalleryController island (filter/sort/URL sync)

Phase E — Homepage
 17. Hero (LCP element NOT opacity-animated — §13.3)
 18. RecentRail island + recency logic + fallback
 19. About/Contact teasers

Phase F — Search
 20. search-index.json.ts endpoint
 21. matcher.ts + unit tests (write tests first — pure function, easy to TDD)
 22. SearchOverlay island (focus trap, aria-live, arrow keys)

Phase G — Remaining pages
 23. /about, /contact + ContactForm island, Coming Soon pages, 404

Phase H — Hardening
 24. Full a11y pass (automated + manual keyboard + screen reader)
 25. CSP report-only → enforce
 26. Lighthouse CI + budgets
 27. Real-device testing: mid-range Android + the actual classroom panel
 28. Link-check workflow; authoring docs; runbook; rollback rehearsal
```

**Step 15's projector test is placed deliberately early.** The Present path is the product's reason to exist; discovering a problem with it after building the whole UI is the worst possible sequencing.

### 22.2 Coding Standards

**TypeScript**
- `strict: true`. No `any` — use `unknown` and narrow.
- Types derive from Zod schemas (`z.infer`), never hand-duplicated.
- Discriminated unions over optional-flag combinations (§7.5).

**Astro components**
- Frontmatter runs at build time only — no browser APIs there.
- Typed `Props` interface on every component.
- Prefer `.astro` over an island (§7.2).
- One component per file; filename matches the component.

**Islands**
- Only when state / events / focus management are genuinely needed.
- Declare the narrowest hydration directive that works.
- Must render meaningful content server-side and enhance it — never render from empty (I1).
- Guard every `localStorage` access in try/catch and validate on read.

**CSS**
- **Token values only.** No hard-coded colours, sizes, radii, durations, or easings.
- Animate `transform`/`opacity` only.
- Logical properties (`margin-inline`, `padding-block`) — cheap i18n insurance.
- Spacing lives on the parent/layout, not as component margins (KB §12.5) — keeps components composable.
- Container queries for component-level responsiveness; media queries for page layout.

**Accessibility (non-negotiable)**
- Native element first; ARIA only for gaps.
- Never remove focus outlines without a stronger replacement.
- Icon-only controls require an accessible name — enforced by the component's prop type.
- Test every interactive feature with the keyboard before opening a PR.

### 22.3 Automated Enforcement

Standards encoded in tooling, because documents rely on memory and goodwill (KB §17.5):

| Rule | Tool |
|---|---|
| Import boundaries (§5.1) | ESLint `no-restricted-imports` |
| No `set:html` / `dangerouslySetInnerHTML` | ESLint |
| `target="_blank"` requires `rel="noopener noreferrer"` | ESLint |
| No hard-coded colours/spacing (Design Rules 1–6) | Stylelint |
| **`--color-neutral-400` never in a text property** (Design Rule 11) | Stylelint custom rule |
| Only `transform`/`opacity` animated | Stylelint |
| a11y lint on islands | `eslint-plugin-jsx-a11y` |
| Formatting | Prettier + `prettier-plugin-astro` |
| Bundle budgets | CI size check |
| Content validity | Zod at build |

### 22.4 Testing Strategy

Weighted toward integration (the "trophy" shape), because most frontend bugs are integration bugs (KB §15.2).

| Layer | Scope | Tool |
|---|---|---|
| **Static** | Types, lint, boundaries | tsc, ESLint, Stylelint |
| **Unit** | `matcher.ts`, `recency.ts`, `sorting.ts`, `slidesUrl.ts`, date formatting | Vitest |
| **Component** | Each primitive + island: render, interact, axe | Vitest + Testing Library + axe |
| **E2E** | 8 critical journeys (below) | Playwright |
| **A11y** | All routes, light + dark | Playwright + axe |
| **Performance** | Budgets per route | Lighthouse CI |

**The eight E2E journeys** (deliberately few and high-value):
1. Home → rail card → detail → Present opens correct Slides URL in a new tab.
2. Rail quick-launch (desktop) opens Slides directly and records recency.
3. Gallery → search "science" → filter → open result → Present.
4. Header search overlay: open, type, arrow-navigate, Enter, Escape returns focus.
5. Sort change updates order **and** the URL; reload preserves it.
6. Theme toggle persists across navigation and reload; no flash on load.
7. Contact form: validation error → correction → success state.
8. **JS disabled:** all content renders; Present and Backup links work.

Journey 8 is the direct test of invariant I1 and is the one most teams omit.

**Test principles:** query by role/label/text, never CSS classes; mock at the network boundary, not the module boundary; treat flakiness as a bug to fix or delete, never to retry around.

### 22.5 Definition of Done

A feature is done when: it works without JS (or degrades gracefully with a documented reason); it is keyboard-navigable with visible focus; it passes axe in both themes; it uses only tokens; it respects `prefers-reduced-motion`; it is within budget; it has tests at the right layer; it is verified on mobile + desktop + panel widths; and any architectural choice made along the way is recorded in an ADR.

### 22.6 Documentation Obligations

| Document | Audience | Content |
|---|---|---|
| `docs/ADDING-A-PRESENTATION.md` | **Harshit (non-developer)** | Step-by-step with screenshots; the AC-9 deliverable |
| `docs/RUNBOOK.md` | Maintainer | Deploy, rollback, link-check, incident response, pre-class checklist |
| `docs/adr/*.md` | Future developers | One decision each; never edited, only superseded |
| `README.md` | Developer | Setup, scripts, structure, conventions |
| Component prop types | Developer | TypeScript interfaces + a "when not to use this" note on shared primitives |

---

## 23. Architecture Decision Records

Each records context, options, decision, trade-offs, consequences, and — importantly — a **revisit trigger**, so decisions are self-auditing rather than permanent by default.

---

### ADR-0001: Astro as the meta-framework

**Status:** Accepted · 2026-08-04

**Context.** A content-driven portfolio with <10 read-only records, no auth, no writes. The dominant requirement is launch latency under classroom pressure (O1/AC-1) on mid-range phones and classroom panels. Secondary requirements: premium feel (O2), no-code content editing (O4/AC-9), low maintenance (O6).

**Options.** (a) Astro static; (b) Next.js App Router; (c) SvelteKit; (d) plain HTML + vanilla JS.

**Decision.** Astro 6, `output: 'static'`.

**Rationale.** Zero-JS baseline directly serves the top-ranked goal; islands model this UI exactly; Content Collections + Zod give build-time content validation, which is the highest-leverage reliability feature available for a product whose top failure mode is a broken link in class; Astro 6 adds a Fonts API and CSP API that would otherwise be manual work.

**Trade-offs.** Smaller ecosystem (irrelevant — this project needs almost nothing from one). Islands do not share state by default (the five islands are genuinely independent). Single-vendor steward since the Cloudflare acquisition (mitigated by MIT licence and portable static output).

**Consequences.** Static hosting. Content flows through collections. Interactivity requires explicit island boundaries. Developers must respect the build-time/runtime split in `.astro` frontmatter.

**Revisit if.** The product requires per-request personalization, authenticated views, or real-time data — at which point a server-rendering framework becomes appropriate.

---

### ADR-0002: Preact for islands

**Status:** Accepted · 2026-08-04

**Context.** Five to six components need real state, keyboard handling, and focus management. Everything else is static.

**Options.** (a) Vanilla TS/custom elements; (b) Preact; (c) React; (d) Svelte.

**Decision.** Preact via `@astrojs/preact`.

**Rationale.** ~4 KB shared runtime versus ~40 KB for React with an identical API. The two hardest islands (SearchOverlay, MobileMenu) need focus trapping, live-region announcements, and roving focus — patterns that are error-prone hand-rolled, and accessibility (G5) is a ranked goal. A React-shaped API maximizes the pool of people who could help later.

**Trade-offs.** ~4 KB and one dependency versus writing vanilla DOM code. Accepted for defect-risk reduction on exactly the components where accessibility usually fails.

**Consequences.** Islands are `.tsx`. CSS Modules needed for island styles (Astro scoping does not apply). An island budget must be actively defended (§14.3).

**Revisit if.** Island count drops to two or fewer trivial widgets (drop to vanilla), or a React-only dependency becomes essential (switch to React and accept the weight).

---

### ADR-0003: CSS custom properties + scoped CSS; no utility framework

**Status:** Accepted · 2026-08-04

**Context.** The Design Spec provides a complete, contrast-verified token system already expressed as CSS custom properties (Design §26.1), plus a dark-mode override layer.

**Options.** (a) Implement tokens as custom properties + Astro scoped CSS; (b) Tailwind; (c) CSS-in-JS; (d) Sass.

**Decision.** (a).

**Rationale.** The token block is already the design/engineering contract — implement it, do not translate it. Custom properties give runtime theming with no rebuild and no JS re-render. A utility framework would restate every token in a second vocabulary that drifts, and its arbitrary-value escape hatches would undermine the very rules (e.g. "never use `neutral-400` for text") that the spec added to fix accessibility failures. CSS-in-JS contradicts the zero-JS premise.

**Trade-offs.** More hand-written CSS; no utility-class velocity. Accepted: the spec dictates exact values, so most CSS is transcription.

**Consequences.** Dark mode is an attribute flip. Stylelint enforces token-only values. Developers need real CSS fluency (a reasonable expectation).

**Revisit if.** The team grows beyond ~3 developers and CSS conventions start drifting despite linting.

---

### ADR-0004: Git-as-CMS with GitHub web-UI authoring

**Status:** Accepted · 2026-08-04

**Context.** FR-17/AC-9 require adding presentations without code changes, by a student maintainer, ideally without a local dev environment.

**Options.** (a) JSON in repo, edited via GitHub web UI; (b) headless CMS; (c) Git-based visual CMS (Decap/Tina); (d) Google Sheets; (e) hard-coded array.

**Decision.** (a), with (c) as the documented upgrade path.

**Rationale.** Satisfies "no code changes" honestly — content lives in a content directory, and no component, route, or config is touched. Zero external dependencies and zero cost (G6). Critically, **a bad edit fails the build and leaves the live site untouched**, which is what makes handing content control to a non-developer safe. (c) requires an auth layer, reintroducing the auth surface I3 removes; deferring it costs nothing because the content model is identical.

**Trade-offs.** Raw JSON is unforgiving; no WYSIWYG preview. Mitigated by template, safe failure, clear error emails, and `published:false` staging.

**Consequences.** A carefully written non-developer authoring guide is a **release deliverable**, not a nice-to-have.

**Revisit if.** Harshit reports friction, or a second non-technical maintainer appears → adopt Decap/Tina over the same files.

---

### ADR-0005: No state management library

**Status:** Accepted · 2026-08-04

**Context.** State inventory: URL (search/sort), localStorage (theme, recency), local island state (menus, form). No server state at runtime — all data is baked in at build.

**Alternatives considered.** (a) Framework primitives only; (b) a micro-store such as Nanostores (Astro's commonly recommended cross-island store); (c) a full store library (Zustand/Redux-class); (d) a server-state library (TanStack Query/SWR).

(d) is immediately excluded — there is no server state to cache, so a data-fetching library would have nothing to do. (c) is excluded as substantial machinery for zero global state. (b) is the genuine contender and is the correct escalation *if* cross-island shared state ever appears; today the only cross-island concern is theme, which the DOM handles more simply and more robustly (it survives an island failing to hydrate).

**Decision.** (a) Framework primitives only. URL for shareable view state, `localStorage` for the two persisted values, `useState` locally. Cross-island theme communication via a DOM attribute.

**Rationale.** Static generation eliminated server state, and with it the usual justification for a store. Genuine global client state is zero. A store would be complexity with no matching problem.

**Trade-offs.** If several islands ever need shared state, an ad-hoc solution could emerge. Mitigated: the documented escalation is a `CustomEvent` on `document`, and only then a nanostore-class micro-library — never a full framework store.

**Consequences.** Islands stay independent (I6). No provider tree. Nothing to hydrate at the app level.

**Revisit if.** Three or more islands need to share mutable state.

---

### ADR-0006: Build-time link health checking

**Status:** Accepted · 2026-08-04 · **Supersedes Design Spec §20.3's implied runtime detection**

**Context.** Design §20.3 and PRD EC-1 require showing a warning when a Google Slides link is dead. **This is not achievable client-side:** cross-origin `fetch` is CORS-blocked, `no-cors` returns an opaque response indistinguishable between 200 and 404, and Slides sets `X-Frame-Options` so iframe probing fails identically for healthy and dead links. Any client attempt would false-positive on working presentations.

**Options.** (a) Attempt client-side detection (unreliable); (b) build-time + scheduled CI checking into a data field; (c) a serverless proxy endpoint; (d) drop the feature.

**Decision.** (b). A weekly GitHub Action checks every published URL and commits a `linkHealth` field; the UI renders the alert from that data.

**Rationale.** CI has no CORS restrictions and can check accurately. The alert becomes server-rendered (works without JS), cannot false-positive, and adds zero runtime cost. (c) would add a serverless function and a runtime dependency for a rarely-changing signal.

**Trade-offs.** Detection lag up to one week. Accepted because the **Dropbox backup is displayed unconditionally**, so a stale-healthy record never strands the user — a deliberate divergence from §20.3's conditional display that costs one button and buys robustness.

**Consequences.** `linkHealth` is a CI-written field, documented as not hand-edited. Broken links also open a GitHub issue as the notification channel. Directly evidences AC-7.

**Revisit if.** Links break often enough that weekly is too slow → move to daily, or add an on-demand check.

---

### ADR-0007: Card restructure to the linked-card pattern

**Status:** Accepted · 2026-08-04 · **Modifies Design Spec §11.2**

**Context.** Design §11.2 specifies a fully clickable card **containing** a "▶ Present" quick-launch button. Nested interactive elements produce invalid HTML, ambiguous screen-reader output, and broken keyboard semantics.

**Options.** (a) Wrap the card in `<a>` and nest the button (invalid); (b) linked-card pattern — title anchor with a pseudo-element overlay, button layered above; (c) drop quick-launch; (d) make the card non-clickable with an explicit "View" link.

**Decision.** (b).

**Rationale.** Preserves both designed behaviours — full-card click target *and* an independent quick-launch — with valid HTML, one link per card whose accessible name is the presentation title, and two independently focusable controls. (c) would remove the 2-click owner fast path the design deliberately added; (d) reduces the tap target, which matters most on the mobile and panel targets.

**Trade-offs.** Slightly more intricate CSS (`position: relative` on the card, `::after` overlay, `z-index` on the button). Text selection must be verified as preserved.

**Consequences.** Card markup is fixed by this pattern; deviating reintroduces the violation. Documented in the component's prop notes.

**Revisit if.** Quick-launch is dropped after stakeholder review (Design §30 open question 1) — the overlay pattern is still correct and should be kept.

---

### ADR-0008: LCP element exempted from entrance animation

**Status:** Accepted · 2026-08-04 · **Modifies Design Spec §23.4**

**Context.** Design §23.4 fades the hero name in over 500 ms after a 200 ms delay. Chrome does not count `opacity: 0` elements as painted for LCP, so this pushes the reported LCP ~700 ms later. The hero name is the likely LCP element, and LCP is the metric most directly tied to G1 and G4.

**Options.** (a) Implement as specified; (b) exempt the LCP element from opacity animation, allowing a transform-only rise; (c) drop the entrance sequence entirely.

**Decision.** (b).

**Rationale.** Transform animation does not affect LCP because the element is painted from the first frame. The staged premium feel is preserved for the overline, tagline, CTAs, and cards — the name simply starts visible and rises into place. (c) would discard a designed quality signal for no additional gain.

**Trade-offs.** The hero name's entrance differs slightly from the other elements. Visually negligible; measurably better.

**Consequences.** Any future "animate the hero" request must preserve the LCP exemption. Lighthouse CI will catch regressions.

**Revisit if.** The LCP element changes (e.g. a hero image is added) — the exemption must move with it.

---

### ADR-0009: Netlify hosting, primarily for Forms

**Status:** Accepted · 2026-08-04

**Context.** The site is static. The only server-side need is contact-form handling (FR-14), with privacy constraints (NFR-9) and a no-secrets posture (I3).

**Options.** (a) Netlify; (b) Cloudflare Pages; (c) Vercel; (d) GitHub Pages.

**Decision.** Netlify, with Cloudflare Pages documented as the alternative.

**Rationale.** Netlify Forms handles submission, spam filtering, storage, and notification with **no backend code and no API key**, preserving I3 and G6. Cloudflare would require a Pages Function plus an email provider and its key. GitHub Pages cannot set custom headers, so no CSP — disqualifying. Vercel offers no advantage for a non-Next.js static site and its free tier is personal-use-only.

**Trade-offs.** Coupling to Netlify Forms and `netlify.toml`. Bandwidth is metered (irrelevant at this traffic). Exit cost ≈ one day: swap to a hosted form service, translate headers/redirects.

**Consequences.** Form markup uses Netlify attributes. Headers/redirects live in `netlify.toml`. Deploy previews are the staging tier.

**Revisit if.** Traffic makes bandwidth cost-relevant, or the project adopts Cloudflare tooling more broadly → move to Cloudflare Pages/Workers and a hosted form service.

---

### ADR-0010: Hand-rolled search matcher over a search library

**Status:** Accepted · 2026-08-04

**Context.** Search across title, subject, and tags for <10 items at launch (FR-2/AC-5), needed globally from the header (an AC-1 requirement per §6.3).

**Options.** (a) Hand-rolled scored matcher over a build-time index; (b) Fuse.js/MiniSearch; (c) Pagefind; (d) hosted search.

**Decision.** (a) for launch, with (b) or (c) documented at the ~100-item threshold.

**Rationale.** ~40 lines and zero dependencies beat 12–25 KB of fuzzy matching for a corpus a user can read in full. Field weighting (title > subject > tags) matches how people recall their own talks better than generic fuzzy scoring. Static index means results are computed synchronously from memory, which makes search-result race conditions structurally impossible.

**Trade-offs.** No typo tolerance; no highlighting at launch. Mitigated by a good empty state with a reset path and by corpus size.

**Consequences.** `matcher.ts` is a pure, unit-tested function behind a stable interface — swapping implementations later touches one module.

**Revisit if.** The catalog passes ~100 items, or users report failed searches for content that exists.

---

### ADR-0011: Refined panel detection for the theme lock

**Status:** Accepted · 2026-08-04 · **Modifies Design Spec §17.1/§24.4**

**Context.** The spec forces light mode and hides the theme toggle at viewport ≥1920px. But ordinary desktop monitors are 1920×1080 and vastly outnumber classroom panels, so as written **most desktop users would silently lose the toggle** — not the spec's intent.

**Options.** (a) Implement width-only as written; (b) add a pointer-type condition; (c) explicit user setting; (d) drop the lock.

**Decision.** (b) — `(min-width: 1920px) and ((pointer: coarse) or (hover: none))` gates the theme lock. The panel *layout* breakpoint remains width-only.

**Rationale.** Classroom touch panels report a coarse pointer; desktop monitors with a mouse report fine. This distinguishes them correctly on the great majority of real hardware while fully preserving the design's intent (never dark on a projected touch panel). Larger type and touch targets are harmless on a big monitor, so only the theme lock needs the stricter test.

**Trade-offs.** A large non-touch display genuinely used as a classroom panel keeps its toggle. Residual and acceptable, since light remains the default everywhere and dark requires deliberate opt-in.

**Consequences.** Two related but distinct media conditions exist; both are documented in `site.ts` with comments explaining why they differ.

**Revisit if.** Real classroom hardware reports a fine pointer → fall back to width-only, or add an explicit "presentation mode" toggle.

---

### ADR-0012: Dropbox links default to preview, not download

**Status:** Accepted · 2026-08-04 · **Modifies Design Spec §15.2**

**Context.** Design §15.2 recommends appending `?dl=1` to force a direct download. On a classroom panel, downloading a `.pptx` may produce a file with no installed handler — the opposite of a reliable backup. The button is also labelled "Open Backup", which describes preview more accurately than download.

**Options.** (a) `?dl=1` always; (b) `?dl=0` (in-browser preview) always; (c) `?dl=0` default with a per-item override.

**Decision.** (c) — `?dl=0` by default; `forceDownload: true` in the content file switches an individual item to `?dl=1`.

**Rationale.** Dropbox's in-browser preview renders on any device with a browser, which is the more reliable classroom fallback and matches the button label. The per-item override preserves flexibility for formats that preview poorly.

**Trade-offs.** Preview quality depends on Dropbox's renderer; a genuinely offline scenario would want the file. Accepted: for a true offline case Harshit should pre-download before class — a documented pre-class checklist item.

**Consequences.** `forceDownload` is added to the schema and explained in the authoring guide.

**Revisit if.** Dropbox preview proves unreliable for the deck formats actually used → flip the default.

---

## 24. Developer Handoff

> Everything a Senior Frontend Developer needs to begin implementation **without making architectural assumptions**. If something is not answered here, it is a gap — raise it rather than guessing.

### 24.1 Start Here — Day One Checklist

```
□ Read §1.5 (the seven findings) — two of them change what you build
□ Read §4.2 (invariants I1–I6) — these are non-negotiable
□ Scaffold: npm create astro@latest — TypeScript strict, add @astrojs/preact
□ Copy Design Spec §26.1 token block verbatim into src/shared/styles/tokens.css
□ Write src/content/config.ts from §8.1 — this is the contract
□ Create 2 real content files; deliberately break one; confirm the build fails
□ Stand up CI (typecheck + lint + build) before writing UI
```

### 24.2 Decisions Already Made — Do Not Re-litigate

| Question | Answer | § |
|---|---|---|
| Framework? | Astro 6, `output: 'static'` | ADR-0001 |
| Islands? | Preact, 6 entry points, ~11 KB on homepage | ADR-0002, §14.3 |
| Styling? | CSS custom properties + Astro scoped CSS. **No Tailwind.** | ADR-0003 |
| Content? | JSON in `src/content/presentations/`, Zod-validated | ADR-0004 |
| State library? | **None.** URL + localStorage + local island state | ADR-0005 |
| Search? | Hand-rolled matcher over a build-time index | ADR-0010 |
| Routing? | Astro file-based; no client router; View Transitions | §6 |
| Hosting? | Netlify (Forms is the deciding factor) | ADR-0009 |
| Dark mode? | `data-theme` attribute + blocking inline script | §12 |
| Animation? | CSS only. No animation library | §13 |
| Testing? | Vitest + Playwright + axe | §22.4 |

### 24.3 The Seven Deviations from the Source Documents

These are **intentional and binding**. Implement the right column, not the source document.

| # | Source says | Build instead | Why | ADR |
|---|---|---|---|---|
| 1 | Detect broken Slides links at runtime (Design §20.3) | CI link check → `linkHealth` field; server-rendered alert | CORS makes runtime detection impossible | 0006 |
| 2 | Clickable card containing a Present button (Design §11.2) | Linked-card pattern: title anchor + `::after` overlay; button layered above | Nested interactives are invalid HTML | 0007 |
| 3 | Hero name fades in, 200 ms delay + 500 ms (Design §23.4) | Name paints immediately; optional transform-only rise | `opacity:0` delays LCP by ~700 ms | 0008 |
| 4 | Future sections hidden (Design §28.2) vs Coming Soon pages (Design §18.4) | Routes exist + render Coming Soon; absent from nav; `noindex` | Satisfies both intents | §6.4 |
| 5 | Panel = viewport ≥1920px (Design §17.1) | ≥1920px **AND** coarse pointer / no hover | Desktop monitors are 1920px too | 0011 |
| 6 | Dropbox `?dl=1` (Design §15.2) | `?dl=0` default; `forceDownload` per item | Downloads may not open on a panel | 0012 |
| 7 | Backup shown only when Slides fails (Design §20.3) | Backup shown **whenever it exists** | Health data can be a week stale | 0006 |

**Plus one addition:** header search is an **AC-1 requirement**, not optional. It is the only ≤3-click path to presentations outside the 3-item rail (§6.3).

### 24.4 Invariants — Breaking These Is an Architecture Change

| # | Invariant |
|---|---|
| **I1** | All content renders without JavaScript. Present and Backup are real `<a>` tags. |
| **I2** | No runtime dependency on Google/Dropbox for page render. |
| **I3** | No secrets anywhere in the system. |
| **I4** | Content is data, never code. |
| **I5** | The build is the validation gate. Invalid content cannot deploy. |
| **I6** | Islands are leaf-level and independent. |

### 24.5 The Critical Path — Get This Right First

```html
<!-- The most important markup in the product. -->
<a href={presentUrl} target="_blank" rel="noopener noreferrer" class="btn btn--primary">
  <Icon name="play" aria-hidden="true" />
  Present
  <span class="btn__subtitle">Opens in Google Slides</span>
</a>
```

Rules:
- It is an **anchor, not a button with `onClick`**. It works before hydration, without JS, and with a middle-click.
- The island **enhances** it (records recency); it never replaces it.
- `rel="noopener noreferrer"` is mandatory (reverse-tabnabbing).
- The subtitle is inside the anchor so it is part of the accessible name.
- Disabled state (dead link) renders a `<button disabled>` instead, with the backup promoted.

**Test this on a real projector at Phase D step 15 — before building the rest of the UI.**

### 24.6 Budgets and Thresholds (fail CI)

| Metric | Limit |
|---|---|
| Homepage JS | ≤20 KB compressed |
| Homepage CSS | ≤15 KB compressed |
| Detail page total | ≤35 KB compressed |
| LCP (lab) | ≤1.5 s |
| INP | ≤100 ms |
| CLS | ≤0.05 |
| Owned launch segment | ≤700 ms p75 |
| axe violations | 0, in both themes |
| TypeScript errors | 0 |

### 24.7 Open Questions for the Product Owner

Blocking or near-blocking. Design Spec §30 raised several; these are the ones with **engineering consequences**.

| # | Question | Assumption if unanswered | Impact |
|---|---|---|---|
| **1** ⚠️ | **Is ≤3 s acknowledged as covering only the segment we control (≤700 ms)?** Google Slides owns the majority of the budget. | Proceed with the split budget in §14.2 | AC-1 measurability. **Get this in writing before launch review.** |
| **2** | Keep the hover quick-launch on rail cards? (Design §30 Q1) | Keep it | Removing it is a small deletion; the card pattern stays |
| **3** | Is per-visitor localStorage recency right, or should Harshit curate a `featured` flag? (OQ-3) | localStorage + Latest fallback | A curated flag is a schema addition + rail change |
| **4** | Exact contact methods? (OQ-4) | Email + form + optional socials | Content only, no structural change |
| **5** | Is JetBrains Mono actually used anywhere? | **Drop it** — it appears in no component | One fewer font family to load |
| **6** | Confirm the subject list for the enum | Start from the spec's gradient map | Enum values must exist before content authoring |
| **7** | Custom domain at launch? | Netlify subdomain initially | Affects canonical URLs and sitemap |

### 24.8 What Is Deliberately Not Built

Say no to these until the trigger fires (§20.4): service worker/offline, analytics/RUM (Phase 2), QR code (Phase 2), visual regression testing (>30 components), i18n (logical properties are already in place as insurance), any CMS UI (ADR-0004 upgrade path), any authentication (would break I3), and Projects/Certificates/Resume content (Phase 3 — routes already exist).

### 24.9 Reference Map

| Need | Source | Authority |
|---|---|---|
| What to build, acceptance criteria | PRD v1.0 | Product truth |
| Colours, type, spacing, states, copy | Design Spec v2.0 §§6–29 | Design truth |
| Exact token values | Design Spec §26.1 | Copy **verbatim** |
| Verified contrast ratios | Design Spec §25.1 | Do not introduce unverified pairings |
| Component inventory, props, states | Design Spec §29.1, §29.6 | With §7.4 card correction |
| Responsive behaviour | Design Spec §24, §29.4 | With §12.3 panel correction |
| Motion values | Design Spec §29.5 | With §13.3 LCP correction |
| **How to engineer it** | **This document** | **Engineering truth** |
| Where they conflict | **This document, §24.3** | **Binding** |

### 24.10 Definition of Ready to Launch

```
□ All 13 acceptance criteria (PRD §19) verified
□ Every published presentation opens correctly — manually checked, all of them
□ Present path tested on: mid-range Android, laptop, the actual classroom panel
□ Keyboard-only pass on every page; focus never lost or invisible
□ Screen-reader pass on the critical path (home → detail → Present)
□ axe clean on all routes, light and dark
□ Lighthouse CI within budget on all routes
□ JS-disabled test: all content renders, Present and Backup work
□ CSP enforced (after report-only verification), security headers live
□ 404 tested; broken-link alert state tested with a deliberately dead URL
□ Harshit has added a presentation end-to-end, unaided, using only a browser
□ Rollback rehearsed once
□ ADDING-A-PRESENTATION.md and RUNBOOK.md complete
□ Open question #1 (§24.7) answered in writing
```

---

## Appendix A — Requirements Traceability

Every Must/Should requirement mapped to its architectural mechanism.

| Req | Requirement | Mechanism | § |
|---|---|---|---|
| FR-1 | Gallery listing | Static page from collection | §6.1 |
| FR-2 | Search title/subject/tags | Build-time index + matcher | §11 |
| FR-3 | Recently-used rail | localStorage + Latest fallback | §10.4 |
| FR-4 | Cards with title/subject/identifier | PresentationCard + SubjectVisual | §7.4 |
| FR-5 | Detail page with meta + actions | `[slug].astro` | §6.1 |
| FR-6 | Google Slides primary | `googleSlidesUrl`, `/present` enforced | §8.1 |
| FR-7 | Dropbox backup | `dropboxUrl`, always shown | §16.3 |
| FR-8 | Full-screen launch | New-tab anchor to `/present` | §24.5 |
| FR-9 | Home page | `index.astro` | §7.3 |
| FR-10 | About | `about.md` collection | §8.5 |
| FR-11/12/13 | Future sections | Routes exist, `noindex`, unlinked | §6.4 |
| FR-14 | Contact | Netlify Forms + honeypot | §18.4 |
| FR-15/16 | <10, finalized only | `published` flag | §8.1 |
| FR-17 | No code changes to add | Git-as-CMS | ADR-0004 |
| FR-18 | Clear global nav | Header + active states | §7.3 |
| FR-19 | ≤3 clicks | Rail + header search | §6.3 |
| FR-20 | Responsive | 5 breakpoints, mobile-first | §12.3, Design §24 |
| NFR-1 | Premium | Tokens verbatim; no CLS; motion discipline | §13, §14 |
| NFR-2 | Performance | Static + edge + budgets | §14 |
| NFR-3 | Responsive | Design §24 implemented | §12.3 |
| NFR-4 | Professional | Design system fidelity | §22.3 |
| NFR-5 | Maintainability | Git-as-CMS + docs | §9 |
| NFR-6 | Scalability | Documented thresholds | §20.2 |
| NFR-7 | Graceful degradation | Layered failure handling | §16.4 |
| NFR-8 | Accessibility | WCAG 2.2 AA + CI gates | §15 |
| NFR-9 | Privacy | No cookies/tracking/PII storage | §19.5 |
| AC-1 | ≤3 clicks / ≤3 s | Verified; timing split | §6.3, §14.2 |
| AC-3 | Launch works 100% | Anchor + link check + backup | §16.3 |
| AC-5 | Search + empty state | §11 + Design §18.3 | §11 |
| AC-7 | Links valid at release | CI link check | §8.4 |
| AC-9 | No-code add, documented | ADR-0004 + authoring guide | §9.2 |
| AC-11 | Keyboard + a11y checks | §15.5 gates | §15 |
| EC-1/2 | Broken links | `linkHealth` states | §16.3 |
| EC-3 | Offline | Offline detection + notice | §16.2 |
| EC-5 | Long titles | Clamp on card, never on detail | §7.4 |
| EC-6 | No search results | Empty state + reset | §11 |
| EC-7 | No recents | Latest fallback | §10.4 |
| EC-11 | Keyboard-only | §15.4 focus management | §15 |
| EC-12 | Invalid route | Static 404 with recovery | §16.6 |

## Appendix B — Verified Technical Facts

| Fact | Source | Verified |
|---|---|---|
| Core Web Vitals: LCP ≤2.5 s, INP ≤200 ms, CLS ≤0.1, p75, all three must pass | web.dev (primary, fetched) | 2026-08-04 |
| INP replaced FID, March 2024 | web.dev + corroborating | 2026-08-04 |
| WCAG 2.2 current Recommendation; 87 criteria; ISO/IEC 40500:2025 | Multiple, consistent | 2026-08-04 |
| WCAG 3.0 Working Draft; CR ~Q4 2027; Rec not before 2028 | Multiple, consistent | 2026-08-04 |
| Astro 6 stable 2026-03-10; Fonts API, CSP API, Live Content Collections | astro.build/blog/astro-6 | 2026-08-04 |
| Astro joined Cloudflare Jan 2026; remains MIT/open governance | Multiple, consistent | 2026-08-04 |
| Netlify Forms built-in; Cloudflare Pages has no equivalent | Multiple, consistent | 2026-08-04 |
| CVE-2025-55182 (React2Shell) CVSS 10.0, CISA KEV, exploited ~24 h after disclosure | Tenable, Datadog, Censys | 2026-08-04 |
| Automated a11y tooling detects ~30–57% of WCAG issues | Multiple studies, range | 2026-08-04 |

**Not verified / stated as engineering judgment:** island size estimates in §14.3 (measure during implementation and adjust budgets); the ≤700 ms owned-segment target (a target, not a measurement); the ~100-item search cut-over (an order-of-magnitude estimate carried from Design §14.4).

---

## Appendix C — Self-Audit

**Contradictions checked.** Design §28.2 (hide future sections) vs §18.4 (Coming Soon pages) — resolved in §6.4. Design §20.3 (conditional backup) vs EC-2 robustness — resolved in §16.3 in favour of always showing. PRD AC-1 (≤3 clicks for *all*) vs a 3-item rail — resolved by promoting header search to a requirement (§6.3). Design "≤3 s" vs external dependency — split into owned/unowned (§14.2). Design §29.8 (`dropboxUrl` required) vs EC-2 (backup may be broken/absent) — made optional (§8.2).

**Scope coverage.** All 18 required responsibilities and all 23 required deliverables are addressed. Every major decision carries Decision / Rationale / Alternatives / Trade-offs / Consequences, in the ADRs (§23) or inline (§3, §9, §11, §18).

**Known limitations.** (1) Island size figures are estimates until measured. (2) The panel-detection heuristic (§12.3) will misclassify a large non-touch display used as a classroom panel — residual risk documented and accepted. (3) Link-health detection lags up to a week — mitigated by always showing the backup. (4) No field performance data until Phase 2; all launch performance evidence is lab data. (5) The laptop-in-dark-mode-to-projector case cannot be detected from the web platform (§12.3).

**Where this document has a point of view.** It is sceptical of adding a state library, a CSS framework, an animation library, or a search library to a ten-item static site; it treats accessibility failures in the source spec as bugs to fix rather than instructions to follow; and it declines to promise a ≤3 s figure that depends mostly on Google's infrastructure. Each position is argued rather than asserted, and the counterarguments are stated.

---

*End of Technical Architecture Document v1.0 — ready for implementation.*
