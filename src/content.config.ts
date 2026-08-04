/**
 * Astro Content Collections wiring — TAD §4.3 build-time data flow.
 *
 * NOTE: Astro 6 requires this file at src/content.config.ts (the TAD's
 * src/content/config.ts path was the pre-6 location). The contract itself
 * (schemas.ts) is unchanged. See DECISIONS.md D-002.
 *
 * src/content/presentations/*.json ─→ Zod validation (fail fast, I5)
 *   ─→ getCollection('presentations') ─→ filter(published) ─→ static HTML
 *
 * A malformed entry fails the build, so it can never reach production (G2).
 */
import { glob } from 'astro/loaders';
import { defineCollection } from 'astro:content';

import { presentationSchema, siteProfileSchema } from './content/schemas';

const presentations = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/presentations' }),
  schema: presentationSchema,
});

const site = defineCollection({
  loader: glob({ pattern: 'profile.json', base: './src/content/site' }),
  schema: siteProfileSchema,
});

export const collections = { presentations, site };
