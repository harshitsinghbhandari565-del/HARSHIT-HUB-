# Release Checklist

Tracks everything required before the project can be merged to `main` and deployed. Updated continuously; fully reviewed in Phase 7 (Hardening).

**Legend:** ⬜ Not started · 🟡 In progress · ✅ Done · ⛔ Blocked / N/A

**Branch:** `arena/019fcc8f-harshit-hub` · **Protected:** `main` · **Last updated:** 2026-08-06 (Netlify deployment complete; catalog real-only)

---

## Functionality

| Item | Status | Notes | Date |
|---|---|---|---|
| Homepage (hero, rail, teasers) | ✅ | Phase 4 | 2026-08-04 |
| Presentation gallery (search/sort/filter) | ✅ | Phases 3 + 5 | 2026-08-05 |
| Presentation detail + Present + Backup | ✅ | Phase 3 | 2026-08-04 |
| Global search overlay (on-demand) | ✅ | Phase 5 | 2026-08-05 |
| About page (content layer) | ✅ | Phase 6 | 2026-08-05 |
| Contact page + Netlify form + honeypot | ✅ | Phase 6 | 2026-08-05 |
| Coming Soon placeholders (noindex) | ✅ | Phase 6 | 2026-08-05 |
| 404 / 500 recovery pages | ✅ | Phase 6 | 2026-08-05 |
| Chrome survives client-side navigation | ✅ | Phase 7 audit fix — delegation + swap re-sync + entrance rerun (D-044); regression-tested | 2026-08-05 |
| Route-change focus + title announcement | ✅ | TAD §15.4 implemented + tested (D-044) | 2026-08-05 |
| SEO metadata (canonical/OG/Twitter, TAD §17.2) | ✅ | SeoHead on every page; integration-verified on built output (D-047) | 2026-08-05 |
| JSON-LD structured data (TAD §17.3) | ✅ | All five page-type schemas; valid + drift-checked in CI (D-047) | 2026-08-05 |
| og:image / summary_large_image card | ⬜ | Needs the brand image asset (IA-2 / TD-8 family); card downgrades to `summary` until then | — |
| Projector dry-run (T-D7, M3) | ⬜ | Needs real Slides/Dropbox URLs + physical panel | — |

## Accessibility

| Item | Status | Notes | Date |
|---|---|---|---|
| axe-core zero violations (component level) | ✅ | Component + island suites | 2026-08-05 |
| **axe zero violations site-wide (built pages, both themes)** | ✅ | `tests/a11y/` — 24 scans in CI (T-H1) | 2026-08-05 |
| Semantic HTML + landmarks | ✅ | All pages | 2026-08-05 |
| Keyboard: focus trap, roving, Escape | ✅ | Overlay, mobile menu (vanilla rewrite re-verified) | 2026-08-05 |
| Heading hierarchy (WCAG 1.3.1) | ✅ | Gallery heading-order fixed (D-046); all pages scanned | 2026-08-05 |
| Contact form labels + focus-to-invalid | ✅ | Phase 6 | 2026-08-05 |
| Reduced-motion support | ✅ | Global overrides + targeted feedback retention (TAD §15.6); verified structurally | 2026-08-05 |
| WCAG 2.2 AA audit — real-browser contrast (both themes) | ⬜ | jsdom cannot compute contrast (documented); verify token pairs on first deploy preview against Design §25.1 | — |
| Manual keyboard-only pass (all pages, both themes) | ⬜ | Requires human; follow RUNBOOK §2 flows | — |
| Screen-reader pass (VoiceOver/NVDA, critical path) | ⬜ | No headless SR exists; critical path = home → gallery → detail → Present; contact form | — |

## Performance

| Item | Status | Notes | Date |
|---|---|---|---|
| Eager JS within TAD §14.1 budgets (all routes) | ✅ | 7.24–16.75 KB; **enforced by build gate** (`scripts/budgets.mjs`) | 2026-08-05 |
| CSS within budgets (all routes) | ✅ | ≤7.70 KB; same gate | 2026-08-05 |
| Total weight within budgets (all routes) | ✅ | ≤32.6 KB vs 35–50 limits; same gate | 2026-08-05 |
| Self-hosted fonts, latin subset, metric fallbacks | ✅ | Phase 5 | 2026-08-05 |
| On-demand search dialog (D-038) + vanilla chrome (D-044) | ✅ | Re-verified by gate after rewrite | 2026-08-05 |
| Lighthouse lab audit on a deploy preview | ⬜ | Needs a live Netlify preview (FI-3); build-time budgets already enforced | — |
| Core Web Vitals field verification | ⬜ | Phase 2 roadmap (RUM) | — |

## Security

| Item | Status | Notes | Date |
|---|---|---|---|
| No secrets in client (I3) | ✅ | Re-verified Phase 7 | 2026-08-05 |
| XSS: Astro auto-escape, no set:html | ✅ | Re-verified; no set:html in codebase | 2026-08-05 |
| External links rel="noopener noreferrer" | ✅ | lint-enforced + link-check verifies built output | 2026-08-05 |
| Honeypot on contact form | ✅ | TAD §15.6 | 2026-08-05 |
| Security headers (netlify.toml) | ✅ | HSTS/nosniff/referrer/permissions + CSP | 2026-08-05 |
| **CSP enforced (hash-allowlisted, no unsafe-inline)** | ✅ | T-H2 / D-042; generator + CI drift check | 2026-08-05 |
| CSP report-only verification on first deploy preview | ⬜ | TAD deployment discipline — RUNBOOK §5 procedure | — |
| Supply-chain audit gate + Dependabot | ✅ | TAD §19.6 (D-045); 4 advisories allowlisted with rationale | 2026-08-05 |

