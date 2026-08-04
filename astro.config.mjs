// @ts-check
import process from 'node:process';

import { defineConfig } from 'astro/config';
import preact from '@astrojs/preact';
import sitemap from '@astrojs/sitemap';

/**
 * TAD §18.5 — the canonical site URL comes from the platform at deploy time
 * (Netlify provides the deploy URL). The fallback keeps local and CI builds
 * deterministic. Swapping to a custom domain later is a single value change
 * (assumption B7: Netlify subdomain first — see DECISIONS.md D-009).
 */
const site = process.env.SITE_URL || 'https://harshit-portfolio-hub.netlify.app';

export default defineConfig({
  // TAD ADR-0001: pure static output. Everything builds into flat HTML.
  output: 'static',
  site,
  integrations: [
    // TAD ADR-0002: Preact for the interactive islands (~4 KB shared runtime).
    preact(),
    // TAD §3.7 / §17.4: sitemap generated from real routes — never hand-maintained.
    sitemap(),
  ],
});
