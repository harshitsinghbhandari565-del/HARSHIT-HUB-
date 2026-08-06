# Deployment Readiness Report — Vercel Deployment Assessment

**Project:** Harshit — Personal Academic Portfolio & Presentation Hub
**Mission:** Pre-Deployment Verification (READ-ONLY) · **Date:** 2026-08-06
**Target host:** Vercel · **Assessed branch:** `arena/019fcc8f-harshit-hub`
**Method:** fresh production build from clean `dist/`, full gate re-run, built-output inspection, live external-link verification, documentation cross-check. **Nothing in the repository was modified.**

---

## 1. Executive Summary

The repository is in an exceptionally strong state: production build clean, 250/250 automated checks green (including 24 site-wide axe scans and 11 SEO integration checks), typecheck/ESLint/Stylelint all zero, every TAD §14.1 performance budget enforced and met, strict CSP generated and in sync, supply-chain audit green, zero broken internal links, zero local-only artifacts, and one real, verified presentation (Indigo) alongside two clearly-labelled mocks.

**However, this project was architected for Netlify (ADR-0009), and three Netlify-coupled behaviours do not transfer to Vercel automatically:**

1. **Contact form submissions will fail on Vercel** (Netlify Forms is the submission backend — the form POSTs to `/` with `data-netlify`). *High impact.*
2. **All security headers, including the enforced CSP, live in `netlify.toml`**, which Vercel ignores — the deployed site would have no CSP/HSTS/nosniff/etc. unless recreated in `vercel.json`. *High impact (security posture).*
3. **Preview-deploy robots protection keys off Netlify's `CONTEXT` variable** — Vercel previews would ship the production (Allow) policy and could be indexed. *Low–medium impact.*

Additionally, canonical/sitemap URLs default to the Netlify subdomain; deploying on a Vercel domain without setting `SITE_URL` would emit wrong canonical/OG/sitemap URLs. Everything else — static generation, SEO, JSON-LD, search, gallery, detail pages, assets, a11y, budgets — deploys to Vercel without change.

**Verdict (§24): Deployment Ready with Minor Notes** — the repository itself is deploy-ready; the notes are host-adaptation tasks (config/small files), all classified below with recommended fixes.

---

## 2. Repository Status

| Aspect | State |
|---|---|
| Working tree | Clean — zero uncommitted changes |
| Source integrity | 12 pages + `/search-index.json` build from source; no orphan files |
| Dependencies | `package-lock.json` committed; `npm ci` installs deterministically; audit gate green |
| Build output | `dist/` (git-ignored) regenerated fresh for this verification |
| Secrets | None (invariant I3 re-verified; no `.env` files committed) |

## 3. Branch Status

| Item | Finding |
|---|---|
| Development branch | `arena/019fcc8f-harshit-hub` — correct, checked out |
| `main` | **Untouched** at `9054be7` ("Add files via upload" — planning docs only). Note: `main` contains **no application code** — an initial deploy cannot come from `main` until the owner merges |
| Remote synchronization | `origin/arena/019fcc8f-harshit-hub` = `962eb60` (content commit) — all pushed work is on the remote |
| Local-only commits | Exactly **one**: `dc92cbb ci(phase-h): hardened pipeline…` — the **held workflow commit** (GitHub Actions files), blocked since Phase 3 because the GitHub App token lacks the `workflows` permission. It is deliberately at the local tip; pushing `HEAD~1` keeps it out of the remote. It does not affect deployment (GitHub Actions is irrelevant to Vercel) |

## 4. Production Build Status

- ✅ **Build succeeds** from a clean slate: 12 pages + search index in ~4 s, exit 0
- ✅ **Static generation** complete (`output: 'static'`) — all routes are flat HTML; no server runtime required
- ⚠️ **One build warning:** `[glob-loader] No files found matching "profile.json" in directory "src/content/site"` — the `site` profile collection is wired but its data file is pending (IA-2). **Impact:** none functional (pages use `site.ts` constants until the file lands). **Fix (when content arrives):** add `src/content/site/profile.json` — no code change.
- ✅ No production-only failures; no errors; nothing requiring action before deploy

## 5. Environment Verification

