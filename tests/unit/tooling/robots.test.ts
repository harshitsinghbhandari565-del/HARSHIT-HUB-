/**
 * Environment-aware robots.txt (TD-4, TAD §17.4) — smoke tests over the
 * real script: production deploys validate + copy the source policy,
 * Netlify preview contexts are rewritten to Disallow, and a corrupted
 * production source fails closed.
 */
import { execFileSync } from 'node:child_process';
import { copyFileSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { afterEach, beforeEach, describe, expect, it } from 'vitest';

const SCRIPT = fileURLToPath(new URL('../../../scripts/robots.mjs', import.meta.url));
const PRODUCTION =
  'User-agent: *\nAllow: /\n\nSitemap: https://harshit-portfolio-hub.netlify.app/sitemap-index.xml\n';

let workdir: string;
let scriptCopy: string;

/** Run the script inside a synthetic repo laid out like the real one
 *  (scripts/robots.mjs resolves ../dist and ../public). */
function runScript(context: string | undefined): { status: number; output: string } {
  const env = { ...process.env };
  if (context === undefined) delete env.CONTEXT;
  else env.CONTEXT = context;
  try {
    const output = execFileSync(process.execPath, [scriptCopy], { env, encoding: 'utf8' });
    return { status: 0, output };
  } catch (error) {
    const err = error as { status?: number; stdout?: string; stderr?: string };
    return { status: err.status ?? 1, output: `${err.stdout ?? ''}${err.stderr ?? ''}` };
  }
}

beforeEach(() => {
  workdir = mkdtempSync(join(tmpdir(), 'robots-'));
  mkdirSync(join(workdir, 'scripts'), { recursive: true });
  mkdirSync(join(workdir, 'dist'), { recursive: true });
  mkdirSync(join(workdir, 'public'), { recursive: true });
  scriptCopy = join(workdir, 'scripts', 'robots.mjs');
  copyFileSync(SCRIPT, scriptCopy);
  writeFileSync(join(workdir, 'public', 'robots.txt'), PRODUCTION);
  writeFileSync(join(workdir, 'dist', 'robots.txt'), PRODUCTION);
});

afterEach(() => {
  // Temp dirs live in the OS tmp — nothing to clean inside the repo.
});

describe('scripts/robots.mjs (TD-4)', () => {
  it('keeps the production policy when CONTEXT=production', () => {
    const { status } = runScript('production');
    expect(status).toBe(0);
    expect(readFileSync(join(workdir, 'dist', 'robots.txt'), 'utf8')).toBe(PRODUCTION);
  });

  it('rewrites to Disallow: / on deploy previews', () => {
    const { status } = runScript('deploy-preview');
    expect(status).toBe(0);
    const rewritten = readFileSync(join(workdir, 'dist', 'robots.txt'), 'utf8');
    expect(rewritten).toContain('Disallow: /');
    expect(rewritten).not.toContain('Allow: /');
  });

  it('leaves local builds (no CONTEXT) on the production policy', () => {
    const { status } = runScript(undefined);
    expect(status).toBe(0);
    expect(readFileSync(join(workdir, 'dist', 'robots.txt'), 'utf8')).toBe(PRODUCTION);
  });

  it('self-heals a dist left stale by a previous preview rewrite', () => {
    writeFileSync(join(workdir, 'dist', 'robots.txt'), 'User-agent: *\nDisallow: /\n');
    const { status } = runScript('production');
    expect(status).toBe(0);
    expect(readFileSync(join(workdir, 'dist', 'robots.txt'), 'utf8')).toBe(PRODUCTION);
  });

  it('fails closed when the production source policy is corrupted', () => {
    writeFileSync(join(workdir, 'public', 'robots.txt'), 'User-agent: *\nDisallow: /\n');
    const { status, output } = runScript('production');
    expect(status).toBe(1);
    expect(output).toContain('production policy must allow crawling');
  });
});
