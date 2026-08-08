/**
 * Phase G pages — Coming Soon placeholders (T-G3, TAD §6.4) and error
 * pages (T-G4, TAD §16.6): structure, noindex, recovery paths.
 */
import { describe, expect, it } from 'vitest';

import CertificatesPage from '../../../src/pages/certificates.astro';
import NotFoundPage from '../../../src/pages/404.astro';
import ProjectsPage from '../../../src/pages/projects.astro';
import ResumePage from '../../../src/pages/resume.astro';
import ServerErrorPage from '../../../src/pages/500.astro';
import { parse, render } from '../helpers/render';

describe('Coming Soon pages (T-G3)', () => {
  const pages = [
    ['projects', ProjectsPage, 'Projects'],
    ['certificates', CertificatesPage, 'Certificates'],
    ['resume', ResumePage, 'Resume'],
  ] as const;

  it.each(pages)('%s renders Coming Soon state with recovery path', async (_name, Page, title) => {
    const root = parse(await render(Page));
    expect(root.textContent).toContain('Coming Soon');
    expect(root.textContent).toContain(title);
    const home = Array.from(root.querySelectorAll('a')).find(
      (a) => a.getAttribute('href') === '/',
    );
    expect(home).not.toBeUndefined();
  });

  it.each(pages)('%s carries noindex,follow (TAD §6.4)', async (_name, Page) => {
    const html = await render(Page);
    expect(html).toContain('noindex, follow');
  });
});

describe('404 page (T-G4, EC-12)', () => {
  it('renders friendly copy with Home + Presentations recovery paths', async () => {
    const root = parse(await render(NotFoundPage));
    expect(root.querySelector('h1')?.textContent).toBe('Page not found');
    const hrefs = Array.from(root.querySelectorAll('a')).map((a) => a.getAttribute('href'));
    expect(hrefs).toContain('/');
    expect(hrefs).toContain('/presentations');
  });

  it('is noindex', async () => {
    expect(await render(NotFoundPage)).toContain('noindex, follow');
  });
});

describe('500 page (T-G4)', () => {
  it('renders friendly copy with a recovery path and no internals', async () => {
    const html = await render(ServerErrorPage);
    const root = parse(html);
    expect(root.querySelector('h1')?.textContent).toBe('Something went wrong');
    // No leaked internals: no stack-trace frames, no "Error:" dumps.
    expect(html).not.toMatch(/at \S+ \(\S+:\d+:\d+\)/);
    expect(root.querySelector('main')?.textContent).not.toContain('Error:');
    expect(root.querySelector('a[href="/"]')).not.toBeNull();
  });
});
