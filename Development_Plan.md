# Development Plan: Harshit — Personal Academic Portfolio & Presentation Hub

**Author:** Senior Technical Project Manager & Development Planner  
**Role:** Senior TPM / Frontend Architect Handoff  
**Version:** 1.0.0  
**Date:** 2026-08-04  
**Target Audience:** Senior Frontend Developer, Frontend Architect, Technical Stakeholders  
**Status:** Approved for Implementation  

---

## 1. Project Overview

### 1.1 Objectives
The purpose of this project is to implement a high-performance, premium personal academic portfolio and presentation hub for Harshit. The site must serve two primary, tightly-coupled business objectives:
1. **The 10-Second Launch (Classroom UX):** A highly optimized, low-friction pathway for Harshit to launch his active academic presentations on school projectors within seconds of being asked by a teacher.
2. **The Polished Impression (Portfolio UX):** A modern, premium digital portfolio that showcases Harshit's achievements to teachers, peers, and future recruiters, designed to grow with him over time.

These objectives translate into concrete, measurable technical targets:
* **Fastest Presentation Access (O1):** Reach the full-screen presentation mode from the home page in ≤ 3 clicks and ≤ 3 seconds.
* **Premium First Impression (O2):** Load the critical above-the-fold content instantly (LCP ≤ 1.5 seconds) to establish a premium look within 5 seconds of the initial visit.
* **Effortless Navigation (O3):** Provide logical, keyboard-accessible pathways with zero dead ends, broken links, or empty state traps.
* **Future-Ready Foundation (O4):** Maintain a strict separation of data and code via Git-as-CMS. Harshit must be able to publish or edit presentations without modifying the codebase.
* **Device-Agnostic Usability (O5):** Ensure full responsive fidelity from small mobile screens (320px) to large classroom touch panels (1920px+).
* **Low Maintenance (O6):** Minimize runtime overhead by using a fully static framework deployed to a global CDN (Netlify) with zero client-side database connections.

### 1.2 Key Deliverables
* **Production Codebase:** Standard-compliant, statically pre-rendered Astro 6 application utilizing TypeScript and Preact for isolated island hydration.
* **Asset Optimization Pipeline:** Self-hosted, subsetted, and metric-adjusted web fonts (`Plus Jakarta Sans` and `Inter`) and automated image compression via Astro Assets.
* **Automated CI/CD Workflows:** GitHub Actions pipelines for linting, type-checking, Lighthouse performance budgeting, automated `axe-core` accessibility scans, and a weekly scheduled external link health checker.
* **Forms Integration:** A privacy-compliant contact form backed by Netlify Forms and protected by a client-side honeypot field.
* **Documentation Suite:** 
  - `README.md` (Developer setup and guidelines)
  - `ADDING-A-PRESENTATION.md` (A simplified guide written for Harshit to add content using only a browser)
  - `RUNBOOK.md` (Maintenance procedures, incident checklist, manual pre-class verification, and deployment rollback instructions)

### 1.3 Key Project Assumptions
* **Light Mode Default:** To ensure readability on low-contrast school projectors, the website will default to light mode on all visits. System preference detection (`prefers-color-scheme`) is deliberately ignored for initial loads to prevent accidental dark rendering in class.
* **JetBrains Mono Dropped:** After a comprehensive audit of the design specifications, no visible components utilize `JetBrains Mono`. To optimize bundle size, this font is dropped, leaving only two font families to download.
* **Netlify Platform:** Netlify is the chosen host. The primary factor is Netlify's native, zero-configuration form handling, which supports honeypot fields and automated spam filtering.
* **No Database Dependencies:** The product functions as a static site. The search index, presentation listings, and detail pages are computed entirely at build time, preventing runtime database failures.

---

## 2. Development Phases

