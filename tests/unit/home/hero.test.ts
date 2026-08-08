/**
 * Hero + teasers — structural and accessibility coverage (T-E1/T-E3).
 */
import { describe, expect, it } from 'vitest';

import AboutTeaser from '../../../src/shared/components/AboutTeaser.astro';
import ContactTeaser from '../../../src/shared/components/ContactTeaser.astro';
import Hero from '../../../src/shared/components/Hero.astro';
import { expectNoA11yViolations, parse, render } from '../helpers/render';

describe('Hero', () => {
  it('renders overline, name, tagline, and both CTAs', async () => {
    const html = await render(Hero);
    const root = parse(html);
    expect(root.querySelector('.hero__overline')?.textContent).toContain('Academic Portfolio');
    expect(root.querySelector('h1.hero__name')).not.toBeNull();
    expect(root.querySelector('.hero__tagline')).not.toBeNull();
    expect(root.querySelectorAll('.hero__ctas a')).toHaveLength(2);
    await expectNoA11yViolations(html);
  });
});

describe('AboutTeaser', () => {
  it('renders a labelled section with a decorative visual and Read More link', async () => {
    const html = await render(AboutTeaser);
    const root = parse(html);
    const section = root.querySelector('section[aria-labelledby="about-teaser-heading"]');
    expect(section).not.toBeNull();
    expect(root.querySelector('.about-teaser__visual')?.getAttribute('aria-hidden')).toBe('true');
    expect(root.querySelector('a[href="/about"]')).not.toBeNull();
    await expectNoA11yViolations(html);
  });
});

describe('ContactTeaser', () => {
  it('renders a labelled section with the Get in Touch link', async () => {
    const html = await render(ContactTeaser);
    const root = parse(html);
    expect(root.querySelector('section[aria-labelledby="contact-teaser-heading"]')).not.toBeNull();
    expect(root.querySelector('a[href="/contact"]')).not.toBeNull();
    await expectNoA11yViolations(html);
  });
});
