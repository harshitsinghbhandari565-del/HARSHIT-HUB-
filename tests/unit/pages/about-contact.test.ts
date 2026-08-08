/**
 * Phase G pages — About (T-G1) and Contact (T-G2) structure:
 * content-layer composition, Netlify form contract, honeypot, privacy
 * microcopy, contact details. Content boundary mocked (D-028 pattern).
 */
import { describe, expect, it, vi } from 'vitest';

import AboutPage from '../../../src/pages/about.astro';
import ContactPage from '../../../src/pages/contact.astro';
import { parse, render } from '../helpers/render';

vi.mock('astro:content', async () => {
  const fixture = await import('../../fixtures/MockAboutContent.astro');
  return {
    getCollection: async (name: string) =>
      name === 'about' ? [{ id: 'about', data: { title: 'About Harshit' } }] : [],
    render: async () => ({ Content: fixture.default }),
    z: await import('zod').then((m) => m.z),
  };
});

describe('About page (T-G1)', () => {
  it('renders the long-form content from the content layer', async () => {
    const html = await render(AboutPage);
    const root = parse(html);
    expect(root.querySelector('h1.about__title')?.textContent).toBe('About Harshit');
    expect(root.querySelector('.about-prose .mock-about-content')).not.toBeNull();
    expect(root.textContent).toContain('Mock biography paragraph for tests.');
  });

  it('renders the decorative profile visual and breadcrumb', async () => {
    const root = parse(await render(AboutPage));
    expect(root.querySelector('.about__visual')?.getAttribute('aria-hidden')).toBe('true');
    const crumb = root.querySelector('nav[aria-label="Breadcrumb"]');
    expect(crumb?.textContent).toContain('Home');
    expect(crumb?.textContent).toContain('About');
  });
});

describe('Contact page (T-G2)', () => {
  it('renders the Netlify form contract (works without JS — I1)', async () => {
    const root = parse(await render(ContactPage));
    const form = root.querySelector('form');
    expect(form).not.toBeNull();
    expect(form?.getAttribute('data-netlify')).toBe('true');
    expect(form?.getAttribute('netlify-honeypot')).toBe('bot-field');
    expect(form?.getAttribute('method')?.toUpperCase()).toBe('POST');
    const hidden = form?.querySelector('input[name="form-name"]');
    expect(hidden?.getAttribute('value')).toBe('contact');
  });

  it('wires real labels to every field and ships name/email/message fields', async () => {
    const root = parse(await render(ContactPage));
    for (const [id, label] of [
      ['contact-name', 'Name'],
      ['contact-email', 'Email'],
      ['contact-message', 'Message'],
    ] as const) {
      expect(root.querySelector(`label[for="${id}"]`)?.textContent?.trim()).toBe(label);
      expect(root.querySelector(`#${id}`)).not.toBeNull();
    }
  });

  it('renders the honeypot off-screen, aria-hidden, tab-skipped', async () => {
    const root = parse(await render(ContactPage));
    const honeypot = root.querySelector('input[name="bot-field"]');
    expect(honeypot).not.toBeNull();
    expect(honeypot?.getAttribute('tabindex')).toBe('-1');
    const wrapper = honeypot?.closest('[aria-hidden="true"]');
    expect(wrapper).not.toBeNull();
  });

  it('renders privacy microcopy and contact details', async () => {
    const root = parse(await render(ContactPage));
    expect(root.textContent).toContain(
      'Your information is only used to respond to your message and is never shared.',
    );
    expect(root.querySelector('a[href^="mailto:"]')).not.toBeNull();
  });
});