- ✅ The only variable is **`SITE_URL`** — optional, non-secret, with a deterministic fallback (`https://harshit-portfolio-hub.netlify.app`) in both `astro.config.mjs` and `site.ts`
- ✅ `.env.example` matches requirements exactly (documents `SITE_URL`; states the no-secrets invariant)
- ✅ No `.env`/`.env.*` files committed (git-ignored); no hidden local configuration needed to build
- ⚠️ **Vercel note:** without setting `SITE_URL` on Vercel, canonical/OG/sitemap URLs point at the Netlify subdomain fallback. **Impact:** wrong canonical host for SEO on a Vercel domain. **Fix:** set `SITE_URL` to the production URL in Vercel project settings (see §24 settings).

## 6. Deployment Configuration Verification

| Check | Finding |
|---|---|
| Astro configuration | `output: 'static'`, `site` set, integrations: preact + sitemap + icon — all Vercel-compatible; no adapter needed for static |
| Vercel compatibility | Framework preset **Astro** auto-detects; `astro build` → `dist` is the standard static flow |
| Output directory | `dist` (verified populated with all routes + assets) |
| Build command | `npm run build` suffices for the site. To preserve the robots gate, use `npm run build && node scripts/robots.mjs` (see warning below) |
| Install command | `npm ci` (lockfile present) |
| Node version | `engines: >=22.12.0` + `.nvmrc=22`; verified under Node v22.22.3. Vercel honours `engines` → Node 22 |
| netlify.toml interference | **None — Vercel ignores it** — but that is itself the problem: everything in it (CSP + security headers, cache rules, robots build step, future redirects) is **silently lost on Vercel**. **Recommended fix:** create `vercel.json` mirroring the `/*` headers (the CSP string can be copied verbatim from netlify.toml's managed block), `/_astro/*` immutable caching, and keep netlify.toml as the documented alternative host |
| ⚠️ robots preview detection | `scripts/robots.mjs` reads Netlify's `CONTEXT`. On Vercel, previews set `VERCEL_ENV=preview`, so preview deploys would keep the production "Allow" policy. **Impact:** preview URLs could be indexed. **Fix:** teach `scripts/robots.mjs` to treat `VERCEL_ENV !== 'production'` the same as non-production `CONTEXT` (one-line change; not made here — read-only mission) |

## 7. Robots Verification

- ✅ `dist/robots.txt` generated correctly: `Allow: /` + `Sitemap:` line for production builds
- ✅ Environment-aware behaviour verified for Netlify: `CONTEXT=deploy-preview` rewrites to `Disallow: /`; production policy validated and self-healing; smoke-tested by `tests/unit/tooling/robots.test.ts` (5 tests)
- ⚠️ On **Vercel**, environment-awareness degrades to "always production" (§6) — previews indexable until the one-line fix
- ✅ Sitemap directive URL matches the canonical site URL source

## 8. Sitemap Verification

- ✅ `sitemap-index.xml` + `sitemap-0.xml` generated
- ✅ Contains **exactly the 7 indexable URLs**: `/`, `/about/`, `/contact/`, `/presentations/`, and the 3 detail pages (incl. `indigo-chapter-5`)
- ✅ Coming Soon pages (`/projects`, `/certificates`, `/resume`), `404`, `500` correctly **excluded** (noindex + sitemap filter verified)
- ✅ Search index and other non-page assets excluded; sitemap ↔ built pages cross-checked by the link-health gate

## 9. Content Verification

- ✅ All 3 presentations pass the Zod schema at build (invariant I5 — malformed content cannot ship)
- ✅ **No mock marked as real:** the two mocks (`photosynthesis`, `french-revolution`) carry explicit `MOCK SEED CONTENT` labels in their descriptions; the real deck (`indigo-chapter-5`) has verified content
- ✅ All 3 published presentations render (gallery cards, detail routes, search index entries)
- ✅ **No duplicate slugs** (checked programmatically), **no duplicate routes** (12 distinct built pages)
- ✅ No invalid metadata: titles ≤120, descriptions ≤500, dates parse, tags within bounds (all enforced by schema at build)

## 10. Google Slides Verification

| Deck | URL | Result |
|---|---|---|
| **Indigo (Chapter 5)** (real) | `…/d/1Ce8sDcOjx-bY1F7mSpOonBKvUS8JsGvB/present` | ✅ **LIVE** — serves the actual 18-slide Indigo deck (NCERT Flamingo Class XII English); schema-stored `/present` form is correct |
| Photosynthesis (mock) | `…/d/1MOCK0000000000000000photosynthesis00/present` | ❌ Dead ("file does not exist") — expected; labelled mock |
| French Revolution (mock) | `…/d/1MOCK000000000000000french-revolution0/present` | ❌ Dead — expected; labelled mock (same mock URL shape, verified representative sample) |

**Impact:** PRD AC-7 ("all external links valid at release") is blocked on the remaining IA-2 decks — known, tracked (RELEASE_CHECKLIST), labelled in-content.

## 11. Dropbox Verification

| Deck | Result |
|---|---|
| **Indigo** `…/scl/fi/iakxizjl6309h8wln7z64/Indigo_Presentation.pptx?rlkey=…&dl=0` | ✅ **LIVE** — in-browser preview works (ADR-0012 `dl=0` behaviour confirmed; file shared by the owner; `rlkey`/`st` params preserved through `buildBackupUrl`) |
| Photosynthesis `…/s/mock0000000000001/…` | ❌ Dropbox error page — expected; labelled mock |
| French Revolution `…/s/mock0000000000002/…` | ❌ Dead — expected (same mock pattern) |

## 12. SEO Verification

- ✅ **Canonical:** present on all 12 pages, absolute, clean paths, host-consistent (⚠️ currently the Netlify subdomain — see §5 for the Vercel action)
- ✅ **Open Graph:** `og:title`, `og:description`, `og:type`, `og:url`, `og:site_name` on every page; ⚠️ `og:image` absent by design until a brand image exists (card downgrades to `summary`)
- ✅ **Twitter:** `twitter:card` on every page
- ✅ **JSON-LD:** all blocks parse-valid and escape-safe; Person+WebSite (/), CollectionPage+ItemList newest-first (/presentations), PresentationDigitalDocument+BreadcrumbList (details), AboutPage, ContactPage; none on noindex pages
- ✅ **Sitemap consistency:** sitemap URLs = canonical hosts/paths; **robots consistency:** robots references the same sitemap; sitemap ↔ robots ↔ canonical all derive from one site-URL source

## 13. Static Assets Verification

- ✅ **Favicon:** `favicon.svg` present and referenced (⚠️ placeholder mark — tracked TD-8)
- ✅ **Icons:** astro-icon symbols inlined at build (no external icon requests)
- ✅ **Fonts:** 6 self-hosted woff2 files in `dist/_astro/fonts/`, all `@font-face` references resolve
- ✅ **Images:** no raster images yet (subject-gradient visuals are CSS); zero broken asset references across all built pages (checked every `href`/`src` + font URL against `dist/`)

## 14. Documentation Verification

All eight documents exist and were cross-checked against repository state:

| Document | Consistency |
|---|---|
| IMPLEMENTATION_LOG.md | ✅ Phase 7 entry accurate (190 → 250 tests, decisions, files) |
| DECISIONS.md | ✅ D-001…D-047 present (47 decisions), consistent with implementations |
| KNOWN_ISSUES.md | ⚠️ **One stale line:** CI-2 still says "three labeled mock presentations" — it is now two (Indigo replaced one on 2026-08-06). PROJECT_STATUS and RELEASE_CHECKLIST were updated; CI-2 was not. Cosmetic; no deploy impact |
| TEST_REPORT.md | ✅ Content-update entry + Phase 7 entry match reality (250/250) |
| PROJECT_STATUS.md | ✅ 8/8 phases, 250/250, IA-2 1/3, held CI commit noted |
| RELEASE_CHECKLIST.md | ✅ Content inventory correct (2 mocks remain; Indigo marked replaced) |
| docs/ADDING-A-PRESENTATION.md | ✅ Matches schema/fields and the actual authoring flow |
| docs/RUNBOOK.md | ⚠️ Entirely **Netlify-centric** (deploys, rollback, forms, CONTEXT). Accurate for the approved host (ADR-0009) but will need a Vercel section if Vercel becomes the production host |

## 15. Placeholder Inventory (reported, not replaced)

| # | Placeholder | Location |
|---|---|---|
| 1 | Mock presentation — Photosynthesis (title/URLs/description, labelled) | `src/content/presentations/photosynthesis.json` |
| 2 | Mock presentation — French Revolution (labelled) | `src/content/presentations/french-revolution.json` |
| 3 | Mock tagline ("MOCK TAGLINE —…") | `SITE_TAGLINE`, `src/shared/config/site.ts` |
| 4 | Mock About teaser | `SITE_ABOUT_TEASER` |
| 5 | Mock Contact teaser | `SITE_CONTACT_TEASER` |
| 6 | Mock contact email (`hello@harshit.example`) | `SITE_EMAIL` (visible on /contact) |
| 7 | Mock About biography | `src/content/site/about.md` |
| 8 | Placeholder favicon | `public/favicon.svg` (TD-8) |
| 9 | Gradient placeholder instead of profile image | About page + About teaser (TD-12) |
| 10 | `profile.json` site-profile data file absent | `src/content/site/` (build warning, §4) |
| 11 | No `og:image` brand asset | SeoHead emits image tags only when provided |
| 12 | Canonical domain fallback (Netlify subdomain) | `astro.config.mjs` / `SITE_URL` |

## 16. Local-only Artifact Verification

- ✅ **No localhost/127.0.0.1 URLs** anywhere in src/, scripts/, or config
- ✅ **No absolute local file paths**
- ✅ **No development-only imports or env conditionals** in src/
- ✅ **No debug code:** zero `console.*` / `debugger` in src/
- ✅ **No TODO/FIXME/XXX** in src/, tests/, scripts/
- ✅ No committed `.env` files

## 17. Security Verification

- ✅ **CSP:** strict hash-allowlisted policy generated (19 script + 15 style hashes), no `unsafe-inline`, `frame-ancestors 'none'`, TAD §19.3 directive set; generator precondition checks pass; netlify.toml lockfile in sync (`--check` green)
- ✅ Headers (as configured for Netlify): HSTS, nosniff, Referrer-Policy, Permissions-Policy
- ✅ XSS surface: Astro auto-escaping everywhere; exactly one `set:html` — the proven-safe JSON-LD serializer (D-047); Zod-constrained URLs (no `javascript:` possible)
- ✅ Reverse tabnabbing: all `target="_blank"` links carry `rel="noopener noreferrer"` (lint + built-output verified)
- ✅ Forms: honeypot per TAD §15.6; no data stored by the app
- ✅ Supply chain: audit gate green (4 allowlisted advisories with rationales; stale-entry detection); Dependabot configured
- ⚠️ **Vercel gap:** all of the above headers are delivered via `netlify.toml` → **absent on Vercel until mirrored into `vercel.json`** (see §6 fix). The underlying site code is unchanged either way; only delivery differs.

## 18. Accessibility Verification

- ✅ **24 site-wide axe scans** (every built page × light & dark; wcag2a/2aa/22aa + best-practice) — zero violations, re-run this mission
- ✅ Keyboard semantics test-covered: focus traps, Escape close, roving, focus-return, skip link, route-change focus + title announcement
- ✅ Reduced-motion support verified structurally
- ⚠️ Colour contrast under real rendering + manual screen-reader passes remain checklist items (jsdom limitation; documented)

## 19. Performance Verification

- ✅ All TAD §14.1 budgets met and **build-enforced** (re-run this mission): home 14.83/20 KB JS, gallery 16.75/25, detail 7.78/10, others 7.24/15; CSS ≤7.70 KB everywhere; totals ≤32.6 KB
- ✅ Self-hosted fonts, latin subset, metric-adjusted fallbacks, first-paint-only preloads
- ✅ On-demand search loading; island hydration deferred appropriately
- ⚠️ Vercel nuance: the `/_astro/*` immutable cache header comes from netlify.toml; without a vercel.json mirror, hashed assets rely on Vercel defaults (functionally fine, slightly weaker caching)

## 20. Quality Gate Summary (all re-run during this mission)

| Gate | Result |
|---|---|
| Production build | ✅ Clean, 12 pages, 1 informational warning |
| Typecheck (`astro check`) | ✅ 0 errors / 0 warnings / 0 hints |
| ESLint | ✅ 0 |
| Stylelint | ✅ 0 |
| Tests (unit + a11y + integration) | ✅ **250/250**, 32 files, 0 unhandled errors, exit 0 |
| Accessibility suite | ✅ 24/24 scans clean |
| Performance budgets | ✅ All routes within TAD §14.1 |
| CSP verification | ✅ Generator `--check` — netlify.toml in sync |
| Dependency audit | ✅ Green (allowlist enforced, stale-detection active) |
| Link health | ✅ All internal links/fragments/sitemap resolve; external mocks reported |
| Robots policy | ✅ Production policy valid |

## 21. Remaining Risks

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| **Contact form dead on Vercel** (Netlify Forms backend) | Certain if deployed as-is | High (core PRD feature) | §24 recommendation 1 — form endpoint before public launch, or keep production on Netlify (approved host per ADR-0009) |
| **No CSP/security headers on Vercel** until vercel.json exists | Certain if deployed as-is | High (security posture) | §24 recommendation 2 — copy headers block into vercel.json |
| Preview deploys indexable on Vercel (robots CONTEXT coupling) | Medium | Low–Medium | One-line `VERCEL_ENV` support in scripts/robots.mjs |
| Wrong canonical/sitemap host without `SITE_URL` | Certain if unset | Medium (SEO) | Set `SITE_URL` env var on Vercel |
| Two mock decks ship with dead external links | Certain until IA-2 | Medium (AC-7) | Labelled in-content; tracked; replace before public announcement |
| Held CI commit stays local (workflows permission) | Ongoing | Low (GitHub-side only) | Owner reconnects GitHub with `workflows` scope |
| `main` has no code — deploy path ambiguity | Low | Low | Initial deploy from `arena/019fcc8f-harshit-hub`; owner-authorized merge for production lineage |

## 22. Remaining Manual Tasks

1. Decide host: **Vercel (this assessment) vs Netlify (approved architecture)** — if Vercel: implement recommendations 1–3 of §24; if Netlify: only content + first-deploy checklist remain
2. IA-2 content: 2 real decks, tagline/teasers, bio, real email/socials, profile image, favicon, og-image, `profile.json`
3. First-deploy verification: CSP report-only pass (RUNBOOK §5), rollback rehearsal, live form submission test, Lighthouse lab run, real-viewport matrix, keyboard/VoiceOver/contrast passes
4. T-D7 projector dry-run on the physical panel
5. Grant the GitHub App `workflows` permission so the held CI pipeline pushes
6. Fix KNOWN_ISSUES CI-2 stale count (cosmetic, one line)

## 23. Release Readiness Score (0–100)

| Category | Weight | Score | Notes |
|---|---|---|---|
| Code & build quality | 25 | 25 | All gates green, zero warnings requiring action |
| Configuration for the **target host (Vercel)** | 20 | 11 | No vercel.json; headers/robots/form adaptation outstanding |
| Content readiness | 15 | 9 | 1/3 decks real; placeholders labelled & tracked |
| SEO & structured data | 10 | 10 | Complete, verified (SITE_URL action noted) |
| Accessibility | 10 | 9 | Automated complete; manual passes pending |
| Performance | 10 | 10 | Budget-enforced, all met |
| Security | 10 | 7 | Posture excellent but delivery is Netlify-bound until mirrored |

**Release Readiness Score: 81 / 100 for Vercel** (would be **91/100** for the approved Netlify host, per the Release Candidate Report — the delta is purely host adaptation).

## 24. Final Recommendation

Deploying this repository to Vercel **today would produce a fast, accessible, SEO-complete static site**, but with two regressions against the approved architecture: a non-functional contact form and absent security headers (both are Netlify→Vercel adaptation gaps, not code defects). Recommended sequence:

1. **Before public launch on Vercel:** add `vercel.json` mirroring the netlify.toml headers (CSP included — copy the managed block verbatim; regenerate only if inline scripts/styles change), plus `/_astro/*` cache rules; provide a Vercel-compatible contact submission path (e.g., a small serverless function receiving the form POST, keeping the honeypot contract); extend `scripts/robots.mjs` to read `VERCEL_ENV`; set `SITE_URL`.
2. **Or, simpler and architecture-faithful (ADR-0009):** deploy to Netlify, where every gate above works as designed, and revisit Vercel as a deliberate ADR-level host change.
3. Independently of host: finish IA-2 content before announcing the site (two decks currently link to dead mock URLs).

---

**Deployment Ready with Minor Notes**

### Vercel Deployment Settings

| Setting | Value |
|---|---|
| **Framework Preset** | Astro |
| **Build Command** | `npm run build && node scripts/robots.mjs` |
| **Install Command** | `npm ci` |
| **Output Directory** | `dist` |
| **Node Version** | 22.x (satisfies `engines >=22.12.0`; set explicitly in project settings — `.nvmrc` is not read by Vercel) |
| **Environment Variables Required** | `SITE_URL` = the production URL (e.g. `https://<project>.vercel.app` or the custom domain). Optional but strongly recommended; without it, canonical/OG/sitemap point at the Netlify subdomain fallback |
| **Branch Recommended for Initial Deployment** | `arena/019fcc8f-harshit-hub` (contains the complete application; `main` holds only planning docs until the owner authorizes a merge). Use its remote tip `962eb60`; the held local CI commit is not on the remote and is irrelevant to Vercel |

*Required before considering the Vercel deploy production-grade: `vercel.json` security headers (incl. CSP), contact-form submission path, `VERCEL_ENV` robots support — §21/§24.*
