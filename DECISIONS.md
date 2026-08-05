# Decisions Log

Implementation-level decisions. Architecture-level decisions live in `docs/adr/` (source: TAD §23). Format: Decision · Context · Reasoning · Alternatives considered · Why chosen · Consequences · Date.

---

### D-001 — Hand-authored scaffold instead of `npm create astro@latest`

- **Context:** Dev Plan T-A1 says "scaffold with `npm create astro@latest`". The interactive scaffolder is environment- and version-dependent.
- **Reasoning:** The required end state is fully specified (Astro 6 static + TypeScript strict + `@astrojs/preact` + exact tooling); authoring the manifest directly is deterministic, reviewable, and pins the approved versions.
- **Alternatives:** (a) interactive scaffolder; (b) hand-authored manifest + `npm install`.
- **Why chosen:** (b) produces the identical stack without interactive variance and lets the initialization commit tell the exact story.
- **Consequences:** None functional; the scaffold command in the Dev Plan is satisfied in substance.
- **Date:** 2026-08-04

### D-002 — Astro 6.4 API adaptations (content config location, glob `base`, ClientRouter source)

- **Context:** The TAD references Content Collections generically. Astro 6.4 (the pinned line) requires `src/content.config.ts` (legacy `src/content/config.ts` is an error), the glob loader option is `base` (not `src`), and `ClientRouter` is exported from `astro:transitions` (the `/client` module now holds router utilities only).
- **Reasoning:** The architecture's *contract* (Zod-validated collections, View Transitions without a client router) is unchanged; only import locations shifted with the framework version.
- **Alternatives:** (a) adapt to the installed API; (b) pin an older minor to keep old paths.
- **Why chosen:** (a) keeps the project on the supported 6.x surface; (b) would pin obsolete behavior.
- **Consequences:** Code comments mark each adaptation; future Astro upgrades re-verify these three points first.
- **Date:** 2026-08-04

### D-003 — Explicit `zod` dependency

