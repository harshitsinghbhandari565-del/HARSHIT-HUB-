#!/usr/bin/env node
/**
 * Supply-chain gate — TAD §19.6: `npm audit` at audit-level=high fails
 * CI. Known-unexploitable advisories are allowlisted HERE, each with a
 * recorded rationale, instead of weakening the level or skipping the
 * check. Stale allowlist entries fail the gate, so the list can only
 * shrink as advisories are actually fixed.
 */
import { execFileSync } from 'node:child_process';
import process from 'node:process';

/** GHSA id → why it cannot be exploited by THIS codebase. */
const ALLOWLIST = new Map([
  [
    'GHSA-4g3v-8h47-v7g6',
    'astro — XSS via View Transition animation properties. Requires attacker-controlled transition:animate values; this site uses none (transitions are the global 200ms cross-fade), and all content is authored in the protected repo (TAD §19.2).',
  ],
  [
    'GHSA-f48w-9m4c-m7f5',
    'astro — XSS via unescaped spread attribute names. The only element attribute spread in the codebase (Button.astro) is a compile-time constant; every dynamic VALUE is escaped by Astro. Fixed properly by the future Astro 7 upgrade (D-001 pins Astro 6).',
  ],
  [
    'GHSA-7pw4-f3q4-r2p2',
    'astro — XSS via transition:* directive values on hydrated islands. No transition:* directives exist in the codebase (verified by audit grep); islands receive Zod-validated content only.',
  ],
  [
    'GHSA-f88m-g3jw-g9cj',
    'sharp/libvips — CVEs exploitable only by processing attacker-supplied images. sharp is Astro\'s optional image dependency (^0.34 pin) and this pipeline processes only repo-authored assets. Resolves with the Astro 7 upgrade.',
  ],
]);

let raw;
try {
  // Full dependency tree — the exact TAD §19.6 gate, with documented
  // exceptions instead of a weakened level.
  raw = execFileSync('npm', ['audit', '--json'], {
    encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024,
  });
} catch (error) {
  // npm audit exits non-zero when vulnerabilities exist; the JSON is still
  // on stdout. Anything without parseable JSON is a hard failure.
  raw = error.stdout?.toString() ?? '';
}

let report;
try {
  report = JSON.parse(raw);
} catch {
  console.error('audit: could not parse npm audit output — failing closed.');
  process.exit(1);
}

const vulnerabilities = Object.entries(report.vulnerabilities ?? {});
const seen = new Set();
const blockers = [];

for (const [name, info] of vulnerabilities) {
  if (info.severity !== 'high' && info.severity !== 'critical') continue;
  const advisories = (info.via ?? []).filter((via) => typeof via === 'object');
  const ids = advisories
    .map((via) => via.url?.match(/GHSA-[a-z0-9-]+/)?.[0])
    .filter(Boolean);
  for (const id of ids) seen.add(id);
  // Entries whose only "via" are package names are transitive wrappers,
  // covered by the wrapped package's own entry.
  if (advisories.length === 0) continue;
  const unlisted = ids.filter((id) => !ALLOWLIST.has(id));
  if (advisories.length > 0 && ids.length === advisories.length && unlisted.length === 0) {
    continue; // fully allowlisted
  }
  blockers.push(`${name} (${info.severity}): ${unlisted.join(', ') || 'unparsed advisories'}`);
}

const stale = [...ALLOWLIST.keys()].filter((id) => !seen.has(id));

if (blockers.length > 0 || stale.length > 0) {
  if (blockers.length > 0) {
    console.error('audit: high/critical advisories NOT in the allowlist:');
    for (const b of blockers) console.error(`  ✗ ${b}`);
  }
  if (stale.length > 0) {
    console.error('audit: allowlist entries no longer reported — remove them:');
    for (const s of stale) console.error(`  ✗ ${s}`);
  }
  process.exit(1);
}

console.log(
  `audit: OK — no high/critical advisories outside the documented allowlist (${seen.size} allowlisted, each with rationale in scripts/audit.mjs).`,
);
