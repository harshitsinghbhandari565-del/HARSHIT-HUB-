<!-- Migrated verbatim from the Technical Architecture Document §23
     (2026-08-04) — KNOWN_ISSUES FI-1, Phase H. Per TAD §22.6 ADRs are
     never edited, only superseded; the TAD remains the canonical source. -->

### ADR-0004: Git-as-CMS with GitHub web-UI authoring

**Status:** Accepted · 2026-08-04

**Context.** FR-17/AC-9 require adding presentations without code changes, by a student maintainer, ideally without a local dev environment.

**Options.** (a) JSON in repo, edited via GitHub web UI; (b) headless CMS; (c) Git-based visual CMS (Decap/Tina); (d) Google Sheets; (e) hard-coded array.

**Decision.** (a), with (c) as the documented upgrade path.

**Rationale.** Satisfies "no code changes" honestly — content lives in a content directory, and no component, route, or config is touched. Zero external dependencies and zero cost (G6). Critically, **a bad edit fails the build and leaves the live site untouched**, which is what makes handing content control to a non-developer safe. (c) requires an auth layer, reintroducing the auth surface I3 removes; deferring it costs nothing because the content model is identical.

**Trade-offs.** Raw JSON is unforgiving; no WYSIWYG preview. Mitigated by template, safe failure, clear error emails, and `published:false` staging.

**Consequences.** A carefully written non-developer authoring guide is a **release deliverable**, not a nice-to-have.

**Revisit if.** Harshit reports friction, or a second non-technical maintainer appears → adopt Decap/Tina over the same files.
