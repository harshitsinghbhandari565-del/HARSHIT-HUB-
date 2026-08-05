# Release Candidate Report

**Project:** Harshit — Personal Academic Portfolio & Presentation Hub
**Phase:** Phase 7 — Hardening & Release Candidate (Development Plan Phase H)
**Branch:** `arena/019fcc8f-harshit-hub` · **Protected:** `main` (untouched)
**Date:** 2026-08-05
**Companion documents:** `PROJECT_STATUS.md` · `RELEASE_CHECKLIST.md` · `TEST_REPORT.md` · `KNOWN_ISSUES.md` · `DECISIONS.md` (D-001…D-047) · `IMPLEMENTATION_LOG.md` · `docs/RUNBOOK.md` · `docs/ADDING-A-PRESENTATION.md`

---

## 1. Executive Summary

Phase 7 performed the complete engineering audit mandated by the mission and hardened the project to release quality. The audit surfaced and **fixed five real defects** the earlier phases had missed — two of them user-facing (client-side navigation silently broke the header chrome after the first page transition; the gallery skipped a heading level), one spec-mandatory behaviour that was entirely unimplemented (TAD §15.4 route-change focus/announcement), one budget violation on the detail route at mobile widths, and one full TAD subsystem that had never been built (SEO metadata + JSON-LD, TAD §17.2/§17.3).

Every Phase H deliverable is complete within what an undeployed repository allows: strict CSP enforced (hash-allowlisted, no `unsafe-inline`), build-time performance budget gate, supply-chain audit gate with documented allowlist, site-wide accessibility scans (24 axe runs, both themes), environment-aware robots, internal link health workflow, ADR migration, and both operations manuals. **250/250 automated checks pass with zero unhandled errors; every quality gate in the mission's list is green.**

What remains is deliberately non-code: Harshit's real content (IA-2), deploy-dependent verification (first Netlify preview, rollback rehearsal, live form, Lighthouse lab run, manual keyboard/screen-reader/contrast passes), and the `workflows` permission needed to push the CI pipeline. The Release Candidate verdict is at §15.

## 2. Overall Project Status

| Dimension | State |
|---|---|
| Development Plan phases | **8 / 8 complete** (A–H) |
| Automated verification | **250/250 tests** (32 files), 0 unhandled errors; typecheck 0/0/0; ESLint 0; Stylelint 0 |
| Build | Clean — 12 pages + `/search-index.json`; sitemap exactly the 7 indexable URLs |
| Budgets | Every route within TAD §14.1 — **enforced at build** (`scripts/budgets.mjs`) |
| Accessibility | 24/24 site-wide axe scans clean (both themes); heading/focus semantics fixed; manual passes pending hardware |
| Security | Strict CSP enforced, headers complete, honeypot, noopener, no secrets, audit gate + Dependabot |
| Documentation | All six permanent docs current; RUNBOOK + ADDING-A-PRESENTATION delivered; ADRs migrated |
| Overall completion | **~95%** — the remaining ~5% is content (IA-2) + deploy/hardware-dependent gates, itemized in `RELEASE_CHECKLIST.md` |

## 3. Feature Completion

Everything in the approved scope is implemented and test-verified:

| Area | Status | Evidence |
|---|---|---|
| Homepage (hero, recent rail, teasers, entrance choreography) | ✅ | Phase 4 suites + entrance rerun fix (D-044) |
| Gallery (search / sort / subject filter / URL sync) | ✅ | Phase 3+5 suites; heading-order fixed (D-046) |
| Detail pages (Present anchor + Dropbox backup + link-health states) | ✅ | Phase 3 suites; invariant I1 anchors verified |
| Global search overlay (on-demand, trap, roving, announcements) | ✅ | Phase 5 suites; trigger delegation (D-044) |
| About (content-layer long-form) · Contact (Netlify form + honeypot + island validation) | ✅ | Phase 6 suites |
| Coming Soon ×3 (noindex, out of nav & sitemap) · 404/500 recovery pages | ✅ | Phase 6 suites |
| Theme system (FOUC guard, panel lock, opt-in dark) | ✅ | Gate-2 suites; swap re-sync (D-044) |
| Chrome (header/nav/footer/mobile menu/skip link) | ✅ | Vanilla MobileMenu rewrite (D-044) |
| SEO metadata + JSON-LD (TAD §17.2/§17.3) | ✅ | Phase 7 — SeoHead + builders + integration suite (D-047) |
| Route-change focus + title announcement (TAD §15.4) | ✅ | Phase 7 — navA11y + tests (D-044) |

