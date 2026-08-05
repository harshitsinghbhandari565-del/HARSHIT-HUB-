<!-- Migrated verbatim from the Technical Architecture Document §23
     (2026-08-04) — KNOWN_ISSUES FI-1, Phase H. Per TAD §22.6 ADRs are
     never edited, only superseded; the TAD remains the canonical source. -->

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
