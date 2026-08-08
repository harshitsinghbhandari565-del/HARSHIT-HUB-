# RUNBOOK — Operations Manual (Dev Plan T-H4)

## 1. System overview

| Property | Value |
|---|---|
| Product | Harshit — Personal Academic Portfolio & Presentation Hub |
| Stack | Astro 6 (static output), Preact islands, Zod content collections |
| Host | Netlify (ADR-0009 — Netlify Forms, header control, preview deploys) |
| Content | JSON files in `src/content/presentations/` (Git-as-CMS, ADR-0004) |
| Backend | **None.** No server, database, secrets, or auth (invariant I3) |
| Branching | `main` is protected; work lands via pull request; Netlify builds every push |

## 2. Deployments

- **Production:** merge to `main` → Netlify builds (`npm run build &&
  node scripts/robots.mjs`) → publishes `dist/`. There is no manual
  deploy step.
- **Preview deploys:** every branch/PR gets a unique Netlify URL. Its
  `robots.txt` is automatically `Disallow: /` (TD-4) and it uses the
  branch's code — safe to share with Harshit for review.
- **Build-time gates (CI must pass before merge):** typecheck, ESLint,
  Stylelint, supply-chain audit, unit tests, build (Zod content
  validation — invariant I5), CSP sync check, performance budgets,
  internal link health, site-wide accessibility scans.

## 3. Rollback

**Fastest path (preferred): Netlify instant rollback.**
Netlify UI → *Deploys* → pick the last known-good deploy → *Publish
deploy* (or use `netlify rollback` in the CLI). Instant; no build.

**Git path:** revert the offending merge commit on `main`; CI runs;
Netlify redeploys. Use this when the rollback must be visible in
history or needs follow-up fixes.

**Rollback rehearsal (perform once before go-live):**
1. Note the current deploy ID.
2. Merge a harmless content tweak (e.g. add a tag to one deck).
3. Confirm the deploy succeeded, then roll back via the Netlify UI.
4. Confirm the previous deploy is live and the reverted change is gone.
5. Re-apply the tweak. Record the date in RELEASE_CHECKLIST.

**Redirects are permanent (TAD §6.2):** entries in `netlify.toml`
`[[redirects]]` are never deleted — old URLs may live in classroom
bookmarks and slides.

## 4. Slug changes / redirects

Renaming `src/content/presentations/<slug>.json` changes the URL.
Always pair a rename with a permanent redirect in `netlify.toml`:

```toml
[[redirects]]
  from = "/presentations/old-slug"
  to = "/presentations/new-slug"
  status = 301
```

## 5. Content Security Policy (TAD §19.3, D-042)

- The policy is **enforced** via the `Content-Security-Policy` header
  in `netlify.toml`. Hashes for every inline script/style are generated
  by `node scripts/generate-csp.mjs` — the managed block in
  `netlify.toml` is a lockfile.
- **After any change that alters inline scripts/styles** (component
  scripts, FOUC guard, entrance script, style blocks): `npm run build`,
  then `node scripts/generate-csp.mjs`, then commit both `dist`-derived
  `netlify.toml` changes together with the code. CI fails on drift.
- **First-deploy verification (TAD deployment discipline):** before the
  go-live deploy, publish one deploy preview with the header temporarily
  renamed to `Content-Security-Policy-Report-Only`, browse every route
  in both themes (check the browser console for CSP violations), then
  restore the enforcing header and deploy production. Record in
  RELEASE_CHECKLIST.
- Known benign source: Astro's ClientRouter inserts one empty
  `data:`-URL probe script per navigation; it is blocked by design and
  has no functional role (KNOWN_ISSUES CI-4).

## 6. Forms (contact page)

- Netlify Forms — no backend code (ADR-0009). Submissions: Netlify UI →
  *Forms* → *harshit-contact*. Enable email notification there after
  go-live.
- Spam: honeypot field `bot-field` (off-screen, `aria-hidden`,
  `tabindex="-1"` — TAD §15.6) plus Netlify's built-in filtering.
- The form works without JavaScript (invariant I1); the island only adds
  inline validation and async submit.

## 7. Dependencies & supply chain

- **Dependabot** opens weekly PRs (minor/patch grouped). CI runs the
  audit gate on every PR.
- `node scripts/audit.mjs` enforces TAD §19.6 (fail at high/critical).
  Allowlisted advisories live in that file with rationales; when an
  advisory is fixed upstream, remove its entry (the gate fails on stale
  entries).
- **Astro 6 is pinned deliberately** (D-001/TAD ADR-0001). The Astro-7
  line fixes the allowlisted astro/sharp advisories; upgrading is an
  ADR-level decision (revisit triggers in ADR-0001/0002), not routine
  maintenance. FI-9: re-verify the Fonts API config on any Astro bump.

## 8. CI failure triage (cheapest-first ordering)

| Failing step | Likely cause | First move |
|---|---|---|
| Typecheck | Type error in new code | Read the diagnostic; fix in place |
| ESLint / Stylelint | Convention or architecture-rule breach | Fix the code, not the rule (rules encode TAD §5.1) |
| Supply-chain audit | New advisory published | Assess exploitability; fix or add an allowlist entry **with rationale** |
| Unit tests | Behaviour regression | Reproduce with `npx vitest run <file>` |
| Build | Malformed content JSON (I5) or broken import | Fix the content file — the error lists valid values |
| CSP sync check | Inline scripts/styles changed | `node scripts/generate-csp.mjs`, commit |
| Performance budgets | Eager JS/CSS grew past TAD §14.1 | Find the new eager chunk (`node scripts/budgets.mjs` prints per-route detail); defer it (dynamic import / `client:visible`) rather than raising budgets |
| Link health | Broken internal link/fragment | Fix the href or add a redirect |
| A11y scans | axe violation in built output | Fix semantics; never disable rules without a recorded decision |

## 9. Environments & variables

| Variable | Where | Purpose |
|---|---|---|
| `SITE_URL` | Netlify build env (optional) | Canonical URL for sitemap/robots; falls back to the B7 subdomain in `astro.config.mjs` |
| `CONTEXT` | Set by Netlify | `production` vs previews — drives robots.txt |
| `ASTRO_TELEMETRY_DISABLED` | CI | Telemetry off in automation |

There are **no secrets** anywhere (invariant I3). If a feature ever
needs one, that is an architecture change requiring a new ADR.

## 10. Custom domain (post-launch)

1. Add the domain in Netlify → *Domain management*; TLS is automatic.
2. Update `site` in `astro.config.mjs` (or set `SITE_URL`).
3. Update the `Sitemap:` line in `public/robots.txt`.
4. Rebuild; verify `sitemap-index.xml` and CSP hashes are unchanged in
   shape; deploy.

## 11. Known operational notes

- **Mock content is live until IA-2** (three labelled presentations,
  tagline/teasers, contact email, profile image). Replacement paths are
  content-only — see RELEASE_CHECKLIST §Content Replacement.
- The weekly **link health workflow** verifies internal links; external
  Slides/Dropbox liveness is a manual check until real URLs land
  (RELEASE_CHECKLIST).
- **Projector dry-run (M3)** needs real URLs + the physical classroom
  panel — schedule with Harshit after IA-2.
