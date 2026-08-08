<!-- Migrated verbatim from the Technical Architecture Document §23
     (2026-08-04) — KNOWN_ISSUES FI-1, Phase H. Per TAD §22.6 ADRs are
     never edited, only superseded; the TAD remains the canonical source. -->

### ADR-0012: Dropbox links default to preview, not download

**Status:** Accepted · 2026-08-04 · **Modifies Design Spec §15.2**

**Context.** Design §15.2 recommends appending `?dl=1` to force a direct download. On a classroom panel, downloading a `.pptx` may produce a file with no installed handler — the opposite of a reliable backup. The button is also labelled "Open Backup", which describes preview more accurately than download.

**Options.** (a) `?dl=1` always; (b) `?dl=0` (in-browser preview) always; (c) `?dl=0` default with a per-item override.

**Decision.** (c) — `?dl=0` by default; `forceDownload: true` in the content file switches an individual item to `?dl=1`.

**Rationale.** Dropbox's in-browser preview renders on any device with a browser, which is the more reliable classroom fallback and matches the button label. The per-item override preserves flexibility for formats that preview poorly.

**Trade-offs.** Preview quality depends on Dropbox's renderer; a genuinely offline scenario would want the file. Accepted: for a true offline case Harshit should pre-download before class — a documented pre-class checklist item.

**Consequences.** `forceDownload` is added to the schema and explained in the authoring guide.

**Revisit if.** Dropbox preview proves unreliable for the deck formats actually used → flip the default.
