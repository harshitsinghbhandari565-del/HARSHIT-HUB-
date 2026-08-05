<!-- Migrated verbatim from the Technical Architecture Document §23
     (2026-08-04) — KNOWN_ISSUES FI-1, Phase H. Per TAD §22.6 ADRs are
     never edited, only superseded; the TAD remains the canonical source. -->

### ADR-0009: Netlify hosting, primarily for Forms

**Status:** Accepted · 2026-08-04

**Context.** The site is static. The only server-side need is contact-form handling (FR-14), with privacy constraints (NFR-9) and a no-secrets posture (I3).

**Options.** (a) Netlify; (b) Cloudflare Pages; (c) Vercel; (d) GitHub Pages.

**Decision.** Netlify, with Cloudflare Pages documented as the alternative.

**Rationale.** Netlify Forms handles submission, spam filtering, storage, and notification with **no backend code and no API key**, preserving I3 and G6. Cloudflare would require a Pages Function plus an email provider and its key. GitHub Pages cannot set custom headers, so no CSP — disqualifying. Vercel offers no advantage for a non-Next.js static site and its free tier is personal-use-only.

**Trade-offs.** Coupling to Netlify Forms and `netlify.toml`. Bandwidth is metered (irrelevant at this traffic). Exit cost ≈ one day: swap to a hosted form service, translate headers/redirects.

**Consequences.** Form markup uses Netlify attributes. Headers/redirects live in `netlify.toml`. Deploy previews are the staging tier.

**Revisit if.** Traffic makes bandwidth cost-relevant, or the project adopts Cloudflare tooling more broadly → move to Cloudflare Pages/Workers and a hosted form service.
