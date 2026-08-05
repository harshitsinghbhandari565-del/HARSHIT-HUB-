<!-- Migrated verbatim from the Technical Architecture Document §23
     (2026-08-04) — KNOWN_ISSUES FI-1, Phase H. Per TAD §22.6 ADRs are
     never edited, only superseded; the TAD remains the canonical source. -->

### ADR-0001: Astro as the meta-framework

**Status:** Accepted · 2026-08-04

**Context.** A content-driven portfolio with <10 read-only records, no auth, no writes. The dominant requirement is launch latency under classroom pressure (O1/AC-1) on mid-range phones and classroom panels. Secondary requirements: premium feel (O2), no-code content editing (O4/AC-9), low maintenance (O6).

**Options.** (a) Astro static; (b) Next.js App Router; (c) SvelteKit; (d) plain HTML + vanilla JS.

**Decision.** Astro 6, `output: 'static'`.

**Rationale.** Zero-JS baseline directly serves the top-ranked goal; islands model this UI exactly; Content Collections + Zod give build-time content validation, which is the highest-leverage reliability feature available for a product whose top failure mode is a broken link in class; Astro 6 adds a Fonts API and CSP API that would otherwise be manual work.

**Trade-offs.** Smaller ecosystem (irrelevant — this project needs almost nothing from one). Islands do not share state by default (the five islands are genuinely independent). Single-vendor steward since the Cloudflare acquisition (mitigated by MIT licence and portable static output).

**Consequences.** Static hosting. Content flows through collections. Interactivity requires explicit island boundaries. Developers must respect the build-time/runtime split in `.astro` frontmatter.

**Revisit if.** The product requires per-request personalization, authenticated views, or real-time data — at which point a server-rendering framework becomes appropriate.