## 4. Performance Audit

**Method:** TD-13 standard, automated as a build gate (`scripts/budgets.mjs`): eager module scripts + static import closure + island hydration where it fires on load; gzipped. Fails CI on any TAD §14.1 overage.

| Route | Eager JS (limit) | CSS (limit) | Total (limit) | Verdict |
|---|---|---|---|---|
| `/` | 14.83 KB (20) | 7.70 KB (15) | 32.49 KB (45) | ✅ |
| `/presentations` | 16.75 KB (25) | 7.24 KB (15) | 32.55 KB (50) | ✅ |
| `/presentations/[slug]` | 7.78 KB (10) | 6.51 KB (12) | 21.2 KB (35) | ✅ |
| `/about`, `/contact`, placeholders, errors | 7.24 KB (15) | 5.5–6.1 KB (12) | ≤21.1 KB (40) | ✅ |

- **Font loading:** self-hosted woff2 (Astro Fonts API local provider), latin subset, `font-display: swap`, metric-adjusted fallbacks, only first-paint weights preloaded. Re-verify on any Astro bump (FI-9).
- **Lazy loading:** search dialog dynamic-imports on first click (D-038); ContactForm hydrates `client:visible` (+8.23 KB, on scroll, reported separately by the gate — TD-14 resolution D-043); SearchDialog/matcher excluded from eager by construction.
- **JavaScript:** vanilla chrome (theme toggle, search trigger, mobile menu, header scroll, nav-a11y) keeps Preact off every island-free route — the single largest Phase 7 performance win (island-free pages 14.5 → 7.2 KB eager JS).
- **Rendering:** pure static output; no layout-shift sources identified (fonts have fallback metrics; no images pending real content; announcer is absolutely positioned).
- **Lab/field CWV:** deploy-dependent — checklist items for the first Netlify preview (Lighthouse) and Phase 2 RUM.

## 5. Accessibility Audit

**Automated (blocking in CI):**
- axe-core wcag2a/wcag2aa/wcag22aa/best-practice over **every built page × both themes — 24 scans, zero violations** (this audit caught the gallery heading-order bug; fixed).
- Component/island-level axe on all primitives (established Phases 1–6).

**Structural verification (test-covered):** skip link first in DOM; landmarks; heading hierarchy (all pages); dialog semantics + focus trap + Escape + roving (search overlay, mobile menu); focus returns to trigger on close (overlay, menu); labels + `aria-invalid`/`aria-describedby` + focus-to-first-invalid (contact); honeypot excluded from the a11y tree (off-screen, `aria-hidden`, `tabindex="-1"`); `prefers-reduced-motion` global + targeted overrides; route-change focus to h1/main + polite title announcement (TAD §15.4, new this phase).

**Known jsdom limitation (documented):** color-contrast returns "incomplete" under jsdom (no visual rendering). Contrast is governed by the Design §25.1 token table; a **real-browser both-themes verification on the first deploy preview** is a checklist gate.

**Manual (checklist, needs humans/hardware):** full keyboard-only pass (both themes), VoiceOver/NVDA critical-path pass, panel hardware verification, no-JS pass.

## 6. Architecture Audit

**Invariants I1–I6 — all hold:**
- I1: Present/Backup are real anchors; forms/nav work without JS (MobileMenu now vanilla strengthens this).
- I2: no runtime dependency on Google/Dropbox APIs — links are navigations only; link-health model handles absence.
- I3: zero secrets anywhere (re-grepped this phase); no auth/db added.
- I4: no display-facing copy hard-coded in components — the labelled mock copy lives in config/content pending IA-2.
- I5: the build is the validation gate — Zod content validation + nine CI checks.
- I6: islands remain independent leaf nodes; single-writer URL sync (GalleryController); no cross-feature deep imports (ESLint-enforced, 0 violations).