## Responsive Verification

| Item | Status | Notes | Date |
|---|---|---|---|
| Breakpoint implementation (mobile/tablet/desktop/panel) | ✅ | Design §24 | 2026-08-05 |
| Rail horizontal scroll + snap (mobile) | ✅ | Phase 4 | 2026-08-04 |
| Mobile menu <768px / inline nav ≥768px | ✅ | vanilla rewrite re-verified (CSS unchanged) | 2026-08-05 |
| Real-viewport matrix (browser) | ⬜ | Playwright deferred (FI-2); manual pass on deploy preview | — |
| Panel-breakpoint theme lock verification | ⬜ | Needs ≥1920px coarse-pointer hardware (ADR-0011) | — |

## Content Replacement

Every remaining placeholder in the codebase (Phase 7 content audit — recorded, NOT replaced):

| Placeholder | Location | Replacement |
|---|---|---|
| ✅ All mock presentations removed — published catalog is real-only | 2026-08-06: `photosynthesis` + `french-revolution` mocks deleted; no unpublished mocks retained | See docs/ADDING-A-PRESENTATION.md for adding more decks |
| ✅ Real presentation #1 — "Indigo (Chapter 5)" | `src/content/presentations/indigo-chapter-5.json` (replaced the `poetry-of-the-romantics` mock, 2026-08-06) | Slides + Dropbox links verified live |
| ✅ Real presentation #2 — "A Thing of Beauty" | `src/content/presentations/a-thing-of-beauty.json` (replaced the `photosynthesis` mock, 2026-08-06) | Slides + Dropbox links verified live |
| ⬜ Mock tagline | `SITE_TAGLINE` in `src/shared/config/site.ts` | Real tagline (IA-2) |
| ⬜ Mock About teaser | `SITE_ABOUT_TEASER` in `src/shared/config/site.ts` | Real copy (IA-2) |
| ⬜ Mock Contact teaser | `SITE_CONTACT_TEASER` in `src/shared/config/site.ts` | Real copy (IA-2) |
| ⬜ Mock contact email (`hello@harshit.example`) | `SITE_EMAIL` in `src/shared/config/site.ts` | Real email (IA-2 / OQ-4); socials added when provided |
| ⬜ Mock About biography | `src/content/site/about.md` | Real bio (IA-2) |
| ⬜ Placeholder favicon | `public/favicon.svg` | Brand mark when design provides (TD-8) |
| ⬜ Gradient placeholder instead of profile image | About page + AboutTeaser (TD-12) | Real image (IA-2) |
| ⬜ Site profile data file (`profile.json`) | `src/content/site/` — collection wired, file pending | Real profile content (IA-2); site.ts constants retire then |
| ⬜ Canonical domain | `site` in astro.config.mjs + robots.txt Sitemap line | Custom domain step (RUNBOOK §10) |

## Manual Testing

| Item | Status | Notes | Date |
|---|---|---|---|
| Present flow on physical classroom panel (T-D7) | 🟡 | Content ready (both real decks live-verified); classroom interactive panel test **pending** | — |
| Mobile + laptop verification | ✅ | Passed on the deployed Netlify site | 2026-08-06 |
| Contact form live submission (Netlify) | ⬜ | Requires deployed Netlify site | — |
| No-JS verification (all pages) | ⬜ | Disable JS in browser; static nav + forms must work (I1) | — |
| Client-side navigation smoke (chrome keeps working) | ✅ | Automated regression tests PASS + covered by mobile/laptop verification on the deployed site | 2026-08-06 |

## Deployment

| Item | Status | Notes | Date |
|---|---|---|---|
| Netlify site + custom domain | ✅ | **Deployed successfully** (Netlify subdomain, B7) | 2026-08-06 |
| CI workflow live (GitHub Actions) | ⛔ | Commits held locally — GitHub App lacks `workflows` permission (since Phase 3) | — |
| Netlify Forms enabled | ⬜ | Verify on first deploy | — |
| Rollback rehearsed | ⬜ | RUNBOOK §3 rehearsal script | — |
| Environment-aware robots.txt | ✅ | TD-4 resolved — preview Disallow + production smoke tests | 2026-08-05 |
| Operations docs complete (T-H4) | ✅ | `docs/ADDING-A-PRESENTATION.md` + `docs/RUNBOOK.md` | 2026-08-05 |
| ADRs discoverable next to code (FI-1) | ✅ | `docs/adr/ADR-0001…0012` | 2026-08-05 |

## Final Approval

| Item | Status | Notes | Date |
|---|---|---|---|
| All Phase H automatable gates passed | ✅ | TEST_REPORT Phase 7 entry | 2026-08-05 |
| Deploy-dependent gates (above ⬜ items) | ⬜ | First deploy preview + hardware | — |
| Owner content sign-off | ⬜ | Harshit (IA-2) | — |
| Merge to `main` (owner-authorized only) | ⬜ | Owner action | — |
