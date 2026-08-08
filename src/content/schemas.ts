/**
 * Content contract — TAD §8.1 (the enforced content contract) / Dev Plan T-A3.
 *
 * Pure Zod schemas, kept separate from the Astro collection wiring so the
 * contract is unit-testable without Astro internals (Gate 1 verifies the
 * schema rejects malformed data). Types are derived from these schemas and
 * never hand-duplicated (TAD §22.2).
 */
import { z } from 'zod';

import { SUBJECTS } from '../shared/config/subjects';

/**
 * One presentation = one JSON file in src/content/presentations/.
 * The slug is the filename (TAD §8.1): uniqueness is structural, and a
 * rename is a documented breaking URL change (TAD §6.2).
 */
export const presentationSchema = z.object({
  // ── Identity ──
  title: z.string().min(1).max(120),
  // Enum, not free string (TAD §8.2): a typo fails the build with the list
  // of valid values instead of silently rendering an unstyled card.
  subject: z.enum(SUBJECTS),
  // Catches "2026-13-45" at build time; yields a real Date for sorting.
  date: z.coerce.date(),
  // Bounds the overflow UI (Design §13.3) at the data layer.
  tags: z.array(z.string().min(1).max(30)).max(12).default([]),

  // ── External sources ──
  googleSlidesUrl: z
    .url()
    .refine(
      (u) => /docs\.google\.com\/presentation\/d\/[\w-]+/.test(u),
      'Must be a Google Slides document URL',
    )
    .refine(
      (u) => {
        try {
          // Pathname check only — "/presentation" would substring-match a
          // naive includes('/present') (caught by the contract test suite).
          return new URL(u).pathname.endsWith('/present');
        } catch {
          return false;
        }
      },
      'Must end in /present so it opens in presentation mode',
    ),
  // Optional (TAD §8.2): EC-2 describes a presentation with no working
  // backup; modelling absence honestly beats forcing fake URLs.
  dropboxUrl: z
    .url()
    .refine((u) => u.includes('dropbox.com'), 'Must be a Dropbox URL')
    .optional(),
  // ADR-0012 (F6): ?dl=0 preview by default; dl=1 opt-in per item.
  forceDownload: z.boolean().default(false),

  // ── Publication ──
  // Required, no default (TAD §8.2): intent must be explicit.
  published: z.boolean(),
  order: z.number().int().optional(),
  description: z.string().max(500).optional(),

  // ── Operational — written by the link-check CI job, never by hand (TAD §8.4) ──
  linkHealth: z
    .object({
      slides: z.enum(['ok', 'unreachable', 'unknown']).default('unknown'),
      dropbox: z.enum(['ok', 'unreachable', 'unknown', 'absent']).default('unknown'),
      checkedAt: z.iso.datetime().optional(),
    })
    .default({ slides: 'unknown', dropbox: 'unknown' }),
});

export type Presentation = z.infer<typeof presentationSchema>;

/**
 * Site-wide profile content (TAD §8.5) — name, tagline, contact links, SEO
 * defaults, teasers. Nothing display-facing is hard-coded in a component (I4).
 * The data file arrives with Harshit's real content (assumption IA-2); the
 * schema may gain fields when /about and /contact are implemented (Phase G).
 */
export const siteProfileSchema = z.object({
  name: z.string().min(1),
  tagline: z.string().min(1),
  overline: z.string().optional(),
  email: z.email().optional(),
  socials: z
    .array(
      z.object({
        label: z.string().min(1),
        url: z.url(),
      }),
    )
    .default([]),
  aboutTeaser: z.string().optional(),
  contactTeaser: z.string().optional(),
});

export type SiteProfile = z.infer<typeof siteProfileSchema>;
