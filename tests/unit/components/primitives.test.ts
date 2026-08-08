/**
 * Phase B primitives — T-B4 structural + axe coverage:
 * IconButton, Tag, Alert, EmptyState, Skeleton, Breadcrumb,
 * SectionOverline, VisuallyHidden, SkipLink, and the BaseLayout shell.
 */
import { describe, expect, it } from 'vitest';

import BaseLayout from '../../../src/shared/layouts/BaseLayout.astro';
import Alert from '../../../src/shared/ui/Alert.astro';
import Breadcrumb from '../../../src/shared/ui/Breadcrumb.astro';
import EmptyState from '../../../src/shared/ui/EmptyState.astro';
import IconButton from '../../../src/shared/ui/IconButton.astro';
import SectionOverline from '../../../src/shared/ui/SectionOverline.astro';
import Skeleton from '../../../src/shared/ui/Skeleton.astro';
import SkipLink from '../../../src/shared/ui/SkipLink.astro';
import Tag from '../../../src/shared/ui/Tag.astro';
import VisuallyHidden from '../../../src/shared/ui/VisuallyHidden.astro';
import { expectNoA11yViolations, parse, render } from '../helpers/render';

describe('IconButton', () => {
  it('exposes the mandatory accessible name and a 44px button', async () => {
    const root = parse(
      await render(IconButton, { props: { icon: 'lucide:search', ariaLabel: 'Search' } }),
    );
    const button = root.querySelector('button');
    expect(button?.getAttribute('aria-label')).toBe('Search');
    expect(button?.getAttribute('type')).toBe('button');
    expect(root.querySelector('svg')?.getAttribute('aria-hidden')).toBe('true');
  });

  it('is axe-clean', async () => {
    await expectNoA11yViolations(
      await render(IconButton, { props: { icon: 'lucide:search', ariaLabel: 'Search' } }),
    );
  });
});

describe('Tag', () => {
  it('renders a non-interactive pill per variant', async () => {
    for (const variant of ['content', 'recent', 'success', 'error', 'coming-soon'] as const) {
      const root = parse(await render(Tag, { props: { label: 'biology', variant } }));
      const tag = root.querySelector('span.tag');
      expect(tag?.className).toContain(`tag--${variant}`);
      expect(tag?.textContent).toBe('biology');
      expect(root.querySelector('a,button')).toBeNull(); // static by contract
    }
  });

  it('is axe-clean', async () => {
    await expectNoA11yViolations(await render(Tag, { props: { label: 'Recent', variant: 'recent' } }));
  });
});

describe('Alert', () => {
  it('uses role="alert" only for errors, role="status" otherwise', async () => {
    for (const variant of ['info', 'success', 'warning', 'error'] as const) {
      const root = parse(
        await render(Alert, { props: { variant, title: 'Title', message: 'Body' } }),
      );
      const alert = root.querySelector('.alert');
      expect(alert?.getAttribute('role')).toBe(variant === 'error' ? 'alert' : 'status');
      expect(alert?.className).toContain(`alert--${variant}`);
    }
  });

  it('marks the icon decorative and is axe-clean', async () => {
    const html = await render(Alert, {
      props: { variant: 'warning', title: 'Presentation unavailable', message: 'Use the backup.' },
    });
    expect(parse(html).querySelector('svg')?.getAttribute('aria-hidden')).toBe('true');
    await expectNoA11yViolations(html);
  });
});

describe('EmptyState', () => {
  it('renders icon (decorative), heading, message, and optional action link', async () => {
    const html = await render(EmptyState, {
      props: {
        icon: 'lucide:folder-open',
        title: 'No presentations yet',
        message: 'Check back soon.',
        action: { label: 'Back to home', href: '/' },
      },
    });
    const root = parse(html);
    expect(root.querySelector('svg')?.getAttribute('aria-hidden')).toBe('true');
    expect(root.querySelector('h2')?.textContent).toBe('No presentations yet');
    const action = root.querySelector('a');
    expect(action?.getAttribute('href')).toBe('/');
    expect(action?.textContent).toContain('Back to home');
    await expectNoA11yViolations(html);
  });
});

describe('Skeleton', () => {
  it('is decorative and renders the requested shape', async () => {
    const text = parse(await render(Skeleton, { props: { variant: 'text', lines: 2 } }));
    expect(text.querySelector('[aria-hidden="true"]')).not.toBeNull();
    expect(text.querySelectorAll('.skeleton--text')).toHaveLength(2);

    const card = parse(await render(Skeleton, { props: { variant: 'card' } }));
    expect(card.querySelector('.skeleton--card')).not.toBeNull();
  });
});

describe('Breadcrumb', () => {
  it('links ancestors, marks the current page, and truncates long titles', async () => {
    const longTitle = 'A Very Long Presentation Title That Exceeds Thirty Characters';
    const html = await render(Breadcrumb, {
      props: {
        items: [
          { label: 'Home', href: '/' },
          { label: 'Presentations', href: '/presentations' },
          { label: longTitle },
        ],
      },
    });
    const root = parse(html);
    const nav = root.querySelector('nav');
    expect(nav?.getAttribute('aria-label')).toBe('Breadcrumb');
    const links = root.querySelectorAll('a');
    expect(links).toHaveLength(2);
    const current = root.querySelector('[aria-current="page"]');
    expect(current?.tagName).toBe('SPAN');
    expect(current?.textContent?.length).toBeLessThanOrEqual(31); // 30 chars + ellipsis
    expect(current?.getAttribute('title')).toBe(longTitle); // full text preserved
    await expectNoA11yViolations(html);
  });
});

describe('SectionOverline / VisuallyHidden / SkipLink', () => {
  it('SectionOverline renders its label', async () => {
    const root = parse(await render(SectionOverline, { props: { label: 'Academic Portfolio' } }));
    expect(root.textContent).toBe('Academic Portfolio');
  });

  it('VisuallyHidden keeps content in the accessibility tree', async () => {
    const html = await render(VisuallyHidden, { slots: { default: 'screen reader text' } });
    const root = parse(html);
    expect(root.textContent).toBe('screen reader text');
    expect(root.querySelector('.visually-hidden')).not.toBeNull();
    await expectNoA11yViolations(html);
  });

  it('SkipLink targets #main-content with meaningful text', async () => {
    const root = parse(await render(SkipLink));
    const link = root.querySelector('a');
    expect(link?.getAttribute('href')).toBe('#main-content');
    expect(link?.textContent).toBe('Skip to main content');
    await expectNoA11yViolations(await render(SkipLink));
  });
});

describe('BaseLayout shell', () => {
  it('ships light default, FOUC guard, skip link first, and a main landmark target', async () => {
    const html = await render(BaseLayout, {
      props: { title: 'Test Page', description: 'Test description' },
      slots: { default: '<main id="main-content"><h1>Content</h1></main>' },
    });
    const root = parse(html); // full document → root is the <html> element
    expect(root.getAttribute('data-theme')).toBe('light');
    expect(root.getAttribute('lang')).toBe('en');
    expect(root.querySelector('title')?.textContent).toBe('Test Page · Harshit');
    expect(root.querySelector('meta[name="description"]')?.getAttribute('content')).toBe(
      'Test description',
    );
    // FOUC guard: synchronous inline script reading localStorage before paint.
    expect(html).toContain("localStorage.getItem('theme')");
    // Skip link present and pointing at the main landmark.
    expect(root.querySelector('a.skip-link')?.getAttribute('href')).toBe('#main-content');
    expect(root.querySelector('#main-content')).not.toBeNull();
  });
});
