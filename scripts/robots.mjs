#!/usr/bin/env node
/**
 * Environment-aware robots.txt — TD-4 / TAD §17.4.
 *
 * `public/robots.txt` is the PRODUCTION policy (the source of truth).
 * Netlify sets CONTEXT on every deploy:
 *   - production (and local/CI builds without CONTEXT) → the production
 *     policy is validated and copied into dist/ (self-healing if a
 *     previous preview rewrite left it stale);
 *   - any other context (deploy-preview, branch-deploy) → dist/robots.txt
 *     is rewritten to Disallow: / so preview URLs never reach search
 *     indexes.
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import process from 'node:process';

const DIST = new URL('../dist/', import.meta.url).pathname;
const SOURCE = new URL('../public/robots.txt', import.meta.url).pathname;
const target = `${DIST}robots.txt`;
const context = process.env.CONTEXT ?? '';

if (!existsSync(target)) {
  console.error('robots: dist/robots.txt not found — run `npm run build` first.');
  process.exit(1);
}
if (!existsSync(SOURCE)) {
  console.error('robots: public/robots.txt (production source) is missing.');
  process.exit(1);
}

const production = readFileSync(SOURCE, 'utf8');

if (context !== '' && context !== 'production') {
  writeFileSync(
    target,
    `# Netlify ${context} — keep preview deploys out of search indexes (TD-4).\nUser-agent: *\nDisallow: /\n`,
  );
  console.log(`robots: CONTEXT=${context} — dist/robots.txt rewritten to Disallow: /`);
} else {
  // Validate the effective production directives (comments ignored).
  const directives = production
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line !== '' && !line.startsWith('#'));
  const allows = directives.some((line) => /^Allow:\s*\/\s*$/.test(line));
  const blocksAll = directives.some((line) => /^Disallow:\s*\/\s*$/.test(line));
  if (!allows || blocksAll) {
    console.error('robots: production policy must allow crawling — check public/robots.txt.');
    process.exit(1);
  }
  writeFileSync(target, production);
  console.log(`robots: production policy in place${context ? '' : ' (no CONTEXT set — local/CI build)'}.`);
}
