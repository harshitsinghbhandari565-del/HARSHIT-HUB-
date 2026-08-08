// @ts-check
import process from 'node:process';

import preact from '@astrojs/preact';
import sitemap from '@astrojs/sitemap';
import icon from 'astro-icon';
import { defineConfig, fontProviders } from 'astro/config';

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
    // TAD §3.7 / §17.4: sitemap generated from real routes — never
    // hand-maintained. Coming Soon pages are noindex and stay out of the
    // sitemap (TAD §6.4 / §17.4).
    sitemap({
      filter: (page) =>
        !['/projects', '/certificates', '/resume'].some(
          (excluded) => page.endsWith(excluded) || page.endsWith(`${excluded}/`),
        ),
    }),
    // TAD §3.7 + D-006: build-time inline SVG icons (Lucide via @iconify-json).
    // Zero runtime JS; icon names follow the Design Spec vocabulary.
    icon(),
  ],
  /**
   * TAD §14.5 / §3.7 — Astro Fonts API (native to Astro 6), local provider.
   * Font files are read from the version-pinned @fontsource packages at
   * build time: self-hosted output, zero network dependency, latin subset
   * only, font-display swap, metric-adjusted fallbacks generated.
   * JetBrains Mono is deliberately NOT loaded (assumption B9): the token
   * remains, no font file ships. The generated stacks are wired to the
   * design tokens in BaseLayout's global style block (D-016).
   */
  fonts: [
    {
      provider: fontProviders.local(),
      name: 'Inter',
      cssVariable: '--font-inter-stack',
      options: {
        variants: [
        { weight: 400, style: 'normal', src: ['@fontsource/inter/files/inter-latin-400-normal.woff2'] },
        { weight: 500, style: 'normal', src: ['@fontsource/inter/files/inter-latin-500-normal.woff2'] },
          { weight: 600, style: 'normal', src: ['@fontsource/inter/files/inter-latin-600-normal.woff2'] },
        ],
      },
    },
    {
      provider: fontProviders.local(),
      name: 'Plus Jakarta Sans',
      cssVariable: '--font-plus-jakarta-sans-stack',
      options: {
        variants: [
        {
          weight: 600,
          style: 'normal',
          src: ['@fontsource/plus-jakarta-sans/files/plus-jakarta-sans-latin-600-normal.woff2'],
        },
        {
          weight: 700,
          style: 'normal',
          src: ['@fontsource/plus-jakarta-sans/files/plus-jakarta-sans-latin-700-normal.woff2'],
        },
        {
          weight: 800,
          style: 'normal',
            src: ['@fontsource/plus-jakarta-sans/files/plus-jakarta-sans-latin-800-normal.woff2'],
          },
        ],
      },
    },
  ],
});
