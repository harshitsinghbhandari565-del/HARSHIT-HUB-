/**
 * ContactForm island (T-G2) — client-side validation, focus-to-first-
 * invalid, async submission, success/error states (Design §11.10).
 * Network mocked at the fetch boundary.
 */
import { JSDOM } from 'jsdom';
import { render as preactRender } from 'preact';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import ContactForm from '../../../src/features/contact/islands/ContactForm';

let dom: JSDOM;
let host: HTMLElement;

function setGlobals() {
  const g = globalThis as unknown as Record<string, unknown>;
  g.window = dom.window;
  g.document = dom.window.document;
  g.localStorage = dom.window.localStorage;
  // Node's undici FormData rejects jsdom form elements; use jsdom's.
  g.FormData = dom.window.FormData;
}

function clearGlobals() {
  const g = globalThis as unknown as Record<string, unknown>;
  delete g.window;
  delete g.document;
  delete g.localStorage;
  delete g.FormData;
}

async function waitFor(condition: () => boolean, what: string, timeoutMs = 2000) {
  const start = Date.now();
  while (!condition()) {
    if (Date.now() - start > timeoutMs) throw new Error(`waitFor timed out: ${what}`);
    await new Promise((resolve) => setTimeout(resolve, 5));
  }
}

function setValue(selector: string, value: string) {
  const el = dom.window.document.querySelector(selector) as HTMLInputElement;
  el.value = value;
  el.dispatchEvent(new dom.window.Event('input', { bubbles: true }));
}

function submit() {
  const form = dom.window.document.querySelector('form') as HTMLFormElement;
  form.dispatchEvent(new dom.window.Event('submit', { bubbles: true, cancelable: true }));
}

beforeEach(() => {
  dom = new JSDOM(`<!doctype html><html><body><div id="host"></div></body></html>`, {
    url: 'https://example.test/contact',
    pretendToBeVisual: true,
  });
  setGlobals();
  host = dom.window.document.getElementById('host') as HTMLElement;
});

afterEach(() => {
  preactRender(null, host);
  vi.unstubAllGlobals();
  clearGlobals();
  dom.window.close();
});

describe('ContactForm island', () => {
  it('shows field errors on empty submit and focuses the first invalid', async () => {
    preactRender(<ContactForm />, host);
    submit();
    await waitFor(
      () => dom.window.document.querySelectorAll('[aria-invalid="true"]').length === 3,
      'all three errors',
    );
    expect(dom.window.document.getElementById('contact-name-error')).not.toBeNull();
    expect(dom.window.document.getElementById('contact-email-error')).not.toBeNull();
    expect(dom.window.document.getElementById('contact-message-error')).not.toBeNull();
    expect(dom.window.document.activeElement?.id).toBe('contact-name');
  });

  it('rejects an invalid email address', async () => {
    preactRender(<ContactForm />, host);
    setValue('#contact-name', 'Harshit');
    setValue('#contact-email', 'not-an-email');
    setValue('#contact-message', 'Hello');
    submit();
    await waitFor(
      () => dom.window.document.getElementById('contact-email-error') !== null,
      'email error',
    );
    expect(dom.window.document.getElementById('contact-email-error')?.textContent).toContain(
      'valid email',
    );
  });

  it('submits valid input and shows the Design §11.10 success state', async () => {
    const fetchSpy = vi.fn((..._args: unknown[]) => Promise.resolve({ ok: true }));
    vi.stubGlobal('fetch', fetchSpy);
    preactRender(<ContactForm />, host);
    setValue('#contact-name', 'Harshit');
    setValue('#contact-email', 'harshit@example.com');
    setValue('#contact-message', 'Hello there');
    submit();
    await waitFor(
      () => dom.window.document.body.textContent.includes("Message sent! I'll get back to you soon."),
      'success state',
    );
    expect(fetchSpy).toHaveBeenCalledTimes(1);
    const body = String((fetchSpy.mock.calls[0][1] as { body?: unknown })?.body);
    expect(body).toContain('form-name=contact');
    expect(body).toContain('name=Harshit');
  });

  it('keeps entered values and shows an alert when submission fails', async () => {
    vi.stubGlobal('fetch', vi.fn((..._args: unknown[]) => Promise.resolve({ ok: false, status: 500 })));
    preactRender(<ContactForm />, host);
    setValue('#contact-name', 'Harshit');
    setValue('#contact-email', 'harshit@example.com');
    setValue('#contact-message', 'Hello there');
    submit();
    await waitFor(
      () => dom.window.document.querySelector('[role="alert"]') !== null,
      'error alert',
    );
    // Values preserved — the form was never reset.
    expect((dom.window.document.querySelector('#contact-name') as HTMLInputElement).value).toBe(
      'Harshit',
    );
    expect((dom.window.document.querySelector('#contact-message') as HTMLTextAreaElement).value).toBe(
      'Hello there',
    );
  });

  it('disables the submit button while submitting', async () => {
    let release: ((v: { ok: boolean }) => void) | undefined;
    vi.stubGlobal(
      'fetch',
      vi.fn((..._args: unknown[]) => new Promise<{ ok: boolean }>((resolve) => { release = resolve; })),
    );
    preactRender(<ContactForm />, host);
    setValue('#contact-name', 'Harshit');
    setValue('#contact-email', 'harshit@example.com');
    setValue('#contact-message', 'Hello there');
    submit();
    await waitFor(
      () =>
        (dom.window.document.querySelector('button[type="submit"]') as HTMLButtonElement)
          ?.disabled === true,
      'submitting state',
    );
    release?.({ ok: true });
    await waitFor(
      () => dom.window.document.body.textContent.includes('Message sent!'),
      'success after release',
    );
  });
});
