# Adding a Presentation — Authoring Guide (Dev Plan T-H4)

The site is **Git-as-CMS** (ADR-0004): one presentation = one JSON file
in `src/content/presentations/`. There is no admin UI and no database —
the build validates everything before anything can ship (invariant I5).

## 1. Create the file

Filename = URL slug. `water-cycle.json` → `/presentations/water-cycle`.

- Use lowercase words separated by hyphens.
- **Choose slugs carefully** — renaming later is a breaking URL change
  that requires a permanent redirect (TAD §6.2; see the RUNBOOK).

You can copy an existing file as a template, or create via the GitHub
web UI: repository → `src/content/presentations/` → *Add file*.

## 2. Fill in the fields

```json
{
  "title": "The Water Cycle",
  "subject": "Geography",
  "date": "2026-08-12",
  "tags": ["weather", "earth-science"],
  "googleSlidesUrl": "https://docs.google.com/presentation/d/<DECK_ID>/present",
  "dropboxUrl": "https://www.dropbox.com/s/<FILE_ID>/water-cycle.pptx",
  "description": "A short classroom summary shown on the detail page and used for SEO/meta (max 500 characters).",
  "published": true
}
```

| Field | Required | Rules |
|---|---|---|
| `title` | ✅ | 1–120 characters. |
| `subject` | ✅ | Exactly one of: **Science, History, English, Geography, Math**. A typo fails the build and lists the valid values (TAD §8.2). New subjects need `src/shared/config/subjects.ts` updated first — the build tells you so. |
| `date` | ✅ | `YYYY-MM-DD`. Invalid dates fail the build. Drives sorting and the "Latest" rail. |
| `tags` | optional | Up to 12 tags, each ≤30 chars. Searchable; shown on the card (overflow handled by the UI). |
| `googleSlidesUrl` | ✅ | Must be a Google Slides document URL **ending in `/present`** (opens straight in presentation mode — the Present button). |
| `dropboxUrl` | optional | The backup link. Omit it honestly if there is no backup (the UI handles absence — EC-2). |
| `forceDownload` | optional | `false` by default (Dropbox opens as in-browser preview). Set `true` to append `?dl=1` (ADR-0012). |
| `description` | optional | ≤500 chars. Detail-page copy + meta description fallback. |
| `published` | ✅ | **Explicit, no default.** `false` keeps the deck out of the gallery, search index, and sitemap without deleting the file. |
| `order` | optional | Accepted by the schema (TAD §8.1) but not yet consumed by sorting (KNOWN_ISSUES CI-3). Leave it out. |
| `linkHealth` | — | Written by automation, never by hand (TAD §8.4). Leave it out. |

## 3. Verify

```bash
npm run build        # Zod validation (invariant I5) — bad data fails here
npm test             # full automated suite (unit + site-wide a11y scans)
```

Then preview locally:

```bash
npm run dev          # http://localhost:4321
```

Check: card on `/presentations`, detail page, Present button opens the
deck full-screen, backup link behaves as expected, search finds the
title/subject/tags.

## 4. Commit

Commit the JSON file on a branch, open a pull request, and let CI run
(typecheck, lint, tests, build, CSP sync, budgets, link health, a11y
scans). Merge → Netlify deploys automatically.

## 5. After publishing

- The search index (`/search-index.json`), sitemap, and gallery all
  rebuild automatically — nothing else to touch.
- **Never hand-edit `linkHealth`.**
- If the deck's Slides/Dropbox URL changes later, edit the JSON — the
  URL itself (the slug) should not change. If a slug must change, add a
  redirect in `netlify.toml` (RUNBOOK §4).
