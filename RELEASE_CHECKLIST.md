# Release Checklist

Tracks everything required before the project can be merged to `main` and deployed. Updated continuously through the remaining phases.

**Legend:** ⬜ Not started · 🟡 In progress · ✅ Done · ⛔ Blocked / N/A

**Branch:** `arena/019fcc8f-harshit-hub` · **Protected:** `main` · **Last updated:** 2026-08-05

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
| Projector dry-run (T-D7, M3) | ⬜ | Needs real Slides/Dropbox URLs + physical panel | — |

## Accessibility

| Item | Status | Notes | Date |
|---|---|---|---|
| axe-core zero violations (component level) | ✅ | 190/190 tests incl. axe | 2026-08-05 |
| Semantic HTML + landmarks | ✅ | All pages | 2026-08-05 |
| Keyboard: focus trap, roving, Escape | ✅ | Overlay, mobile menu | 2026-08-05 |
| Contact form labels + focus-to-invalid | ✅ | Phase 6 | 2026-08-05 |
| WCAG 2.2 AA full audit (both themes) | ⬜ | Phase H gate | — |
| Manual keyboard-only pass (all pages) | ⬜ | Phase H gate | — |
| Screen-reader pass (critical path) | ⬜ | Phase H gate | — |

## Performance

| Item | Status | Notes | Date |
|---|---|---|---|
| Eager JS within TAD §14.1 budgets (all routes) | ✅ | 6.34–6.89 KB eager | 2026-08-05 |
| CSS within budgets (all routes) | ✅ | ≤4.71 KB | 2026-08-05 |
| Self-hosted fonts, latin subset, metric fallbacks | ✅ | Phase 5 | 2026-08-05 |
| On-demand search dialog (D-038) | ✅ | Phase 5 | 2026-08-05 |
| Lighthouse CI per-route budgets | ⬜ | Phase H gate | — |
| Core Web Vitals field verification | ⬜ | Phase H / Phase 2 roadmap | — |

## Security

| Item | Status | Notes | Date |
|---|---|---|---|
| No secrets in client (I3) | ✅ | Verified | 2026-08-05 |
| XSS: Astro auto-escape, no set:html | ✅ | No set:html in use | 2026-08-05 |
| External links rel="noopener noreferrer" | ✅ | lint-enforced | 2026-08-05 |
| Honeypot on contact form | ✅ | TAD §15.6 | 2026-08-05 |
| Security headers (netlify.toml) | 🟡 | HSTS/nosniff/referrer set; CSP deferred to Phase H | 2026-08-05 |
| CSP report-only → enforce | ⬜ | Phase H gate | — |

## Responsive Verification

| Item | Status | Notes | Date |
|---|---|---|---|
| Breakpoint implementation (mobile/tablet/desktop/panel) | ✅ | Design §24 | 2026-08-05 |
| Rail horizontal scroll + snap (mobile) | ✅ | Phase 4 | 2026-08-04 |
| Real-viewport matrix (Playwright) | ⬜ | Phase H | — |
| Panel-breakpoint theme lock verification | ⬜ | Needs panel hardware | — |

## Content Replacement

| Item | Status | Notes | Date |
|---|---|---|---|
| Real presentation decks (≥3, Slides + Dropbox) | ⬜ | IA-2 — Harshit | — |
| Real homepage tagline + teasers (D-034) | ⬜ | IA-2 | — |
| Real About biography | ⬜ | IA-2 | — |
| Real contact email + socials (OQ-4) | ⬜ | IA-2 | — |
| Profile image (replaces gradient placeholder) | ⬜ | IA-2 / TD-12 | — |
| Remove MOCK labels after replacement | ⬜ | After content lands | — |

## Manual Testing

| Item | Status | Notes | Date |
|---|---|---|---|
| Present flow on physical projector (T-D7) | ⬜ | Blocked on content + panel | — |
| Contact form live submission (Netlify) | ⬜ | Requires deployed Netlify site | — |
| No-JS verification (all pages) | ⬜ | Phase H | — |

## Deployment

| Item | Status | Notes | Date |
|---|---|---|---|
| Netlify site + custom domain | ⬜ | Subdomain default (B7) | — |
| CI workflow live (GitHub Actions) | ⛔ | Blocked on `workflows` permission | — |
| Netlify Forms enabled | ⬜ | On first deploy | — |
| Rollback rehearsed | ⬜ | Phase H gate | — |
| Environment-aware robots.txt | ⬜ | Phase H | — |

## Final Approval

| Item | Status | Notes | Date |
|---|---|---|---|
| All Phase H gates passed | ⬜ | — | — |
| Owner content sign-off | ⬜ | Harshit | — |
| Merge to `main` (owner-authorized only) | ⬜ | Owner action | — |