**Violations found & resolved this phase:** navigation broke the chrome's event bindings after the first ClientRouter swap (design-level gap, not a code-style violation) — fixed via delegation (D-044). TAD §15.4 and §17.2/§17.3 were unimplemented spec obligations — implemented.

**Deviations from the approved documents (complete list):** see §15 Recommendation companion — full table in `KNOWN_ISSUES.md`/`DECISIONS.md`; summary: platform-required content-config path (D-002); CSP mechanism adapted to coexist with mandated View Transitions (D-042, policy shape unchanged); one documented `set:html` exception for JSON-LD with provably-safe serialization (D-047); MobileMenu vanilla rather than Preact to satisfy the mandated budgets (D-044); schema `order` field accepted but not yet consumed (CI-3); Lighthouse/Playwright lab tooling deferred (undeployed) with build-time equivalents in place (FI-2/FI-3).

**Dead/duplicated/unnecessary code sweep:** no TODO/FIXME/HACK markers, no console statements in src, no unused exports found in barrel reviews; the audit removed the MobileMenu island (superseded) and consolidated search wiring into `search-trigger.ts`.

## 7. Documentation Audit

| Document | Status |
|---|---|
| `IMPLEMENTATION_LOG.md` | Current — full Phase 7 entry (findings, fixes, files, decisions) |
| `DECISIONS.md` | Current — D-042…D-047 added (47 total), each with context/alternatives/consequences |
| `KNOWN_ISSUES.md` | Current — TD-4/5/6/14 + FI-1 resolved & archived; CI-3/4/5 + TD-15 recorded; FI-2/3/4 narrowed to remaining halves |
| `TEST_REPORT.md` | Current — Phase 7 entry with gate/budget tables and the 250-test inventory |
| `RELEASE_CHECKLIST.md` | Current — all Phase 7 statuses, full placeholder inventory, deploy-dependent gates |
| `PROJECT_STATUS.md` | Current — 8/8 phases, ~95% |
| `docs/ADDING-A-PRESENTATION.md` | **New (T-H4)** — complete authoring contract, field rules, verification loop |
| `docs/RUNBOOK.md` | **New (T-H4)** — deploys, rollback + rehearsal script, redirects, CSP operations, forms, supply chain, CI triage, environments, custom-domain steps |
| `docs/adr/ADR-0001…0012` | **New (FI-1)** — verbatim migration from TAD §23; TAD remains canonical |
| `README.md` | Existing project README — accurate for current state |

**Gap found & fixed:** the SEO architecture (TAD §17.2/§17.3) existed only in the TAD — now implemented (code) and tested. **Noted, not changed:** pre-existing Prettier formatting drift across ~28 files (Prettier has never been a project gate — adding it as one would be scope change; recommended post-launch chore).

## 8. Security Review

- **CSP (T-H2, D-042):** enforced `Content-Security-Policy` header — `default-src 'self'`; `script-src`/`style-src` with per-content sha256 hashes (19 script / 15 style, union across pages — survives ClientRouter swaps); `img-src 'self' data:`; `font-src 'self'`; `connect-src 'self'`; `form-action 'self'`; `base-uri 'self'`; `object-src 'none'`; `frame-ancestors 'none'`; `upgrade-insecure-requests`. **No `unsafe-inline`, no `data:` in script-src** (deliberately — the ClientRouter probe violation is accepted noise, CI-4). Generator verifies preconditions (no inline event handlers, no cross-origin resources, no frames) and CI fails on netlify.toml drift.
- **Headers (TAD §19.4):** HSTS (includeSubDomains), nosniff, strict-origin-when-cross-origin, Permissions-Policy lockdown — all present.
- **XSS surface:** Astro auto-escaping everywhere; zero `set:html` except the one proven-safe JSON-LD serializer (D-047); URLs Zod-constrained to Slides/Dropbox hosts (`javascript:` cannot enter); no user-generated content rendered.
- **Reverse tabnabbing:** every `target="_blank"` carries `rel="noopener noreferrer"` — lint-enforced and verified in built output by link-check.
- **Forms:** Netlify Forms + honeypot (TAD §15.6); submissions handled by the platform, never stored by the app; privacy microcopy exact per Design §11.10.
- **Supply chain (TAD §19.6):** `npm ci` lockfile installs; audit gate fails at high/critical with a rationale allowlist (4 advisories — all unexploitable in this codebase; stale entries fail the gate); Dependabot weekly, grouped minor/patch; exit ramp to the Astro-7 fixes documented (FI-11, CI-5).
- **Secrets (I3):** none; `.env.example` documents the only (non-secret) variable; any future secret is an ADR-level architecture change.
- **Deploy discipline:** RUNBOOK §5 preserves the TAD report-only-first procedure for the first deploy preview.

