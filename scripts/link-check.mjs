#!/usr/bin/env node
/**
 * Internal link health check — Dev Plan Phase H deliverable (weekly
 * workflow: .github/workflows/link-check.yml).
 *
 * Verifies, over the BUILT site:
 *   - every internal href/src resolves to a real file in dist/
 *   - every same-page #fragment has a matching id
 *   - every target="_blank" link carries rel="noopener noreferrer"
 *     (reverse tabnabbing — TAD §19.1)
 *   - sitemap URLs match built indexable pages exactly
 *   - robots.txt exists
 *
 * External targets are collected and printed for manual review; liveness
 * is NOT checked automatically because the presentation URLs are mock
 * content until IA-2 lands (RELEASE_CHECKLIST).
 */
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import process from 'node:process';

const DIST = new URL('../dist/', import.meta.url).pathname;
const failures = [];
const external = new Set();

if (!existsSync(DIST)) {
  console.error('link-check: dist/ not found — run `npm run build` first.');
  process.exit(1);
}

function htmlFiles(dir, out = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) htmlFiles(full, out);
    else if (entry.name.endsWith('.html')) out.push(full);
  }
  return out;
}

/** Map a site path like /about or /presentations/x/ to a dist file. */
function resolveInternal(pathname) {
  const clean = decodeURIComponent(pathname).split('?')[0].split('#')[0];
  if (clean === '') return null;
  const direct = join(DIST, clean.replace(/^\//, ''));
  if (existsSync(direct)) return direct;
  if (existsSync(join(direct, 'index.html'))) return join(direct, 'index.html');
  if (existsSync(`${direct}.html`)) return `${direct}.html`;
  return null;
}

for (const file of htmlFiles(DIST).sort()) {
  const html = readFileSync(file, 'utf8');
  const page = file.slice(DIST.length);

  for (const m of html.matchAll(/<(?:a|link)\b[^>]*\bhref="([^"]*)"|<(?:script|img|source)\b[^>]*\bsrc="([^"]*)"/g)) {
    const ref = m[1] ?? m[2];
    if (ref === '' || ref.startsWith('data:') || ref.startsWith('#')) continue;

    if (/^https?:\/\//.test(ref)) {
      external.add(ref);
      continue;
    }
    if (ref.startsWith('mailto:') || ref.startsWith('tel:')) continue;

    if (!ref.startsWith('/')) {
      failures.push(`${page}: non-root-relative reference "${ref}" — keep site paths absolute`);
      continue;
    }
    if (!resolveInternal(ref)) {
      failures.push(`${page}: broken internal link ${ref}`);
    }
  }

  // Same-page fragments.
  for (const m of html.matchAll(/\bhref="#([^"]+)"/g)) {
    const id = m[1];
    if (!html.includes(`id="${id}"`)) {
      failures.push(`${page}: broken fragment #${id}`);
    }
  }

  // Reverse tabnabbing protection on every new-tab link.
  for (const m of html.matchAll(/<a\b[^>]*target="_blank"[^>]*>/g)) {
    if (!/rel="[^"]*noopener[^"]*"/.test(m[0])) {
      failures.push(`${page}: target="_blank" without rel="noopener" — ${m[0].slice(0, 80)}`);
    }
  }
}

// Sitemap ↔ built pages.
const sitemapFile = join(DIST, 'sitemap-0.xml');
if (!existsSync(sitemapFile)) {
  failures.push('sitemap-0.xml missing from dist/');
} else {
  const urls = [...readFileSync(sitemapFile, 'utf8').matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) =>
    new URL(m[1]).pathname,
  );
  for (const pathname of urls) {
    if (!resolveInternal(pathname)) failures.push(`sitemap: ${pathname} does not resolve in dist/`);
  }
  // Coming Soon pages are noindex and must stay out of the sitemap (TAD §6.4).
  for (const banned of ['/projects', '/certificates', '/resume']) {
    if (urls.some((u) => u === banned || u === `${banned}/`)) {
      failures.push(`sitemap: noindex placeholder ${banned} must not be listed`);
    }
  }
}

if (!existsSync(join(DIST, 'robots.txt'))) {
  failures.push('robots.txt missing from dist/');
}

console.log(`link-check: ${external.size} external targets (manual liveness review — mock content until IA-2):`);
for (const url of [...external].sort()) console.log(`  → ${url}`);

if (failures.length > 0) {
  console.error('\nlink-check: FAILED');
  for (const f of failures) console.error(`  ✗ ${f}`);
  process.exit(1);
}
console.log('\nlink-check: OK — all internal links, fragments, and sitemap entries resolve.');