The project will be built in **8 sequential phases** to establish a solid architectural foundation before layered features are introduced.

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    PHASE A — Foundation (No UI)                         │
└────────────────────────────────────┬────────────────────────────────────┘
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    PHASE B — Shared Primitives                          │
└────────────────────────────────────┬────────────────────────────────────┘
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                     PHASE C — Chrome & Frame                            │
└────────────────────────────────────┬────────────────────────────────────┘
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                 PHASE D — Presentation Gallery & Engine                 │
└────────────────────────────────────┬────────────────────────────────────┘
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                     PHASE E — Homepage Layout                           │
└────────────────────────────────────┬────────────────────────────────────┘
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                     PHASE F — Global Search Hub                         │
└────────────────────────────────────┬────────────────────────────────────┘
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    PHASE G — Remaining Pages & 404                      │
└────────────────────────────────────┬────────────────────────────────────┘
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    PHASE H — Hardening & Release                        │
└─────────────────────────────────────────────────────────────────────────┘
```

* **Phase A — Foundation (No Visible UI):** Core tooling, package configurations, strict linting rules, Zod content schemas, global theme tokens, and CI skeletal construction.
* **Phase B — Shared Primitives & Design System:** Pure presentational Astro components built in isolation and subjected to immediate automated accessibility gates.
* **Phase C — Chrome & Layouts:** Implementing the global frame (`BaseLayout`), headers, footers, mobile navigation, and the `ThemeToggle` island.
* **Phase D — Presentation Gallery & Detail Pages:** Setting up the core presentation dynamic engine, linked-card patterns, fallback backup links, and the projector-ready action row.
* **Phase E — Homepage Layout:** Integrating above-the-fold content, the dynamic `RecentRail` island, client-side recency tracking, and static teaser blocks.
* **Phase F — Global Search Experience:** Build-time search index generation, hand-rolled high-performance search matching, and the fully accessible `SearchOverlay` island.
* **Phase G — Remaining Pages & Dynamic Layouts:** Content-driven Pages (/about, /contact with form hydration, /projects "Coming Soon" routes, 404, and 500 pages).
* **Phase H — Hardening & Pre-launch Quality Assurance:** Automated Lighthouse budget checks, comprehensive keyboard-navigation sweeps, security headers, report-only CSP transition to Enforced, and physical device performance verification.

---

## 3. Milestones

| Milestone | Title | Trigger Phase | Expected Outcome |
|---|---|---|---|
| **M1** | **Architectural Gate & Contracts** | End of Phase A | Workspace scaffolded; Zod content contract verified; ESLint & Stylelint configured; CI pipeline active. |
| **M2** | **Design System & Shell Complete** | End of Phase C | Verbatim token set applied; Header, Footer, and Navigation functional across mobile/tablet/panel widths; Dark mode hydrated without flash (FOUC guard validated). |
| **M3** | **Critical Launch Flow Verified** | End of Phase D | Presentations dynamic engine operational; Linked-card pattern rendering valid HTML; `/present` path manually validated on a physical projector; Dropbox backup link functioning. |
| **M4** | **Core Experience & Search Active** | End of Phase F | Homepage fully composed; Recent/Latest rail dynamic fallbacks verified; Search indexing working at build-time; Search overlay keyboard-navigable. |
| **M5** | **Pre-Launch Handoff & Go-Live** | End of Phase H | WCAG 2.2 AA audit passed; Lighthouse budgets satisfied; ADDING-A-PRESENTATION.md and RUNBOOK.md complete; CSP enforced; Site live on Netlify custom domain. |

---

## 4. Task Breakdown

### Phase A — Foundation (No Visible UI)

| Task ID | Task Name | Purpose | Dependencies | Expected Output | Complexity | Effort |
|---|---|---|---|---|---|---|
| **T-A1** | Scaffold Repo | Setup workspace | None | Astro 6, TS strict mode, Preact island framework installed. | Low | 2h |
| **T-A2** | Global Styles | Initialize CSS layer | **T-A1** | `tokens.css` (Spec §26.1 VERBATIM), `tokens.dark.css` (data-theme overrides), and reset-focused `global.css`. | Low | 3h |
| **T-A3** | Content Contract | Define dynamic models | **T-A1** | Zod schemas inside `src/content/config.ts` for presentations and site profile (PRD §8). | Medium | 4h |
| **T-A4** | Seed Presentations | Content mock setup | **T-A3** | 3 real JSON presentation content files in `src/content/presentations/`; verify build failure on bad schemas. | Low | 2h |
| **T-A5** | CI Framework Setup | Automated quality gate | **T-A2** | `.github/workflows/ci.yml` running typecheck, lint, stylelint, and test triggers on every push. | Medium | 4h |
| **T-A6** | Setup Base Layout | Compose standard HTML shell | **T-A2** | `BaseLayout.astro` containing the critical blocking inline theme FOUC-prevention script. | Medium | 3h |

### Phase B — Shared Primitives (No External State/Context)

| Task ID | Task Name | Purpose | Dependencies | Expected Output | Complexity | Effort |
|---|---|---|---|---|---|---|
| **T-B1** | Dynamic Button | Reusable button wrapper | **T-A6** | `Button.astro` supporting both `<button>` and `<a>` (with rel rules) dynamically based on href. | Low | 3h |
| **T-B2** | Accessory UI Elements | Shared UI primitives | **T-A6** | `IconButton.astro`, `Tag.astro`, `Alert.astro`, and `EmptyState.astro`. | Low | 3h |
| **T-B3** | Skeleton & Overlines | Contextual decorators | **T-A6** | `Skeleton.astro`, `Breadcrumb.astro`, `SectionOverline.astro`, and `VisuallyHidden.astro`. | Low | 2h |
| **T-B4** | Primitive Test Pass | Validate layout block accessibility | **T-B1..3** | Vitest testing suites confirming HTML validity and axe accessibility for all Phase B components. | Medium | 4h |

### Phase C — Chrome & Frame (Navigation and Global Shell)

| Task ID | Task Name | Purpose | Dependencies | Expected Output | Complexity | Effort |
|---|---|---|---|---|---|---|
| **T-C1** | Global Header Component | Create site navigation | **T-B2** | `Header.astro` with scroll-shadow styling, active state rules, and CSS glass effects (Design §28.4). | Medium | 4h |
| **T-C2** | Mobile Navigation Island | Hydrate collapsible menu | **T-C1** | `MobileMenu.tsx` Preact island handling aria-expanded, focus traps, Escape closing, and inert overlays. | Medium | 5h |
| **T-C3** | Tablet Dropdown Logic | Collapse nav overflow | **T-C2** | Responsive CSS collapse. At 768–899px: excess links move to a keyboard-focusable CSS "More" dropdown. | Medium | 3h |
| **T-C4** | ThemeToggle Island | Dynamic dark-mode toggle | **T-A6** | `ThemeToggle.tsx` (client:idle) managing `localStorage` writes and `data-theme` attribute flips. | Medium | 3h |
| **T-C5** | Global Footer | Design compliant signature footer | **T-B2** | `Footer.astro` rendering site credentials, layout boundaries, and copyright. | Low | 2h |

### Phase D — Presentation Gallery & Detail Pages (Core Engine)

| Task ID | Task Name | Purpose | Dependencies | Expected Output | Complexity | Effort |
|---|---|---|---|---|---|---|
| **T-D1** | Layout Decoration Blocks | Feature decorators | **T-B2** | `SubjectVisual.astro` (subject gradient mappings), `PresentationMeta.astro`, and `TagRow.astro`. | Medium | 4h |
| **T-D2** | Linked Presentation Card | High-performance list card | **T-D1** | `PresentationCard.astro` implementing the **ADR-0007 Linked-Card Pattern** (no nested interactives). | Medium | 4h |
| **T-D3** | Dynamic Gallery Route | Render catalog static routes | **T-D2** | `/presentations/index.astro` listing all published items without filtering, using Astro Content Collections. | Low | 3h |
| **T-D4** | Interactive Gallery Island | Hydrate list filters | **T-D3** | `GalleryController.tsx` (client:load) managing subject filters, sort options, and syncing filters with the URL. | High | 6h |
| **T-D5** | Presentation Details | Render presentation layout page | **T-D1** | `/presentations/[slug].astro` dynamic routes. Renders unlimited-line H1 titles and `LinkHealthAlert.astro`. | Medium | 4h |
| **T-D6** | Presentation Action Row | Projector-optimized launch pad | **T-D5** | `ActionRow.astro` rendering the critical Present and Backup `<a>` links (ADR-0006, ADR-0012). | Medium | 3h |
| **T-D7** | Projector Dry-Run | Critical path physical check | **T-D6** | **Day-One release gate check.** Manual validation of primary slides opening on a low-end projector/monitor. | Low | 2h |

### Phase E — Homepage Layout (Above-the-Fold Engagement)

| Task ID | Task Name | Purpose | Dependencies | Expected Output | Complexity | Effort |
|---|---|---|---|---|---|---|
| **T-E1** | Hero Section | Main landing presentation | **T-B1** | `Hero.astro` with optimized LCP text, immediate name painting, and secondary nav CTA (ADR-0008). | Low | 3h |
| **T-E2** | Dynamic RecentRail Island | Hydrate personal launch bar | **T-D2** | `RecentRail.tsx` (client:load) handling `localStorage` check. Shows top 3 recencies, falls back to latest additions. | High | 6h |
| **T-E3** | Teaser Sections | Static homepage highlights | **T-B3** | About and Contact section teaser cards rendering on the homepage. | Low | 2h |

### Phase F — Global Search Experience

| Task ID | Task Name | Purpose | Dependencies | Expected Output | Complexity | Effort |
|---|---|---|---|---|---|---|
| **T-F1** | Static Search Index | Build-time JSON creation | **T-A4** | `src/pages/search-index.json.ts` rendering minimal static JSON of title, subject, tags, and slugs at build. | Medium | 3h |
| **T-F2** | Search Match Engine | Implement client-side scorer | **T-F1** | `matcher.ts` implementing a scoring matcher over titles, exact tags, and subjects with unit tests. | Medium | 5h |
| **T-F3** | SearchOverlay Island | Hydrate modal search | **T-F2** | `SearchOverlay.tsx` (client:idle) managing full overlays, focus trap, arrow navigation, and polite aria-live alerts. | High | 8h |

### Phase G — Remaining Pages & Dynamic Layouts

| Task ID | Task Name | Purpose | Dependencies | Expected Output | Complexity | Effort |
|---|---|---|---|---|---|---|
| **T-G1** | Long-Form About Page | Build biography | **T-A6** | `/about.astro` composing long-form Markdown content from collections and optimized profile image block. | Low | 3h |
| **T-G2** | Contact Page & Form | Gather recruiter messages | **T-B1** | `/contact.astro` hosting `ContactForm.tsx` (client:visible) with honeypot validation and Netlify integrations. | Medium | 5h |
| **T-G3** | Coming Soon Placeholders | Future feature paths | **T-A6** | `/projects.astro`, `/certificates.astro`, `/resume.astro` configured with `noindex` and Coming Soon pills. | Low | 2h |
| **T-G4** | Standard Error Layouts | Handle 404 & 500 edge cases | **T-A6** | Custom `404.astro` and `500.astro` pages containing recovery CTAs. | Low | 2h |

### Phase H — Hardening & Pre-launch Quality Assurance

| Task ID | Task Name | Purpose | Dependencies | Expected Output | Complexity | Effort |
|---|---|---|---|---|---|---|
| **T-H1** | Accessibility Audits | Check WCAG 2.2 AA conformity | **T-G4** | Full static and dynamic axe scans, keyboard navigation audit, and VoiceOver screen-reader flow validation. | Medium | 5h |
| **T-H2** | Security Headers & CSP | Configure Netlify production gates | **T-A6** | `netlify.toml` with custom headers, CSP rules with hash-allowlisted inline scripts (no `unsafe-inline`). | High | 4h |
| **T-H3** | Budget Audit & Performance | Satisfy Core Web Vitals | **T-E2** | LHCI audits on deploy previews; bundle size check fails the build if homepage JS > 20KB or CSS > 15KB. | Medium | 4h |
| **T-H4** | Final Artifact Delivery | Document operations | **T-D7** | Fully populated `ADDING-A-PRESENTATION.md` and `RUNBOOK.md` in `/docs` directory. | Low | 4h |

---

## 5. Dependency Map

The critical path flows from core system contracts down to dynamic page composition and pre-launch security configurations. Below is the step-by-step sequential relationship:

```
[Phase A — Architectural Foundation]
  │
  ├──► [Phase B — Shared UI Primitives]
  │      │
  │      └──► [Phase C — Frame, Chrome & Site Navigation]
  │             │
  │             ├──► [Phase D — Presentations Engine & Route Creation]
  │             │      │
  │             │      └──► [Phase E — Homepage Composition]
  │             │             │
  │             │             └──► [Phase F — Global Search Hub] ◄── [Search-Index API Endpoint]
  │             │                    │
  │             │                    └──► [Phase G — About, Contact, Coming Soon & Errors]
  │             │                           │
  │             │                           └──► [Phase H — Performance, Security & Launch Gates]
  │             │                                  │
  │             │                                  └──► (GO-LIVE RELEASE)
