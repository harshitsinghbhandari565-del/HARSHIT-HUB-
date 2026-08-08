# Architecture Decision Records

The project's ADRs are **ADR-0001 … ADR-0012**, authored and accepted in the Technical Architecture Document §23 (2026-08-04):

| ADR | Decision |
|---|---|
| ADR-0001 | Astro as the meta-framework (static output) |
| ADR-0002 | Preact for islands |
| ADR-0003 | CSS custom properties + scoped CSS; no utility framework |
| ADR-0004 | Git-as-CMS with GitHub web-UI authoring |
| ADR-0005 | No state management library |
| ADR-0006 | Build-time link health checking |
| ADR-0007 | Card restructure to the linked-card pattern |
| ADR-0008 | LCP element exempted from entrance animation |
| ADR-0009 | Netlify hosting, primarily for Forms |
| ADR-0010 | Hand-rolled search matcher over a search library |
| ADR-0011 | Refined panel detection for the theme lock |
| ADR-0012 | Dropbox links default to preview, not download |

Each carries context, options, decision, trade-offs, consequences, and a **revisit trigger**. Per TAD §22.6, ADRs are never edited — only superseded.

**Status:** migrated verbatim into individual files in this directory (Phase H, KNOWN_ISSUES FI-1 — resolved). The approved TAD §23 remains the canonical source; these files exist so decisions are discoverable next to the code.

**Implementation-level decisions** (tooling adaptations, scope calls during build) are recorded in `/DECISIONS.md` — they do not supersede ADRs.
