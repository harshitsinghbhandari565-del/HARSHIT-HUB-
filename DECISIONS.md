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

### D-013 — Stylelint scope at initialization

- **Context:** Stylelint enforces token-only colors and the `neutral-400` text ban on standalone CSS. Astro scoped `<style>` blocks need a custom syntax, and the strict-value plugin (1.11.1) has no shorthand expansion.
- **Reasoning:** Correct, narrow enforcement now beats ambitious, brittle enforcement; both gaps are tracked.
- **Alternatives:** (a) full custom-syntax setup now; (b) standalone-CSS scope now, extend later.
- **Why chosen:** (b) — initialization scope; tracked in KNOWN_ISSUES.
- **Consequences:** `.astro` styles get lint coverage in a later hardening pass; shorthand color declarations are review-checked until then.
- **Date:** 2026-08-04