```

### Key Concurrency Windows
While the primary flow is sequential to prevent foundations from shifting, certain tasks can be split across distinct development resources:
* **UI Development Split:** Once **Phase B (Shared Primitives)** is locked, one developer can build the static global chrome (**T-C1**, **T-C5**) while another implements the presentations feature layout components (**T-D1**, **T-D2**).
* **Search vs Contact Parallelism:** The backend-focused implementation of the search index matcher (**T-F1**, **T-F2**) can run in parallel with the contact page form hydration setup (**T-G2**).

---

## 6. Component Build Order

To maximize engineering efficiency, prevent style refactoring, and secure high-contrast accessibility from day one, implement the component inventory in the following order:

```
  ┌────────────────────────────────────────────────────────┐
  │ 1. SHARED PRIMITIVES (No Dependencies)                 │
  │    VisuallyHidden ➔ SkipLink ➔ Tag ➔ Alert ➔           │
  │    EmptyState ➔ Skeleton ➔ Breadcrumb ➔ Button         │
  └──────────────────────────┬─────────────────────────────┘
                             ▼
  ┌────────────────────────────────────────────────────────┐
  │ 2. GLOBAL CHROME & CORE LAYOUTS                        │
  │    BaseLayout (Theme Script) ➔ PageLayout ➔            │
  │    SeoHead ➔ Footer ➔ Header                           │
  └──────────────────────────┬─────────────────────────────┘
                             ▼
  ┌────────────────────────────────────────────────────────┐
  │ 3. HYDRATED NAVIGATION ISLANDS                         │
  │    MobileMenu (client:media) ➔ ThemeToggle (client:idle)│
  └──────────────────────────┬─────────────────────────────┘
                             ▼
  ┌────────────────────────────────────────────────────────┐
  │ 4. PRESENTATION DISPLAY LAYOUTS                        │
  │    SubjectVisual ➔ PresentationMeta ➔ TagRow ➔         │
  │    PresentationCard (Linked-Card Pattern) ➔            │
  │    ActionRow ➔ LinkHealthAlert                         │
  └──────────────────────────┬─────────────────────────────┘
                             ▼
  ┌────────────────────────────────────────────────────────┐
  │ 5. FEATURE HYDRATED ISLANDS                            │
  │    GalleryController (client:load) ➔                   │
  │    RecentRail (client:load) ➔                          │
  │    SearchOverlay (client:idle) ➔                       │
  │    ContactForm (client:visible)                        │
  └────────────────────────────────────────────────────────┘
