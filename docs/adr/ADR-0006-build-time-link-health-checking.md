<!-- Migrated verbatim from the Technical Architecture Document §23
     (2026-08-04) — KNOWN_ISSUES FI-1, Phase H. Per TAD §22.6 ADRs are
     never edited, only superseded; the TAD remains the canonical source. -->

### ADR-0006: Build-time link health checking

**Status:** Accepted · 2026-08-04 · **Supersedes Design Spec §20.3's implied runtime detection**

**Context.** Design §20.3 and PRD EC-1 require showing a warning when a Google Slides link is dead. **This is not achievable client-side:** cross-origin `fetch` is CORS-blocked, `no-cors` returns an opaque response indistinguishable between 200 and 404, and Slides sets `X-Frame-Options` so iframe probing fails identically for healthy and dead links. Any client attempt would false-positive on working presentations.

**Options.** (a) Attempt client-side detection (unreliable); (b) build-time + scheduled CI checking into a data field; (c) a serverless proxy endpoint; (d) drop the feature.

**Decision.** (b). A weekly GitHub Action checks every published URL and commits a `linkHealth` field; the UI renders the alert from that data.

**Rationale.** CI has no CORS restrictions and can check accurately. The alert becomes server-rendered (works without JS), cannot false-positive, and adds zero runtime cost. (c) would add a serverless function and a runtime dependency for a rarely-changing signal.

**Trade-offs.** Detection lag up to one week. Accepted because the **Dropbox backup is displayed unconditionally**, so a stale-healthy record never strands the user — a deliberate divergence from §20.3's conditional display that costs one button and buys robustness.

**Consequences.** `linkHealth` is a CI-written field, documented as not hand-edited. Broken links also open a GitHub issue as the notification channel. Directly evidences AC-7.

**Revisit if.** Links break often enough that weekly is too slow → move to daily, or add an on-demand check.