## 9. Remaining Placeholder Content

Recorded per the mission (NOT replaced) — complete inventory in `RELEASE_CHECKLIST.md §Content Replacement`:

1. Three mock presentations (titles, Slides/Dropbox URLs, descriptions) — `src/content/presentations/*.json`
2. Mock tagline — `SITE_TAGLINE`
3. Mock About teaser — `SITE_ABOUT_TEASER`
4. Mock Contact teaser — `SITE_CONTACT_TEASER`
5. Mock contact email (`hello@harshit.example`) — `SITE_EMAIL`; socials pending
6. Mock About biography — `src/content/site/about.md`
7. Placeholder favicon — `public/favicon.svg` (TD-8)
8. Gradient placeholder instead of profile image — About page/teaser (TD-12)
9. `profile.json` site-profile data file pending (collection wired) — constants retire when it lands
10. Canonical domain — Netlify subdomain fallback until custom domain (B7)
11. `og:image` share-card asset — card downgrades to `summary` until a brand image exists

Every replacement path is content-only (invariant I4); procedures in `docs/ADDING-A-PRESENTATION.md` + RUNBOOK §10.

## 10. Remaining Technical Debt

| # | Item | Exit path |
|---|---|---|
| TD-2 | Dark palette derived (Design v1 values never delivered); real-browser contrast check pending | Design v1 if it arrives; deploy-preview verification (checklist) |
| TD-3 / FI-10 | Stylelint doesn't cover `.astro` scoped styles | Custom syntax when component CSS grows |
| TD-8 | Placeholder favicon | Brand asset |
| TD-10 | Loading-state spec lives in undelivered Design v1 | When spec arrives |
| TD-11 | Tablet `<details>` dropdown: no outside-click/Escape close (native disclosure) | Small script if review deems it needed |
| TD-12 | Mock copy/visual constants | IA-2 |
| TD-15 | Astro checker gotcha: `<` in frontmatter comments breaks Props typing | Avoid; documented (RUNBOOK triage) |
| — | Prettier formatting drift (~28 files; never a gate) | Post-launch chore if the team wants the gate |

Resolved this phase: TD-4 (robots), TD-5 (CSP), TD-6 (focus management), TD-14 (contact budget), FI-1 (ADRs), plus the five audit defects (§1).

## 11. Known Issues

| # | Item | Disposition |
|---|---|---|
| CI-1 | T-D7 projector dry-run | Blocked on real URLs + panel hardware — scheduled after IA-2 |
| CI-2 | Mock seed content live | Blocked on IA-2; replacement is content-only |
| CI-3 | Schema `order` field accepted but unconsumed | Implement when a use case appears (or future schema revision) |
| CI-4 | Benign CSP violation per SPA navigation (ClientRouter `data:` probe) | Accepted noise; `data:` deliberately not allowlisted; no functional impact |
| CI-5 | Astro-6 pinned-stack advisories (allowlisted with rationale) | Exit ramp = Astro 7 upgrade (ADR-level, FI-11) |
| — | CI workflow commits held locally | GitHub App lacks `workflows` permission (since Phase 3) — owner action |

