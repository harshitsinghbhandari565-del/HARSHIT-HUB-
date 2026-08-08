<!-- Migrated verbatim from the Technical Architecture Document §23
     (2026-08-04) — KNOWN_ISSUES FI-1, Phase H. Per TAD §22.6 ADRs are
     never edited, only superseded; the TAD remains the canonical source. -->

### ADR-0007: Card restructure to the linked-card pattern

**Status:** Accepted · 2026-08-04 · **Modifies Design Spec §11.2**

**Context.** Design §11.2 specifies a fully clickable card **containing** a "▶ Present" quick-launch button. Nested interactive elements produce invalid HTML, ambiguous screen-reader output, and broken keyboard semantics.

**Options.** (a) Wrap the card in `<a>` and nest the button (invalid); (b) linked-card pattern — title anchor with a pseudo-element overlay, button layered above; (c) drop quick-launch; (d) make the card non-clickable with an explicit "View" link.

**Decision.** (b).

**Rationale.** Preserves both designed behaviours — full-card click target *and* an independent quick-launch — with valid HTML, one link per card whose accessible name is the presentation title, and two independently focusable controls. (c) would remove the 2-click owner fast path the design deliberately added; (d) reduces the tap target, which matters most on the mobile and panel targets.

**Trade-offs.** Slightly more intricate CSS (`position: relative` on the card, `::after` overlay, `z-index` on the button). Text selection must be verified as preserved.

**Consequences.** Card markup is fixed by this pattern; deviating reintroduces the violation. Documented in the component's prop notes.

**Revisit if.** Quick-launch is dropped after stakeholder review (Design §30 open question 1) — the overlay pattern is still correct and should be kept.
