<!-- Migrated verbatim from the Technical Architecture Document §23
     (2026-08-04) — KNOWN_ISSUES FI-1, Phase H. Per TAD §22.6 ADRs are
     never edited, only superseded; the TAD remains the canonical source. -->

### ADR-0011: Refined panel detection for the theme lock

**Status:** Accepted · 2026-08-04 · **Modifies Design Spec §17.1/§24.4**

**Context.** The spec forces light mode and hides the theme toggle at viewport ≥1920px. But ordinary desktop monitors are 1920×1080 and vastly outnumber classroom panels, so as written **most desktop users would silently lose the toggle** — not the spec's intent.

**Options.** (a) Implement width-only as written; (b) add a pointer-type condition; (c) explicit user setting; (d) drop the lock.

**Decision.** (b) — `(min-width: 1920px) and ((pointer: coarse) or (hover: none))` gates the theme lock. The panel *layout* breakpoint remains width-only.

**Rationale.** Classroom touch panels report a coarse pointer; desktop monitors with a mouse report fine. This distinguishes them correctly on the great majority of real hardware while fully preserving the design's intent (never dark on a projected touch panel). Larger type and touch targets are harmless on a big monitor, so only the theme lock needs the stricter test.

**Trade-offs.** A large non-touch display genuinely used as a classroom panel keeps its toggle. Residual and acceptable, since light remains the default everywhere and dark requires deliberate opt-in.

**Consequences.** Two related but distinct media conditions exist; both are documented in `site.ts` with comments explaining why they differ.

**Revisit if.** Real classroom hardware reports a fine pointer → fall back to width-only, or add an explicit "presentation mode" toggle.
