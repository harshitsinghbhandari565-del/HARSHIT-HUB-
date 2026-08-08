<!-- Migrated verbatim from the Technical Architecture Document §23
     (2026-08-04) — KNOWN_ISSUES FI-1, Phase H. Per TAD §22.6 ADRs are
     never edited, only superseded; the TAD remains the canonical source. -->

### ADR-0010: Hand-rolled search matcher over a search library

**Status:** Accepted · 2026-08-04

**Context.** Search across title, subject, and tags for <10 items at launch (FR-2/AC-5), needed globally from the header (an AC-1 requirement per §6.3).

**Options.** (a) Hand-rolled scored matcher over a build-time index; (b) Fuse.js/MiniSearch; (c) Pagefind; (d) hosted search.

**Decision.** (a) for launch, with (b) or (c) documented at the ~100-item threshold.

**Rationale.** ~40 lines and zero dependencies beat 12–25 KB of fuzzy matching for a corpus a user can read in full. Field weighting (title > subject > tags) matches how people recall their own talks better than generic fuzzy scoring. Static index means results are computed synchronously from memory, which makes search-result race conditions structurally impossible.

**Trade-offs.** No typo tolerance; no highlighting at launch. Mitigated by a good empty state with a reset path and by corpus size.

**Consequences.** `matcher.ts` is a pure, unit-tested function behind a stable interface — swapping implementations later touches one module.

**Revisit if.** The catalog passes ~100 items, or users report failed searches for content that exists.
