<!-- Migrated verbatim from the Technical Architecture Document §23
     (2026-08-04) — KNOWN_ISSUES FI-1, Phase H. Per TAD §22.6 ADRs are
     never edited, only superseded; the TAD remains the canonical source. -->

### ADR-0002: Preact for islands

**Status:** Accepted · 2026-08-04

**Context.** Five to six components need real state, keyboard handling, and focus management. Everything else is static.

**Options.** (a) Vanilla TS/custom elements; (b) Preact; (c) React; (d) Svelte.

**Decision.** Preact via `@astrojs/preact`.

**Rationale.** ~4 KB shared runtime versus ~40 KB for React with an identical API. The two hardest islands (SearchOverlay, MobileMenu) need focus trapping, live-region announcements, and roving focus — patterns that are error-prone hand-rolled, and accessibility (G5) is a ranked goal. A React-shaped API maximizes the pool of people who could help later.

**Trade-offs.** ~4 KB and one dependency versus writing vanilla DOM code. Accepted for defect-risk reduction on exactly the components where accessibility usually fails.

**Consequences.** Islands are `.tsx`. CSS Modules needed for island styles (Astro scoping does not apply). An island budget must be actively defended (§14.3).

**Revisit if.** Island count drops to two or fewer trivial widgets (drop to vanilla), or a React-only dependency becomes essential (switch to React and accept the weight).
