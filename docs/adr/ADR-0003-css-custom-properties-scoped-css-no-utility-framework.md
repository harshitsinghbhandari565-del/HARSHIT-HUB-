<!-- Migrated verbatim from the Technical Architecture Document §23
     (2026-08-04) — KNOWN_ISSUES FI-1, Phase H. Per TAD §22.6 ADRs are
     never edited, only superseded; the TAD remains the canonical source. -->

### ADR-0003: CSS custom properties + scoped CSS; no utility framework

**Status:** Accepted · 2026-08-04

**Context.** The Design Spec provides a complete, contrast-verified token system already expressed as CSS custom properties (Design §26.1), plus a dark-mode override layer.

**Options.** (a) Implement tokens as custom properties + Astro scoped CSS; (b) Tailwind; (c) CSS-in-JS; (d) Sass.

**Decision.** (a).

**Rationale.** The token block is already the design/engineering contract — implement it, do not translate it. Custom properties give runtime theming with no rebuild and no JS re-render. A utility framework would restate every token in a second vocabulary that drifts, and its arbitrary-value escape hatches would undermine the very rules (e.g. "never use `neutral-400` for text") that the spec added to fix accessibility failures. CSS-in-JS contradicts the zero-JS premise.

**Trade-offs.** More hand-written CSS; no utility-class velocity. Accepted: the spec dictates exact values, so most CSS is transcription.

**Consequences.** Dark mode is an attribute flip. Stylelint enforces token-only values. Developers need real CSS fluency (a reasonable expectation).

**Revisit if.** The team grows beyond ~3 developers and CSS conventions start drifting despite linting.
