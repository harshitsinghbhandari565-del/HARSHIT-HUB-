#!/usr/bin/env node
/**
 * Performance budget gate — TAD §14.1, Dev Plan T-H3.
 *
 * Measures every route's EAGER payload (gzipped) from dist/ and fails if
 * any budget is exceeded. Measurement method is the TD-13 standard:
 *
 *   eager JS  = real <script type="module" src> tags
 *             + their static import closure (dynamic import() edges are
 *               on-demand and excluded — e.g. the SearchDialog)
 *             + island hydration chunks where they fire on load:
 *               client:load / client:media / client:idle islands.
 *               client:visible islands hydrate on scroll, NOT at load, so
 *               they are excluded from the gate and reported for
 *               transparency (TD-14 resolution, D-043).
 *   eager CSS = <link rel="stylesheet"> + inline <style> blocks
 *   total     = HTML + JS + CSS (gzipped), fonts excluded (TAD §14.1).
 *
 * Usage: node scripts/budgets.mjs   (runs after any build; CI enforces)
 */
import { gzipSync } from 'node:zlib';
import { readFileSync, readdirSync } from 'node:fs';
import { join, relative } from 'node:path';
import process from 'node:process';

const DIST = new URL('../dist/', import.meta.url).pathname;
const KB = 1024;

/** TAD §14.1 budgets (KB gzipped). */
const BUDGETS = [
  { match: /^index\.html$/, route: '/', js: 20, css: 15, total: 45 },
  { match: /^presentations\/index\.html$/, route: '/presentations', js: 25, css: 15, total: 50 },
  {
    match: /^presentations\/[^/]+\/index\.html$/,
    route: '/presentations/[slug]',
    js: 10,
    css: 12,
    total: 35,
  },
  { match: /^(about|contact)\/index\.html$/, route: '/about, /contact', js: 15, css: 12, total: 40 },
];
/** Coming Soon pages + error layouts: no dedicated TAD row — held to the
 *  /about,/contact budget as the strictest general-page default. */
const DEFAULT_BUDGET = { route: '(coming soon / errors)', js: 15, css: 12, total: 40 };

const IMPORT_RE = /(?:from|import)\s*["'](\.\/[\w.-]+\.js)["']/g;

function gzipSize(file) {
  return gzipSync(readFileSync(file)).length;
}

/** Static import closure of an _astro JS chunk (dynamic edges excluded). */
function closure(entry, seen = new Set()) {
  if (seen.has(entry)) return seen;
  seen.add(entry);
  const source = readFileSync(join(DIST, entry), 'utf8');
  for (const match of source.matchAll(IMPORT_RE)) {
    closure(`_astro/${match[1].replace(/^\.\//, '')}`, seen);
  }
  return seen;
}

function measure(htmlFile) {
  const html = readFileSync(htmlFile, 'utf8');
  const jsFiles = new Set();

  // 1. Eager <script type="module" src> tags + closure.
  for (const m of html.matchAll(/<script[^>]*type="module"[^>]*\bsrc="([^"]+)"[^>]*>/g)) {
    if (m[1].startsWith('/_astro/')) closure(`_astro/${m[1].slice('/_astro/'.length)}`, jsFiles);
  }

  // 2. Island hydration chunks, keyed by trigger.
  const visibleOnly = new Set();
  for (const m of html.matchAll(/<astro-island[^>]*>/g)) {
    const attrs = Object.fromEntries([...m[0].matchAll(/([\w-]+)="([^"]*)"/g)].map((a) => [a[1], a[2]]));
    const urls = [attrs['component-url'], attrs['renderer-url'], attrs['before-hydration-url']]
      .filter((u) => u && u.startsWith('/_astro/'))
      .map((u) => `_astro/${u.slice('/_astro/'.length)}`);
    const target = attrs.client === 'visible' ? visibleOnly : jsFiles;
    for (const url of urls) closure(url, target);
  }

  // 3. CSS: external stylesheets + inline style blocks.
  let cssBytes = 0;
  for (const m of html.matchAll(/<link[^>]*rel="stylesheet"[^>]*href="([^"]+)"[^>]*>/g)) {
    if (m[1].startsWith('/_astro/')) cssBytes += gzipSize(join(DIST, `_astro/${m[1].slice('/_astro/'.length)}`));
  }
  for (const m of html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)) {
    cssBytes += gzipSync(Buffer.from(m[1], 'utf8')).length;
  }

  const jsBytes = [...jsFiles].reduce((sum, f) => sum + gzipSize(join(DIST, f)), 0);
  const visibleBytes = [...visibleOnly]
    .filter((f) => !jsFiles.has(f))
    .reduce((sum, f) => sum + gzipSize(join(DIST, f)), 0);
  const htmlBytes = gzipSync(Buffer.from(html, 'utf8')).length;

  return { jsBytes, cssBytes, htmlBytes, visibleBytes, eagerChunks: jsFiles.size };
}

function htmlFiles(dir, out = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) htmlFiles(full, out);
    else if (entry.name.endsWith('.html')) out.push(full);
  }
  return out;
}

let failed = false;
const rows = [];
for (const file of htmlFiles(DIST).sort()) {
  const page = relative(DIST, file);
  const budget = BUDGETS.find((b) => b.match.test(page)) ?? DEFAULT_BUDGET;
  const { jsBytes, cssBytes, htmlBytes, visibleBytes } = measure(file);
  const totalBytes = jsBytes + cssBytes + htmlBytes;
  const over =
    jsBytes > budget.js * KB || cssBytes > budget.css * KB || totalBytes > budget.total * KB;
  if (over) failed = true;
  rows.push({
    page,
    budget: budget.route,
    js: `${(jsBytes / KB).toFixed(2)}/${budget.js}`,
    css: `${(cssBytes / KB).toFixed(2)}/${budget.css}`,
    total: `${(totalBytes / KB).toFixed(2)}/${budget.total}`,
    deferred: visibleBytes ? `+${(visibleBytes / KB).toFixed(2)} KB client:visible` : '—',
    status: over ? 'OVER' : 'ok',
  });
}

console.log('Performance budgets (TAD §14.1, KB gzipped; method TD-13):\n');
console.log('route'.padEnd(48), 'JS'.padEnd(12), 'CSS'.padEnd(12), 'total'.padEnd(12), 'deferred', ' status');
for (const r of rows) {
  console.log(
    r.page.padEnd(48),
    r.js.padEnd(12),
    r.css.padEnd(12),
    r.total.padEnd(12),
    r.deferred.padEnd(26),
    r.status,
  );
}

if (failed) {
  console.error('\nbudgets: FAILED — one or more routes exceed TAD §14.1 limits.');
  process.exit(1);
}
console.log('\nbudgets: OK — every route within TAD §14.1 limits.');