```

### Rationale
* **Shared Primitives First:** Higher-order components like `PresentationCard` or `Footer` rely directly on `Tag` and `Button`. Building primitives first avoids duplicate mock code and layout drift.
* **Layouts and Shell Before Islands:** Hydrated Preact components (such as `ThemeToggle` or `MobileMenu`) are injected directly inside the static layout header. The static shell must be styling-complete before hydration models are introduced.
* **Presentational Modules Before Controller Islands:** The `/presentations` gallery controller orchestrates the listing. Standardizing the dynamic rendering of the `PresentationCard` and metadata blocks ensures the controller is hydrating reliable, already-tested HTML nodes.

---

## 7. Risk Assessment

Based on Technical Architecture Document §21 and Product Requirements Document §17, the following risk matrix details core implementation risks and active mitigation plans:

| ID | Risk Description | L | I | Concrete Mitigation Strategy | Designated Owner |
|---|---|---|---|---|---|
| **R-1** | **Slides Load Dominates Budget:** Homepage launch exceeds the ≤3s budget because the external Google Slides document takes too long to resolve. | H | H | **Split Budget Enforcement:** The development team only commits to and measures the segment they control (homepage load, detail click, prefetch, and action dispatch) at ≤700ms p75. Obtain formal product owner approval. | Lead TPM / Product Owner |
| **R-2** | **Google Authentication Obstacle:** Harshit launches a presentation in class, but a Google Sign-In pop-up interrupts the flow. | M | H | **Authoring Guideline Enforcement:** Standardize "Anyone with link" as Step 1 of the Content Authoring checklist. In addition, place an explanatory alert box containing login hint copy on the dynamic details page (Design §20.7). | Senior Developer / Harshit |
| **R-3** | **External Link Rot:** Google Slides or Dropbox URLs are deleted or moved, leaving broken links on live cards. | M | H | **Build-Time Health Checks:** Run a scheduled weekly CI workflow (`link-check.yml`) that sends HEAD probes to all links, flags anomalies as GitHub Issues, and commits a `linkHealth` object directly to the content model. | Devops / CI |
| **R-4** | **Authoring Edits Break Build:** Harshit makes a typing error in a presentation JSON file that causes build crashes. | M | M | **Strict Schemas & Local Validation:** Maintain a strict Zod contract. Netlify deploys are transactionally safe; any failure stops the build and reports exact file and field naming errors via email, keeping the live site untouched. | Senior Developer |
| **R-5** | **Dark Mode Washout on Projectors:** Harshit logs onto the site using a laptop with dark mode enabled, washing out colors on the classroom wall. | L | M | **Default-Light & Panel Override:** Light mode is the default and never auto-switches on preferences. Furthermore, apply touch-panel detection rules to viewports ≥1920px (coarse pointers) to hide the toggle and force light mode. | Senior Developer |
| **R-6** | **Header Blur Layout Jank:** Frosted-glass backdrop filters stutter on low-powered school projection hardware. | L | M | **Graceful Feature Degradation:** Enforce solid, connection-less backgrounds at viewports ≥1920px, and implement a CSS `@supports` rule falling back to opaque white when backdrop blur is unsupported. | Front-End Dev |
| **R-7** | **A11y Regressions:** Code updates inadvertently break focus indicators or introduce screen-reader traps. | M | M | **CI Guardrails:** Integrate automated `@axe-core/playwright` rules in the testing workflow across both light and dark themes. Establish a mandatory keyboard manual pass as a release gate. | QA Engineer |
| **R-8** | **Form Spam Flooding:** Bot crawlers flood the Netlify contact submissions form with spam messages. | M | M | **Honeypot Decoy Integration:** Implement a visually hidden input field decorated with `aria-hidden="true"` and `tabindex="-1"`. Netlify parses this honeypot instantly and discards bot submissions. | Front-End Dev |

---

## 8. Quality Gates

Before progressing to the next stage of development, the codebase must clear these explicit quality targets. There are no exemptions.

### Gate 1: Foundation Exit (Entering Phase B)
* [ ] TypeScript strictly compiles with zero errors under `strict: true`.
* [ ] ESLint and Stylelint return zero errors; custom rules preventing the use of `--color-neutral-400` in text declarations are validated.
* [ ] The Zod schema correctly rejects malformed presentation date entries (e.g., `"2026-13-45"`) and fails the local build task.

### Gate 2: Primitive & Layout Exit (Entering Phase D)
* [ ] Shared buttons render as an anchor (`<a>`) when an `href` attribute is passed, and as a button (`<button>`) when it is absent.
* [ ] Focus outlines are visible, high-contrast (using `--color-focus` with ≥ 4.5:1 ratio on white), and use a standard offset style.
* [ ] The inline FOUC prevention script successfully intercepts dark mode toggles under local storage simulations with zero style flashes.
* [ ] Mobile navigation expands and collapses across keyboard and pointer interactions with focus trapped correctly within active states.

### Gate 3: Presentations Engine Exit (Entering Phase E)
* [ ] Dynamic routing builds distinct files for every item inside the `content/presentations/` directory.
* [ ] **Critical Path Release Gate:** The Present launch action is successfully executed on a physical school projector. Slides open correctly in a new tab without javascript errors or layout shift.
* [ ] Dropbox backup elements render on detail screens, defaulting to preview modes (`?dl=0`) unless a custom `forceDownload` field is explicitly enabled.

### Gate 4: System Integration Exit (Entering Phase G)
* [ ] The search overlay traps focus on trigger click, closes gracefully upon Escape, and announces results dynamically via `aria-live="polite"`.
* [ ] Client-side recency logic correctly writes to `localStorage['recency']` on launch click, rendering the top 3 cards in the `Recent Presentations` homepage rail.

### Gate 5: Production-Ready Release (Deploying to Live)
* [ ] **100% WCAG 2.2 Level AA compliance** achieved; zero automated axe-core violations exist on any route, under both light and dark themes.
* [ ] Keyboard-only navigation pass successfully navigates from Home ➔ Search ➔ Gallery ➔ Details ➔ Present without losing focus.
* [ ] Lighthouse performance audits score ≥ 95 across all metrics; CSS and JS bundle sizes are verified to be within their respective route budgets.
* [ ] Offline fallback alert blocks render properly under simulated offline environments (EC-3).
* [ ] Rollback strategy successfully rehearsed.

---

## 9. Testing Strategy

The quality strategy is structured as an integration-heavy testing pipeline, reflecting that frontend bugs frequently emerge from layout integration gaps.

```
       ▲  [ E2E PLAYWRIGHT SCANS ]  ➔ Validate the 8 critical journeys
      ╱█╲
     ▕███▏ [ SYSTEM COMPONENT TESTS ] ➔ Validate rendering & a11y (axe)
    ▕█████▏
   ▕███████▏ [ ISOLATED UNIT TESTS ]  ➔ Validate matcher, recency, & helpers
  ▕█████████▏
 ▕███████████▏ [ STATIC LINT & COMPILER ] ➔ Enforce TS types, ESLint, & Stylelint
