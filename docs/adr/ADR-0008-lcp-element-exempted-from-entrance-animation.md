<!-- Migrated verbatim from the Technical Architecture Document §23
     (2026-08-04) — KNOWN_ISSUES FI-1, Phase H. Per TAD §22.6 ADRs are
     never edited, only superseded; the TAD remains the canonical source. -->

### ADR-0008: LCP element exempted from entrance animation

**Status:** Accepted · 2026-08-04 · **Modifies Design Spec §23.4**

**Context.** Design §23.4 fades the hero name in over 500 ms after a 200 ms delay. Chrome does not count `opacity: 0` elements as painted for LCP, so this pushes the reported LCP ~700 ms later. The hero name is the likely LCP element, and LCP is the metric most directly tied to G1 and G4.

**Options.** (a) Implement as specified; (b) exempt the LCP element from opacity animation, allowing a transform-only rise; (c) drop the entrance sequence entirely.

**Decision.** (b).

**Rationale.** Transform animation does not affect LCP because the element is painted from the first frame. The staged premium feel is preserved for the overline, tagline, CTAs, and cards — the name simply starts visible and rises into place. (c) would discard a designed quality signal for no additional gain.

**Trade-offs.** The hero name's entrance differs slightly from the other elements. Visually negligible; measurably better.

**Consequences.** Any future "animate the hero" request must preserve the LCP exemption. Lighthouse CI will catch regressions.

**Revisit if.** The LCP element changes (e.g. a hero image is added) — the exemption must move with it.