- **Context:** TAD lists zod as "bundled with Astro 6". The content contract must be unit-testable (Gate 1) without Astro internals.
- **Reasoning:** A direct, pinned `zod ^4.4.3` (matching Astro's own `^4.3.6` range) makes the contract's version explicit and importable from Vitest.
- **Alternatives:** (a) rely on Astro's bundled zod; (b) explicit dependency.
- **Why chosen:** (b) — testability and version determinism outweigh one declared dependency.
- **Consequences:** Keep zod's major aligned with Astro's bundled major on upgrades.
- **Date:** 2026-08-04

### D-004 — Schema/wiring split (`schemas.ts` + `content.config.ts`)

- **Context:** TAD places the contract in the content config file.
- **Reasoning:** Pure Zod schemas in `src/content/schemas.ts` are importable by tests with zero Astro coupling; `content.config.ts` stays a thin wiring file.
- **Alternatives:** (a) everything in the config file; (b) split.
- **Why chosen:** (b) makes Gate 1 a fast, deterministic unit test and keeps the config file trivially auditable.
- **Consequences:** Schema changes happen in `schemas.ts`; the config file rarely changes.
- **Date:** 2026-08-04

### D-005 — Derived dark-mode token layer (assumption B1)

- **Context:** Design Spec v2 §26.2 defers dark overrides to Design Spec v1.0, which was not delivered.
- **Reasoning:** Dark mode is design-added (not PRD-required), light is the default everywhere and forced on panels, so a derived, contrast-checked dark layer carries no risk to the critical path; Design v2 itself supplies the dark focus token (`--color-focus-subtle`, verified ~5.2:1).
- **Alternatives:** (a) block on Design v1; (b) derive and document; (c) drop dark mode.
- **Why chosen:** (b) per the approved classification report; (a) stalls Phase A for a non-critical feature; (c) would discard approved design scope.
- **Consequences:** `tokens.dark.css` carries a provenance header; if Design v1 values arrive they replace it verbatim; Phase H audits both themes.
- **Date:** 2026-08-04

### D-006 — Icons: Lucide via `astro-icon`, installed at first use

- **Context:** Design v2 references Lucide-style icon names; TAD §3.7 chooses `astro-icon`. No component uses icons yet.
- **Reasoning:** Dependency minimalism — install when Phase B primitives first need icons; the choice is already locked.
- **Alternatives:** (a) install now; (b) install at first use.
- **Why chosen:** (b) — no current consumer; avoids an unused dependency during initialization.
- **Consequences:** Phase B adds `astro-icon` + Lucide pack; record here if the set changes.
- **Date:** 2026-08-04

### D-007 — No content files seeded at initialization

- **Context:** Dev Plan T-A4 seeds "3 real JSON presentations"; Harshit's real content is not yet available (assumption IA-2), and initialization must not add portfolio content.
- **Reasoning:** Empty collections build cleanly; Gate 1 was proven with a temporary malformed fixture (removed after verification). Seeding fake content would create placeholder data that must later be hunted down.
- **Alternatives:** (a) placeholder presentations; (b) empty collections until real content.
- **Why chosen:** (b) — zero placeholder debt; the schema and validation are fully proven without it.
- **Consequences:** Real content (≥3 presentations) is required before the Phase D projector dry-run (T-D7).
- **Date:** 2026-08-04

### D-008 — Temporary root route shell

- **Context:** The routing foundation needs a verifiable route for build/deploy/CI, but the homepage is Phase E scope.
- **Reasoning:** A clearly-marked TEMPORARY `index.astro` renders through `BaseLayout`, proving the shell end-to-end; it is replaced wholesale in Phase E.
- **Alternatives:** (a) no pages until Phase E; (b) temporary shell.
- **Why chosen:** (b) — CI, sitemap, and Netlify smoke checks need at least one real page.
- **Consequences:** The stub must be deleted in Phase E (tracked in KNOWN_ISSUES).
- **Date:** 2026-08-04

### D-009 — Netlify subdomain placeholder as `site`

- **Context:** The custom domain decision (assumption B7) is pending; Astro's sitemap/canonicals need a `site` value now.
- **Reasoning:** `SITE_URL` env override at deploy time + a deterministic fallback keeps every environment reproducible; swapping to a custom domain is one value.
- **Alternatives:** (a) block on the domain; (b) placeholder + env override.
- **Why chosen:** (b) per the approved classification report.
- **Consequences:** Canonical URLs/sitemap show the subdomain until the domain is set (Phase H verifies).
- **Date:** 2026-08-04

### D-010 — ESLint 9 + `eslint-plugin-astro` 1.x pin

- **Context:** Current registry: ESLint 10 exists; `eslint-plugin-astro` 2.x/3.x require ESLint ≥10; `typescript-eslint` 8.x supports ESLint 8.57–10.
- **Reasoning:** The mature, fully-compatible pairing for the pinned stack is ESLint 9 + plugin 1.x; jsx-a11y is wired manually for `.tsx` islands.
- **Alternatives:** (a) ESLint 10 + plugin 3.x (unverified ecosystem maturity with this stack); (b) ESLint 9 + plugin 1.x.
- **Why chosen:** (b) — stability over novelty for a foundation that must not churn.
- **Consequences:** Upgrade as a deliberate unit later (one commit, full gate re-run).
- **Date:** 2026-08-04

### D-011 — Single sequential CI job, cheapest-first

- **Context:** TAD §18.3 orders checks cheapest-first; budgets/Lighthouse/E2E belong to Phase H.
- **Reasoning:** One job with ordered steps fails fast and is trivially readable; parallelization buys nothing at this size.
- **Alternatives:** (a) matrix/parallel jobs; (b) single sequential job.
- **Why chosen:** (b) — matches TAD ordering and current scale.
- **Consequences:** Phase H extends the pipeline (budget checks, Playwright+axe, Lighthouse CI, link-check workflow).
- **Date:** 2026-08-04

### D-012 — `/present` enforcement via URL pathname (`endsWith`), not substring

- **Context:** TAD requires `googleSlidesUrl` to be a `/present` URL. A naive `includes('/present')` always passes because every Slides URL contains `/presentation`.
- **Reasoning:** The contract test suite caught the substring flaw; `new URL(u).pathname.endsWith('/present')` enforces the real rule and tolerates query parameters.
- **Alternatives:** (a) substring check; (b) pathname suffix check.
- **Why chosen:** (b) — correctness; validated by tests.
- **Consequences:** Content authors must supply `/present` URLs (the authoring guide's step 2); `slidesUrl` normalization (Phase D) keeps this belt-and-braces.
- **Date:** 2026-08-04

---

### D-013 — Stylelint scope at initialization

- **Context:** Stylelint enforces token-only colors and the `neutral-400` text ban on standalone CSS. Astro scoped `<style>` blocks need a custom syntax, and the strict-value plugin (1.11.1) has no shorthand expansion.
- **Reasoning:** Correct, narrow enforcement now beats ambitious, brittle enforcement; both gaps are tracked.
- **Alternatives:** (a) full custom-syntax setup now; (b) standalone-CSS scope now, extend later.
- **Why chosen:** (b) — initialization scope; tracked in KNOWN_ISSUES.
- **Consequences:** `.astro` styles get lint coverage in a later hardening pass; shorthand color declarations are review-checked until then.
- **Date:** 2026-08-04

---

### D-014 — `--color-accent-700` token for the primary button active state

- **Context:** Design §11.1 specifies `#1E40AF` for the primary button active state; Design Rule 2 forbids hard-coded hex outside the palette.
- **Reasoning:** The value must live in the token layer to keep Stylelint's token-only enforcement honest.
- **Alternatives:** (a) hard-code the hex in the component; (b) reuse accent-600 for active too; (c) add a palette token.
- **Why chosen:** (c) — same convention Design v2 itself used for `warm-700`/`success-700`; (a) violates Rule 2; (b) makes hover/active indistinguishable by color.
- **Consequences:** One token added to `tokens.css` (marked ★ with this reference); dark theme needs no override.
- **Date:** 2026-08-04

### D-015 — Subject-specific pill styling belongs to `features/presentations`

- **Context:** Design §11.3 lists a "Subject tag" variant, but subject→colour mapping is domain knowledge (Science/History/… enum).
- **Reasoning:** Import rules (TAD §5.1) keep `shared/` free of feature/domain knowledge; `SubjectVisual` is already a `features/presentations` component in the TAD.
- **Alternatives:** (a) subject variants in the shared Tag; (b) feature-scoped styling over the generic Tag.
- **Why chosen:** (b) — preserves dependency direction; the generic Tag covers all non-domain variants now.
- **Consequences:** Phase D's PresentationMeta styles subject pills via feature CSS layered on Tag markup.
- **Date:** 2026-08-04

### D-016 — Font wiring mechanics (Astro 6 Fonts API)

- **Context:** TAD §14.5 mandates the Fonts API; Astro 6.4's actual mechanics differ from generic expectations.
- **Findings that shaped the implementation:** (1) `@font-face` + stacks inject only where a `<Font cssVariable />` component is included in the head; (2) font usage collection reads **component styles**, so the token re-pointing (`--font-body` → generated stack) lives in a BaseLayout `<style is:global>` block, not `global.css`; (3) the `fontsource` provider needs `api.fontsource.org` (unreachable in this environment), and the `npm` provider still resolved non-latin files via CDN — so the **local provider** with `src` pointing at the version-pinned `@fontsource` package files is used (deterministic, offline, no binary commits); (4) the preload filter takes variant selectors (`{weight, style}` — no subset field for local files), tuned to the two first-paint weights per TAD §14.5.
- **Alternatives:** manual `public/fonts` + hand-written `@font-face` — rejected: loses metric-adjusted fallbacks and preload automation the TAD expects.
- **Consequences:** fonts config is the first thing to re-verify on Astro upgrades (recorded in KNOWN_ISSUES FI-9); `tokens.css` stays verbatim.
- **Date:** 2026-08-04

### D-017 — Lucide icons via `astro-icon` with the local `@iconify-json` pack

- **Context:** D-006 locked Lucide-via-astro-icon at first use; Phase B is the first use.
- **Reasoning:** `@iconify-json/lucide` resolves icons from node_modules — no CDN at build time, version-pinned, tree-shaken inline SVG, zero runtime JS.
- **Alternatives:** CDN-based icon fetching (astro-icon default service) — rejected: build-time network dependency.
- **Consequences:** `.astro-icon/` cache git-ignored; icon names follow the Design Spec vocabulary.
- **Date:** 2026-08-04

### D-018 — Component test stack: node env + jsdom-as-library + Container API + axe-core

- **Context:** T-B4 requires Vitest suites proving HTML validity + axe accessibility for all primitives.
- **Reasoning:** Astro's Container API renders `.astro` components under Vitest when the config is built with `getViteConfig`. Vitest's `jsdom` environment patches globals in a way that breaks esbuild's invariant inside the transform pipeline; running the **node** environment and using jsdom explicitly as a library is deterministic and keeps the pipeline intact. axe-core runs per fragment inside a `<main>` wrapper; contrast in jsdom reports "incomplete" (no rendering), so contrast truth stays with Design §25.1's verified table plus Phase H's real-browser audit.
- **Alternatives:** happy-dom environment (same class of global-patching risk); Playwright component testing (heavier; arrives with Phase H E2E).
- **Consequences:** `tests/unit/helpers/render.ts` centralizes render/parse/axe helpers; the pattern extends to Phase C islands (with Preact renderers added then).
- **Date:** 2026-08-04

### D-019 — Tag paddings follow Design §11.3 spec values verbatim

- **Context:** Design §11.3 specifies `4px 10px` (tags) and `6px 12px` (coming-soon) paddings; 10px sits off the 4px grid that Design Rule 1 generally prescribes.
- **Reasoning:** the approved component spec is the concrete authority over the general rule; the visuals were reviewed and approved with these values.
- **Alternatives:** snap to grid (8px/12px) — visible deviation from the approved spec.
- **Consequences:** the two paddings are documented inline in `Tag.astro`; flagged for the designer to reconcile the grid rule in a future spec revision.
- **Date:** 2026-08-04

### D-020 — Tablet "More" dropdown as zero-JS `<details>`/`<summary>`

- **Context:** T-C3 requires a keyboard-focusable CSS dropdown for overflow nav links at 768–899px.
- **Reasoning:** `<details>` is natively keyboard-operable (Enter/Space toggle, focusable summary) and needs no island — matching the "CSS dropdown" intent with the least machinery. Styled as the Design §12.5 ghost-button "More ▾".
- **Alternatives:** (a) island-driven dropdown (more JS, hydration on the critical chrome); (b) `:focus-within` CSS-only flyout (no click parity, focus order quirks).
- **Why chosen:** (a) violates the zero-JS-first default for static chrome; (b) is brittle for keyboard + pointer parity.
- **Consequences:** auto-close on outside click/Escape is not native to `<details>` — tracked as TD-11; acceptable at this scale.
- **Date:** 2026-08-04

### D-021 — Panel theme-lock enforcement (ADR-0011 mechanics)

- **Context:** ADR-0011 says panels force light and hide the toggle; the enforcement points needed defining.
- **Reasoning:** two complementary guards: (1) the FOUC guard checks the panel media query before applying a stored dark preference — so a panel with stale storage never flashes dark; (2) the ThemeToggle hides itself under the same query. Resizing between classes is a documented edge case (a user deliberately darkening on a small window, then casting to a panel, keeps dark until reload).
- **Alternatives:** CSS-only re-declaration of the entire light palette under the panel query — rejected: duplicates the whole token layer.
- **Consequences:** the panel query lives once in `theme.ts` (PANEL_QUERY) and is mirrored in CSS where needed; both share the ADR-0011 condition verbatim.
- **Date:** 2026-08-04

### D-022 — MobileMenu is one island containing trigger + panel

- **Context:** Design §29.2 draws the trigger and the menu as separate header children, but the trigger's `aria-expanded` and the panel's open state are one state machine.
- **Reasoning:** keeping both in a single island preserves state integrity without cross-island communication (I6) and keeps the trigger out of the static markup where it would otherwise be a dead control pre-hydration.
- **Alternatives:** static trigger + island panel communicating via DOM events — rejected: implicit coupling between chrome pieces.
- **Consequences:** MobileMenu lives in `shared/components` (chrome, not domain); it renders its own 44px trigger styled consistently with the IconButton primitive.
- **Date:** 2026-08-04

### D-023 — Layouts may compose feature islands (import-rule exception)

- **Context:** TAD §5.1 rule 1 forbids `shared/**` importing `features/**`, yet TAD §7.3 places ThemeToggle (a `features/theme` island) inside the header on every page.
- **Reasoning:** the rule's intent is keeping shared primitives domain-free; the layout is the composition root where chrome islands legitimately join the shell. The exception is scoped to `shared/layouts/**` only — primitives, ui, lib, and components remain feature-free — and layouts still never import content.
- **Alternatives:** (a) move ThemeToggle into shared (breaks the TAD §5 tree); (b) require every page to pass the toggle through a slot (violates DRY, error-prone).
- **Consequences:** ESLint encodes the exception with an explanatory message; the boundary stays reviewable.
- **Date:** 2026-08-04

### D-024 — `js` class on `<html>` for progressive-enhancement CSS

- **Context:** Without JS, the MobileMenu trigger and ThemeToggle are dead controls, and mobile users lose the inline nav.
- **Reasoning:** the FOUC guard marks `<html>` with `.js` synchronously; CSS then (1) hides non-functional toggles on `html:not(.js)` and (2) keeps the Header's static nav visible as a stacked list on mobile without JS. Invariant I1 is preserved: navigation works with zero JavaScript.
- **Alternatives:** `<noscript>` style blocks — rejected: fragmented and easy to desync.
- **Consequences:** one extra class in the guard script; no-JS mobile nav is basic but functional (documented).
- **Date:** 2026-08-04

### D-025 — Condition-based waits in island tests

- **Context:** island tests raced Preact's deferred render/effect scheduling: fixed `setTimeout(0)` flushes sometimes resolved before effects ran, producing flaky focus/inert assertions.
- **Reasoning:** tests now poll for observable conditions (e.g. scroll lock proving the open-effect body ran) with a timeout — deterministic and honest about what "settled" means.
- **Alternatives:** fixed multi-tick flushes (still racy), fake timers (brittle against Preact internals).
- **Consequences:** `waitFor` helper in the island suite; the same pattern applies to Phase C+ island tests.
- **Date:** 2026-08-04

### D-026 — Detail page keeps both breadcrumb and back link

- **Context:** Design §11.8 specifies a "← Back to Presentations" ghost link on the detail page; Design §12.3 specifies a breadcrumb on the same page. Read together they overlap.
- **Reasoning:** both are designed elements; removing either would deviate from the approved spec. They serve slightly different wayfinding jobs (one-step return vs full path) and the cost is one small component reuse.
- **Alternatives:** breadcrumb-only (cleaner, but drops a designed element); back-link-only (drops the §12.3 spec).
- **Why chosen:** implement the spec exactly; escalate only if design declares one redundant.
- **Consequences:** two back affordances on detail pages; trivially removable later.
- **Date:** 2026-08-04

### D-027 — ActionRow composes the shared Button primitive

- **Context:** TAD §24.5 / Dev Plan §11.4 dictate the exact Present-anchor markup ("must be implemented exactly as follows").
- **Reasoning:** the Phase 1 Button already renders that exact contract (anchor when href, external rel, icon aria-hidden, subtitle inside the element). Composing it avoids duplicating button state logic while preserving the output contract; the disabled/health branches map directly onto Button's disabled mode.
- **Alternatives:** hand-rolled anchors in ActionRow — rejected: duplicates the polymorphic-button logic the codebase centralised on purpose.
- **Consequences:** the rendered structure nests label/subtitle in a `btn__text` span (accessible name still = label + subtitle); any future change to the Present contract lives in one place.
- **Date:** 2026-08-04

### D-028 — Page tests mock astro:content at the boundary

- **Context:** AstroContainer renders island own-markup but not island slot children, and getCollection returns empty in the container — page-level tests would silently assert nothing.
- **Reasoning:** mocking the content boundary (vi.mock('astro:content')) tests page logic — published-only filter, ordering, data contract, launch URLs — deterministically. Loader/schema behaviour remains covered by build-time Zod validation and the schema contract tests; the real build is the integration proof.
- **Alternatives:** dist-reading tests (couples to build order; brittle in CI); container-only component tests (miss page logic).
- **Consequences:** fixtures mirror the seed content shape; schema changes may require fixture updates (cheap, type-adjacent).
- **Date:** 2026-08-04

### D-029 — Labeled mock seed content for Phase D

- **Context:** routes need content to build; Harshit's real decks are pending (IA-2).
- **Reasoning:** three schema-valid mocks (one 6-tag to exercise overflow) make every Phase D surface real and testable. Labelling lives in each description ("MOCK SEED CONTENT") plus this log; replacement is deleting three files and adding real ones — no code changes (the FR-17 property exercised early).
- **Alternatives:** empty collections (routes would build zero pages — weak verification); a schema-level "mock" flag (schema pollution for a temporary need — rejected).
- **Consequences:** mock decks are publicly visible until replaced; flagged in KNOWN_ISSUES and the completion report.
- **Date:** 2026-08-04

### D-030 — GalleryController owns the pre-rendered list DOM

- **Context:** the island must filter/sort cards that are server-rendered HTML (invariant I1), not JS-rendered state.
- **Reasoning:** after mount the island reads the slot's `<ul data-gallery>` once and mutates node order/visibility from then on. Astro passes island slots as constant vdom, so Preact re-renders never overwrite the mutations — the same contract TAD §10.4 defines for RecentRail.
- **Alternatives:** re-render cards from JSON state in the island (breaks I1 — cards would vanish without JS); CSS-only sorting (impossible).
- **Consequences:** the data attributes on each `<li>` are a load-bearing contract, tested explicitly.
- **Date:** 2026-08-04

### D-031 — T-D7 projector dry-run remains a pending manual gate

- **Context:** Dev Plan T-D7 requires validating the Present path on a physical projector/panel with real Slides URLs.
- **Reasoning:** neither the real content (IA-2) nor the hardware exists in this environment; faking the gate would violate its purpose (it exists precisely because emulators hide projector-class failures).
- **Alternatives:** mark the gate done on mock URLs — rejected: false assurance on the product's most critical path.
- **Consequences:** M3's "manually validated on a physical projector" item stays open and is tracked in KNOWN_ISSUES; everything automatable around it (markup contract, URL derivation, backup behaviour) is test-verified.
- **Date:** 2026-08-04

### D-032 — Entrance choreography via html.js + data-entrance gating

- **Context:** Design §23.4 defines a staggered first-visit entrance and a reduced 300ms fade for returns within 30s; ADR-0008 exempts the LCP hero name from opacity animation.
- **Reasoning:** an inline guard in the homepage head slot reads/writes a sessionStorage timestamp and sets `html[data-entrance=full|reduced]` before first paint; CSS animations apply only under `html.js[data-entrance]`, so no-JS visitors (I1) and reduced-motion users get static content. The name animates transform-only, so LCP paints on frame one.
- **Alternatives:** JS-driven animation library — rejected (budget + I1); CSS-only with no mode distinction — rejected (violates the design's return-visit rule).
- **Consequences:** one tiny blocking inline script (hash-allowlisted when CSP enforcement lands); entrance CSS is gated but ordinary page CSS is untouched.
- **Date:** 2026-08-04

### D-033 — Quick-launch is a layered sibling; recency recording is enhancement-only

- **Context:** Design §11.2 adds a "▶ Present" affordance on recent-rail cards; ADR-0007 forbids nested interactive elements.
- **Reasoning:** the quick-launch is an anchor SIBLING positioned above the title anchor's ::after overlay (ADR-0007 rule 3) — valid HTML, independently focusable (revealed on desktop hover and keyboard focus-within, never on touch). It is a real anchor to the /present URL, so launching works with JS disabled; the RecentRail island's delegated click listener only RECORDS recency (Design §29.3) and never intercepts navigation. The detail page records launches via a small deferred script with the same enhancement-only posture.
- **Alternatives:** button + JS launch — rejected (breaks I1 and middle-click); nesting inside the card link — rejected (ADR-0007 violation).
- **Consequences:** recency is best-effort by design; without JS the rail shows the "Latest" fallback (TAD §10.4) — acceptable per the design's dual strategy.
- **Date:** 2026-08-04

### D-034 — Labelled MOCK homepage copy in site config

- **Context:** the hero tagline and teaser copy are Harshit's words (content pending, IA-2); the homepage cannot wait for them structurally.
- **Reasoning:** constants in `shared/config/site.ts` clearly prefixed "MOCK" keep the structure content-driven (I4) and the replacement path a config edit — the same posture as the Phase 3 mock decks (D-029). Nothing mock reaches styling or layout decisions.
- **Alternatives:** hard-coded strings in components (violates I4); blocking the phase on content (stalls the critical path for no structural reason).
- **Consequences:** mock wording is publicly visible until replaced; tracked under KNOWN_ISSUES CI-2 family.
- **Date:** 2026-08-04

### D-035 — Homepage sections live in shared/components; RecentRail in features/presentations

- **Context:** TAD §5 has no `home` feature folder; Hero/teasers and the rail island needed homes that respect the approved structure and import rules.
- **Reasoning:** Hero/AboutTeaser/ContactTeaser are content-agnostic composition (copy from config, links to routes; no domain data access) — `shared/components` is the only approved home that keeps every rule intact. RecentRail operates on presentation cards + recency — presentation domain → `features/presentations/islands`, consistent with GalleryController.
- **Alternatives:** a new `features/home` — rejected (not in the approved structure; would set a precedent for scope-shaped folders); sections in `pages/` — rejected (Astro treats pages/ files as routes).
- **Consequences:** if the homepage ever gains domain logic, it moves to a feature then — not before (YAGNI).
- **Date:** 2026-08-04

### D-036 — RecentRail exposes a data-rail-mounted marker

- **Context:** island tests that clicked quick-launch raced Preact's deferred mount effect (listener attached after the test's fixed-tick wait) — a flaky-by-construction pattern.
- **Reasoning:** the mount effect now sets `data-rail-mounted` after attaching the listener; tests wait for the marker via the condition-based waitFor (D-025). Deterministic, zero arbitrary sleeps, and the attribute is harmless in production (styling-inert).
- **Alternatives:** longer fixed waits (still racy under load — observed); fake timers (brittle against Preact internals).
- **Consequences:** one extra attribute on the island root; the anti-flake pattern extends to future islands.
- **Date:** 2026-08-04

### D-037 — SearchInput is a shared sub-component of its owning island

- **Context:** TAD §5 lists SearchInput under features/search/islands, and TAD §7.2 associates it with both the global overlay and the GalleryController. Two independently hydrated inputs coordinating gallery state would violate I6.
- **Reasoning:** SearchInput is presentational (value in, events out); each surface's owning island (SearchDialog for the overlay, GalleryController for the gallery) renders it and owns the state + URL sync. One hydration owner per surface keeps invariant I6 intact.
- **Alternatives:** independent island + cross-island events — rejected (I6 violation, coordination complexity); duplicating the input markup per surface — rejected (Design §11.4 is one spec).
- **Consequences:** SearchInput carries no hydration directive of its own; both surfaces get identical focus/clear/label behaviour by construction.
- **Date:** 2026-08-04

### D-038 — On-demand search dialog + vanilla ThemeToggle (budget compliance)

- **Context:** Phase 5 puts a search trigger in the global header (TAD §11.3). With preact islands for both header controls, every page eager-loaded the Preact runtime — the detail page measured ~15–17 KB against its 10 KB budget (TAD §14.1), and the overage pattern predated Phase 5 (ThemeToggle island since Phase 2; earlier budgets under-measured transitive island deps).
- **Reasoning:** search is used on a small fraction of page loads; its JS should load on first use. The trigger is a plain button whose click dynamically imports `search-mount` → Preact + SearchDialog. ThemeToggle is a three-line state flip — preact bought nothing there. Both controls became vanilla bundled scripts; complex islands (MobileMenu, RecentRail, GalleryController, SearchDialog) stay preact where state/focus management is real.
- **Alternatives:** (a) accept the overage and revise budgets — rejected: the gap was large and avoidable; (b) keep the trigger island, lazy only the dialog — rejected: the trigger island alone forces the preact runtime eagerly.
- **Consequences:** detail/about/contact eager JS ≈6.9 KB (≤10 KB ✅); homepage/gallery ≈6.3 KB eager (+ island hydration within budget). ThemeToggle wiring lives in lib/theme.ts (`initThemeToggle`) — unit-testable without eval. Focus-return-to-trigger survives the async unmount via the mount module.
- **Date:** 2026-08-04

### D-039 — Gallery inline search lives inside GalleryController

- **Context:** the gallery gained a search input alongside the subject filter and sort (TAD §11.3 "gallery inline search filters already-rendered DOM; syncs to ?q=").
- **Reasoning:** one island owns all gallery state (filter + sort + query + URL), so URL sync has a single writer and the three controls compose without coordination (q AND subject AND sort). Cards filter via data attributes through the same matcher the overlay uses — one implementation, two surfaces, per TAD §11.3.
- **Alternatives:** SearchInput as an independent island beside GalleryController — rejected (cross-island URL writes, I6); a second "gallery search" island — rejected (two writers for one URL).
- **Consequences:** ?q= uses replaceState (refinement, not navigation — TAD §10.2); empty results get the Design §18.3 state with a clear-search reset inside the island's render.
- **Date:** 2026-08-04
