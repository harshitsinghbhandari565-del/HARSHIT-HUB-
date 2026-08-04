/**
 * Button — T-B1 coverage: polymorphic anchor/button contract (TAD §7.5),
 * external-link safety, disabled semantics, subtitle-in-name, axe clean.
 */
import { describe, expect, it } from 'vitest';

import Button from '../../../src/shared/ui/Button.astro';
import { expectNoA11yViolations, parse, render } from '../helpers/render';

describe('Button', () => {
  it('renders a <button type="button"> when no href is given', async () => {
    const root = parse(await render(Button, { props: { label: 'Save' } }));
    const button = root.querySelector('button');
    expect(button).not.toBeNull();
    expect(button?.getAttribute('type')).toBe('button');
    expect(root.querySelector('a')).toBeNull();
  });

  it('renders an <a> when href is given', async () => {
    const root = parse(await render(Button, { props: { label: 'Present', href: '/presentations' } }));
    const anchor = root.querySelector('a');
    expect(anchor).not.toBeNull();
    expect(anchor?.getAttribute('href')).toBe('/presentations');
    expect(root.querySelector('button')).toBeNull();
  });

  it('adds target/rel for external links (reverse-tabnabbing guard)', async () => {
    const root = parse(
      await render(Button, {
        props: { label: 'Backup', href: 'https://www.dropbox.com/s/x/y', external: true },
      }),
    );
    const anchor = root.querySelector('a');
    expect(anchor?.getAttribute('target')).toBe('_blank');
    expect(anchor?.getAttribute('rel')).toBe('noopener noreferrer');
  });

  it('never emits target="_blank" for internal links', async () => {
    const root = parse(await render(Button, { props: { label: 'About', href: '/about' } }));
    expect(root.querySelector('a')?.getAttribute('target')).toBeNull();
  });

  it('renders a disabled <button> even when href is provided (no dead anchors)', async () => {
    const root = parse(
      await render(Button, { props: { label: 'Present', href: '/x', disabled: true } }),
    );
    const button = root.querySelector('button');
    expect(button).not.toBeNull();
    expect(button?.hasAttribute('disabled')).toBe(true);
    expect(root.querySelector('a')).toBeNull();
  });

  it('keeps the subtitle inside the element so it joins the accessible name', async () => {
    const root = parse(
      await render(Button, {
        props: { label: 'Present', subtitle: 'Opens in Google Slides', href: '/x' },
      }),
    );
    const anchor = root.querySelector('a');
    expect(anchor?.textContent).toContain('Present');
    expect(anchor?.textContent).toContain('Opens in Google Slides');
  });

  it('marks icons decorative', async () => {
    const root = parse(
      await render(Button, { props: { label: 'Present', icon: 'lucide:play', href: '/x' } }),
    );
    const svg = root.querySelector('svg');
    expect(svg?.getAttribute('aria-hidden')).toBe('true');
  });

  it('applies variant and fullWidth modifiers', async () => {
    const root = parse(
      await render(Button, { props: { label: 'More', variant: 'ghost', fullWidth: true } }),
    );
    const button = root.querySelector('button');
    expect(button?.className).toContain('btn--ghost');
    expect(button?.className).toContain('btn--full-width');
  });

  it('passes axe in every variant', async () => {
    for (const variant of ['primary', 'secondary', 'ghost'] as const) {
      await expectNoA11yViolations(
        await render(Button, { props: { label: 'Action', variant, href: '/x' } }),
      );
    }
  });
});