## 12. Risks

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| IA-2 content delay gates launch polish + T-D7 | Medium | Medium | All replacements content-only; RUNBOOK + authoring guide ready |
| First-deploy CSP surprise | Low | High | Report-only verification procedure on first preview (RUNBOOK §5); hashes generated from the exact build |
| `workflows` permission stays blocked | Medium | Medium | Pipeline fully defined + tested locally; merges are still safe without it (checks just don't run on GitHub) |
| Panel hardware unavailable for theme-lock + projector checks | Medium | Low–Medium | Automated coverage for the logic; manual items checklist-tracked |
| Astro 6 advisories attract a real exploit before upgrade | Low | Medium | No reachable attack surface documented per advisory; CSP blocks execution; Dependabot + audit gate watch the tree |
| Mock URLs shipped to production by accident | Low | Medium | All labelled `MOCK`; link-check prints every external target; checklist gate before owner merge |

## 13. Git Synchronization Status

- `main`: **untouched** at `9054be7` (planning docs only) — protected per all missions.
- `arena/019fcc8f-harshit-hub`: pushed tip `8fb0dac` (Phase 6) + **11 new Phase 7 commits** awaiting push at report time:
  1. `test(hardening)` — vitest unhandled-error fix
  2. `feat(security)` — strict CSP generator + enforced header (T-H2)
  3. `fix(chrome)` — navigation resilience + TAD §15.4 focus + vanilla MobileMenu (D-044)
  4. `fix(a11y)` — gallery heading-order (D-046)
  5. `test(a11y)` — site-wide axe suite (T-H1)
  6. `feat(perf)` — build-time budget gate (T-H3)
  7. `feat(ops)` — robots/audit/link-check gates + ADR migration (TD-4, FI-1, TAD §19.6)
  8. `docs(phase-7)` — logs, D-042…D-046, trackers, ops manuals (T-H4)
  9. `feat(seo)` — TAD §17.2/§17.3 SeoHead + JSON-LD (D-047)
  10. `docs(phase-7)` — D-047 propagation across permanent docs
  11. `ci(phase-h)` — **held at history tip** (GitHub App lacks `workflows` permission — same arrangement as Phases 3–6): hardened CI pipeline, weekly link-health workflow, Dependabot. Pushed the moment the permission is granted.
- Working tree: clean (dist/ ignored; no uncommitted source).

## 14. Release Readiness Score (0–100)

| Category | Weight | Score | Notes |
|---|---|---|---|
| Feature completeness (approved scope) | 25 | 25 | 100% of PRD/TAD/Design/Dev-Plan scope implemented |
| Automated quality gates | 20 | 20 | 250/250, nine CI gates defined & green locally |
| Accessibility | 15 | 12 | Automated layers complete; manual SR/contrast passes pending hardware |
| Performance | 10 | 10 | All TAD §14.1 budgets enforced at build |
| Security | 10 | 10 | CSP enforced, headers, forms, supply chain |
| Documentation & ops readiness | 10 | 9 | All manuals delivered; rollback rehearsal pending a live deploy |
| Deployment readiness | 10 | 5 | No deploy yet: preview verification, live form, workflows permission, IA-2 content |

**Release Readiness Score: 91 / 100** — code-complete and hardened; the deducted points are exclusively deploy/content actions that cannot be performed from this repository.

## 15. Recommendation

**Authorize the release-candidate track:** (1) review this report and the held CI commit; (2) reconnect GitHub with the `workflows` permission so the hardened pipeline pushes and runs; (3) provide the IA-2 content (decks, tagline/teasers, bio, email/socials, profile image, favicon) — every path is content-only; (4) authorize the first Netlify deploy of this branch as a preview to run the remaining deploy-dependent gates (RUNBOOK §3 rehearsal, §5 CSP report-only verification, live form submission, Lighthouse lab, real-viewport + contrast + keyboard/SR passes); (5) upon green checklist and owner sign-off, merge to `main` (owner action only) for production go-live.

No further implementation is required to reach this state; nothing in this phase changed the approved product scope.

---

**Release Candidate Ready with Minor Notes**