```

### 9.1 Static Analysis & Quality Controls
* **TS Compilations:** Strict TypeScript type audits on every local save and CI execution.
* **ESLint Constraints:** Restrict imports to ensure `shared/` elements never import from domain-specific `features/`, and features are only importable via their main root `index.ts`.
* **Stylelint Rules:** Enforce CSS custom property compliance. Reject raw color declarations or spacing parameters, and completely block the use of `--color-neutral-400` on text rules.

### 9.2 Unit Testing (Vitest)
Unit tests operate on pure, stateless helper utilities. This layer runs rapidly in isolation and uses Test-Driven Development (TDD) principles:
* `matcher.ts`: Tests exact scoring matchups over query terms, tag combinations, and subject titles.
* `recency.ts`: Validates `localStorage` reading, sorting, array slice constraints (max 3), and fallback latest date insertions.
* `sorting.ts`: Verifies list sorting options (Most Recent, Oldest First, Title A-Z, Subject A-Z).
* `slidesUrl.ts`: Ensures that any passed Google Slides URL is normalized and correctly forced to open with the `/present` suffix.

### 9.3 Component Testing (Vitest + Testing Library + axe)
Tests check individual UI primitives and Preact islands in isolation, verifying structural state changes and accessibility:
* Primity components (e.g., buttons, tags, alerts) are parsed for structural validity and WCAG AA contrast conformance.
* Hydrated islands are simulated across trigger inputs (clicks, key presses) to ensure keyboard state modifications register correctly.

### 9.4 End-to-End Testing (Playwright)
End-to-End scripts validate actual user journeys under simulated web browser environments. The pipeline enforces **eight non-negotiable critical journeys**:
1. **Critical Slides Path:** Home Page ➔ Click rail card ➔ Detail Page ➔ Click Present CTA. Verifies that the correct normalized Google Slides URL opens in a new tab with standard rel properties.
2. **Rail Quick-Launch:** Home Page (Recent Rail) ➔ Hover card (desktop) ➔ Click Quick-Launch icon button. Verifies immediate presentation launch and correct recency logging.
3. **Gallery Search:** Presentations Gallery ➔ Click search overlay ➔ Type "Science" ➔ Click result card ➔ Launches presentation.
4. **Header Search Accessibility:** Global Header ➔ Open search overlay via button ➔ Type search query ➔ Navigate through results with Arrow keys ➔ Select with Enter key ➔ Close via Escape. Confirm focus returns back to the initial header trigger.
5. **Sort Updating:** Gallery Page ➔ Change sort selection. Verify listing is sorted correctly, the URL query parameter updates, and reloading the page retains the sort.
6. **Theme Persistence:** Toggle theme from Light to Dark ➔ Navigate through pages ➔ Reload application. Confirm theme state is preserved and no FOUC flash occurs.
7. **Contact Submission:** Contact Page ➔ Submit invalid fields (validation errors appear) ➔ Enter valid data and fill honeypot (decoy block) ➔ Correct submission triggers Netlify success.
8. **No-JavaScript Fallback:** Disable browser javascript. Verify all static layout structures, presentation cards, detail layouts, and Present/Backup links remain interactive (Invariant I1).

---

## 10. Phase Deliverables

At the end of each development phase, the team must produce the following tangible outputs:

### Phase A
* Complete Astro 6 + TypeScript workspace configuration files.
* Global tokens and utility CSS files (`tokens.css`, `tokens.dark.css`, `global.css`, `utilities.css`).
* Zod content schema contract definitions inside `src/content/config.ts`.
* Baseline CI configuration file (`.github/workflows/ci.yml`).

### Phase B
* Set of 10 fully tested shared UI primitives in `src/shared/ui/`.
* Component accessibility coverage reports confirming 100% axe compliance for primitives.

### Phase C
* Production-ready global `Header.astro`, `Footer.astro`, and `BaseLayout.astro`.
* Keyboard-accessible `MobileMenu.tsx` and `ThemeToggle.tsx` Preact islands.
* Zero-flash dark mode system verification report.

### Phase D
* Presentational layouts: `SubjectVisual.astro`, `PresentationMeta.astro`, `TagRow.astro`.
* Dynamic routes for `/presentations/index.astro` and `/presentations/[slug].astro`.
* Highly performant `PresentationCard.astro` built with the linked-card pattern.
* Manual Projector verification sign-off document for the Present launch flow.

### Phase E
* Optimized homepage layout `/index.astro` with LCP elements properly configured.
* Hydrated `RecentRail.tsx` island with fallback content listing models.

### Phase F
* Dynamic build-time static endpoint `/search-index.json.ts` rendering structured search keys.
* Unit-tested, hand-rolled query matching module `matcher.ts`.
* Hydrated search entry layout overlay `SearchOverlay.tsx`.

### Phase G
* Fully populated Markdown/JSON dynamic pages for `/about.astro` and `/contact.astro`.
* Static dynamic placeholders for Projects, Certificates, and Resume pages.
* Custom, user-friendly error templates `404.astro` and `500.astro`.

### Phase H
* Netlify production configuration files (`netlify.toml`) containing custom headers and strict CSP keys.
* Weekly automated link health checker workflow (`.github/workflows/link-check.yml`).
* Complete operations manuals: `ADDING-A-PRESENTATION.md` and `RUNBOOK.md`.
* Production deployment URL and Lighthouse performance budget results.

---

## 11. Developer Handoff

### 11.1 Day-One Checklist
Welcome to the implementation of Harshit's Academic Hub. Follow this exact sequence on your first day:
1. Run `npm create astro@latest` to scaffold the project. Choose strict TypeScript options and select the Preact island framework adapter (`@astrojs/preact`).
2. Copy the Design Spec §26.1 token block verbatim into `src/shared/styles/tokens.css`.
3. Create the dark mode CSS overrides under the `[data-theme="dark"]` selector in `src/shared/styles/tokens.dark.css`.
4. Implement the Zod content config in `src/content/config.ts` using the schemas from Section 8.1. This is the contract for the entire site's content.
5. Create two valid JSON files inside `src/content/presentations/`. Create a third file with invalid schemas (e.g., bad date, missing field) and verify that the build task fails immediately.
6. Configure the local ESLint and Stylelint files, commit the repository, and stand up the GitHub Actions CI pipeline to verify builds on push before writing any UI code.

### 11.2 Decisions Already Made (Do Not Re-litigate)
To maintain velocity, these decisions are final. Do not re-architect or change these items:
* **No Utility CSS Frameworks:** Styling is built using CSS Custom Properties and Astro scoped CSS. Do not install Tailwind or other utility frameworks.
* **No State Management Libraries:** The application uses URLs, local storage, and Preact's component state. Do not install Redux, Zustand, or other state management libraries.
* **No Animation Libraries:** Implement all visual changes, entrances, and hovers using native CSS transitions and transform/opacity rules.
* **Pure Static Output:** Configure Astro with `output: 'static'`. Everything builds into flat, performant HTML.
* **Hand-Rolled Search Engine:** Implement search query matches using a lightweight build-time JSON search index rather than importing heavy client-side search libraries.

### 11.3 Architectural Invariants (The Invariant Rules)
Violating any of these rules constitutes an architectural change and will fail deployment gates:
* **I1:** The entire website must render fully without JavaScript. The primary Present action and the secondary Dropbox backup action must function as standard HTML anchors (`<a>`). JavaScript and Preact islands should only enhance the experience.
* **I2:** The site must have no runtime dependencies on Google or Dropbox APIs. All details must render correctly even if these external platforms are offline.
* **I3:** No secrets in the system. The codebase has no database credentials or private API keys, ensuring that the client remains completely safe and lightweight.
* **I4:** Content is pure data, never code. No presentation layout copy or metadata is hard-coded into Astro components.
* **I5:** The build step is the ultimate validation gate. Malformed schemas, broken local imports, or style rule violations must stop deployment workflows instantly.
* **I6:** Hydration islands must act as independent leaf nodes. They cannot import other features or maintain deeply nested child states.

### 11.4 The Critical Path: Present Action Structure
The Present CTA is the core of this application. It must be implemented exactly as follows:

```html
<!-- src/features/presentations/components/ActionRow.astro -->
<a 
  href={presentUrl} 
  target="_blank" 
  rel="noopener noreferrer" 
  class="btn btn--primary"
>
  <Icon name="play" aria-hidden="true" />
  Present
  <span class="btn__subtitle">Opens in Google Slides</span>
</a>
```

**Implementation Rules:**
1. It is a **standard anchor, not a button element with an onClick handler**. It must work immediately upon paint, before hydration occurs, and with JavaScript fully disabled.
2. The Preact island enhances the action by recording a launch log to `localStorage` on click, but it never overrides or replaces the anchor's default behavior.
3. The `rel="noopener noreferrer"` properties are mandatory to protect against reverse-tabnabbing vulnerabilities.
4. The helper subtitle text must live inside the anchor element so that it is included as part of the element's accessible name for screen readers.
5. If the presentation is disabled (due to invalid URLs), render a disabled button element instead, and highlight the backup link as the primary action.

### 11.5 Performance Budgets (Fail CI)
The CI pipeline is configured with strict Lighthouse and asset size limits:

| Route Path | Maximum JS Size (Gzip) | Maximum CSS Size (Gzip) | Total Weight Limit (Excl. Fonts) |
|---|---|---|---|
| `/` (Homepage) | ≤ 20 KB | ≤ 15 KB | ≤ 45 KB |
| `/presentations` | ≤ 25 KB | ≤ 15 KB | ≤ 50 KB |
| `/presentations/[slug]` | ≤ 10 KB | ≤ 12 KB | ≤ 35 KB |
| `/about`, `/contact` | ≤ 15 KB | ≤ 12 KB | ≤ 40 KB |

### 11.6 Open Questions for the Product Owner
The developer must document these engineering assumptions when handoff is executed:

1. **≤3-Second Budget Split:** We assume that the ≤3-second launch target only applies to the owned segment of the system (Lighthouse lab metrics, edge rendering, prefetching, and click dispatch) which is budgeted at ≤700ms. The unowned portion (school network, Google auth, and slides rendering) is outside our control.
2. **Hover Quick-Launch:** We assume that desktop hovers should render a quick-launch icon on the Recent Rail cards, providing a fast launch route as specified in Design Spec v2 §11.2.
3. **Personal Recency Priority:** We assume that the Recent Rail should display the user's local `localStorage` history first, falling back to Harshit's latest added presentations if no local history exists.
4. **Subject Gradient Mapping:** We assume that academic subject types and colors map to the following primary list. If Harshit introduces an unmapped subject, the build task will fail, prompting the developer to update `subjects.ts` first:
   * **Science:** Green gradient (`linear-gradient(135deg, var(--color-success-100), var(--color-success-500))`)
   * **History:** Amber/Warm gradient (`linear-gradient(135deg, var(--color-warm-100), var(--color-warm-700))`)
   * **English:** Purple gradient (`linear-gradient(135deg, var(--color-primary-100), var(--color-primary-500))`)
   * **Geography:** Sky Blue gradient (`linear-gradient(135deg, var(--color-accent-100), var(--color-accent-500))`)
   * **Math:** Orange gradient (`linear-gradient(135deg, var(--color-warning-100), var(--color-warning-500))`)

---
